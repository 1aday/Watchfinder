/**
 * Fuzzy Matching Algorithms
 *
 * Implements string similarity algorithms for matching AI analysis
 * against reference library watches
 */

import * as natural from 'natural';
import type {
  WatchPhotoExtraction,
  ReferenceWatch,
  MatchResult,
  MatchingConfig,
} from '@/types/watch-schema';

// Default matching configuration
export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  weights: {
    brand_exact: 0.40,      // 40% - Brand must be close
    model_fuzzy: 0.35,      // 35% - Model similarity
    reference_fuzzy: 0.15,  // 15% - Reference number
    physical_match: 0.10,   // 10% - Physical characteristics
  },
  thresholds: {
    excellent_match: 85,    // >85% - Very confident match
    good_match: 70,         // 70-85% - Likely match
    possible_match: 55,     // 55-70% - Needs review
    poor_match: 40,         // <40% - Likely different watch
  },
  string_similarity: {
    brand_min: 0.65,        // Brand must be 65%+ similar (more permissive)
    model_min: 0.45,        // Model 45%+ similar (very permissive for discovery)
    reference_min: 0.70,    // Reference number 70%+ similar
  },
  max_results: 5,           // Return top 5 matches
};

// ============================================================================
// STRING SIMILARITY ALGORITHMS
// ============================================================================

/**
 * Calculate Jaro-Winkler similarity between two strings
 * Best for short strings, prefix-biased (good for brands/models)
 * Returns 0-1 (1 = identical)
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  return natural.JaroWinklerDistance(s1, s2);
}

/**
 * Calculate Levenshtein distance-based similarity
 * Good for longer strings with transpositions
 * Returns 0-1 (1 = identical)
 */
export function levenshteinSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const distance = natural.LevenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);

  return 1 - (distance / maxLen);
}

/**
 * Calculate string similarity using appropriate algorithm
 * Jaro-Winkler for short strings (<20 chars), Levenshtein for longer
 */
export function calculateStringScore(
  str1: string,
  str2: string,
  algorithm: 'jaro-winkler' | 'levenshtein' | 'auto' = 'auto'
): number {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0; // Exact match

  // Auto-select algorithm based on string length
  if (algorithm === 'auto') {
    const avgLen = (s1.length + s2.length) / 2;
    algorithm = avgLen < 20 ? 'jaro-winkler' : 'levenshtein';
  }

  return algorithm === 'jaro-winkler'
    ? jaroWinklerSimilarity(s1, s2)
    : levenshteinSimilarity(s1, s2);
}

// ============================================================================
// PHYSICAL CHARACTERISTICS COMPARISON
// ============================================================================

/**
 * Compare physical characteristics between AI and reference
 * Returns 0-1 score based on matching fields
 */
export function calculatePhysicalSimilarity(
  aiObs: WatchPhotoExtraction['physical_observations'],
  refObs: ReferenceWatch['physical_observations']
): number {
  const fields = [
    'case_material',
    'dial_color',
    'bezel_type',
    'bracelet_type',
    'crystal_material',
    'case_shape',
    'case_finish',
    'hands_style',
    'indices_type',
  ];

  let totalScore = 0;
  let fieldsCompared = 0;

  for (const field of fields) {
    const aiValue = aiObs[field as keyof typeof aiObs];
    const refValue = refObs[field as keyof typeof refObs];

    if (aiValue && refValue) {
      fieldsCompared++;

      if (typeof aiValue === 'string' && typeof refValue === 'string') {
        const similarity = calculateStringScore(aiValue, refValue, 'auto');
        // Give full credit if similarity > 0.8, partial credit otherwise
        totalScore += similarity > 0.8 ? 1 : similarity;
      } else if (typeof aiValue === 'boolean' && typeof refValue === 'boolean') {
        totalScore += aiValue === refValue ? 1 : 0;
      }
    }
  }

  return fieldsCompared > 0 ? totalScore / fieldsCompared : 0;
}

// ============================================================================
// MAIN MATCHING FUNCTION
// ============================================================================

/**
 * Calculate match score between AI analysis and reference watch
 * Returns score 0-100 and component scores
 */
export function calculateMatchScore(
  aiAnalysis: WatchPhotoExtraction,
  reference: ReferenceWatch,
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG
): {
  match_score: number;
  component_scores: {
    brand: number;
    model: number;
    reference: number;
    physical: number;
  };
} {
  // Brand score (exact or fuzzy)
  const brandScore = calculateStringScore(
    aiAnalysis.watch_identity.brand,
    reference.brand,
    'jaro-winkler'
  );

  // Model score
  const modelScore = calculateStringScore(
    aiAnalysis.watch_identity.model_name,
    reference.model_name,
    'jaro-winkler'
  );

  // Reference number score
  const refNumScore = calculateStringScore(
    aiAnalysis.watch_identity.reference_number,
    reference.reference_number,
    'levenshtein'
  );

  // Physical characteristics score
  const physicalScore = calculatePhysicalSimilarity(
    aiAnalysis.physical_observations,
    reference.physical_observations
  );

  // Weighted total score
  const totalScore =
    brandScore * config.weights.brand_exact +
    modelScore * config.weights.model_fuzzy +
    refNumScore * config.weights.reference_fuzzy +
    physicalScore * config.weights.physical_match;

  return {
    match_score: totalScore * 100, // Convert to 0-100 scale
    component_scores: {
      brand: brandScore * 100,
      model: modelScore * 100,
      reference: refNumScore * 100,
      physical: physicalScore * 100,
    },
  };
}

/**
 * Determine confidence tier based on match score
 */
export function getConfidenceTier(
  matchScore: number,
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG
): 'excellent' | 'good' | 'possible' | 'poor' {
  if (matchScore >= config.thresholds.excellent_match) return 'excellent';
  if (matchScore >= config.thresholds.good_match) return 'good';
  if (matchScore >= config.thresholds.possible_match) return 'possible';
  return 'poor';
}

/**
 * Check if reference meets minimum matching criteria
 */
export function meetsMinimumCriteria(
  brandScore: number,
  modelScore: number,
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG
): boolean {
  return (
    brandScore >= config.string_similarity.brand_min * 100 &&
    modelScore >= config.string_similarity.model_min * 100
  );
}

/**
 * Sort and filter match results
 */
export function rankMatches(
  matches: MatchResult[],
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG
): MatchResult[] {
  // Don't filter by score - let user see all potential matches
  // They can evaluate based on confidence tier
  return matches
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, config.max_results);
}
