import React, { useCallback, useMemo } from "react";
import { View, Text, FlatList, RefreshControl, Pressable, StyleSheet, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useClosetStore } from "@/store/closet";
import ItemCard from "@/components/ItemCard";
import CategoryFilter from "@/components/CategoryFilter";
import type { ClothingItem } from "@/types";

import { Ionicons } from "@expo/vector-icons";
import type { SortOrder } from "@/store/closet";

function ClosetHeader({
  sortOrder,
  setSortOrder,
  itemCount,
  onDeleteAll,
}: {
  sortOrder: SortOrder;
  setSortOrder: (s: SortOrder) => void;
  itemCount: number;
  onDeleteAll: () => void;
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const toggleSort = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };

  return (
    <View style={s.header}>
      <View>
        <Text style={s.headerLabel}>The Closet</Text>
        <Text style={s.headerTitle}>Wardrobe</Text>
        <Text style={s.headerDate}>{dateStr}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable onPress={toggleSort} style={s.sortBtn}>
          <Ionicons name="swap-vertical" size={16} color="#AAAAAA" />
          <Text style={s.sortBtnText}>{sortOrder === "newest" ? "Latest" : "Oldest"}</Text>
        </Pressable>
        {itemCount > 0 && (
          <Pressable onPress={onDeleteAll} style={s.deleteAllBtn} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color="#EF5350" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function ClosetScreen() {
  const { items, loading, filter, sortOrder, fetchItems, setFilter, setSortOrder, deleteAllItems, deleteItem, error } = useClosetStore();
  useFocusEffect(useCallback(() => { fetchItems(); }, []));

  const handleDeleteAll = () => {
    Alert.alert(
      "Delete entire closet?",
      `This will permanently delete all ${items.length} item${items.length === 1 ? "" : "s"} and their photos. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllItems();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete items");
            }
          },
        },
      ]
    );
  };

  // Compute filtered items directly from state to avoid stale closure issues
  const filteredItems = useMemo(() => {
    let result = items;
    if (filter !== null) {
      result = items.filter((item) => {
        const normalizedCategory = String(item.category).toLowerCase().trim();
        if (filter === "ethnic") return normalizedCategory.startsWith("ethnic_");
        if (filter === "top") {
          return (
            normalizedCategory === "top" ||
            normalizedCategory === "tops" ||
            normalizedCategory === "outerwear" ||
            normalizedCategory === "outerwears"
          );
        }
        return normalizedCategory === filter || normalizedCategory === filter + "s";
      });
    }
    return [...result].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [items, filter, sortOrder]);

  const handleDeleteItem = (item: ClothingItem) => {
    const label = item.subcategory || item.category;
    Alert.alert(
      "Delete item?",
      `Remove "${label}" from your closet? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteItem(item.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <ItemCard item={item} onPress={() => router.push(`/item/${item.id}`)} onDelete={handleDeleteItem} />
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
        keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : `fallback-${index}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListHeaderComponent={
          <View>
            <ClosetHeader
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              itemCount={items.length}
              onDeleteAll={handleDeleteAll}
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
          paddingBottom: 110,
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
  header: { 
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"
  },
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
  sortBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1, borderColor: "#2A2A2A"
  },
  sortBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12, color: "#AAAAAA"
  },
  deleteAllBtn: {
    width: 34, height: 34, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(239,83,80,0.35)",
    backgroundColor: "rgba(239,83,80,0.08)",
    alignItems: "center", justifyContent: "center",
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
