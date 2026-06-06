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

import { users } from './users'
import { organizations } from './organizations'
import { memberships } from './memberships'
import { projects } from './projects'
import { messages } from './messages'
import { files } from './files'
import { notifications } from './notifications'
import { sessions } from './sessions'
import { invites } from './invites'

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  sessions: many(sessions),
  createdProjects: many(projects, { relationName: 'projectCreator' }),
  sentMessages: many(messages, { relationName: 'messageSender' }),
  uploadedFiles: many(files, { relationName: 'fileUploader' }),
  notifications: many(notifications),
  sentInvites: many(invites, { relationName: 'inviteSender' }),
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

import { cmsMedia, cmsThemes, cmsWork, cmsTestimonials, cmsArticles } from './cms'

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

export const cmsArticlesRelations = relations(cmsArticles, ({ one }) => ({
  heroMedia: one(cmsMedia, { fields: [cmsArticles.heroMediaId], references: [cmsMedia.id] }),
}))
