import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuthStore } from "@/store/auth";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const { signUp, loading, error, clearError } = useAuthStore();

  const handleSignup = async () => {
    setLocalError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      await signUp(email.trim(), password);
      router.replace("/(tabs)/closet");
    } catch {
      // Error is set in the store
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-5xl mb-3">✨</Text>
          <Text className="text-text-primary text-3xl font-sans-bold tracking-tight">
            Create Account
          </Text>
          <Text className="text-text-secondary text-base mt-1">
            Start building your smart closet
          </Text>
        </View>

        {/* Error */}
        {displayError && (
          <Pressable
            onPress={() => {
              setLocalError(null);
              clearError();
            }}
            className="bg-error/10 border border-error/30 px-4 py-3 rounded-xl mb-4"
          >
            <Text className="text-error text-sm text-center">
              {displayError}
            </Text>
          </Pressable>
        )}

        {/* Email */}
        <Text className="text-text-secondary text-sm font-sans-medium mb-1.5 ml-1">
          Email
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          className="bg-surface border border-surface-light rounded-2xl px-4 py-3.5 text-text-primary text-base mb-4"
        />

        {/* Password */}
        <Text className="text-text-secondary text-sm font-sans-medium mb-1.5 ml-1">
          Password
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Min 6 characters"
          placeholderTextColor="#666"
          secureTextEntry
          autoComplete="new-password"
          className="bg-surface border border-surface-light rounded-2xl px-4 py-3.5 text-text-primary text-base mb-4"
        />

        {/* Confirm Password */}
        <Text className="text-text-secondary text-sm font-sans-medium mb-1.5 ml-1">
          Confirm Password
        </Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          placeholderTextColor="#666"
          secureTextEntry
          className="bg-surface border border-surface-light rounded-2xl px-4 py-3.5 text-text-primary text-base mb-6"
        />

        {/* Sign Up button */}
        <Pressable
          onPress={handleSignup}
          disabled={loading}
          className={`py-4 rounded-2xl items-center ${
            loading ? "bg-accent/50" : "bg-accent"
          }`}
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0A" />
          ) : (
            <Text className="text-background text-base font-sans-bold">
              Create Account
            </Text>
          )}
        </Pressable>

        {/* Login link */}
        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-text-muted text-sm">
            Already have an account?
          </Text>
          <Link href="/auth/login" asChild>
            <Pressable>
              <Text className="text-accent text-sm font-sans-semibold">
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
