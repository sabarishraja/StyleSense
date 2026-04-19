import React from "react";
import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/auth";
import { useClosetStore } from "@/store/closet";
import Constants from "expo-constants";

const ACCENT = "#D4A574";

function SectionLabel({ children }: { children: string }) {
  return <Text style={s.sectionLabel}>{children}</Text>;
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.infoRow, !last && s.infoRowBorder]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuthStore();
  const { items } = useClosetStore();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "??";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerLabel}>Account</Text>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      {/* Identity card */}
      <View style={s.identityCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <View style={s.identityInfo}>
          <Text style={s.identityEmail} numberOfLines={1}>{user?.email || "Unknown"}</Text>
          <Text style={s.identityMeta}>Member since {memberSince}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        {[
          { k: "Items", v: String(items.length) },
          { k: "Outfits", v: "—" },
          { k: "This week", v: String(items.filter((i) => {
            const d = new Date(i.created_at);
            const now = new Date();
            return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
          }).length) },
        ].map((stat, i) => (
          <View key={i} style={s.statCard}>
            <Text style={s.statValue}>{stat.v}</Text>
            <Text style={s.statKey}>{stat.k}</Text>
          </View>
        ))}
      </View>

      {/* About */}
      <SectionLabel>About</SectionLabel>
      <View style={s.infoGroup}>
        <InfoRow label="App Version" value={Constants.expoConfig?.version || "1.0.0"} />
        <InfoRow label="AI Model" value="Claude Sonnet 4.6" />
        <InfoRow label="Backend" value="Supabase" last />
      </View>

      <View style={{ height: 20 }} />

      {/* Sign out */}
      <Pressable
        onPress={handleSignOut}
        disabled={loading}
        style={({ pressed }) => [s.signOutBtn, { opacity: pressed || loading ? 0.75 : 1 }]}
      >
        <Text style={s.signOutText}>Sign Out</Text>
      </Pressable>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerSerif}>StyleSense</Text>
        <Text style={s.footerMono}>Built with Expo · Supabase · Claude</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#0A0A0A" },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  header: { marginBottom: 24 },
  headerLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10, letterSpacing: 1.5, color: ACCENT, textTransform: "uppercase", marginBottom: 4,
  },
  headerTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 34, color: "#F5F5F5", letterSpacing: -0.9, lineHeight: 36,
  },
  identityCard: {
    backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
    borderRadius: 20, padding: 20,
    flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 12,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(212,165,116,0.14)",
    borderWidth: 1, borderColor: ACCENT,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  avatarText: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 24, color: ACCENT, letterSpacing: -0.5,
  },
  identityInfo: { flex: 1, minWidth: 0 },
  identityEmail: {
    fontFamily: "Inter_400Regular",
    fontSize: 14, color: "#AAAAAA", letterSpacing: -0.05, marginBottom: 4,
  },
  identityMeta: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.2, color: "#6B6B6B", textTransform: "uppercase",
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
    borderRadius: 14, padding: 14,
  },
  statValue: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 24, color: "#F5F5F5", letterSpacing: -0.4, lineHeight: 26,
  },
  statKey: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.2, color: "#6B6B6B", textTransform: "uppercase", marginTop: 4,
  },
  sectionLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.5, color: "#AAAAAA",
    textTransform: "uppercase", marginBottom: 10, paddingLeft: 4,
  },
  infoGroup: {
    backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
    borderRadius: 20, overflow: "hidden",
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, paddingHorizontal: 16 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#1F1F1F" },
  infoLabel: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#F5F5F5", letterSpacing: -0.05 },
  infoValue: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#AAAAAA", letterSpacing: -0.05 },
  signOutBtn: {
    height: 52, borderRadius: 28,
    borderWidth: 1, borderColor: "rgba(239,83,80,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  signOutText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15, color: "#EF5350", letterSpacing: -0.1,
  },
  footer: { alignItems: "center", marginTop: 28 },
  footerSerif: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 16, color: "#6B6B6B", letterSpacing: -0.2, fontStyle: "italic",
  },
  footerMono: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.2, color: "#6B6B6B", textTransform: "uppercase", marginTop: 6,
  },
});
