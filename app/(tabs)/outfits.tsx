import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Image, Dimensions, Alert
} from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClosetStore } from "@/store/closet";
import { useOutfitsStore } from "@/store/outfits";
import { router } from "expo-router";
import { getCurrentWeather, WEATHER_LABELS, WEATHER_ICONS, clearWeatherCache } from "@/lib/weather";
import WearHistorySheet from "@/components/WearHistorySheet";
import type { WeatherSnapshot } from "@/types";

// ============================================================================
// THEME CONSTANTS
// ============================================================================
const ACCENT = "#D4A574";
const BG = "#0A0A0A";
const SURFACE = "#1A1A1A";
const SURFACE2 = "#2A2A2A";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#888888";
const TEXT_MUTED = "#555555";
const ERROR = "#FF4444";

type ScreenState = "idle" | "loading" | "results" | "error" | "empty_closet" | "incomplete";
type ViewMode = "generate" | "saved";

const OCCASIONS = [
  { id: "casual", label: "Casual", icon: "shirt-outline", desc: "Formality 1–2 · Everyday wear" },
  { id: "smart_casual", label: "Smart Casual", icon: "layers-outline", desc: "Formality 2–3 · Elevated everyday" },
  { id: "work", label: "Work", icon: "briefcase-outline", desc: "Formality 3–4 · Office appropriate" },
  { id: "formal", label: "Formal", icon: "ribbon-outline", desc: "Formality 4–5 · Special occasions" },
  { id: "date", label: "Date Night", icon: "wine-outline", desc: "Formality 3–4 · Evening ready" },
  { id: "ethnic", label: "Ethnic", icon: "flower-outline", desc: "Ethnic wear · All formality levels" },
] as const;

const OCCASION_LABEL_BY_ID: Record<string, string> =
  OCCASIONS.reduce((acc, o) => ({ ...acc, [o.id]: o.label }), {} as Record<string, string>);

const LOADING_MSGS = [
  "Filtering your wardrobe...",
  "Building outfit combinations...",
  "Claude is styling..."
];

interface DisplayItem {
  id: string;
  image_url?: string;
  subcategory: string | null;
  category: string;
  missing?: boolean;
}

interface MockOutfit {
  id: string;
  name: string;
  items: DisplayItem[];
  desc: string;
  piecesStr: string;
  savedId: string | null;
  sourceGeneratedId?: string;
  source_suggestion_id: string | null;
  item_ids: string[];
}

// ============================================================================
// COMPONENTS
// ============================================================================

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <View style={s.skeletonCard}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 }}>
        <Animated.View style={[s.skelBadge, { opacity }]} />
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <Animated.View style={[s.skelImage, { opacity }]} />
        <Animated.View style={[s.skelImage, { opacity }]} />
        <Animated.View style={[s.skelImage, { opacity }]} />
      </View>
      <Animated.View style={[s.skelLine1, { opacity }]} />
      <Animated.View style={[s.skelLine2, { opacity }]} />
    </View>
  );
}

function StatusChip() {
  const [msgIdx, setMsgIdx] = useState(0);
  const pulse = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MSGS.length), 1500);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.2, duration: 600, useNativeDriver: true })
      ])
    ).start();
    return () => clearInterval(t);
  }, []);

  return (
    <View style={s.statusChipContainer}>
      <View style={s.statusChip}>
        <Animated.View style={[s.statusDot, { opacity: pulse }]} />
        <Text style={s.statusText}>{LOADING_MSGS[msgIdx]}</Text>
      </View>
    </View>
  );
}

function HeartBtn({ saved, onPress }: { saved: boolean; onPress: () => void }) {
  return (
    <Pressable hitSlop={8} onPress={onPress} style={s.heartBtn}>
      <Ionicons
        name={saved ? "heart" : "heart-outline"}
        size={22}
        color={saved ? ACCENT : TEXT_SEC}
      />
    </Pressable>
  );
}

