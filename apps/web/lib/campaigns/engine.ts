import type { Campaign } from '@/types'

// ─── Storage keys ─────────────────────────────────────────────────────────────

const CAMPAIGNS_KEY = 'zn:c'   // campaign states
const VISITOR_KEY   = 'zn:v'   // visitor metadata
const SESSION_KEY   = 'zn:s'   // session marker (sessionStorage)

// ─── Types ────────────────────────────────────────────────────────────────────

export type CampaignRecord = {
  impressions:  number
  lastSeen:     number | null
  dismissed:    boolean
  clicked:      boolean
  converted:    boolean
  sessionSeen:  boolean
}

type VisitorRecord = {
  sessions:  number
  firstSeen: number
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function safeRead<T>(storage: Storage, key: string, fallback: T): T {
  try { return JSON.parse(storage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}

function safeWrite(storage: Storage, key: string, value: unknown) {
  try { storage.setItem(key, JSON.stringify(value)) } catch {}
}

function getCampaignStates(): Record<string, CampaignRecord> {
  return safeRead(localStorage, CAMPAIGNS_KEY, {})
}

function getCampaignState(id: string): CampaignRecord {
  return getCampaignStates()[id] ?? {
    impressions: 0, lastSeen: null, dismissed: false, clicked: false, converted: false, sessionSeen: false,
  }
}

function setCampaignState(id: string, patch: Partial<CampaignRecord>) {
  const all = getCampaignStates()
  all[id] = { ...getCampaignState(id), ...patch }
  safeWrite(localStorage, CAMPAIGNS_KEY, all)
}

function getVisitor(): VisitorRecord {
  return safeRead(localStorage, VISITOR_KEY, { sessions: 0, firstSeen: Date.now() })
}

// ─── Engine ───────────────────────────────────────────────────────────────────

type Callbacks = {
  onShow:   (campaign: Campaign) => void
  onHide:   () => void
}

export class CampaignEngine {
  private campaigns: Campaign[] = []
  private waiting   = new Set<string>()    // triggered, waiting for sequence condition
  private armed     = new Set<string>()    // trigger setup initiated
  private showing:  string | null = null
  private cleanups: Array<() => void> = []
  private readonly cb: Callbacks
  private readonly apiBase: string

  constructor(callbacks: Callbacks, apiBase = '') {
    this.cb = callbacks
    this.apiBase = apiBase
  }

  async init() {
    this._initVisitor()
    await this._fetchCampaigns()
    this._armTriggers()
  }

  // ─── Visitor / session init ────────────────────────────────────────────────

  private _initVisitor() {
    const isNewSession = !sessionStorage.getItem(SESSION_KEY)
    if (isNewSession) {
      sessionStorage.setItem(SESSION_KEY, '1')
      const visitor = getVisitor()
      safeWrite(localStorage, VISITOR_KEY, {
        sessions:  visitor.sessions + 1,
        firstSeen: visitor.firstSeen,
      })
      // Reset sessionSeen on all records for the new session
      const states = getCampaignStates()
      Object.keys(states).forEach((id) => {
        states[id].sessionSeen = false
      })
      safeWrite(localStorage, CAMPAIGNS_KEY, states)
    }
  }

  // ─── Fetch ────────────────────────────────────────────────────────────────

  private async _fetchCampaigns() {
    try {
      const res = await fetch(`${this.apiBase}/api/v1/cms/campaigns/active`)
      if (!res.ok) return
      this.campaigns = await res.json()
    } catch {}
  }

  // ─── Trigger arming ───────────────────────────────────────────────────────

  private _armTriggers() {
    for (const campaign of this.campaigns) {
      if (!this._passesFrequency(campaign))    continue
      if (!this._passesPagePattern(campaign))  continue
      if (!this._passesDeviceTarget(campaign)) continue
      if (this.armed.has(campaign.id))         continue
      this.armed.add(campaign.id)
      this._setupTrigger(campaign)
    }
  }

  private _passesPagePattern(c: Campaign): boolean {
    if (!c.pagePattern) return true
    const path    = window.location.pathname
    const pattern = c.pagePattern
    return path === pattern || path.startsWith(pattern.replace(/\*$/, '') || pattern + '/')
  }

  private _passesDeviceTarget(c: Campaign): boolean {
    if (!c.deviceTarget || c.deviceTarget === 'all') return true
    const isMobile = window.innerWidth < 768
    return c.deviceTarget === 'mobile' ? isMobile : !isMobile
  }

  private _setupTrigger(c: Campaign) {
    const fire = () => this._onTrigger(c)

    switch (c.triggerType) {
      case 'immediate':
        // Small delay so page finishes rendering
        const t0 = setTimeout(fire, 500)
        this.cleanups.push(() => clearTimeout(t0))
        break

      case 'time_delay': {
        const ms = (c.triggerDelay ?? 0) * 1000
        const t1 = setTimeout(fire, ms)
        this.cleanups.push(() => clearTimeout(t1))
        break
      }

      case 'scroll_depth': {
        const depth = c.triggerScrollDepth ?? 70
        let fired = false
        const handler = () => {
          if (fired) return
          const scrolled = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
          if (scrolled * 100 >= depth) {
            fired = true
            window.removeEventListener('scroll', handler)
            if (c.triggerDelay) {
              const t2 = setTimeout(fire, c.triggerDelay * 1000)
              this.cleanups.push(() => clearTimeout(t2))
            } else {
              fire()
            }
          }
        }
        window.addEventListener('scroll', handler, { passive: true })
        handler()
        this.cleanups.push(() => window.removeEventListener('scroll', handler))
        break
      }

      case 'exit_intent': {
        const handler = (e: MouseEvent) => {
          if (e.clientY > 5) return
          document.removeEventListener('mouseleave', handler)
          fire()
        }
        document.addEventListener('mouseleave', handler)
        this.cleanups.push(() => document.removeEventListener('mouseleave', handler))
        break
      }

      case 'returning_visitor': {
        const visitor = getVisitor()
        if (visitor.sessions > 1) {
          const t3 = setTimeout(fire, (c.triggerDelay ?? 0) * 1000)
          this.cleanups.push(() => clearTimeout(t3))
        }
        // Does not fire on first-ever visit
        break
      }
    }
  }

  // ─── Trigger fired ────────────────────────────────────────────────────────

  private _onTrigger(campaign: Campaign) {
    if (!this._passesFrequency(campaign)) return

    if (this._passesSequence(campaign)) {
      this._display(campaign)
    } else {
      // Sequence not ready — park it; will retry when any state changes
      this.waiting.add(campaign.id)
    }
  }

  // ─── Condition checks ─────────────────────────────────────────────────────

  private _passesFrequency(c: Campaign): boolean {
    const state = getCampaignState(c.id)

    if (c.untilConversion && state.converted) return false
    if (c.oncePerSession && state.sessionSeen) return false

    if (c.impressionCap != null && state.impressions >= c.impressionCap) return false

    if (c.frequencyCapHours && state.lastSeen) {
      const hours = (Date.now() - state.lastSeen) / 3_600_000
      if (hours < c.frequencyCapHours) return false
    }

    return true
  }

  private _passesSequence(c: Campaign): boolean {
    if (!c.sequenceId || !c.sequencePosition || c.sequencePosition <= 1) return true

    const prev = this.campaigns.find(
      (x) => x.sequenceId === c.sequenceId && x.sequencePosition === (c.sequencePosition! - 1),
    )
    if (!prev) return true

    const s = getCampaignState(prev.id)
    switch (c.sequenceCondition ?? 'seen') {
      case 'seen':          return s.impressions > 0
      case 'dismissed':     return s.dismissed
      case 'clicked':       return s.clicked
      case 'converted':     return s.converted
      case 'not_converted': return s.impressions > 0 && !s.converted
      default:              return s.impressions > 0
    }
  }

  // ─── Display ──────────────────────────────────────────────────────────────

  private _display(campaign: Campaign) {
    if (this.showing) {
      this.waiting.add(campaign.id)
      return
    }

    this.showing = campaign.id

    setCampaignState(campaign.id, {
      impressions:  getCampaignState(campaign.id).impressions + 1,
      lastSeen:     Date.now(),
      sessionSeen:  true,
    })
    this._sendEvent(campaign.id, 'impression')
    this.cb.onShow(campaign)

    if (campaign.duration && !campaign.collapseToWidget) {
      const t = setTimeout(() => {
        if (this.showing === campaign.id) this._autoDismiss(campaign.id)
      }, campaign.duration * 1000)
      this.cleanups.push(() => clearTimeout(t))
    }
  }

  private _autoDismiss(id: string) {
    this.showing = null
    this.cb.onHide()
    this._checkWaiting()
  }

  // ─── Public actions ───────────────────────────────────────────────────────

  dismiss(id: string) {
    setCampaignState(id, { dismissed: true })
    this._sendEvent(id, 'dismiss')
    this.showing = null
    this.cb.onHide()
    this._checkWaiting()
  }

  click(id: string) {
    setCampaignState(id, { clicked: true })
    this._sendEvent(id, 'click')
  }

  convert(id: string) {
    setCampaignState(id, { converted: true })
    this._sendEvent(id, 'convert')
    this.showing = null
    this.cb.onHide()
    this._checkWaiting()
  }

  // ─── Waiting queue ────────────────────────────────────────────────────────

  private _checkWaiting() {
    for (const id of [...this.waiting]) {
      const campaign = this.campaigns.find((c) => c.id === id)
      if (!campaign) { this.waiting.delete(id); continue }
      if (!this._passesFrequency(campaign)) { this.waiting.delete(id); continue }
      if (this._passesSequence(campaign)) {
        this.waiting.delete(id)
        this._display(campaign)
        return // Show one at a time; next will be checked on subsequent dismiss
      }
    }
  }

  // ─── Event tracking ───────────────────────────────────────────────────────

  private _sendEvent(campaignId: string, eventType: string) {
    const userKey = this._userKey()
    const device  = window.innerWidth < 768 ? 'mobile' : 'desktop'
    fetch(`${this.apiBase}/api/v1/cms/campaigns/${campaignId}/events`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ eventType, userKey, page: window.location.pathname, device }),
      keepalive: true,
    }).catch(() => {})
  }

  private _userKey(): string {
    const key = 'zn:uid'
    let uid = localStorage.getItem(key)
    if (!uid) {
      uid = crypto.randomUUID()
      try { localStorage.setItem(key, uid) } catch {}
    }
    return uid
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  destroy() {
    this.cleanups.forEach((fn) => fn())
    this.cleanups = []
  }
}
