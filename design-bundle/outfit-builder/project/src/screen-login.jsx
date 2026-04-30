// Login / Signup screen

const { useState: uS_L } = React;

function LoginScreen({ accent, onEnter }) {
  const [mode, setMode] = uS_L('signin'); // 'signin' | 'signup'
  const [email, setEmail] = uS_L('alex@stylesense.app');
  const [pwd, setPwd] = uS_L('••••••••••');
  const [error, setError] = uS_L(null);

  const submit = () => {
    if (!email.includes('@')) { setError("That email doesn't look right."); return; }
    onEnter();
  };

  return (
    <div style={{
      minHeight: '100%', background: TOKENS.bg,
      padding: '60px 24px 32px',
      display:'flex', flexDirection:'column',
    }}>
      {/* Logo + tagline */}
      <div style={{textAlign:'center', marginBottom: 56}}>
        <div style={{
          width: 56, height: 56, margin: '0 auto 20px',
          borderRadius: 18,
          border: `1px solid ${accent.solid}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color: accent.solid,
          background: accent.soft,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l2.5 6L21 10l-5 4.5L17.5 21 12 17.5 6.5 21 8 14.5 3 10l6.5-1L12 3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{
          fontFamily: TOKENS.serif, fontSize: 40, fontWeight: 400,
          color: TOKENS.text, letterSpacing: -1.2, lineHeight: 1,
        }}>StyleSense</div>
        <div style={{
          fontFamily: TOKENS.sans, fontSize: 13, color: TOKENS.textMuted,
          marginTop: 12, letterSpacing: 0.2,
        }}>Your AI-powered wardrobe.</div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background:'rgba(239,83,80,0.1)', border:`1px solid rgba(239,83,80,0.35)`,
          borderRadius: 14, padding:'10px 14px', marginBottom: 14,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
        }}>
          <div style={{
            fontFamily: TOKENS.sans, fontSize: 13, color: TOKENS.error, letterSpacing:-0.05,
          }}>{error}</div>
          <button onClick={()=>setError(null)} style={{
            background:'transparent', border:'none', color: TOKENS.error,
            cursor:'pointer', display:'flex',
          }}><Icon.close style={{width:14,height:14}}/></button>
        </div>
      )}

      {/* Form */}
      <div style={{display:'flex', flexDirection:'column', gap: 12}}>
        <FieldInput label="Email" value={email} onChange={setEmail} type="email"/>
        <FieldInput label="Password" value={pwd} onChange={setPwd} type="password"/>
      </div>

      <div style={{height: 20}}/>

      <PrimaryButton accent={accent} onClick={submit}>
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </PrimaryButton>

      <div style={{
        marginTop: 20, textAlign:'center',
        fontFamily: TOKENS.sans, fontSize: 13, color: TOKENS.textMuted, letterSpacing:-0.05,
      }}>
        {mode === 'signin' ? 'New here?' : 'Already have an account?'}
        <button onClick={()=>setMode(m => m==='signin' ? 'signup' : 'signin')} style={{
          background:'transparent', border:'none', cursor:'pointer',
          color: accent.solid, fontWeight: 600, marginLeft: 6,
          fontFamily: TOKENS.sans, fontSize: 13, letterSpacing:-0.05,
        }}>
          {mode === 'signin' ? 'Create account' : 'Sign in'}
        </button>
      </div>

      <div style={{flex: 1}}/>

      <div style={{
        textAlign:'center',
        fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.5,
        color: TOKENS.textDim, textTransform:'uppercase',
      }}>v1.0 · Expo · Supabase · Claude</div>
    </div>
  );
}

function FieldInput({ label, value, onChange, type='text' }) {
  return (
    <label style={{display:'block'}}>
      <div style={{
        fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.5,
        color: TOKENS.textMuted, textTransform:'uppercase', marginBottom: 6, paddingLeft: 4,
      }}>{label}</div>
      <input
        type={type === 'password' ? 'text' : type}
        value={value}
        onChange={e=>onChange(e.target.value)}
        style={{
          width:'100%', boxSizing:'border-box',
          background: TOKENS.surface, border: `1px solid ${TOKENS.border}`,
          borderRadius: TOKENS.rInput,
          color: TOKENS.text,
          padding: '16px 18px',
          fontFamily: TOKENS.sans, fontSize: 15, letterSpacing:-0.1,
          outline:'none',
        }}
        onFocus={e=>e.target.style.borderColor = TOKENS.textMuted}
        onBlur={e=>e.target.style.borderColor = TOKENS.border}
      />
    </label>
  );
}

Object.assign(window, { LoginScreen });
