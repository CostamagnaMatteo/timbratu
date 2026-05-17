/* global React */
const { useState, useMemo } = React;

// ── tokens ──────────────────────────────────────────────────────────────
const ink = '#1f1d1a';
const paper = '#f8f3e6';
const paperEdge = '#ebe2cc';
const muted = '#8a8579';
const accent = '#d44a2c';   // negative / attention
const ok = '#3f7d4f';       // positive
const amber = '#d99a2b';    // highlight
const blueTag = '#3b6fb0';

// ── primitives ──────────────────────────────────────────────────────────
function Sketchbox({ children, style = {}, rotate = 0, dashed = false, fill = paper, thick = 2 }) {
  return (
    <div style={{
      border: `${thick}px solid ${ink}`,
      borderStyle: dashed ? 'dashed' : 'solid',
      borderRadius: 10,
      background: fill,
      boxShadow: `2px 2px 0 ${ink}22`,
      transform: rotate ? `rotate(${rotate}deg)` : undefined,
      padding: 10,
      ...style,
    }}>{children}</div>
  );
}

function Scribble({ w = 60, h = 6, color = ink, style = {} }) {
  // wavy underline / scribble
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', ...style }}>
      <path d={`M2 ${h-2} Q ${w*0.25} 1 ${w*0.5} ${h-2} T ${w-2} ${h-2}`}
            stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Hatch({ w, h, color = ink, gap = 5, angle = -30, opacity = 0.35 }) {
  // diagonal hatch fill
  const lines = [];
  const diag = Math.ceil((w + h) / gap);
  for (let i = -diag; i < diag; i++) {
    lines.push(<line key={i} x1={i*gap} y1={-h} x2={i*gap+h*2} y2={h*2}
                     stroke={color} strokeWidth="0.8" opacity={opacity} />);
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}
         style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <g transform={`rotate(${angle} ${w/2} ${h/2})`}>{lines}</g>
    </svg>
  );
}

