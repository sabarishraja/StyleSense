import React, { useState, useMemo } from "react";
import {
  View, Text, Pressable, Image, ActivityIndicator,
  StyleSheet, ScrollView, TextInput, Alert, Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useClosetStore } from "@/store/closet";
import { CATEGORIES, CATEGORY_LABELS } from "@/types";
import type { Category, Season } from "@/types";

const ACCENT = "#C9A96E";
const BG = "#000000";
const SURFACE = "#1C1C1C";
const BORDER = "#242424";
const TEXT = "#FFFFFF";
const TEXT_DIM = "#888888";
const TEXT_MUTED = "#505050";
const BTN_ACCENT = "#D4A574";

const FORMALITY_LABELS = ["", "Very Casual", "Casual", "Smart Casual", "Semi-Formal", "Black Tie"];
const SEASONS_LIST: Season[] = ["spring", "summer", "fall", "winter"];

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  
  const { items, updateItem, deleteItem } = useClosetStore();
  const item = useMemo(() => items.find(i => i.id === id), [items, id]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit State
  const [subcategory, setSubcategory] = useState("");
  const [category, setCategory] = useState<Category>("top");
  const [formality, setFormality] = useState(2);
  const [seasons, setSeasons] = useState<Set<Season>>(new Set());
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const startEditing = () => {
    if (!item) return;
    setSubcategory(item.subcategory || "");
    setCategory(item.category);
    setFormality(item.formality);
    setSeasons(new Set(item.seasons));
    setTags([...item.tags]);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await updateItem(item.id, {
        category,
        subcategory: subcategory.trim() || null,
        formality,
        seasons: Array.from(seasons),
        tags,
      });
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!item) return;
    Alert.alert(
      "Delete item?",
      "Remove this item from your closet? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
             await deleteItem(item.id);
             router.back();
          }
        }
      ]
    );
  };

  const toggleSeason = (s: Season) => {
    setSeasons(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags(p => [...p, t]); setTagInput(""); }
  };

  if (!item) {
    return (
      <View style={[s.flex, { alignItems: 'center', justifyContent: 'center' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: TEXT_DIM }}>Item not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: ACCENT }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const colorName = item.primary_color_name 
    ? item.primary_color_name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : "";
  const baseType = item.subcategory || item.category;
  const typeName = baseType ? baseType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "";
  const displayName = [colorName, typeName].filter(Boolean).join(" ");

  return (
    <View style={s.flex}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[s.header, { paddingTop: insets.top || 20 }]}>
        <Pressable onPress={() => { isEditing ? setIsEditing(false) : router.back() }} style={s.headerBtn}>
          <Ionicons name={isEditing ? "close" : "chevron-back"} size={24} color={TEXT} />
        </Pressable>
        {isEditing ? (
          <Text style={s.headerTitle}>Edit Item</Text>
        ) : (
          <View style={s.headerActions}>
            <Pressable onPress={startEditing} style={[s.headerBtn, { marginRight: 8 }]}>
              <Ionicons name="pencil" size={20} color={TEXT} />
            </Pressable>
            <Pressable onPress={handleDelete} style={s.headerBtn}>
              <Ionicons name="trash" size={20} color="#EF5350" />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={s.photoWrap}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={s.photo} resizeMode="cover" />
          ) : (
             <View style={[s.photo, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }]}>
                <Text style={{ fontSize: 64 }}>👔</Text>
             </View>
          )}
        </View>

        {!isEditing ? (
          // READ-ONLY
          <View style={s.section}>
            <Text style={s.displayTitle}>{displayName}</Text>
            
            <View style={s.badgeWrap}>
              <View style={s.badge}>
                <Text style={s.badgeText}>{(CATEGORY_LABELS[item.category] || item.category).toUpperCase()}</Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.row}>
              <Text style={s.rowLabel}>Color</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {item.primary_color && <View style={[s.colorSwatch, { backgroundColor: item.primary_color }]} />}
                <Text style={s.rowValue}>{item.primary_color_name || "Unknown"}</Text>
              </View>
            </View>
            <View style={s.rowDivider} />

            <View style={s.row}>
              <View>
                <Text style={s.rowLabel}>Formality</Text>
                <Text style={s.rowSub}>{FORMALITY_LABELS[item.formality] || "Unknown"}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 7 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <View key={n} style={[s.fDot, n <= item.formality && s.fDotOn]} />
                ))}
              </View>
            </View>
            <View style={s.rowDivider} />

            <View style={s.row}>
              <Text style={s.rowLabel}>Seasons</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {item.seasons.map(s_ => (
                  <View key={s_} style={[s.chip, s.chipOn, { paddingHorizontal: 10, paddingVertical: 5 }]}>
                    <Text style={[s.chipText, s.chipTextOn, { fontSize: 11 }]}>{s_.charAt(0).toUpperCase() + s_.slice(1)}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {(item.tags && item.tags.length > 0) && (
              <>
                <View style={[s.divider, { marginTop: 12 }]} />
                <View style={{ paddingTop: 18 }}>
                  <Text style={s.monoLabel}>Tags</Text>
                  <View style={s.tagsList}>
                    {item.tags.map(t => (
                      <View key={t} style={s.tag}>
                        <Text style={s.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        ) : (
          // EDIT
          <View style={s.section}>
            <TextInput
              value={subcategory}
              onChangeText={setSubcategory}
              style={s.nameInput}
              placeholderTextColor={TEXT_MUTED}
              placeholder="Item name (e.g. varsity jacket)"
              returnKeyType="done"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 18 }}>
              {CATEGORIES.map(c => (
                <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, category === c && s.chipOn]}>
                  <Text style={[s.chipText, category === c && s.chipTextOn]}>{CATEGORY_LABELS[c]}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={s.divider} />

            <View style={s.row}>
              <Text style={s.rowLabel}>Color</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {item.primary_color && <View style={[s.colorSwatch, { backgroundColor: item.primary_color }]} />}
                <Text style={s.rowValue}>{item.primary_color_name || "Unknown"}</Text>
              </View>
            </View>
            <View style={s.rowDivider} />

            <View style={s.row}>
              <View>
                <Text style={s.rowLabel}>Formality</Text>
                <Text style={s.rowSub}>{FORMALITY_LABELS[formality]}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 7 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <Pressable key={n} onPress={() => setFormality(n)} style={[s.fDot, n <= formality && s.fDotOn]} />
                ))}
              </View>
            </View>
            <View style={s.rowDivider} />

            <View style={s.row}>
              <Text style={s.rowLabel}>Seasons</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {SEASONS_LIST.map(s_ => {
                  const on = seasons.has(s_);
                  return (
                    <Pressable key={s_} onPress={() => toggleSeason(s_)} style={[s.chip, on && s.chipOn, { paddingHorizontal: 10, paddingVertical: 5 }]}>
                      <Text style={[s.chipText, on && s.chipTextOn, { fontSize: 11 }]}>{s_.charAt(0).toUpperCase() + s_.slice(1)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={s.divider} />

            <View style={{ paddingTop: 18 }}>
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
          </View>
        )}
      </ScrollView>

      {isEditing && (
        <View style={[{ paddingHorizontal: 20, paddingVertical: 14, paddingBottom: insets.bottom || 20, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#242424' }]}>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              { height: 56, borderRadius: 16, backgroundColor: "transparent", borderWidth: 1, borderColor: "#D4A574", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
              { opacity: pressed || saving ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              { shadowColor: "#D4A574", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 2 }
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ fontSize: 18, color: "#FFFFFF", fontWeight: 'bold' }}>Save Changes</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: BG, zIndex: 10
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center"
  },
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: TEXT },
  headerActions: { flexDirection: "row" },
  
  photoWrap: {
    width: "100%", aspectRatio: 3 / 4, backgroundColor: SURFACE,
  },
  photo: { width: "100%", height: "100%" },
  
  displayTitle: {
    fontFamily: "Fraunces_400Regular", fontSize: 32, color: TEXT, letterSpacing: -0.5,
    marginBottom: 10, lineHeight: 36
  },
  badgeWrap: { flexDirection: "row", marginBottom: 16 },
  badge: {
    backgroundColor: "rgba(212,165,116,0.14)", borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: ACCENT, letterSpacing: 0.8 },

  section: { paddingHorizontal: 20, paddingVertical: 24 },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 4 },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14,
  },
  rowDivider: { height: 1, backgroundColor: "#1A1A1A" },
  rowLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: TEXT },
  rowSub: {
    fontFamily: "JetBrainsMono_400Regular", fontSize: 8, letterSpacing: 1,
    color: TEXT_MUTED, textTransform: "uppercase", marginTop: 3,
  },
  rowValue: { fontFamily: "Inter_400Regular", fontSize: 14, color: TEXT_DIM },
  colorSwatch: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  
  fDot: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, borderColor: BORDER },
  fDotOn: { backgroundColor: BTN_ACCENT, borderColor: BTN_ACCENT },
  
  nameInput: {
    fontFamily: "Fraunces_400Regular", fontSize: 24, color: TEXT, letterSpacing: -0.4,
    padding: 0, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
    borderColor: BORDER, backgroundColor: SURFACE,
  },
  chipOn: { backgroundColor: BTN_ACCENT, borderColor: BTN_ACCENT },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 12, color: TEXT_DIM },
  chipTextOn: { color: "#000" },

  monoLabel: {
    fontFamily: "JetBrainsMono_400Regular", fontSize: 9, letterSpacing: 1.8,
    color: TEXT_MUTED, textTransform: "uppercase", marginBottom: 12,
  },
  tagsList: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 10 },
  tag: {
    flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: 16, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
  },
  tagText: { fontFamily: "Inter_400Regular", fontSize: 12, color: TEXT_DIM },
  tagRow: { flexDirection: "row", gap: 8 },
  tagInput: {
    flex: 1, height: 42, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 14, fontFamily: "Inter_400Regular", fontSize: 14, color: TEXT,
  },
  tagAddBtn: {
    height: 42, paddingHorizontal: 18, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  tagAddText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: BTN_ACCENT },
});
