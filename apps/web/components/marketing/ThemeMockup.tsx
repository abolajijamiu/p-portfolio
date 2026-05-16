import type { Theme } from '@/lib/content/themes'

// SVG store wireframe — category-specific layout per theme
// viewBox 0 0 800 450 (16:9). Chrome: y 0–40. Store: y 40–450.

type LP = { accent: string }

function Chrome({ slug }: { slug: string }) {
  return (
    <>
      <rect x="0" y="0" width="800" height="40" fill="#e8e8e8" />
      <circle cx="18" cy="20" r="5.5" fill="#ff5f57" />
      <circle cx="33" cy="20" r="5.5" fill="#febc2e" />
      <circle cx="48" cy="20" r="5.5" fill="#28c840" />
      <rect x="64" y="9" width="460" height="22" rx="4" fill="white" opacity="0.88" />
      <text x="294" y="24" textAnchor="middle" fontSize="10" fontFamily="system-ui,-apple-system,sans-serif" fill="#9ca3af">
        {slug}.myshopify.com
      </text>
      <rect x="544" y="11" width="16" height="18" rx="2" fill="white" opacity="0.6" />
      <rect x="566" y="11" width="16" height="18" rx="2" fill="white" opacity="0.6" />
    </>
  )
}

// ── Cascade — Fashion / Editorial ─────────────────────────────────────────────
function CascadeLayout({ accent }: LP) {
  return (
    <>
      <rect x="0" y="40" width="800" height="36" fill="white" />
      <text x="30" y="62" fontSize="13" fontFamily="Georgia,'Times New Roman',serif" fill="#0a0a0a" fontWeight="600" letterSpacing="3">CASCADE</text>
      <text x="296" y="62" fontSize="9.5" fontFamily="system-ui" fill="#6b7280" letterSpacing="1.5">COLLECTION</text>
      <text x="400" y="62" fontSize="9.5" fontFamily="system-ui" fill="#6b7280" letterSpacing="1.5">JOURNAL</text>
      <text x="468" y="62" fontSize="9.5" fontFamily="system-ui" fill="#6b7280" letterSpacing="1.5">ABOUT</text>
      <text x="748" y="62" fontSize="9.5" textAnchor="end" fontFamily="system-ui" fill="#0a0a0a">Bag (0)</text>
      <rect x="0" y="76" width="800" height="0.5" fill="#e5e7eb" />

      {/* Hero — warm editorial */}
      <rect x="0" y="76.5" width="800" height="185" fill="#f0eeeb" />
      <text x="52" y="127" fontSize="8.5" fontFamily="system-ui" fill="#9ca3af" letterSpacing="4">SS 2025 — NEW ARRIVALS</text>
      <text x="52" y="158" fontSize="27" fontFamily="Georgia,serif" fill="#0a0a0a">Considered pieces.</text>
      <text x="52" y="183" fontSize="12" fontFamily="Georgia,serif" fill="#6b7280" fontStyle="italic">For the wardrobe that lasts beyond a season.</text>
      <rect x="52" y="200" width="94" height="26" rx="1" fill="#0a0a0a" />
      <text x="99" y="217" textAnchor="middle" fontSize="8.5" fontFamily="system-ui" fill="white" letterSpacing="1.5">EXPLORE</text>
      <text x="162" y="217" fontSize="8.5" fontFamily="system-ui" fill="#9ca3af" letterSpacing="0.5">Quick view →</text>

      {/* Hero image right — garment silhouettes */}
      <rect x="470" y="82" width="310" height="174" fill="#e8e3dc" rx="1" />
      <rect x="530" y="96" width="62" height="148" rx="2" fill="#dbd5cc" />
      <rect x="606" y="112" width="54" height="132" rx="2" fill="#d0c8be" />
      <rect x="490" y="118" width="32" height="120" rx="2" fill="#dbd5cc" />
      <rect x="672" y="128" width="38" height="110" rx="2" fill="#ccc5bb" />

      {/* Product label */}
      <rect x="0" y="261.5" width="800" height="189" fill="white" />
      <text x="30" y="286" fontSize="8" fontFamily="system-ui" fill="#9ca3af" letterSpacing="3.5">FEATURED PIECES</text>
      <rect x="30" y="292" width="740" height="0.5" fill="#f3f4f6" />

      {/* Products × 3 */}
      {([
        { name: 'Linen Midi Dress', price: '$285', x: 30, fill: '#f5f4f2' },
        { name: 'Merino Wrap', price: '$340', x: 293, fill: '#ede9e4' },
        { name: 'Silk Trench', price: '$495', x: 556, fill: '#e5e1db' },
      ] as const).map((p) => (
        <g key={p.name}>
          <rect x={p.x} y={296} width={217} height={118} rx="2" fill={p.fill} />
          <rect x={p.x + 35} y={308} width={147} height={84} rx="1.5" fill="#d8d2cb" opacity="0.7" />
          <text x={p.x + 108} y={426} textAnchor="middle" fontSize="10" fontFamily="Georgia,serif" fill="#0a0a0a">{p.name}</text>
          <text x={p.x + 108} y={440} textAnchor="middle" fontSize="9" fontFamily="system-ui" fill="#6b7280">{p.price}</text>
        </g>
      ))}
    </>
  )
}

