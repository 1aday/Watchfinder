-- Watch Reference Library Schema
-- Migration 002: Fixed version with correct partial index syntax

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Reference watches table
CREATE TABLE reference_watches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Watch Identity
  brand TEXT NOT NULL,
  model_name TEXT NOT NULL,
  collection_family TEXT,
  reference_number TEXT NOT NULL,

  -- Full watch identity data
  watch_identity JSONB NOT NULL,

  -- Physical observations
  case_material TEXT,
  dial_color TEXT,
  bracelet_type TEXT,
  physical_observations JSONB NOT NULL,

  -- Condition baseline
  condition_baseline JSONB,

  -- Authenticity indicators
  authenticity_indicators JSONB NOT NULL,

  -- Metadata
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'needs_review', 'deprecated')),
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  source TEXT,
  notes TEXT,

  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(brand, '') || ' ' ||
      coalesce(model_name, '') || ' ' ||
      coalesce(collection_family, '') || ' ' ||
      coalesce(reference_number, '')
    )
  ) STORED,

  CONSTRAINT unique_reference_per_brand UNIQUE (brand, model_name, reference_number)
);

-- Reference watch images table
CREATE TABLE reference_watch_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_watch_id UUID NOT NULL REFERENCES reference_watches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  angle_tag TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT DEFAULT 'image/jpeg',

  width INTEGER,
  height INTEGER,
  quality_score DECIMAL(3,2),

  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

-- Analysis comparisons table
CREATE TABLE analysis_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  reference_watch_id UUID REFERENCES reference_watches(id),

  ai_analysis JSONB NOT NULL,
  uploaded_images_urls TEXT[],

  match_score DECIMAL(5,2),
  brand_match_score DECIMAL(5,2),
  model_match_score DECIMAL(5,2),
  reference_match_score DECIMAL(5,2),

  discrepancies JSONB,
  discrepancy_summary TEXT,

  user_confirmed_match BOOLEAN,
  user_notes TEXT,

  session_id TEXT,
  user_id TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Trigram indexes
CREATE INDEX idx_ref_watches_brand_trgm ON reference_watches USING gin (brand gin_trgm_ops);
CREATE INDEX idx_ref_watches_model_trgm ON reference_watches USING gin (model_name gin_trgm_ops);

-- Standard indexes
CREATE INDEX idx_ref_watches_reference ON reference_watches (reference_number);
CREATE INDEX idx_ref_watches_status ON reference_watches (verification_status);
CREATE INDEX idx_ref_watches_composite ON reference_watches (brand, model_name, reference_number);

-- Full-text search
CREATE INDEX idx_ref_watches_search ON reference_watches USING gin (search_vector);

-- JSONB indexes
CREATE INDEX idx_ref_watches_identity ON reference_watches USING gin (watch_identity);
CREATE INDEX idx_ref_watches_observations ON reference_watches USING gin (physical_observations);
CREATE INDEX idx_ref_watches_authenticity ON reference_watches USING gin (authenticity_indicators);

-- Reference images indexes
CREATE INDEX idx_ref_images_watch ON reference_watch_images (reference_watch_id);
CREATE INDEX idx_ref_images_angle ON reference_watch_images (angle_tag);

-- Partial unique index for primary images
CREATE UNIQUE INDEX idx_ref_images_unique_primary
  ON reference_watch_images (reference_watch_id)
  WHERE is_primary = true;

-- Analysis comparisons indexes
CREATE INDEX idx_comparisons_reference ON analysis_comparisons (reference_watch_id);
CREATE INDEX idx_comparisons_score ON analysis_comparisons (match_score DESC);
CREATE INDEX idx_comparisons_session ON analysis_comparisons (session_id);
CREATE INDEX idx_comparisons_created ON analysis_comparisons (created_at DESC);
CREATE INDEX idx_comparisons_confirmed ON analysis_comparisons (user_confirmed_match) WHERE user_confirmed_match = true;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reference_watches_updated_at
  BEFORE UPDATE ON reference_watches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE reference_watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_watch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read verified reference watches"
  ON reference_watches FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Public read verified reference images"
  ON reference_watch_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reference_watches
      WHERE id = reference_watch_images.reference_watch_id
      AND verification_status = 'verified'
    )
  );

CREATE POLICY "Public insert comparisons"
  ON analysis_comparisons FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read comparisons"
  ON analysis_comparisons FOR SELECT
  USING (true);

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE VIEW reference_watches_with_stats AS
SELECT
  rw.*,
  COUNT(DISTINCT rwi.id) as image_count,
  MAX(rwi.storage_url) FILTER (WHERE rwi.is_primary = true) as primary_image_url,
  COUNT(DISTINCT ac.id) as comparison_count,
  AVG(ac.match_score) FILTER (WHERE ac.user_confirmed_match = true) as avg_confirmed_match_score,
  COUNT(DISTINCT ac.id) FILTER (WHERE ac.user_confirmed_match = true) as confirmed_match_count
FROM reference_watches rw
LEFT JOIN reference_watch_images rwi ON rw.id = rwi.reference_watch_id
LEFT JOIN analysis_comparisons ac ON rw.id = ac.reference_watch_id
GROUP BY rw.id;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION search_references_by_brand(
  search_brand TEXT,
  similarity_threshold DECIMAL DEFAULT 0.85,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  brand TEXT,
  model_name TEXT,
  reference_number TEXT,
  watch_identity JSONB,
  physical_observations JSONB,
  authenticity_indicators JSONB,
  brand_similarity DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rw.id,
    rw.brand,
    rw.model_name,
    rw.reference_number,
    rw.watch_identity,
    rw.physical_observations,
    rw.authenticity_indicators,
    similarity(rw.brand, search_brand) as brand_similarity
  FROM reference_watches rw
  WHERE
    rw.verification_status = 'verified'
    AND similarity(rw.brand, search_brand) >= similarity_threshold
  ORDER BY similarity(rw.brand, search_brand) DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
