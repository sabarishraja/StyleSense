# StyleSense - Complete Feature Inventory

**App Name:** StyleSense  
**Version:** 1.0.0  
**Stack:** React Native (Expo) · Supabase · Claude Sonnet 4.6  
**Last Updated:** 2026-04-26

---

## 📱 USER-FACING FEATURES

### Authentication & Account Management
- **Sign Up** - Create new user account with email/password
- **Sign In** - Login with email and password
- **Sign Out** - Logout from app with confirmation dialog
- **Profile Screen**
  - User avatar (email initials)
  - Account email display
  - "Member since" date tracking
  - Closet statistics (item count, saved outfits, items added this week)
  - App version, AI model, and backend info
  - Sign out button

---

### Closet Management
#### **Add Items to Closet**
- **Capture clothing photos:**
  - Take photo with device camera
  - Choose from device photo library
  - Photo cropping (3:4 aspect ratio)
- **AI Classification** (Claude vision)
  - Auto-detect clothing category (top, bottom, outerwear, footwear, ethnic wear, accessory)
  - Extract primary color + secondary colors
  - Assess formality level (1-5 scale)
  - Suggest seasonal tags
  - Suggest clothing-specific tags
  - Display confidence score (0-100%)
- **Manual Editing Before Save:**
  - Edit item name/subcategory
  - Change detected category
  - Adjust color (view swatches)
  - Adjust formality level (5-dot scale)
  - Select applicable seasons (spring, summer, fall, winter)
  - Add/remove custom tags
- **Save to Closet** - Persist item with all metadata to Supabase

#### **Browse & Manage Closet**
- **Closet Screen (Main Hub)**
  - Grid view of all items (2-column layout)
  - Real-time item count (XX/XX format)
  - Sort items by:
    - Newest first (default)
    - Oldest first
  - Refresh/reload items via pull-to-refresh
  - Error banner for sync issues
  
#### **Filtering & Search**
- **Category Filter** (quick chips)
  - All (default)
  - Tops (includes outerwear)
  - Bottoms
  - Footwear
  - Ethnic
  - Accessories
  