// Stable no-op so generate-view cards skip the "Mark as Worn" button
function noop() {}

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
  const anim = useRef(new Animated.Value(0)).current;
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 250,
      delay: index * 80,
      useNativeDriver: true
    }).start();
  }, []);

  const handleRegenerate = () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), 1200);
    onRegenerate();
  };

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  if (isRegenerating) {
    return <SkeletonCard />;
  }

  const showItems = outfit.items.slice(0, 4);
  const extraCount = outfit.items.length > 4 ? outfit.items.length - 3 : 0;
  const isSavedCard = onOpenHistory !== noop;

  return (
    <Pressable onPress={onOpenHistory} style={s.cardTouchable}>
      <Animated.View style={[s.resultCard, { opacity: anim, transform: [{ translateY }] }]}>
        <View style={s.resultCardHeader}>
          <Text style={s.resultCardTitle}>{outfit.name}</Text>
          <View style={s.headerRight}>
            <View style={s.resultCardBadge}>
              <Text style={s.resultCardBadgeText}>{occasionLabel}</Text>
            </View>
            <HeartBtn saved={!!outfit.savedId} onPress={onToggleSave} />
          </View>
        </View>
        <View style={s.divider} />

        <View style={s.itemRow}>
          {showItems.map((item, i) => {
            if (i === 3 && extraCount > 0) {
              return (
                <View key="extra" style={s.extraItemBox}>
                  <Text style={s.extraItemText}>+{extraCount}</Text>
                </View>
              );
            }
            if (item.missing) {
              return (
                <View key={item.id} style={[s.itemImgBox, { opacity: 0.4 }]}>
                  <Ionicons name="trash-outline" color={TEXT_MUTED} size={20} />
                </View>
              );
            }
            return (
              <View key={item.id || i} style={s.itemImgBox}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={s.itemImg} />
                ) : (
                  <Ionicons name="shirt-outline" color={TEXT_MUTED} size={24} />
                )}
              </View>
            );
          })}
        </View>

        <Text style={s.piecesText}>{outfit.piecesStr}</Text>
        <Text style={s.reasonText}>"{outfit.desc}"</Text>

        <View style={s.cardActions}>
          {isSavedCard && (
            <Pressable
              onPress={(e) => { e.stopPropagation?.(); onLogWorn(); }}
              disabled={wornToday}
              style={[s.regenBtn, wornToday && s.wornBtn]}
            >
              <Text style={[s.regenText, wornToday && { color: ACCENT }]}>
                {wornToday ? "✓ Worn Today" : "Mark as Worn"}
              </Text>
            </Pressable>
          )}

          {showRegenerate && (
            <Pressable
              onPress={(e) => { e.stopPropagation?.(); handleRegenerate(); }}
              style={({ pressed }) => [
                s.regenBtn,
                { borderColor: pressed ? ACCENT : SURFACE2 }
              ]}
            >
              {({ pressed }) => (
                <Text style={[s.regenText, { color: pressed ? ACCENT : TEXT_SEC }]}>
                  ↺ Regenerate
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function OutfitsScreen() {
  const insets = useSafeAreaInsets();
  const { items } = useClosetStore();
  const {
    generateOutfits,
    outfitsByOccasion,
    clearOutfits,
    saveOutfit,
    unsaveOutfit,
    fetchSavedOutfits,
    savedOutfits,
    logWorn,
    wearLogsBySavedOutfit,
  } = useOutfitsStore();

  const [state, setState] = useState<ScreenState>("idle");
  const [occasion, setOccasion] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("generate");
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherChecked, setWeatherChecked] = useState(false);
  const [historySheet, setHistorySheet] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchSavedOutfits();
    refreshWeather();
  }, []);

  const refreshWeather = async () => {
    clearWeatherCache();
    const snapshot = await getCurrentWeather();
    setWeather(snapshot);
    setWeatherChecked(true);
  };

  const results: MockOutfit[] = useMemo(() => {
    if (!occasion) return [];
    const raw = outfitsByOccasion[occasion] || [];
    return raw.map(o => {
      const displayItems: DisplayItem[] = o.item_ids.map(id => {
        const found = items.find(i => i.id === id);
        if (!found) return { id, subcategory: null, category: "", missing: true };
        return {
          id: found.id,
          image_url: found.image_url,
          subcategory: found.subcategory,
          category: found.category,
        };
      });
      const piecesStr = displayItems
        .filter(d => !d.missing)
        .map(d => d.subcategory || d.category)
        .join(" · ");
      return {
        id: o.id,
        name: o.name,
        items: displayItems,
        desc: o.description,
        piecesStr,
        savedId: o.savedId,
        sourceGeneratedId: o.id,
        source_suggestion_id: o.source_suggestion_id,
        item_ids: o.item_ids,
      };
    });
  }, [occasion, outfitsByOccasion, items]);

  const savedResults: MockOutfit[] = useMemo(() => {
    return savedOutfits.map(so => {
      const displayItems: DisplayItem[] = so.item_ids.map(id => {
        const found = items.find(i => i.id === id);
        if (!found) return { id, subcategory: null, category: "", missing: true };
        return {
          id: found.id,
          image_url: found.image_url,
          subcategory: found.subcategory,
          category: found.category,
        };
      });
      const piecesStr = displayItems
        .filter(d => !d.missing)
        .map(d => d.subcategory || d.category)
        .join(" · ");
      return {
        id: so.id,
        name: so.name,
        items: displayItems,
        desc: so.description || "",
        piecesStr,
        savedId: so.id,
        source_suggestion_id: so.source_suggestion_id,
        item_ids: so.item_ids,
      };
    });
  }, [savedOutfits, items]);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const todayStr = today.toISOString().split("T")[0];

  const activeOccasionObj = OCCASIONS.find(o => o.id === occasion);

  const startGeneration = async () => {
    if (!occasion) return;

    if (items.length === 0) {
      setState("empty_closet");
      return;
    }
    if (items.length < 2) {
      setState("incomplete");
      return;
    }

    setState("loading");

    try {
      const returnedOutfits = await generateOutfits(occasion, items, weather);
      if (!returnedOutfits || returnedOutfits.length === 0) {
        setState("incomplete");
      } else {
        setState("results");
      }
    } catch (err) {
      console.error(err);
      setState("error");
    }
  };

  const handleRegenerateOutfit = () => {
    if (occasion) {
      clearOutfits(occasion);
      startGeneration();
    }
  };

  const handleToggleSave = async (occ: string, outfit: MockOutfit) => {
    try {
      if (outfit.savedId) {
        await unsaveOutfit(occ, outfit.savedId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await saveOutfit(occ, {
          id: outfit.sourceGeneratedId || outfit.id,
          name: outfit.name,
          item_ids: outfit.item_ids,
          description: outfit.desc,
          source_suggestion_id: outfit.source_suggestion_id,
          savedId: null,
        }, weather);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      console.warn("[outfits] toggle save failed:", err?.message || err);
    }
  };

  const handleUnsaveFromSavedView = async (savedOutfit: MockOutfit) => {
    try {
      const so = savedOutfits.find(x => x.id === savedOutfit.id);
      if (!so || !savedOutfit.savedId) return;
      await unsaveOutfit(so.occasion, savedOutfit.savedId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      console.warn("[outfits] unsave failed:", err?.message || err);
    }
  };

  const handleLogWorn = async (savedOutfitId: string) => {
    try {
      await logWorn(savedOutfitId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Couldn't log", "Please try again.");
    }
  };

  const reset = () => {
    setState("idle");
    setOccasion(null);
  };

  // --- RENDERS ---

  const renderHeader = () => (
    <View style={[s.header, { paddingTop: insets.top || 16 }]}>
      <Text style={s.headerLabel}>THE OUTFITS</Text>
      <Text style={s.headerTitle}>Styled For You</Text>
      <Text style={s.headerDate}>{dateStr}</Text>
      {renderWeatherChip()}
    </View>
  );

  const renderWeatherChip = () => {
    if (weather) {
      return (
        <Pressable onPress={refreshWeather} style={s.weatherChip} hitSlop={6}>
          <Ionicons name={WEATHER_ICONS[weather.condition] as any} size={14} color={ACCENT} />
          <Text style={s.weatherChipText}>
            {weather.temp_c}°C · {WEATHER_LABELS[weather.condition]}
          </Text>
        </Pressable>
      );
    }
    if (weatherChecked) {
      return (
        <Pressable onPress={refreshWeather} style={[s.weatherChip, s.weatherChipMuted]} hitSlop={6}>
          <Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
          <Text style={[s.weatherChipText, { color: TEXT_MUTED }]}>
            Enable location for weather-aware picks
          </Text>
        </Pressable>
      );
    }
    return null;
  };

  const renderViewToggle = () => (
    <View style={s.toggleRow}>
      <Pressable
        onPress={() => setView("generate")}
        style={[s.togglePill, view === "generate" && s.togglePillActive]}
      >
        <Text style={[s.togglePillText, view === "generate" && s.togglePillTextActive]}>
          Generate
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setView("saved")}
        style={[s.togglePill, view === "saved" && s.togglePillActive]}
      >
        <Text style={[s.togglePillText, view === "saved" && s.togglePillTextActive]}>
          Saved {savedOutfits.length > 0 ? `(${savedOutfits.length})` : ""}
        </Text>
      </Pressable>
    </View>
  );

  const renderEmptyState = (icon: any, title: string, sub: string, actionLabel: string, onAction: () => void, iconColor = "#333333") => (
    <View style={s.emptyStateWrap}>
      <Ionicons name={icon} size={48} color={iconColor} style={{ marginBottom: 16 }} />
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptySub}>{sub}</Text>
      <Pressable onPress={onAction} style={s.emptyBtnOutlined}>
        <Text style={s.emptyBtnTextOutlined}>{actionLabel}</Text>
      </Pressable>
    </View>
  );

  // --- SAVED VIEW ---
  if (view === "saved") {
    return (
      <View style={s.screen}>
        {renderHeader()}
        {renderViewToggle()}
        <View style={s.contentArea}>
          {savedResults.length === 0 ? (
            renderEmptyState(
              "heart-outline",
              "No saved outfits yet",
              "Tap the heart on a generated outfit to keep it here.",
              "Generate Outfits",
              () => setView("generate")
            )
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {savedResults.map((r, i) => {
                const so = savedOutfits.find(x => x.id === r.id);
                const label = so ? (OCCASION_LABEL_BY_ID[so.occasion] || so.occasion) : "STYLE";
                const logs = wearLogsBySavedOutfit[r.id] || [];
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
            </ScrollView>
          )}
        </View>

        <WearHistorySheet
          visible={historySheet !== null}
          outfitId={historySheet?.id ?? ""}
          outfitName={historySheet?.name ?? ""}
          onClose={() => setHistorySheet(null)}
        />
      </View>
    );
  }

  // --- GENERATE VIEW ---
  return (
    <View style={s.screen}>
      {renderHeader()}
      {renderViewToggle()}

      {(state === "idle" || state === "loading" || state === "results") && (
        <View style={s.pickerSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickerScroll}>
            {OCCASIONS.map(occ => {
              const isActive = occasion === occ.id;
              return (
                <Pressable
                  key={occ.id}
                  onPress={() => state === "idle" && setOccasion(occ.id)}
                  style={[
                    s.tile,
                    isActive && s.tileActive,
                    state !== "idle" && !isActive && { opacity: 0.4 }
                  ]}
                >
                  <Ionicons name={occ.icon as any} size={18} color={isActive ? ACCENT : TEXT_MUTED} style={{ marginBottom: 6 }} />
                  <Text style={[s.tileLabel, isActive && { color: ACCENT }]}>{occ.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={s.descStrip}>
            <Text style={s.descText}>
              {activeOccasionObj ? activeOccasionObj.desc : "Select an occasion to style"}
            </Text>
          </View>
        </View>
      )}

      <View style={s.contentArea}>
        {state === "idle" && (
          <View style={{ flex: 1 }} />
        )}

        {state === "loading" && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </ScrollView>
        )}

        {state === "results" && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
          >
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
                onLogWorn={noop}
                onOpenHistory={noop}
              />
            ))}
            <Pressable onPress={reset} style={s.startOverBtn}>
              <Text style={s.startOverText}>Start Over</Text>
            </Pressable>
          </ScrollView>
        )}

        {state === "empty_closet" && renderEmptyState(
          "shirt-outline", "Your closet is empty", "Add some clothes to get started", "Add Item", () => router.push("/(tabs)/add")
        )}

        {state === "incomplete" && renderEmptyState(
          "extension-puzzle-outline", `Incomplete wardrobe for ${activeOccasionObj?.label}`, "You're missing enough items to complete an outfit.", "Add More Items", () => router.push("/(tabs)/add")
        )}

        {state === "error" && renderEmptyState(
          "alert-circle-outline", "Something went wrong", "Couldn't generate outfits. Try again.", "Try Again", reset, ERROR
        )}
      </View>

      {state === "idle" && (
        <View style={s.bottomFixed}>
          <Pressable
            onPress={startGeneration}
            disabled={!occasion}
            style={[s.generateBtn, !occasion && s.generateBtnDisabled]}
          >
            <Text style={[s.generateBtnText, !occasion && s.generateBtnTextDisabled]}>
              {occasion ? "Generate Outfits" : "Select an Occasion"}
            </Text>
          </Pressable>
        </View>
      )}

      {state === "loading" && (
        <View style={s.bottomFixed}>
          <StatusChip />
        </View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 11, letterSpacing: 3,
    color: ACCENT, textTransform: "uppercase", marginBottom: 6,
  },
  headerTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 42, color: TEXT, letterSpacing: -1, fontWeight: "300", lineHeight: 46,
  },
  headerDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 14, color: TEXT_SEC, marginTop: 4,
  },

  weatherChip: {
    alignSelf: "flex-start",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: SURFACE2,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  weatherChipMuted: {
    borderColor: SURFACE2,
  },
  weatherChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: TEXT_SEC,
  },

  toggleRow: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: SURFACE,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
    gap: 2,
  },
  togglePill: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  togglePillActive: { backgroundColor: SURFACE2 },
  togglePillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: TEXT_MUTED,
  },
  togglePillTextActive: { color: ACCENT },

  pickerSection: { marginBottom: 16 },
  pickerScroll: { paddingHorizontal: 16, gap: 10 },
  tile: {
    backgroundColor: SURFACE,
    borderWidth: 1, borderColor: SURFACE2,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18,
    alignItems: "center", justifyContent: "center",
    minWidth: 90,
  },
  tileActive: {
    borderColor: ACCENT,
    shadowColor: ACCENT, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  tileLabel: {
    fontFamily: "Inter_500Medium", fontSize: 13, color: TEXT_SEC,
  },
  descStrip: { paddingHorizontal: 16, marginTop: 12 },
  descText: {
    fontFamily: "Inter_400Regular", fontSize: 12, fontStyle: "italic", color: TEXT_MUTED,
  },

  contentArea: { flex: 1 },

  bottomFixed: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 24, paddingTop: 10,
    backgroundColor: BG,
  },
  generateBtn: {
    height: 52, backgroundColor: ACCENT, borderRadius: 14,
    alignItems: "center", justifyContent: "center"
  },
  generateBtnDisabled: { backgroundColor: SURFACE2 },
  generateBtnText: {
    fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#0A0A0A"
  },
  generateBtnTextDisabled: { color: TEXT_MUTED },

  statusChipContainer: { alignItems: "center", justifyContent: "center", paddingBottom: 10 },
  statusChip: {
    backgroundColor: SURFACE, borderWidth: 1, borderColor: SURFACE2,
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },
  statusText: { fontFamily: "Inter_400Regular", fontSize: 13, color: TEXT_SEC },

  skeletonCard: {
    backgroundColor: SURFACE, borderRadius: 20, padding: 16,
    marginHorizontal: 16, marginBottom: 8, height: 180,
  },
  skelBadge: { width: 60, height: 20, borderRadius: 6, backgroundColor: SURFACE2 },
  skelImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: SURFACE2 },
  skelLine1: { height: 14, borderRadius: 4, backgroundColor: SURFACE2, width: "60%", marginBottom: 10 },
  skelLine2: { height: 14, borderRadius: 4, backgroundColor: SURFACE2, width: "40%" },

  cardTouchable: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: SURFACE, borderRadius: 20, padding: 16,
  },
  resultCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  heartBtn: { padding: 2 },
  resultCardTitle: {
    fontFamily: "JetBrainsMono_400Regular", fontSize: 10, color: TEXT_MUTED, letterSpacing: 2, textTransform: "uppercase"
  },
  resultCardBadge: {
    backgroundColor: SURFACE2, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10,
  },
  resultCardBadgeText: {
    fontFamily: "JetBrainsMono_400Regular", fontSize: 10, color: ACCENT, textTransform: "uppercase",
  },
  divider: { height: 1, backgroundColor: SURFACE2, width: "100%", marginVertical: 12 },

  itemRow: { flexDirection: "row", gap: 8 },
  itemImgBox: {
    width: 76, height: 76, borderRadius: 12, backgroundColor: SURFACE2, overflow: "hidden", alignItems: "center", justifyContent: "center",
  },
  itemImg: { width: "100%", height: "100%", resizeMode: "cover" },
  extraItemBox: {
    width: 76, height: 76, borderRadius: 12, backgroundColor: SURFACE2, alignItems: "center", justifyContent: "center",
  },
  extraItemText: { fontFamily: "Inter_500Medium", fontSize: 13, color: TEXT_SEC },

  piecesText: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: TEXT_MUTED, marginTop: 10,
  },
  reasonText: {
    fontFamily: "Inter_400Regular", fontStyle: "italic", fontSize: 14, lineHeight: 20, color: "#CCCCCC", marginTop: 10,
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  regenBtn: {
    borderWidth: 1, borderColor: SURFACE2, borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 14, backgroundColor: "transparent",
  },
  wornBtn: {
    borderColor: ACCENT,
  },
  regenText: { fontFamily: "Inter_400Regular", fontSize: 12, color: TEXT_SEC },

  startOverBtn: { alignItems: "center", paddingVertical: 20 },
  startOverText: { fontFamily: "Inter_500Medium", fontSize: 13, color: TEXT_SEC },

  emptyStateWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingBottom: 60 },
  emptyTitle: { fontFamily: "Inter_500Medium", fontSize: 16, color: TEXT_SEC, marginBottom: 8, textAlign: "center" },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 13, color: TEXT_MUTED, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  emptyBtnOutlined: {
    borderWidth: 1, borderColor: ACCENT, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24,
  },
  emptyBtnTextOutlined: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: ACCENT },
});
