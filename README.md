# StyleSense

StyleSense is a mobile wardrobe app that uses AI to catalog your clothing. You photograph a garment, Claude analyzes it, and the app stores structured metadata — category, colors, formality, seasonality, style tags — so you can filter and browse your closet without thinking.

Milestone 1 (this repo) covers the full capture-to-catalog pipeline. Milestone 2 (outfit suggestions based on occasions) is fully implemented using Claude to mix and match your closet into curated looks.

---

## What's interesting here

Most "AI + mobile" demos stop at calling an API and rendering the response. This project goes further: the AI output becomes structured relational data with a schema, indexed columns, row-level security, and a real query layer. It also handles Indian ethnic wear (kurtas, sherwanis, dhotis) without forcing them into Western clothing categories — something most fashion datasets get wrong.

If you're a student or developer reading this to learn, the parts worth studying are:

- How the Supabase Edge Function acts as a secure AI proxy (the client never touches the Anthropic API directly)
- How the Claude prompt is designed to return valid JSON reliably
- How RLS policies enforce data isolation at the database level, not the application level
- How Zustand manages async upload + classify + insert as a single atomic-feeling flow

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Expo (React Native)                   │
│                                                         │
│  app/          →  Expo Router (file-based routing)      │
│  store/        →  Zustand (auth + closet state)         │
│  components/   →  UI building blocks                    │
│  lib/          →  Supabase client, storage helpers      │
└───────────────────────────┬─────────────────────────────┘
                            │
                    Supabase (Backend)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   PostgreSQL          Supabase            Edge Functions
   (clothing_items,    Storage             (Deno runtime)
    outfit_suggestions) (user images)           │
                                                │
                                         Anthropic API
                                         (Claude Sonnet 4.6)
```

The client never calls Anthropic directly. Image upload goes to Supabase Storage, then the client invokes the Edge Function with just a storage path. The Edge Function downloads the image server-side, encodes it, calls Claude, validates the response, and returns structured JSON. This keeps the API key out of the mobile bundle entirely.

---

## Tech decisions and why

**Expo + React Native** — We needed iOS and Android from one codebase without a web build being the primary target. Expo's managed workflow handles the native layer (camera, haptics, image picker) without ejecting.

**Supabase** — Postgres with a REST/realtime API, auth, storage, and edge functions in one platform. The alternative was Firebase, which has a document model that doesn't suit structured clothing metadata (you want real filtering, not client-side array scans). Supabase also lets you run standard SQL migrations, which matters when your schema evolves.

**Zustand** — React Context causes unnecessary re-renders across the component tree when auth or closet state changes. Zustand uses a subscription model — components subscribe to only the slices they need. For a list that can grow to hundreds of items, this matters.

**NativeWind (Tailwind for RN)** — Utility-first CSS in React Native. The alternative is StyleSheet objects, which are verbose and harder to iterate on. NativeWind v4 uses the new React Native architecture (bridgeless), which is why `newArchEnabled: true` is set in app.json.

**Deno for Edge Functions** — Supabase Functions run on Deno, not Node. Deno has native TypeScript support, a permission model, and no node_modules. The tradeoff is that some npm packages don't work — but for this use case (HTTP calls to Anthropic + Supabase), the standard `fetch` API and Deno imports are sufficient.

---

## The AI pipeline

The classify-item Edge Function is the core of Milestone 1. Here's what happens:

1. Client uploads image to `supabase.storage` at path `{userId}/{itemId}.{ext}`
2. Client calls `supabase.functions.invoke('classify-item', { body: { storagePath, mimeType } })`
3. Edge Function uses the **service role key** to download the image from storage (bypassing RLS — the client's anon key can't do this)
4. Image is base64-encoded and sent to Claude Sonnet 4.6 as a vision message
5. Claude returns a JSON object matching this schema:

```typescript
{
  category: 'top' | 'bottom' | 'outerwear' | 'footwear' | 'ethnic_top' | 'ethnic_bottom' | 'ethnic_full' | 'accessory',
  subcategory: string,           // e.g. "kurta", "slim-fit jeans", "chelsea boots"
  primary_color: string,         // hex code
  primary_color_name: string,    // human-readable name
  secondary_colors: { hex: string, name: string }[],
  formality: 1 | 2 | 3 | 4 | 5, // 1 = very casual, 5 = black tie
  seasons: ('summer' | 'fall' | 'winter' | 'spring' | 'all')[],
  tags: string[],                // fabric, pattern, fit descriptors
  confidence: number             // 0.0–1.0
}
```

The prompt instructs Claude explicitly: *do not force South Asian ethnic wear into Western categories*. A kurta is `ethnic_top`, not `top`. A sherwani is `ethnic_full`, not `outerwear`. This distinction is what the `ethnic_*` categories exist for.

One practical detail: Claude sometimes wraps JSON in markdown code fences (` ```json ... ``` `). The Edge Function strips those before parsing, so it works regardless of whether Claude adds them or not.

---

## Database schema

```sql
-- clothing_items
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE
storage_path  TEXT NOT NULL
category      TEXT NOT NULL
subcategory   TEXT
primary_color TEXT
primary_color_name TEXT
secondary_colors   JSONB  -- [{hex, name}, ...]
formality     INT CHECK (formality BETWEEN 1 AND 5)
seasons       TEXT[]
tags          TEXT[]
notes         TEXT
created_at    TIMESTAMPTZ DEFAULT now()
```

Indexes on `user_id` and `category` for fast per-user filtered queries. RLS policies ensure `auth.uid() = user_id` for every operation — select, insert, update, delete. The app layer doesn't need to enforce this; the database does.

---

## Running locally

**Prerequisites:** Node.js 18+, Supabase CLI, an Anthropic API key, a Supabase project.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY from your Supabase project dashboard

# Push the database schema
supabase db push

# Set Edge Function secrets (never goes in .env)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...

# Deploy the Edge Functions
supabase functions deploy classify-item
supabase functions deploy generate-outfits

# Start the app
npx expo start
```

