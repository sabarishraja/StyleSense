import React from "react";
import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import type { FilterKey } from "@/types";

const ACCENT = "#D4A574";

const FILTERS: { label: string; value: FilterKey }[] = [
  { label: "All", value: null },
  { label: "Tops", value: "top" },
  { label: "Bottoms", value: "bottom" },
  { label: "Outerwear", value: "outerwear" },
  { label: "Ethnic", value: "ethnic" },
  { label: "Footwear", value: "footwear" },
  { label: "Accessories", value: "accessory" },
];

interface CategoryFilterProps {
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}

export default function CategoryFilter({ activeFilter, onFilterChange }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.container}
      style={s.scroll}
    >
      {FILTERS.map(({ label, value }) => {
        const active = activeFilter === value;
        return (
          <Pressable
            key={label}
            onPress={() => onFilterChange(value)}
            style={({ pressed }) => [
              s.pill,
              active ? s.pillActive : s.pillInactive,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[s.pillText, active ? s.pillTextActive : s.pillTextInactive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { marginBottom: 0 },
  container: { paddingHorizontal: 16, paddingBottom: 12, gap: 8, flexDirection: "row" },
  pill: {
    height: 34, paddingHorizontal: 14, borderRadius: 999,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  pillActive: {
    borderColor: ACCENT,
    backgroundColor: "rgba(212,165,116,0.14)",
  },
  pillInactive: {
    borderColor: "#2A2A2A",
    backgroundColor: "transparent",
  },
  pillText: { fontFamily: "Inter_500Medium", fontSize: 13, letterSpacing: -0.05 },
  pillTextActive: { color: ACCENT, fontFamily: "Inter_600SemiBold" },
  pillTextInactive: { color: "#AAAAAA" },
});
