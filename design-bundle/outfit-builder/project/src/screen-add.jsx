// Add Item — 3-step flow: Capture → Analyzing → Review

const { useState: uS_A, useEffect: uE_A } = React;

// ═════════════════════════════════════════════════════════════
// STEP 1 — CAPTURE
// ═════════════════════════════════════════════════════════════
function StepCapture({ accent, onNext }) {
  return (
    <div style={{
      minHeight: '100%', background: TOKENS.bg,
      padding: '20px 20px 40px',
      display:'flex', flexDirection:'column',
    }}>
      {/* Progress rail */}
      <StepRail step={1} accent={accent}/>

      {/* Hero */}
      <div style={{
        flex: 1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', textAlign:'center',
        padding: '20px 0 40px',
      }}>
        {/* Editorial frame */}
        <div style={{
          width: 180, height: 220,
          background: TOKENS.surface,
          border: `1px solid ${TOKENS.border}`,
          borderRadius: 24,
          position: 'relative',
          display:'flex', alignItems:'center', justifyContent:'center',
          marginBottom: 32,
        }}>
          {/* Corner marks — editorial registration marks */}
          {[[8,8,'tl'],[8,8,'tr'],[8,8,'bl'],[8,8,'br']].map(([x,y,k],i)=>{
            const pos = {
              tl: {top:10,left:10, borderTop:`1.5px solid ${accent.solid}`, borderLeft:`1.5px solid ${accent.solid}`},
              tr: {top:10,right:10, borderTop:`1.5px solid ${accent.solid}`, borderRight:`1.5px solid ${accent.solid}`},
              bl: {bottom:10,left:10, borderBottom:`1.5px solid ${accent.solid}`, borderLeft:`1.5px solid ${accent.solid}`},
              br: {bottom:10,right:10, borderBottom:`1.5px solid ${accent.solid}`, borderRight:`1.5px solid ${accent.solid}`},
            }[k];
            return <div key={i} style={{position:'absolute', width:14, height:14, ...pos}}/>;
          })}
          <Icon.camera style={{color: accent.solid, width: 36, height: 36}}/>
        </div>

        <div style={{
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.5,
          color: accent.solid, textTransform:'uppercase', marginBottom: 8,
        }}>Step 01 · Capture</div>
        <div style={{
          fontFamily: TOKENS.serif, fontSize: 30, fontWeight: 400,
          color: TOKENS.text, letterSpacing: -0.7, lineHeight: 1.1, marginBottom: 12,
          maxWidth: 280,
        }}>Show Claude the garment.</div>
        <div style={{
          fontFamily: TOKENS.sans, fontSize: 14, color: TOKENS.textMuted,
          maxWidth: 280, lineHeight: 1.5,
        }}>Plain background, good light. One piece at a time.</div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 12}}>
        <PrimaryButton accent={accent} onClick={onNext} icon={<Icon.camera/>}>
          Take Photo
        </PrimaryButton>
        <PrimaryButton accent={accent} onClick={onNext} icon={<Icon.library/>} variant="ghost">
          Choose from Library
        </PrimaryButton>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// STEP 2 — ANALYZING (animation style varies)
