import { relations } from 'drizzle-orm'

export * from './enums'
export * from './users'
export * from './organizations'
export * from './memberships'
export * from './projects'
export * from './messages'
export * from './files'
export * from './notifications'
export * from './sessions'
export * from './invites'
export * from './cms'
export * from './campaigns'
export * from './commerce'
export * from './woocommerce'
export * from './services'
export * from './resources'
export * from './bookings'
export * from './payouts'
export * from './audit'
export * from './support'
export * from './password-resets'

import { users } from './users'
import { organizations } from './organizations'
import { memberships } from './memberships'
import { projects } from './projects'
import { messages } from './messages'
import { files } from './files'
import { notifications } from './notifications'
import { sessions } from './sessions'
import { invites } from './invites'
import { serviceOrders } from './services'
import { resourcePurchases } from './resources'

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  sessions: many(sessions),
  createdProjects: many(projects, { relationName: 'projectCreator' }),
  sentMessages: many(messages, { relationName: 'messageSender' }),
  uploadedFiles: many(files, { relationName: 'fileUploader' }),
  notifications: many(notifications),
  sentInvites: many(invites, { relationName: 'inviteSender' }),
  clientOrders: many(serviceOrders, { relationName: 'soClient' }),
  expertOrders: many(serviceOrders, { relationName: 'soExpert' }),
  resourcePurchases: many(resourcePurchases),
}))

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  projects: many(projects),
  files: many(files),
  notifications: many(notifications),
  sessions: many(sessions),
}))

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  organization: one(organizations, { fields: [memberships.orgId], references: [organizations.id] }),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, { fields: [projects.orgId], references: [organizations.id] }),
  createdBy: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
    relationName: 'projectCreator',
  }),
  messages: many(messages),
  files: many(files),
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
  organization: one(organizations, { fields: [messages.orgId], references: [organizations.id] }),
  project: one(projects, { fields: [messages.projectId], references: [projects.id] }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'messageSender',
  }),
  parent: one(messages, {
    fields: [messages.parentId],
    references: [messages.id],
    relationName: 'messageReplies',
  }),
  replies: many(messages, { relationName: 'messageReplies' }),
}))

export const filesRelations = relations(files, ({ one }) => ({
  organization: one(organizations, { fields: [files.orgId], references: [organizations.id] }),
  project: one(projects, { fields: [files.projectId], references: [projects.id] }),
  uploadedBy: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
    relationName: 'fileUploader',
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  organization: one(organizations, { fields: [notifications.orgId], references: [organizations.id] }),
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  organization: one(organizations, { fields: [sessions.orgId], references: [organizations.id] }),
}))

export const invitesRelations = relations(invites, ({ one }) => ({
  user: one(users, { fields: [invites.userId], references: [users.id] }),
  organization: one(organizations, { fields: [invites.orgId], references: [organizations.id] }),
  invitedBy: one(users, {
    fields: [invites.invitedBy],
    references: [users.id],
    relationName: 'inviteSender',
  }),
}))

import { cmsMedia, cmsThemes, cmsWork, cmsTestimonials, cmsArticles, testimonialRequests } from './cms'

export const cmsMediaRelations = relations(cmsMedia, ({ one }) => ({
  uploadedBy: one(users, { fields: [cmsMedia.uploadedBy], references: [users.id] }),
}))

export const cmsThemesRelations = relations(cmsThemes, ({ one }) => ({
  heroMedia: one(cmsMedia, { fields: [cmsThemes.heroMediaId], references: [cmsMedia.id] }),
}))

export const cmsWorkRelations = relations(cmsWork, ({ one }) => ({
  heroMedia: one(cmsMedia, { fields: [cmsWork.heroMediaId], references: [cmsMedia.id] }),
}))

export const cmsTestimonialsRelations = relations(cmsTestimonials, () => ({}))

export const testimonialRequestsRelations = relations(testimonialRequests, ({ one }) => ({
  client: one(users, { fields: [testimonialRequests.clientId], references: [users.id] }),
}))

