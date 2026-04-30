// Profile calendar — weekly view of wear logs.
// Each day shows a horizontal strip of item thumbnails. Tap a day → bottom sheet
// with the full outfit detail.

const { useState: uS_PC, useEffect: uE_PC, useRef: uR_PC } = React;

const DAY_LABELS = ['M','T','W','T','F','S','S']; // ISO Mon-first

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmtMonth(d) {
  return d.toLocaleString('en', { month: 'short' });
}
function fmtRange(start, end) {
  const sm = fmtMonth(start), em = fmtMonth(end);
  if (sm === em) return `${sm} ${start.getDate()} – ${end.getDate()}`;
  return `${sm} ${start.getDate()} – ${em} ${end.getDate()}`;
}

function ProfileCalendarScreen({ accent, wardrobe, layout = 'strip', emptyState = false }) {
  const today = WEAR_TODAY;
  const [weekStart, setWeekStart] = uS_PC(startOfWeek(today));
  const [openDay, setOpenDay] = uS_PC(null); // dateKey

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekEnd = days[6];

  const goWeek = (delta) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    setWeekStart(next);
  };

  // For empty-state preview, suppress all logs
  const lookupLog = (k) => emptyState ? null : WEAR_BY_DATE[k];

  const openLog = openDay ? lookupLog(openDay) : null;

  return (
    <div style={{
      minHeight: '100%', background: TOKENS.bg,
      padding: '8px 20px 40px',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: 1.5,
          color: accent.solid, textTransform: 'uppercase', marginBottom: 4,
        }}>Account</div>
        <div style={{
          fontFamily: TOKENS.serif, fontSize: 34, fontWeight: 400,
          color: TOKENS.text, letterSpacing: -0.9, lineHeight: 1.0,
        }}>Profile</div>
      </div>

      {/* Mini identity row (compressed compared to original profile) */}
      <div style={{
        display:'flex', alignItems:'center', gap: 12, marginBottom: 22,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: accent.soft,
          border: `1px solid ${accent.solid}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color: accent.solid,
          fontFamily: TOKENS.serif, fontSize: 16, fontWeight: 500,
          flexShrink: 0,
        }}>AR</div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{
            fontFamily: TOKENS.serif, fontSize: 17, color: TOKENS.text,
            letterSpacing: -0.2, lineHeight: 1.1,
          }}>Alex Rowan</div>
          <div style={{
            fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
            color: TOKENS.textDim, textTransform: 'uppercase', marginTop: 3,
          }}>{emptyState ? '0 outfits logged' : '12 outfits logged'}</div>
        </div>
      </div>

      {/* Section label */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom: 14,
      }}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.5,
          color: TOKENS.textMuted, textTransform: 'uppercase',
        }}>What I wore</div>
        <button style={{
          background:'transparent', border:'none',
          fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
          color: accent.solid, textTransform:'uppercase',
          cursor:'pointer', padding: 0,
        }}>All history →</button>
      </div>

      {/* Week navigation */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom: 14,
      }}>
        <button onClick={() => goWeek(-1)} style={navBtnStyle()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{
          fontFamily: TOKENS.serif, fontSize: 18, color: TOKENS.text,
          letterSpacing: -0.3,
        }}>
          {fmtRange(weekStart, weekEnd)}
        </div>
        <button onClick={() => goWeek(1)} disabled={weekStart >= startOfWeek(today)} style={navBtnStyle(weekStart >= startOfWeek(today))}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Days */}
      <div style={{
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: TOKENS.rCard,
        padding: 8,
        display:'flex', flexDirection:'column', gap: 4,
      }}>
        {days.map((d, i) => {
          const k = wearDateKey(d);
          const log = lookupLog(k);
          const isToday = wearDateKey(d) === wearDateKey(today);
          const isFuture = d > today;
          return (
            <DayRow
              key={k}
              date={d}
              dayLabel={DAY_LABELS[i]}
              log={log}
              wardrobe={wardrobe}
              accent={accent}
              isToday={isToday}
              isFuture={isFuture}
              onOpen={() => log && setOpenDay(k)}
            />
          );
        })}
      </div>

      {/* Footer: log today CTA if today is empty (and not future-week) */}
      {!emptyState && !lookupLog(wearDateKey(today)) && wearDateKey(weekStart) === wearDateKey(startOfWeek(today)) && (
        <div style={{ marginTop: 16 }}>
          <button style={{
            width: '100%', height: 48,
            borderRadius: TOKENS.rButton,
            border: `1px dashed ${accent.solid}`,
            background: 'transparent',
            color: accent.solid,
            fontFamily: TOKENS.sans, fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
            cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
          }}>
            <Icon.plusSmall/> Log what you wore today
          </button>
        </div>
      )}

      {emptyState && (
        <div style={{ marginTop: 18, textAlign:'center', padding: '0 12px' }}>
          <div style={{
            fontFamily: TOKENS.serif, fontStyle:'italic', fontSize: 16,
            color: TOKENS.textMuted, letterSpacing: -0.2, lineHeight: 1.35,
          }}>Your week's a blank canvas.</div>
          <div style={{
            fontFamily: TOKENS.sans, fontSize: 12, color: TOKENS.textDim,
            marginTop: 4, letterSpacing: -0.05,
          }}>Tap "Worn today" on any generated outfit to start your diary.</div>
        </div>
      )}

      {/* Bottom sheet */}
      {openDay && (
        <DayDetailSheet
          dateKey={openDay}
          log={openLog}
          wardrobe={wardrobe}
          accent={accent}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  );
}

function navBtnStyle(disabled) {
  return {
    width: 32, height: 32, borderRadius: 16,
    border: `1px solid ${TOKENS.border}`,
    background: 'transparent',
    color: disabled ? TOKENS.textDim : TOKENS.text,
    display:'flex', alignItems:'center', justifyContent:'center',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
  };
}

// ─────────────────────────────────────────────────────────────
// Day row
// ─────────────────────────────────────────────────────────────
function DayRow({ date, dayLabel, log, wardrobe, accent, isToday, isFuture, onOpen }) {
  const items = log ? log.item_ids.map(id => wardrobe.find(w => w.id === id)).filter(Boolean) : [];
  const dateNum = date.getDate();

  return (
    <button
      onClick={onOpen}
      disabled={!log}
      style={{
        all: 'unset',
        display:'flex', alignItems:'center', gap: 12,
        padding: '10px 8px',
        borderRadius: 14,
        background: isToday ? accent.soft : 'transparent',
        cursor: log ? 'pointer' : 'default',
        transition: 'background 160ms ease',
        position: 'relative',
      }}
    >
      {/* Date column */}
      <div style={{
        width: 36, flexShrink: 0,
        display:'flex', flexDirection:'column', alignItems:'center', gap: 1,
      }}>
        <div style={{
          fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
          color: isToday ? accent.solid : TOKENS.textDim,
          textTransform:'uppercase',
        }}>{dayLabel}</div>
        <div style={{
          fontFamily: TOKENS.serif, fontSize: 18, fontWeight: 400,
          color: isFuture ? TOKENS.textDim : (isToday ? accent.solid : TOKENS.text),
          letterSpacing: -0.3, lineHeight: 1,
        }}>{dateNum}</div>
      </div>

      {/* Strip */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {log ? (
          <div style={{display:'flex', flexDirection:'column', gap: 4}}>
            <div style={{display:'flex', gap: 4}}>
              {items.slice(0, 5).map((it, i) => (
                <div key={i} style={{
                  width: 38, height: 38, borderRadius: 8,
                  overflow:'hidden', flexShrink: 0,
                  border: `1px solid ${TOKENS.border}`,
                }}>
                  <GarmentTile tone={it.tone} corner={0} showLabel={false}/>
                </div>
              ))}
              {items.length > 5 && (
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: TOKENS.surface2,
                  border: `1px solid ${TOKENS.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily: TOKENS.mono, fontSize: 10, color: TOKENS.textMuted,
                }}>+{items.length - 5}</div>
              )}
            </div>
            {log.occasion && (
              <div style={{
                fontFamily: TOKENS.sans, fontSize: 11, color: TOKENS.textMuted,
                letterSpacing: -0.05, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{log.occasion}</div>
            )}
          </div>
        ) : (
          <EmptyDay isFuture={isFuture} isToday={isToday} accent={accent}/>
        )}
      </div>

      {/* Chevron */}
      {log && (
        <div style={{ color: TOKENS.textDim, flexShrink: 0, paddingRight: 4 }}>
          <Icon.chev/>
        </div>
      )}
    </button>
  );
}

