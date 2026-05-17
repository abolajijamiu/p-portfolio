import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

export const chatRouter = Router()

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are the AI assistant for E-Tech., a specialist eCommerce agency run by Jamiu. You help visitors understand what E-Tech. does and collect leads.

About E-Tech.:
- Small senior team focused on Shopify strategy, design, and engineering
- Services: Shopify store builds, theme design, conversion optimisation, SEO, funnel design, UX teardowns, commerce engineering
- Shopify themes available for purchase: Cascade (fashion/lifestyle, $280), Grid (electronics, $320), Crest (luxury, $450), and more
- Works with DTC brands, fashion, electronics, luxury, food & wellness
- Contact: hello@deempiretech.com
- Location: UK-based, works globally
- Typical project timeline: 4–12 weeks depending on scope

Your job:
1. Answer questions about services, themes, pricing, and timelines accurately and concisely
2. If someone wants to buy a theme or start a project, collect their name, email, and what they need
3. Be direct, professional, and helpful — not overly salesy
4. For complex or custom requirements, suggest they contact hello@deempiretech.com or use the contact form
5. Keep responses short (2–4 sentences max unless listing features)
6. If asked about something outside your knowledge, say so and direct them to email

Do not make up prices, timelines, or capabilities you are not sure about.`

chatRouter.post('/', async (req, res, next) => {
  try {
    const { messages } = req.body as {
      messages: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages required' })
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    res.json({ message: text })
  } catch (err) {
    next(err)
  }
})
