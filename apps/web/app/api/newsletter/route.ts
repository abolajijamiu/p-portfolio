import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? ''
    let email = ''

    if (contentType.includes('application/json')) {
      const body = await request.json()
      email = body.email ?? ''
    } else {
      const form = await request.formData()
      email = form.get('email')?.toString() ?? ''
    }

    email = email.trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 })
    }

    // Record via the contact/inquiry system so the admin can see subscriber emails.
    // Fire-and-forget — don't fail the response if the backend is down.
    fetch(`${API_BASE}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Newsletter',
        email,
        inquiryType: 'newsletter',
        message: `Newsletter subscription request from ${email}.`,
      }),
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
