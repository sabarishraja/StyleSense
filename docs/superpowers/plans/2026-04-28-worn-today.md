# Worn Today / Outfit Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users mark a saved outfit as worn on today's date; store in a `wear_logs` Supabase table; show wear history in a bottom sheet on the Saved outfit card.

**Architecture:** New `wear_logs` Supabase table with a UNIQUE constraint on `(user_id, saved_outfit_id, worn_on)`. Three new store actions on `useOutfitsStore`. New `WearHistorySheet` modal component. UI changes confined to `OutfitResultCard` in `app/(tabs)/outfits.tsx`.

**Tech Stack:** React Native, Expo Router, Zustand, Supabase JS client, TypeScript.

---

## File Map

| File | Change |
|------|--------|
| `supabase/migrations/003_wear_logs.sql` | **Create** — new table + RLS |
| `types/index.ts` | **Modify** — add `WearLog` interface |
| `store/outfits.ts` | **Modify** — add state + 3 actions |
| `components/WearHistorySheet.tsx` | **Create** — bottom sheet modal |
| `app/(tabs)/outfits.tsx` | **Modify** — wire "Worn Today" button + sheet open |

---

### Task 1: Create the `wear_logs` migration

**Files:**
- Create: `supabase/migrations/003_wear_logs.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/003_wear_logs.sql
CREATE TABLE wear_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  saved_outfit_id UUID REFERENCES saved_outfits(id) ON DELETE CASCADE NOT NULL,
  worn_on         DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, saved_outfit_id, worn_on)
);

CREATE INDEX idx_wear_logs_user_id      ON wear_logs(user_id);
CREATE INDEX idx_wear_logs_saved_outfit ON wear_logs(saved_outfit_id);

ALTER TABLE wear_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wear logs"
  ON wear_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wear logs"
  ON wear_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wear logs"
  ON wear_logs FOR DELETE USING (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/003_wear_logs.sql
git commit -m "feat: add wear_logs migration"
```

---

### Task 2: Add `WearLog` type

**Files:**
- Modify: `types/index.ts` (after the `SavedOutfit` interface, around line 154)

- [ ] **Step 1: Add the interface**

In `types/index.ts`, after the closing `}` of `SavedOutfit`, add:

```ts
// -- Wear Log --
export interface WearLog {
  id: string;
  user_id: string;
  saved_outfit_id: string;
  worn_on: string; // ISO date "YYYY-MM-DD"
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add WearLog type"
```

---

### Task 3: Add wear log state and actions to `useOutfitsStore`

**Files:**
- Modify: `store/outfits.ts`

- [ ] **Step 1: Add import for `WearLog`**

At the top of `store/outfits.ts`, update the import from `@/types`:

```ts
import type { ClothingItem, SavedOutfit, WearLog, WeatherSnapshot } from "@/types";
```

- [ ] **Step 2: Extend the `OutfitsState` interface**

In `store/outfits.ts`, add these fields to the `OutfitsState` interface (after `error: string | null;`):

```ts
  wearLogsBySavedOutfit: Record<string, WearLog[]>;
  wearLogsLoading: boolean;

  logWorn: (savedOutfitId: string) => Promise<void>;
  unlogWorn: (logId: string, savedOutfitId: string) => Promise<void>;
  fetchWearLogs: (savedOutfitId: string) => Promise<void>;
```

- [ ] **Step 3: Add initial state values**

In the `create<OutfitsState>((set, get) => ({` block, add after `error: null,`:

```ts
  wearLogsBySavedOutfit: {},
  wearLogsLoading: false,
```

- [ ] **Step 4: Implement `logWorn`**

Add after the `fetchSavedOutfits` action (before the closing `}));`):

```ts
  logWorn: async (savedOutfitId) => {
    const userId = await getUserId();
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    const { data, error } = await supabase
      .from("wear_logs")
      .insert({ user_id: userId, saved_outfit_id: savedOutfitId, worn_on: today })
      .select("*")
      .single();

    if (error) {
      // 23505 = unique_violation — already logged today, silently ignore
      if (error.code === "23505") return;
      throw new Error(`logWorn failed: ${error.message}`);
    }

    const newLog = data as WearLog;
    set((state) => ({
      wearLogsBySavedOutfit: {
        ...state.wearLogsBySavedOutfit,
        [savedOutfitId]: [newLog, ...(state.wearLogsBySavedOutfit[savedOutfitId] || [])],
      },
    }));
  },
```

- [ ] **Step 5: Implement `unlogWorn`**

```ts
  unlogWorn: async (logId, savedOutfitId) => {
    const { error } = await supabase
      .from("wear_logs")
      .delete()
      .eq("id", logId);

    if (error) throw new Error(`unlogWorn failed: ${error.message}`);

    set((state) => ({
      wearLogsBySavedOutfit: {
        ...state.wearLogsBySavedOutfit,
        [savedOutfitId]: (state.wearLogsBySavedOutfit[savedOutfitId] || []).filter(
          (l) => l.id !== logId
        ),
      },
    }));
  },
```

