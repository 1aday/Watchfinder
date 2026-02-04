/**
 * Reference Matching API
 * POST /api/references/match
 *
 * Finds matching reference watches for AI analysis results
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  calculateMatchScore,
  getConfidenceTier,
  meetsMinimumCriteria,
  rankMatches,
  DEFAULT_MATCHING_CONFIG,
} from '@/lib/matching/fuzzy-matcher';
import { calculateDiscrepancies } from '@/lib/matching/discrepancy';
import type {
  WatchPhotoExtraction,
  ReferenceWatch,
  MatchResult,
} from '@/types/watch-schema';

export async function POST(request: NextRequest) {
  try {
    const { analysis, sessionId } = await request.json() as {
      analysis: WatchPhotoExtraction;
      sessionId?: string;
    };

    if (!analysis || !analysis.watch_identity) {
      return NextResponse.json(
        { error: 'Invalid analysis data' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Step 1: Use RPC but will apply stricter filtering in-memory
    // Get candidates by brand first, then filter by model in Step 1b
    const { data: rawCandidates, error: searchError } = await supabase
      .rpc('search_references_by_brand', {
        search_brand: analysis.watch_identity.brand,
        similarity_threshold: 0.75,  // Slightly stricter than before
        result_limit: 50,
      });

    if (searchError) {
      console.error('Database search error:', searchError);
      return NextResponse.json(
        { error: 'Failed to search references' },
        { status: 500 }
      );
    }

    if (!rawCandidates || rawCandidates.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        total_found: 0,
        message: 'No matching references found in library',
      });
    }

    // Step 1b: Apply stricter in-memory filtering to require BOTH brand and model similarity
    const { jaroWinklerSimilarity } = await import('@/lib/matching/fuzzy-matcher');
    const candidates = rawCandidates.filter((ref: ReferenceWatch) => {
      const brandSim = jaroWinklerSimilarity(
        analysis.watch_identity.brand,
        ref.brand
      );
      const modelSim = jaroWinklerSimilarity(
        analysis.watch_identity.model_name,
        ref.model_name
      );

      // Require BOTH brand AND model to meet minimum thresholds
      const meetsThreshold = brandSim >= 0.65 && modelSim >= 0.50;

      if (!meetsThreshold) {
        console.log(`🚫 Pre-filtered: ${ref.brand} ${ref.model_name} (brand: ${(brandSim * 100).toFixed(1)}%, model: ${(modelSim * 100).toFixed(1)}%)`);
      }

      return meetsThreshold;
    });

    if (candidates.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        total_found: 0,
        message: 'No matching references found in library (after filtering)',
        total_candidates_scanned: rawCandidates.length,
      });
    }

    // Step 2: Calculate detailed scores for each candidate
    const matches: MatchResult[] = [];

    console.log(`\n🔍 Analyzing ${candidates.length} candidate(s):`);
    console.log(`AI Analysis: ${analysis.watch_identity.brand} ${analysis.watch_identity.model_name}`);

    for (const candidate of candidates) {
      // Calculate match scores
      const { match_score, component_scores } = calculateMatchScore(
        analysis,
        candidate as ReferenceWatch
      );

      console.log(`\nCandidate: ${candidate.brand} ${candidate.model_name}`);
      console.log(`  Brand score: ${component_scores.brand.toFixed(1)}%`);
      console.log(`  Model score: ${component_scores.model.toFixed(1)}%`);
      console.log(`  Overall: ${match_score.toFixed(1)}%`);

      // Check if meets minimum criteria
      if (!meetsMinimumCriteria(component_scores.brand, component_scores.model)) {
        console.log(`  ❌ Rejected: Brand ${component_scores.brand.toFixed(1)}% < 65% OR Model ${component_scores.model.toFixed(1)}% < 50%`);
        continue; // Skip this candidate
      }

      console.log(`  ✅ Accepted`);

      // Determine confidence tier
      const confidence_tier = getConfidenceTier(match_score);

      // Calculate discrepancies
      const discrepancies = calculateDiscrepancies(
        analysis,
        candidate as ReferenceWatch
      );

      matches.push({
        reference_watch: candidate as ReferenceWatch,
        match_score,
        component_scores,
        confidence_tier,
        discrepancies,
      });
    }

    // Step 3: Rank and filter matches
    const rankedMatches = rankMatches(matches);

    console.log(`\n📊 Final Results: ${rankedMatches.length} match(es) returned`);
    rankedMatches.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.reference_watch.brand} ${m.reference_watch.model_name} - ${m.match_score.toFixed(1)}% (${m.confidence_tier})`);
    });

    // Step 4: Store comparison for analytics (top match only)
    if (rankedMatches.length > 0) {
      const topMatch = rankedMatches[0];

      await supabase.from('analysis_comparisons').insert({
        reference_watch_id: topMatch.reference_watch.id,
        ai_analysis: analysis,
        match_score: topMatch.match_score,
        brand_match_score: topMatch.component_scores.brand,
        model_match_score: topMatch.component_scores.model,
        reference_match_score: topMatch.component_scores.reference,
        discrepancies: topMatch.discrepancies,
        session_id: sessionId,
      });
    }

    return NextResponse.json({
      success: true,
      matches: rankedMatches,
      total_found: rankedMatches.length,
      total_candidates_checked: candidates.length,
    });

  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Matching failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
