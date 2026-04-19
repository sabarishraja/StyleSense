import { create } from "zustand";
import { supabase, getSignedUrl, uploadClothingImage } from "@/lib/supabase";
import { classifyClothingItem } from "@/lib/anthropic";
import type {
  ClothingItem,
  ClothingClassification,
  FilterKey,
  Category,
} from "@/types";

interface ClosetState {
  items: ClothingItem[];
  loading: boolean;
  filter: FilterKey;
  error: string | null;

  // Data operations
  fetchItems: () => Promise<void>;
  addItem: (
    imageUri: string,
    mimeType: string,
    classification: ClothingClassification,
    storagePath: string,
    userId: string
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Filter
  setFilter: (filter: FilterKey) => void;
  getFilteredItems: () => ClothingItem[];

  // Upload + classify flow
  uploadAndClassify: (
    imageUri: string,
    mimeType: string,
    userId: string
  ) => Promise<{ storagePath: string; classification: ClothingClassification }>;

  clearError: () => void;
}

/**
 * Check if a category matches the current filter.
 * The "ethnic" filter matches ethnic_top, ethnic_bottom, ethnic_full.
 */
function categoryMatchesFilter(
  category: Category,
  filter: FilterKey
): boolean {
  if (filter === null) return true;
  if (filter === "ethnic") return category.startsWith("ethnic_");
  // "top" filter includes outerwear so pullovers/quarter-zips show up
  if (filter === "top") return category === "top" || category === "outerwear";
  return category === filter;
}

export const useClosetStore = create<ClosetState>((set, get) => ({
  items: [],
  loading: false,
  filter: null,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("clothing_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Generate signed URLs for all items
      const itemsWithUrls = await Promise.all(
        (data || []).map(async (item: any) => {
          const imageUrl = await getSignedUrl(item.storage_path);
          return {
            ...item,
            secondary_colors: item.secondary_colors || [],
            seasons: item.seasons || [],
            tags: item.tags || [],
            image_url: imageUrl,
          } as ClothingItem;
        })
      );

      set({ items: itemsWithUrls });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch items" });
    } finally {
      set({ loading: false });
    }
  },

  uploadAndClassify: async (
    imageUri: string,
    mimeType: string,
    userId: string
  ) => {
    const itemId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    // Step 1: Upload to Supabase Storage
    const storagePath = await uploadClothingImage(
      userId,
      itemId,
      imageUri,
      mimeType
    );

    // Step 2: Call Edge Function for classification
    const classification = await classifyClothingItem(storagePath, mimeType);

    return { storagePath, classification };
  },

  addItem: async (
    imageUri: string,
    mimeType: string,
    classification: ClothingClassification,
    storagePath: string,
    userId: string
  ) => {
    set({ loading: true, error: null });
    try {
      const newItem = {
        user_id: userId,
        storage_path: storagePath,
        category: classification.category,
        subcategory: classification.subcategory,
        primary_color: classification.primary_color.hex,
        primary_color_name: classification.primary_color.name,
        secondary_colors: classification.secondary_colors,
        formality: classification.formality,
        seasons: classification.seasons,
        tags: classification.suggested_tags,
        notes: null,
      };

      const { data, error } = await supabase
        .from("clothing_items")
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      // Generate signed URL for the new item
      const imageUrl = await getSignedUrl(data.storage_path);

      const itemWithUrl: ClothingItem = {
        ...data,
        secondary_colors: data.secondary_colors || [],
        seasons: data.seasons || [],
        tags: data.tags || [],
        image_url: imageUrl,
      };

      // Prepend to the items list
      set((state) => ({ items: [itemWithUrl, ...state.items] }));
    } catch (err: any) {
      set({ error: err.message || "Failed to save item" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteItem: async (id: string) => {
    try {
      // Find the item to get its storage path
      const item = get().items.find((i) => i.id === id);
      if (!item) return;

      // Delete from DB
      const { error: dbError } = await supabase
        .from("clothing_items")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Delete from Storage
      await supabase.storage.from("clothing").remove([item.storage_path]);

      // Remove from local state
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to delete item" });
    }
  },

  setFilter: (filter: FilterKey) => set({ filter }),

  getFilteredItems: () => {
    const { items, filter } = get();
    if (filter === null) return items;
    return items.filter((item) => categoryMatchesFilter(item.category, filter));
  },

  clearError: () => set({ error: null }),
}));