- [ ] **Step 6: Implement `fetchWearLogs`**

```ts
  fetchWearLogs: async (savedOutfitId) => {
    set({ wearLogsLoading: true });
    try {
      const { data, error } = await supabase
        .from("wear_logs")
        .select("*")
        .eq("saved_outfit_id", savedOutfitId)
        .order("worn_on", { ascending: false });

      if (error) throw error;

      set((state) => ({
        wearLogsBySavedOutfit: {
          ...state.wearLogsBySavedOutfit,
          [savedOutfitId]: (data || []) as WearLog[],
        },
      }));
    } catch (err: any) {
      console.warn("[outfits] fetchWearLogs failed:", err?.message || err);
      throw err;
    } finally {
      set({ wearLogsLoading: false });
    }
  },
```

- [ ] **Step 7: Commit**

```bash
git add store/outfits.ts
git commit -m "feat: add wear log state and actions to outfits store"
```

---

### Task 4: Create `WearHistorySheet` component

**Files:**
- Create: `components/WearHistorySheet.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/WearHistorySheet.tsx
import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, Pressable, FlatList,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOutfitsStore } from "@/store/outfits";
import type { WearLog } from "@/types";

const BG = "#0A0A0A";
const SURFACE = "#1A1A1A";
const SURFACE2 = "#2A2A2A";
const ACCENT = "#D4A574";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#888888";
const TEXT_MUTED = "#555555";

interface Props {
  visible: boolean;
  outfitId: string;
  outfitName: string;
  onClose: () => void;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00"); // force local time parse
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function WearHistorySheet({ visible, outfitId, outfitName, onClose }: Props) {
  const { fetchWearLogs, wearLogsBySavedOutfit, wearLogsLoading } = useOutfitsStore();
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!visible || !outfitId) return;
    setFetchError(false);
    fetchWearLogs(outfitId).catch(() => setFetchError(true));
  }, [visible, outfitId]);

  const logs: WearLog[] = wearLogsBySavedOutfit[outfitId] || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          {/* Header */}
          <View style={s.sheetHeader}>
            <View>
              <Text style={s.sheetLabel}>WEAR HISTORY</Text>
              <Text style={s.sheetTitle} numberOfLines={1}>{outfitName}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={s.closeBtn}>
              <Ionicons name="close" size={20} color={TEXT_SEC} />
            </Pressable>
          </View>

          <View style={s.divider} />

          {/* Body */}
          {wearLogsLoading ? (
            <ActivityIndicator color={ACCENT} style={{ marginTop: 32 }} />
          ) : fetchError ? (
            <Text style={s.emptyText}>Couldn't load history.</Text>
          ) : logs.length === 0 ? (
            <Text style={s.emptyText}>No wear history yet.</Text>
          ) : (
            <FlatList
              data={logs}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => (
                <View style={s.logRow}>
                  <Ionicons name="calendar-outline" size={14} color={ACCENT} style={{ marginTop: 1 }} />
                  <Text style={s.logDate}>{formatDate(item.worn_on)}</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    minHeight: 280,
    maxHeight: "70%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sheetLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10,
    letterSpacing: 3,
    color: ACCENT,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 20,
    color: TEXT,
    maxWidth: 240,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: SURFACE2,
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: SURFACE2,
    marginBottom: 16,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: SURFACE2,
  },
  logDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: TEXT_SEC,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 32,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/WearHistorySheet.tsx
git commit -m "feat: add WearHistorySheet component"
```

---

### Task 5: Wire up "Worn Today" button and history sheet in `outfits.tsx`

**Files:**
- Modify: `app/(tabs)/outfits.tsx`

- [ ] **Step 1: Import new store actions, WearHistorySheet, and Alert**

At the top of `app/(tabs)/outfits.tsx`, add to the existing React Native import:

```ts
import { ..., Alert } from "react-native";
```

Add after the existing component imports:

```ts
import WearHistorySheet from "@/components/WearHistorySheet";
```

- [ ] **Step 2: Pull wear log state from store in `OutfitsScreen`**

Inside `OutfitsScreen`, destructure new store values (add to the existing `useOutfitsStore()` destructure):

```ts
const {
  // ...existing...
  logWorn,
  wearLogsBySavedOutfit,
} = useOutfitsStore();
```

- [ ] **Step 3: Add sheet state to `OutfitsScreen`**

After the existing `useState` declarations in `OutfitsScreen`, add:

```ts
const [historySheet, setHistorySheet] = useState<{ id: string; name: string } | null>(null);
```

- [ ] **Step 4: Add `handleLogWorn` handler**

```ts
const handleLogWorn = async (savedOutfitId: string) => {
  try {
    await logWorn(savedOutfitId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (err: any) {
    Alert.alert("Couldn't log", "Please try again.");
  }
};
```

- [ ] **Step 5: Update `OutfitResultCard` props to accept wear log data**

Find the `OutfitResultCard` function signature and extend its props:

