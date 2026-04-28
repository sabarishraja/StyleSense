import "../global.css";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/auth";
import { useOnboardingStore } from "@/store/onboarding";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
} from "@expo-google-fonts/fraunces";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";

export default function RootLayout() {
  const { user, initialized, initialize } = useAuthStore();
  const { seen, checking, checkSeen } = useOnboardingStore();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_400Regular,
    Fraunces_500Medium,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user) checkSeen(user.id);
  }, [user]);

  useEffect(() => {
    if (!initialized || checking) return;
    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";

    if (!user && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      if (!seen) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)/closet");
      }
    } else if (user && !seen && !inOnboarding) {
      router.replace("/onboarding");
    }
  }, [user, initialized, segments, seen, checking]);

  if (!initialized || !fontsLoaded) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#D4A574" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0A0A0A" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
