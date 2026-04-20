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
      <View style={{ padding: 8 }}>
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{item.category}</Text>
        {item.subcategory && (
          <Text style={{ color: '#aaa', fontSize: 12 }}>{item.subcategory}</Text>
        )}
      </View>
    </Pressable>
  );
}