// ── Grid — Electronics / Dense ────────────────────────────────────────────────
function GridLayout({ accent }: LP) {
  const products = [
    { name: 'MacBook Pro 14"', price: '$1,999', rating: '4.9', badge: 'Top Pick', badgeColor: '#1e40af', badgeBg: '#eff6ff' },
    { name: 'Dell XPS 14', price: '$1,549', rating: '4.7', badge: 'Sale', badgeColor: '#991b1b', badgeBg: '#fee2e2' },
    { name: 'ThinkPad X1 Carbon', price: '$1,299', rating: '4.6', badge: null, badgeColor: '', badgeBg: '' },
    { name: 'HP Spectre x360', price: '$1,449', rating: '4.5', badge: null, badgeColor: '', badgeBg: '' },
    { name: 'ASUS Zenbook Pro', price: '$1,099', rating: '4.4', badge: 'Value', badgeColor: '#166534', badgeBg: '#dcfce7' },
    { name: 'Lenovo Yoga 9i', price: '$1,249', rating: '4.6', badge: null, badgeColor: '', badgeBg: '' },
  ]
  const cols = [200, 402, 604]
  const rows = [130, 292]

  return (
    <>
      {/* Nav */}
      <rect x="0" y="40" width="800" height="36" fill="white" />
      <text x="20" y="62" fontSize="13" fontFamily="system-ui" fill="#0a0a0a" fontWeight="800" letterSpacing="-0.5">GRID</text>
      <rect x="62" y="48" width="290" height="22" rx="4" fill="#f3f4f6" />
      <text x="162" y="63" textAnchor="middle" fontSize="9.5" fontFamily="system-ui" fill="#9ca3af">Search 12,400+ products…</text>
      <text x="680" y="62" fontSize="9.5" fontFamily="system-ui" fill="#374151">Compare</text>
      <text x="740" y="62" fontSize="9.5" fontFamily="system-ui" fill="#374151">Cart (2)</text>
      <rect x="0" y="76" width="800" height="0.5" fill="#e5e7eb" />

      {/* Breadcrumb */}
      <rect x="0" y="76.5" width="800" height="22" fill="#f9fafb" />
      <text x="12" y="91" fontSize="8.5" fontFamily="system-ui" fill="#9ca3af">Electronics › Laptops › 14-inch</text>
      <rect x="0" y="98.5" width="800" height="0.5" fill="#e5e7eb" />

      {/* Sidebar */}
      <rect x="0" y="99" width="192" height="351" fill="#f9fafb" />
      <rect x="192" y="99" width="0.5" height="351" fill="#e5e7eb" />
      <text x="14" y="120" fontSize="8.5" fontFamily="system-ui" fill="#0a0a0a" fontWeight="700" letterSpacing="1">FILTERS</text>
      <text x="14" y="143" fontSize="8.5" fontFamily="system-ui" fill="#374151" fontWeight="600">Brand</text>
      {['Apple', 'Dell', 'Lenovo', 'HP', 'Asus'].map((b, i) => (
        <g key={b}>
          <rect x="14" y={153 + i * 18} width="9" height="9" rx="1.5" fill={i === 0 ? accent : 'white'} stroke={i === 0 ? accent : '#d1d5db'} strokeWidth="0.8" />
          <text x="28" y={162 + i * 18} fontSize="8.5" fontFamily="system-ui" fill={i === 0 ? '#0a0a0a' : '#6b7280'}>{b}</text>
        </g>
      ))}
      <text x="14" y="255" fontSize="8.5" fontFamily="system-ui" fill="#374151" fontWeight="600">Price range</text>
      <rect x="14" y="265" width="155" height="2.5" rx="1.25" fill="#e5e7eb" />
      <rect x="14" y="265" width="95" height="2.5" rx="1.25" fill={accent} />
      <circle cx="109" cy="266.25" r="5.5" fill="white" stroke={accent} strokeWidth="1.5" />
      <text x="14" y="282" fontSize="8" fontFamily="system-ui" fill="#6b7280">$500 — $2,000</text>
      <text x="14" y="304" fontSize="8.5" fontFamily="system-ui" fill="#374151" fontWeight="600">Rating</text>
      {[4, 3, 2].map((s, i) => (
        <g key={s}>
          <text x="14" y={322 + i * 17} fontSize="8.5" fontFamily="system-ui" fill="#f59e0b">{'★'.repeat(s)}{'☆'.repeat(5 - s)}</text>
          <text x="90" y={322 + i * 17} fontSize="8" fontFamily="system-ui" fill="#9ca3af">& up</text>
        </g>
      ))}

      {/* Grid area */}
      <rect x="192.5" y="99" width="607.5" height="351" fill="white" />
      <rect x="192.5" y="99" width="607.5" height="27" fill="#fafafa" />
      <text x="206" y="116" fontSize="8.5" fontFamily="system-ui" fill="#6b7280">340 results</text>
      <text x="622" y="116" fontSize="8.5" fontFamily="system-ui" fill="#374151">Sort: Best Match ▾</text>
      <rect x="192.5" y="126" width="607.5" height="0.5" fill="#f3f4f6" />

      {/* Product cards */}
      {products.map((p, idx) => {
        const x = cols[idx % 3]
        const y = rows[Math.floor(idx / 3)]
        return (
          <g key={p.name}>
            <rect x={x} y={y} width="192" height="148" rx="2" fill="#f9fafb" />
            {p.badge && (
              <>
                <rect x={x + 8} y={y + 8} width={p.badge.length * 5.8 + 8} height="14" rx="2" fill={p.badgeBg} />
                <text x={x + 12} y={y + 19} fontSize="7" fontFamily="system-ui" fill={p.badgeColor} fontWeight="700">{p.badge}</text>
              </>
            )}
            <rect x={x + 28} y={y + 25} width="136" height="72" rx="2" fill="#e5e7eb" />
            <text x={x + 96} y={y + 112} textAnchor="middle" fontSize="8.5" fontFamily="system-ui" fill="#0a0a0a">{p.name}</text>
            <text x={x + 96} y={y + 124} textAnchor="middle" fontSize="8" fontFamily="system-ui" fill="#f59e0b">★★★★★</text>
            <text x={x + 96} y={y + 134} textAnchor="middle" fontSize="7.5" fontFamily="system-ui" fill="#9ca3af">{p.rating} · (482)</text>
            <text x={x + 96} y={y + 146} textAnchor="middle" fontSize="9.5" fontFamily="system-ui" fill="#0a0a0a" fontWeight="700">{p.price}</text>
          </g>
        )
      })}
    </>
  )
}

