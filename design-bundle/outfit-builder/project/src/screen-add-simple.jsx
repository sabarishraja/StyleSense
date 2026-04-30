// Add Item — Simple variant
// One screen: photo → detected fields inline → save.
// The "analyzing" step is a brief inline animation over the photo on mount.

const { useState: uS_AS, useEffect: uE_AS } = React;

function AddItemSimple({ accent, tweaks, onDone, onCancel }) {
  const [phase, setPhase] = uS_AS('capture'); // 'capture' | 'analyzing' | 'form'
  const [cat, setCat] = uS_AS(DETECTED_ITEM.category);
  const [sub, setSub] = uS_AS(DETECTED_ITEM.sub);
  const [formality, setFormality] = uS_AS(DETECTED_ITEM.formality);
  const [seasons, setSeasons] = uS_AS(new Set(DETECTED_ITEM.seasons));
  const [tags, setTags] = uS_AS(DETECTED_ITEM.tags);

  uE_AS(() => {
    if (phase !== 'analyzing') return;
    const t = setTimeout(()=> setPhase('form'), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  const toggleSeason = (s) => {
    const next = new Set(seasons);
    next.has(s) ? next.delete(s) : next.add(s);
    setSeasons(next);
  };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  const save = () => onDone({ cat, sub, formality, seasons: [...seasons], tags });
  const analyzing = phase === 'analyzing';

  if (phase === 'capture') {
    return (
      <div style={{
        minHeight:'100%', background: TOKENS.bg,
        display:'flex', flexDirection:'column',
      }}>
        {/* Top bar */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: '14px 16px 8px',
        }}>
          <button onClick={onCancel} style={{
            width: 36, height: 36, borderRadius: 12,
            background: TOKENS.surface, border: `1px solid ${TOKENS.border}`,
            color: TOKENS.textMuted, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><Icon.close style={{width:16,height:16}}/></button>
          <div style={{
            fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.5,
            color: TOKENS.textDim, textTransform:'uppercase',
          }}>New Item</div>
          <div style={{width: 36}}/>
        </div>

        {/* Hero */}
        <div style={{
          flex: 1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', textAlign:'center',
          padding: '20px 24px',
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: 28,
            background: accent.soft, border: `1px solid ${accent.solid}40`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color: accent.solid, marginBottom: 28,
          }}>
            <Icon.camera style={{width:44, height:44}}/>
          </div>
          <div style={{
            fontFamily: TOKENS.serif, fontSize: 30, fontWeight: 400,
            color: TOKENS.text, letterSpacing: -0.7, lineHeight: 1.1,
            marginBottom: 10, maxWidth: 280,
          }}>Show Claude the garment.</div>
          <div style={{
            fontFamily: TOKENS.sans, fontSize: 14, color: TOKENS.textMuted,
            maxWidth: 260, lineHeight: 1.5,
          }}>Plain background, good light. One piece at a time.</div>
        </div>

        {/* Buttons */}
        <div style={{padding:'0 20px 28px', display:'flex', flexDirection:'column', gap: 10}}>
          <PrimaryButton accent={accent} icon={<Icon.camera/>} onClick={()=>setPhase('analyzing')}>
            Take Photo
          </PrimaryButton>
          <PrimaryButton accent={accent} variant="ghost" icon={<Icon.library/>} onClick={()=>setPhase('analyzing')}>
            Choose from Library
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100%', background: TOKENS.bg, paddingBottom: 120}}>
      {/* Top bar */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding: '14px 16px 8px',
      }}>
        <button onClick={onCancel} style={{
          width: 36, height: 36, borderRadius: 12,
          background: TOKENS.surface, border: `1px solid ${TOKENS.border}`,
          color: TOKENS.textMuted, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}><Icon.close style={{width:16,height:16}}/></button>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.5,
          color: TOKENS.textDim, textTransform:'uppercase',
        }}>New Item</div>
        <div style={{width: 36}}/>
      </div>

      {/* Hero photo */}
      <div style={{padding: '12px 16px 0'}}>
        <div style={{
          position:'relative', borderRadius: 24, overflow:'hidden',
          border: `1px solid ${TOKENS.border}`,
          aspectRatio: '4/3',
        }}>
          <div style={{
            filter: analyzing ? 'blur(2px) saturate(0.85)' : 'none',
            transition: 'filter 400ms ease',
            height: '100%',
          }}>
            <GarmentTile tone={DETECTED_ITEM.tone} label={DETECTED_ITEM.label} corner={0} showLabel={false}/>
          </div>
          {analyzing && <SimpleAnalyzeOverlay accent={accent}/>}
          {!analyzing && (
            <div style={{
              position:'absolute', left: 12, top: 12,
              display:'inline-flex', alignItems:'center', gap: 6,
              height: 24, padding:'0 10px', borderRadius: TOKENS.rPill,
              background: 'rgba(10,10,10,0.7)',
              backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
              border: `1px solid ${accent.solid}50`,
              color: accent.solid,
              fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
              textTransform:'uppercase', fontWeight: 600,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill="currentColor"/>
              </svg>
              Detected · {Math.round(DETECTED_ITEM.confidence*100)}%
            </div>
          )}
        </div>
      </div>

      {/* Title + category as one editorial block */}
      <div style={{padding: '22px 20px 8px'}}>
        <input
          value={sub}
          onChange={e=>setSub(e.target.value)}
          style={{
            width:'100%', background:'transparent', border:'none', outline:'none',
            color: TOKENS.text,
            fontFamily: TOKENS.serif, fontSize: 30, fontWeight: 400,
            letterSpacing: -0.8, lineHeight: 1.05,
            padding: 0, marginBottom: 8,
          }}
        />
        <div style={{display:'flex', gap: 8, overflowX:'auto', scrollbarWidth:'none'}} className="hide-scrollbar">
          {CATEGORIES.filter(c=>c!=='All').map(c=>(
            <FilterPill key={c} active={cat===c} onClick={()=>setCat(c)} accent={accent}>{c}</FilterPill>
          ))}
        </div>
      </div>

      {/* Compact grouped card: color • formality • seasons */}
      <div style={{padding: '20px 16px 0'}}>
        <div style={{
          background: TOKENS.surface, border: `1px solid ${TOKENS.border}`,
          borderRadius: TOKENS.rCard, overflow:'hidden',
        }}>
          {/* Color */}
          <SimpleRow label="Color">
            <div style={{display:'flex', alignItems:'center', gap: 10}}>
              <div style={{
                width: 22, height: 22, borderRadius: 7,
                background: DETECTED_ITEM.primary.hex,
                border:'1px solid rgba(255,255,255,0.1)',
                boxShadow:'inset 0 1px 0 rgba(255,255,255,0.12)',
              }}/>
              <div style={{fontFamily: TOKENS.sans, fontSize: 14, color: TOKENS.text, letterSpacing:-0.05}}>
                {DETECTED_ITEM.primary.name}
              </div>
            </div>
          </SimpleRow>

          {/* Formality */}
          <SimpleRow label="Formality" sub={['casual','relaxed','polished','sharp','black-tie'][formality-1]}>
            <div style={{display:'flex', gap: 4}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setFormality(n)} style={{
                  width: 22, height: 22, borderRadius:'50%', padding: 0,
                  border: n <= formality ? 'none' : `1px solid ${TOKENS.border}`,
                  background: n <= formality ? accent.solid : 'transparent',
                  cursor:'pointer', transition:'all 160ms ease',
                }} aria-label={`Formality ${n}`}/>
              ))}
            </div>
          </SimpleRow>

          {/* Seasons */}
          <SimpleRow label="Seasons" last>
            <div style={{display:'flex', gap: 6, flexWrap:'wrap', justifyContent:'flex-end'}}>
              {['Spring','Summer','Fall','Winter'].map(s=>{
                const active = seasons.has(s);
                return (
                  <button key={s} onClick={()=>toggleSeason(s)} style={{
                    height: 26, padding: '0 10px',
                    borderRadius: TOKENS.rPill,
                    background: active ? accent.soft : 'transparent',
                    border: `1px solid ${active ? accent.solid : TOKENS.border}`,
                    color: active ? accent.solid : TOKENS.textMuted,
                    fontFamily: TOKENS.sans, fontSize: 11, fontWeight: active ? 600 : 500,
                    cursor:'pointer', letterSpacing:-0.02,
                  }}>{s}</button>
                );
              })}
            </div>
          </SimpleRow>
        </div>
      </div>

      {/* Tags — quiet, below the fold */}
      <div style={{padding: '18px 20px 0'}}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.5,
          color: TOKENS.textMuted, textTransform:'uppercase', marginBottom: 10,
        }}>Tags · tap to remove</div>
        <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
          {tags.map(t=>(
            <button key={t} onClick={()=>removeTag(t)} style={{
              display:'inline-flex', alignItems:'center', gap: 6,
              height: 28, padding:'0 12px',
              borderRadius: TOKENS.rPill,
              background: TOKENS.surface, border: `1px solid ${TOKENS.border}`,
              color: TOKENS.textMuted, cursor:'pointer',
              fontFamily: TOKENS.sans, fontSize: 12,
            }}>
              {t}
              <Icon.close style={{width:10, height:10, opacity:0.5}}/>
            </button>
          ))}
        </div>
      </div>

      {/* Sticky save */}
      <div style={{
        position:'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 28px',
        background: `linear-gradient(to bottom, transparent, ${TOKENS.bg} 40%)`,
      }}>
        <PrimaryButton accent={accent} onClick={save}>
          Save to Closet
        </PrimaryButton>
      </div>
    </div>
  );
}

