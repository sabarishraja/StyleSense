import React, { useState, useEffect } from "react";
import {
  View, Text, Pressable, StyleSheet, Modal, ScrollView, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOutfitsStore, WearLogWithOutfit } from "@/store/outfits";
import { useClosetStore } from "@/store/closet";

const BG = "#0A0A0A";
const SURFACE = "#1A1A1A";
const SURFACE2 = "#2A2A2A";
const BORDER = "#222222";
const ACCENT = "#D4A574";
const ACCENT_SOFT = "rgba(212,165,116,0.12)";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#888888";
const TEXT_MUTED = "#555555";
const TEXT_DIM = "#3A3A3A";
const SUCCESS = "#7FB685";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtRange(start: Date, end: Date): string {
  const sm = start.toLocaleString("en", { month: "short" });
  const em = end.toLocaleString("en", { month: "short" });
  if (sm === em) return `${sm} ${start.getDate()} – ${end.getDate()}`;
  return `${sm} ${start.getDate()} – ${em} ${end.getDate()}`;
}

// ─── Day Row ─────────────────────────────────────────────────────────────────

interface DayRowProps {
  date: Date;
  dayLabel: string;
  log: WearLogWithOutfit | null;
  isToday: boolean;
  isFuture: boolean;
  onOpen: () => void;
}

function DayRow({ date, dayLabel, log, isToday, isFuture, onOpen }: DayRowProps) {
  const { items } = useClosetStore();
  const outfitItems = log
    ? log.item_ids
        .map((id) => items.find((w) => w.id === id))
        .filter(Boolean) as typeof items
    : [];

  return (
    <Pressable
      onPress={log ? onOpen : undefined}
      style={[s.dayRow, isToday && s.dayRowToday]}
    >
      {/* Date column */}
      <View style={s.dateCol}>
        <Text style={[s.dayLetter, isToday && s.dayLetterToday]}>{dayLabel}</Text>
        <Text style={[s.dayNum, isFuture && s.dayNumDim, isToday && s.dayNumToday]}>
          {date.getDate()}
        </Text>
      </View>

      {/* Content */}
      <View style={s.dayContent}>
        {log ? (
          <View>
            <View style={s.thumbStrip}>
              {outfitItems.slice(0, 5).map((item, i) => (
                <View key={i} style={s.thumbBox}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={s.thumbImg} />
                  ) : (
                    <Ionicons name="shirt-outline" size={14} color={TEXT_MUTED} />
                  )}
                </View>
              ))}
              {outfitItems.length > 5 && (
                <View style={[s.thumbBox, s.thumbExtra]}>
                  <Text style={s.thumbExtraText}>+{outfitItems.length - 5}</Text>
                </View>
              )}
            </View>
            {log.occasion && (
              <Text style={s.occasionText} numberOfLines={1}>{log.occasion}</Text>
            )}
          </View>
        ) : (
          <View style={s.emptyDay}>
            <View style={s.dashedLine} />
            <Text style={[s.emptyDayLabel, isToday && { color: ACCENT }]}>
              {isFuture ? "—" : isToday ? "Log today" : "No log"}
            </Text>
          </View>
        )}
      </View>

      {log && (
        <Ionicons name="chevron-forward" size={14} color={TEXT_DIM} />
      )}
    </Pressable>
  );
}

// ─── Day Detail Sheet ─────────────────────────────────────────────────────────

interface DayDetailSheetProps {
  log: WearLogWithOutfit;
  onClose: () => void;
  onRemove: (log: WearLogWithOutfit) => void;
}

