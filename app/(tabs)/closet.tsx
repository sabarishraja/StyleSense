import React, { useCallback } from "react";
import { View, Text, FlatList, RefreshControl, Pressable, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useClosetStore } from "@/store/closet";
import ItemCard from "@/components/ItemCard";
import CategoryFilter from "@/components/CategoryFilter";
import type { ClothingItem } from "@/types";

function ClosetHeader({ totalCount, filteredCount, filter }: { totalCount: number; filteredCount: number; filter: string | null }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <View style={s.header}>
      <Text style={s.headerLabel}>The Closet</Text>
      <Text style={s.headerTitle}>Wardrobe</Text>
      <Text style={s.headerDate}>{dateStr}</Text>
    </View>
  );
}

export default function ClosetScreen() {
  const { items, loading, filter, fetchItems, setFilter, getFilteredItems, error } = useClosetStore();
  useFocusEffect(useCallback(() => { fetchItems(); }, []));
  const filteredItems = getFilteredItems();

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <ItemCard item={item} onPress={() => {}} />
  );

  const renderEmpty = () => (
    <View style={s.emptyWrap}>
      <View style={s.emptyIcon}>
        <Text style={s.emptyIconText}>◈</Text>
      </View>
      <Text style={s.emptyTitle}>Your closet is empty.</Text>
      <Text style={s.emptyBody}>
        Start by photographing a piece. Claude will tag it so you can find it later.
      </Text>
      <Pressable
        onPress={() => router.push("/(tabs)/add")}
        style={({ pressed }) => [s.emptyBtn, { opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={s.emptyBtnText}>Add First Item</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={s.flex}>
      {error && (
        <View style={s.errorBanner}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={
          <View>
            <ClosetHeader
              totalCount={items.length}
              filteredCount={filteredItems.length}
              filter={filter}
            />
            {items.length > 0 && (
              <CategoryFilter activeFilter={filter} onFilterChange={setFilter} />
            )}
            {items.length > 0 && (
              <View style={s.countStrip}>
                <Text style={s.countText}>
                  {String(filteredItems.length).padStart(2, "0")} / {String(items.length).padStart(2, "0")} items
                </Text>
                <Text style={s.countFilter}>{filter ?? "All"}</Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: 24,
          flexGrow: filteredItems.length === 0 ? 1 : undefined,
        }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchItems}
            tintColor="#D4A574"
            colors={["#D4A574"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  headerLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10, letterSpacing: 1.5,
    color: "#D4A574", textTransform: "uppercase", marginBottom: 4,
  },
  headerTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 34, color: "#F5F5F5", letterSpacing: -0.9, lineHeight: 36,
  },
  headerDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12, color: "#AAAAAA", marginTop: 4, letterSpacing: -0.05,
  },
  countStrip: {
    paddingHorizontal: 6,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  countText: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10, letterSpacing: 1, color: "#6B6B6B", textTransform: "uppercase",
  },
  countFilter: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10, letterSpacing: 1, color: "#6B6B6B", textTransform: "uppercase",
  },
  errorBanner: { backgroundColor: "rgba(239,83,80,0.1)", paddingHorizontal: 16, paddingVertical: 8 },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#EF5350", textAlign: "center" },
  emptyWrap: {
    flex: 1, paddingHorizontal: 28, paddingTop: 60,
    alignItems: "center", textAlign: "center",
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24,
    borderWidth: 1, borderColor: "#2A2A2A",
    backgroundColor: "#1A1A1A",
    alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  emptyIconText: { fontSize: 36, color: "#D4A574" },
  emptyTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 28, color: "#F5F5F5",
    letterSpacing: -0.5, lineHeight: 32,
    textAlign: "center", marginBottom: 10,
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14, color: "#AAAAAA",
    textAlign: "center", lineHeight: 21,
    maxWidth: 260, marginBottom: 28,
  },
  emptyBtn: {
    height: 52, borderRadius: 28,
    backgroundColor: "#D4A574",
    paddingHorizontal: 32,
    alignItems: "center", justifyContent: "center",
  },
  emptyBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15, color: "#0A0A0A", letterSpacing: -0.1,
  },
});
