import { create } from "zustand";
import { supabase, getSignedUrl, uploadClothingImage } from "@/lib/supabase";
import { classifyClothingItem } from "@/lib/anthropic";
import type {
  ClothingItem,
  ClothingClassification,
  FilterKey,
  Category,
  Season,
} from "@/types";

export type SortOrder = "newest" | "oldest";

interface ClosetState {
  items: ClothingItem[];
  loading: boolean;
  filter: FilterKey;             // category facet (existing)
  sortOrder: SortOrder;
  // Advanced filters (multi-select; empty = no constraint)
  searchQuery: string;
  seasonFilters: Season[];
  formalityFilters: number[];    // values 1-5
  tagFilters: string[];
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
  updateItem: (id: string, updates: Partial<ClothingItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  deleteAllItems: () => Promise<void>;

  // Filter & Sort
  setFilter: (filter: FilterKey) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (q: string) => void;
  setSeasonFilters: (s: Season[]) => void;
  setFormalityFilters: (f: number[]) => void;
  setTagFilters: (t: string[]) => void;
  resetAdvancedFilters: () => void;
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
  
  // Normalize the category string to handle cases where AI might return "Tops", "Outerwears", etc.
  const normalizedCategory = String(category).toLowerCase().trim();
  
  if (filter === "ethnic") return normalizedCategory.startsWith("ethnic_");
  
  // "top" filter includes outerwear so pullovers/quarter-zips show up
  // Allow strict matching plus common pluralizations from the AI
  if (filter === "top") {
    return (
      normalizedCategory === "top" || 
      normalizedCategory === "tops" || 
      normalizedCategory === "outerwear" ||
      normalizedCategory === "outerwears"
    );
  }
  
  return normalizedCategory === filter || normalizedCategory === filter + "s";
}

export const useClosetStore = create<ClosetState>((set, get) => ({
  items: [],
  loading: false,
  filter: null,
  sortOrder: "newest",
  searchQuery: "",
  seasonFilters: [],
  formalityFilters: [],
  tagFilters: [],
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("clothing_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter out any purely invalid rows without crashing.
      const validRows = (data || []).filter(item => item && item.id);

      // We handle missing image storage gracefully without throwing.
      const itemsWithUrls = await Promise.all(
        validRows.map(async (item: any) => {
          let imageUrl = null;
          if (item.storage_path) {
            try {
              imageUrl = await getSignedUrl(item.storage_path);
            } catch (e) {
              console.warn(`Failed to get signed URL for item ${item.id}`, e);
            }
          }
          
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

  updateItem: async (id: string, updates: Partial<ClothingItem>) => {
    try {
      const { error } = await supabase
        .from("clothing_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to update item" });
      throw err;
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

  deleteAllItems: async () => {
    set({ loading: true, error: null });
    try {
      const currentItems = get().items;
      if (currentItems.length === 0) return;

      const paths = currentItems.map((i) => i.storage_path).filter(Boolean);
      const ids = currentItems.map((i) => i.id);

      const { error: dbError } = await supabase
        .from("clothing_items")
        .delete()
        .in("id", ids);

      if (dbError) throw dbError;

      if (paths.length > 0) {
        await supabase.storage.from("clothing").remove(paths);
      }

      set({ items: [] });
    } catch (err: any) {
      set({ error: err.message || "Failed to delete all items" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  setFilter: (filter: FilterKey) => set({ filter }),

  setSortOrder: (sortOrder: SortOrder) => set({ sortOrder }),

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setSeasonFilters: (seasonFilters: Season[]) => set({ seasonFilters }),
  setFormalityFilters: (formalityFilters: number[]) => set({ formalityFilters }),
  setTagFilters: (tagFilters: string[]) => set({ tagFilters }),

  resetAdvancedFilters: () =>
    set({ searchQuery: "", seasonFilters: [], formalityFilters: [], tagFilters: [] }),

  getFilteredItems: () => {
    const {
      items, filter, sortOrder,
      searchQuery, seasonFilters, formalityFilters, tagFilters,
    } = get();

    const search = searchQuery.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (filter !== null && !categoryMatchesFilter(item.category, filter)) return false;

      if (
        seasonFilters.length > 0 &&
        !item.seasons.some((s) => seasonFilters.includes(s))
      ) return false;

      if (
        formalityFilters.length > 0 &&
        !formalityFilters.includes(item.formality)
      ) return false;

      if (
        tagFilters.length > 0 &&
        !item.tags.some((t) => tagFilters.includes(t))
      ) return false;

      if (search) {
        const sub = (item.subcategory || "").toLowerCase();
        const color = (item.primary_color_name || "").toLowerCase();
        if (!sub.includes(search) && !color.includes(search)) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  },

  clearError: () => set({ error: null }),
}));
