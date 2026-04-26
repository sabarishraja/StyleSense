import React, { useMemo } from "react";
import {
  Modal, View, Text, Pressable, ScrollView, StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useClosetStore } from "@/store/closet";
import { SEASONS } from "@/types";
import type { Season } from "@/types";

const ACCENT = "#D4A574";
const BG = "#0A0A0A";
const SURFACE = "#1A1A1A";
const SURFACE2 = "#2A2A2A";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#888888";
const TEXT_MUTED = "#555555";

const SEASON_LABELS: Record<Season, string> = {
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
  spring: "Spring",
  all: "All-season",
};

function FormalityDots({ level, active }: { level: number; active: boolean }) {
  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i <= level ? (active ? ACCENT : TEXT_SEC) : SURFACE2,
          }}
        />
      ))}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  children,
}: {
  label?: string;
  active: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active && s.chipActive]}
    >
      {children ?? (
        <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
      )}
    </Pressable>
  );
}

export default function FilterSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const {
    items,
    seasonFilters,
    formalityFilters,
    tagFilters,
    setSeasonFilters,
    setFormalityFilters,
    setTagFilters,
    resetAdvancedFilters,
  } = useClosetStore();

  // Derive available tags from the user's actual closet, sorted by frequency
  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.tags || []) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [items]);

  const toggleSeason = (s: Season) => {
    setSeasonFilters(
      seasonFilters.includes(s)
        ? seasonFilters.filter((x) => x !== s)
        : [...seasonFilters, s]
    );
  };

  const toggleFormality = (f: number) => {
    setFormalityFilters(
      formalityFilters.includes(f)
        ? formalityFilters.filter((x) => x !== f)
        : [...formalityFilters, f]
    );
  };

  const toggleTag = (t: string) => {
    setTagFilters(
      tagFilters.includes(t)
        ? tagFilters.filter((x) => x !== t)
        : [...tagFilters, t]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.handle} />

        <View style={s.headerRow}>
          <Text style={s.title}>Filters</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={TEXT_SEC} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Season */}
          <Text style={s.sectionLabel}>SEASON</Text>
          <View style={s.chipRow}>
            {SEASONS.map((season) => (
              <Chip
                key={season}
                label={SEASON_LABELS[season]}
                active={seasonFilters.includes(season)}
                onPress={() => toggleSeason(season)}
              />
            ))}
          </View>

          {/* Formality */}
          <Text style={[s.sectionLabel, { marginTop: 22 }]}>FORMALITY</Text>
          <View style={s.chipRow}>
            {[1, 2, 3, 4, 5].map((level) => {
              const active = formalityFilters.includes(level);
              return (
                <Chip
                  key={level}
                  active={active}
                  onPress={() => toggleFormality(level)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[s.chipText, active && s.chipTextActive]}>{level}</Text>
                    <FormalityDots level={level} active={active} />
                  </View>
                </Chip>
              );
            })}
          </View>

          {/* Tags */}
          {availableTags.length > 0 && (
            <>
              <Text style={[s.sectionLabel, { marginTop: 22 }]}>TAGS</Text>
              <View style={s.chipRow}>
                {availableTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    active={tagFilters.includes(tag)}
                    onPress={() => toggleTag(tag)}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <View style={s.footer}>
          <Pressable onPress={resetAdvancedFilters} style={s.resetBtn}>
            <Text style={s.resetText}>Reset</Text>
          </Pressable>
          <Pressable onPress={onClose} style={s.doneBtn}>
            <Text style={s.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    maxHeight: "82%",
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: SURFACE2,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: SURFACE2,
    alignSelf: "center", marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 24, color: TEXT, fontWeight: "300",
  },
  sectionLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 11, letterSpacing: 2, color: ACCENT,
    marginBottom: 10,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: SURFACE,
    borderWidth: 1, borderColor: SURFACE2,
    borderRadius: 16,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  chipActive: {
    borderColor: ACCENT,
    backgroundColor: "#1F1A12",
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13, color: TEXT_SEC,
  },
  chipTextActive: { color: ACCENT },

  footer: {
    flexDirection: "row", gap: 12,
    paddingTop: 16,
    borderTopWidth: 1, borderColor: SURFACE2,
    marginTop: 8,
  },
  resetBtn: {
    flex: 1, height: 48, borderRadius: 14,
    borderWidth: 1, borderColor: SURFACE2,
    alignItems: "center", justifyContent: "center",
  },
  resetText: { fontFamily: "Inter_500Medium", fontSize: 14, color: TEXT_SEC },
  doneBtn: {
    flex: 2, height: 48, borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
  },
  doneText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#0A0A0A" },
});
