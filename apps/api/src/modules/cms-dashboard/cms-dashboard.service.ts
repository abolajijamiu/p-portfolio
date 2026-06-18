import { eq, desc } from 'drizzle-orm'
import { db } from '../../db/client'
import { serviceOrders, services } from '../../db/schema/services'
import { resourcePurchases, resources } from '../../db/schema/resources'
import { bookings, bookingServices } from '../../db/schema/bookings'
import { expertPayouts } from '../../db/schema/payouts'
import { cmsInquiries } from '../../db/schema/cms'
import { users } from '../../db/schema/users'

const ACTIVE_ORDER_STATUSES = [
  'payment_received',
  'requirements_needed',
  'requirements_submitted',
  'assigned',
  'in_progress',
  'waiting_for_client',
  'delivered',
  'revision_requested',
] as const

export async function getDashboardStats() {
  const [
    orderRows,
    resourceRows,
    bookingRows,
    payoutRows,
    inquiryRows,
  ] = await Promise.all([
    db
      .select({ status: serviceOrders.status, priceCents: serviceOrders.priceCents })
      .from(serviceOrders),
    db
      .select({ status: resourcePurchases.status, pricePaidCents: resourcePurchases.pricePaidCents })
      .from(resourcePurchases),
    db
      .select({ status: bookings.status, priceCents: bookings.priceCents })
      .from(bookings),
    db
      .select({ status: expertPayouts.status, amountCents: expertPayouts.amountCents })
      .from(expertPayouts),
    db.select({ status: cmsInquiries.status }).from(cmsInquiries),
  ])

  // ── Service orders ─────────────────────────────────────────────────────────
  const ordersByStatus: Record<string, number> = {}
  let orderRevenueCents = 0
  let activeOrderCount = 0

  for (const row of orderRows) {
    ordersByStatus[row.status] = (ordersByStatus[row.status] ?? 0) + 1
    if (row.status !== 'cancelled') orderRevenueCents += row.priceCents
    if ((ACTIVE_ORDER_STATUSES as readonly string[]).includes(row.status)) activeOrderCount++
  }

  // ── Resources ──────────────────────────────────────────────────────────────
  let resourceRevenueCents = 0
  let resourceSoldCount = 0

  for (const row of resourceRows) {
    if (row.status === 'active') {
      resourceRevenueCents += row.pricePaidCents
      resourceSoldCount++
    }
  }

  // ── Bookings ───────────────────────────────────────────────────────────────
  const bookingsByStatus: Record<string, number> = {}
  let bookingRevenueCents = 0

  for (const row of bookingRows) {
    bookingsByStatus[row.status] = (bookingsByStatus[row.status] ?? 0) + 1
    if (row.status === 'confirmed' || row.status === 'completed') {
      bookingRevenueCents += row.priceCents
    }
  }

  // ── Payouts ────────────────────────────────────────────────────────────────
  let payoutPendingCents = 0
  let payoutPaidCents = 0

  for (const row of payoutRows) {
    if (row.status === 'pending') payoutPendingCents += row.amountCents
    if (row.status === 'paid') payoutPaidCents += row.amountCents
  }

  return {
    orders: {
      total: orderRows.length,
      active: activeOrderCount,
      completed: ordersByStatus['completed'] ?? 0,
      cancelled: ordersByStatus['cancelled'] ?? 0,
      byStatus: ordersByStatus,
      revenueCents: orderRevenueCents,
    },
    resources: {
      sold: resourceSoldCount,
      revenueCents: resourceRevenueCents,
    },
    bookings: {
      total: bookingRows.length,
      pending: bookingsByStatus['pending'] ?? 0,
      confirmed: bookingsByStatus['confirmed'] ?? 0,
      completed: bookingsByStatus['completed'] ?? 0,
      cancelled: bookingsByStatus['cancelled'] ?? 0,
      revenueCents: bookingRevenueCents,
    },
    payouts: {
      pendingCents: payoutPendingCents,
      paidCents: payoutPaidCents,
      totalRecords: payoutRows.length,
    },
    inquiries: {
      newCount: inquiryRows.filter((r) => r.status === 'new').length,
      total: inquiryRows.length,
    },
    revenue: {
      totalCents: orderRevenueCents + resourceRevenueCents + bookingRevenueCents,
    },
  }
}

export async function getDashboardActivity() {
  const [recentOrders, recentBookings, recentPurchases, recentInquiries] = await Promise.all([
    db
      .select({
        id: serviceOrders.id,
        orderNumber: serviceOrders.orderNumber,
        status: serviceOrders.status,
        createdAt: serviceOrders.createdAt,
        serviceTitle: services.title,
        clientName: users.name,
      })
      .from(serviceOrders)
      .innerJoin(services, eq(serviceOrders.serviceId, services.id))
      .innerJoin(users, eq(serviceOrders.clientId, users.id))
      .orderBy(desc(serviceOrders.createdAt))
      .limit(6),

    db
      .select({
        id: bookings.id,
        status: bookings.status,
        createdAt: bookings.createdAt,
        serviceTitle: bookingServices.title,
        clientName: users.name,
      })
      .from(bookings)
      .innerJoin(bookingServices, eq(bookings.bookingServiceId, bookingServices.id))
      .innerJoin(users, eq(bookings.clientId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(4),

    db
      .select({
        id: resourcePurchases.id,
        status: resourcePurchases.status,
        createdAt: resourcePurchases.createdAt,
        resourceTitle: resources.title,
        userName: users.name,
      })
      .from(resourcePurchases)
      .innerJoin(resources, eq(resourcePurchases.resourceId, resources.id))
      .innerJoin(users, eq(resourcePurchases.userId, users.id))
      .orderBy(desc(resourcePurchases.createdAt))
      .limit(4),

    db
      .select({
        id: cmsInquiries.id,
        status: cmsInquiries.status,
        name: cmsInquiries.name,
        email: cmsInquiries.email,
        createdAt: cmsInquiries.createdAt,
      })
      .from(cmsInquiries)
      .orderBy(desc(cmsInquiries.createdAt))
      .limit(4),
  ])

  type ActivityEvent = {
    type: 'order' | 'booking' | 'purchase' | 'inquiry'
    id: string
    label: string
    sub: string
    status: string
    href: string
    createdAt: string
  }

  const events: ActivityEvent[] = [
    ...recentOrders.map((r) => ({
      type: 'order' as const,
      id: r.id,
      label: r.serviceTitle,
      sub: r.clientName,
      status: r.status,
      href: `/admin/service-orders/${r.id}`,
      createdAt: r.createdAt.toISOString(),
    })),
    ...recentBookings.map((r) => ({
      type: 'booking' as const,
      id: r.id,
      label: r.serviceTitle,
      sub: r.clientName,
      status: r.status,
      href: `/admin/bookings`,
      createdAt: r.createdAt.toISOString(),
    })),
    ...recentPurchases.map((r) => ({
      type: 'purchase' as const,
      id: r.id,
      label: r.resourceTitle,
      sub: r.userName,
      status: r.status,
      href: `/admin/resource-purchases`,
      createdAt: r.createdAt.toISOString(),
    })),
    ...recentInquiries.map((r) => ({
      type: 'inquiry' as const,
      id: r.id,
      label: r.name,
      sub: r.email,
      status: r.status,
      href: `/admin/inquiries`,
      createdAt: r.createdAt.toISOString(),
    })),
  ]

  events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return events.slice(0, 15)
}
