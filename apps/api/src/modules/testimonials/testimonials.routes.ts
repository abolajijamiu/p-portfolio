import { Router } from 'express'
import * as svc from './testimonials.service'

export const testimonialPublicRouter = Router()

// GET /testimonials/request/:token — check if token is valid
testimonialPublicRouter.get('/request/:token', async (req, res, next) => {
  try {
    res.json(await svc.getTestimonialRequest(req.params.token))
  } catch (err) {
    next(err)
  }
})

// POST /testimonials/request/:token — submit testimonial
testimonialPublicRouter.post('/request/:token', async (req, res, next) => {
  try {
    const { rating, quote, role } = req.body as { rating: number; quote: string; role?: string }
    res.status(201).json(await svc.submitTestimonial(req.params.token, { rating, quote, role }))
  } catch (err) {
    next(err)
  }
})