function SimpleRow({ label, sub, children, last }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12,
      padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${TOKENS.borderSoft}`,
    }}>
      <div>
        <div style={{
          fontFamily: TOKENS.sans, fontSize: 13, color: TOKENS.text,
          letterSpacing:-0.05, fontWeight: 500,
        }}>{label}</div>
        {sub && (
          <div style={{
            fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
            color: TOKENS.textDim, textTransform:'uppercase', marginTop: 2,
          }}>{sub}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function SimpleAnalyzeOverlay({ accent }) {
  return (
    <>
      <style>{`
        @keyframes stylesense-simple-scan { 0%{top:0} 100%{top:100%} }
        @keyframes stylesense-simple-pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>
      <div style={{
        position:'absolute', left:0, right:0, height: 2,
        background: `linear-gradient(to bottom, transparent, ${accent.solid}, transparent)`,
        boxShadow: `0 0 24px ${accent.solid}`,
        animation: 'stylesense-simple-scan 1.6s ease-in-out infinite alternate',
      }}/>
      <div style={{
        position:'absolute', left:'50%', bottom: 14,
        transform:'translateX(-50%)',
        display:'inline-flex', alignItems:'center', gap: 8,
        height: 28, padding:'0 14px', borderRadius: TOKENS.rPill,
        background: 'rgba(10,10,10,0.75)',
        backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
        border: `1px solid ${TOKENS.border}`,
        color: TOKENS.text,
        fontFamily: TOKENS.sans, fontSize: 12, letterSpacing:-0.05,
        animation: 'stylesense-simple-pulse 1.4s ease-in-out infinite',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius:'50%', background: accent.solid,
        }}/>
        Claude is analyzing…
      </div>
    </>
  );
}

Object.assign(window, { AddItemSimple });
