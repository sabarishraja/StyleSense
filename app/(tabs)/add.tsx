import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, Pressable, Image, ActivityIndicator,
  Alert, StyleSheet, Animated, ScrollView, TextInput, Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useClosetStore } from "@/store/closet";
import { useAuthStore } from "@/store/auth";
import { CATEGORIES, CATEGORY_LABELS } from "@/types";
import type { ClothingClassification, Category, Season } from "@/types";

const ACCENT = "#C9A96E";
const BG = "#000000";
const SURFACE = "#1C1C1C";
const BORDER = "#242424";
const TEXT = "#FFFFFF";
const TEXT_DIM = "#888888";
const TEXT_MUTED = "#505050";
const BTN_ACCENT = "#d2a575ff";

type Phase = "capture" | "analyzing" | "form" | "saving";

const FORMALITY_LABELS = ["", "Very Casual", "Casual", "Smart Casual", "Semi-Formal", "Black Tie"];
const SEASONS_LIST: Season[] = ["spring", "summer", "fall", "winter"];

function ScanOverlay() {
  const line = useRef(new Animated.Value(0)).current;
  const chip = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(line, { toValue: 1, duration: 2500, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(chip, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(chip, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[s.scanBeam, {
        transform: [{ translateY: line.interpolate({ inputRange: [0, 1], outputRange: [0, 380] }) }],
      }]} />
      <Animated.View style={[s.scanChip, { opacity: chip }]}>
        <View style={s.scanDot} />
        <Text style={s.scanChipText}>/usr/claude / vision_processing</Text>
      </Animated.View>
    </View>
  );
}

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const [phase, setPhase] = useState<Phase>("capture");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [classification, setClassification] = useState<ClothingClassification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState("");
  const [category, setCategory] = useState<Category>("top");
  const [formality, setFormality] = useState(2);
  const [seasons, setSeasons] = useState<Set<Season>>(new Set());
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { uploadAndClassify, addItem } = useClosetStore();
  const { user } = useAuthStore();

  // Re-entry guard: setState is async, so `disabled={saving}` alone can't block
  // a double-tap in the ~16ms before React re-renders. This ref blocks it immediately.
  const savingRef = useRef(false);

  const reset = () => {
    setPhase("capture"); setImageUri(null); setStoragePath(null);
    setClassification(null); setError(null); setTagInput("");
    savingRef.current = false;
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      setError(null);
      if (useCamera) {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) { Alert.alert("Permission needed", "Camera access required."); return; }
      } else {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) { Alert.alert("Permission needed", "Photo library access required."); return; }
      }
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.85 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [3, 4], quality: 0.85 });

      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const detected = asset.mimeType || "image/jpeg";
      setImageUri(asset.uri);
      setMimeType(detected);
      setPhase("analyzing");
      if (!user) { setError("Not authenticated"); setPhase("capture"); return; }
      const { storagePath: path, classification: cls } = await uploadAndClassify(asset.uri, detected, user.id);
      setStoragePath(path);
      setClassification(cls);
      setSubcategory(cls.subcategory);
      setCategory(cls.category);
      setFormality(cls.formality);
      setSeasons(new Set(cls.seasons));
      setTags(cls.suggested_tags);
      setPhase("form");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setPhase("capture");
    }
  };

  const toggleSeason = (s: Season) => {
    setSeasons(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags(p => [...p, t]); setTagInput(""); }
  };

  const handleSave = async () => {
    if (savingRef.current) return;
    if (!imageUri || !storagePath || !classification || !user) return;
    savingRef.current = true;
    setPhase("saving");
    try {
      await addItem(imageUri, mimeType, {
        ...classification, category, subcategory, formality,
        seasons: [...seasons], suggested_tags: tags,
      }, storagePath, user.id);
      reset();
      router.replace("/(tabs)/closet");
    } catch (err: any) {
      setError(err.message || "Failed to save");
      setPhase("form");
      savingRef.current = false;
    }
  };

  // ── CAPTURE ──────────────────────────────────────────────────
  if (phase === "capture") {
    return (
      <View style={[s.flex, s.captureContainer, { paddingTop: insets.top, paddingBottom: insets.bottom || 32 }]}>

        {/* Top Header */}
        <View style={s.captureTop}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : null} style={s.closeBtn}>
            <Ionicons name="close" size={20} color={TEXT_DIM} />
          </Pressable>
          <Text style={s.headerTitle}>NEW ITEM</Text>
          <View style={{ width: 40 }} />
        </View>

        {error && (
          <View style={{ paddingHorizontal: 24, marginTop: 10 }}>
            <Pressable onPress={() => setError(null)} style={s.errorBanner}>
              <Text style={s.errorText}>{error}</Text>
            </Pressable>
          </View>
        )}

        {/* Center Content */}
        <View style={s.captureCenter}>
          <View style={s.cameraIconBox}>
            <Ionicons name="camera-outline" size={36} color={BTN_ACCENT} />
          </View>

          <View style={s.textBlock}>
            <Text style={s.captureTitle}>Show Claude{"\n"}the garment.</Text>
            <Text style={s.captureSub}>Plain background, good light. One piece{"\n"}at a time.</Text>
          </View>

          {/* Action Buttons (Moved directly under text) */}
          <View style={s.actionBlock}>
            <Pressable
              onPress={() => pickImage(true)}
              style={({ pressed }) => [{ ...s.primaryBtnFull }, { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <Ionicons name="camera-outline" size={22} color="#0A0A0A" />
              <Text style={s.primaryBtnTextFull}>Take Photo</Text>
            </Pressable>
            <Pressable
              onPress={() => pickImage(false)}
              style={({ pressed }) => [{ ...s.secondaryBtnFull }, { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <Ionicons name="images-outline" size={22} color={TEXT} />
              <Text style={s.secondaryBtnTextFull}>Choose from Library</Text>
            </Pressable>
          </View>
        </View>

        {/* Empty view for spacing to keep center aligned */}
        <View style={{ height: 44 }} />
      </View>
    );
  }

  // ── ANALYZING + FORM ─────────────────────────────────────────
  const analyzing = phase === "analyzing";
  const saving = phase === "saving";

  return (
    <View style={s.flex}>
      <ScrollView
        style={s.flex}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo — starts just below dynamic island */}
        <View style={[s.photoWrap, { marginTop: insets.top }]}>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={[s.photo, analyzing && s.photoAnalyzing]}
              resizeMode="cover"
            />
          )}
          {analyzing && <ScanOverlay />}

          {/* Thin Brackets during analyzing */}
          {analyzing && (
            <>
              <View style={[s.thinBracket, s.thinBracketTL]} />
              <View style={[s.thinBracket, s.thinBracketTR]} />
              <View style={[s.thinBracket, s.thinBracketBL]} />
              <View style={[s.thinBracket, s.thinBracketBR]} />
            </>
          )}

          {/* Close button overlay */}
          <Pressable onPress={reset} style={s.photoClose}>
            <Ionicons name="close" size={16} color={TEXT} />
          </Pressable>

          {/* Bottom badge */}
          {!analyzing && classification && (
            <View style={s.detectedBadge}>
              <Text style={s.detectedStar}>✦</Text>
              <Text style={s.detectedLabel}>
                {CATEGORY_LABELS[classification.category]} · {Math.round(classification.confidence * 100)}%
              </Text>
            </View>
          )}
        </View>

        {analyzing && (
          <View style={s.analyzingBlock}>
            <Text style={s.analyzingTitle}>Assessing formality...</Text>

            <View style={s.progressContainer}>
              <View style={s.progressBarTrack}>
                <View style={s.progressBarFill} />
              </View>
              <View style={s.progressTextRow}>
                <Text style={s.progressMono}>CLAUDE SONNET 4.6</Text>
                <Text style={s.progressMono}>100%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Form content */}
        {!analyzing && classification && (
          <>
            {/* Name + category */}
            <View style={s.section}>
              <TextInput
                value={subcategory}
                onChangeText={setSubcategory}
                style={s.nameInput}
                placeholderTextColor={TEXT_MUTED}
                placeholder="Item name"
                returnKeyType="done"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {CATEGORIES.map(c => (
                  <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, category === c && s.chipOn]}>
                    <Text style={[s.chipText, category === c && s.chipTextOn]}>{CATEGORY_LABELS[c]}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={s.divider} />

            {/* Properties */}
            <View style={s.section}>
              {/* Color */}
              <View style={s.row}>
                <Text style={s.rowLabel}>Color</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, justifyContent: "flex-end", flexWrap: "wrap", paddingLeft: 20 }}>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    <View style={[s.colorSwatch, { backgroundColor: classification.primary_color.hex }]} />
                    {classification.secondary_colors?.map((c, i) => (
                      <View key={i} style={[s.colorSwatch, { backgroundColor: c.hex }]} />
                    ))}
                  </View>
                  <Text style={[s.rowValue, { textAlign: "right" }]} numberOfLines={2}>
                    {[classification.primary_color.name, ...(classification.secondary_colors || []).map(c => c.name)].join(', ')}
                  </Text>
                </View>
              </View>
              <View style={s.rowDivider} />

              {/* Formality */}
              <View style={s.row}>
                <View>
                  <Text style={s.rowLabel}>Formality</Text>
                  <Text style={s.rowSub}>{FORMALITY_LABELS[formality]}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 7 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Pressable key={n} onPress={() => setFormality(n)}
                      style={[s.fDot, n <= formality && s.fDotOn]} />
                  ))}
                </View>
              </View>
              <View style={s.rowDivider} />

              {/* Seasons */}
              <View style={s.row}>
                <Text style={s.rowLabel}>Seasons</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {SEASONS_LIST.map(s_ => {
                    const on = seasons.has(s_);
                    return (
                      <Pressable key={s_} onPress={() => toggleSeason(s_)}
                        style={[s.chip, on && s.chipOn, { paddingHorizontal: 10, paddingVertical: 5 }]}>
                        <Text style={[s.chipText, on && s.chipTextOn, { fontSize: 11 }]}>
                          {s_.charAt(0).toUpperCase() + s_.slice(1)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={s.divider} />

            {/* Tags */}
            <View style={s.section}>
              <Text style={s.monoLabel}>Tags · tap to remove</Text>
              <View style={s.tagsList}>
                {tags.map(t => (
                  <Pressable key={t} onPress={() => setTags(p => p.filter(x => x !== t))} style={s.tag}>
                    <Text style={s.tagText}>{t}</Text>
                    <Ionicons name="close" size={9} color={TEXT_MUTED} />
                  </Pressable>
                ))}
              </View>
              <View style={s.tagRow}>
                <TextInput
                  value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag}
                  placeholder="Add tag…" placeholderTextColor={TEXT_MUTED}
                  style={s.tagInput} returnKeyType="done"
                />
                <Pressable onPress={addTag} style={s.tagAddBtn}>
                  <Text style={s.tagAddText}>Add</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Save CTA — always visible at bottom */}
      {!analyzing && classification && (
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, paddingBottom: insets.bottom || 24, backgroundColor: BG }}>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              { width: "100%", height: 56, borderRadius: 28, backgroundColor: "transparent", borderWidth: 1, borderColor: BTN_ACCENT, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
              { opacity: pressed || saving ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#FFFFFF" }}>Save to Closet</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BG },

  captureContainer: {
    justifyContent: "space-between",
  },
  captureTop: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1E1E1E',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10, letterSpacing: 2, color: TEXT_DIM,
  },
  captureCenter: {
    alignItems: "center", justifyContent: "center", flex: 1,
  },
  cameraIconBox: {
    width: 88, height: 88, borderRadius: 30,
    backgroundColor: '#262018',
    borderWidth: 1, borderColor: 'rgba(212,165,116,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 44,
  },
  actionBlock: {
    width: "100%",
    paddingHorizontal: 32,
    marginTop: 40,
    gap: 16,
  },
  primaryBtnFull: {
    width: "100%", height: 56, borderRadius: 28, backgroundColor: "#ffffffff",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  primaryBtnTextFull: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#ffffffff" },
  secondaryBtnFull: {
    width: "100%", height: 56, borderRadius: 28, backgroundColor: '#0A0A0A',
    borderWidth: 1, borderColor: '#2A2A2A',
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  secondaryBtnTextFull: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: '#FFFFFF' },

  textBlock: { alignItems: "center", paddingHorizontal: 24 },
  stepLabel: {
    fontFamily: "JetBrainsMono_400Regular", fontSize: 10,
    letterSpacing: 2.5, color: BTN_ACCENT, marginBottom: 16,
  },
  captureTitle: {
    fontFamily: "Fraunces_400Regular", fontSize: 36, color: TEXT,
    letterSpacing: -0.5, marginBottom: 16, textAlign: "center", lineHeight: 40,
  },
  captureSub: {
    fontFamily: "Inter_400Regular", fontSize: 15, color: TEXT_DIM,
    textAlign: "center", lineHeight: 22,
  },

  errorBanner: {
    padding: 12, backgroundColor: "rgba(239,83,80,0.08)", borderWidth: 1,
    borderColor: "rgba(239,83,80,0.25)", borderRadius: 12,
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#EF5350", textAlign: "center" },

  // Photo / Analyzing layout
  photoWrap: {
    width: "84%", alignSelf: "center", borderRadius: 24, overflow: "hidden",
    aspectRatio: 1, position: "relative", backgroundColor: '#1A1816',
    borderWidth: 1, borderColor: '#2A251E',
  },
  photo: { width: "100%", height: "100%" },
  photoAnalyzing: { opacity: 0.15 },
  photoClose: {
    position: "absolute", top: 16, left: 16,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
  },

  thinBracket: { position: 'absolute', width: 16, height: 16, borderColor: BTN_ACCENT },
  thinBracketTL: { top: 16, left: 16, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  thinBracketTR: { top: 16, right: 16, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  thinBracketBL: { bottom: 16, left: 16, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  thinBracketBR: { bottom: 16, right: 16, borderBottomWidth: 1.5, borderRightWidth: 1.5 },

  scanBeam: {
    position: "absolute", left: 0, right: 0, height: 1.5, backgroundColor: BTN_ACCENT,
    shadowColor: BTN_ACCENT, shadowOpacity: 1, shadowRadius: 10,
  },
  scanChip: {
    position: "absolute", bottom: 16, left: 16,
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  scanDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: BTN_ACCENT },
  scanChipText: { fontFamily: "JetBrainsMono_400Regular", fontSize: 9, color: TEXT_DIM, letterSpacing: 0.5 },

  analyzingBlock: {
    alignItems: 'center', marginTop: 32, paddingHorizontal: 24,
  },
  analyzingTitle: {
    fontFamily: "Fraunces_400Regular", fontSize: 26, color: TEXT,
    letterSpacing: -0.5, marginBottom: 40,
  },

  progressContainer: { width: '100%' },
  progressBarTrack: { height: 2, backgroundColor: '#2A2A2A', width: '100%', borderRadius: 1 },
  progressBarFill: { height: 2, backgroundColor: BTN_ACCENT, width: '100%', borderRadius: 1 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  progressMono: { fontFamily: "JetBrainsMono_400Regular", fontSize: 9, color: TEXT_DIM, letterSpacing: 1 },

  detectedBadge: {
    position: "absolute", bottom: 14, left: 14,
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 11, paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(201,169,110,0.3)",
  },
  detectedStar: { color: ACCENT, fontSize: 9 },
  detectedLabel: { fontFamily: "Inter_500Medium", fontSize: 11, color: TEXT },

  // Form
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  divider: { height: 1, backgroundColor: BORDER },
  row: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 14,
  },
  rowDivider: { height: 1, backgroundColor: "#1A1A1A" },
  rowLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: TEXT },
  rowSub: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 8, letterSpacing: 1, color: TEXT_MUTED, textTransform: "uppercase", marginTop: 3,
  },
  rowValue: { fontFamily: "Inter_400Regular", fontSize: 14, color: TEXT_DIM },
  colorSwatch: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  fDot: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, borderColor: BORDER },
  fDotOn: { backgroundColor: BTN_ACCENT, borderColor: BTN_ACCENT }, // matched to BTN_ACCENT for form interactables

  nameInput: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 24, color: TEXT, letterSpacing: -0.4,
    padding: 0, marginBottom: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 13, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: SURFACE,
  },
  chipOn: { backgroundColor: BTN_ACCENT, borderColor: BTN_ACCENT },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 12, color: TEXT_DIM },
  chipTextOn: { color: "#000" },

  monoLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 9, letterSpacing: 1.8, color: TEXT_MUTED,
    textTransform: "uppercase", marginBottom: 12,
  },
  tagsList: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 10 },
  tag: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: 16, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
  },
  tagText: { fontFamily: "Inter_400Regular", fontSize: 12, color: TEXT_DIM },
  tagRow: { flexDirection: "row", gap: 8 },
  tagInput: {
    flex: 1, height: 42, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 14,
    fontFamily: "Inter_400Regular", fontSize: 14, color: TEXT,
  },
  tagAddBtn: {
    height: 42, paddingHorizontal: 18,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  tagAddText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: BTN_ACCENT },

  footer: {
    backgroundColor: BG,
    borderTopWidth: 1, borderTopColor: BORDER,
    paddingHorizontal: 20, paddingTop: 14,
  },
});
