// Mock wear-log data for the calendar
// One outfit per day, snapshot of items + occasion + optional name.

// Anchor "today" so calendar always shows seeded data.
const TODAY = new Date(2026, 3, 29); // April 29, 2026 (Wednesday)

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function offset(days) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d;
}

// Seed a few weeks of logs. Items reference WARDROBE ids.
const WEAR_LOGS = [
  // This week
  { worn_on: dateKey(offset(-2)), item_ids: [5, 3, 10],     occasion: 'Studio day',     outfit_name: 'Off-duty linen' },
  { worn_on: dateKey(offset(-1)), item_ids: [2, 7, 4],      occasion: 'Client dinner',  outfit_name: 'After Work' },
  { worn_on: dateKey(offset(0)),  item_ids: [11, 3, 10, 12],occasion: 'Coffee + errands', outfit_name: null },
  // Future days this week stay empty.

  // Last week
  { worn_on: dateKey(offset(-5)), item_ids: [6, 7, 4],      occasion: 'Gallery opening', outfit_name: 'Black Tie Lite' },
  { worn_on: dateKey(offset(-7)), item_ids: [9, 3, 10],     occasion: 'Brunch',          outfit_name: 'Sunday Market' },
  { worn_on: dateKey(offset(-8)), item_ids: [1, 7, 4, 8],   occasion: 'Travel · Milan',  outfit_name: 'Long-haul polish' },
  { worn_on: dateKey(offset(-10)),item_ids: [5, 3, 10],     occasion: null,              outfit_name: null },
];

const WEAR_BY_DATE = Object.fromEntries(WEAR_LOGS.map(l => [l.worn_on, l]));

window.WEAR_TODAY = TODAY;
window.WEAR_LOGS = WEAR_LOGS;
window.WEAR_BY_DATE = WEAR_BY_DATE;
window.wearDateKey = dateKey;
window.wearOffset = offset;