// ═════════════════════════════════════════════════════════════
function StepAnalyzing({ accent, onComplete, animStyle }) {
  const [progress, setP] = uS_A(0);

  uE_A(() => {
    const start = Date.now();
    const DURATION = 3800;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start)/DURATION);
      setP(t);
      if (t < 1) requestAnimationFrame(tick);
      else setTimeout(onComplete, 400);
    };
    const r = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <div style={{
      minHeight: '100%', background: TOKENS.bg,
      padding: '20px 20px 40px',
      display:'flex', flexDirection:'column',
    }}>
      <StepRail step={2} accent={accent}/>

      {/* Photo preview with overlay animation */}
      <div style={{
        margin: '24px auto 0',
        width: '100%', maxWidth: 320,
        position:'relative',
        borderRadius: 24,
        overflow:'hidden',
        border: `1px solid ${TOKENS.border}`,
      }}>
        <div style={{filter:'blur(2px) saturate(0.85)', opacity: 0.75}}>
          <GarmentTile tone={DETECTED_ITEM.tone} label={DETECTED_ITEM.label} corner={0}/>
        </div>
        <div style={{position:'absolute', inset: 0}}>
          {animStyle === 'scan' && <ScanAnim accent={accent}/>}
          {animStyle === 'checklist' && <ShimmerAnim accent={accent} progress={progress}/>}
          {animStyle === 'minimal' && <MinimalAnim accent={accent}/>}
        </div>
      </div>

      {/* Status */}
      <div style={{marginTop: 28, textAlign:'center'}}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.5,
          color: accent.solid, textTransform:'uppercase', marginBottom: 8,
        }}>Step 02 · Analyzing</div>
        {animStyle === 'checklist' ? (
          <StatusChecklist progress={progress}/>
        ) : (
          <AnalysisTicker accent={accent}/>
        )}
      </div>

      <div style={{flex: 1}}/>

      {/* Progress bar */}
      <div style={{
        height: 2, width: '100%', background: TOKENS.surface,
        borderRadius: 1, overflow:'hidden',
      }}>
        <div style={{
          height: '100%', background: accent.solid,
          width: `${progress * 100}%`,
          transition: 'width 100ms linear',
        }}/>
      </div>
      <div style={{
        marginTop: 8, display:'flex', justifyContent:'space-between',
        fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1,
        color: TOKENS.textDim, textTransform:'uppercase',
      }}>
        <span>Claude Sonnet 4.6</span>
        <span>{Math.round(progress*100)}%</span>
      </div>
    </div>
  );
}

// Analyzing animations -------------------------------------------------

function ScanAnim({ accent }) {
  return (
    <>
      <style>{`
        @keyframes stylesense-scan { 0%{top:0} 100%{top:100%} }
      `}</style>
      <div style={{
        position:'absolute', left:0, right:0, height: 2,
        background: `linear-gradient(to bottom, transparent, ${accent.solid}, transparent)`,
        boxShadow: `0 0 24px ${accent.solid}`,
        animation: 'stylesense-scan 1.8s ease-in-out infinite alternate',
      }}/>
      {/* corner reticles */}
      {['tl','tr','bl','br'].map(k=>{
        const pos = {
          tl: {top:12,left:12, borderTop:`1.5px solid ${accent.solid}`, borderLeft:`1.5px solid ${accent.solid}`},
          tr: {top:12,right:12, borderTop:`1.5px solid ${accent.solid}`, borderRight:`1.5px solid ${accent.solid}`},
          bl: {bottom:12,left:12, borderBottom:`1.5px solid ${accent.solid}`, borderLeft:`1.5px solid ${accent.solid}`},
          br: {bottom:12,right:12, borderBottom:`1.5px solid ${accent.solid}`, borderRight:`1.5px solid ${accent.solid}`},
        }[k];
        return <div key={k} style={{position:'absolute', width:18, height:18, ...pos}}/>;
      })}
    </>
  );
}

function ShimmerAnim({ accent }) {
  return (
    <>
      <style>{`
        @keyframes stylesense-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div style={{
        position:'absolute', inset:0, overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', inset: 0,
          background: `linear-gradient(110deg, transparent 40%, ${accent.solid}25 50%, transparent 60%)`,
          animation: 'stylesense-shimmer 2.2s ease-in-out infinite',
        }}/>
      </div>
    </>
  );
}

function MinimalAnim({ accent }) {
  return (
    <div style={{
      position:'absolute', top:'50%', left:'50%',
      transform:'translate(-50%,-50%)',
    }}>
      <style>{`
        @keyframes stylesense-spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{
        width: 36, height: 36, borderRadius:'50%',
        border: `2px solid rgba(255,255,255,0.1)`,
        borderTopColor: accent.solid,
        animation: 'stylesense-spin 0.9s linear infinite',
      }}/>
    </div>
  );
}

