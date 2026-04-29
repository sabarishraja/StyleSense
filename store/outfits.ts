import { create } from "zustand";
import { generateClothingOutfits } from "@/lib/anthropic";
import { supabase } from "@/lib/supabase";
import type { ClothingItem, SavedOutfit, WearLog, WeatherSnapshot } from "@/types";

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
  weatherKeyByOccasion: Record<string, string>;
  savedOutfits: SavedOutfit[];
  loading: boolean;
  savedLoading: boolean;
  error: string | null;
  wearLogsBySavedOutfit: Record<string, WearLog[]>;
  wearLogsLoading: boolean;

  generateOutfits: (
    occasion: string,
    availableItems: ClothingItem[],
    weather?: WeatherSnapshot | null
  ) => Promise<GeneratedOutfit[]>;
  clearOutfits: (occasion?: string) => void;
  saveOutfit: (
    occasion: string,
    outfit: GeneratedOutfit,
    weather?: WeatherSnapshot | null
  ) => Promise<string>;
  unsaveOutfit: (occasion: string, savedId: string) => Promise<void>;
  fetchSavedOutfits: () => Promise<void>;
  logWorn: (savedOutfitId: string) => Promise<void>;
  unlogWorn: (logId: string, savedOutfitId: string) => Promise<void>;
  fetchWearLogs: (savedOutfitId: string) => Promise<void>;
}

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

// Bucket weather to 10°C bands so a 1° fluctuation doesn't bust the session cache,
// but a real warm-to-cold swing does.
function weatherKey(w: WeatherSnapshot | null | undefined): string {
  if (!w) return "no-weather";
  const bucket = Math.round(w.temp_c / 10) * 10;
  return `${w.condition}-${bucket}`;
}

export const useOutfitsStore = create<OutfitsState>((set, get) => ({
  outfitsByOccasion: {},
  weatherKeyByOccasion: {},
  savedOutfits: [],
  loading: false,
  savedLoading: false,
  error: null,
  wearLogsBySavedOutfit: {},
  wearLogsLoading: false,

  generateOutfits: async (occasion, availableItems, weather) => {
    const requestKey = weatherKey(weather);
    const cached = get().outfitsByOccasion[occasion];
    const cachedKey = get().weatherKeyByOccasion[occasion];
    if (cached && cached.length > 0 && cachedKey === requestKey) {
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

      const rawOutfits = await generateClothingOutfits(occasion, itemsPayload, weather);

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
            weather_snapshot: weather ?? null,
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
        },
        weatherKeyByOccasion: {
          ...state.weatherKeyByOccasion,
          [occasion]: requestKey,
        },
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
        const nextOutfits = { ...state.outfitsByOccasion };
        const nextKeys = { ...state.weatherKeyByOccasion };
        delete nextOutfits[occasion];
        delete nextKeys[occasion];
        return { outfitsByOccasion: nextOutfits, weatherKeyByOccasion: nextKeys };
      });
    } else {
      set({ outfitsByOccasion: {}, weatherKeyByOccasion: {} });
    }
  },

  saveOutfit: async (occasion, outfit, weather) => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("saved_outfits")
      .insert({
        user_id: userId,
        occasion,
        name: outfit.name,
        description: outfit.description,
        item_ids: outfit.item_ids,
        weather_snapshot: weather ?? null,
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

  unsaveOutfit: async (occasion, savedId) => {
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

  logWorn: async (savedOutfitId) => {
    const userId = await getUserId();
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    const { data, error } = await supabase
      .from("wear_logs")
      .insert({ user_id: userId, saved_outfit_id: savedOutfitId, worn_on: today })
      .select("*")
      .single();

    if (error) {
      // 23505 = unique_violation — already logged today, silently ignore
      if (error.code === "23505") return;
      throw new Error(`logWorn failed: ${error.message}`);
    }

    const newLog = data as WearLog;
    set((state) => ({
      wearLogsBySavedOutfit: {
        ...state.wearLogsBySavedOutfit,
        [savedOutfitId]: [newLog, ...(state.wearLogsBySavedOutfit[savedOutfitId] || [])],
      },
    }));
  },

  unlogWorn: async (logId, savedOutfitId) => {
    const { error } = await supabase
      .from("wear_logs")
      .delete()
      .eq("id", logId);

    if (error) throw new Error(`unlogWorn failed: ${error.message}`);

    set((state) => ({
      wearLogsBySavedOutfit: {
        ...state.wearLogsBySavedOutfit,
        [savedOutfitId]: (state.wearLogsBySavedOutfit[savedOutfitId] || []).filter(
          (l) => l.id !== logId
        ),
      },
    }));
  },

  fetchWearLogs: async (savedOutfitId) => {
    set({ wearLogsLoading: true });
    try {
      const { data, error } = await supabase
        .from("wear_logs")
        .select("*")
        .eq("saved_outfit_id", savedOutfitId)
        .order("worn_on", { ascending: false });

      if (error) throw error;

      set((state) => ({
        wearLogsBySavedOutfit: {
          ...state.wearLogsBySavedOutfit,
          [savedOutfitId]: (data || []) as WearLog[],
        },
      }));
    } catch (err: any) {
      console.warn("[outfits] fetchWearLogs failed:", err?.message || err);
      throw err;
    } finally {
      set({ wearLogsLoading: false });
    }
  },
}));
