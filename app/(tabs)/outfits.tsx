import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const ACCENT = "#D4A574";

function OutfitCardStack() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const float = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  const cards = [
    { label: "// denim / indigo", tone: "#1a2a3a", rotate: "4deg", top: 130, zIndex: 1, width: 145 },
    { label: "// cotton / ecru", tone: "#2a2520", rotate: "1deg", top: 65, zIndex: 2, width: 170 },
    { label: "// silk / ivory", tone: "#2e2820", rotate: "-5deg", top: 0, zIndex: 3, width: 160 },
  ];

  return (
    <View style={s.stackWrap}>
      {cards.map((card, i) => (
        <Animated.View
          key={i}
          style={[
            s.outfitCard,
            {
              width: card.width,
              top: card.top,
              zIndex: card.zIndex,
              transform: [{ rotate: card.rotate }, { translateY: i === 2 ? float : 0 }],
            },
          ]}
        >
          <View style={[s.cardImage, { backgroundColor: card.tone }]}>
            <Text style={s.cardLabel}>{card.label}</Text>
          </View>
          <View style={s.cardFooter}>
            <Text style={s.cardFooterText}>{["FOOTWEAR", "BOTTOM", "TOP"][i]}</Text>
            <View style={s.dotRow2}>
              {[0, 1, 2].map((d) => (
                <View key={d} style={[s.dot, d < [2, 3, 4][i] ? s.dotFilled : s.dotEmpty]} />
              ))}
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const LOOKS = [
  { name: "After Work", mood: "polished · evening" },
  { name: "Sunday Market", mood: "relaxed · spring" },
  { name: "Dinner in Rome", mood: "warm · summer" },
];

export default function OutfitsScreen() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % LOOKS.length), 3200);
    return () => clearInterval(t);
  }, []);
  const current = LOOKS[idx];

  return (
    <View style={s.flex}>
      <View style={s.header}>
        <Text style={s.headerLabel}>Milestone 02</Text>
        <Text style={s.headerTitle}>Outfits</Text>
        <Text style={s.headerBody}>
          Claude will mix your wardrobe into looks. Here is a preview of what is coming.
        </Text>
      </View>

      <View style={s.stage}>
        <OutfitCardStack />
      </View>

      <View style={s.outfitMeta}>
        <Text style={s.outfitName}>"{current.name}"</Text>
        <Text style={s.outfitMood}>{current.mood}</Text>
      </View>

      <View style={s.dotRow}>
        {LOOKS.map((_, i) => (
          <View
            key={i}
            style={[s.indicator, {
              width: i === idx ? 18 : 6,
              backgroundColor: i === idx ? ACCENT : "#2A2A2A",
            }]}
          />
        ))}
      </View>

      <View style={s.comingSoonCard}>
        <View style={s.badge}>
          <View style={s.badgeDot} />
          <Text style={s.badgeText}>Coming Soon</Text>
        </View>
        <Text style={s.comingSoonBody}>
          Join the waitlist and we will let you know when Outfits ships.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: {
    flex: 1, backgroundColor: "#0A0A0A",
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32,
  },
  header: { marginBottom: 4 },
  headerLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10, letterSpacing: 1.5, color: ACCENT, textTransform: "uppercase", marginBottom: 4,
  },
  headerTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 34, color: "#F5F5F5", letterSpacing: -0.9, lineHeight: 36,
  },
  headerBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13, color: "#AAAAAA", marginTop: 6, letterSpacing: -0.05, maxWidth: 280,
  },
  stage: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 300, marginTop: 12 },
  stackWrap: { position: "relative", width: 220, height: 290 },
  outfitCard: {
    position: "absolute", left: "50%", marginLeft: -85,
    borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: "#2A2A2A", backgroundColor: "#1A1A1A",
    shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardImage: {
    width: "100%", aspectRatio: 1,
    alignItems: "flex-start", justifyContent: "flex-end", padding: 8,
  },
  cardLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 0.5, color: "rgba(255,255,255,0.4)",
  },
  cardFooter: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 8, paddingHorizontal: 10,
    borderTopWidth: 1, borderTopColor: "#2A2A2A",
  },
  cardFooterText: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 0.8, color: "#AAAAAA", textTransform: "uppercase",
  },
  dotRow2: { flexDirection: "row", gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotFilled: { backgroundColor: ACCENT },
  dotEmpty: { backgroundColor: "rgba(255,255,255,0.15)" },
  outfitMeta: { alignItems: "center", marginBottom: 14 },
  outfitName: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 26, color: "#F5F5F5", letterSpacing: -0.5, fontStyle: "italic", textAlign: "center",
  },
  outfitMood: {
    marginTop: 6, fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10, letterSpacing: 1.2, color: "#AAAAAA", textTransform: "uppercase",
  },
  dotRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 18 },
  indicator: { height: 6, borderRadius: 3 },
  comingSoonCard: {
    padding: 20, backgroundColor: "#1A1A1A",
    borderWidth: 1, borderColor: "#2A2A2A", borderRadius: 20, alignItems: "center",
  },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    height: 24, paddingHorizontal: 10, borderRadius: 999,
    backgroundColor: "rgba(212,165,116,0.14)", marginBottom: 10,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: ACCENT },
  badgeText: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.5, color: ACCENT, textTransform: "uppercase",
  },
  comingSoonBody: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 16, color: "#F5F5F5", letterSpacing: -0.3, textAlign: "center", maxWidth: 260,
  },
});
