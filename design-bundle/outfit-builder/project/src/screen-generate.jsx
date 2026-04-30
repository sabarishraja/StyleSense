// Generate screen — extends the existing Outfits tab pattern
// (OutfitsHeader + OccasionPicker + OutfitCardResults with Regenerate)
// by adding a "Worn Today" action alongside Regenerate on each card.

const { useState: uS_G, useEffect: uE_G } = React;

// Local palette mirror — matches screen-outfits-tab.jsx
const G = {
  bg:        '#0A0A0A',
  surface:   '#1A1A1A',
  surface2:  '#2A2A2A',
  gold:      '#D4A574',
  text:      '#FFFFFF',
  textSec:   '#888888',
  textMuted: '#555555',
  textBody:  '#CCCCCC',
  success:   '#7FB685',
};

// Same sample outfits, but with stable ids for tracking worn/saved state
const SAMPLE_GEN_OUTFITS = [
  {
    id: 'gen-001',
    occasion: 'Work',
    items: [WARDROBE[4], WARDROBE[6], WARDROBE[3]],
    reason: 'Classic pairing — the neutral tones keep it polished without trying too hard.',
  },
  {
    id: 'gen-002',
    occasion: 'Work',
    items: [WARDROBE[1], WARDROBE[6], WARDROBE[3], WARDROBE[11]],
    reason: 'A softer take. Cashmere over wool reads considered, almost off-duty editor.',
  },
  {
    id: 'gen-003',
    occasion: 'Work',
    items: [WARDROBE[10], WARDROBE[2], WARDROBE[3], WARDROBE[7], WARDROBE[0]],
    reason: 'Leans modern. The overcoat anchors the look; the scarf adds a quiet flourish.',
  },
];