For local Edge Function development, `supabase functions serve` runs them locally with hot reload.

---

## Project structure

```
app/
  _layout.tsx          Root layout — font loading, auth guard, tab navigation
  auth/                Login and signup screens (outside the tab navigator)
  (tabs)/
    closet.tsx         Main screen — clothing grid with category filters
    add.tsx            Capture → AI analysis → form review → save
    outfits.tsx        AI outfit generation with 3-phase loading & results
    profile.tsx        User stats, sign out

components/
  ItemCard.tsx         Grid card — image, category label, formality dots, color swatches
  CategoryFilter.tsx   Horizontal scroll filter chips

store/
  auth.ts              Sign in, sign up, sign out, session persistence
  closet.ts            Item fetch, upload + classify, insert, filter state

lib/
  supabase.ts          Supabase client init, uploadToStorage, getSignedUrl helpers
  anthropic.ts         Thin wrapper around supabase.functions.invoke for classify-item

types/
  index.ts             ClothingItem, Classification, Category, Season type definitions

supabase/
  functions/classify-item/index.ts    Image analysis function
  functions/generate-outfits/index.ts Outfit generation function
  migrations/001_clothing_items.sql   Full schema + RLS policies
```

---

## What's not done yet

- **User Profiles & Auth Flow**: Supabase Auth is configured, but a polished login/signup UI flow and profile management are still needed for a full production release.
- **Advanced Filtering**: Filtering the closet by seasons, tags, or secondary colors.
- **Trip Packing Lists**: Allowing users to group outfits into collections for specific trips or dates on a calendar.
- **Manual Overrides**: Letting users manually edit AI classifications if Claude makes a mistake.

---

## Notes for students

A few things that might not be obvious:

**Why does the Edge Function use the service role key?** — Supabase Storage respects RLS. A user's anon key can only access files that belong to them, but the Edge Function runs as a backend service, not as that user. Using the service role key lets the function download any file, which is necessary because the JWT (user session) isn't passed into the function.

**Why base64 and not a URL?** — Claude's vision API accepts either a URL or inline base64. Passing a Supabase signed URL would work, but signed URLs expire (ours are set to 1 hour). Encoding inline means the function doesn't depend on URL validity at inference time.

**Why store hex codes instead of color names?** — Color names are ambiguous. "Navy" means different things to different people. Hex codes are exact and can be used directly in the UI (`backgroundColor: item.primary_color`) without a lookup table.

**Why Zustand over Redux?** — Redux requires actions, reducers, and a store setup that's appropriate for large teams with strict change tracing requirements. For a project this size, Zustand's direct-mutation API (`set(state => { state.items = [...] })`) is less ceremony for the same result.
