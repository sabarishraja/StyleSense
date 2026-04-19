import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import type {
  ClothingClassification,
  Category,
  Season,
} from "@/types";
import { CATEGORIES, CATEGORY_LABELS, SEASONS } from "@/types";

interface ClassificationReviewProps {
  classification: ClothingClassification;
  onConfirm: (updated: ClothingClassification) => void;
  onCancel: () => void;
  loading?: boolean;
}

const FORMALITY_LABELS = [
  "",
  "Very Casual",
  "Casual",
  "Smart Casual",
  "Semi-Formal",
  "Black Tie",
];

export default function ClassificationReview({
  classification,
  onConfirm,
  onCancel,
  loading = false,
}: ClassificationReviewProps) {
  const [edited, setEdited] = useState<ClothingClassification>({
    ...classification,
  });
  const [tagInput, setTagInput] = useState("");

  const updateField = <K extends keyof ClothingClassification>(
    key: K,
    value: ClothingClassification[K]
  ) => {
    setEdited((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSeason = (season: Season) => {
    setEdited((prev) => {
      const has = prev.seasons.includes(season);
      return {
        ...prev,
        seasons: has
          ? prev.seasons.filter((s) => s !== season)
          : [...prev.seasons, season],
      };
    });
  };

  const removeTag = (index: number) => {
    setEdited((prev) => ({
      ...prev,
      suggested_tags: prev.suggested_tags.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !edited.suggested_tags.includes(tag)) {
      setEdited((prev) => ({
        ...prev,
        suggested_tags: [...prev.suggested_tags, tag],
      }));
      setTagInput("");
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-2 pb-8">
      {/* Confidence indicator */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-text-secondary text-sm font-sans-medium">
          AI Confidence
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="w-24 h-2 bg-surface-light rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                edited.confidence > 0.8
                  ? "bg-success"
                  : edited.confidence > 0.5
                  ? "bg-warning"
                  : "bg-error"
              }`}
              style={{ width: `${edited.confidence * 100}%` }}
            />
          </View>
          <Text className="text-text-muted text-xs">
            {Math.round(edited.confidence * 100)}%
          </Text>
        </View>
      </View>

      {/* Category */}
      <Text className="text-text-secondary text-sm font-sans-medium mb-2">
        Category
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerStyle={{ gap: 6 }}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => updateField("category", cat)}
            className={`px-3 py-1.5 rounded-full border ${
              edited.category === cat
                ? "bg-accent border-accent"
                : "bg-surface border-surface-light"
            }`}
          >
            <Text
              className={`text-xs font-sans-medium ${
                edited.category === cat
                  ? "text-background"
                  : "text-text-secondary"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Subcategory */}
      <Text className="text-text-secondary text-sm font-sans-medium mb-2">
        Subcategory
      </Text>
      <TextInput
        value={edited.subcategory}
        onChangeText={(text) => updateField("subcategory", text)}
        placeholder="e.g. kurta, button-up, chinos"
        placeholderTextColor="#666"
        className="bg-surface border border-surface-light rounded-xl px-4 py-3 text-text-primary text-sm mb-4"
      />

      {/* Primary Color */}
      <Text className="text-text-secondary text-sm font-sans-medium mb-2">
        Primary Color
      </Text>
      <View className="flex-row items-center gap-3 mb-4">
        <View
          className="w-10 h-10 rounded-xl border-2 border-white/20"
          style={{ backgroundColor: edited.primary_color.hex }}
        />
        <View className="flex-1">
          <Text className="text-text-primary text-sm font-sans-medium">
            {edited.primary_color.name}
          </Text>
          <Text className="text-text-muted text-xs">
            {edited.primary_color.hex}
          </Text>
        </View>
      </View>

      {/* Secondary Colors */}
      {edited.secondary_colors.length > 0 && (
        <>
          <Text className="text-text-secondary text-sm font-sans-medium mb-2">
            Secondary Colors
          </Text>
          <View className="flex-row gap-2 mb-4">
            {edited.secondary_colors.map((color, i) => (
              <View key={i} className="items-center gap-1">
                <View
                  className="w-8 h-8 rounded-lg border border-white/10"
                  style={{ backgroundColor: color.hex }}
                />
                <Text className="text-text-muted text-xs">{color.name}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Formality */}
      <Text className="text-text-secondary text-sm font-sans-medium mb-2">
        Formality: {FORMALITY_LABELS[edited.formality]}
      </Text>
      <View className="flex-row gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((level) => (
          <Pressable
            key={level}
            onPress={() => updateField("formality", level)}
            className={`flex-1 py-2.5 rounded-xl items-center border ${
              edited.formality === level
                ? "bg-accent border-accent"
                : "bg-surface border-surface-light"
            }`}
          >
            <Text
              className={`text-sm font-sans-semibold ${
                edited.formality === level
                  ? "text-background"
                  : "text-text-secondary"
              }`}
            >
              {level}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Seasons */}
      <Text className="text-text-secondary text-sm font-sans-medium mb-2">
        Seasons
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {SEASONS.map((season) => {
          const isActive = edited.seasons.includes(season);
          return (
            <Pressable
              key={season}
              onPress={() => toggleSeason(season)}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-accent border-accent"
                  : "bg-surface border-surface-light"
              }`}
            >
              <Text
                className={`text-sm font-sans-medium capitalize ${
                  isActive ? "text-background" : "text-text-secondary"
                }`}
              >
                {season}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tags */}
      <Text className="text-text-secondary text-sm font-sans-medium mb-2">
        Tags
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-2">
        {edited.suggested_tags.map((tag, i) => (
          <Pressable
            key={i}
            onPress={() => removeTag(i)}
            className="bg-surface-light px-3 py-1.5 rounded-full flex-row items-center gap-1"
          >
            <Text className="text-text-primary text-xs">{tag}</Text>
            <Text className="text-text-muted text-xs">✕</Text>
          </Pressable>
        ))}
      </View>
      <View className="flex-row gap-2 mb-6">
        <TextInput
          value={tagInput}
          onChangeText={setTagInput}
          onSubmitEditing={addTag}
          placeholder="Add tag..."
          placeholderTextColor="#666"
          className="flex-1 bg-surface border border-surface-light rounded-xl px-4 py-2.5 text-text-primary text-sm"
        />
        <Pressable
          onPress={addTag}
          className="bg-surface-light px-4 rounded-xl justify-center"
        >
          <Text className="text-accent text-sm font-sans-semibold">Add</Text>
        </Pressable>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3 mt-2">
        <Pressable
          onPress={onCancel}
          className="flex-1 py-3.5 rounded-2xl border border-surface-light items-center"
          disabled={loading}
        >
          <Text className="text-text-secondary text-base font-sans-semibold">
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onConfirm(edited)}
          className={`flex-1 py-3.5 rounded-2xl items-center ${
            loading ? "bg-accent/50" : "bg-accent"
          }`}
          disabled={loading}
        >
          <Text className="text-background text-base font-sans-semibold">
            {loading ? "Saving..." : "Save to Closet"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
