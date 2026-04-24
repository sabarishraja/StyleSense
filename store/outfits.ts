import { create } from "zustand";
import { generateClothingOutfits } from "@/lib/anthropic";
import { supabase } from "@/lib/supabase";
import type { ClothingItem, SavedOutfit } from "@/types";

export interface GeneratedOutfit {
  id: string;                          // local render key
  name: string;
  item_ids: string[];
  description: string;
  source_suggestion_id: string | null; // outfit_suggestions row that produced this
  savedId: string | null;              // saved_outfits row id if favorited
}

interface OutfitsState {
  outfitsByOccasion: Record<string, GeneratedOutfit[]>;
  savedOutfits: SavedOutfit[];
  loading: boolean;
  savedLoading: boolean;
  error: string | null;

  generateOutfits: (occasion: string, availableItems: ClothingItem[]) => Promise<GeneratedOutfit[]>;
  clearOutfits: (occasion?: string) => void;
  saveOutfit: (occasion: string, outfit: GeneratedOutfit) => Promise<string>;
  unsaveOutfit: (occasion: string, savedId: string) => Promise<void>;
  fetchSavedOutfits: () => Promise<void>;
}

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export const useOutfitsStore = create<OutfitsState>((set, get) => ({
  outfitsByOccasion: {},
  savedOutfits: [],
  loading: false,
  savedLoading: false,
  error: null,

  generateOutfits: async (occasion: string, availableItems: ClothingItem[]) => {
    // Session cache: skip Claude call if we already generated for this occasion
    const cached = get().outfitsByOccasion[occasion];
    if (cached && cached.length > 0) {
      return cached;
    }

    set({ loading: true, error: null });
    try {
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

      // Persist the batch to outfit_suggestions (audit log / future history view).
      // Failure here must not block the user from seeing results.
      let batchId: string | null = null;
      try {
        const userId = await getUserId();
        const { data: batch, error: batchErr } = await supabase
          .from("outfit_suggestions")
          .insert({
            user_id: userId,
            occasion,
            weather_snapshot: null,
            suggestions: rawOutfits,
          })
          .select("id")
          .single();
        if (batchErr) throw batchErr;
        batchId = batch.id;
      } catch (logErr) {
        console.warn("[outfits] batch log failed:", logErr);
      }

      const mappedOutfits: GeneratedOutfit[] = rawOutfits.map((o, idx) => ({
        id: `${occasion}-outfit-${Date.now()}-${idx}`,
        name: o.name || `OUTFIT ${idx + 1}`,
        item_ids: o.item_ids || [],
        description: o.description || "A cohesive arrangement for the occasion.",
        source_suggestion_id: batchId,
        savedId: null,
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
  },

  saveOutfit: async (occasion: string, outfit: GeneratedOutfit) => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("saved_outfits")
      .insert({
        user_id: userId,
        occasion,
        name: outfit.name,
        description: outfit.description,
        item_ids: outfit.item_ids,
        weather_snapshot: null,
        source_suggestion_id: outfit.source_suggestion_id,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Save failed: ${error.message}`);

    const saved = data as SavedOutfit;

    set((state) => ({
      savedOutfits: [saved, ...state.savedOutfits],
      outfitsByOccasion: {
        ...state.outfitsByOccasion,
        [occasion]: (state.outfitsByOccasion[occasion] || []).map(o =>
          o.id === outfit.id ? { ...o, savedId: saved.id } : o
        ),
      },
    }));

    return saved.id;
  },

  unsaveOutfit: async (occasion: string, savedId: string) => {
    const { error } = await supabase
      .from("saved_outfits")
      .delete()
      .eq("id", savedId);

    if (error) throw new Error(`Unsave failed: ${error.message}`);

    set((state) => ({
      savedOutfits: state.savedOutfits.filter(s => s.id !== savedId),
      outfitsByOccasion: {
        ...state.outfitsByOccasion,
        [occasion]: (state.outfitsByOccasion[occasion] || []).map(o =>
          o.savedId === savedId ? { ...o, savedId: null } : o
        ),
      },
    }));
  },

  fetchSavedOutfits: async () => {
    set({ savedLoading: true });
    try {
      const { data, error } = await supabase
        .from("saved_outfits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ savedOutfits: (data || []) as SavedOutfit[] });
    } catch (err: any) {
      console.warn("[outfits] fetchSavedOutfits failed:", err?.message || err);
    } finally {
      set({ savedLoading: false });
    }
  },
}));
