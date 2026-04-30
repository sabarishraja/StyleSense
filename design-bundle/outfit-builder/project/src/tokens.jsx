// Design tokens for StyleSense
// Dark-mode only. Editorial sans + serif display. Gold used sparingly.

const TOKENS = {
  // core surfaces
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surface2: '#222222',
  border: '#2A2A2A',
  borderSoft: '#1f1f1f',

  // text
  text: '#F5F5F5',
  textMuted: '#AAAAAA',
  textDim: '#6B6B6B',

  // status
  error: '#EF5350',
  success: '#7FB685',

  // radii
  rCard: 20,
  rButton: 28,
  rPill: 999,
  rInput: 16,

  // spacing
  gutter: 16,

  // type
  serif: "'Fraunces', 'Cormorant Garamond', Georgia, serif",
  sans: "'Inter', -apple-system, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
};

// Accent palettes (gold + alternatives for Tweaks)
const ACCENTS = {
  gold:       { solid: '#D4A574', soft: 'rgba(212,165,116,0.14)', ink: '#0A0A0A', label: 'Gold' },
  copper:     { solid: '#C27B5A', soft: 'rgba(194,123,90,0.14)',  ink: '#0A0A0A', label: 'Copper' },
  champagne:  { solid: '#E6D3A3', soft: 'rgba(230,211,163,0.14)', ink: '#0A0A0A', label: 'Champagne' },
  bone:       { solid: '#EDE6D6', soft: 'rgba(237,230,214,0.12)', ink: '#0A0A0A', label: 'Bone' },
};

window.TOKENS = TOKENS;
window.ACCENTS = ACCENTS;
