import { Router } from 'express'
import { authRouter } from './modules/auth/auth.routes'
import { contactRouter } from './modules/contact/contact.routes'
import { filesRouter } from './modules/files/files.routes'
import { messagesRouter } from './modules/messages/messages.routes'
import { notificationsRouter } from './modules/notifications/notifications.routes'
import { projectsRouter } from './modules/projects/projects.routes'
import { usersRouter } from './modules/users/users.routes'
import { cmsThemesRouter } from './modules/cms/cms.themes.routes'
import { cmsWorkRouter } from './modules/cms/cms.work.routes'
import { cmsMediaRouter } from './modules/cms/cms.media.routes'
import { cmsTestimonialsRouter } from './modules/cms/cms.testimonials.routes'
import { cmsInquiriesRouter } from './modules/cms/cms.inquiries.routes'
import { cmsArticlesRouter } from './modules/cms/cms.articles.routes'
import { chatRouter } from './modules/chat/chat.routes'
import { campaignsRouter } from './modules/campaigns/campaigns.routes'
import { cmsCommerceRouter, ordersRouter } from './modules/commerce/commerce.routes'
import { servicesRouter, cmsServicesRouter } from './modules/services/services.routes'
import { serviceOrdersRouter, cmsServiceOrdersRouter } from './modules/service-orders/service-orders.routes'
import {
  resourcesRouter,
  resourcePurchasesRouter,
  cmsResourcesRouter,
  cmsResourcePurchasesRouter,
} from './modules/resources/resources.routes'
import {
  bookingServicesRouter,
  bookingsRouter,
  cmsBookingsRouter,
  cmsBookingServicesRouter,
  cmsBookingSlotsRouter,
} from './modules/bookings/bookings.routes'
import { expertRouter, cmsPayoutsRouter } from './modules/expert/expert.routes'
import { cmsDashboardRouter } from './modules/cms-dashboard/cms-dashboard.routes'
import { cmsAuditRouter } from './modules/audit/audit.routes'
import { supportRouter, cmsSupportRouter } from './modules/support/support.routes'
import { testimonialPublicRouter } from './modules/testimonials/testimonials.routes'

export const router = Router()

router.use('/auth', authRouter)
router.use('/contact', contactRouter)
router.use('/users', usersRouter)
router.use('/projects', projectsRouter)
router.use('/projects/:projectId/files', filesRouter)
router.use('/projects/:projectId/messages', messagesRouter)
router.use('/notifications', notificationsRouter)

// CMS — admin-only (enforced per-route via authorize middleware)
router.use('/cms/themes', cmsThemesRouter)
router.use('/cms/work', cmsWorkRouter)
router.use('/cms/media', cmsMediaRouter)
router.use('/cms/testimonials', cmsTestimonialsRouter)
router.use('/cms/inquiries', cmsInquiriesRouter)
router.use('/cms/articles', cmsArticlesRouter)
router.use('/chat', chatRouter)
router.use('/cms/campaigns', campaignsRouter)
router.use('/cms/commerce', cmsCommerceRouter)

// Public services catalogue
router.use('/services', servicesRouter)

// CMS — services + service-orders
router.use('/cms/services', cmsServicesRouter)
router.use('/cms/service-orders', cmsServiceOrdersRouter)

// Portal
router.use('/orders', ordersRouter)
router.use('/service-orders', serviceOrdersRouter)
router.use('/resource-purchases', resourcePurchasesRouter)

// Public resources catalogue
router.use('/resources', resourcesRouter)

// CMS — resources + resource-purchases
router.use('/cms/resources', cmsResourcesRouter)
router.use('/cms/resource-purchases', cmsResourcePurchasesRouter)

// Public booking services catalogue
router.use('/booking-services', bookingServicesRouter)

// Client portal — bookings
router.use('/bookings', bookingsRouter)

// CMS — bookings, booking services, booking slots
router.use('/cms/bookings', cmsBookingsRouter)
router.use('/cms/booking-services', cmsBookingServicesRouter)
router.use('/cms/booking-slots', cmsBookingSlotsRouter)

// Expert portal
router.use('/expert', expertRouter)

// CMS — payouts
router.use('/cms/payouts', cmsPayoutsRouter)

// CMS — super dashboard
router.use('/cms/dashboard', cmsDashboardRouter)

// CMS — audit logs
router.use('/cms/audit-logs', cmsAuditRouter)

// Support tickets
router.use('/support', supportRouter)
router.use('/cms/support', cmsSupportRouter)

// Testimonial requests (public — no auth)
router.use('/testimonials', testimonialPublicRouter)
