import { create } from "zustand";
import { generateClothingOutfits } from "@/lib/anthropic";
import type { ClothingItem } from "@/types";

export interface GeneratedOutfit {
  id: string; // locally generated id for rendering keys
  name: string;
  item_ids: string[];
  description: string;
}

interface OutfitsState {
  outfitsByOccasion: Record<string, GeneratedOutfit[]>;
  loading: boolean;
  error: string | null;

  generateOutfits: (occasion: string, availableItems: ClothingItem[]) => Promise<GeneratedOutfit[]>;
  clearOutfits: (occasion?: string) => void;
}

export const useOutfitsStore = create<OutfitsState>((set, get) => ({
  outfitsByOccasion: {},
  loading: false,
  error: null,

  generateOutfits: async (occasion: string, availableItems: ClothingItem[]) => {
    // Check if we already generated them for this session to avoid spamming the API
    const cached = get().outfitsByOccasion[occasion];
    if (cached && cached.length > 0) {
      return cached;
    }

    set({ loading: true, error: null });
    try {
      // Reduce payload size by mapping to core fields
      const itemsPayload = availableItems.map(i => ({
        id: i.id,
        category: i.category,
        subcategory: i.subcategory,
        primary_color_name: i.primary_color_name,
        formality: i.formality,
        seasons: i.seasons,
        tags: i.tags
      }));

      const rawOutfits = await generateClothingOutfits(occasion, itemsPayload);

      // Map unique IDs
      const mappedOutfits: GeneratedOutfit[] = rawOutfits.map((o, idx) => ({
        id: `${occasion}-outfit-${Date.now()}-${idx}`,
        name: o.name || `OUTFIT ${idx + 1}`,
        item_ids: o.item_ids || [],
        description: o.description || "A cohesive arrangement for the occasion."
      }));

      set((state) => ({
        outfitsByOccasion: {
          ...state.outfitsByOccasion,
          [occasion]: mappedOutfits
        }
      }));

      return mappedOutfits;
    } catch (err: any) {
      set({ error: err.message || "Failed to generate outfits" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearOutfits: (occasion?: string) => {
    if (occasion) {
      set((state) => {
        const next = { ...state.outfitsByOccasion };
        delete next[occasion];
        return { outfitsByOccasion: next };
      });
    } else {
      set({ outfitsByOccasion: {} });
    }
  }
}));