export const cmsArticlesRelations = relations(cmsArticles, ({ one }) => ({
  heroMedia: one(cmsMedia, { fields: [cmsArticles.heroMediaId], references: [cmsMedia.id] }),
}))

import {
  commerceCustomers,
  commerceOrderItems,
  commerceOrders,
  deliverableTypes,
  deliverables,
  productMappings,
} from './commerce'

export const commerceCustomersRelations = relations(commerceCustomers, ({ one, many }) => ({
  organization: one(organizations, { fields: [commerceCustomers.orgId], references: [organizations.id] }),
  user: one(users, { fields: [commerceCustomers.userId], references: [users.id] }),
  orders: many(commerceOrders),
  deliverables: many(deliverables),
}))

export const commerceOrdersRelations = relations(commerceOrders, ({ one, many }) => ({
  organization: one(organizations, { fields: [commerceOrders.orgId], references: [organizations.id] }),
  customer: one(commerceCustomers, { fields: [commerceOrders.customerId], references: [commerceCustomers.id] }),
  items: many(commerceOrderItems),
  deliverables: many(deliverables),
}))

export const commerceOrderItemsRelations = relations(commerceOrderItems, ({ one }) => ({
  order: one(commerceOrders, { fields: [commerceOrderItems.orderId], references: [commerceOrders.id] }),
}))

export const deliverableTypesRelations = relations(deliverableTypes, ({ one, many }) => ({
  organization: one(organizations, { fields: [deliverableTypes.orgId], references: [organizations.id] }),
  mappings: many(productMappings),
  deliverables: many(deliverables),
}))

export const productMappingsRelations = relations(productMappings, ({ one }) => ({
  organization: one(organizations, { fields: [productMappings.orgId], references: [organizations.id] }),
  deliverableType: one(deliverableTypes, {
    fields: [productMappings.deliverableTypeId],
    references: [deliverableTypes.id],
  }),
}))

export const deliverablesRelations = relations(deliverables, ({ one }) => ({
  organization: one(organizations, { fields: [deliverables.orgId], references: [organizations.id] }),
  order: one(commerceOrders, { fields: [deliverables.orderId], references: [commerceOrders.id] }),
  customer: one(commerceCustomers, { fields: [deliverables.customerId], references: [commerceCustomers.id] }),
  deliverableType: one(deliverableTypes, {
    fields: [deliverables.deliverableTypeId],
    references: [deliverableTypes.id],
  }),
  assignee: one(users, { fields: [deliverables.assignedTo], references: [users.id] }),
}))

// ─── Services relations ───────────────────────────────────────────────────────

import {
  services,
  servicePackages,
  serviceFaqs,
  serviceRequirements,
  serviceOrderMessages,
  serviceOrderMilestones,
  serviceOrderDeliveries,
} from './services'

export const servicesRelations = relations(services, ({ many }) => ({
  packages: many(servicePackages),
  faqs: many(serviceFaqs),
  requirements: many(serviceRequirements),
  orders: many(serviceOrders),
}))

export const servicePackagesRelations = relations(servicePackages, ({ one, many }) => ({
  service: one(services, { fields: [servicePackages.serviceId], references: [services.id] }),
  orders: many(serviceOrders),
}))

export const serviceFaqsRelations = relations(serviceFaqs, ({ one }) => ({
  service: one(services, { fields: [serviceFaqs.serviceId], references: [services.id] }),
}))

export const serviceRequirementsRelations = relations(serviceRequirements, ({ one }) => ({
  service: one(services, { fields: [serviceRequirements.serviceId], references: [services.id] }),
}))

export const serviceOrdersRelations = relations(serviceOrders, ({ one, many }) => ({
  service: one(services, { fields: [serviceOrders.serviceId], references: [services.id] }),
  package: one(servicePackages, { fields: [serviceOrders.packageId], references: [servicePackages.id] }),
  client: one(users, { fields: [serviceOrders.clientId], references: [users.id], relationName: 'soClient' }),
  expert: one(users, { fields: [serviceOrders.assignedExpertId], references: [users.id], relationName: 'soExpert' }),
  messages: many(serviceOrderMessages),
  milestones: many(serviceOrderMilestones),
  deliveries: many(serviceOrderDeliveries),
}))

