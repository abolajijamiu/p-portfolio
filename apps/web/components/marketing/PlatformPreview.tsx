// Reusable platform preview components — coded mockups that look like real product UI.
// All data is static demo content. No client state needed.

export function OrderWorkspacePreview() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm text-[11px]">
      {/* Browser chrome */}
      <div className="bg-[#f5f5f5] border-b border-border px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[10px] font-mono text-muted flex-1 text-center">
          portal.deempiretech.com/orders/ORD-2026-0184
        </span>
      </div>

      {/* App nav */}
      <div className="border-b border-border px-4 py-2.5 flex items-center gap-1.5 text-[10px] text-muted bg-white">
        <span className="text-ink/40">Orders</span>
        <span>/</span>
        <span className="text-ink font-semibold">ORD-2026-0184</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ● In Progress
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-[340px]">
        {/* Sidebar metadata */}
        <div className="w-36 shrink-0 border-r border-border bg-[#fafafa] p-3.5 space-y-4">
          <div>
            <p className="text-[8.5px] font-bold text-muted/60 uppercase tracking-widest mb-1.5">Order ID</p>
            <p className="font-mono font-semibold text-ink">ORD-2026-0184</p>
          </div>
          <div>
            <p className="text-[8.5px] font-bold text-muted/60 uppercase tracking-widest mb-1.5">Expert</p>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-[7px] font-bold text-white">AM</span>
              </div>
              <span className="text-ink">Alex M.</span>
            </div>
          </div>
          <div>
            <p className="text-[8.5px] font-bold text-muted/60 uppercase tracking-widest mb-1.5">Package</p>
            <p className="text-ink">Growth</p>
          </div>
          <div>
            <p className="text-[8.5px] font-bold text-muted/60 uppercase tracking-widest mb-1.5">Progress</p>
            <p className="text-muted mb-1.5">Day 4 / 10</p>
            <div className="h-1 bg-border rounded-full">
              <div className="h-full w-[40%] bg-brand rounded-full" />
            </div>
          </div>
          <div>
            <p className="text-[8.5px] font-bold text-muted/60 uppercase tracking-widest mb-1.5">Started</p>
            <p className="text-ink">14 Jun 2026</p>
          </div>
          <div>
            <p className="text-[8.5px] font-bold text-muted/60 uppercase tracking-widest mb-1.5">Due</p>
            <p className="text-ink">24 Jun 2026</p>
          </div>
          <div>
            <p className="text-[8.5px] font-bold text-muted/60 uppercase tracking-widest mb-1.5">Revisions</p>
            <p className="text-ink">3 rounds</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-border px-4 flex gap-0 shrink-0">
            {['Files (3)', 'Messages (7)', 'Activity'].map((tab, i) => (
              <div
                key={tab}
                className={`px-3 py-2.5 text-[10px] font-medium border-b-2 -mb-px ${
                  i === 0 ? 'border-brand text-ink' : 'border-transparent text-muted'
                }`}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* Files list */}
          <div className="p-4 space-y-2 flex-1">
            {[
              { name: 'Homepage_v2.pdf', size: '4.2 MB', by: 'Alex M.', time: 'Jun 18 · 14:22', isNew: true },
              { name: 'Mobile_mockups.pdf', size: '2.8 MB', by: 'Alex M.', time: 'Jun 17 · 16:50', isNew: false },
              { name: 'Project_brief.pdf', size: '0.9 MB', by: 'Client', time: 'Jun 14 · 09:21', isNew: false },
            ].map(({ name, size, by, time, isNew }) => (
              <div key={name} className="flex items-center gap-2.5 p-2.5 border border-border rounded-lg bg-white hover:bg-surface transition-colors duration-100">
                <div className="w-7 h-7 rounded-md bg-[#fafafa] border border-border flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-muted">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink truncate">{name}</span>
                    {isNew && (
                      <span className="text-[8.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-muted/70">{size} · {by} · {time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex gap-2 shrink-0">
            <button className="bg-ink text-white text-[10px] font-semibold px-3 py-1.5 rounded-md">
              Download all (7.9 MB)
            </button>
            <button className="border border-border text-ink text-[10px] px-3 py-1.5 rounded-md hover:bg-surface transition-colors">
              Request revision
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MessagingPreview() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm text-[11px]">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-white">AM</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink">Alex Morgan</p>
          <p className="text-[9px] text-muted truncate">ORD-2026-0184 · Shopify Store Redesign</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] text-muted">Online</span>
        </div>
      </div>

      {/* Thread */}
      <div className="p-4 space-y-5 bg-[#fafafa] min-h-[260px]">
        {/* Expert message */}
        <div className="flex gap-2.5">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[8px] font-bold text-white">AM</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="font-semibold text-ink">Alex Morgan</span>
              <span className="text-[9px] text-muted">Jun 18 · 14:18</span>
            </div>
            <div className="bg-white border border-border rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[260px]">
              <p className="text-ink/80 leading-relaxed">
                Uploaded Homepage v2 — nav spacing adjusted, hero is now full-bleed on mobile.
                Let me know if the padding feels right.
              </p>
            </div>
          </div>
        </div>

        {/* Client reply */}
        <div className="flex flex-row-reverse gap-2.5">
          <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[8px] font-bold text-muted">You</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-[9px] text-muted">Jun 18 · 15:45</span>
              <span className="text-[9px] text-brand">✓✓ Read</span>
            </div>
            <div className="bg-brand/[0.07] border border-brand/20 rounded-xl rounded-tr-sm px-3 py-2.5 max-w-[240px]">
              <p className="text-ink/80 leading-relaxed">
                Better. Can we try the hero background about 5% darker?
              </p>
            </div>
          </div>
        </div>

        {/* Expert response */}
        <div className="flex gap-2.5">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[8px] font-bold text-white">AM</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="font-semibold text-ink">Alex Morgan</span>
              <span className="text-[9px] text-muted">Jun 18 · 16:02</span>
            </div>
            <div className="bg-white border border-border rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[220px]">
              <p className="text-ink/80 leading-relaxed">
                On it — updated version uploaded by tomorrow morning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3 flex items-center gap-2 bg-white">
        <div className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-muted/60">
          Type a message...
        </div>
        <button className="bg-ink text-white text-[10px] font-semibold px-3 py-2 rounded-lg shrink-0">
          Send
        </button>
      </div>
    </div>
  )
}

export function ExpertWorkspacePreview() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm text-[11px]">
      <div className="bg-[#fafafa] border-b border-border px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[10px] font-mono text-muted flex-1 text-center">
          expert.deempiretech.com
        </span>
      </div>

      <div className="flex">
        {/* Expert sidebar */}
        <div className="w-40 border-r border-border bg-[#fafafa] p-3 space-y-0.5 shrink-0">
          <div className="px-2.5 py-2 rounded-lg text-[11px] font-medium text-white bg-ink">
            My Assignments
          </div>
          {['File Upload', 'Messages', 'Earnings', 'Schedule', 'Profile'].map((item) => (
            <div key={item} className="px-2.5 py-2 rounded-lg text-[11px] text-muted">
              {item}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <p className="text-[9px] font-bold text-muted/60 uppercase tracking-widest mb-3">
            Active Assignments
          </p>
          <div className="space-y-2 mb-4">
            {[
              { id: 'ORD-2026-0184', name: 'Shopify Store Redesign', due: 'Due Jun 24', status: 'In Progress', progress: 40 },
              { id: 'ORD-2026-0179', name: 'Brand Identity — Full', due: 'Due Jun 22', status: 'QA Review', progress: 90 },
            ].map(({ id, name, due, status, progress }) => (
              <div key={id} className="border border-border rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-ink">{name}</span>
                    <span className="text-muted ml-2 font-mono">{id}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    status === 'QA Review'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    {status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-1 bg-border rounded-full">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <span className="text-muted shrink-0">{due}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-lg p-3 bg-surface">
            <p className="text-[9px] font-bold text-muted/60 uppercase tracking-widest mb-2">QA Checklist — ORD-2026-0179</p>
            {[
              { item: 'Logo variants in all required formats', done: true },
              { item: 'Colour values verified (HEX, CMYK, Pantone)', done: true },
              { item: 'Brand guidelines PDF — page count 30+', done: true },
              { item: 'Senior review completed', done: false },
            ].map(({ item, done }) => (
              <div key={item} className="flex items-center gap-2 py-1">
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${done ? 'bg-emerald-100 border border-emerald-300' : 'border border-border'}`}>
                  {done && <span className="text-emerald-600 text-[8px] font-bold">✓</span>}
                </div>
                <span className={done ? 'text-muted line-through' : 'text-ink'}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function InvoicePreview() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm text-[11px]">
      <div className="px-6 py-5 border-b border-border flex items-start justify-between">
        <div>
          <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-3">Invoice</p>
          <p className="text-lg font-bold text-ink font-mono">INV-2026-0184</p>
          <p className="text-muted mt-1">Issued 18 Jun 2026</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-ink">DeEmpireTech Ltd</p>
          <p className="text-muted">hello@deempiretech.com</p>
          <p className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-2 inline-block">
            Paid
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-border">
        <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-2">Bill to</p>
        <p className="font-semibold text-ink">Luminary Skincare Ltd</p>
        <p className="text-muted">sarah@luminaryskincare.com</p>
      </div>

      <div className="px-6 py-4 border-b border-border">
        <div className="flex font-bold text-muted/60 text-[9px] uppercase tracking-widest mb-2">
          <span className="flex-1">Service</span>
          <span>Amount</span>
        </div>
        {[
          { service: 'Shopify Store Redesign — Growth Package', amount: '$1,299.00' },
          { service: 'Order ref: ORD-2026-0184', amount: '' },
        ].map(({ service, amount }) => (
          <div key={service} className="flex items-start py-1.5">
            <span className="flex-1 text-ink">{service}</span>
            {amount && <span className="font-semibold text-ink ml-4 shrink-0">{amount}</span>}
          </div>
        ))}
      </div>

      <div className="px-6 py-4">
        <div className="flex justify-between mb-1">
          <span className="text-muted">Subtotal</span>
          <span className="text-ink">$1,299.00</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-muted">VAT (0%)</span>
          <span className="text-ink">$0.00</span>
        </div>
        <div className="flex justify-between font-bold text-[13px] border-t border-border pt-3">
          <span className="text-ink">Total</span>
          <span className="text-ink">$1,299.00 USD</span>
        </div>
      </div>
    </div>
  )
}
