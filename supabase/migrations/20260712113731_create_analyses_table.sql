/*
# Create analyses table for GREENLY

1. New Tables
- `analyses` - stores environmental impact analyses created by users via calculators
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users)
  - `category` (text, not null) - one of: carbon, water, energy, food, waste, electronics
  - `inputs` (jsonb, not null) - the raw inputs used for the calculation
  - `outputs` (jsonb, not null) - computed results (co2, green_score, trees_needed, etc.)
  - `ai_recommendation` (text) - AI-generated recommendation text
  - `green_score` (integer) - 0-100 green score for quick filtering/sorting
  - `co2e` (numeric) - carbon equivalent in kg, nullable for non-carbon categories
  - `notes` (text) - optional user notes
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `analyses`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- 4 separate policies (select/insert/update/delete) for authenticated users.

3. Indexes
- Index on `user_id` for fast per-user queries.
- Index on `created_at` desc for history ordering.
- Index on `category` for filtering by calculator type.

4. Important Notes
- `user_id` defaults to `auth.uid()` so frontend inserts omitting user_id succeed.
- `updated_at` auto-set via trigger to track when analyses were last modified.
*/

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('carbon','water','energy','food','waste','electronics')),
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  outputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_recommendation text,
  green_score integer DEFAULT 0,
  co2e numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON analyses;
CREATE POLICY "select_own_analyses" ON analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON analyses;
CREATE POLICY "insert_own_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON analyses;
CREATE POLICY "update_own_analyses" ON analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON analyses;
CREATE POLICY "delete_own_analyses" ON analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_category ON analyses(category);

-- updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_analyses_updated_at ON analyses;
CREATE TRIGGER trg_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
