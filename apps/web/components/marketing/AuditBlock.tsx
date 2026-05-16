export type AuditFinding = {
  item: string
  before: string
  after: string
  severity: 'critical' | 'high' | 'medium'
}

type Props = {
  title?: string
  findings: AuditFinding[]
}

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    pill: 'text-red-700 bg-red-50 border border-red-100',
    row: 'bg-red-50/30',
  },
  high: {
    label: 'High',
    pill: 'text-orange-700 bg-orange-50 border border-orange-100',
    row: 'bg-orange-50/20',
  },
  medium: {
    label: 'Medium',
    pill: 'text-amber-700 bg-amber-50 border border-amber-100',
    row: 'bg-amber-50/10',
  },
} as const

const SEVERITIES = ['critical', 'high', 'medium'] as const

export function AuditBlock({ title = 'Audit findings', findings }: Props) {
  const totalFixed = findings.length

  const grouped = SEVERITIES.reduce<Record<typeof SEVERITIES[number], AuditFinding[]>>(
    (acc, s) => ({ ...acc, [s]: findings.filter((f) => f.severity === s) }),
    { critical: [], high: [], medium: [] },
  )

  return (
    <div className="border border-border rounded-xl overflow-hidden font-mono text-[11px]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border bg-surface flex items-center justify-between gap-4">
        <span className="font-sans text-[10px] font-medium text-muted uppercase tracking-[0.18em]">
          {title}
        </span>
        <span className="text-muted/50">
          {totalFixed} finding{totalFixed !== 1 ? 's' : ''} — all resolved
        </span>
      </div>

      {/* Column headers */}
      <div className="hidden md:grid md:grid-cols-12 gap-0 bg-[#fafafa] border-b border-border px-5 py-2">
        <span className="md:col-span-3 text-[9px] font-sans font-medium text-muted/50 uppercase tracking-widest">
          Issue
        </span>
        <span className="md:col-span-4 text-[9px] font-sans font-medium text-muted/50 uppercase tracking-widest">
          Before
        </span>
        <span className="md:col-span-4 text-[9px] font-sans font-medium text-muted/50 uppercase tracking-widest">
          After
        </span>
        <span className="md:col-span-1 text-[9px] font-sans font-medium text-muted/50 uppercase tracking-widest">
          Status
        </span>
      </div>

      {/* Grouped rows */}
      {SEVERITIES.map((severity) => {
        const group = grouped[severity]
        if (group.length === 0) return null
        const cfg = SEVERITY_CONFIG[severity]

        return (
          <div key={severity}>
            {/* Severity group header */}
            <div className="px-5 py-2 border-b border-border bg-[#f5f5f5] flex items-center gap-2">
              <span className={`text-[8.5px] font-sans font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${cfg.pill}`}>
                {cfg.label}
              </span>
              <span className="text-muted/40">
                {group.length} {group.length === 1 ? 'issue' : 'issues'}
              </span>
            </div>

            {/* Rows */}
            {group.map((f, i) => (
              <div
                key={i}
                className={`px-5 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 ${
                  i < group.length - 1 ? 'border-b border-border/60' : ''
                } ${cfg.row}`}
              >
                <div className="md:col-span-3 md:pr-4">
                  <span className="font-sans font-medium text-ink/90 text-[11px]">{f.item}</span>
                </div>
                <div className="md:col-span-4 md:pr-4">
                  <span className="text-muted/60 line-through decoration-muted/30">{f.before}</span>
                </div>
                <div className="md:col-span-4 md:pr-4">
                  <span className="text-ink/80">{f.after}</span>
                </div>
                <div className="md:col-span-1 flex items-start">
                  <span className="font-sans text-[8.5px] font-semibold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Fixed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
