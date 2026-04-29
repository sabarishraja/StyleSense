-- ============================================================
-- StyleSense: Wear Logs
-- One row per outfit worn on a given date. The UNIQUE constraint
-- prevents double-logging the same outfit on the same day.
-- ============================================================

CREATE TABLE wear_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  saved_outfit_id UUID REFERENCES saved_outfits(id) ON DELETE CASCADE NOT NULL,
  worn_on         DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, saved_outfit_id, worn_on)
);

CREATE INDEX idx_wear_logs_user_id      ON wear_logs(user_id);
CREATE INDEX idx_wear_logs_saved_outfit ON wear_logs(saved_outfit_id);

ALTER TABLE wear_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wear logs"
  ON wear_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wear logs"
  ON wear_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wear logs"
  ON wear_logs FOR DELETE USING (auth.uid() = user_id);