// ─────────────────────────────────────────────────────────────
// Outfit card with Worn Today + Regenerate
// ─────────────────────────────────────────────────────────────
function OutfitCardWithWorn({ outfit, index, isWorn, isSaved, onRegenerate, onWornToday, onSave, animDelay = 0, accent, wornButtonStyle = 'split' }) {
  const visible = outfit.items.slice(0, 4);
  const overflow = outfit.items.length - 4;
  const goldColor = accent ? accent.solid : G.gold;
  const goldSoft  = accent ? accent.soft  : 'rgba(212,165,116,0.14)';

  return (
    <div style={{
      background: G.surface,
      borderRadius: 20,
      padding: 16,
      animation: `g-cardin 250ms ease-out ${animDelay}ms both`,
      border: isWorn ? `1px solid rgba(127,182,133,0.35)` : `1px solid transparent`,
      transition: 'border-color 200ms ease',
    }}>
      <style>{`
        @keyframes g-cardin {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes g-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Top row: label + occasion + save bookmark */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{display:'flex', alignItems:'center', gap: 8}}>
          <div style={{
            fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 2,
            color: G.textMuted, textTransform: 'uppercase',
          }}>Outfit {index + 1}</div>
          {isWorn && (
            <div style={{
              display:'inline-flex', alignItems:'center', gap: 4,
              padding: '3px 8px',
              background: 'rgba(127,182,133,0.14)',
              border: '1px solid rgba(127,182,133,0.35)',
              borderRadius: 6,
              fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
              color: G.success, textTransform: 'uppercase', fontWeight: 600,
            }}>
              <Icon.check/>
              Worn today
            </div>
          )}
        </div>

        <div style={{display:'flex', alignItems:'center', gap: 8}}>
          <div style={{
            background: G.surface2,
            borderRadius: 6,
            padding: '4px 10px',
            fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.2,
            color: goldColor, textTransform: 'uppercase', fontWeight: 600,
          }}>{outfit.occasion}</div>
          <button onClick={onSave} aria-label="Save" style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'transparent',
            border: `1px solid ${isSaved ? goldColor : G.surface2}`,
            color: isSaved ? goldColor : G.textSec,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'}>
              <path d="M6 4h12v17l-6-4-6 4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: G.surface2, margin: '12px 0' }}/>

      {/* Item images */}
      <div style={{ display: 'flex', gap: 8 }}>
        {visible.slice(0, overflow > 0 ? 3 : 4).map((item, i) => (
          <div key={i} style={{
            width: 76, height: 76, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
            background: G.surface2,
          }}>
            <GarmentTile tone={item.tone} label={item.label} corner={0} showLabel={false}/>
          </div>
        ))}
        {overflow > 0 && (
          <div style={{
            width: 76, height: 76, borderRadius: 12, flexShrink: 0,
            background: G.surface2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: TOKENS.sans, fontSize: 13, color: G.textSec, fontWeight: 500,
          }}>+{overflow + 1}</div>
        )}
      </div>

      {/* Subcategory strip */}
      <div style={{
        marginTop: 10,
        fontFamily: TOKENS.sans, fontSize: 12, color: G.textMuted,
        letterSpacing: -0.05,
      }}>{outfit.items.map(i => i.sub).join(' · ')}</div>

      {/* Reason */}
      <div style={{
        marginTop: 10,
        fontFamily: TOKENS.sans, fontSize: 14, color: G.textBody,
        lineHeight: '20px', fontStyle: 'italic', letterSpacing: -0.1,
      }}>"{outfit.reason}"</div>

      {/* Action row — Regenerate + Worn Today */}
      <ActionRow
        variant={wornButtonStyle}
        isWorn={isWorn}
        accent={{solid: goldColor, soft: goldSoft, ink: '#0A0A0A'}}
        onRegenerate={onRegenerate}
        onWornToday={onWornToday}
      />
    </div>
  );
}

function ActionRow({ variant, isWorn, accent, onRegenerate, onWornToday }) {
  if (variant === 'primary') {
    // Worn = primary accent fill (full width), Regenerate = secondary text button
    return (
      <div style={{ marginTop: 14, display:'flex', flexDirection:'column', gap: 8 }}>
        <button onClick={onWornToday} disabled={isWorn} style={{
          width: '100%', height: 44,
          borderRadius: 12, border: 'none',
          background: isWorn ? 'rgba(127,182,133,0.18)' : accent.solid,
          color: isWorn ? G.success : accent.ink,
          fontFamily: TOKENS.sans, fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
          cursor: isWorn ? 'default' : 'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap: 6,
          transition: 'all 200ms ease',
        }}>
          {isWorn ? <Icon.check/> : <SunIcon size={14}/>}
          {isWorn ? 'Logged for today' : 'Worn today'}
        </button>
        <button onClick={onRegenerate} style={{
          alignSelf:'flex-end',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent',
          border: `1px solid ${G.surface2}`,
          borderRadius: 8,
          padding: '6px 14px',
          fontFamily: TOKENS.sans, fontSize: 12,
          color: G.textSec,
          cursor: 'pointer',
        }}>
          <RegenIcon/>
          Regenerate
        </button>
      </div>
    );
  }

  // 'split' (default): equal-weight pair, side by side
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
      <button onClick={onRegenerate} style={{
        flex: 1, height: 40,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        background: 'transparent',
        border: `1px solid ${G.surface2}`,
        borderRadius: 10,
        fontFamily: TOKENS.sans, fontSize: 13, fontWeight: 500,
        color: G.textSec,
        cursor: 'pointer',
        transition: 'border-color 150ms ease, color 150ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent.solid; e.currentTarget.style.color = accent.solid; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = G.surface2; e.currentTarget.style.color = G.textSec; }}
      >
        <RegenIcon/>
        Regenerate
      </button>
      <button onClick={onWornToday} disabled={isWorn} style={{
        flex: 1, height: 40,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        background: isWorn ? 'rgba(127,182,133,0.14)' : accent.soft,
        border: `1px solid ${isWorn ? 'rgba(127,182,133,0.4)' : accent.solid}`,
        borderRadius: 10,
        fontFamily: TOKENS.sans, fontSize: 13, fontWeight: 600, letterSpacing: -0.05,
        color: isWorn ? G.success : accent.solid,
        cursor: isWorn ? 'default' : 'pointer',
        transition: 'all 200ms ease',
      }}>
        {isWorn ? <Icon.check/> : <SunIcon size={13}/>}
        {isWorn ? 'Logged' : 'Worn today'}
      </button>
    </div>
  );
}

function SunIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function RegenIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Full-screen: Generate (Results state) with Worn Today on each card
// ─────────────────────────────────────────────────────────────
function GenerateScreen({ accent, wornButtonStyle = 'split', initialWorn = null }) {
  const [sel, setSel] = uS_G('work');
  const [wornIds, setWornIds] = uS_G(new Set(initialWorn ? [initialWorn] : []));
  const [savedIds, setSavedIds] = uS_G(new Set());
  const [toast, setToast] = uS_G(null);

  const handleWorn = (id) => {
    if (wornIds.has(id)) return;
    const next = new Set(wornIds);
    next.add(id);
    setWornIds(next);
    setToast({text: 'Logged for today'});
    setTimeout(() => setToast(null), 2200);
  };
  const handleSave = (id) => {
    const next = new Set(savedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSavedIds(next);
  };

  return (
    <div style={{
      minHeight: '100%', background: G.bg,
      paddingBottom: 24,
      position: 'relative',
    }}>
      <OutfitsHeader/>
      <OccasionPicker selectedId={sel} onSelect={setSel}/>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SAMPLE_GEN_OUTFITS.map((o, i) => (
          <OutfitCardWithWorn
            key={o.id}
            outfit={o}
            index={i}
            isWorn={wornIds.has(o.id)}
            isSaved={savedIds.has(o.id)}
            onRegenerate={() => {}}
            onWornToday={() => handleWorn(o.id)}
            onSave={() => handleSave(o.id)}
            animDelay={i * 80}
            accent={accent}
            wornButtonStyle={wornButtonStyle}
          />
        ))}
      </div>

      {toast && (
        <div style={{
          position:'absolute', left: '50%', bottom: 18,
          transform: 'translateX(-50%)',
          background: G.surface,
          border: `1px solid ${accent ? accent.solid : G.gold}`,
          borderRadius: 999,
          padding: '10px 16px',
          display:'flex', alignItems:'center', gap: 8,
          fontFamily: TOKENS.sans, fontSize: 13, color: G.text,
          letterSpacing: -0.05,
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
          animation: 'g-toast 220ms ease',
          zIndex: 5,
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: 9,
            background: accent ? accent.solid : G.gold, color: '#0A0A0A',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><Icon.check/></span>
          {toast.text}
        </div>
      )}
      <style>{`
        @keyframes g-toast {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { GenerateScreen, OutfitCardWithWorn });
