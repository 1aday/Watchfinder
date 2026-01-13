-- Fix brand similarity type mismatch
-- Migration 005: Change similarity return type from DECIMAL to REAL

-- Drop and recreate the function with correct types
DROP FUNCTION IF EXISTS search_references_by_brand(TEXT, DECIMAL, INTEGER);

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
