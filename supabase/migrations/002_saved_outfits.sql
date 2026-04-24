-- ============================================================
-- StyleSense: Saved Outfits (Favorites)
-- One row per favorited outfit. The outfit_suggestions table
-- (migration 001) continues to log every generate batch; this
-- table tracks individual outfits a user chose to keep.
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  occasion TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  item_ids UUID[] NOT NULL,
  weather_snapshot JSONB,
  source_suggestion_id UUID REFERENCES outfit_suggestions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_outfits_user_id  ON saved_outfits(user_id);
CREATE INDEX idx_saved_outfits_occasion ON saved_outfits(occasion);

ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved outfits"
  ON saved_outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved outfits"
  ON saved_outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved outfits"
  ON saved_outfits FOR DELETE
  USING (auth.uid() = user_id);