```tsx
function OutfitResultCard({
  outfit,
  index,
  occasionLabel,
  onRegenerate,
  onToggleSave,
  showRegenerate,
  wornToday,
  onLogWorn,
  onOpenHistory,
}: {
  outfit: MockOutfit;
  index: number;
  occasionLabel: string;
  onRegenerate?: () => void;
  onToggleSave: () => void;
  showRegenerate: boolean;
  wornToday: boolean;
  onLogWorn: () => void;
  onOpenHistory: () => void;
}) {
```

- [ ] **Step 6: Add the "Worn Today" button inside `OutfitResultCard`**

Inside `OutfitResultCard`'s return, wrap the existing card body in a `<Pressable onPress={onOpenHistory}>` (but NOT wrapping the heart/worn buttons — use `e.stopPropagation()` trick via separate inner `Pressable` for those).

Replace the existing outer `<Animated.View style={[s.resultCard, ...]}>` with:

```tsx
<Pressable onPress={onOpenHistory} style={{ marginHorizontal: 16, marginBottom: 8 }}>
  <Animated.View style={[s.resultCard, { opacity: anim, transform: [{ translateY }], marginHorizontal: 0, marginBottom: 0 }]}>
    {/* existing header, divider, itemRow, piecesText, reasonText unchanged */}

    {/* Worn Today + Regenerate row */}
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
      <Pressable
        onPress={(e) => { e.stopPropagation?.(); onLogWorn(); }}
        disabled={wornToday}
        style={[s.regenBtn, wornToday && { borderColor: ACCENT }]}
      >
        <Text style={[s.regenText, { color: wornToday ? ACCENT : TEXT_SEC }]}>
          {wornToday ? "✓ Worn Today" : "Mark as Worn"}
        </Text>
      </Pressable>

      {showRegenerate && (
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); handleRegenerate(); }}
          style={({ pressed }) => [s.regenBtn, { borderColor: pressed ? ACCENT : SURFACE2 }]}
        >
          {({ pressed }) => (
            <Text style={[s.regenText, { color: pressed ? ACCENT : TEXT_SEC }]}>↺ Regenerate</Text>
          )}
        </Pressable>
      )}
    </View>
  </Animated.View>
</Pressable>
```

- [ ] **Step 7: Pass new props where `OutfitResultCard` is rendered in the Saved view**

Find the Saved view's `savedResults.map(...)` block and update:

```tsx
{savedResults.map((r, i) => {
  const so = savedOutfits.find(x => x.id === r.id);
  const label = so ? (OCCASION_LABEL_BY_ID[so.occasion] || so.occasion) : "STYLE";
  const logs = wearLogsBySavedOutfit[r.id] || [];
  const todayStr = new Date().toISOString().split("T")[0];
  const wornToday = logs.some(l => l.worn_on === todayStr);
  return (
    <OutfitResultCard
      key={r.id}
      outfit={r}
      index={i}
      occasionLabel={label}
      onToggleSave={() => handleUnsaveFromSavedView(r)}
      showRegenerate={false}
      wornToday={wornToday}
      onLogWorn={() => handleLogWorn(r.id)}
      onOpenHistory={() => setHistorySheet({ id: r.id, name: r.name })}
    />
  );
})}
```

- [ ] **Step 8: Pass new props where `OutfitResultCard` is rendered in the Generate/results view**

In the `results.map(...)` block, generated outfits are not saved yet so `wornToday` is always false and `onOpenHistory` is a no-op:

```tsx
{results.map((r, i) => (
  <OutfitResultCard
    key={r.id}
    outfit={r}
    index={i}
    occasionLabel={activeOccasionObj?.label || "STYLE"}
    onRegenerate={handleRegenerateOutfit}
    onToggleSave={() => occasion && handleToggleSave(occasion, r)}
    showRegenerate={true}
    wornToday={false}
    onLogWorn={() => {}}
    onOpenHistory={() => {}}
  />
))}
```

- [ ] **Step 9: Render `WearHistorySheet` at the bottom of the Saved view return**

Before the closing `</View>` of the Saved view return, add:

```tsx
<WearHistorySheet
  visible={historySheet !== null}
  outfitId={historySheet?.id ?? ""}
  outfitName={historySheet?.name ?? ""}
  onClose={() => setHistorySheet(null)}
/>
```

Also add the same sheet to the Generate view return (same JSX, same state), placed just before the final closing `</View>`.

- [ ] **Step 10: Commit**

```bash
git add app/(tabs)/outfits.tsx
git commit -m "feat: wire Worn Today button and wear history sheet"
```

---

## User Steps After Implementation

1. Open the **Supabase dashboard** → SQL Editor.
2. Paste and run `supabase/migrations/003_wear_logs.sql`.
3. Restart Expo (`npx expo start --clear`) and test in Expo Go:
   - Open the Saved tab → tap "Mark as Worn" on a saved outfit → button should change to "✓ Worn Today".
   - Tap the card body → history sheet should open showing today's date.
   - Tap "Mark as Worn" again → nothing happens (already logged).