- **Advanced Filters** (bottom sheet modal)
  - Season multi-select (spring, summer, fall, winter)
  - Formality multi-select (levels 1-5)
  - Tag multi-select (from all items' tags)
  - Text search (by subcategory or color name)
  
- **Filter State:**
  - Visual filter count badge
  - "Reset Filters" button
  - Show filtered count vs. total (XX / YY items)

#### **Item Details & Editing**
- **Item Card** (clickable, long-press to delete)
  - Item image thumbnail
  - Category badge
  - Color swatches (primary + secondary)
  
- **Item Detail Screen** (/item/[id])
  - Full-size item image
  - All metadata display and editing
  - Delete item button
  
- **Bulk Operations**
  - Delete entire closet (with confirmation dialog)
  - Delete individual item (with confirmation dialog)

---

### Outfit Generator
#### **Generate Outfit Feature**
- **Occasion Selection** (6 occasions)
  - Casual (formality 1-2)
  - Smart Casual (formality 2-3)
  - Work (formality 3-4)
  - Formal (formality 4-5)
  - Date Night (formality 3-4)
  - Ethnic (all formality levels)
  
- **AI Outfit Generation** (Claude)
  - Generates 3 curated outfit combinations per occasion
  - Considers:
    - User's closet items
    - Selected occasion
    - Current weather conditions (optional)
  - Returns outfit name, item list, and reasoning description

#### **Outfit Results Display**
- **Result Cards** (animated entrance)
  - Outfit name
  - Occasion badge
  - Item thumbnails (up to 4 visible + "+X more" indicator)
  - Piece description (item names joined by •)
  - AI reasoning quote
  - Heart button to save outfit
  - Regenerate button (re-roll single outfit)
  
- **View Modes**
  - **Generate Tab** - Generate new outfits
  - **Saved Tab** - View all favorited outfits (with count)

#### **Weather Integration**
- **Location-Based Weather**
  - Auto-fetch current weather (if location enabled)
  - Display temp (°C) + condition
  - Refresh weather button
  - Fallback message if location disabled
  - Weather-aware outfit suggestions

#### **Loading States**
- Skeleton card loaders (shimmer animation)
- Status chip with rotating messages ("Filtering your wardrobe...", "Building outfit combinations...", "Claude is styling...")
- Pulse animation on status dot

#### **Empty States**
- Empty closet (with "Add First Item" CTA)
- Insufficient items for occasion (with "Add More Items" CTA)
- Generation error with retry button
- No saved outfits (with "Generate Outfits" CTA)

---

### Additional Features

#### **Dark Mode UI**
- Dark theme as default (no light mode)
- Color scheme: blacks (#0A0A0A), grays, tan accent (#D4A574)
- Consistent typography (Fraunces serif, Inter sans, JetBrains Mono monospace)

#### **Haptic Feedback**
- Light impact on sort toggle
- Success notification on save outfit
- Smooth interactions throughout

#### **Accessibility**
- Large touch targets (hit slop: 6-8px)
- Clear visual hierarchy
- Readable font sizes and colors
- Keyboard support for form inputs

---

## 🔧 DEVELOPER FEATURES & TECHNICAL DETAILS

### Architecture

#### **Frontend Stack**
- **Framework:** React Native (Expo SDK 54)
- **Navigation:** Expo Router v6.0.23 (file-based routing with dynamic segments)
- **Styling:** NativeWind v4.1.23 (Tailwind CSS for React Native)
- **State Management:** Zustand v5.0.3 (lightweight, performant state)
- **Icons:** Expo Vector Icons (Ionicons library)
- **Fonts:** Google Fonts (Fraunces serif, Inter sans, JetBrains Mono monospace)
- **Animations:** React Native Reanimated v4.1.1
- **Image Handling:** Expo Image Picker v17.0.10
- **Location:** Expo Location v19.0.7

#### **Backend Stack**
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email/password, session-based)
- **Storage:** Supabase Storage (S3-compatible bucket: "clothing")
- **Edge Functions:** Supabase Functions (serverless, Node.js runtime)
- **AI/ML:** Claude Sonnet 4.6 (vision + text generation via Anthropic API)
- **Weather API:** Open-Meteo (free, no-auth required forecast API)

#### **Key Libraries & Versions**
```json
{
  "zustand": "^5.0.3",
  "@supabase/supabase-js": "^2.49.1",
  "expo-image-picker": "^17.0.10",
  "expo-location": "^19.0.7",
  "expo-router": "^6.0.23",
  "react-native-reanimated": "^4.1.1",
  "react-native-safe-area-context": "^5.6.0",
  "nativewind": "^4.1.23",
  "tailwindcss": "^3.4.17"
}
```

---

### State Management (Zustand Stores)

#### **1. Auth Store** (`store/auth.ts`) — [59 lines]
**Purpose:** Manage user authentication state and session

**State:**
- `user: User | null` — Supabase User object with email, id, created_at
- `session: Session | null` — Current auth session
- `initialized: boolean` — Auth state loaded from storage
- `loading: boolean` — Sign in/up/out in progress
- `error: string | null` — Latest auth error message

**Methods:**
- `initialize()` — Attach auth state change listener on app mount
  - Calls `supabase.auth.onAuthStateChange()` callback
  - Calls `getSession()` to restore persisted session
  - Both update user/session state
- `signUp(email, password)` — Create new user account
  - Calls `supabase.auth.signUp()`
  - Throws on validation error (weak password, invalid email)
  - Sets error state on failure
- `signIn(email, password)` — Authenticate existing user
  - Calls `supabase.auth.signInWithPassword()`
  - Persists session to localStorage automatically
  - Throws on invalid credentials or network error
- `signOut()` — Clear session and redirect to auth
  - Calls `supabase.auth.signOut()`
  - Clears local session cache
- `clearError()` — Dismiss error banner

**Lifecycle:** Initialize on app start in `app/_layout.tsx`

---

#### **2. Closet Store** (`store/closet.ts`) — [346 lines]
**Purpose:** Manage wardrobe items, filtering, search, and upload pipeline

**State:**
- `items: ClothingItem[]` — User's full closet
- `loading: boolean` — Fetch/add/delete in progress
- `error: string | null` — Latest operation error
- `filter: FilterKey | null` — Active category filter (null = show all)
- `sortOrder: "newest" | "oldest"` — Item list sort
- `searchQuery: string` — Text search (empty = disabled)
- `seasonFilters: Season[]` — Multi-select seasons
- `formalityFilters: number[]` — Multi-select formality levels (1–5)
- `tagFilters: string[]` — Multi-select custom tags

**Data Operations:**

1. **`fetchItems()`** — Load user's closet from DB
   - Query: `select * from clothing_items order by created_at desc`
   - For each item, fetch signed URL (1-hour validity)
   - Graceful fallback if image fetch fails (logs warning, renders without image)
   - Sets `items[]` with `image_url` computed client-side
   - Sets `error` on DB/network failure

2. **`uploadAndClassify(imageUri, mimeType, userId)`** — Upload & AI classify
   - **Step 1 (Upload):** Call `uploadClothingImage()`
     - Generate UUID for item ID
     - Store path: `${userId}/${itemId}.${ext}`
     - Fetch image blob from local URI
     - Upload to `clothing` bucket with content-type header
     - Returns `storagePath` string
   - **Step 2 (Classify):** Call `classifyClothingItem(storagePath, mimeType)`
     - Invoke `classify-item` Edge Function
     - Returns `ClothingClassification` with category, colors, formality, tags, confidence
   - Returns `{ storagePath, classification }`
   - Throws on upload or classification failure

3. **`addItem(imageUri, mimeType, classification, storagePath, userId)`** — Save to DB
   - Build `ClothingItem` row object
   - Insert into `clothing_items` table
   - Return inserted row with ID
   - Generate signed URL for image
   - **Optimistic update:** Prepend to `items[]` immediately
   - Sets `loading: false` on completion
   - Throws on DB error

4. **`updateItem(id, updates)`** — Patch item metadata
   - Update `clothing_items` row by ID
   - Update local `items[]` array (immutable)
   - Throws on DB error

5. **`deleteItem(id)`** — Remove single item
   - Find item by ID in local state
   - Delete from `clothing_items` table
   - Delete image file from `clothing` bucket
   - Remove from `items[]` array
   - Doesn't throw on failure (logs error, continues)

6. **`deleteAllItems()`** — Bulk delete entire closet
   - Collect all storage paths and item IDs
   - Delete all rows from `clothing_items` (in clause)
   - Delete all images from `clothing` bucket (batch)
   - Clear `items[]` array
   - Throws on any failure (reversible via error state)

**Filter & Sort Operations:**

- `setFilter(filter)` — Set category filter (triggers re-render)
- `setSortOrder(order)` — Switch between newest/oldest
- `setSearchQuery(q)` — Update search text
- `setSeasonFilters(s)` — Replace season multi-select
- `setFormalityFilters(f)` — Replace formality multi-select
- `setTagFilters(t)` — Replace tag multi-select
- `resetAdvancedFilters()` — Clear search + season + formality + tag filters
- `getFilteredItems()` — Compute filtered list (memoized in screens)
  - Apply category filter (with "top" → includes outerwear, "ethnic" → startsWith)
  - Apply season filter (item must have >= 1 selected season)
  - Apply formality filter (item's formality must be in set)
  - Apply tag filter (item must have >= 1 selected tag)
  - Apply search filter (subcategory OR primary_color_name contains lowercased query)
  - Sort by `created_at` (newest first by default)
  - Returns new array (doesn't mutate)

**Helper Function:**
- `categoryMatchesFilter(category, filter)` — Handle normalization
  - Lowercases + trims category
  - Special case: "ethnic" filter matches `ethnic_*` prefix
  - Special case: "top" filter includes both "top", "tops", "outerwear", "outerwears"
  - Handles AI pluralization variance

**Error Handling:** All async operations set `error` state; UI displays error banner

---

#### **3. Outfits Store** (`store/outfits.ts`) — [215 lines]
**Purpose:** Generate & save outfit suggestions using Claude

**State:**
- `outfitsByOccasion: Record<string, GeneratedOutfit[]>` — In-memory cache
  - Key: occasion ID (e.g., "casual", "formal")
  - Value: array of 3 generated outfits
- `weatherKeyByOccasion: Record<string, string>` — Weather state per occasion
  - Enables cache invalidation on weather change
  - Uses bucketed temp (e.g., "clear-20°C") to avoid stale on small temp swings
- `savedOutfits: SavedOutfit[]` — User's favorited outfits from DB
- `loading: boolean` — Generation in progress
- `savedLoading: boolean` — Fetch saved outfits in progress
- `error: string | null` — Latest error

**Generated Outfit Type:**
```typescript
interface GeneratedOutfit {
  id: string                    // Unique client-side key (not DB ID)
  name: string                  // "OUTFIT 1", "Casual Date Look", etc.
  item_ids: string[]           // References to closet items
  description: string          // AI reasoning (e.g., "Perfect for...")
  source_suggestion_id: string | null  // References outfit_suggestions batch
  savedId: string | null       // If saved to DB, references saved_outfits.id
}
```

**Methods:**

1. **`generateOutfits(occasion, availableItems, weather?)`** — Generate 3 outfits
   - **Cache Check:** 
     - Key: `weatherKey(weather)` (e.g., "clear-20" or "rain-10")
     - If cached outfits exist for this occasion + weather key, return immediately
   - **Payload:** Map `availableItems[]` to slim format (drop image_url, notes)
     - Include: id, category, subcategory, primary_color_name, formality, seasons, tags
   - **Call Claude:** Invoke `generate-outfits` Edge Function
     - Pass occasion, items, weather snapshot
     - Receive array of 3 outfits with name, item_ids, description
   - **Audit Log:** Insert batch to `outfit_suggestions` table (best-effort, doesn't block)
     - Store: user_id, occasion, weather_snapshot, suggestions JSON
   - **Local Mapping:** Map Claude output to `GeneratedOutfit[]`
     - Assign client-side IDs: `${occasion}-outfit-${timestamp}-${index}`
     - Fetch `saveId` from DB if already favorited (cross-reference)
   - **Cache:** Store in `outfitsByOccasion[occasion]` and `weatherKeyByOccasion[occasion]`
   - **Return:** Array of 3 `GeneratedOutfit` objects
   - **Error:** Set `error` state, throw

2. **`clearOutfits(occasion?)`** — Clear cache for occasion(s)
   - If occasion specified: delete `outfitsByOccasion[occasion]` + `weatherKeyByOccasion[occasion]`
   - If no occasion: clear both entire objects (reset all)
   - Non-blocking, synchronous

3. **`saveOutfit(occasion, outfit, weather?)`** — Favorite an outfit
   - Get current user ID (from auth)
   - Insert to `saved_outfits` table:
     - user_id, occasion, name, description, item_ids (JSON), weather_snapshot, source_suggestion_id
   - Return inserted row with generated `id`
   - Update local state:
     - Add to `savedOutfits[]`
     - Update generated outfit's `savedId` (sync UI heart icon)
   - Throws on DB error

4. **`unsaveOutfit(occasion, savedId)`** — Unfavorite an outfit
   - Delete from `saved_outfits` table by ID
   - Remove from `savedOutfits[]`
   - Update generated outfit's `savedId` to null
   - Throws on DB error

5. **`fetchSavedOutfits()`** — Load all favorited outfits
   - Query: `select * from saved_outfits order by created_at desc`
   - Populate `savedOutfits[]`
   - Non-throwing (logs warnings on failure)
   - Called on app mount to populate "Saved" tab

**Helper Function:**
- `weatherKey(weather)` — Generate cache key
  - Buckets temp to 10°C bands (e.g., 23°C → 20, 25°C → 20)
  - Includes condition enum (clear, rain, etc.)
  - Example keys: "clear-20", "rain-10", "no-weather"
  - Prevents cache bust from minor temp fluctuations (≤ 5°C)

**Audit Logging:** `outfit_suggestions` table stores all generation batches for analytics/replay

---

### Backend: Supabase Infrastructure

#### **Storage Bucket: "clothing"**
- Bucket name: `clothing`
- Path format: `${userId}/${itemId}.{jpg|png}`
- File types: JPEG, PNG only (enforced by content-type)
- Access: Private (signed URLs only)
- Signed URL validity: 1 hour (set in `getSignedUrl()`)

#### **Edge Functions**

##### **classify-item** — AI Vision Analysis
**Endpoint:** `supabase.functions.invoke("classify-item")`

**Input:**
```typescript
{
  storagePath: string     // e.g., "user123/item456.jpg"
  mimeType: string        // "image/jpeg" or "image/png"
}
```

**Processing (on Edge):**
1. Download image from `clothing` bucket
2. Send to Claude Sonnet 4.6 vision endpoint
3. Prompt: Analyze clothing garment, extract:
   - Category (top, bottom, outerwear, footwear, ethnic, accessory)
   - Subcategory (specific garment name, e.g., "cotton t-shirt")
   - Primary color (hex + name)
   - Secondary colors (up to 3 additional)
   - Formality level (1 = casual, 5 = black tie)
   - Seasons (spring, summer, fall, winter)
   - Suggested tags (e.g., "casual", "denim", "striped")
   - Confidence score (0–100)
4. Return structured JSON

**Output:**
```typescript
{
  category: "top",
  subcategory: "Cotton T-Shirt",
  primary_color: { hex: "#FF5733", name: "Red" },
  secondary_colors: [
    { hex: "#FFFFFF", name: "White" },
    { hex: "#000000", name: "Black" }
  ],
  formality: 1,
  seasons: ["spring", "summer", "fall"],
  suggested_tags: ["casual", "stripe", "basic"],
  confidence: 0.92
}
```

**Error Handling:**
- Image not found: return 404
- Claude API error: return 500 with error detail
- Invalid image format: return 400

**Model:** Claude Sonnet 4.6 (latest as of 2026-04-26)

##### **generate-outfits** — AI Outfit Curation
**Endpoint:** `supabase.functions.invoke("generate-outfits")`

**Input:**
```typescript
{
  occasion: string,           // "casual", "formal", "date", "work", "ethnic", "smart_casual"
  items: {
    id: string
    category: string
    subcategory: string | null
    primary_color_name: string | null
    formality: 1-5
    seasons: string[]
    tags: string[]
  }[],
  weather: {
    temp_c: number
    condition: string           // "clear", "rain", "snow", etc.
    humidity: 0-100
    fetched_at: ISO timestamp
  } | null
}
```

**Processing (on Edge):**
1. Filter items applicable to occasion (e.g., formal occasion filters for formality ≥ 3)
2. Consider weather (e.g., rainy → avoid suede/silk, cold → include outerwear)
3. Send to Claude Sonnet 4.6 text endpoint
4. Prompt: Given occasion, weather, and items, suggest 3 cohesive outfits
5. For each outfit:
   - Name: Short, descriptive (e.g., "Urban Casual", "Date Night Elegance")
   - item_ids: Array of 2–5 item IDs from input
   - description: 1–2 sentence reasoning
6. Return exactly 3 outfits

**Output:**
```typescript
[
  {
    name: "Weekend Casual",
    item_ids: ["item1", "item3", "item7"],
    description: "Comfortable and relaxed—perfect for a casual weekend."
  },
  // ... 2 more outfits
]
```

**Error Handling:**
- < 2 items in closet: return error "Insufficient wardrobe"
- Claude API error: return 500
- Invalid occasion: return 400

**Model:** Claude Sonnet 4.6 (latest)

---

### Database Schema (PostgreSQL via Supabase)

#### **Users Table** (managed by Supabase Auth)
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_sign_in_at TIMESTAMP,
  email_confirmed_at TIMESTAMP
)
```

#### **Clothing Items Table**
```sql
CREATE TABLE public.clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,                -- "userid/itemid.jpg"
  category TEXT NOT NULL,                    -- "top", "bottom", "outerwear", etc.
  subcategory TEXT,                          -- "Cotton T-Shirt", user-editable
  primary_color TEXT,                        -- "#FF5733"
  primary_color_name TEXT,                   -- "Red"
  secondary_colors JSONB DEFAULT '[]',       -- [{ hex, name }, ...]
  formality INTEGER NOT NULL CHECK (formality BETWEEN 1 AND 5),
  seasons JSONB DEFAULT '[]',                -- ["spring", "summer", ...]
  tags JSONB DEFAULT '[]',                   -- ["casual", "stripe", ...]
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT user_storage_path_unique UNIQUE (user_id, storage_path)
);
CREATE INDEX idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX idx_clothing_items_created_at ON clothing_items(created_at DESC);
```

#### **Saved Outfits Table**
```sql
CREATE TABLE public.saved_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occasion TEXT NOT NULL,                    -- "casual", "formal", "date", etc.
  name TEXT NOT NULL,                        -- "Weekend Casual", user-editable
  description TEXT,                          -- AI reasoning
  item_ids JSONB NOT NULL,                   -- ["itemid1", "itemid2", ...]
  weather_snapshot JSONB,                    -- { temp_c, condition, humidity, fetched_at }
  source_suggestion_id UUID,                 -- Reference to outfit_suggestions batch
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_saved_outfits_user_id ON saved_outfits(user_id);
CREATE INDEX idx_saved_outfits_occasion ON saved_outfits(occasion);
```

#### **Outfit Suggestions (Audit Log)** — Optional
```sql
CREATE TABLE public.outfit_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occasion TEXT NOT NULL,
  weather_snapshot JSONB,
  suggestions JSONB NOT NULL,                -- Array of { name, item_ids, description }
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_outfit_suggestions_user_id ON outfit_suggestions(user_id);
```

**Row-Level Security (RLS):**
- Users can only read/write their own items
- Policy example:
  ```sql
  CREATE POLICY "Users can see own items"
  ON clothing_items FOR SELECT
  USING (auth.uid() = user_id);
  ```

---

### API Integration Points

#### **1. Supabase Authentication** (`lib/supabase.ts`)
```typescript
// Create client
export const supabase = createClient(URL, ANON_KEY, {
  auth: {
    storage: localStorage,           // Persist session
    autoRefreshToken: true,          // Auto-refresh before expiry
    persistSession: true,            // Save to storage
    detectSessionInUrl: false,       // No OAuth redirect handling
  },
});

// Key functions:
supabase.auth.signUp(email, password)
supabase.auth.signInWithPassword(email, password)
supabase.auth.signOut()
supabase.auth.getSession()
supabase.auth.onAuthStateChange(callback)  // Listen for changes
```

**Session Persistence:** Uses `expo-sqlite/localStorage` (Expo polyfill)

#### **2. Supabase Storage** (`lib/supabase.ts`)
```typescript
// Upload image
uploadClothingImage(userId, itemId, imageUri, mimeType)
  → fetches blob from local URI
  → uploads to "clothing" bucket
  → returns storagePath string

// Get signed URL
getSignedUrl(storagePath)
  → creates 1-hour-valid signed URL
  → used to display images in UI
  → graceful null fallback on error
```

**Image Processing:**
- Accepts local `file://` URIs from camera/library
- Converts to blob, then ArrayBuffer
- Content-type header set from MIME type parameter
- Upsert disabled (fail if duplicate path)

#### **3. Supabase Realtime** — Not currently used
- Can add later for real-time sync across devices
- Use `supabase.from("clothing_items").on("*", callback)`

#### **4. Weather API** (`lib/weather.ts`)
**Service:** Open-Meteo (https://api.open-meteo.com/v1/forecast)

**Flow:**
1. Request Expo Location permission
2. Get device coordinates (Accuracy.Balanced)
3. Call API with lat/lon:
   ```
   GET /v1/forecast
   ?latitude=40.123&longitude=-74.456
   &current=temperature_2m,relative_humidity_2m,weather_code
   &timezone=auto
   ```
4. Parse response:
   - `temperature_2m` → round to int °C
   - `relative_humidity_2m` → round to 0–100
   - `weather_code` → map to enum (WMO code table)
5. Cache result for 30 minutes
6. Return `WeatherSnapshot` or `null` if denied/failed

**WMO Code Mapping:**
```
0 → "clear"
1, 2 → "partly_cloudy"
3 → "cloudy"
45, 48 → "fog"
51–67 → "rain"
71–77, 85–86 → "snow"
80–82 → "rain" (showers)
95+ → "thunderstorm"
```

**Error Handling:** Returns `null` on any error (location denied, fetch failure, parse error)
- Never throws (weather is optional enhancement)
- Logs warning to console

#### **5. Anthropic Claude API** (`lib/anthropic.ts`)
Called via Supabase Edge Functions (not direct from client)

**Why indirect?** API key management + request signing handled server-side

---

### UI Components

#### **Screen Components** (in `app/`)

1. **closet.tsx** (Main wardrobe hub)
   - Renders `FlatList` of items in 2-column grid
   - Header with sort toggle + delete-all button
   - Search input + filter sheet
   - Category filter pills
   - Count strip (XX / YY items, category label)
   - Empty states:
     - No items: "Add First Item" CTA
     - Filters active, no results: "Reset Filters" CTA
   - Pull-to-refresh loader
   - **Memoization:** `useMemo` for filtered items (heavy filter logic)

2. **add.tsx** (Item capture & metadata)
   - **Phase 1: Capture**
     - Camera icon + instructions
     - "Take Photo" button → camera
     - "Choose from Library" button → photo picker
   - **Phase 2: Analyzing**
     - Image with scanning overlay
     - Animated scan beam + chip with "/usr/claude / vision_processing"
     - "Assessing formality..." title
     - Progress bar (100% filled, animated)
   - **Phase 3: Form**
     - Item name input (TextInput, Fraunces serif)
     - Category chip selector (horizontal scroll)
     - Color display (swatches + names)
     - Formality row (5-dot scale, tap to adjust)
     - Seasons checkboxes (4 chips)
     - Tags section (chips + add input)
   - Save button (bottom fixed)
   - **Error banner** if upload/classify fails

3. **outfits.tsx** (Outfit generation hub)
   - Header with date + weather chip
   - View toggle: "Generate" / "Saved (N)"
   - **Generate view:**
     - Occasion picker (6 scrollable tiles)
     - Occasion description strip
     - Generate button (disabled until occasion selected)
     - Result cards (animated entrance):
       - Name, occasion badge, heart button
       - Item thumbnails (4 visible + "+X" indicator)
       - Pieces list (item names)
       - AI reasoning quote
       - Regenerate button
     - "Start Over" button
     - Loading states (skeleton cards, status chip)
     - Empty states (empty closet, insufficient items, error)
   - **Saved view:**
     - List of all favorited outfits
     - Cards (same format as generate)
     - Heart button toggle unsave
     - No regenerate button
     - Empty: "No saved outfits yet" with Generate CTA

4. **profile.tsx** (Account info)
   - Avatar with email initials
   - Email + "Member since" date
   - Stats row (Items, Outfits, This week)
   - About section (App Version, AI Model, Backend)
   - Sign Out button
   - Footer credit

5. **item/[id].tsx** (Item detail)
   - Full-size image
   - All metadata (category, colors, formality, seasons, tags)
   - Edit buttons for each field
   - Delete button (with confirmation)

#### **Shared Components** (in `components/`)

1. **ItemCard.tsx** — Reusable item thumbnail
   - Image with fallback icon
   - Category badge overlay
   - Color swatches
   - Delete button (tap for confirmation)

2. **CategoryFilter.tsx** — Category pill chips
   - All / Tops / Bottoms / Outerwear / Footwear / Ethnic / Accessories
   - Active state styling
   - `onFilterChange` callback

3. **FilterSheet.tsx** — Advanced filters modal
   - Bottom sheet with close button
   - Sections:
     - Seasons (4 checkboxes)
     - Formality (5 dots, multi-select)
     - Tags (list of available tags, tap to toggle)
     - Search input
   - Reset Filters button
   - Apply button (implicit on change)

4. **ClassificationReview.tsx** — Post-upload review
   - Mirrors add.tsx form but pre-populated
   - Shows AI-suggested values
   - User can override before save

#### **UI Patterns**

- **Theming:** Dark mode only (#0A0A0A bg, #D4A574 accent)
- **Typography:**
  - Headers: Fraunces serif (28–42px, -0.5 letter-spacing)
  - Body: Inter sans (13–15px)
  - Labels: JetBrains Mono (8–10px, 1–2 letter-spacing, uppercase)
- **Spacing:** 16px base unit
- **Animations:** 
  - Card entrance (fadeIn + slideUp, staggered)
  - Skeleton shimmer (infinite opacity loop)
  - Status chip pulse (0.6s cycle)
  - Smooth reanimated transitions

---

### Data Flow Diagrams

#### **Add Item Flow**
```
User selects photo
  ↓
uploadAndClassify()
  ├─ uploadClothingImage()
  │   └─ Supabase Storage upload
  │       └─ returns storagePath
  └─ classifyClothingItem(storagePath)
      └─ invoke "classify-item" Edge Function
          └─ Claude Sonnet 4.6 vision
              └─ returns ClothingClassification
                  ├─ category, subcategory
                  ├─ colors (primary + secondary)
                  ├─ formality (1–5)
                  ├─ seasons, tags
                  └─ confidence score
          ↓
          User edits metadata in form
          ↓
          addItem(imageUri, mimeType, classification, storagePath, userId)
          └─ Insert clothing_items row
              ├─ Signed URL generated
              └─ Item prepended to local items[]
```

#### **Generate Outfit Flow**
```
User selects occasion + taps "Generate"
  ↓
startGeneration()
  ├─ Check if items ≥ 2
  │   (If < 2, show "Incomplete wardrobe" error)
  ├─ Fetch weather (if location enabled)
  └─ generateOutfits(occasion, items, weather)
      ├─ Check cache (if same occasion + weather bucket, return cached)
      └─ generateClothingOutfits()
          └─ invoke "generate-outfits" Edge Function
              ├─ Filter items by occasion
              ├─ Consider weather
              └─ Claude Sonnet 4.6 text
                  └─ returns 3 outfits
                      ├─ name, item_ids, description
                      └─ source_suggestion_id (batch ID)
          ↓
          Log batch to outfit_suggestions table (async, non-blocking)
          ↓
          Map to GeneratedOutfit[]
          ├─ Assign client-side IDs
          └─ Cache in outfitsByOccasion[occasion]
              ↓
              Render result cards
```

#### **Save Outfit Flow**
```
User taps heart on outfit card
  ↓
handleToggleSave(occasion, outfit)
  ├─ Check if outfit.savedId exists
  │   ├─ If true: unsaveOutfit(occasion, savedId)
  │   │   └─ Delete from saved_outfits
  │   │       └─ Haptics.impactAsync (light)
  │   └─ If false: saveOutfit(occasion, outfit, weather)
  │       └─ Insert saved_outfits row
  │           ├─ Include item_ids, weather_snapshot, description
  │           └─ Haptics.notificationAsync (success)
  ↓
  Update local state
  ├─ Add/remove from savedOutfits[]
  └─ Update outfit.savedId
      ↓
      UI updates (heart fills, count badge)
```

---

### Caching & Optimization

#### **In-Memory Caching**

1. **Outfit Generation Cache** (30-min implicit)
   - Keyed by: `occasion + weatherKey(temp_c, condition)`
   - Expires when: User refreshes, temp changes > 10°C
   - Benefit: Avoid redundant Claude calls

2. **Weather Cache** (30-min explicit)
   - Stored in module-level variable
   - Invalidated by `clearWeatherCache()`
   - Expires: 30 minutes after fetch

#### **List Optimization**

- **FlatList with numColumns:** 2-column grid
- **Memoization:** `useMemo` for filtered items (closet.tsx, outfits.tsx)
- **Image loading:** Lazy via signed URLs, fallback icon

#### **State Selectors** — Zustand patterns
- Store only essential state (no derived values)
- Compute filtered results in screen component via `useMemo`
- Avoids unnecessary re-renders

---

### Error Handling Strategy

#### **User-Visible Errors**
- Error banner in UI (dismissable)
- Specific messages: "Failed to upload image", "Insufficient items for this occasion"
- Retry buttons where applicable

#### **Silent Failures** (logged, non-blocking)
- Weather fetch failure → proceed without weather
- Outfit suggestions audit log failure → show results anyway
- Missing signed URL → render without image

#### **Throwing Errors** (fatal, propagate)
- Auth errors (sign in failed, not authenticated)
- DB errors on critical paths (add item, delete item)
- Image classification failure (required step)

---

### Performance Bottlenecks & Mitigation

| Bottleneck | Mitigation |
|---|---|
| **Large closet filtering** | Memoize filtered items, compute in O(n) |
| **Image loading** | Lazy load, signed URLs, timeout fallback |
| **Outfit generation** | Cache by occasion + weather, show skeleton |
| **Storage cleanup** | Batch delete (single DB query) |
| **Weather fetch** | 30-min cache, non-blocking, fallback to null |

---

### Testing Checklist (Future)

- [ ] Add item → correct metadata classification
- [ ] Filter by category → only matching items shown
- [ ] Search by color → finds items with that color
- [ ] Sort toggle → newest/oldest alternates
- [ ] Generate outfits → 3 items per outfit
- [ ] Save outfit → persists to DB, shows on Saved tab
- [ ] Delete item → removed from closet + storage
- [ ] Delete all → all items gone, storage cleared
- [ ] Weather → displays if location enabled
- [ ] Offline → auth persists, can't add/fetch items

---

### Known Limitations & TODOs

1. **Missing Features:**
   - Outfit count placeholder (UI shows "—")
   - No outfit sharing/export
   - No styling history or "worn" tracking
   - No batch photo upload
   - No light mode
   - No favorites for items (only outfits)

2. **Technical Debt:**
   - Item detail screen not fully implemented
   - No optimistic update on save outfit (UI lag possible)
   - Weather caching key based on temp buckets (could miss seasonal changes)
   - No offline queue for failed requests

3. **Security Considerations:**
   - Signed URLs expire after 1 hour (safe for storage)
   - Row-level security required on DB tables
   - API key stored in .env (standard Expo practice)
   - No rate limiting on Edge Functions (add if public)

---

## 📊 Summary Statistics

| Category | Count |
|----------|-------|
| Screens | 7 |
| Tabs | 4 |
| Zustand Stores | 3 |
| Edge Functions | 2 |
| Component Types | 8+ |
| Categories | 8 |
| Seasons | 5 |
| Formality Levels | 5 |
| Occasions | 6 |
| Database Tables | 3+ |

---

**Maintained by:** Development Team  
**Last Modified:** 2026-04-26