function Phone({ children, label, sublabel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 340, height: 720, background: paper,
        border: `2.5px solid ${ink}`, borderRadius: 36,
        boxShadow: `4px 5px 0 ${ink}1f, inset 0 0 0 1px ${paperEdge}`,
        padding: '40px 16px 24px', position: 'relative', overflow: 'hidden',
        fontFamily: '"Patrick Hand", "Comic Sans MS", cursive', color: ink,
      }}>
        {/* notch */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          width: 90, height: 14, background: ink, borderRadius: 8, opacity: 0.85,
        }} />
        {children}
      </div>
      <div style={{ textAlign: 'center', fontFamily: '"Caveat", cursive', color: ink }}>
        <div style={{ fontSize: 24, lineHeight: 1, fontWeight: 700 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 16, color: muted, marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

const PhoneScroll = ({ children }) => (
  <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
);

const H = ({ size = 28, children, style = {} }) => (
  <div style={{ fontFamily: '"Caveat", cursive', fontWeight: 700, fontSize: size, lineHeight: 1, color: ink, ...style }}>{children}</div>
);

const Lbl = ({ size = 13, color = muted, children, style = {} }) => (
  <div style={{ fontSize: size, color, letterSpacing: 0.3, ...style }}>{children}</div>
);

// pill chip
const Chip = ({ children, fill = paper, color = ink, bold = false, style = {} }) => (
  <span style={{
    border: `1.5px solid ${ink}`, borderRadius: 999, padding: '2px 10px',
    background: fill, color, fontSize: 13, fontWeight: bold ? 700 : 400,
    display: 'inline-flex', alignItems: 'center', gap: 4, ...style,
  }}>{children}</span>
);

// ── HOME · A · "Banca ore" ─────────────────────────────────────────────
function HomeA() {
  return (
    <PhoneScroll>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <H size={22} style={{ transform: 'rotate(-2deg)' }}>Timbratuu</H>
        <div style={{ width: 26, height: 26, border: `1.5px solid ${ink}`, borderRadius: 999,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>P</div>
      </div>

      {/* month picker — prominente */}
      <Sketchbox thick={2} style={{ padding: '6px 10px', display: 'flex',
                                     alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ width: 30, height: 30, border: `1.5px solid ${ink}`, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: '"Caveat", cursive', fontSize: 22, lineHeight: 1 }}>‹</div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <H size={28} style={{ lineHeight: 1 }}>maggio 2026</H>
          <Scribble w={120} h={5} style={{ margin: '2px auto 0' }} />
        </div>
        <div style={{ width: 30, height: 30, border: `1.5px solid ${ink}`, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: '"Caveat", cursive', fontSize: 22, lineHeight: 1 }}>›</div>
      </Sketchbox>
      {/* hero saldo — stile "Orizzonte" */}
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <Lbl size={12} style={{ textTransform: 'uppercase', letterSpacing: 1 }}>la tua banca ore</Lbl>
        <H size={72} style={{ color: ink, lineHeight: 1, marginTop: 2 }}>
          +27<span style={{ fontSize: 32, color: ok }}>h 42m</span>
        </H>
        <div style={{ marginTop: 6 }}>
          <Chip fill="#f4ead2">questo mese  +4h 12m</Chip>
        </div>
      </div>

      {/* mini grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Sketchbox style={{ padding: 8 }}>
          <Lbl size={11}>OGGI</Lbl>
          <H size={26}>6h 48m</H>
          <Lbl size={11} color={accent}>−0h 24m</Lbl>
        </Sketchbox>
        <Sketchbox style={{ padding: 8 }}>
          <Lbl size={11}>GIORNI</Lbl>
          <H size={26}>12 / 21</H>
          <Lbl size={11}>lavorati</Lbl>
        </Sketchbox>
        <Sketchbox style={{ padding: 8 }}>
          <Lbl size={11}>PROIEZIONE</Lbl>
          <H size={22} style={{ color: ok }}>+8h 20m</H>
          <Lbl size={11}>fine mese</Lbl>
        </Sketchbox>
        <Sketchbox style={{ padding: 8 }}>
          <Lbl size={11}>ASSENZE</Lbl>
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            <Chip fill="#dceadb" style={{ fontSize: 11, padding: '1px 6px' }}>F 2</Chip>
            <Chip fill="#f5dfc4" style={{ fontSize: 11, padding: '1px 6px' }}>P 1</Chip>
            <Chip fill="#e8d2cc" style={{ fontSize: 11, padding: '1px 6px' }}>M 0</Chip>
          </div>
        </Sketchbox>
      </div>

      {/* recent days ledger */}
      <Sketchbox style={{ padding: 10, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <H size={20}>ultimi giorni</H>
          <Lbl size={12}>vai al mese →</Lbl>
        </div>
        <div style={{ borderTop: `1px dashed ${ink}`, marginTop: 6 }} />
        {[
          ['lun 12', '08:15 → 17:30', '+1h 18m', ok],
          ['ven 09', '08:30 → 16:00', '−0h 12m', accent],
          ['gio 08', '   ferie',        '   —',     muted],
          ['mer 07', '08:00 → 17:45', '+1h 33m', ok],
        ].map(([d, h, s, c], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto',
                                 padding: '6px 0', borderBottom: `1px dotted ${ink}33`,
                                 fontSize: 14, alignItems: 'center' }}>
            <span>{d}</span>
            <span style={{ color: muted }}>{h}</span>
            <span style={{ color: c, fontWeight: 700 }}>{s}</span>
          </div>
        ))}
      </Sketchbox>

      {/* FAB */}
      <div style={{
        position: 'absolute', right: 22, bottom: 22,
        background: ink, color: paper, borderRadius: 999, padding: '10px 16px',
        boxShadow: `2px 2px 0 ${ink}55`, fontFamily: '"Caveat", cursive', fontSize: 22,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>+ timbra oggi</div>
    </PhoneScroll>
  );
}

// ── HOME · B · "Orizzonte" ─────────────────────────────────────────────
function HomeB() {
  // build a saldo line for the month
  const days = 21;
  const pts = useMemo(() => {
    let acc = 0; const out = [];
    for (let i = 0; i < days; i++) {
      const d = (Math.sin(i * 0.7) + (i % 5 === 0 ? -0.4 : 0.2)) * 35;
      acc += d;
      out.push(acc);
    }
    return out;
  }, []);
  const maxAbs = Math.max(...pts.map(Math.abs)) * 1.2;
  const W = 290, Hh = 110;
  const path = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = Hh/2 - (v / maxAbs) * (Hh/2 - 6);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <PhoneScroll>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Lbl>← apr</Lbl>
        <H size={22}>maggio 2026</H>
        <Lbl>giu →</Lbl>
      </div>

      {/* huge saldo */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <Lbl size={12} style={{ textTransform: 'uppercase', letterSpacing: 1 }}>la tua banca ore</Lbl>
        <H size={72} style={{ color: ink, lineHeight: 1 }}>+27<span style={{ fontSize: 32, color: ok }}>h 42m</span></H>
      </div>

      {/* horizon graph */}
      <Sketchbox style={{ padding: 8 }}>
        <Lbl size={11}>andamento saldo · maggio</Lbl>
        <div style={{ position: 'relative' }}>
          <svg width={W} height={Hh} viewBox={`0 0 ${W} ${Hh}`} style={{ display: 'block', margin: '4px auto' }}>
            {/* horizon line */}
            <line x1="0" y1={Hh/2} x2={W} y2={Hh/2}
                  stroke={ink} strokeWidth="1" strokeDasharray="3 3" />
            <text x={W-2} y={Hh/2 - 3} textAnchor="end" fontSize="9" fill={muted} fontFamily="Patrick Hand">contrattuale</text>
            {/* fills */}
            <path d={`${path} L ${W} ${Hh/2} L 0 ${Hh/2} Z`}
                  fill={ok} opacity="0.18" />
            <path d={path} stroke={ok} strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* today marker */}
            <circle cx={(11/(days-1))*W} cy={Hh/2 - (pts[11]/maxAbs)*(Hh/2-6)} r="4" fill={amber} stroke={ink} />
            <text x={(11/(days-1))*W + 6} y={Hh/2 - (pts[11]/maxAbs)*(Hh/2-6) - 4} fontSize="10" fill={ink} fontFamily="Patrick Hand">oggi</text>
          </svg>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: muted }}>
          <span>1</span><span>7</span><span>14</span><span>21</span><span>28</span>
        </div>
      </Sketchbox>

      {/* today card */}
      <Sketchbox thick={2.5} style={{ padding: 12, background: '#fff8e8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <H size={22}>oggi · mar 13</H>
          <Lbl>in corso…</Lbl>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <H size={36}>08:15 → ?</H>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <Chip fill={ink} color={paper} bold>+ chiudi fascia</Chip>
          <Chip>modifica</Chip>
        </div>
      </Sketchbox>

      {/* assenze inline */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Chip fill="#dceadb">ferie  2</Chip>
        <Chip fill="#f5dfc4">permessi  1</Chip>
        <Chip fill="#e8d2cc">malattia  0</Chip>
        <Chip fill="#e2dccb">festivi  1</Chip>
      </div>

      <div style={{ flex: 1 }} />

      <Sketchbox dashed style={{ padding: 10, textAlign: 'center' }}>
        <Lbl size={13}>proiezione fine maggio</Lbl>
        <H size={28} style={{ color: ok }}>+36h 02m</H>
        <Lbl size={11}>basata sulla media di 12 giorni</Lbl>
      </Sketchbox>
    </PhoneScroll>
  );
}

// ── MESE · A · Lista a barre ───────────────────────────────────────────
function MeseA() {
  const rows = [
    { d: 'lun 01', t: 'lavoro',   ore: 7.5,  saldo: '+0:18', col: ok },
    { d: 'mar 02', t: 'lavoro',   ore: 8.1,  saldo: '+0:54', col: ok },
    { d: 'mer 03', t: 'lavoro',   ore: 6.8,  saldo: '−0:24', col: accent },
    { d: 'gio 04', t: 'permesso', ore: 0,    saldo: '—',     col: muted },
    { d: 'ven 05', t: 'lavoro',   ore: 9.2,  saldo: '+1:48', col: ok },
    { d: 'sab 06', t: '—',        ore: 0,    saldo: '',      col: muted, wk: true },
    { d: 'dom 07', t: '—',        ore: 0,    saldo: '',      col: muted, wk: true },
    { d: 'lun 08', t: 'lavoro',   ore: 7.2,  saldo: '+0:00', col: ink },
    { d: 'mar 09', t: 'lavoro',   ore: 7.6,  saldo: '+0:24', col: ok },
    { d: 'mer 10', t: 'ferie',    ore: 0,    saldo: '—',     col: muted },
    { d: 'gio 11', t: 'lavoro',   ore: 8.8,  saldo: '+1:30', col: ok },
    { d: 'ven 12', t: 'lavoro',   ore: 6.5,  saldo: '−0:42', col: accent },
  ];
  return (
    <PhoneScroll>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Lbl>‹ apr</Lbl>
        <H size={22}>maggio ’26</H>
        <Lbl>giu ›</Lbl>
      </div>
      <Sketchbox thick={2.5} style={{ padding: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Lbl size={11}>SALDO MESE</Lbl>
          <Lbl size={11}>12 / 21 giorni</Lbl>
        </div>
        <H size={36} style={{ color: ok }}>+4h 12m</H>
      </Sketchbox>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Chip bold>tutti</Chip>
        <Chip>lavoro</Chip>
        <Chip>ferie</Chip>
        <Chip>perm.</Chip>
      </div>

      {/* legend bar */}
      <div style={{ position: 'relative', height: 16, fontSize: 10, color: muted }}>
        <div style={{ position: 'absolute', left: '60%', top: 0, bottom: 0, borderLeft: `1px dashed ${ink}` }} />
        <span style={{ position: 'absolute', left: '60%', marginLeft: 4 }}>7h12 contrattuale</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflow: 'hidden' }}>
        {rows.map((r, i) => {
          const pct = Math.min(r.ore / 12, 1);
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '52px 1fr 56px', gap: 6,
              padding: '4px 4px', borderBottom: `1px dotted ${ink}33`,
              fontSize: 13, alignItems: 'center', opacity: r.wk ? 0.55 : 1,
            }}>
              <span>{r.d}</span>
              <div style={{ position: 'relative', height: 14, background: paperEdge, borderRadius: 3, border: `1px solid ${ink}55` }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct*100}%`, background: r.t === 'lavoro' ? (r.col === accent ? '#f1b8ab' : '#bcd9be') : (r.t === 'ferie' ? '#dceadb' : r.t === 'permesso' ? '#f5dfc4' : 'transparent'),
                  borderRight: r.ore > 0 ? `1.5px solid ${ink}` : 'none',
                }} />
                {/* contrattuale tick */}
                <div style={{ position: 'absolute', left: '60%', top: -2, bottom: -2, borderLeft: `1px dashed ${ink}` }} />
                {r.t !== 'lavoro' && r.t !== '—' && (
                  <span style={{ position: 'absolute', left: 6, top: -1, fontSize: 11, fontStyle: 'italic' }}>{r.t}</span>
                )}
              </div>
              <span style={{ color: r.col, fontWeight: 700, textAlign: 'right', fontSize: 13 }}>{r.saldo}</span>
            </div>
          );
        })}
      </div>
    </PhoneScroll>
  );
}

// ── MESE · B · Calendario griglia ──────────────────────────────────────
function MeseB() {
  // build 6×7 grid for May 2026 (May 1, 2026 is Friday)
  const startDow = 4; // mon=0 ... fri=4
  const daysInMonth = 31;
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = i - startDow + 1;
    cells.push(d >= 1 && d <= daysInMonth ? d : null);
  }
  // pseudo-data: saldo per day
  const sample = (d) => {
    if (d === null) return null;
    const dow = (startDow + d - 1) % 7;
    if (dow >= 5) return { type: 'wk' };
    if ([8, 18].includes(d)) return { type: 'ferie' };
    if (d === 22) return { type: 'permesso' };
    if (d > 13) return { type: 'futuro' };
    if (d === 13) return { type: 'oggi', saldo: 0.2 };
    // saldo
    const v = Math.sin(d * 0.9) * 0.9 + (d % 4 === 0 ? -0.4 : 0.3);
    return { type: 'lavoro', saldo: v };
  };

  const cellColor = (s) => {
    if (!s) return 'transparent';
    if (s.type === 'wk') return paperEdge;
    if (s.type === 'ferie') return '#dceadb';
    if (s.type === 'permesso') return '#f5dfc4';
    if (s.type === 'futuro') return paper;
    if (s.type === 'oggi') return '#fff2c4';
    const v = s.saldo;
    if (v > 0.5) return '#9fc8a4';
    if (v > 0) return '#cce0c5';
    if (v > -0.5) return '#f1c5b6';
    return '#e08e76';
  };

  return (
    <PhoneScroll>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Lbl>‹ apr</Lbl>
        <H size={22}>maggio ’26</H>
        <Lbl>giu ›</Lbl>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <Sketchbox style={{ padding: 6, flex: 1 }}>
          <Lbl size={10}>SALDO MESE</Lbl>
          <H size={22} style={{ color: ok }}>+4h 12m</H>
        </Sketchbox>
        <Sketchbox style={{ padding: 6, flex: 1 }}>
          <Lbl size={10}>BANCA TOT.</Lbl>
          <H size={22}>+27h 42m</H>
        </Sketchbox>
      </div>

      {/* day-of-week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, fontSize: 11, color: muted, textAlign: 'center' }}>
        {['L','M','M','G','V','S','D'].map((d, i) => <div key={i}>{d}</div>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, flex: 1 }}>
        {cells.map((d, i) => {
          const s = sample(d);
          const isToday = s && s.type === 'oggi';
          return (
            <div key={i} style={{
              position: 'relative',
              background: cellColor(s),
              border: `${isToday ? 2 : 1}px solid ${d === null ? 'transparent' : ink}`,
              borderRadius: 6,
              minHeight: 42,
              padding: '2px 4px',
              fontSize: 13,
              opacity: s?.type === 'futuro' ? 0.55 : 1,
            }}>
              <div style={{ fontWeight: 700, lineHeight: 1 }}>{d ?? ''}</div>
              {s?.type === 'lavoro' && (
                <div style={{ fontSize: 10, position: 'absolute', bottom: 2, left: 4, fontWeight: 700,
                              color: s.saldo > 0 ? ok : accent }}>
                  {s.saldo > 0 ? '+' : ''}{(s.saldo).toFixed(1)}h
                </div>
              )}
              {s?.type === 'ferie' && <div style={{ fontSize: 10, color: ok }}>F</div>}
              {s?.type === 'permesso' && <div style={{ fontSize: 10, color: amber }}>P</div>}
              {s?.type === 'oggi' && (
                <div style={{ position: 'absolute', bottom: 2, left: 4, fontSize: 9, fontStyle: 'italic' }}>oggi</div>
              )}
            </div>
          );
        })}
      </div>

      {/* legend */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11 }}>
        <Chip fill="#9fc8a4" style={{ fontSize: 11, padding: '1px 6px' }}>+ saldo</Chip>
        <Chip fill="#e08e76" style={{ fontSize: 11, padding: '1px 6px' }}>− saldo</Chip>
        <Chip fill="#dceadb" style={{ fontSize: 11, padding: '1px 6px' }}>ferie</Chip>
        <Chip fill="#f5dfc4" style={{ fontSize: 11, padding: '1px 6px' }}>permesso</Chip>
      </div>
    </PhoneScroll>
  );
}

// ── MODALE · A · Fasce + timeline 0–24 ─────────────────────────────────
function ModalShell({ children }) {
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* dim background */}
      <div style={{ position: 'absolute', inset: 0, background: '#00000022' }} />
      <Hatch w={308} h={680} gap={8} angle={-30} opacity={0.05} />
      {children}
    </div>
  );
}

function ModaleA() {
  return (
    <ModalShell>
      <div style={{
        position: 'absolute', left: 8, right: 8, top: 60,
        background: paper, border: `2.5px solid ${ink}`, borderRadius: 14,
        boxShadow: `3px 4px 0 ${ink}33`, padding: 12,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <H size={22}>nuova timbratura</H>
          <Lbl>✕</Lbl>
        </div>
        <Lbl size={13}>lun 12 maggio 2026</Lbl>

        {/* type pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <Chip bold fill={ink} color={paper}>lavoro</Chip>
          <Chip>ferie</Chip>
          <Chip>permesso</Chip>
          <Chip>malattia</Chip>
          <Chip>festivo</Chip>
        </div>

        {/* fasce */}
        <Lbl size={11} style={{ marginTop: 2 }}>FASCE</Lbl>
        {[['08:15', '12:30'], ['13:30', '17:45']].map(([e, u], i) => (
          <Sketchbox key={i} style={{ padding: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sketchbox dashed style={{ padding: '4px 8px', fontSize: 22, fontFamily: '"Caveat", cursive', fontWeight: 700 }}>{e}</Sketchbox>
              <span style={{ fontSize: 18 }}>→</span>
              <Sketchbox dashed style={{ padding: '4px 8px', fontSize: 22, fontFamily: '"Caveat", cursive', fontWeight: 700 }}>{u}</Sketchbox>
              <span style={{ marginLeft: 'auto', fontSize: 14, color: muted }}>🗑</span>
            </div>
            {i === 0 && (
              <Lbl size={11} color={amber} style={{ marginTop: 4 }}>→ arrotondato a 08:15</Lbl>
            )}
          </Sketchbox>
        ))}
        <Sketchbox dashed style={{ padding: 6, textAlign: 'center', color: muted }}>+ aggiungi fascia</Sketchbox>

        {/* timeline preview */}
        <Lbl size={11}>ANTEPRIMA GIORNATA</Lbl>
        <div style={{ position: 'relative', height: 38, border: `1.5px solid ${ink}`, borderRadius: 6, background: paperEdge }}>
          {/* ticks */}
          {[0, 6, 8, 12, 14, 18, 24].map((h) => (
            <div key={h} style={{
              position: 'absolute', left: `${(h/24)*100}%`, top: 0, bottom: 0,
              borderLeft: `1px dashed ${ink}55`,
            }}>
              <span style={{ position: 'absolute', top: -14, left: -6, fontSize: 9, color: muted }}>{h}</span>
            </div>
          ))}
          {/* fascia 1 */}
          <div style={{ position: 'absolute', left: `${(8.25/24)*100}%`, width: `${((12.5-8.25)/24)*100}%`,
                        top: 4, bottom: 4, background: '#bcd9be', border: `1.5px solid ${ink}` }} />
          {/* fascia 2 */}
          <div style={{ position: 'absolute', left: `${(13.5/24)*100}%`, width: `${((17.75-13.5)/24)*100}%`,
                        top: 4, bottom: 4, background: '#bcd9be', border: `1.5px solid ${ink}` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span>ore: <b>8h 30m</b></span>
          <span style={{ color: ok, fontWeight: 700 }}>saldo: +1h 18m</span>
        </div>

        <Sketchbox dashed style={{ padding: '6px 8px', fontSize: 13 }}>
          note: smart working pomeriggio…
        </Sketchbox>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Sketchbox style={{ flex: 1, padding: '8px 0', textAlign: 'center' }}>annulla</Sketchbox>
          <div style={{ flex: 1, padding: '8px 0', textAlign: 'center', background: ink, color: paper,
                        borderRadius: 8, fontFamily: '"Caveat", cursive', fontSize: 22, fontWeight: 700 }}>salva ✓</div>
        </div>
      </div>
    </ModalShell>
  );
}

// ── MODALE · B · "Quadrante giorno" ───────────────────────────────────
function ModaleB() {
  // arc-clock visualization: 24h dial. fascia 1: 8:15→12:30, fascia 2: 13:30→17:45
  const cx = 110, cy = 110, r = 90;
  const arc = (start, end, color) => {
    const a1 = (start/24)*2*Math.PI - Math.PI/2;
    const a2 = (end/24)*2*Math.PI - Math.PI/2;
    const x1 = cx + Math.cos(a1)*r, y1 = cy + Math.sin(a1)*r;
    const x2 = cx + Math.cos(a2)*r, y2 = cy + Math.sin(a2)*r;
    const large = (a2 - a1) > Math.PI ? 1 : 0;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                 stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" />;
  };
  const handle = (h, label) => {
    const a = (h/24)*2*Math.PI - Math.PI/2;
    const x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r;
    return (
      <g>
        <circle cx={x} cy={y} r="7" fill={paper} stroke={ink} strokeWidth="1.5" />
        <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fontFamily="Patrick Hand">{label}</text>
      </g>
    );
  };

  return (
    <ModalShell>
      <div style={{
        position: 'absolute', left: 8, right: 8, top: 50,
        background: paper, border: `2.5px solid ${ink}`, borderRadius: 14,
        boxShadow: `3px 4px 0 ${ink}33`, padding: 10,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <H size={20}>la giornata di lun 12</H>
          <Lbl>✕</Lbl>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <Chip bold fill={ink} color={paper}>lavoro</Chip>
          <Chip>ferie</Chip>
          <Chip>perm.</Chip>
          <Chip>mal.</Chip>
          <Chip>fest.</Chip>
        </div>

        {/* clock */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            {/* ring */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={paperEdge} strokeWidth="14" />
            {/* contrattuale ghost band */}
            {arc(8, 15.2, '#e7dfc7')}
            {/* fascia 1 */}
            {arc(8.25, 12.5, '#3f7d4f')}
            {/* fascia 2 */}
            {arc(13.5, 17.75, '#3f7d4f')}
            {/* hour ticks */}
            {Array.from({length:24}).map((_, h) => {
              const a = (h/24)*2*Math.PI - Math.PI/2;
              const x1 = cx + Math.cos(a)*(r-22), y1 = cy + Math.sin(a)*(r-22);
              const x2 = cx + Math.cos(a)*(r-16), y2 = cy + Math.sin(a)*(r-16);
              return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={h%6===0?1.5:0.7} opacity={h%6===0?1:0.5} />;
            })}
            {/* labels */}
            <text x={cx} y={cy - r + 38} textAnchor="middle" fontSize="11" fill={muted} fontFamily="Patrick Hand">00</text>
            <text x={cx + r - 32} y={cy + 4} textAnchor="middle" fontSize="11" fill={muted} fontFamily="Patrick Hand">06</text>
            <text x={cx} y={cy + r - 22} textAnchor="middle" fontSize="11" fill={muted} fontFamily="Patrick Hand">12</text>
            <text x={cx - r + 32} y={cy + 4} textAnchor="middle" fontSize="11" fill={muted} fontFamily="Patrick Hand">18</text>
            {/* handles */}
            {handle(8.25, '08:15')}
            {handle(12.5, '12:30')}
            {handle(13.5, '13:30')}
            {handle(17.75, '17:45')}
            {/* center */}
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontFamily="Caveat" fontWeight="700">8h 30m</text>
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize="14" fill={ok} fontFamily="Caveat" fontWeight="700">+1h 18m</text>
          </svg>
        </div>

        <Lbl size={11} style={{ textAlign: 'center', fontStyle: 'italic' }}>trascina i punti per regolare entrate e uscite</Lbl>

        {/* fasce summary line */}
        <Sketchbox style={{ padding: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span>① 08:15 → 12:30</span><span style={{ color: muted }}>4h 15m</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 2 }}>
            <span>② 13:30 → 17:45</span><span style={{ color: muted }}>4h 15m</span>
          </div>
          <Sketchbox dashed style={{ padding: '3px 8px', marginTop: 6, textAlign: 'center', fontSize: 12 }}>+ aggiungi fascia</Sketchbox>
        </Sketchbox>

        <div style={{ display: 'flex', gap: 8 }}>
          <Sketchbox style={{ flex: 1, padding: '6px 0', textAlign: 'center' }}>annulla</Sketchbox>
          <div style={{ flex: 1, padding: '6px 0', textAlign: 'center', background: ink, color: paper,
                        borderRadius: 8, fontFamily: '"Caveat", cursive', fontSize: 20, fontWeight: 700 }}>salva ✓</div>
        </div>
      </div>
    </ModalShell>
  );
}

// ── STORICO · A · Heatmap anno ─────────────────────────────────────────
function StoricoA() {
  const months = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  // 12 months x ~5 weeks heatmap; col = day-of-week, but simplified row=month col=day-block
  const cellFor = (m, w) => {
    if (m > 4 || (m === 4 && w > 2)) return null; // future
    const seed = (m * 13 + w * 7) % 11;
    const v = seed - 5; // -5..+5
    return v;
  };
  const cellColor = (v) => {
    if (v === null) return '#f3eedf';
    if (v > 3) return '#3f7d4f';
    if (v > 1) return '#7aa67e';
    if (v > -1) return '#cce0c5';
    if (v > -3) return '#f1c5b6';
    return '#d6694c';
  };

  return (
    <PhoneScroll>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Lbl>‹ 2025</Lbl>
        <H size={26}>2026</H>
        <Lbl>2027 ›</Lbl>
      </div>

      <Sketchbox thick={2.5} style={{ padding: 10 }}>
        <Lbl size={11}>BANCA ORE · TOTALE A OGGI</Lbl>
        <H size={42} style={{ color: ok }}>+127h 18m</H>
        <Lbl size={11}>+18h da inizio anno</Lbl>
      </Sketchbox>

      <Lbl size={11}>HEATMAP SALDO GIORNALIERO</Lbl>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {months.map((m, mi) => (
          <div key={mi} style={{ display: 'grid', gridTemplateColumns: '28px repeat(31, 1fr)', gap: 1, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: muted }}>{m}</span>
            {Array.from({length: 31}).map((_, di) => {
              const v = mi <= 4 ? (mi === 4 && di > 12 ? null : (mi*31+di)%11 - 5) : null;
              const isWk = di % 7 === 5 || di % 7 === 6;
              return (
                <div key={di} style={{
                  height: 12, background: cellColor(v),
                  border: `0.5px solid ${ink}55`, borderRadius: 1,
                  opacity: isWk && v !== null ? 0.45 : 1,
                }} />
              );
            })}
          </div>
        ))}
      </div>

      {/* legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: muted }}>
        <span>−</span>
        {['#d6694c','#f1c5b6','#cce0c5','#7aa67e','#3f7d4f'].map((c, i) => (
          <div key={i} style={{ width: 14, height: 10, background: c, border: `0.5px solid ${ink}55` }} />
        ))}
        <span>+</span>
        <span style={{ marginLeft: 8 }}>saldo · giorno</span>
      </div>

      {/* month summary */}
      <Sketchbox style={{ padding: 8, flex: 1 }}>
        <H size={18}>per mese</H>
        <div style={{ borderTop: `1px dashed ${ink}`, marginTop: 4 }} />
        {[['gen', '+12h 04m', ok],['feb','−2h 30m', accent],['mar','+8h 12m', ok],
          ['apr','+6h 00m', ok],['mag','+4h 12m', ok, true]].map(([m,s,c,now], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                                borderBottom: `1px dotted ${ink}33`, fontSize: 14,
                                fontWeight: now ? 700 : 400 }}>
            <span>{m} {now ? '· in corso' : ''}</span>
            <span style={{ color: c, fontWeight: 700 }}>{s}</span>
          </div>
        ))}
      </Sketchbox>
    </PhoneScroll>
  );
}

// ── STORICO · B · Estratto conto / linea cumulativa ────────────────────
function StoricoB() {
  // running cumulative bank line over 12 months
  const deltas = [12.1, -2.5, 8.2, 6, 4.2, 5.5, -8, 0, 7.2, 9, 3, 4.5];
  const cum = []; let acc = 96; for (const d of deltas) { acc += d; cum.push(acc); }
  const W = 290, Hh = 130;
  const maxV = Math.max(...cum) * 1.05;
  const minV = Math.min(0, ...cum) - 4;
  const sx = (i) => (i/(cum.length-1)) * W;
  const sy = (v) => Hh - ((v - minV) / (maxV - minV)) * (Hh - 8) - 2;
  const path = cum.map((v, i) => `${i === 0 ? 'M' : 'L'} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(' ');
  const months = ['G','F','M','A','M','G','L','A','S','O','N','D'];

  return (
    <PhoneScroll>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Lbl>‹ 2025</Lbl>
        <H size={26}>2026 · estratto conto ore</H>
        <Lbl>›</Lbl>
      </div>

      <Sketchbox thick={2.5} style={{ padding: 10, background: '#fff8e8' }}>
        <Lbl size={11}>SALDO · OGGI</Lbl>
        <H size={48} style={{ color: ok }}>+127h 18m</H>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: muted }}>
          <span>apertura · 1 gen</span>
          <span>+96h 00m</span>
        </div>
      </Sketchbox>

      <Sketchbox style={{ padding: 8 }}>
        <Lbl size={11}>ANDAMENTO BANCA ORE</Lbl>
        <svg width={W} height={Hh} viewBox={`0 0 ${W} ${Hh}`} style={{ display: 'block', margin: '6px auto' }}>
          {/* y grid */}
          {[0, 50, 100, 150].map((v) => v >= minV && v <= maxV && (
            <g key={v}>
              <line x1="0" y1={sy(v)} x2={W} y2={sy(v)} stroke={ink} strokeWidth="0.5" opacity="0.25" strokeDasharray="2 3" />
              <text x="2" y={sy(v) - 2} fontSize="9" fill={muted} fontFamily="Patrick Hand">{v}h</text>
            </g>
          ))}
          {/* fill */}
          <path d={`${path} L ${W} ${sy(minV)} L 0 ${sy(minV)} Z`} fill={ok} opacity="0.15" />
          <path d={path} stroke={ok} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* current marker (month 4, may = idx 4) */}
          <circle cx={sx(4)} cy={sy(cum[4])} r="4" fill={amber} stroke={ink} />
          <text x={sx(4) + 6} y={sy(cum[4]) - 6} fontSize="10" fontFamily="Patrick Hand">oggi · 127h</text>
          {/* future dashed */}
          <path d={cum.slice(4).map((v,i) => `${i === 0 ? 'M' : 'L'} ${sx(i+4)} ${sy(v)}`).join(' ')}
                stroke={muted} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        </svg>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', fontSize: 10, color: muted, textAlign: 'center' }}>
          {months.map((m, i) => <span key={i} style={{ fontWeight: i === 4 ? 700 : 400, color: i === 4 ? ink : muted }}>{m}</span>)}
        </div>
      </Sketchbox>

      {/* ledger entries */}
      <Sketchbox style={{ padding: 8, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <H size={18}>movimenti</H>
          <Lbl size={11}>mese ▾</Lbl>
        </div>
        <div style={{ borderTop: `1px dashed ${ink}`, marginTop: 4 }} />
        {[
          ['mag · in corso', '+4h 12m',  '127h 18m', ok, true],
          ['apr 2026',       '+6h 00m',  '123h 06m', ok],
          ['mar 2026',       '+8h 12m',  '117h 06m', ok],
          ['feb 2026',       '−2h 30m',  '108h 54m', accent],
          ['gen 2026',       '+12h 04m', '111h 24m', ok],
          ['apertura',       '—',        ' 96h 00m', muted],
        ].map(([m, d, t, c, now], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8,
                                 padding: '4px 0', borderBottom: `1px dotted ${ink}33`,
                                 fontSize: 13, fontWeight: now ? 700 : 400 }}>
            <span>{m}</span>
            <span style={{ color: c, fontWeight: 700, width: 70, textAlign: 'right' }}>{d}</span>
            <span style={{ color: muted, width: 76, textAlign: 'right' }}>{t}</span>
          </div>
        ))}
      </Sketchbox>
    </PhoneScroll>
  );
}

// ── App ────────────────────────────────────────────────────────────────
function App() {
  return (
    <DesignCanvas>
      <DCSection id="home" title="Home · Dashboard mese" subtitle="Banca ore in primo piano — 2 metafore">
        <DCArtboard id="home-a" label="A · Banca ore + ledger" width={400} height={820}>
          <Phone label="A · Banca ore" sublabel="numerone + estratto rapido"><HomeA /></Phone>
        </DCArtboard>
        <DCArtboard id="home-b" label="B · Orizzonte" width={400} height={820}>
          <Phone label="B · Orizzonte" sublabel="saldo come linea del mese"><HomeB /></Phone>
        </DCArtboard>
      </DCSection>

      <DCSection id="mese" title="Vista mensile" subtitle="Stessi dati, due letture">
        <DCArtboard id="mese-a" label="A · Lista a barre" width={400} height={820}>
          <Phone label="A · Lista a barre" sublabel="riga = giorno + bar chart"><MeseA /></Phone>
        </DCArtboard>
        <DCArtboard id="mese-b" label="B · Calendario griglia" width={400} height={820}>
          <Phone label="B · Calendario griglia" sublabel="mese intero a colpo d'occhio"><MeseB /></Phone>
        </DCArtboard>
      </DCSection>

      <DCSection id="modale" title="Modale timbratura" subtitle="Centrale come da spec — due interazioni diverse">
        <DCArtboard id="mod-a" label="A · Fasce + timeline" width={400} height={820}>
          <Phone label="A · Fasce + timeline" sublabel="input testuali + anteprima 0–24h"><ModaleA /></Phone>
        </DCArtboard>
        <DCArtboard id="mod-b" label="B · Quadrante giorno" width={400} height={820}>
          <Phone label="B · Quadrante giorno" sublabel="archi orari sul cerchio 24h"><ModaleB /></Phone>
        </DCArtboard>
      </DCSection>

      <DCSection id="storico" title="Storico anno" subtitle="Dove vive la banca ore complessiva">
        <DCArtboard id="sto-a" label="A · Heatmap anno" width={400} height={820}>
          <Phone label="A · Heatmap anno" sublabel="cella = giorno · colore = saldo"><StoricoA /></Phone>
        </DCArtboard>
        <DCArtboard id="sto-b" label="B · Estratto conto" width={400} height={820}>
          <Phone label="B · Estratto conto" sublabel="linea cumulativa + movimenti"><StoricoB /></Phone>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
