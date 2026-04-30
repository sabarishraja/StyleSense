// Outfits tab — Phase 1 design exploration
// Three states: Idle / Loading / Results, plus empty + error variants.
// Uses the project's existing tokens, primitives, and wardrobe data.

const { useState: useStateOT, useEffect: useEffectOT, useRef: useRefOT } = React;

// Brief-specified palette — slightly diverges from TOKENS so the brief is honored exactly.
const OT = {
  bg:        '#0A0A0A',
  surface:   '#1A1A1A',
  surface2:  '#2A2A2A',
  gold:      '#D4A574',
  goldMuted: '#8B6914',
  text:      '#FFFFFF',
  textSec:   '#888888',
  textMuted: '#555555',
  textBody:  '#CCCCCC',
  danger:    '#FF4444',
};

// ─────────────────────────────────────────────────────────────
// Occasion definitions
// ─────────────────────────────────────────────────────────────
const OCCASIONS = [
  { id: 'casual',       label: 'Casual',       desc: 'Formality 1–2 · Everyday wear',          icon: 'tee'      },
  { id: 'smart-casual', label: 'Smart Casual', desc: 'Formality 2–3 · Elevated everyday',      icon: 'blazer'   },
  { id: 'work',         label: 'Work',         desc: 'Formality 3–4 · Office appropriate',     icon: 'brief'    },
  { id: 'formal',       label: 'Formal',       desc: 'Formality 4–5 · Special occasions',      icon: 'bowtie'   },
  { id: 'date-night',   label: 'Date Night',   desc: 'Formality 3–4 · Evening ready',          icon: 'wine'     },
  { id: 'ethnic',       label: 'Ethnic',       desc: 'Ethnic wear · All formality levels',     icon: 'lotus'    },
];

