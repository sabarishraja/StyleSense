import React, { useState, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet, Animated,
  Dimensions, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { useOnboardingStore } from "@/store/onboarding";

const ACCENT = "#D4A574";
const BG = "#0A0A0A";
const SURFACE = "#1A1A1A";
const BORDER = "#2A2A2A";
const TEXT = "#F5F5F5";
const TEXT_MUTED = "#AAAAAA";
const TEXT_DIM = "#6B6B6B";

const TOTAL_WALKTHROUGH_STEPS = 3; // steps 1–3 (closet/outfits/profile)

// ─── Progress dots ──────────────────────────────────────────────
function Dots({ total, idx }: { total: number; idx: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === idx ? 22 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === idx ? ACCENT : "rgba(255,255,255,0.18)",
          }}
        />
      ))}
    </View>
  );
}

// ─── Top bar (dots + Skip) ──────────────────────────────────────
function TopBar({ step, onSkip }: { step: number; onSkip: () => void }) {
  return (
    <View style={s.topBar}>
      <Dots total={4} idx={step} />
      <Pressable onPress={onSkip} hitSlop={8} style={{ padding: 4 }}>
        <Text style={s.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

// ─── Primary button ─────────────────────────────────────────────
function PrimaryBtn({
  label,
  icon,
  variant = "solid",
  onPress,
}: {
  label: string;
  icon?: React.ReactNode;
  variant?: "solid" | "ghost";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        variant === "ghost" && s.btnGhost,
        { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Text style={[s.btnText, variant === "ghost" && s.btnTextGhost]}>{label}</Text>
      {icon && <View style={{ marginLeft: 6 }}>{icon}</View>}
    </Pressable>
  );
}

// ─── Step 0: Welcome ────────────────────────────────────────────
function Welcome({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      {/* ambient blob */}
      <View style={s.blob} pointerEvents="none" />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={s.kicker}>Welcome</Text>
        <Text style={s.welcomeTitle}>
          A wardrobe that{" "}
          <Text style={[s.welcomeTitle, { color: ACCENT, fontStyle: "italic" }]}>thinks</Text>
          {" "}with you.
        </Text>
        <Text style={s.welcomeBody}>
          Photograph a piece, and Claude tags fabric, formality, and pairings — so getting dressed feels effortless.
        </Text>
      </View>
      <View>
        <PrimaryBtn
          label="Take the tour"
          icon={<Ionicons name="arrow-forward" size={16} color="#000" />}
          onPress={onNext}
        />
        <Text style={s.tourHint}>3 quick screens · 20 seconds</Text>
      </View>
    </View>
  );
}

// ─── Closet illustration ─────────────────────────────────────────
function ClosetIllo() {
  const TILE_TONES = [
    { bg: "#2A2520", label: "// knit / cream" },
    { bg: "#1E2328", label: "// denim / indigo" },
    { bg: "#241E1E", label: "// wool / navy" },
    { bg: "#1E2420", label: "// cotton / olive" },
  ];
  return (
    <View style={{ width: "100%", maxWidth: 280, position: "relative" }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {TILE_TONES.map((tile, i) => (
          <View
            key={i}
            style={[
              s.garmentTile,
              {
                backgroundColor: tile.bg,
                borderColor: i === 0 ? ACCENT : BORDER,
                borderWidth: i === 0 ? 1.5 : 1,
                shadowColor: i === 0 ? ACCENT : "transparent",
                shadowOpacity: i === 0 ? 0.3 : 0,
                shadowRadius: i === 0 ? 8 : 0,
                elevation: i === 0 ? 4 : 0,
              },
            ]}
          >
            <Text style={s.tileLabel}>{tile.label}</Text>
            {i === 0 && (
              <View style={s.taggedBadge}>
                <Text style={s.taggedText}>tagged</Text>
              </View>
            )}
          </View>
        ))}
      </View>
      {/* floating count chip */}
      <View style={s.countChip}>
        <Text style={s.countChipText}>12 pieces</Text>
      </View>
    </View>
  );
}

// ─── Outfits illustration ────────────────────────────────────────
function OutfitsIllo() {
  const strips = [
    { bg: "#2A2520", label: "// knit / cream" },
    { bg: "#241E1E", label: "// wool / navy" },
    { bg: "#1E2420", label: "// cotton / olive" },
  ];
  return (
    <View style={{ width: "100%", maxWidth: 280, height: 240, position: "relative" }}>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", justifyContent: "center" }}>
        {strips.map((strip, i) => (
          <View
            key={i}
            style={[
              s.outfitStrip,
              {
                backgroundColor: strip.bg,
                transform: [
                  { translateY: i === 1 ? 12 : 0 },
                  { rotate: i === 0 ? "-3deg" : i === 2 ? "3deg" : "0deg" },
                ],
              },
            ]}
          />
        ))}
      </View>
      {/* sparkle center */}
      <View style={s.sparkleCircle}>
        <Text style={{ fontSize: 20, color: ACCENT }}>✦</Text>
      </View>
      {/* prompt chip */}
      <View style={s.promptChip}>
        <Text style={s.promptChipText}>"Dinner, smart-casual"</Text>
      </View>
    </View>
  );
}

// ─── Profile illustration ────────────────────────────────────────
function ProfileIllo() {
  const { user } = useAuthStore();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "ME";
  return (
    <View style={{ width: "100%", maxWidth: 280, alignItems: "center", gap: 16 }}>
      <View style={s.avatarLarge}>
        <Text style={s.avatarLargeText}>{initials}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {[
          { k: "Style", v: "Editorial" },
          { k: "Climate", v: "Temperate" },
          { k: "Notes", v: "Avoids beige" },
        ].map((pill) => (
          <View key={pill.k} style={s.profilePill}>
            <Text style={s.profilePillKey}>{pill.k}</Text>
            <Text style={s.profilePillVal}>{pill.v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Steps 1–3: Tab walkthrough ──────────────────────────────────
function TabWalkthrough({
  step,
  kicker,
  title,
  body,
  illustration,
  onNext,
  onBack,
  onSkip,
}: {
  step: number;
  kicker: string;
  title: string;
  body: string;
  illustration: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <TopBar step={step} onSkip={onSkip} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", minHeight: 240 }}>
          {illustration}
        </View>
        <View style={{ paddingBottom: 12 }}>
          <Text style={s.kicker}>{kicker}</Text>
          <Text style={s.walkthroughTitle}>{title}</Text>
          <Text style={s.walkthroughBody}>{body}</Text>
        </View>
      </View>
      <View style={[s.navRow, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={TEXT_MUTED} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <PrimaryBtn
            label="Next"
            icon={<Ionicons name="arrow-forward" size={16} color="#000" />}
            onPress={onNext}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Step 4: First upload prompt ─────────────────────────────────
function FirstUpload({
  onPhoto,
  onLibrary,
  onLater,
  onBack,
}: {
  onPhoto: () => void;
  onLibrary: () => void;
  onLater: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <TopBar step={4} onSkip={onLater} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 10, justifyContent: "space-between" }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={s.kicker}>Last step</Text>
          <Text style={s.walkthroughTitle}>
            Add your{" "}
            <Text style={[s.walkthroughTitle, { color: ACCENT, fontStyle: "italic" }]}>first piece</Text>
            .
          </Text>
          <Text style={[s.walkthroughBody, { marginBottom: 24 }]}>
            One photo is enough to start. Claude will tag it in seconds — fabric, color, formality, season.
          </Text>

          {/* ghost frame illustration */}
          <View style={s.ghostFrame}>
            <View style={s.ghostCameraIcon}>
              <Ionicons name="camera-outline" size={28} color={ACCENT} />
            </View>
            <Text style={s.ghostHint}>Plain bg · good light · one piece</Text>
          </View>
        </View>

        <View style={[{ paddingBottom: insets.bottom + 20 }, { gap: 10 }]}>
          <PrimaryBtn
            label="Take Photo"
            icon={<Ionicons name="camera" size={16} color="#000" />}
            onPress={onPhoto}
          />
          <PrimaryBtn
            label="Choose from Library"
            icon={<Ionicons name="images-outline" size={16} color={ACCENT} />}
            variant="ghost"
            onPress={onLibrary}
          />
          <Pressable onPress={onLater} style={{ padding: 8, marginTop: 2, alignItems: "center" }}>
            <Text style={s.laterText}>I'll do this later</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Main Onboarding screen ──────────────────────────────────────
export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { user } = useAuthStore();
  const { markSeen } = useOnboardingStore();

  const finish = async () => {
    if (user) await markSeen(user.id);
    router.replace("/(tabs)/closet");
  };

  const goToAdd = async () => {
    if (user) await markSeen(user.id);
    router.replace("/(tabs)/add");
  };

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const skip = () => setStep(4);

  if (step === 0) return <Welcome onNext={next} />;

  if (step === 1)
    return (
      <TabWalkthrough
        step={1}
        kicker="01 · Closet"
        title="Your wardrobe, photographed."
        body="Snap each piece once. Claude tags fabric, color, formality and seasons so you can find anything in two taps."
        illustration={<ClosetIllo />}
        onNext={next}
        onBack={back}
        onSkip={skip}
      />
    );

  if (step === 2)
    return (
      <TabWalkthrough
        step={2}
        kicker="02 · Outfits"
        title="Outfits that fit the moment."
        body="Tell Claude where you're going. It pulls from what you actually own — never recommends what isn't in your closet."
        illustration={<OutfitsIllo />}
        onNext={next}
        onBack={back}
        onSkip={skip}
      />
    );

  if (step === 3)
    return (
      <TabWalkthrough
        step={3}
        kicker="03 · Profile"
        title="The more it knows, the better it gets."
        body="Set your style, climate and any rules to live by. Every suggestion gets sharper from here."
        illustration={<ProfileIllo />}
        onNext={next}
        onBack={back}
        onSkip={skip}
      />
    );

  return (
    <FirstUpload
      onPhoto={goToAdd}
      onLibrary={goToAdd}
      onLater={finish}
      onBack={back}
    />
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
  },
  blob: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: `${ACCENT}15`,
  },

  // TopBar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: TEXT_MUTED,
    letterSpacing: -0.05,
  },

  // Typography
  kicker: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10,
    letterSpacing: 2,
    color: ACCENT,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  welcomeTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 42,
    fontWeight: "400",
    color: TEXT,
    letterSpacing: -1.2,
    lineHeight: 44,
    marginBottom: 16,
  },
  welcomeBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 23,
    maxWidth: 300,
  },
  walkthroughTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 32,
    color: TEXT,
    letterSpacing: -0.9,
    lineHeight: 34,
    marginBottom: 12,
  },
  walkthroughBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 22,
  },

  // Tour hint
  tourHint: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9,
    letterSpacing: 1.5,
    color: TEXT_DIM,
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 10,
  },

  // Buttons
  btn: {
    height: 54,
    borderRadius: 28,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: BORDER,
  },
  btnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#000",
    letterSpacing: -0.1,
  },
  btnTextGhost: {
    color: ACCENT,
  },

  // Nav row (Back + Next)
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  // Closet illustration
  garmentTile: {
    width: "47%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 8,
    overflow: "hidden",
    position: "relative",
  },
  tileLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 8,
    color: TEXT_DIM,
    letterSpacing: 0.5,
  },
  taggedBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(10,10,10,0.75)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  taggedText: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 8,
    letterSpacing: 1,
    color: ACCENT,
    textTransform: "uppercase",
  },
  countChip: {
    position: "absolute",
    bottom: -14,
    right: -6,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countChipText: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10,
    letterSpacing: 1.2,
    color: TEXT,
    textTransform: "uppercase",
  },

  // Outfits illustration
  outfitStrip: {
    width: 76,
    height: 200,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sparkleCircle: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -28,
    marginTop: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  promptChip: {
    position: "absolute",
    bottom: -12,
    alignSelf: "center",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  promptChipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: TEXT,
    letterSpacing: -0.05,
  },

  // Profile illustration
  avatarLarge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: `${ACCENT}20`,
    borderWidth: 1,
    borderColor: `${ACCENT}55`,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLargeText: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 40,
    color: TEXT,
    letterSpacing: -1,
  },
  profilePill: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profilePillKey: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9,
    letterSpacing: 1,
    color: TEXT_DIM,
    textTransform: "uppercase",
  },
  profilePillVal: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: TEXT,
    letterSpacing: -0.05,
  },

  // First upload
  ghostFrame: {
    width: "100%",
    aspectRatio: 5 / 3,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderStyle: "dashed",
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ghostCameraIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${ACCENT}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostHint: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9,
    letterSpacing: 1.5,
    color: TEXT_DIM,
    textTransform: "uppercase",
  },
  laterText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: TEXT_MUTED,
    letterSpacing: -0.05,
  },
});
