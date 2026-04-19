import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ActivityIndicator, StyleSheet,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuthStore } from "@/store/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const { signIn, loading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/closet");
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.flex}
    >
      <View style={s.container}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoIcon}>
            <Text style={{ fontSize: 22, color: "#D4A574" }}>✦</Text>
          </View>
          <Text style={s.logoText}>StyleSense</Text>
          <Text style={s.tagline}>Your AI-powered wardrobe.</Text>
        </View>

        {/* Error */}
        {error && (
          <Pressable onPress={clearError} style={s.errorBanner}>
            <Text style={s.errorText}>{error}</Text>
            <Text style={s.errorDismiss}>✕</Text>
          </Pressable>
        )}

        {/* Fields */}
        <View style={s.fields}>
          <View>
            <Text style={s.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#6B6B6B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={[s.input, emailFocused && s.inputFocused]}
            />
          </View>
          <View>
            <Text style={s.fieldLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••"
              placeholderTextColor="#6B6B6B"
              secureTextEntry
              autoComplete="password"
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              style={[s.input, passFocused && s.inputFocused]}
            />
          </View>
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            s.primaryBtn,
            { opacity: pressed || loading ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          {loading
            ? <ActivityIndicator color="#0A0A0A" />
            : <Text style={s.primaryBtnText}>Sign In</Text>
          }
        </Pressable>

        <View style={s.toggle}>
          <Text style={s.toggleText}>New here?</Text>
          <Link href="/auth/signup" asChild>
            <Pressable><Text style={s.toggleLink}> Create account</Text></Pressable>
          </Link>
        </View>

        <View style={{ flex: 1 }} />
        <Text style={s.footer}>v1.0 · Expo · Supabase · Claude</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#0A0A0A" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 },
  logoWrap: { alignItems: "center", marginBottom: 52 },
  logoIcon: {
    width: 56, height: 56, borderRadius: 18,
    borderWidth: 1, borderColor: "#D4A574",
    backgroundColor: "rgba(212,165,116,0.14)",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  logoText: {
    fontFamily: "Fraunces_400Regular", fontSize: 40,
    color: "#F5F5F5", letterSpacing: -1.2,
  },
  tagline: {
    fontFamily: "Inter_400Regular", fontSize: 13,
    color: "#AAAAAA", marginTop: 10, letterSpacing: 0.2,
  },
  errorBanner: {
    backgroundColor: "rgba(239,83,80,0.1)",
    borderWidth: 1, borderColor: "rgba(239,83,80,0.35)",
    borderRadius: 14, padding: 12, marginBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#EF5350", flex: 1 },
  errorDismiss: { color: "#EF5350", fontSize: 12, marginLeft: 8 },
  fields: { gap: 12, marginBottom: 20 },
  fieldLabel: {
    fontFamily: "JetBrainsMono_400Regular", fontSize: 9,
    letterSpacing: 1.5, color: "#AAAAAA",
    textTransform: "uppercase", marginBottom: 6, paddingLeft: 4,
  },
  input: {
    backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
    borderRadius: 16, color: "#F5F5F5", padding: 16, paddingHorizontal: 18,
    fontFamily: "Inter_400Regular", fontSize: 15, letterSpacing: -0.1,
  },
  inputFocused: { borderColor: "#AAAAAA" },
  primaryBtn: {
    height: 56, borderRadius: 28, backgroundColor: "#D4A574",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#D4A574", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: {
    fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#0A0A0A", letterSpacing: -0.1,
  },
  toggle: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 },
  toggleText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#AAAAAA" },
  toggleLink: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#D4A574" },
  footer: {
    textAlign: "center", fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.5, color: "#6B6B6B", textTransform: "uppercase",
  },
});
