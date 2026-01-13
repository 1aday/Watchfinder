-- ============================================================================
-- Analysis History Table
-- ============================================================================

CREATE TABLE analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Analysis results
  analysis_data JSONB NOT NULL,

  -- Photo URLs
  photo_urls TEXT[] NOT NULL,
  primary_photo_url TEXT,

  -- Quick access fields for filtering/sorting
  brand TEXT,
  model_name TEXT,
  reference_number TEXT,
  confidence_level TEXT,
  overall_grade TEXT,

  -- Match results if any
  match_results JSONB,
  best_match_score DECIMAL(5,2),

  -- User/session tracking
  session_id TEXT,
  user_id TEXT,

  -- Metadata
  photo_count INTEGER,
  analysis_duration_ms INTEGER
);

-- Indexes for common queries
CREATE INDEX idx_analysis_history_created_at ON analysis_history (created_at DESC);
CREATE INDEX idx_analysis_history_brand ON analysis_history (brand);
CREATE INDEX idx_analysis_history_confidence ON analysis_history (confidence_level);
CREATE INDEX idx_analysis_history_session ON analysis_history (session_id);

-- Full text search
CREATE INDEX idx_analysis_history_search ON analysis_history USING gin (
  to_tsvector('english',
    coalesce(brand, '') || ' ' ||
    coalesce(model_name, '') || ' ' ||
    coalesce(reference_number, '')
  )
);

-- RLS Policies (open for now, can add auth later)
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to analysis history"
ON analysis_history FOR ALL
USING (true)
WITH CHECK (true);