function DayDetailSheet({ log, onClose, onRemove }: DayDetailSheetProps) {
  const { items } = useClosetStore();
  const outfitItems = log.item_ids
    .map((id) => items.find((w) => w.id === id))
    .filter(Boolean) as typeof items;

  const date = new Date(log.worn_on + "T00:00:00");
  const longDate = date.toLocaleDateString("en", {
    weekday: "long", month: "long", day: "numeric",
  });

  const cols = outfitItems.length === 4 ? 2 : Math.min(outfitItems.length, 3);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.sheetOverlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          {/* Grabber */}
          <View style={s.grabber} />

          {/* Header */}
          <View style={s.sheetHeader}>
            <View style={{ flex: 1, marginRight: 12 }}>
              {log.occasion && (
                <Text style={s.sheetOccasion}>{log.occasion.toUpperCase()}</Text>
              )}
              <Text style={s.sheetTitle}>
                {log.outfit_name ? `"${log.outfit_name}"` : longDate}
              </Text>
              {log.outfit_name && (
                <Text style={s.sheetSubdate}>{longDate}</Text>
              )}
            </View>
            <Pressable onPress={onClose} style={s.sheetClose} hitSlop={8}>
              <Ionicons name="close" size={16} color={TEXT_SEC} />
            </Pressable>
          </View>

          {/* Items grid */}
          <View style={[s.itemsGrid, { flexWrap: "wrap", flexDirection: "row", gap: 8 }]}>
            {outfitItems.map((item, i) => (
              <View
                key={i}
                style={[s.itemCell, { width: `${(100 / cols) - 3}%` as any }]}
              >
                <View style={s.itemCellImg}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={s.itemImg} />
                  ) : (
                    <Ionicons name="shirt-outline" size={28} color={TEXT_MUTED} />
                  )}
                </View>
                <View style={s.itemCellInfo}>
                  <Text style={s.itemCat}>{item.category.toUpperCase()}</Text>
                  <Text style={s.itemSub} numberOfLines={1}>
                    {item.subcategory || item.category}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={s.sheetActions}>
            <Pressable style={s.sheetSaveBtn} onPress={onClose}>
              <Ionicons name="add-outline" size={14} color={TEXT} />
              <Text style={s.sheetSaveBtnText}>Save outfit</Text>
            </Pressable>
            <Pressable
              style={s.sheetRemoveBtn}
              onPress={() => { onRemove(log); onClose(); }}
            >
              <Text style={s.sheetRemoveBtnText}>Remove log</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WearCalendar() {
  const { allWearLogsByDate, fetchAllWearLogs, unlogWorn } = useOutfitsStore();
  const today = new Date();
  const [weekStart, setWeekStart] = useState(startOfWeek(today));
  const [openLog, setOpenLog] = useState<WearLogWithOutfit | null>(null);

  useEffect(() => {
    fetchAllWearLogs();
  }, []);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekEnd = days[6];

  const goWeek = (delta: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    setWeekStart(next);
  };

  const isCurrentWeek = dateKey(weekStart) === dateKey(startOfWeek(today));
  const todayKey = dateKey(today);
  const todayLogged = !!allWearLogsByDate[todayKey]?.length;

  const handleRemove = async (log: WearLogWithOutfit) => {
    try {
      await unlogWorn(log.id, log.saved_outfit_id);
      fetchAllWearLogs();
    } catch (e) {
      console.warn("[calendar] remove log failed:", e);
    }
  };

  return (
    <View style={s.container}>
      {/* Section header */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionLabel}>WHAT I WORE</Text>
        <Text style={s.allHistoryBtn}>All history →</Text>
      </View>

      {/* Week navigation */}
      <View style={s.weekNav}>
        <Pressable onPress={() => goWeek(-1)} style={s.navBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={14} color={TEXT} />
        </Pressable>
        <Text style={s.weekRange}>{fmtRange(weekStart, weekEnd)}</Text>
        <Pressable
          onPress={() => goWeek(1)}
          disabled={isCurrentWeek}
          style={[s.navBtn, isCurrentWeek && s.navBtnDisabled]}
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={14} color={isCurrentWeek ? TEXT_DIM : TEXT} />
        </Pressable>
      </View>

      {/* Days */}
      <View style={s.daysCard}>
        {days.map((d, i) => {
          const k = dateKey(d);
          const logsForDay = allWearLogsByDate[k] || [];
          const log = logsForDay[0] ?? null;
          const isToday = k === todayKey;
          const isFuture = d > today;
          return (
            <DayRow
              key={k}
              date={d}
              dayLabel={DAY_LABELS[i]}
              log={log}
              isToday={isToday}
              isFuture={isFuture}
              onOpen={() => setOpenLog(log)}
            />
          );
        })}
      </View>

      {/* CTA if today not yet logged */}
      {isCurrentWeek && !todayLogged && (
        <Pressable style={s.logTodayCta}>
          <Ionicons name="add-outline" size={14} color={ACCENT} />
          <Text style={s.logTodayText}>Log what you wore today</Text>
        </Pressable>
      )}

      {openLog && (
        <DayDetailSheet
          log={openLog}
          onClose={() => setOpenLog(null)}
          onRemove={handleRemove}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { marginBottom: 24 },

  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.5, color: TEXT_MUTED, textTransform: "uppercase",
  },
  allHistoryBtn: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.2, color: ACCENT, textTransform: "uppercase",
  },

  weekNav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 12,
  },
  navBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  navBtnDisabled: { opacity: 0.35 },
  weekRange: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 18, color: TEXT, letterSpacing: -0.3,
  },

  daysCard: {
    backgroundColor: SURFACE,
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 8,
  },
  dayRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, paddingHorizontal: 8,
    borderRadius: 14,
  },
  dayRowToday: { backgroundColor: ACCENT_SOFT },

  dateCol: {
    width: 36, alignItems: "center", gap: 1,
  },
  dayLetter: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.2, color: TEXT_MUTED, textTransform: "uppercase",
  },
  dayLetterToday: { color: ACCENT },
  dayNum: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 18, color: TEXT, letterSpacing: -0.3, lineHeight: 20,
  },
  dayNumDim: { color: TEXT_DIM },
  dayNumToday: { color: ACCENT },

  dayContent: { flex: 1, minWidth: 0 },

  thumbStrip: { flexDirection: "row", gap: 4 },
  thumbBox: {
    width: 38, height: 38, borderRadius: 8, overflow: "hidden",
    backgroundColor: SURFACE2,
    borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  thumbImg: { width: "100%", height: "100%", resizeMode: "cover" },
  thumbExtra: { alignItems: "center", justifyContent: "center" },
  thumbExtraText: {
    fontFamily: "JetBrainsMono_400Regular", fontSize: 10, color: TEXT_MUTED,
  },
  occasionText: {
    fontFamily: "Inter_400Regular", fontSize: 11, color: TEXT_MUTED,
    letterSpacing: -0.05, marginTop: 4,
  },

  emptyDay: {
    height: 38, flexDirection: "row", alignItems: "center", gap: 8,
  },
  dashedLine: {
    flex: 1, height: 1,
    borderStyle: "dashed", borderWidth: 1, borderColor: BORDER,
  },
  emptyDayLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.2, color: TEXT_DIM, textTransform: "uppercase",
  },

  logTodayCta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 12, height: 48,
    borderWidth: 1, borderColor: ACCENT, borderRadius: 14,
    borderStyle: "dashed",
  },
  logTodayText: {
    fontFamily: "Inter_600SemiBold", fontSize: 13, color: ACCENT, letterSpacing: -0.1,
  },

  // Sheet
  sheetOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: BORDER,
    paddingHorizontal: 20, paddingBottom: 28,
    maxHeight: "82%",
  },
  grabber: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: BORDER, alignSelf: "center", marginTop: 12, marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 14,
  },
  sheetOccasion: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.4, color: ACCENT, marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 24, color: TEXT, letterSpacing: -0.5, lineHeight: 28,
  },
  sheetSubdate: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: TEXT_MUTED, marginTop: 4,
  },
  sheetClose: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    backgroundColor: "transparent", color: TEXT_MUTED,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  itemsGrid: { marginBottom: 16 },
  itemCell: {
    borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: BORDER,
    backgroundColor: SURFACE2,
    marginBottom: 0,
  },
  itemCellImg: {
    aspectRatio: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: SURFACE2,
  },
  itemImg: { width: "100%", height: "100%", resizeMode: "cover" },
  itemCellInfo: {
    padding: 8, borderTopWidth: 1, borderTopColor: BORDER,
  },
  itemCat: {
    fontFamily: "JetBrainsMono_400Regular", fontSize: 8, letterSpacing: 1, color: TEXT_DIM,
    textTransform: "uppercase",
  },
  itemSub: {
    fontFamily: "Fraunces_400Regular", fontSize: 13, color: TEXT, letterSpacing: -0.2, marginTop: 2,
  },
  sheetActions: { flexDirection: "row", gap: 8 },
  sheetSaveBtn: {
    flex: 1, height: 44, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER, backgroundColor: "transparent",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  sheetSaveBtnText: {
    fontFamily: "Inter_500Medium", fontSize: 13, color: TEXT,
  },
  sheetRemoveBtn: {
    flex: 1, height: 44, borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(239,83,80,0.35)", backgroundColor: "transparent",
    alignItems: "center", justifyContent: "center",
  },
  sheetRemoveBtnText: {
    fontFamily: "Inter_500Medium", fontSize: 13, color: "#EF5350",
  },
});