// Line-icon set tuned for the occasion tiles
const OccIcon = {
  tee:    (p={}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M8 3l4 2 4-2 5 3-2 4-3-1v12H6V9L3 10 1 6l5-3h2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  blazer: (p={}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M7 4l5 3 5-3 4 4-2 14H5L3 8l4-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M12 7v14M9 11l3 4 3-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  brief:  (p={}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 12h18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  bowtie: (p={}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 8l7 4-7 4V8zM21 8l-7 4 7 4V8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><rect x="9" y="10" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  wine:   (p={}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M7 3h10l-1 6a4 4 0 11-8 0L7 3zM12 13v7M8 21h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lotus:  (p={}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 4c-2 4-2 7 0 11 2-4 2-7 0-11zM4 12c2 1 5 3 8 3M20 12c-2 1-5 3-8 3M8 7c0 4 2 7 4 8M16 7c0 4-2 7-4 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  hanger: (p={}) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 8a2 2 0 112-2c0 1-1 2-2 3-1 1-9 7-9 9h18c0-2-8-8-9-9z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  filter: (p={}) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  puzzle: (p={}) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" {...p}><path d="M4 4h6v3a2 2 0 104 0V4h6v6h-3a2 2 0 100 4h3v6h-6v-3a2 2 0 10-4 0v3H4v-6h3a2 2 0 100-4H4V4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  warn:   (p={}) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3l10 18H2L12 3zM12 10v5M12 18h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  refresh:(p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  add:    (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
};

// ─────────────────────────────────────────────────────────────
// Header — matches closet.tsx structure exactly
// ─────────────────────────────────────────────────────────────
function OutfitsHeader() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div style={{ padding: '8px 16px 24px' }}>
      <div style={{
        fontFamily: TOKENS.mono, fontSize: 11, letterSpacing: 3,
        color: OT.gold, textTransform: 'uppercase', marginBottom: 6,
        fontWeight: 500,
      }}>The Outfits</div>
      <div style={{
        fontFamily: TOKENS.serif, fontSize: 42, fontWeight: 300,
        color: OT.text, letterSpacing: -1.2, lineHeight: 1.0,
      }}>Styled For You</div>
      <div style={{
        fontFamily: TOKENS.sans, fontSize: 14, color: OT.textSec,
        marginTop: 6, letterSpacing: -0.05,
      }}>{dateStr}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Occasion tile
// ─────────────────────────────────────────────────────────────
function OccasionTile({ occasion, selected, onClick }) {
  const Icon = OccIcon[occasion.icon];
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 8,
      padding: '14px 18px',
      minWidth: 92,
      background: OT.surface,
      border: `1px solid ${selected ? OT.gold : OT.surface2}`,
      borderRadius: 12,
      color: selected ? OT.gold : OT.textSec,
      cursor: 'pointer',
      transition: 'border-color 150ms ease, color 150ms ease, box-shadow 150ms ease',
      boxShadow: selected ? `0 0 8px rgba(212,165,116,0.15)` : 'none',
      fontFamily: TOKENS.sans,
    }}>
      <Icon style={{ color: selected ? OT.gold : OT.textMuted, transition: 'color 150ms ease' }}/>
      <div style={{
        fontSize: 13, fontWeight: 500, letterSpacing: -0.05,
        color: 'inherit',
      }}>{occasion.label}</div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Occasion picker row + description strip
// ─────────────────────────────────────────────────────────────
function OccasionPicker({ selectedId, onSelect }) {
  const sel = OCCASIONS.find(o => o.id === selectedId);
  return (
    <>
      <div style={{
        display: 'flex', gap: 10, padding: '0 16px 12px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }} className="hide-scrollbar">
        {OCCASIONS.map(o => (
          <OccasionTile
            key={o.id}
            occasion={o}
            selected={selectedId === o.id}
            onClick={() => onSelect(o.id)}
          />
        ))}
      </div>
      <div style={{
        padding: '0 16px 24px',
        fontFamily: TOKENS.sans, fontSize: 12,
        color: OT.textMuted, fontStyle: 'italic',
        minHeight: 18,
      }}>
        {sel ? sel.desc : 'Pick an occasion to begin.'}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Generate CTA
// ─────────────────────────────────────────────────────────────
function GenerateButton({ enabled, onClick }) {
  return (
    <button
      disabled={!enabled}
      onClick={onClick}
      style={{
        width: '100%',
        height: 52,
        background: enabled ? OT.gold : OT.surface2,
        color: enabled ? OT.bg : OT.textMuted,
        border: 'none',
        borderRadius: 14,
        fontFamily: TOKENS.sans, fontSize: 15, fontWeight: 600, letterSpacing: -0.1,
        cursor: enabled ? 'pointer' : 'default',
        transition: 'background 150ms ease, color 150ms ease, transform 120ms ease',
      }}
      onMouseDown={e => enabled && (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {enabled ? 'Generate Outfits' : 'Select an Occasion'}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Status chip (loading)
// ─────────────────────────────────────────────────────────────
function StatusChip({ phase }) {
  const messages = [
    'Filtering your wardrobe…',
    'Building outfit combinations…',
    'Claude is styling…',
  ];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '8px 16px',
      background: OT.surface,
      border: `1px solid ${OT.surface2}`,
      borderRadius: 20,
    }}>
      <style>{`@keyframes ot-pulse { 0%,100% { opacity:.4; transform:scale(.85);} 50% { opacity:1; transform:scale(1);} }`}</style>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: OT.gold,
        animation: 'ot-pulse 1.4s ease-in-out infinite',
        boxShadow: `0 0 8px ${OT.gold}80`,
      }}/>
      <div style={{
        fontFamily: TOKENS.sans, fontSize: 13, color: OT.textSec, letterSpacing: -0.05,
      }}>{messages[phase % 3]}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton outfit card
// ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: OT.surface,
      borderRadius: 20,
      padding: 16,
      position: 'relative',
    }}>
      <style>{`
        @keyframes ot-shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .ot-skel {
          background: linear-gradient(90deg, #2A2A2A 0%, #333333 50%, #2A2A2A 100%);
          background-size: 400px 100%;
          animation: ot-shimmer 1.5s linear infinite;
          border-radius: 6px;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <div className="ot-skel" style={{ width: 56, height: 18 }}/>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[0,1,2].map(i => (
          <div key={i} className="ot-skel" style={{ width: 72, height: 72, borderRadius: 12 }}/>
        ))}
      </div>
      <div className="ot-skel" style={{ width: '60%', height: 12, marginBottom: 8 }}/>
      <div className="ot-skel" style={{ width: '40%', height: 12 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Outfit card (results)
// ─────────────────────────────────────────────────────────────
function OutfitCard({ outfit, index, onRegenerate, animDelay = 0 }) {
  const visible = outfit.items.slice(0, 4);
  const overflow = outfit.items.length - 4;
  return (
    <div style={{
      background: OT.surface,
      borderRadius: 20,
      padding: 16,
      animation: `ot-cardin 250ms ease-out ${animDelay}ms both`,
    }}>
      <style>{`
        @keyframes ot-cardin {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top row: label + occasion badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 2,
          color: OT.textMuted, textTransform: 'uppercase',
        }}>Outfit {index + 1}</div>
        <div style={{
          background: OT.surface2,
          borderRadius: 6,
          padding: '4px 10px',
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.2,
          color: OT.gold, textTransform: 'uppercase', fontWeight: 600,
        }}>{outfit.occasion}</div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: OT.surface2, margin: '12px 0' }}/>

      {/* Item images */}
      <div style={{ display: 'flex', gap: 8 }}>
        {visible.slice(0, overflow > 0 ? 3 : 4).map((item, i) => (
          <div key={i} style={{
            width: 76, height: 76, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
            background: OT.surface2,
          }}>
            <GarmentTile tone={item.tone} label={item.label} corner={0} showLabel={false}/>
          </div>
        ))}
        {overflow > 0 && (
          <div style={{
            width: 76, height: 76, borderRadius: 12, flexShrink: 0,
            background: OT.surface2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: TOKENS.sans, fontSize: 13, color: OT.textSec, fontWeight: 500,
          }}>+{overflow + 1}</div>
        )}
      </div>

      {/* Subcategory strip */}
      <div style={{
        marginTop: 10,
        fontFamily: TOKENS.sans, fontSize: 12, color: OT.textMuted,
        letterSpacing: -0.05,
      }}>{outfit.items.map(i => i.sub).join(' · ')}</div>

      {/* Reason */}
      <div style={{
        marginTop: 10,
        fontFamily: TOKENS.sans, fontSize: 14, color: OT.textBody,
        lineHeight: '20px', fontStyle: 'italic', letterSpacing: -0.1,
      }}>"{outfit.reason}"</div>

      {/* Regenerate */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button onClick={onRegenerate} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent',
          border: `1px solid ${OT.surface2}`,
          borderRadius: 8,
          padding: '6px 14px',
          fontFamily: TOKENS.sans, fontSize: 12,
          color: OT.textSec,
          cursor: 'pointer',
          transition: 'border-color 150ms ease, color 150ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = OT.gold; e.currentTarget.style.color = OT.gold; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = OT.surface2; e.currentTarget.style.color = OT.textSec; }}
        >
          <OccIcon.refresh/>
          Regenerate
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty / error state
// ─────────────────────────────────────────────────────────────
function StateMessage({ icon, heading, sub, ctaLabel, ctaIcon, danger }) {
  const IconComp = OccIcon[icon];
  return (
    <div style={{
      padding: '48px 28px 40px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    }}>
      <div style={{ color: danger ? OT.danger : '#333333', marginBottom: 20 }}>
        <IconComp/>
      </div>
      <div style={{
        fontFamily: TOKENS.sans, fontSize: 16, color: OT.textSec,
        marginBottom: 6,
      }}>{heading}</div>
      <div style={{
        fontFamily: TOKENS.sans, fontSize: 13, color: OT.textMuted,
        maxWidth: 260, lineHeight: 1.5, marginBottom: ctaLabel ? 24 : 0,
      }}>{sub}</div>
      {ctaLabel && (
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'transparent',
          border: `1px solid ${OT.gold}`,
          borderRadius: 14,
          padding: '12px 22px',
          fontFamily: TOKENS.sans, fontSize: 14, fontWeight: 600,
          color: OT.gold,
          cursor: 'pointer',
        }}>
          {ctaIcon}
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sample outfit data for results state
// ─────────────────────────────────────────────────────────────
const SAMPLE_OUTFITS = [
  {
    occasion: 'Work',
    items: [WARDROBE[4], WARDROBE[6], WARDROBE[3]], // silk blouse, pleated trouser, leather loafer
    reason: 'Classic pairing — the neutral tones keep it polished without trying too hard.',
  },
  {
    occasion: 'Work',
    items: [WARDROBE[1], WARDROBE[6], WARDROBE[3], WARDROBE[11]], // knit, trouser, loafer, sunglasses
    reason: 'A softer take. Cashmere over wool reads considered, almost off-duty editor.',
  },
  {
    occasion: 'Work',
    items: [WARDROBE[10], WARDROBE[2], WARDROBE[3], WARDROBE[7], WARDROBE[0]], // linen shirt, denim, loafer, scarf, overcoat (5 items → +2 chip)
    reason: 'Leans modern. The overcoat anchors the look; the scarf adds a quiet flourish.',
  },
];

// ─────────────────────────────────────────────────────────────
// Full-screen variants for the canvas
// ─────────────────────────────────────────────────────────────

function ScreenIdle({ selectedId = 'work' }) {
  const [sel, setSel] = useStateOT(selectedId);
  return (
    <div style={{ minHeight: '100%', background: OT.bg, paddingBottom: 100, display: 'flex', flexDirection: 'column' }}>
      <OutfitsHeader/>
      <OccasionPicker selectedId={sel} onSelect={setSel}/>
      <div style={{ flex: 1 }}/>
      <div style={{ padding: '0 16px 16px' }}>
        <GenerateButton enabled={!!sel} onClick={() => {}}/>
      </div>
    </div>
  );
}

function ScreenIdleEmpty() {
  // No occasion selected — disabled CTA
  const [sel, setSel] = useStateOT(null);
  return (
    <div style={{ minHeight: '100%', background: OT.bg, paddingBottom: 100, display: 'flex', flexDirection: 'column' }}>
      <OutfitsHeader/>
      <OccasionPicker selectedId={sel} onSelect={setSel}/>
      <div style={{ flex: 1 }}/>
      <div style={{ padding: '0 16px 16px' }}>
        <GenerateButton enabled={false} onClick={() => {}}/>
      </div>
    </div>
  );
}

function ScreenLoading({ selectedId = 'work' }) {
  const [phase, setPhase] = useStateOT(0);
  useEffectOT(() => {
    const t = setInterval(() => setPhase(p => p + 1), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ minHeight: '100%', background: OT.bg, paddingBottom: 100 }}>
      <OutfitsHeader/>
      {/* selected tile only, so user remembers their pick */}
      <div style={{
        display: 'flex', gap: 10, padding: '0 16px 12px',
      }}>
        <OccasionTile occasion={OCCASIONS.find(o => o.id === selectedId)} selected={true} onClick={() => {}}/>
      </div>
      <div style={{
        padding: '0 16px 24px',
        fontFamily: TOKENS.sans, fontSize: 12,
        color: OT.textMuted, fontStyle: 'italic',
      }}>{OCCASIONS.find(o => o.id === selectedId).desc}</div>

      {/* Centered status chip */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 16px 20px' }}>
        <StatusChip phase={phase}/>
      </div>

      {/* Skeletons */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonCard/>
        <SkeletonCard/>
        <SkeletonCard/>
      </div>
    </div>
  );
}

function ScreenResults({ selectedId = 'work' }) {
  const [sel, setSel] = useStateOT(selectedId);
  return (
    <div style={{ minHeight: '100%', background: OT.bg, paddingBottom: 100 }}>
      <OutfitsHeader/>
      <OccasionPicker selectedId={sel} onSelect={setSel}/>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SAMPLE_OUTFITS.map((o, i) => (
          <OutfitCard key={i} outfit={o} index={i} onRegenerate={() => {}} animDelay={i * 80}/>
        ))}
      </div>
    </div>
  );
}

function ScreenEmptyClosetState() {
  return (
    <div style={{ minHeight: '100%', background: OT.bg, paddingBottom: 100 }}>
      <OutfitsHeader/>
      <OccasionPicker selectedId={'work'} onSelect={() => {}}/>
      <StateMessage
        icon="hanger"
        heading="Your closet is empty"
        sub="Add some clothes to get started"
        ctaLabel="Add Item"
        ctaIcon={<OccIcon.add/>}
      />
    </div>
  );
}

function ScreenNoMatchState() {
  return (
    <div style={{ minHeight: '100%', background: OT.bg, paddingBottom: 100 }}>
      <OutfitsHeader/>
      <OccasionPicker selectedId={'formal'} onSelect={() => {}}/>
      <StateMessage
        icon="filter"
        heading="Nothing for Formal"
        sub="Try a different occasion or add more formal-appropriate items"
      />
    </div>
  );
}

function ScreenIncompleteState() {
  return (
    <div style={{ minHeight: '100%', background: OT.bg, paddingBottom: 100 }}>
      <OutfitsHeader/>
      <OccasionPicker selectedId={'work'} onSelect={() => {}}/>
      <StateMessage
        icon="puzzle"
        heading="Incomplete wardrobe for Work"
        sub="You're missing a bottom to complete an outfit"
      />
    </div>
  );
}

function ScreenErrorState() {
  return (
    <div style={{ minHeight: '100%', background: OT.bg, paddingBottom: 100 }}>
      <OutfitsHeader/>
      <OccasionPicker selectedId={'work'} onSelect={() => {}}/>
      <StateMessage
        icon="warn"
        heading="Something went wrong"
        sub="Couldn't generate outfits. Try again."
        ctaLabel="Try Again"
        ctaIcon={<OccIcon.refresh/>}
        danger
      />
    </div>
  );
}

Object.assign(window, {
  ScreenIdle, ScreenIdleEmpty, ScreenLoading, ScreenResults,
  ScreenEmptyClosetState, ScreenNoMatchState, ScreenIncompleteState, ScreenErrorState,
});
