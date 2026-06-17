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

// Portal
router.use('/orders', ordersRouter)