// ── Crest — Luxury / Editorial ────────────────────────────────────────────────
function CrestLayout({ accent }: LP) {
  return (
    <>
      {/* Nav — serif, centred wordmark */}
      <rect x="0" y="40" width="800" height="36" fill="white" />
      <text x="90" y="62" fontSize="9" fontFamily="system-ui" fill="#6b7280" letterSpacing="2">COLLECTIONS</text>
      <text x="192" y="62" fontSize="9" fontFamily="system-ui" fill="#6b7280" letterSpacing="2">BESPOKE</text>
      <text x="400" y="62" textAnchor="middle" fontSize="14" fontFamily="Georgia,serif" fill="#0a0a0a" letterSpacing="5">CREST</text>
      <text x="572" y="62" fontSize="9" fontFamily="system-ui" fill="#6b7280" letterSpacing="2">ABOUT</text>
      <text x="636" y="62" fontSize="9" fontFamily="system-ui" fill="#6b7280" letterSpacing="2">STORES</text>
      <text x="750" y="62" fontSize="9.5" fontFamily="system-ui" fill="#0a0a0a">○ Bag</text>
      <rect x="0" y="76" width="800" height="0.5" fill="#e5e7eb" />

      {/* Full-bleed dark hero */}
      <rect x="0" y="76.5" width="800" height="244" fill="#17140f" />
      {/* Dramatic light shaft */}
      <ellipse cx="600" cy="198" rx="130" ry="180" fill="#2a2419" />
      {/* Ring silhouette */}
      <ellipse cx="600" cy="185" rx="68" ry="68" fill="none" stroke={accent} strokeWidth="2.5" opacity="0.65" />
      <ellipse cx="600" cy="185" rx="52" ry="52" fill="#1e1a13" stroke={accent} strokeWidth="0.8" opacity="0.45" />
      <ellipse cx="600" cy="160" rx="18" ry="11" fill="#d4af87" opacity="0.75" />
      <ellipse cx="600" cy="160" rx="10" ry="6" fill="#eddbb6" opacity="0.7" />
      {/* Gold highlight */}
      <rect x="572" y="183" width="56" height="4" rx="2" fill={accent} opacity="0.3" />
      {/* Hero text */}
      <text x="60" y="143" fontSize="8.5" fontFamily="system-ui" fill={accent} letterSpacing="3.5">THE ESTATE COLLECTION</text>
      <text x="60" y="178" fontSize="28" fontFamily="Georgia,serif" fill="white">Crafted for</text>
      <text x="60" y="210" fontSize="28" fontFamily="Georgia,serif" fill="white">generations.</text>
      <text x="60" y="238" fontSize="11" fontFamily="Georgia,serif" fill="#6b7280" fontStyle="italic">Each piece, an act of inheritance.</text>
      <rect x="60" y="254" width="148" height="28" rx="0" fill="none" stroke={accent} strokeWidth="0.8" />
      <text x="134" y="272" textAnchor="middle" fontSize="8.5" fontFamily="system-ui" fill="#d4af87" letterSpacing="2">EXPLORE COLLECTION</text>

      {/* Product showcase strip */}
      <rect x="0" y="320.5" width="800" height="130" fill="white" />
      <rect x="0" y="320.5" width="800" height="0.5" fill="#f3f4f6" />
      {([
        { name: 'Arabica No. 3', sub: 'Yellow gold, 18ct', price: '£4,200', x: 28 },
        { name: 'Estate Pearl Collar', sub: 'South Sea, platinum', price: '£8,700', x: 295 },
        { name: 'Heritage Signet', sub: 'Rose gold, 18ct', price: '£3,400', x: 555 },
      ] as const).map((p) => (
        <g key={p.name}>
          <rect x={p.x} y={330} width={222} height={84} rx="1" fill="#faf9f7" />
          <rect x={p.x + 14} y={338} width={54} height={54} rx="1" fill="#f0ebe5" />
          <ellipse cx={p.x + 41} cy={p.x === 555 ? 366 : 364} rx={16} ry={16} fill="none" stroke={accent} strokeWidth="1.5" opacity="0.65" />
          <text x={p.x + 84} y={350} fontSize="9.5" fontFamily="Georgia,serif" fill="#0a0a0a">{p.name}</text>
          <text x={p.x + 84} y={364} fontSize="8" fontFamily="system-ui" fill="#6b7280">{p.sub}</text>
          <text x={p.x + 84} y={381} fontSize="10.5" fontFamily="system-ui" fill="#0a0a0a" fontWeight="700">{p.price}</text>
          <rect x={p.x + 84} y={390} width={82} height={16} fill="#0a0a0a" />
          <text x={p.x + 125} y={402} textAnchor="middle" fontSize="7" fontFamily="system-ui" fill="white" letterSpacing="1.2">ADD TO BAG</text>
        </g>
      ))}
    </>
  )
}

