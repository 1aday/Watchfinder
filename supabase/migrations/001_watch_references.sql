-- Watch Reference Library Schema
-- Migration 001: Initial schema for reference watch library system

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable trigram similarity for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable GIN indexes for JSONB
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Reference watches table
-- Stores verified watch specifications for comparison against AI analysis
CREATE TABLE reference_watches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Watch Identity (indexed columns for fast queries)
  brand TEXT NOT NULL,
  model_name TEXT NOT NULL,
  collection_family TEXT,
  reference_number TEXT NOT NULL,

  -- Full watch identity data (JSONB for flexibility)
  watch_identity JSONB NOT NULL,

  -- Physical observations (extracted commonly queried fields)
  case_material TEXT,
  dial_color TEXT,
  bracelet_type TEXT,
  physical_observations JSONB NOT NULL,

  -- Condition assessment baseline (what "mint" looks like for this reference)
  condition_baseline JSONB,

  -- Authenticity indicators (what to look for in genuine examples)
  authenticity_indicators JSONB NOT NULL,

  -- Metadata
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'needs_review', 'deprecated')),
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  source TEXT, -- e.g., "manufacturer_docs", "expert_verified", "auction_house"
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

  -- Constraints
  CONSTRAINT unique_reference_per_brand UNIQUE (brand, model_name, reference_number)
);

-- Reference watch images table
-- Stores metadata for reference images (actual images in Supabase Storage)
CREATE TABLE reference_watch_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_watch_id UUID NOT NULL REFERENCES reference_watches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Image metadata
  angle_tag TEXT NOT NULL, -- e.g., "dial_front", "caseback", "profile_left", "crown_closeup"
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  storage_url TEXT NOT NULL, -- Public URL
  file_size_bytes INTEGER,
  mime_type TEXT DEFAULT 'image/jpeg',

  -- Image properties
  width INTEGER,
  height INTEGER,
  quality_score DECIMAL(3,2), -- 0-1 score for image quality (optional)

  -- Ordering and display
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

-- Analysis comparisons table
-- Tracks all AI vs Reference matches for analytics and audit trail
CREATE TABLE analysis_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Links
  reference_watch_id UUID REFERENCES reference_watches(id),

  -- AI Analysis data (stored for audit trail)
  ai_analysis JSONB NOT NULL,
  uploaded_images_urls TEXT[],

  -- Match scoring
  match_score DECIMAL(5,2), -- Overall similarity score (0-100)
  brand_match_score DECIMAL(5,2),
  model_match_score DECIMAL(5,2),
  reference_match_score DECIMAL(5,2),

  -- Discrepancy details
  discrepancies JSONB, -- Field-by-field comparison
  discrepancy_summary TEXT,

  -- User feedback
  user_confirmed_match BOOLEAN,
  user_notes TEXT,

  -- Session tracking
  session_id TEXT,
  user_id TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Trigram indexes for fuzzy text search
CREATE INDEX idx_ref_watches_brand_trgm ON reference_watches USING gin (brand gin_trgm_ops);
CREATE INDEX idx_ref_watches_model_trgm ON reference_watches USING gin (model_name gin_trgm_ops);

-- Standard B-tree indexes for exact lookups
CREATE INDEX idx_ref_watches_reference ON reference_watches (reference_number);
CREATE INDEX idx_ref_watches_status ON reference_watches (verification_status);
CREATE INDEX idx_ref_watches_composite ON reference_watches (brand, model_name, reference_number);

-- Full-text search index
CREATE INDEX idx_ref_watches_search ON reference_watches USING gin (search_vector);

-- JSONB GIN indexes for nested queries
CREATE INDEX idx_ref_watches_identity ON reference_watches USING gin (watch_identity);
CREATE INDEX idx_ref_watches_observations ON reference_watches USING gin (physical_observations);
CREATE INDEX idx_ref_watches_authenticity ON reference_watches USING gin (authenticity_indicators);

-- Reference images indexes
CREATE INDEX idx_ref_images_watch ON reference_watch_images (reference_watch_id);
CREATE INDEX idx_ref_images_angle ON reference_watch_images (angle_tag);

