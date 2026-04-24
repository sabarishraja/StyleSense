# StyleSense — Project Status

> Living context doc. Paste the relevant sections into new AI sessions instead
> of re-explaining the project. Update after each meaningful change.

**Last updated:** 2026-04-24 (outfit persistence + favorites landed)

---

## 1. One-paragraph summary

Expo / React Native mobile app ("StyleSense"). Users photograph a clothing item → a Supabase Edge Function calls **Claude Sonnet 4.6** to classify category, subcategory, primary + secondary colors, formality (1–5), seasons, and tags → the item is saved to Supabase Storage (image) and Postgres (metadata, RLS-protected). On the Outfits tab, users pick an occasion and **Claude Haiku 4.5** returns 3 outfit suggestions assembled only from items already in their closet. Dark-themed UI with a warm-gold accent. The app handles both Western and South Asian ethnic wear (kurta / sherwani / dhoti etc.) as first-class categories.

---

## 2. Tech stack (quick reference)

- **Runtime:** Expo 54 · React Native 0.81 · React 19 · Expo Router 6 (file-based routing) · New Architecture enabled
- **State:** Zustand 5
- **Styling:** NativeWind 4 + Tailwind 3 · @expo/vector-icons
- **Fonts:** Inter, Fraunces, JetBrains Mono (all via @expo-google-fonts)
- **Media:** expo-image-picker, expo-blur, expo-haptics
- **Backend:** Supabase (Postgres + Storage + RLS + Edge Functions / Deno runtime) · @supabase/supabase-js 2.49
- **Session persistence:** expo-sqlite/localStorage adapter for Supabase auth
- **AI (via Edge Functions only — no API key in the app):**
  - `classify-item` → `claude-sonnet-4-5-20250929` (vision)
  - `generate-outfits` → `claude-haiku-4-5-20251001` (text)
- **Language:** TypeScript strict, path alias `@/*`
- **Tests / CI:** none yet
- **Lint:** `expo lint` (ESLint via Expo preset)

---

## 3. Repo map (the paths you'll touch most)

```
app/
  _layout.tsx                     root layout, font loading, auth guard
  index.tsx                       splash / route entry
  auth/
    _layout.tsx  login.tsx  signup.tsx
  (tabs)/
    _layout.tsx                   4-tab configuration
    closet.tsx                    grid, category filter, sort, delete-all
    add.tsx                       capture → analyze → review → save
    outfits.tsx                   occasion picker + 3 generated outfits
    profile.tsx                   user info, counts, sign out
  item/
    [id].tsx                      item detail + edit mode

components/
  ItemCard.tsx                    grid card w/ image, color swatches, delete
  CategoryFilter.tsx              horizontal category chips
  ClassificationReview.tsx        form to edit AI output before save

store/
  auth.ts                         signIn / signUp / signOut / session
  closet.ts                       CRUD + upload-then-classify flow
  outfits.ts                      occasion-keyed outfit cache

lib/
  supabase.ts                     client, getSignedUrl, uploadClothingImage
  anthropic.ts                    wrappers around the two Edge Functions

types/
  index.ts                        Category, Season, ClothingItem, etc.

supabase/
  functions/
    classify-item/index.ts        Deno: download image → Claude vision → JSON
    generate-outfits/index.ts     Deno: items + occasion → 3 outfits JSON
    test-models/index.ts          scratch / not called by app
  migrations/
    001_clothing_items.sql        clothing_items + outfit_suggestions + RLS

global.css  tailwind.config.js  babel.config.js  metro.config.js
app.json  tsconfig.json  package.json  .env.example
```

---

## 4. What works today ✅

**Auth**
- Email/password sign-in and sign-up with client-side validation and error UI
- Session persistence via SQLite-backed localStorage adapter
- Auth guard in `app/_layout.tsx` redirects to `/auth/login` when unauthenticated

**Closet**
- 2-column grid with `ItemCard` (image, color name + category label, primary + secondary color swatches, delete overlay)
- Category filter chips: All / Tops (incl. outerwear) / Bottoms / Footwear / Ethnic / Accessories
- Sort by newest/oldest (toggle)
- Pull-to-refresh
- Delete-all with confirmation
- Empty state prompts first add
- Item count display (`N / total`)

