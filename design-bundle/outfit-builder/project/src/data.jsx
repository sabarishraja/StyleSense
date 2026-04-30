// Seed wardrobe data for StyleSense

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Ethnic', 'Footwear', 'Accessories'];

// placeholder palette (for color dots) — these should feel like real fabric swatches
const WARDROBE = [
  { id: 1, cat: 'Outerwear', sub: 'Wool Overcoat', colors: ['#2b2b2b', '#3a3a3a'], formality: 5, seasons: ['Fall','Winter'], tags:['tailored','oversized','evening'], tone:'#1f1f1f', label:'// overcoat / charcoal' },
  { id: 2, cat: 'Tops',      sub: 'Ribbed Knit',   colors: ['#e8dbc2'],           formality: 3, seasons: ['Fall','Winter'], tags:['cashmere','crewneck'],        tone:'#3a3228', label:'// knit / cream' },
  { id: 3, cat: 'Bottoms',   sub: 'Wide-Leg Denim',colors: ['#3d5a7a', '#2d4560'], formality: 2, seasons: ['All'],           tags:['raw-denim','selvedge'],        tone:'#1c2633', label:'// denim / indigo' },
  { id: 4, cat: 'Footwear',  sub: 'Leather Loafer',colors: ['#3a1f16'],           formality: 4, seasons: ['All'],           tags:['horsebit','italian'],          tone:'#1a0f0a', label:'// loafer / oxblood' },
  { id: 5, cat: 'Tops',      sub: 'Silk Blouse',   colors: ['#f2e4d0'],           formality: 4, seasons: ['Spring','Summer'],tags:['drape','button-up'],           tone:'#2a2520', label:'// silk / bone' },
  { id: 6, cat: 'Outerwear', sub: 'Leather Jacket',colors: ['#141414'],           formality: 3, seasons: ['Spring','Fall'], tags:['moto','cropped'],              tone:'#0d0d0d', label:'// leather / black' },
  { id: 7, cat: 'Bottoms',   sub: 'Pleated Trouser',colors: ['#1f1a13'],          formality: 5, seasons: ['Fall','Winter'], tags:['wool','high-rise'],            tone:'#171411', label:'// trouser / espresso' },
  { id: 8, cat: 'Accessories', sub: 'Silk Scarf',  colors: ['#8a2a2a','#c9a15a'], formality: 4, seasons: ['All'],           tags:['print','square'],              tone:'#2a1515', label:'// scarf / crimson' },
  { id: 9, cat: 'Ethnic',    sub: 'Linen Kurta',   colors: ['#f5f0e4'],           formality: 3, seasons: ['Summer'],        tags:['hand-loom','mandarin'],        tone:'#2a281f', label:'// kurta / ivory' },
  { id: 10,cat: 'Footwear',  sub: 'Suede Sneaker', colors: ['#c9b896'],           formality: 2, seasons: ['All'],           tags:['low-top','minimal'],           tone:'#2a2619', label:'// sneaker / sand' },
  { id: 11,cat: 'Tops',      sub: 'Linen Shirt',   colors: ['#d9d6cf'],           formality: 3, seasons: ['Spring','Summer'],tags:['camp-collar','relaxed'],       tone:'#24231e', label:'// shirt / pearl' },
  { id: 12,cat: 'Accessories', sub: 'Tortoise Sunglasses', colors:['#6b4a2a','#2a1e10'], formality:3, seasons:['All'],      tags:['acetate','square-frame'],      tone:'#14100a', label:'// shades / tortoise' },
];

// Review step — what Claude "detected" on a freshly added item
const DETECTED_ITEM = {
  confidence: 0.94,
  category: 'Tops',
  sub: 'Cashmere Turtleneck',
  primary: { hex: '#4A2E24', name: 'Espresso Brown' },
  secondary: [{ hex:'#2a1a14', name:'Umber' }],
  formality: 4,
  seasons: ['Fall', 'Winter'],
  tags: ['ribbed', 'fitted', 'evening', 'knitwear'],
  tone: '#1a0f0a',
  label: '// turtleneck / espresso',
};

window.CATEGORIES = CATEGORIES;
window.WARDROBE = WARDROBE;
window.DETECTED_ITEM = DETECTED_ITEM;