-- Partial unique index to ensure only one primary image per watch
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

-- Auto-update updated_at timestamp
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
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE reference_watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_watch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_comparisons ENABLE ROW LEVEL SECURITY;

-- Public read access for verified reference watches
CREATE POLICY "Public read verified reference watches"
  ON reference_watches FOR SELECT
  USING (verification_status = 'verified');

-- Public read access for images of verified watches
CREATE POLICY "Public read verified reference images"
  ON reference_watch_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reference_watches
      WHERE id = reference_watch_images.reference_watch_id
      AND verification_status = 'verified'
    )
  );

-- Anyone can create analysis comparisons (for analytics)
CREATE POLICY "Public insert comparisons"
  ON analysis_comparisons FOR INSERT
  WITH CHECK (true);

-- Anyone can read comparisons
CREATE POLICY "Public read comparisons"
  ON analysis_comparisons FOR SELECT
  USING (true);

-- TODO: Add admin-only policies for insert/update/delete on reference_watches
-- (requires authentication setup in Phase 2)

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View combining references with aggregate stats
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

-- Function for fast brand-based filtering using trigram similarity
CREATE OR REPLACE FUNCTION search_references_by_brand(
  search_brand TEXT,
  similarity_threshold REAL DEFAULT 0.85,
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
  brand_similarity REAL
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

-- ============================================================================
-- SAMPLE DATA (Optional - comment out for production)
-- ============================================================================

-- Insert a sample reference watch for testing
-- Uncomment to add sample data:
/*
INSERT INTO reference_watches (
  brand,
  model_name,
  collection_family,
  reference_number,
  watch_identity,
  case_material,
  dial_color,
  bracelet_type,
  physical_observations,
  authenticity_indicators,
  verification_status,
  source,
  notes
) VALUES (
  'Rolex',
  'Submariner',
  'Oyster Perpetual',
  '116610LN',
  '{
    "brand": "Rolex",
    "model_name": "Submariner",
    "collection_family": "Oyster Perpetual",
    "reference_number": "116610LN",
    "dial_variant": "Black Dial",
    "bezel_variant": "Black Ceramic",
    "bracelet_variant": "Oyster Bracelet",
    "limited_edition": false,
    "serial_number": "",
    "estimated_year": "2010-2020"
  }'::jsonb,
  'Stainless Steel 904L',
  'Black',
  'Oyster Bracelet',
  '{
    "case_material": "Stainless Steel 904L",
    "case_finish": "Mixed (polished and brushed)",
    "case_diameter_estimate": "40mm",
    "case_shape": "Round",
    "bezel_type": "Unidirectional rotating",
    "bezel_material": "Stainless Steel",
    "bezel_insert_material": "Ceramic (Cerachrom)",
    "crystal_material": "Sapphire",
    "has_cyclops": true,
    "crown_type": "Screw-down Triplock",
    "has_crown_guards": true,
    "dial_color": "Black",
    "dial_finish": "Matte",
    "indices_type": "Applied luminous hour markers",
    "hands_style": "Mercedes hands with luminous fill",
    "has_date": true,
    "date_position": "3 o''clock with cyclops",
    "bracelet_type": "Oyster bracelet",
    "bracelet_material": "Stainless Steel 904L",
    "clasp_type": "Oysterlock with Glidelock extension"
  }'::jsonb,
  '{
    "positive_signs": [
      "Crisp, evenly applied lume on dial and hands",
      "Perfect cyclops magnification (2.5x)",
      "Sharp rehaut engraving with correct font",
      "Solid end links with minimal play",
      "Correct reference and serial number engravings",
      "Smooth, precise bezel action with correct number of clicks"
    ],
    "concerns": [],
    "red_flags": [],
    "confidence_level": "high",
    "reasoning": "Genuine 116610LN Submariners exhibit excellent build quality with precise finishing"
  }'::jsonb,
  'verified',
  'manufacturer_docs',
  'Reference data from official Rolex specifications'
);
*/
