// Profile screen

function ProfileScreen({ accent, onSignOut, platform }) {
  return (
    <div style={{
      minHeight: '100%', background: TOKENS.bg,
      padding: '8px 20px 40px',
    }}>
      {/* Header */}
      <div style={{marginBottom: 28}}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.5,
          color: accent.solid, textTransform:'uppercase', marginBottom: 4,
        }}>Account</div>
        <div style={{
          fontFamily: TOKENS.serif, fontSize: 34, fontWeight: 400,
          color: TOKENS.text, letterSpacing: -0.9, lineHeight: 1.0,
        }}>Profile</div>
      </div>

      {/* Avatar + identity card */}
      <div style={{
        background: TOKENS.surface, border: `1px solid ${TOKENS.border}`,
        borderRadius: TOKENS.rCard, padding: 20,
        display:'flex', alignItems:'center', gap: 16, marginBottom: 16,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius:'50%',
          background: accent.soft,
          border: `1px solid ${accent.solid}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color: accent.solid,
          fontFamily: TOKENS.serif, fontSize: 24, fontWeight: 500, letterSpacing:-0.5,
          flexShrink: 0,
        }}>AR</div>
        <div style={{flex:1, minWidth: 0}}>
          <div style={{
            fontFamily: TOKENS.serif, fontSize: 20, fontWeight: 400,
            color: TOKENS.text, letterSpacing: -0.3, lineHeight: 1.1,
            marginBottom: 4,
          }}>Alex Rowan</div>
          <div style={{
            fontFamily: TOKENS.sans, fontSize: 13, color: TOKENS.textMuted,
            letterSpacing:-0.05, marginBottom: 4, whiteSpace:'nowrap',
            overflow:'hidden', textOverflow:'ellipsis',
          }}>alex@stylesense.app</div>
          <div style={{
            fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
            color: TOKENS.textDim, textTransform:'uppercase',
          }}>Member since Feb 2025</div>
        </div>
      </div>

      {/* Stats mini-row (adds character) */}
      <div style={{
        display:'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24,
      }}>
        {[
          { k:'Items', v:'12' },
          { k:'Outfits', v:'—' },
          { k:'Added this wk', v:'3' },
        ].map((s, i) => (
          <div key={i} style={{
            background: TOKENS.surface, border: `1px solid ${TOKENS.border}`,
            borderRadius: 14, padding: '14px 12px',
          }}>
            <div style={{
              fontFamily: TOKENS.serif, fontSize: 24, fontWeight: 400,
              color: TOKENS.text, letterSpacing:-0.4, lineHeight: 1,
            }}>{s.v}</div>
            <div style={{
              fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
              color: TOKENS.textDim, textTransform:'uppercase', marginTop: 4,
            }}>{s.k}</div>
          </div>
        ))}
      </div>

      {/* Info rows */}
      <SectionLabel>About</SectionLabel>
      <InfoGroup>
        <InfoRow label="App Version" value="1.0.0"/>
        <InfoRow label="AI Model" value="Claude Sonnet 4.6"/>
        <InfoRow label="Location" value="Brooklyn, NY"/>
        <InfoRow label="Storage" value="124 MB" last/>
      </InfoGroup>

      <div style={{height: 20}}/>

      <SectionLabel>Preferences</SectionLabel>
      <InfoGroup>
        <InfoRow label="Notifications" value="On"/>
        <InfoRow label="Auto-tag" value="Enabled"/>
        <InfoRow label="Units" value="Metric" last/>
      </InfoGroup>

      <div style={{height: 28}}/>

      {/* Sign out */}
      <button onClick={onSignOut} style={{
        width:'100%', height: 52,
        borderRadius: TOKENS.rButton,
        background:'transparent',
        border: `1px solid rgba(239,83,80,0.35)`,
        color: TOKENS.error,
        fontFamily: TOKENS.sans, fontSize: 15, fontWeight: 600, letterSpacing:-0.1,
        cursor:'pointer',
      }}>Sign Out</button>

      {/* Footer */}
      <div style={{
        textAlign:'center', marginTop: 28,
        fontFamily: TOKENS.serif, fontStyle:'italic', fontSize: 16,
        color: TOKENS.textDim, letterSpacing:-0.2,
      }}>StyleSense</div>
      <div style={{
        textAlign:'center', marginTop: 6,
        fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
        color: TOKENS.textDim, textTransform:'uppercase',
      }}>Built with Expo · Supabase · Claude</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.5,
      color: TOKENS.textMuted, textTransform:'uppercase',
      marginBottom: 10, paddingLeft: 4,
    }}>{children}</div>
  );
}

function InfoGroup({ children }) {
  return (
    <div style={{
      background: TOKENS.surface, border: `1px solid ${TOKENS.border}`,
      borderRadius: TOKENS.rCard, overflow:'hidden',
    }}>{children}</div>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${TOKENS.borderSoft}`,
    }}>
      <div style={{
        fontFamily: TOKENS.sans, fontSize: 14, color: TOKENS.text, letterSpacing:-0.05,
      }}>{label}</div>
      <div style={{
        fontFamily: TOKENS.sans, fontSize: 14, color: TOKENS.textMuted, letterSpacing:-0.05,
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, { ProfileScreen });