**Add-item flow** (`app/(tabs)/add.tsx`)
- Phase state machine: capture → analyzing → form → saving
- "Take Photo" and "Choose from Library" entry points
- Animated scan-beam + rotating status strings during analysis
- Editable review form (subcategory, category, colors, formality, seasons, tags) before save
- `savingRef` guards against double-submit

**AI classification** (`supabase/functions/classify-item/`)
- Edge Function verifies the caller's Authorization header, then uses SERVICE_ROLE_KEY server-side to pull the image past RLS, base64-encodes it, and sends to Claude Sonnet 4.6 with a prompt that understands Indian ethnic wear as distinct categories (`ethnic_top` / `ethnic_bottom` / `ethnic_full`)
- Returns JSON: `{ category, subcategory, primary_color (hex + name), secondary_colors[], formality (1-5), seasons[], suggested_tags[], confidence }`
- Strips markdown code-fences defensively

**Item detail / edit** (`app/item/[id].tsx`)
- View mode: image, category badge, color, formality 5-dot scale, seasons, tags
- Edit mode: subcategory text, category dropdown, formality slider, season chips, tag add/remove
- Save → `clothing_items` update; delete → confirm + remove

**Outfit generation** (`app/(tabs)/outfits.tsx` + `supabase/functions/generate-outfits/`)
- 6 occasions: Casual, Smart Casual, Work, Formal, Date Night, Ethnic
- States: idle → loading (skeletons + rotating status) → results (3 cards, staggered reveal, per-card Regenerate)
- Sends only the minimal payload per item (id, category, subcategory, color name, formality, seasons, tags)
- Claude Haiku 4.5 returns `[{ name, item_ids[], description }]`; app rehydrates item_ids back into full `ClothingItem` objects
- Per-occasion result caching in Zustand for the session
- Error UI for empty closet, sparse wardrobe, or API failure with retry

**Storage & data**
- Images at `storage://clothing-images/{userId}/{itemId}.{ext}`; 1-hour signed URLs for display
- `clothing_items` table: id, user_id, storage_path, category, subcategory, primary_color, primary_color_name, secondary_colors (JSONB), formality, seasons (TEXT[]), tags (TEXT[]), created_at — with RLS `auth.uid() = user_id` on all ops and indexes on user_id + category
- `outfit_suggestions` table: logs every Claude generate call (user_id, occasion, weather_snapshot, suggestions JSONB, created_at). Write-through happens inside `generateOutfits` in [store/outfits.ts](store/outfits.ts); failure is non-blocking.
- `saved_outfits` table (migration [002_saved_outfits.sql](supabase/migrations/002_saved_outfits.sql)): one row per favorited outfit (user_id, occasion, name, description, item_ids UUID[], weather_snapshot, source_suggestion_id → outfit_suggestions, created_at). Full RLS.

**Outfit favorites & saved view** ([app/(tabs)/outfits.tsx](app/(tabs)/outfits.tsx))
- Heart button on each generated outfit card (top-right). Tap = save → `saved_outfits` row; tap again = unsave.
- Generate / Saved toggle at top of the Outfits tab switches between live generation and the user's saved library.
- Saved view lists favorites newest-first with the same card visual; items deleted from the closet since save render as grayed-out placeholders instead of crashing.
- Saved state is fetched on Outfits-tab mount and stays in sync with save/unsave actions.

**Profile**
- User email/id, item counts, sign out, app version

---

## 5. Partially done / not done ⚠️