function EmptyDay({ isFuture, isToday, accent }) {
  return (
    <div style={{
      height: 38,
      display:'flex', alignItems:'center', gap: 8,
    }}>
      <div style={{
        flex: 1, height: 1,
        background: `repeating-linear-gradient(to right, ${TOKENS.border} 0 6px, transparent 6px 12px)`,
      }}/>
      <div style={{
        fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.2,
        color: isToday ? accent.solid : TOKENS.textDim,
        textTransform:'uppercase',
      }}>
        {isFuture ? '—' : isToday ? 'Log today' : 'No log'}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom sheet — day detail
// ─────────────────────────────────────────────────────────────
function DayDetailSheet({ dateKey, log, wardrobe, accent, onClose }) {
  const [closing, setClosing] = uS_PC(false);
  const items = log.item_ids.map(id => wardrobe.find(w => w.id === id)).filter(Boolean);
  const date = new Date(dateKey + 'T00:00:00');
  const longDate = date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      onClick={close}
      style={{
        position: 'absolute', inset: 0,
        background: closing ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.55)',
        transition: 'background 200ms ease',
        zIndex: 50,
        display:'flex', alignItems:'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%',
          background: TOKENS.surface,
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          borderTop: `1px solid ${TOKENS.border}`,
          padding: '12px 20px 28px',
          maxHeight: '82%',
          overflow: 'auto',
          animation: closing ? 'sg-sheet-out 200ms ease forwards' : 'sg-sheet-in 280ms cubic-bezier(.2,.7,.2,1)',
          boxShadow: '0 -20px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Grabber */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: TOKENS.border,
          margin: '0 auto 16px',
        }}/>

        {/* Header */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 14}}>
          <div>
            <div style={{
              fontFamily: TOKENS.mono, fontSize: 9, letterSpacing: 1.4,
              color: accent.solid, textTransform: 'uppercase', marginBottom: 4,
            }}>{log.occasion || 'Worn'}</div>
            <div style={{
              fontFamily: TOKENS.serif, fontSize: 24, fontWeight: 400,
              color: TOKENS.text, letterSpacing: -0.5, lineHeight: 1.05,
            }}>
              {log.outfit_name ? <em style={{fontStyle:'italic'}}>"{log.outfit_name}"</em> : longDate}
            </div>
            {log.outfit_name && (
              <div style={{
                fontFamily: TOKENS.sans, fontSize: 12, color: TOKENS.textMuted,
                marginTop: 4, letterSpacing: -0.05,
              }}>{longDate}</div>
            )}
          </div>
          <button onClick={close} aria-label="Close" style={{
            width: 32, height: 32, borderRadius: 16,
            border: `1px solid ${TOKENS.border}`,
            background:'transparent', color: TOKENS.textMuted,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', flexShrink: 0,
          }}>
            <Icon.close/>
          </button>
        </div>

        {/* Items grid */}
        <div style={{
          display:'grid',
          gridTemplateColumns: items.length === 4 ? '1fr 1fr' : 'repeat(' + Math.min(items.length, 3) + ', 1fr)',
          gap: 8,
          marginBottom: 16,
        }}>
          {items.map((it, i) => (
            <div key={i} style={{
              borderRadius: 14, overflow:'hidden',
              border: `1px solid ${TOKENS.border}`,
              background: TOKENS.surface2,
            }}>
              <GarmentTile tone={it.tone} corner={0} showLabel={false}/>
              <div style={{
                padding: '8px 10px',
                borderTop: `1px solid ${TOKENS.border}`,
              }}>
                <div style={{
                  fontFamily: TOKENS.mono, fontSize: 8, letterSpacing: 1,
                  color: TOKENS.textDim, textTransform:'uppercase',
                }}>{it.cat}</div>
                <div style={{
                  fontFamily: TOKENS.serif, fontSize: 13, color: TOKENS.text,
                  letterSpacing: -0.2, marginTop: 2, lineHeight: 1.1,
                }}>{it.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{display:'flex', gap: 8}}>
          <button style={{
            flex: 1, height: 44,
            borderRadius: TOKENS.rButton,
            border: `1px solid ${TOKENS.border}`,
            background:'transparent', color: TOKENS.text,
            fontFamily: TOKENS.sans, fontSize: 13, fontWeight: 500,
            cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap: 6,
          }}>
            <Icon.plusSmall/> Save outfit
          </button>
          <button style={{
            flex: 1, height: 44,
            borderRadius: TOKENS.rButton,
            border: `1px solid rgba(239,83,80,0.35)`,
            background:'transparent', color: TOKENS.error,
            fontFamily: TOKENS.sans, fontSize: 13, fontWeight: 500,
            cursor:'pointer',
          }}>Remove log</button>
        </div>

        <style>{`
          @keyframes sg-sheet-in {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes sg-sheet-out {
            to { transform: translateY(100%); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileCalendarScreen });
