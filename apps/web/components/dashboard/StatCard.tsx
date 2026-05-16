interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  loading?: boolean
}

export function StatCard({ label, value, sub, loading }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">{label}</p>
      {loading ? (
        <div className="h-8 w-10 rounded bg-border/60 animate-pulse" />
      ) : (
        <p className="text-3xl font-semibold text-ink tabular-nums leading-none">{value}</p>
      )}
      {sub && !loading && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
    </div>
  )
}