function AnalysisTicker({ accent }) {
  const msgs = [
    'Detecting category…',
    'Reading colors…',
    'Assessing formality…',
    'Matching seasons…',
  ];
  const [i, setI] = uS_A(0);
  uE_A(() => {
    const t = setInterval(()=> setI(x => (x+1) % msgs.length), 950);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      fontFamily: TOKENS.serif, fontSize: 22, fontWeight: 400,
      color: TOKENS.text, letterSpacing: -0.3, lineHeight: 1.3,
      minHeight: 60, maxWidth: 280, margin: '0 auto',
    }}>{msgs[i]}</div>
  );
}

function StatusChecklist({ progress }) {
  const items = [
    { label: 'Category', t: 0.25 },
    { label: 'Primary color', t: 0.45 },
    { label: 'Secondary palette', t: 0.65 },
    { label: 'Formality & seasons', t: 0.85 },
  ];
  return (
    <div style={{
      maxWidth: 260, margin: '0 auto',
      display:'flex', flexDirection:'column', gap: 10,
      textAlign:'left',
    }}>
      {items.map((it, i) => {
        const done = progress > it.t;
        return (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap: 10,
            opacity: progress > it.t - 0.15 ? 1 : 0.4,
            transition:'opacity 200ms ease',
          }}>
            <div style={{
              width: 16, height: 16, borderRadius:'50%',
              border: `1px solid ${done ? ACCENTS.gold.solid : TOKENS.border}`,
              background: done ? ACCENTS.gold.solid : 'transparent',
              color: '#0A0A0A',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink: 0,
            }}>
              {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{
              fontFamily: TOKENS.sans, fontSize: 13,
              color: done ? TOKENS.text : TOKENS.textMuted,
              letterSpacing: -0.05,
            }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// STEP 3 — REVIEW
// ═════════════════════════════════════════════════════════════
function StepReview({ accent, onCancel, onSave }) {
  const [cat, setCat] = uS_A(DETECTED_ITEM.category);
  const [sub, setSub] = uS_A(DETECTED_ITEM.sub);
  const [formality, setFormality] = uS_A(DETECTED_ITEM.formality);
  const [seasons, setSeasons] = uS_A(new Set(DETECTED_ITEM.seasons));
  const [tags, setTags] = uS_A(DETECTED_ITEM.tags);
  const [newTag, setNewTag] = uS_A('');

  const toggleSeason = (s) => {
    const next = new Set(seasons);
    next.has(s) ? next.delete(s) : next.add(s);
    setSeasons(next);
  };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));
  const addTag = () => {
    if (newTag.trim()) { setTags([...tags, newTag.trim()]); setNewTag(''); }
  };

  const conf = DETECTED_ITEM.confidence;
  const confColor = conf > 0.85 ? TOKENS.success : conf > 0.6 ? '#E0B857' : TOKENS.error;

  return (
    <div style={{minHeight: '100%', background: TOKENS.bg, paddingBottom: 120}}>
      <div style={{padding: '20px 20px 0'}}>
        <StepRail step={3} accent={accent}/>
      </div>

      {/* Photo thumb + confidence */}
      <div style={{padding: '20px 20px 0', display:'flex', gap: 14, alignItems:'center'}}>
        <div style={{width: 84, height: 84, flexShrink:0}}>
          <GarmentTile tone={DETECTED_ITEM.tone} label="" showLabel={false} corner={16}/>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{
            fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.5,
            color: accent.solid, textTransform:'uppercase', marginBottom: 4,
          }}>Step 03 · Review</div>
          <div style={{
            fontFamily: TOKENS.serif, fontSize: 22, fontWeight: 400,
            color: TOKENS.text, letterSpacing: -0.4, lineHeight: 1.1, marginBottom: 8,
          }}>Claude's take</div>
          <div style={{
            display:'flex', alignItems:'center', gap: 6,
            fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 0.5,
            color: TOKENS.textMuted,
          }}>
            <div style={{
              flex: 1, height: 3, borderRadius: 2,
              background: TOKENS.surface, overflow:'hidden',
            }}>
              <div style={{ width: `${conf*100}%`, height:'100%', background: confColor}}/>
            </div>
            <span style={{color: confColor, fontWeight: 600}}>{Math.round(conf*100)}%</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{padding: '28px 20px 0', display:'flex', flexDirection:'column', gap: 28}}>

        {/* Category */}
        <ReviewBlock label="Category">
          <div style={{display:'flex', gap: 8, overflowX:'auto', scrollbarWidth:'none'}} className="hide-scrollbar">
            {CATEGORIES.filter(c=>c!=='All').map(c=>(
              <FilterPill key={c} active={cat===c} onClick={()=>setCat(c)} accent={accent}>{c}</FilterPill>
            ))}
          </div>
        </ReviewBlock>

        {/* Subcategory */}
        <ReviewBlock label="Subcategory">
          <input
            value={sub}
            onChange={e=>setSub(e.target.value)}
            style={{
              width:'100%', background: TOKENS.surface,
              border: `1px solid ${TOKENS.border}`, borderRadius: TOKENS.rInput,
              color: TOKENS.text, padding: '14px 16px',
              fontFamily: TOKENS.sans, fontSize: 15, letterSpacing:-0.1,
              outline:'none',
            }}
          />
        </ReviewBlock>

        {/* Colors */}
        <ReviewBlock label="Colors">
          <div style={{
            background: TOKENS.surface, border:`1px solid ${TOKENS.border}`,
            borderRadius: TOKENS.rInput, padding: 14,
            display:'flex', flexDirection:'column', gap: 10,
          }}>
            <ColorRow swatch={DETECTED_ITEM.primary.hex} name={DETECTED_ITEM.primary.name} hex={DETECTED_ITEM.primary.hex} primary/>
            {DETECTED_ITEM.secondary.map((c,i)=>(
              <ColorRow key={i} swatch={c.hex} name={c.name} hex={c.hex}/>
            ))}
          </div>
        </ReviewBlock>

        {/* Formality */}
        <ReviewBlock label="Formality" right={<span style={{color: TOKENS.textMuted, fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1, textTransform:'uppercase'}}>{['casual','relaxed','polished','sharp','black-tie'][formality-1]}</span>}>
          <div style={{display:'flex', gap: 8}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setFormality(n)} style={{
                flex: 1, height: 48,
                borderRadius: 14,
                background: n <= formality ? accent.soft : TOKENS.surface,
                border: `1px solid ${n <= formality ? accent.solid : TOKENS.border}`,
                color: n <= formality ? accent.solid : TOKENS.textDim,
                cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily: TOKENS.serif, fontSize: 18, fontWeight: 400,
                transition:'all 160ms ease',
              }}>{n}</button>
            ))}
          </div>
        </ReviewBlock>

        {/* Seasons */}
        <ReviewBlock label="Seasons">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
            {['Spring','Summer','Fall','Winter','All'].map(s=>{
              const active = seasons.has(s);
              return (
                <button key={s} onClick={()=>toggleSeason(s)} style={{
                  height: 44, borderRadius: 14,
                  background: active ? accent.soft : TOKENS.surface,
                  border: `1px solid ${active ? accent.solid : TOKENS.border}`,
                  color: active ? accent.solid : TOKENS.textMuted,
                  fontFamily: TOKENS.sans, fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor:'pointer', letterSpacing:-0.05,
                  gridColumn: s==='All' ? 'span 2' : undefined,
                }}>{s}</button>
              );
            })}
          </div>
        </ReviewBlock>

        {/* Tags */}
        <ReviewBlock label="Tags">
          <div style={{
            background: TOKENS.surface, border:`1px solid ${TOKENS.border}`,
            borderRadius: TOKENS.rInput, padding: 12,
            display:'flex', flexWrap:'wrap', gap: 6, alignItems:'center',
          }}>
            {tags.map(t=>(
              <div key={t} style={{
                display:'inline-flex', alignItems:'center', gap: 4,
                height: 28, padding:'0 6px 0 10px',
                borderRadius: TOKENS.rPill,
                background: TOKENS.surface2,
                border: `1px solid ${TOKENS.border}`,
                color: TOKENS.text,
                fontFamily: TOKENS.sans, fontSize: 12,
              }}>
                {t}
                <button onClick={()=>removeTag(t)} style={{
                  width: 18, height: 18, borderRadius:'50%',
                  background:'transparent', border:'none', cursor:'pointer',
                  color: TOKENS.textDim,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}><Icon.close style={{width:10, height:10}}/></button>
              </div>
            ))}
            <input
              value={newTag}
              onChange={e=>setNewTag(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(); }}}
              placeholder="+ Add tag"
              style={{
                flex: 1, minWidth: 80, height: 28,
                border:'none', background:'transparent',
                color: TOKENS.text, outline:'none',
                fontFamily: TOKENS.sans, fontSize: 12,
              }}
            />
          </div>
        </ReviewBlock>
      </div>

      {/* Sticky footer */}
      <div style={{
        position:'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 28px',
        background: `linear-gradient(to bottom, transparent, ${TOKENS.bg} 40%)`,
        display:'flex', gap: 10,
      }}>
        <button onClick={onCancel} style={{
          flex: 1, height: 52, borderRadius: TOKENS.rButton,
          background: 'transparent', border: `1px solid ${TOKENS.border}`,
          color: TOKENS.textMuted,
          fontFamily: TOKENS.sans, fontSize: 15, fontWeight: 500, letterSpacing:-0.1,
          cursor:'pointer',
        }}>Cancel</button>
        <div style={{flex: 2}}>
          <PrimaryButton accent={accent} onClick={()=>onSave({cat, sub, formality, seasons:[...seasons], tags})}>
            Save to Closet
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function ReviewBlock({ label, right, children }) {
  return (
    <div>
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom: 10,
      }}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.5,
          color: TOKENS.textMuted, textTransform:'uppercase',
        }}>{label}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function ColorRow({ swatch, name, hex, primary }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: 12}}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: swatch,
        border:'1px solid rgba(255,255,255,0.1)',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.12)',
      }}/>
      <div style={{flex:1}}>
        <div style={{fontFamily: TOKENS.sans, fontSize: 14, color: TOKENS.text, letterSpacing:-0.1}}>
          {name}
          {primary && <span style={{color: TOKENS.textDim, marginLeft: 6, fontSize: 11}}>· primary</span>}
        </div>
        <div style={{fontFamily: TOKENS.mono, fontSize: 10, color: TOKENS.textDim, letterSpacing: 0.5}}>{hex.toUpperCase()}</div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Step rail (shared)
// ═════════════════════════════════════════════════════════════
function StepRail({ step, accent }) {
  return (
    <div style={{display:'flex', gap: 6, marginBottom: 4}}>
      {[1,2,3].map(n=>(
        <div key={n} style={{
          flex: 1, height: 2, borderRadius: 1,
          background: n <= step ? accent.solid : TOKENS.surface,
          transition: 'background 300ms ease',
        }}/>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Orchestrator
// ═════════════════════════════════════════════════════════════
function AddItemFlow({ accent, tweaks, onDone, onCancel }) {
  const [step, setStep] = uS_A(1);

  return (
    <>
      {step === 1 && <StepCapture accent={accent} onNext={()=>setStep(2)}/>}
      {step === 2 && <StepAnalyzing accent={accent} animStyle={tweaks.analyzing} onComplete={()=>setStep(3)}/>}
      {step === 3 && <StepReview accent={accent} onCancel={onCancel} onSave={(data)=>onDone(data)}/>}
    </>
  );
}

Object.assign(window, { AddItemFlow });
