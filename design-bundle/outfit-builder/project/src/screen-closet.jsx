// Closet screen — home. Grid of garment cards with filter bar + item count.

const { useState: useStateCl } = React;

// ─────────────────────────────────────────────────────────────
// Three card variants — wired to Tweaks
// ─────────────────────────────────────────────────────────────
function CardPhotoFirst({ item, accent, onTap }) {
  return (
    <div onClick={onTap} style={{
      background: TOKENS.surface,
      borderRadius: TOKENS.rCard,
      border: `1px solid ${TOKENS.border}`,
      overflow:'hidden',
      cursor:'pointer',
    }}>
      <div style={{position:'relative'}}>
        <GarmentTile tone={item.tone} label={item.label} corner={0}/>
        <div style={{position:'absolute', top: 10, left: 10}}>
          <CategoryBadge accent={accent}>{item.cat}</CategoryBadge>
        </div>
      </div>
      <div style={{padding: '10px 12px 12px'}}>
        <div style={{
          fontFamily: TOKENS.sans, fontSize: 13, fontWeight: 600,
          color: TOKENS.text, letterSpacing: -0.1,
          marginBottom: 6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>{item.sub}</div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <ColorDots colors={item.colors}/>
          <FormalityDots level={item.formality} accent={accent}/>
        </div>
      </div>
    </div>
  );
}

function CardInfoFirst({ item, accent, onTap }) {
  return (
    <div onClick={onTap} style={{
      background: TOKENS.surface,
      borderRadius: TOKENS.rCard,
      border: `1px solid ${TOKENS.border}`,
      overflow:'hidden',
      cursor:'pointer',
      padding: 12,
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
        <CategoryBadge accent={accent}>{item.cat}</CategoryBadge>
        <FormalityDots level={item.formality} accent={accent}/>
      </div>
      <GarmentTile tone={item.tone} label={item.label} corner={12} showLabel={false}/>
      <div style={{marginTop: 10, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 8}}>
        <div style={{
          fontFamily: TOKENS.serif, fontSize: 15, fontWeight: 500,
          color: TOKENS.text, letterSpacing: -0.2, lineHeight: 1.15,
        }}>{item.sub}</div>
        <ColorDots colors={item.colors}/>
      </div>
    </div>
  );
}

function CardMinimal({ item, accent, onTap }) {
  return (
    <div onClick={onTap} style={{cursor:'pointer'}}>
      <div style={{position:'relative'}}>
        <GarmentTile tone={item.tone} label={item.label} corner={TOKENS.rCard} showLabel={false}/>
        <div style={{
          position:'absolute', bottom: 8, right: 8,
          padding:'3px 7px', borderRadius: 10,
          background:'rgba(10,10,10,0.65)',
          backdropFilter:'blur(8px)',
          WebkitBackdropFilter:'blur(8px)',
        }}>
          <FormalityDots level={item.formality} accent={accent} size={4}/>
        </div>
      </div>
      <div style={{marginTop: 8, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{
          fontFamily: TOKENS.sans, fontSize: 12, fontWeight: 500,
          color: TOKENS.textMuted, letterSpacing: 0.6, textTransform:'uppercase',
        }}>{item.cat}</div>
        <ColorDots colors={item.colors} size={8}/>
      </div>
      <div style={{
        fontFamily: TOKENS.serif, fontSize: 15, fontWeight: 500,
        color: TOKENS.text, marginTop: 2, letterSpacing:-0.2,
      }}>{item.sub}</div>
    </div>
  );
}

const CARD_VARIANTS = {
  'photo-first': CardPhotoFirst,
  'info-first':  CardInfoFirst,
  'minimal':     CardMinimal,
};

// ─────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────
function ClosetEmpty({ accent, onAdd }) {
  return (
    <div style={{
      padding: '80px 28px 40px', display:'flex', flexDirection:'column',
      alignItems:'center', textAlign:'center',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24,
        border: `1px solid ${TOKENS.border}`,
        background: TOKENS.surface,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom: 24, color: accent.solid,
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M4 7l8-4 8 4v10l-8 4-8-4V7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M4 7l8 4 8-4M12 11v10" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{
        fontFamily: TOKENS.serif, fontSize: 28, fontWeight: 400,
        color: TOKENS.text, letterSpacing: -0.5, lineHeight: 1.15, marginBottom: 10,
      }}>Your closet is empty.</div>
      <div style={{
        fontFamily: TOKENS.sans, fontSize: 14, color: TOKENS.textMuted,
        maxWidth: 260, lineHeight: 1.5, marginBottom: 28,
      }}>Start by photographing a piece. Claude will tag it so you can find it later.</div>
      <div style={{width: '100%', maxWidth: 280}}>
        <PrimaryButton accent={accent} onClick={onAdd} icon={<Icon.plusSmall/>}>
          Add First Item
        </PrimaryButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Closet screen
// ─────────────────────────────────────────────────────────────
function ClosetScreen({ tweaks, accent, platform, onAdd, wardrobe }) {
  const [filter, setFilter] = useStateCl('All');

  const filtered = filter === 'All'
    ? wardrobe
    : wardrobe.filter(w => w.cat === filter);

  const Card = CARD_VARIANTS[tweaks.cardVariant] || CardPhotoFirst;
  const density = tweaks.gridDensity; // '2' | '3' | 'stagger'

  const gridStyle = density === '3'
    ? { gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }
    : density === 'stagger'
      ? { gridTemplateColumns: '1fr 1fr', gap: 12 }
      : { gridTemplateColumns: '1fr 1fr', gap: 12 };

  if (!wardrobe.length) {
    return (
      <div style={{minHeight: '100%', background: TOKENS.bg}}>
        <ClosetHeader accent={accent} platform={platform} count={0}/>
        <ClosetEmpty accent={accent} onAdd={onAdd}/>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100%', background: TOKENS.bg, paddingBottom: 24}}>
      <ClosetHeader accent={accent} platform={platform} count={filtered.length}/>

      {/* Filter bar */}
      <div style={{
        display:'flex', gap: 8, padding: '0 16px 14px',
        overflowX:'auto', scrollbarWidth:'none',
      }} className="hide-scrollbar">
        {CATEGORIES.map(c => (
          <FilterPill key={c} active={filter===c} onClick={()=>setFilter(c)} accent={accent}>
            {c}
          </FilterPill>
        ))}
      </div>

      {/* Item count strip */}
      <div style={{
        padding: '0 16px 14px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1,
          color: TOKENS.textDim, textTransform:'uppercase',
        }}>{String(filtered.length).padStart(2,'0')} / {String(wardrobe.length).padStart(2,'0')} items</div>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1,
          color: TOKENS.textDim, textTransform:'uppercase',
        }}>{filter}</div>
      </div>

      {/* Grid */}
      <div style={{
        padding: '0 16px', display:'grid',
        ...gridStyle,
      }}>
        {filtered.map((item, i) => (
          <div key={item.id} style={ density === 'stagger' && i % 4 === 1 ? { marginTop: 24 } : density === 'stagger' && i % 4 === 2 ? { marginTop: -12 } : {} }>
            <Card item={item} accent={accent}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Closet header (per-platform)
// ─────────────────────────────────────────────────────────────
function ClosetHeader({ accent, platform, count }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric'});
  return (
    <div style={{padding: platform==='ios' ? '8px 16px 16px' : '4px 16px 16px'}}>
      <div style={{
        fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.5,
        color: accent.solid, textTransform:'uppercase', marginBottom: 4,
      }}>The Closet</div>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 12}}>
        <div>
          <div style={{
            fontFamily: TOKENS.serif, fontSize: 34, fontWeight: 400,
            color: TOKENS.text, letterSpacing: -0.9, lineHeight: 1.0,
          }}>Wardrobe</div>
          <div style={{
            fontFamily: TOKENS.sans, fontSize: 12, color: TOKENS.textMuted,
            marginTop: 4, letterSpacing:-0.05,
          }}>{dateStr}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ClosetScreen });