// ── Folio — Food & Wellness ───────────────────────────────────────────────────
function FolioLayout({ accent }: LP) {
  return (
    <>
      {/* Nav — warm tones */}
      <rect x="0" y="40" width="800" height="36" fill="white" />
      <text x="30" y="62" fontSize="13" fontFamily="Georgia,serif" fill="#0a0a0a" fontWeight="600" letterSpacing="1.5">FOLIO</text>
      <text x="300" y="62" fontSize="9.5" fontFamily="system-ui" fill="#6b7280" letterSpacing="1">SHOP</text>
      <text x="353" y="62" fontSize="9.5" fontFamily="system-ui" fill="#6b7280" letterSpacing="1">RECIPES</text>
      <text x="420" y="62" fontSize="9.5" fontFamily="system-ui" fill="#6b7280" letterSpacing="1">OUR STORY</text>
      <text x="700" y="62" fontSize="9.5" fontFamily="system-ui" fill="#374151">Cart (1)</text>
      <text x="755" y="62" fontSize="9.5" fontFamily="system-ui" fill="#374151">Rewards</text>
      <rect x="0" y="76" width="800" height="0.5" fill="#e5e7eb" />

      {/* Announcement bar */}
      <rect x="0" y="76.5" width="800" height="18" fill={accent} />
      <text x="400" y="88.5" textAnchor="middle" fontSize="8" fontFamily="system-ui" fill="white" letterSpacing="1">FREE DELIVERY ON ORDERS OVER £45</text>

      {/* Hero — content left, product right */}
      <rect x="0" y="94.5" width="800" height="175" fill="#eef0eb" />
      {/* Left: editorial content */}
      <text x="44" y="137" fontSize="9" fontFamily="system-ui" fill={accent} letterSpacing="2.5">MADE FROM WHAT MATTERS</text>
      <text x="44" y="162" fontSize="22" fontFamily="Georgia,serif" fill="#1a2210">Real ingredients.</text>
      <text x="44" y="185" fontSize="22" fontFamily="Georgia,serif" fill="#1a2210">Real results.</text>
      <text x="44" y="208" fontSize="10" fontFamily="system-ui" fill="#6b7280">Formulated by nutritionists, not marketers.</text>
      <rect x="44" y="218" width="100" height="24" rx="3" fill={accent} />
      <text x="94" y="234" textAnchor="middle" fontSize="8.5" fontFamily="system-ui" fill="white" letterSpacing="1">SHOP RANGE</text>
      <text x="158" y="234" fontSize="8.5" fontFamily="system-ui" fill="#6b7280">Find a recipe →</text>

      {/* Right: product hero */}
      <rect x="470" y="98" width="300" height="166" fill="#e4e8df" rx="1" />
      {/* Jar/bottle shape */}
      <rect x="568" y="112" width="64" height="90" rx="12" fill="#c8d4c0" />
      <rect x="575" y="106" width="50" height="14" rx="4" fill="#bcc8b4" />
      <rect x="578" y="115" width="44" height="60" rx="6" fill="#d4e0cc" />
      <text x="600" y="150" textAnchor="middle" fontSize="7" fontFamily="system-ui" fill="#5a6344" fontWeight="700">FOLIO</text>
      <text x="600" y="161" textAnchor="middle" fontSize="6.5" fontFamily="system-ui" fill="#5a6344">GREENS</text>

      {/* Content section — recipe cards */}
      <rect x="0" y="269.5" width="800" height="181" fill="white" />
      <text x="30" y="292" fontSize="8.5" fontFamily="system-ui" fill="#9ca3af" letterSpacing="3">RECIPES & GUIDES</text>
      {([
        { title: 'Morning Reset Smoothie', tag: 'RECIPE', fill: '#eef0eb', x: 30 },
        { title: 'Complete Nutrition Guide', tag: 'GUIDE', fill: '#f0eeea', x: 285 },
        { title: 'Immunity Bundle', tag: 'BUNDLE', fill: '#eef0eb', x: 540 },
      ] as const).map((c) => (
        <g key={c.title}>
          <rect x={c.x} y={300} width={232} height={132} rx="2" fill={c.fill} />
          <rect x={c.x + 12} y={309} width={207} height={72} rx="1" fill="#d8ddd4" />
          <rect x={c.x + 12} y={309} width={46} height={14} rx="2" fill={accent} />
          <text x={c.x + 14} y={320} fontSize="7" fontFamily="system-ui" fill="white" fontWeight="700">{c.tag}</text>
          <text x={c.x + 14} y={400} fontSize="9.5" fontFamily="Georgia,serif" fill="#0a0a0a">{c.title}</text>
          <text x={c.x + 14} y={415} fontSize="8" fontFamily="system-ui" fill="#6b7280">5 min read</text>
          <text x={c.x + 14} y={428} fontSize="8" fontFamily="system-ui" fill={accent}>Read →</text>
        </g>
      ))}
    </>
  )
}