- **Full history view** — every generate batch is now logged to `outfit_suggestions`, but there's no UI to browse the history (only favorites are surfaced). Data is ready whenever we want to build it.
- **Advanced closet filtering** — only category is filterable. Missing: season, formality, tag, free-text search by subcategory.
- **Weather integration** — `outfit_suggestions.weather_snapshot` and `saved_outfits.weather_snapshot` columns exist but no weather API is wired and the generator prompt does not consume temperature.
- **Trip packing lists** — not started (Milestone 2 per README).
- **Tests** — zero test coverage; nothing around the classifier prompt parsing in [lib/anthropic.ts](lib/anthropic.ts).
- **CI** — no GitHub Actions / workflow.
- **`supabase/functions/test-models/`** — scratch function not called from the app; either delete or document.

---

## 6. Known bugs 🐞

_None currently tracked. Add new bugs here with a file:line reference as you find them._

---

## 7. Integration details worth remembering

- **Edge Function auth:** both functions require an `Authorization: Bearer <anon-key>` header from the caller (the app passes the logged-in user's access token via `supabase.functions.invoke`, which adds it automatically).
- **classify-item service-role escape hatch:** the function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass Storage RLS when downloading the uploaded image — this is intentional and the only reason the key exists there.
- **Secrets (Supabase Edge Function env, set via CLI — never in `.env`):** `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Public app env (`.env`):** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- **RLS:** every table enforces `auth.uid() = user_id` on select/insert/update/delete.
- **Image upload:** URI → blob → ArrayBuffer → Supabase Storage at `{userId}/{itemId}.{jpg|png}`. Display uses signed URLs with a 1-hour expiry (see `getSignedUrl` in [lib/supabase.ts](lib/supabase.ts)).
- **Categories vocabulary:** Western (`top`, `bottom`, `outerwear`, `footwear`, `accessory`) + Ethnic (`ethnic_top`, `ethnic_bottom`, `ethnic_full`). When a user picks the Ethnic filter on the closet screen, all three ethnic categories match.

---

## 8. Design system (so AI doesn't reinvent tokens)

- **Colors:** background `#0A0A0A` · surface `#1A1A1A` · border `#2A2A2A` · accent `#D4A574` (warm gold) · text primary `#FFFFFF`
- **Fonts:** `Inter_*` for body and buttons, `Fraunces_*` for serif headlines, `JetBrainsMono_*` for small mono labels
- **Layout rules:** `useSafeAreaInsets()` everywhere near the top bar to clear the Dynamic Island; tap targets ≥ 44pt; rounded-full (28px) for primary pill buttons
- **Animation:** React Native `Animated` (not Reanimated) for loading spinners, skeletons, and staggered list reveals

---

## 9. How to run (cheatsheet)

```bash
# 1. App
cp .env.example .env             # fill EXPO_PUBLIC_SUPABASE_{URL,ANON_KEY}
npm install
npm run ios        # or android / web

# 2. Backend (Supabase CLI)
supabase login
supabase link --project-ref <ref>
supabase db push                                    # applies migrations/
supabase functions deploy classify-item
supabase functions deploy generate-outfits
supabase secrets set ANTHROPIC_API_KEY=sk-...
```

---

## 10. Update protocol

When something changes, update this file **in the same commit**:
- Feature landed → move the bullet from §5 to §4.
- Bug fixed → delete the bullet from §6 (don't just strike it through).
- Bug found → append to §6 with a file:line reference.
- Tech-stack change (dependency added/removed, model version bumped) → update §2.
- Next-feature plan completed → update §11.
- Bump "Last updated" at the top.

Keep each bullet one line. If an item needs more detail, link to a file/PR rather than inlining prose here.

---

## 11. Next feature on deck

Nothing committed yet. Open candidates (pick one and I'll plan it):

- **Advanced closet filtering** — season / formality / tag / text-search filters on the Closet tab. No backend changes. Most useful as the closet grows past ~30 items.
- **Outfit history view** — surface every past generate batch (the data is already being logged to `outfit_suggestions`), grouped by date. UI-only feature, reuses existing components.
- **Weather-aware outfit suggestions** — new weather API integration + location permission + generator prompt tweak. Bigger scope; `weather_snapshot` columns are already reserved on both `outfit_suggestions` and `saved_outfits`.
- **Rehydrate and tweak a saved outfit** — open a saved outfit, swap one item, re-save. Deeper product feature, small-ish scope.
