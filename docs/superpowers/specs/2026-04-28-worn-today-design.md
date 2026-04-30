# Worn Today / Outfit Logging — Design Spec

**Date:** 2026-04-28  
**Status:** Approved

---

## Summary

Let users mark a saved outfit as "worn today." Store each log entry in a new `wear_logs` Supabase table. Surface wear history (dates worn) in a bottom sheet on the Saved outfit card.

---

## Scope

- Log a **full saved outfit** as worn on **today's date** only.
- Prevent double-logging the same outfit on the same day (DB-level UNIQUE constraint + UI guard).
- View wear history (chronological list of dates) in a bottom sheet — opened by tapping the outfit card.
- No individual item logging. No custom-date logging.

---

## Database

New migration `003_wear_logs.sql`:

```sql
CREATE TABLE wear_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  saved_outfit_id UUID REFERENCES saved_outfits(id) ON DELETE CASCADE NOT NULL,
  worn_on         DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, saved_outfit_id, worn_on)
);

CREATE INDEX idx_wear_logs_user_id        ON wear_logs(user_id);
CREATE INDEX idx_wear_logs_saved_outfit   ON wear_logs(saved_outfit_id);

ALTER TABLE wear_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wear logs"   ON wear_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wear logs" ON wear_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wear logs" ON wear_logs FOR DELETE USING (auth.uid() = user_id);
```

---

## Type

Add to `types/index.ts`:

```ts
export interface WearLog {
  id: string;
  user_id: string;
  saved_outfit_id: string;
  worn_on: string; // ISO date string "YYYY-MM-DD"
}
```

---

## Store (`store/outfits.ts`)

Three new actions added to `useOutfitsStore`:

| Action | Behaviour |
|--------|-----------|
| `logWorn(savedOutfitId)` | Insert row for today. Updates local `wearLogsBySavedOutfit` map. No-ops if already logged today (catches Supabase UNIQUE violation). |
| `fetchWearLogs(savedOutfitId)` | Fetch all wear_logs rows for that outfit, ordered by worn_on DESC. Populates `wearLogsBySavedOutfit`. |
| `unlogWorn(logId, savedOutfitId)` | Delete wear_log row. Updates local state. |

New state shape additions:
```ts
wearLogsBySavedOutfit: Record<string, WearLog[]>;  // keyed by saved_outfit_id
wearLogsLoading: boolean;
```

---

## UI

### Saved Outfit Card (`app/(tabs)/outfits.tsx`)

- Add a **"Worn Today"** / **"Worn ✓"** button below the item images row, styled like the existing `regenBtn` (border, small text).
- Button is disabled (shows "Worn ✓" in accent colour) if today's date is already in the outfit's wear log.
- Tapping logs the outfit; haptic feedback on success.
- Tapping the card body (anywhere outside the heart/worn buttons) opens the history bottom sheet.

### Wear History Bottom Sheet (new component `components/WearHistorySheet.tsx`)

- Uses React Native's built-in `Modal` with `transparent` + slide-up animation — no new library.
- Shows outfit name at top, then a flat list of dates: `"Monday, April 28 · 2026"` format.
- Empty state: `"No wear history yet"`.
- Close button (×) at top-right.
- Fetches logs on open (`fetchWearLogs`).

---

## Error Handling

- UNIQUE violation from Supabase on double-log: caught silently; UI already guards via local state.
- Network failure on `logWorn`: show brief inline error text on the card ("Couldn't log — try again").
- `fetchWearLogs` failure: sheet shows "Couldn't load history."

---

## What the user must do

After implementation is merged:

1. Run migration `003_wear_logs.sql` in the Supabase dashboard (SQL Editor → paste → Run).
2. No app store update required — Expo Go picks up the JS changes automatically.
