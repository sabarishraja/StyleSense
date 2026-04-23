import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Image, Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClosetStore } from "@/store/closet";
import { useOutfitsStore } from "@/store/outfits";
import { router } from "expo-router";
import type { ClothingItem } from "@/types";

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

const OCCASIONS = [
  { id: "casual", label: "Casual", icon: "shirt-outline", desc: "Formality 1–2 · Everyday wear" },
  { id: "smart_casual", label: "Smart Casual", icon: "layers-outline", desc: "Formality 2–3 · Elevated everyday" },
  { id: "work", label: "Work", icon: "briefcase-outline", desc: "Formality 3–4 · Office appropriate" },
  { id: "formal", label: "Formal", icon: "ribbon-outline", desc: "Formality 4–5 · Special occasions" },
  { id: "date", label: "Date Night", icon: "wine-outline", desc: "Formality 3–4 · Evening ready" },
  { id: "ethnic", label: "Ethnic", icon: "flower-outline", desc: "Ethnic wear · All formality levels" },
] as const;

const LOADING_MSGS = [
  "Filtering your wardrobe...",
  "Building outfit combinations...",
  "Claude is styling..."
];

interface MockOutfit {
  id: string;
  name: string;
  items: ClothingItem[];
  desc: string;
  piecesStr: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

// --- Shimmer Skeleton Loader ---
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

// --- Status Chip Loader ---
function StatusChip() {
  const [msgIdx, setMsgIdx] = useState(0);
  const pulse = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Text interval
    const t = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MSGS.length), 1500);
    // Pulse animation
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

// --- Result Card ---
function OutfitResultCard({ outfit, index, occasionLabel, onRegenerate }: { outfit: MockOutfit, index: number, occasionLabel: string, onRegenerate: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    // Stagger in
    Animated.timing(anim, {
      toValue: 1,
      duration: 250,
      delay: index * 80,
      useNativeDriver: true
    }).start();
  }, []);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), 1200); // simulate local regen
    onRegenerate();
  };

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  if (isRegenerating) {
    return <SkeletonCard />;
  }

  const showItems = outfit.items.slice(0, 4);
  const extraCount = outfit.items.length > 4 ? outfit.items.length - 3 : 0;

  return (
    <Animated.View style={[s.resultCard, { opacity: anim, transform: [{ translateY }] }]}>
      <View style={s.resultCardHeader}>
        <Text style={s.resultCardTitle}>{outfit.name}</Text>
        <View style={s.resultCardBadge}>
          <Text style={s.resultCardBadgeText}>{occasionLabel}</Text>
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

      <View style={{ alignItems: "flex-end", marginTop: 14 }}>
        <Pressable
          onPress={handleRegenerate}
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
      </View>
    </Animated.View>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function OutfitsScreen() {
  const insets = useSafeAreaInsets();
  const { items } = useClosetStore();
  const { generateOutfits, outfitsByOccasion, clearOutfits } = useOutfitsStore();
  
  const [state, setState] = useState<ScreenState>("idle");
  const [occasion, setOccasion] = useState<string | null>(null);

  // Map generated IDs to actual ClothingItem objects from store to render images
  const results = (occasion && outfitsByOccasion[occasion] ? outfitsByOccasion[occasion] : []).map(o => {
    const realItems = o.item_ids.map(id => items.find(i => i.id === id)).filter(Boolean) as ClothingItem[];
    // Filter out invalid items just in case the AI hallucinates an ID
    return {
      id: o.id,
      name: o.name,
      items: realItems,
      piecesStr: realItems.map(i => i.subcategory || i.category).join(" · "),
      desc: o.description
    };
  });

  // Derived date
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const activeOccasionObj = OCCASIONS.find(o => o.id === occasion);

  const startGeneration = async () => {
    if (!occasion) return;
    
    // Determine state based on actual items
    if (items.length === 0) {
      setState("empty_closet");
      return;
    }
    if (items.length < 2) {
      setState("incomplete");
      return;
    }

    // Go to loading animation
    setState("loading");

    try {
      const returnedOutfits = await generateOutfits(occasion, items);
      
      if (!returnedOutfits || returnedOutfits.length === 0) {
        setState("incomplete"); // AI decided it couldn't build any outfits
      } else {
        setState("results");
      }
    } catch(err) {
      console.error(err);
      setState("error");
    }
  };

  const handleRegenerateOutfit = () => {
    // For now, regenerating forces a wipe of the active occasion and rerolls all 3 outfits.
    if(occasion) {
      clearOutfits(occasion);
      startGeneration();
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

  return (
    <View style={s.screen}>
      {renderHeader()}

      {/* Persistent Occasion Picker (always visible except maybe generic error) */}
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
                    state !== "idle" && !isActive && { opacity: 0.4 } // dim unselected during/after loading
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

      {/* Content Area */}
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
          "alert-triangle-outline", "Something went wrong", "Couldn't generate outfits. Try again.", "Try Again", reset, ERROR
        )}
      </View>

      {/* Floating Action / Loaders at bottom */}
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
  
  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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

  // Occasion Picker
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

  // Bottom Fixed
  bottomFixed: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 24, paddingTop: 10,
    backgroundColor: BG, // flat base, no gradient
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

  // Status Chip
  statusChipContainer: { alignItems: "center", justifyContent: "center", paddingBottom: 10 },
  statusChip: {
    backgroundColor: SURFACE, borderWidth: 1, borderColor: SURFACE2,
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },
  statusText: { fontFamily: "Inter_400Regular", fontSize: 13, color: TEXT_SEC },

  // Skeleton
  skeletonCard: {
    backgroundColor: SURFACE, borderRadius: 20, padding: 16,
    marginHorizontal: 16, marginBottom: 8, height: 180,
  },
  skelBadge: { width: 60, height: 20, borderRadius: 6, backgroundColor: SURFACE2 },
  skelImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: SURFACE2 },
  skelLine1: { height: 14, borderRadius: 4, backgroundColor: SURFACE2, width: "60%", marginBottom: 10 },
  skelLine2: { height: 14, borderRadius: 4, backgroundColor: SURFACE2, width: "40%" },

  // Results
  resultCard: {
    backgroundColor: SURFACE, borderRadius: 20, padding: 16,
    marginHorizontal: 16, marginBottom: 8,
  },
  resultCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
  regenBtn: {
    borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: "transparent"
  },
  regenText: { fontFamily: "Inter_400Regular", fontSize: 12 },

  startOverBtn: { alignItems: "center", paddingVertical: 20 },
  startOverText: { fontFamily: "Inter_500Medium", fontSize: 13, color: TEXT_SEC },

  // Empty States
  emptyStateWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingBottom: 60 },
  emptyTitle: { fontFamily: "Inter_500Medium", fontSize: 16, color: TEXT_SEC, marginBottom: 8, textAlign: "center" },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 13, color: TEXT_MUTED, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  emptyBtnOutlined: {
    borderWidth: 1, borderColor: ACCENT, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24,
  },
  emptyBtnTextOutlined: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: ACCENT },
});
