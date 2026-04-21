import React from "react";
import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ClothingItem } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface ItemCardProps {
  item: ClothingItem;
  onPress?: (item: ClothingItem) => void;
  onDelete?: (item: ClothingItem) => void;
}

export default function ItemCard({ item, onPress, onDelete }: ItemCardProps) {
  const colorName = item.primary_color_name 
    ? item.primary_color_name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : "";
    
  const baseType = item.subcategory || item.category;
  const typeName = baseType
    ? baseType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : "";

  const displayName = [colorName, typeName].filter(Boolean).join(" ");

  return (
    <Pressable 
      onPress={() => onPress?.(item)} 
      style={{ width: '48%', marginBottom: 16, backgroundColor: '#1A1A1A', borderRadius: 8, overflow: 'hidden' }}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 200, resizeMode: 'cover' }} />
      ) : (
        <View style={{ width: '100%', height: 200, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 24 }}>👔</Text>
        </View>
      )}
      {/* Delete button */}
      {onDelete && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onDelete(item);
          }}
          style={{ position: "absolute", bottom: 10, right: 10, padding: 4, zIndex: 10 }}
          hitSlop={15}
        >
          <Ionicons name="trash" size={18} color="#EF5350" />
        </Pressable>
      )}

      <View style={{ padding: 10 }}>
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }} numberOfLines={2}>
          {displayName}
        </Text>
        {item.primary_color && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.primary_color, borderWidth: 1, borderColor: '#333' }} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
