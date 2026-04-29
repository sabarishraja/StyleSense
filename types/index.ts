// ============================================================
// StyleSense — Core Type Definitions
// ============================================================

// -- Categories --
export const CATEGORIES = [
  "top",
  "bottom",
  "outerwear",
  "footwear",
  "ethnic_top",
  "ethnic_bottom",
  "ethnic_full",
  "accessory",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  top: "Tops",
  bottom: "Bottoms",
  outerwear: "Outerwear",
  footwear: "Footwear",
  ethnic_top: "Ethnic Tops",
  ethnic_bottom: "Ethnic Bottoms",
  ethnic_full: "Ethnic Full",
  accessory: "Accessories",
};

// Grouped filter labels for the category filter chips
export const FILTER_GROUPS = [
  { key: null, label: "All" },
  { key: "top", label: "Tops" },
  { key: "bottom", label: "Bottoms" },
  { key: "outerwear", label: "Outerwear" },
  { key: "footwear", label: "Footwear" },
  { key: "ethnic", label: "Ethnic" }, // maps to ethnic_top, ethnic_bottom, ethnic_full
  { key: "accessory", label: "Accessories" },
] as const;

export type FilterKey = (typeof FILTER_GROUPS)[number]["key"];

// -- Occasions --
export const OCCASIONS = [
  "casual",
  "work_office",
  "work_casual",
  "date",
  "formal_event",
  "gym",
  "ethnic_traditional",
  "wedding",
  "festival_religious",
] as const;

export type Occasion = (typeof OCCASIONS)[number];

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: "Casual",
  work_office: "Work (Office)",
  work_casual: "Work (Casual)",
  date: "Date Night",
  formal_event: "Formal Event",
  gym: "Gym / Athletic",
  ethnic_traditional: "Ethnic Traditional",
  wedding: "Wedding",
  festival_religious: "Festival / Religious",
};

// -- Seasons --
export const SEASONS = ["summer", "fall", "winter", "spring", "all"] as const;
export type Season = (typeof SEASONS)[number];

// -- Colors --
export interface ColorInfo {
  hex: string;
  name: string;
}

// -- Clothing Item --
export interface ClothingItem {
  id: string;
  user_id: string;
  storage_path: string;
  category: Category;
  subcategory: string | null;
  primary_color: string | null;
  primary_color_name: string | null;
  secondary_colors: ColorInfo[];
  formality: number; // 1-5
  seasons: Season[];
  tags: string[];
  notes: string | null;
  created_at: string;
  // Client-side computed — not in DB
  image_url?: string;
}

// -- Classification (Claude response) --
export interface ClothingClassification {
  category: Category;
  subcategory: string;
  primary_color: ColorInfo;
  secondary_colors: ColorInfo[];
  formality: number;
  seasons: Season[];
  suggested_tags: string[];
  confidence: number;
}

// -- Outfit Suggestion --
export interface OutfitSuggestion {
  item_ids: string[];
  reasoning: string;
}

export type WeatherCondition =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "rain"
  | "snow"
  | "thunderstorm"
  | "fog"
  | "unknown";

export interface WeatherSnapshot {
  temp_c: number;
  condition: WeatherCondition;
  humidity: number;     // 0-100
  fetched_at: string;   // ISO timestamp
}

export interface OutfitRequest {
  id: string;
  user_id: string;
  occasion: Occasion;
  weather_snapshot: WeatherSnapshot;
  suggestions: OutfitSuggestion[];
  created_at: string;
}

// -- Saved Outfit (favorites) --
export interface SavedOutfit {
  id: string;
  user_id: string;
  occasion: string;
  name: string;
  description: string | null;
  item_ids: string[];
  weather_snapshot: WeatherSnapshot | null;
  source_suggestion_id: string | null;
  created_at: string;
}

// -- Wear Log --
export interface WearLog {
  id: string;
  user_id: string;
  saved_outfit_id: string;
  worn_on: string; // ISO date "YYYY-MM-DD"
}

// -- Add Item Flow State --
export type AddItemStep = "capture" | "uploading" | "review" | "saving";

export interface AddItemState {
  step: AddItemStep;
  imageUri: string | null;
  mimeType: string | null;
  storagePath: string | null;
  classification: ClothingClassification | null;
  error: string | null;
}