export const serviceOrderMessagesRelations = relations(serviceOrderMessages, ({ one }) => ({
  order: one(serviceOrders, { fields: [serviceOrderMessages.orderId], references: [serviceOrders.id] }),
  sender: one(users, { fields: [serviceOrderMessages.senderId], references: [users.id] }),
}))

export const serviceOrderMilestonesRelations = relations(serviceOrderMilestones, ({ one }) => ({
  order: one(serviceOrders, { fields: [serviceOrderMilestones.orderId], references: [serviceOrders.id] }),
}))

export const serviceOrderDeliveriesRelations = relations(serviceOrderDeliveries, ({ one }) => ({
  order: one(serviceOrders, { fields: [serviceOrderDeliveries.orderId], references: [serviceOrders.id] }),
  deliveredBy: one(users, { fields: [serviceOrderDeliveries.deliveredBy], references: [users.id] }),
}))

// ─── Resources relations ──────────────────────────────────────────────────────

import {
  resources,
  resourceLicenses,
  resourceFiles,
} from './resources'

export const resourcesRelations = relations(resources, ({ many }) => ({
  licenses: many(resourceLicenses),
  files: many(resourceFiles),
  purchases: many(resourcePurchases),
}))

export const resourceLicensesRelations = relations(resourceLicenses, ({ one, many }) => ({
  resource: one(resources, { fields: [resourceLicenses.resourceId], references: [resources.id] }),
  purchases: many(resourcePurchases),
}))

export const resourceFilesRelations = relations(resourceFiles, ({ one }) => ({
  resource: one(resources, { fields: [resourceFiles.resourceId], references: [resources.id] }),
}))

export const resourcePurchasesRelations = relations(resourcePurchases, ({ one }) => ({
  user: one(users, { fields: [resourcePurchases.userId], references: [users.id] }),
  resource: one(resources, { fields: [resourcePurchases.resourceId], references: [resources.id] }),
  license: one(resourceLicenses, { fields: [resourcePurchases.licenseId], references: [resourceLicenses.id] }),
}))

// ─── Bookings relations ───────────────────────────────────────────────────────

import { bookingServices, bookingSlots, bookings } from './bookings'

export const bookingServicesRelations = relations(bookingServices, ({ many }) => ({
  slots: many(bookingSlots),
  bookings: many(bookings),
}))

export const bookingSlotsRelations = relations(bookingSlots, ({ one }) => ({
  service: one(bookingServices, { fields: [bookingSlots.bookingServiceId], references: [bookingServices.id] }),
  booking: one(bookings),
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  service: one(bookingServices, { fields: [bookings.bookingServiceId], references: [bookingServices.id] }),
  slot: one(bookingSlots, { fields: [bookings.slotId], references: [bookingSlots.id] }),
  client: one(users, { fields: [bookings.clientId], references: [users.id] }),
}))

// ─── Payouts relations ────────────────────────────────────────────────────────

import { expertPayouts } from './payouts'

export const expertPayoutsRelations = relations(expertPayouts, ({ one }) => ({
  expert: one(users, { fields: [expertPayouts.expertId], references: [users.id] }),
  order: one(serviceOrders, { fields: [expertPayouts.orderId], references: [serviceOrders.id] }),
}))

// ─── Audit relations ──────────────────────────────────────────────────────────

import { auditLogs } from './audit'

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.actorId], references: [users.id] }),
}))

// ─── Support relations ────────────────────────────────────────────────────────

import { supportTickets, supportTicketMessages } from './support'

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
  messages: many(supportTicketMessages),
}))

export const supportTicketMessagesRelations = relations(supportTicketMessages, ({ one }) => ({
  ticket: one(supportTickets, { fields: [supportTicketMessages.ticketId], references: [supportTickets.id] }),
  sender: one(users, { fields: [supportTicketMessages.senderId], references: [users.id] }),
}))
