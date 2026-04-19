import React from "react";
import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import type { ClothingItem } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface ItemCardProps {
  item: ClothingItem;
  onPress?: (item: ClothingItem) => void;
}

function FormalityDots({ level }: { level: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={[s.dot, i < level ? s.dotFilled : s.dotEmpty]}
        />
      ))}
    </View>
  );
}

export default function ItemCard({ item, onPress }: ItemCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        s.card,
        { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      {/* Image */}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={s.image}
          resizeMode="cover"
        />
      ) : (
        <View style={s.imagePlaceholder}>
          <Text style={s.imagePlaceholderText}>👔</Text>
        </View>
      )}

      {/* Info */}
      <View style={s.info}>
        {/* Category badge */}
        <View style={s.badge}>
          <Text style={s.badgeText}>
            {(CATEGORY_LABELS[item.category] || item.category).toUpperCase()}
          </Text>
        </View>

        {/* Subcategory */}
        {item.subcategory && (
          <Text style={s.subcategory} numberOfLines={1}>
            {item.subcategory.charAt(0).toUpperCase() +
              item.subcategory.slice(1).replace(/_/g, " ")}
          </Text>
        )}

        {/* Bottom row: colors + formality */}
        <View style={s.bottomRow}>
          <View style={s.colorRow}>
            {item.primary_color && (
              <View style={[s.colorDot, { backgroundColor: item.primary_color }]} />
            )}
            {item.secondary_colors?.slice(0, 2).map((color, i) => (
              <View
                key={i}
                style={[s.colorDotSmall, { backgroundColor: color.hex }]}
              />
            ))}
          </View>
          <FormalityDots level={item.formality} />
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  image: { width: "100%", aspectRatio: 1 },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: { fontSize: 32 },
  info: { padding: 10, paddingBottom: 12 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(212,165,116,0.14)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    color: "#D4A574",
    letterSpacing: 0.6,
  },
  subcategory: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#F5F5F5",
    letterSpacing: -0.1,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  colorRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  colorDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  dots: { flexDirection: "row", gap: 3, alignItems: "center" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotFilled: { backgroundColor: "#D4A574" },
  dotEmpty: { backgroundColor: "rgba(255,255,255,0.15)" },
});