// ── Vault — D2C / Conversion ──────────────────────────────────────────────────
function VaultLayout({ accent }: LP) {
  return (
    <>
      {/* Trust bar */}
      <rect x="0" y="40" width="800" height="20" fill="#0a0a0a" />
      <text x="400" y="53.5" textAnchor="middle" fontSize="8" fontFamily="system-ui" fill="white" letterSpacing="1.5">
        FREE SHIPPING $75+   ·   60-DAY GUARANTEE   ·   12,400+ VERIFIED REVIEWS
      </text>

      {/* Nav */}
      <rect x="0" y="60" width="800" height="36" fill="white" />
      <text x="30" y="82" fontSize="13" fontFamily="system-ui" fill="#0a0a0a" fontWeight="800" letterSpacing="-0.5">VAULT</text>
      <text x="300" y="82" fontSize="9.5" fontFamily="system-ui" fill="#374151" letterSpacing="1">PRODUCTS</text>
      <text x="375" y="82" fontSize="9.5" fontFamily="system-ui" fill="#374151" letterSpacing="1">BUNDLES</text>
      <text x="444" y="82" fontSize="9.5" fontFamily="system-ui" fill="#374151" letterSpacing="1">ABOUT</text>
      <text x="748" y="82" textAnchor="end" fontSize="9.5" fontFamily="system-ui" fill="#0a0a0a">Cart (0)</text>
      <rect x="0" y="96" width="800" height="0.5" fill="#e5e7eb" />

      {/* Main product hero */}
      <rect x="0" y="96.5" width="800" height="220" fill="white" />
      {/* Product image left */}
      <rect x="30" y="108" width="310" height="200" rx="3" fill="#f3f3f3" />
      <rect x="80" y="130" width="210" height="156" rx="2" fill="#e8e8e8" />
      {/* Supplement tub shape */}
      <ellipse cx="185" cy="175" rx="55" ry="55" fill="#d4d4d4" />
      <ellipse cx="185" cy="175" rx="40" ry="40" fill="#c8c8c8" />
      <text x="185" y="172" textAnchor="middle" fontSize="7.5" fontFamily="system-ui" fill="#888" fontWeight="700">VAULT</text>
      <text x="185" y="184" textAnchor="middle" fontSize="6" fontFamily="system-ui" fill="#888">PERFORMANCE</text>

      {/* Conversion panel right */}
      <text x="370" y="122" fontSize="9" fontFamily="system-ui" fill={accent} letterSpacing="1.5">PERFORMANCE FORMULA</text>
      <text x="370" y="148" fontSize="20" fontFamily="system-ui" fill="#0a0a0a" fontWeight="800">Complete Stack</text>
      <text x="370" y="165" fontSize="20" fontFamily="system-ui" fill="#0a0a0a" fontWeight="800">— 30 Servings</text>
      {/* Stars */}
      <text x="370" y="183" fontSize="10" fontFamily="system-ui" fill="#f59e0b">★★★★★</text>
      <text x="432" y="183" fontSize="8.5" fontFamily="system-ui" fill="#6b7280">4.8 · 2,341 reviews</text>
      {/* Pricing */}
      <text x="370" y="205" fontSize="10" fontFamily="system-ui" fill="#9ca3af">One-time: </text>
      <text x="430" y="205" fontSize="10" fontFamily="system-ui" fill="#9ca3af">$67.00</text>
      <rect x="370" y="212" width="235" height="24" rx="3" fill="#f3f4f6" />
      <rect x="370" y="212" width="114" height="24" rx="3" fill={accent} />
      <text x="427" y="228" textAnchor="middle" fontSize="8.5" fontFamily="system-ui" fill="white" fontWeight="700">Subscribe $57</text>
      <text x="487" y="228" textAnchor="middle" fontSize="8" fontFamily="system-ui" fill="#374151">One-time $67</text>
      {/* CTA */}
      <rect x="370" y="242" width="235" height="30" rx="3" fill="#0a0a0a" />
      <text x="487" y="261" textAnchor="middle" fontSize="9.5" fontFamily="system-ui" fill="white" fontWeight="700">ADD TO CART →</text>
      {/* Trust badges */}
      <text x="370" y="285" fontSize="8.5" fontFamily="system-ui" fill="#374151">✓ Ships today</text>
      <text x="440" y="285" fontSize="8.5" fontFamily="system-ui" fill="#374151">✓ Free returns</text>
      <text x="518" y="285" fontSize="8.5" fontFamily="system-ui" fill="#374151">✓ 60-day guarantee</text>
      {/* Urgency */}
      <rect x="370" y="292" width="235" height="16" rx="2" fill="#fef9ec" />
      <text x="487" y="304" textAnchor="middle" fontSize="7.5" fontFamily="system-ui" fill="#92400e">⚡ 47 people viewing this right now</text>

      {/* Reviews strip */}
      <rect x="0" y="316.5" width="800" height="134" fill="#f9fafb" />
      <rect x="0" y="316.5" width="800" height="0.5" fill="#e5e7eb" />
      <text x="30" y="338" fontSize="8" fontFamily="system-ui" fill="#9ca3af" letterSpacing="3">VERIFIED REVIEWS</text>
      {([
        { name: 'James K.', text: '"Three months in. Performance is up, recovery is faster."', x: 18 },
        { name: 'Sarah M.', text: '"The only supplement stack I\'ve stuck with long-term."', x: 280 },
        { name: 'Marcus T.', text: '"Noticeable difference within two weeks. Genuinely surprised."', x: 536 },
      ] as const).map((r) => (
        <g key={r.name}>
          <rect x={r.x} y={345} width={246} height={92} rx="3" fill="white" />
          <text x={r.x + 14} y={363} fontSize="8.5" fontFamily="system-ui" fill="#f59e0b">★★★★★</text>
          <text x={r.x + 14} y={378} fontSize="8.5" fontFamily="Georgia,serif" fill="#0a0a0a" fontStyle="italic">{r.text}</text>
          <text x={r.x + 14} y={420} fontSize="7.5" fontFamily="system-ui" fill="#9ca3af">{r.name} · Verified buyer</text>
          <text x={r.x + 14} y={430} fontSize="7" fontFamily="system-ui" fill="#6b7280">✓ Subscribed for 3 months</text>
        </g>
      ))}
    </>
  )
}

export function ThemeMockup({ theme }: { theme: Pick<Theme, 'slug' | 'category' | 'accent'> }) {
  return (
    <svg
      viewBox="0 0 800 450"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Chrome slug={theme.slug} />
      {theme.category === 'fashion' && <CascadeLayout accent={theme.accent} />}
      {theme.category === 'electronics' && <GridLayout accent={theme.accent} />}
      {theme.category === 'luxury' && <CrestLayout accent={theme.accent} />}
      {theme.category === 'food' && <FolioLayout accent={theme.accent} />}
      {theme.category === 'dtc' && <VaultLayout accent={theme.accent} />}
    </svg>
  )
}
