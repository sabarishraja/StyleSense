// Shared primitives for StyleSense
// Placeholder imagery, icons, buttons, pills, etc.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Icons — line-weight, minimal, match editorial feel
// ─────────────────────────────────────────────────────────────
const Icon = {
  home: (p={}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M4 10l8-6 8 6v10a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1V10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  plus: (p={}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  sparkle: (p={}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  user: (p={}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  camera: (p={}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>,
  library: (p={}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M21 17l-5-5-9 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  close: (p={}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  chev: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  back: (p={}) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star: (filled, p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled?'currentColor':'none'} {...p}><path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.5 9.9 9.1 9 12 3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  check: (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plusSmall: (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  info: (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4"/><path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  arrowRight: (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ─────────────────────────────────────────────────────────────
// Placeholder garment tile — subtle diagonal stripes + mono label
// ─────────────────────────────────────────────────────────────
function GarmentTile({ tone = '#1f1f1f', label = '// garment', style = {}, corner = 20, showLabel = true }) {
  const stripeId = useMemo(() => 'stripes-' + Math.random().toString(36).slice(2,9), []);
  return (
    <div style={{
      position: 'relative',
      width: '100%', aspectRatio: '1/1',
      background: tone,
      borderRadius: corner,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.03)',
      ...style,
    }}>
      <svg width="100%" height="100%" style={{position:'absolute',inset:0}}>
        <defs>
          <pattern id={stripeId} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="transparent"/>
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.035)" strokeWidth="4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${stripeId})`}/>
      </svg>
      {/* vignette */}
      <div style={{
        position:'absolute', inset:0,
        background: 'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.06), transparent 55%)',
      }}/>
      {showLabel && (
        <div style={{
          position:'absolute', left: 10, bottom: 10,
          fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 0.5,
          color: 'rgba(255,255,255,0.4)',
        }}>{label}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Primary button — wide, rounded, accent
// ─────────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, accent, icon, variant='solid', style={} }) {
  const a = accent || ACCENTS.gold;
  const solid = variant === 'solid';
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
      width:'100%', height: 52,
      borderRadius: TOKENS.rButton,
      border: solid ? 'none' : `1px solid ${TOKENS.border}`,
      background: solid ? a.solid : 'transparent',
      color: solid ? a.ink : TOKENS.text,
      fontFamily: TOKENS.sans, fontSize: 15, fontWeight: 600, letterSpacing: -0.1,
      cursor:'pointer',
      transition: 'transform 120ms ease, opacity 120ms ease',
      ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'}
    onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
    >
      {icon}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Pill (filter chip)
// ─────────────────────────────────────────────────────────────
function FilterPill({ active, onClick, children, accent }) {
  const a = accent || ACCENTS.gold;
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      height: 34,
      padding: '0 14px',
      borderRadius: TOKENS.rPill,
      border: active ? `1px solid ${a.solid}` : `1px solid ${TOKENS.border}`,
      background: active ? a.soft : 'transparent',
      color: active ? a.solid : TOKENS.textMuted,
      fontFamily: TOKENS.sans, fontSize: 13, fontWeight: active ? 600 : 500,
      letterSpacing: -0.05,
      cursor:'pointer',
      whiteSpace:'nowrap',
      transition: 'all 160ms ease',
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// Color dot cluster
// ─────────────────────────────────────────────────────────────
function ColorDots({ colors, size=10 }) {
  return (
    <div style={{display:'flex', gap: 4}}>
      {colors.map((c,i)=>(
        <div key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: c,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Formality dots (1-5) — more editorial than stars
// ─────────────────────────────────────────────────────────────
function FormalityDots({ level, max=5, accent, size=5 }) {
  const a = accent || ACCENTS.gold;
  return (
    <div style={{display:'flex', gap: 3, alignItems:'center'}}>
      {Array.from({length:max}).map((_,i)=>(
        <div key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: i < level ? a.solid : 'rgba(255,255,255,0.15)',
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Category badge (gold pill)
// ─────────────────────────────────────────────────────────────
function CategoryBadge({ children, accent }) {
  const a = accent || ACCENTS.gold;
  return (
    <div style={{
      display:'inline-flex', alignItems:'center',
      height: 20, padding: '0 8px',
      borderRadius: TOKENS.rPill,
      background: a.soft,
      color: a.solid,
      fontFamily: TOKENS.sans, fontSize: 10, fontWeight: 600,
      letterSpacing: 0.6, textTransform:'uppercase',
    }}>{children}</div>
  );
}

Object.assign(window, { Icon, GarmentTile, PrimaryButton, FilterPill, ColorDots, FormalityDots, CategoryBadge });
