// Outfits teaser — the "surprise" moment.
// A drifting stack of cards rearranges themselves as if AI is mixing outfits.

const { useState: uS_O, useEffect: uE_O } = React;

function OutfitsScreen({ accent, wardrobe }) {
  // Build fake outfits from wardrobe
  const outfits = [
    { top: wardrobe.find(w=>w.sub==='Ribbed Knit') || wardrobe[1],
      bottom: wardrobe.find(w=>w.sub==='Pleated Trouser') || wardrobe[6],
      shoe: wardrobe.find(w=>w.sub==='Leather Loafer') || wardrobe[3],
      name: 'After Work', mood: 'polished · evening' },
    { top: wardrobe.find(w=>w.sub==='Silk Blouse') || wardrobe[4],
      bottom: wardrobe.find(w=>w.sub==='Wide-Leg Denim') || wardrobe[2],
      shoe: wardrobe.find(w=>w.sub==='Suede Sneaker') || wardrobe[9],
      name: 'Sunday Market', mood: 'relaxed · spring' },
    { top: wardrobe.find(w=>w.sub==='Linen Shirt') || wardrobe[10],
      bottom: wardrobe.find(w=>w.sub==='Wide-Leg Denim') || wardrobe[2],
      shoe: wardrobe.find(w=>w.sub==='Suede Sneaker') || wardrobe[9],
      name: 'Dinner in Rome', mood: 'warm · summer' },
  ].filter(o => o.top && o.bottom && o.shoe);

  const [idx, setIdx] = uS_O(0);

  // Auto-cycle
  uE_O(() => {
    const t = setInterval(()=> setIdx(i => (i+1) % outfits.length), 3200);
    return () => clearInterval(t);
  }, [outfits.length]);

  const current = outfits[idx];

  return (
    <div style={{
      minHeight: '100%', background: TOKENS.bg,
      padding: '8px 20px 40px',
      display:'flex', flexDirection:'column',
    }}>
      {/* Header */}
      <div style={{marginBottom: 4}}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.5,
          color: accent.solid, textTransform:'uppercase', marginBottom: 4,
        }}>Milestone 02</div>
        <div style={{
          fontFamily: TOKENS.serif, fontSize: 34, fontWeight: 400,
          color: TOKENS.text, letterSpacing: -0.9, lineHeight: 1.0,
        }}>Outfits</div>
        <div style={{
          fontFamily: TOKENS.sans, fontSize: 13, color: TOKENS.textMuted,
          marginTop: 6, letterSpacing:-0.05, maxWidth: 280,
        }}>Claude will mix your wardrobe into looks. Here's a preview of what's coming.</div>
      </div>

      {/* Stage */}
      <div style={{
        flex: 1, position:'relative',
        minHeight: 380, marginTop: 12,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <OutfitStack outfit={current} accent={accent}/>
      </div>

      {/* Outfit meta */}
      <div style={{textAlign:'center', marginBottom: 20}}>
        <div key={current.name} style={{
          fontFamily: TOKENS.serif, fontSize: 26, fontWeight: 400,
          color: TOKENS.text, letterSpacing: -0.5, lineHeight: 1.1,
          animation: 'stylesense-fadein 500ms ease',
        }}>
          <em style={{fontStyle:'italic'}}>"{current.name}"</em>
        </div>
        <div style={{
          marginTop: 6, fontFamily: TOKENS.mono, fontSize: 10,
          letterSpacing: 1.2, color: TOKENS.textMuted, textTransform:'uppercase',
        }}>{current.mood}</div>
      </div>

      {/* Dots */}
      <div style={{display:'flex', justifyContent:'center', gap: 6, marginBottom: 20}}>
        {outfits.map((_,i)=>(
          <div key={i} style={{
            width: i === idx ? 18 : 6, height: 6,
            borderRadius: 3,
            background: i === idx ? accent.solid : TOKENS.border,
            transition:'all 300ms ease',
          }}/>
        ))}
      </div>

      {/* Coming soon badge + button */}
      <div style={{
        padding: 20,
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: TOKENS.rCard,
        textAlign:'center',
      }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap: 6, height: 24, padding: '0 10px',
          borderRadius: TOKENS.rPill,
          background: accent.soft, color: accent.solid,
          fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.5, textTransform:'uppercase',
          fontWeight: 600,
        }}>
          <span style={{width:5, height:5, borderRadius:'50%', background: accent.solid}}/>
          Coming Soon
        </div>
        <div style={{
          fontFamily: TOKENS.serif, fontSize: 18, color: TOKENS.text,
          letterSpacing:-0.3, marginTop: 10, maxWidth: 260, margin:'10px auto 0',
        }}>Join the waitlist and we'll let you know when Outfits ships.</div>
      </div>

      <style>{`
        @keyframes stylesense-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes stylesense-float-top { 0%,100% { transform: translate(-50%, -50%) rotate(-6deg); } 50% { transform: translate(-50%, -54%) rotate(-6deg); } }
      `}</style>
    </div>
  );
}

function OutfitStack({ outfit, accent }) {
  return (
    <div key={outfit.name} style={{
      position:'relative', width: 260, height: 360,
      animation: 'stylesense-fadein 600ms ease',
    }}>
      {/* bottom — shoe */}
      <OutfitCard item={outfit.shoe} style={{
        position:'absolute', bottom: 0, left: '50%',
        transform:'translateX(-50%) rotate(4deg)',
        width: 150, zIndex: 1,
      }}/>
      {/* middle — bottom */}
      <OutfitCard item={outfit.bottom} style={{
        position:'absolute', top: '38%', left: '50%',
        transform:'translate(-50%, -50%) rotate(2deg)',
        width: 180, zIndex: 2,
      }}/>
      {/* top — top */}
      <OutfitCard item={outfit.top} style={{
        position:'absolute', top: 0, left: '50%',
        transform:'translateX(-50%) rotate(-6deg)',
        width: 170, zIndex: 3,
      }} featured accent={accent}/>
    </div>
  );
}

function OutfitCard({ item, style, featured, accent }) {
  return (
    <div style={{
      ...style,
      borderRadius: 16,
      overflow:'hidden',
      boxShadow: featured
        ? `0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px ${accent?.solid || 'rgba(255,255,255,0.1)'}33`
        : '0 15px 30px rgba(0,0,0,0.5)',
      border: `1px solid ${TOKENS.border}`,
      background: TOKENS.surface,
    }}>
      <GarmentTile tone={item.tone} label={item.label} corner={0} showLabel={false}/>
      <div style={{
        padding: '8px 10px', background: TOKENS.surface,
        borderTop:`1px solid ${TOKENS.border}`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 0.8,
          color: TOKENS.textMuted, textTransform:'uppercase',
        }}>{item.cat}</div>
        <ColorDots colors={item.colors} size={7}/>
      </div>
    </div>
  );
}

Object.assign(window, { OutfitsScreen });
