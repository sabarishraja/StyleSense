-- ============================================================
-- StyleSense: Clothing Items Table + RLS Policies
-- ============================================================

-- Clothing items table
CREATE TABLE IF NOT EXISTS clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  primary_color TEXT,
  primary_color_name TEXT,
  secondary_colors JSONB DEFAULT '[]'::jsonb,
  formality INTEGER NOT NULL CHECK (formality BETWEEN 1 AND 5),
  seasons TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX idx_clothing_items_category ON clothing_items(category);

-- Enable RLS
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own items
CREATE POLICY "Users can view own items"
  ON clothing_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON clothing_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON clothing_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON clothing_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Outfit Suggestions Table (for Milestone 2, created now to
-- avoid a future migration dependency)
-- ============================================================

CREATE TABLE IF NOT EXISTS outfit_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  occasion TEXT NOT NULL,
  weather_snapshot JSONB,
  suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_outfit_suggestions_user_id ON outfit_suggestions(user_id);

ALTER TABLE outfit_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions"
  ON outfit_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suggestions"
  ON outfit_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suggestions"
  ON outfit_suggestions FOR DELETE
  USING (auth.uid() = user_id);
