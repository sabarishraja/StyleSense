// App shell — bottom nav, state, screen orchestration

const { useState: uS_S, useEffect: uE_S } = React;

// ─────────────────────────────────────────────────────────────
// Bottom nav (4 tabs, Add emphasized)
// ─────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab, accent, platform }) {
  const tabs = [
    { id: 'closet',   icon: Icon.home,    label: 'Closet' },
    { id: 'add',      icon: Icon.plus,    label: 'Add',    emphasis: true },
    { id: 'outfits',  icon: Icon.sparkle, label: 'Outfits' },
    { id: 'profile',  icon: Icon.user,    label: 'Profile' },
  ];

  const bottomOffset = platform === 'ios' ? 34 : 24;

  return (
    <div style={{
      position:'absolute', left: 0, right: 0,
      bottom: bottomOffset,
      padding: '0 12px',
      zIndex: 55,
      pointerEvents: 'none',
    }}>
      <div style={{
        height: 64,
        background: 'rgba(20,20,20,0.82)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: `1px solid ${TOKENS.border}`,
        borderRadius: 24,
        display:'flex', alignItems:'center', justifyContent:'space-around',
        padding: '0 8px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        pointerEvents: 'auto',
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          const Ico = t.icon;
          if (t.emphasis) {
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                width: 48, height: 48, borderRadius: 16,
                background: accent.solid,
                color: accent.ink,
                border: 'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: `0 4px 12px ${accent.solid}40`,
                transition:'transform 150ms ease',
              }}
              onMouseDown={e=>e.currentTarget.style.transform='scale(0.94)'}
              onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
              >
                <Ico style={{width:22, height:22}}/>
              </button>
            );
          }
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap: 2,
              background:'transparent', border:'none', cursor:'pointer',
              padding: '6px 12px',
              color: active ? accent.solid : TOKENS.textDim,
              transition:'color 160ms ease',
            }}>
              <Ico style={{width:22, height:22}}/>
              <div style={{
                fontFamily: TOKENS.sans, fontSize: 9,
                fontWeight: active ? 600 : 500, letterSpacing: 0.3,
              }}>{t.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// App (one per device)
// ─────────────────────────────────────────────────────────────
function StyleSenseApp({ platform, tweaks, accent }) {
  const [authed, setAuthed] = uS_S(true);
  const [tab, setTab] = uS_S('closet');
  const [addFlowActive, setAddFlowActive] = uS_S(false);
  const [wardrobe, setWardrobe] = uS_S(() => tweaks.populated ? WARDROBE : []);
  const [toast, setToast] = uS_S(null);

  // Sync wardrobe to populated toggle
  uE_S(() => {
    setWardrobe(tweaks.populated ? WARDROBE : []);
  }, [tweaks.populated]);

  // Add flow activated when Add tab is tapped
  uE_S(() => {
    if (tab === 'add') { setAddFlowActive(true); }
  }, [tab]);

  const exitAdd = () => { setAddFlowActive(false); setTab('closet'); };
  const onAddDone = (data) => {
    const newItem = {
      id: Date.now(),
      cat: data.cat, sub: data.sub,
      colors: [DETECTED_ITEM.primary.hex, ...DETECTED_ITEM.secondary.map(c=>c.hex)],
      formality: data.formality, seasons: data.seasons, tags: data.tags,
      tone: DETECTED_ITEM.tone, label: DETECTED_ITEM.label,
    };
    setWardrobe([newItem, ...wardrobe]);
    setAddFlowActive(false); setTab('closet');
    setToast(`Added "${data.sub}" to your closet.`);
    setTimeout(()=> setToast(null), 2400);
  };

  if (!authed) {
    return <div style={{minHeight:'100%', paddingTop: platform === 'ios' ? 54 : 0}}><LoginScreen accent={accent} onEnter={()=>setAuthed(true)}/></div>;
  }

  // In add flow, show it full-screen
  if (addFlowActive) {
    return (
    <div style={{position:'relative', minHeight:'100%', paddingTop: platform === 'ios' ? 54 : 0}}>
      {tweaks.addFlow === 'simple' ? (
        <AddItemSimple
          accent={accent} tweaks={tweaks}
          onDone={onAddDone} onCancel={exitAdd}
        />
      ) : (
        <AddItemFlow
          accent={accent} tweaks={tweaks}
          onDone={onAddDone} onCancel={exitAdd}
        />
      )}
      </div>
    );
  }

  return (
    <div style={{position:'relative', minHeight:'100%', paddingBottom: 120, paddingTop: platform === 'ios' ? 54 : 0}}>
      {tab === 'closet' && (
        <ClosetScreen
          tweaks={tweaks} accent={accent} platform={platform}
          wardrobe={wardrobe}
          onAdd={()=>{ setTab('add'); }}
        />
      )}
      {tab === 'outfits' && <OutfitsScreen accent={accent} wardrobe={WARDROBE}/>}
      {tab === 'profile' && <ProfileScreen accent={accent} onSignOut={()=>setAuthed(false)}/>}

      <BottomNav tab={tab} setTab={setTab} accent={accent} platform={platform}/>

      {toast && (
        <div style={{
          position:'absolute', top: 16, left: 16, right: 16,
          zIndex: 100,
          background: TOKENS.surface, border: `1px solid ${accent.solid}60`,
          borderRadius: 14, padding: '12px 14px',
          display:'flex', alignItems:'center', gap: 10,
          boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
          animation: 'stylesense-fadein 260ms ease',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius:'50%',
            background: accent.soft, color: accent.solid,
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink: 0,
          }}><Icon.check style={{width:14, height:14}}/></div>
          <div style={{
            flex:1, fontFamily: TOKENS.sans, fontSize: 13, color: TOKENS.text,
            letterSpacing:-0.05,
          }}>{toast}</div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { StyleSenseApp, BottomNav });
