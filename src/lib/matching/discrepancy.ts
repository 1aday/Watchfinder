/**
 * Discrepancy Calculation
 *
 * Compares AI analysis results against reference watch data
 * and generates detailed field-by-field discrepancy reports
 */

import type {
  WatchPhotoExtraction,
  ReferenceWatch,
  FieldDiscrepancy,
  DiscrepancySeverity,
  FieldImportance,
} from '@/types/watch-schema';
import { calculateStringScore } from './fuzzy-matcher';

// Field configuration for comparison
interface FieldConfig {
  path: string;
  label: string;
  importance: FieldImportance;
  threshold: number; // Minimum similarity score (0-1) to be considered a match
}

const FIELD_CONFIG: Record<FieldImportance, FieldConfig[]> = {
  critical: [
    {
      path: 'watch_identity.brand',
      label: 'Brand',
      importance: 'critical' as FieldImportance,
      threshold: 0.95,
    },
    {
      path: 'watch_identity.model_name',
      label: 'Model',
      importance: 'critical' as FieldImportance,
      threshold: 0.90,
    },
    {
      path: 'watch_identity.reference_number',
      label: 'Reference Number',
      importance: 'critical' as FieldImportance,
      threshold: 0.85,
    },
  ],
  high: [
    {
      path: 'physical_observations.case_material',
      label: 'Case Material',
      importance: 'high' as FieldImportance,
      threshold: 0.85,
    },
    {
      path: 'physical_observations.dial_color',
      label: 'Dial Color',
      importance: 'high' as FieldImportance,
      threshold: 0.80,
    },
    {
      path: 'watch_identity.dial_variant',
      label: 'Dial Variant',
      importance: 'high' as FieldImportance,
      threshold: 0.80,
    },
  ],
  medium: [
    {
      path: 'physical_observations.bezel_type',
      label: 'Bezel Type',
      importance: 'medium' as FieldImportance,
      threshold: 0.75,
    },
    {
      path: 'physical_observations.bracelet_type',
      label: 'Bracelet',
      importance: 'medium' as FieldImportance,
      threshold: 0.70,
    },
    {
      path: 'physical_observations.crystal_material',
      label: 'Crystal',
      importance: 'medium' as FieldImportance,
      threshold: 0.80,
    },
    {
      path: 'physical_observations.case_shape',
      label: 'Case Shape',
      importance: 'medium' as FieldImportance,
      threshold: 0.75,
    },
  ],
  low: [
    {
      path: 'physical_observations.clasp_type',
      label: 'Clasp Type',
      importance: 'low' as FieldImportance,
      threshold: 0.60,
    },
    {
      path: 'physical_observations.crown_type',
      label: 'Crown',
      importance: 'low' as FieldImportance,
      threshold: 0.60,
    },
    {
      path: 'physical_observations.case_finish',
      label: 'Case Finish',
      importance: 'low' as FieldImportance,
      threshold: 0.65,
    },
  ],
  optional: [
    {
      path: 'watch_identity.serial_number',
      label: 'Serial Number',
      importance: 'optional' as FieldImportance,
      threshold: 0.90,
    },
    {
      path: 'watch_identity.estimated_year',
      label: 'Year',
      importance: 'optional' as FieldImportance,
      threshold: 0.80,
    },
    {
      path: 'condition_assessment.overall_grade',
      label: 'Condition',
      importance: 'optional' as FieldImportance,
      threshold: 0.70,
    },
  ],
};

/**
 * Get nested property value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Compare a single field and generate discrepancy
 */
function compareField(
  fieldConfig: FieldConfig,
  aiValue: any,
  refValue: any
): FieldDiscrepancy | null {
  const { path, label, importance, threshold } = fieldConfig;

  // Missing data check
  if (!aiValue && !refValue) return null;
  if (!aiValue || !refValue) {
    return {
      field_path: path,
      field_label: label,
      importance,
      severity: 'missing_data' as DiscrepancySeverity,
      ai_value: aiValue,
      reference_value: refValue,
      explanation: aiValue
        ? 'Reference data missing for comparison'
        : 'AI could not extract this value from photos',
    };
  }

  // Boolean comparison
  if (typeof aiValue === 'boolean') {
    return {
      field_path: path,
      field_label: label,
      importance,
      severity: (aiValue === refValue
        ? 'exact_match'
        : 'major_diff') as DiscrepancySeverity,
      ai_value: aiValue,
      reference_value: refValue,
      similarity_score: aiValue === refValue ? 100 : 0,
      explanation:
        aiValue === refValue
          ? 'Values match'
          : `Mismatch: AI detected "${aiValue}" but reference shows "${refValue}"`,
    };
  }

  // String comparison
  if (typeof aiValue === 'string' && typeof refValue === 'string') {
    const similarity = calculateStringScore(aiValue, refValue, 'auto');
    const similarityPercent = similarity * 100;

    let severity: DiscrepancySeverity;
    if (similarity >= 0.95) {
      severity = 'exact_match' as DiscrepancySeverity;
    } else if (similarity >= threshold) {
      severity = 'minor_diff' as DiscrepancySeverity;
    } else if (importance === 'critical') {
      severity = 'critical' as DiscrepancySeverity;
    } else {
      severity = 'major_diff' as DiscrepancySeverity;
    }

    return {
      field_path: path,
      field_label: label,
      importance,
      severity,
      ai_value: aiValue,
      reference_value: refValue,
      similarity_score: similarityPercent,
      explanation: generateExplanation(similarity, aiValue, refValue),
    };
  }

  return null;
}

/**
 * Generate human-readable explanation for discrepancy
 */
function generateExplanation(
  similarity: number,
  aiValue: string,
  refValue: string
): string {
  if (similarity >= 0.95) {
    return 'Values match';
  } else if (similarity >= 0.85) {
    return `Minor variation: "${aiValue}" vs "${refValue}"`;
  } else if (similarity >= 0.70) {
    return `Moderate difference: "${aiValue}" vs "${refValue}" - verify carefully`;
  } else {
    return `Significant mismatch: "${aiValue}" vs "${refValue}" - possible red flag`;
  }
}

/**
 * Compare array fields (authenticity indicators)
 */
function compareArrayFields(
  aiAnalysis: WatchPhotoExtraction,
  reference: ReferenceWatch
): FieldDiscrepancy[] {
  const discrepancies: FieldDiscrepancy[] = [];

  // Compare positive authenticity signs
  const aiSigns = aiAnalysis.authenticity_indicators.positive_signs || [];
  const refSigns = reference.authenticity_indicators.positive_signs || [];

  if (refSigns.length > 0) {
    // Check how many expected signs were found
    const expectedSignsFound = refSigns.filter((refSign) =>
      aiSigns.some((aiSign) => calculateStringScore(aiSign, refSign, 'auto') > 0.7)
    );

    const matchRate = expectedSignsFound.length / refSigns.length;
    const matchPercent = matchRate * 100;

    let severity: DiscrepancySeverity;
    if (matchRate >= 0.9) {
      severity = 'exact_match' as DiscrepancySeverity;
    } else if (matchRate >= 0.7) {
      severity = 'minor_diff' as DiscrepancySeverity;
    } else if (matchRate >= 0.5) {
      severity = 'major_diff' as DiscrepancySeverity;
    } else {
      severity = 'critical' as DiscrepancySeverity;
    }

    discrepancies.push({
      field_path: 'authenticity_indicators.positive_signs',
      field_label: 'Authenticity Markers',
      importance: 'high' as FieldImportance,
      severity,
      ai_value: aiSigns,
      reference_value: refSigns,
      similarity_score: matchPercent,
      explanation: `AI found ${expectedSignsFound.length} of ${refSigns.length} expected authenticity markers (${matchPercent.toFixed(0)}% match)`,
    });
  }

  // Compare red flags - if AI found red flags not in reference, that's concerning
  const aiRedFlags = aiAnalysis.authenticity_indicators.red_flags || [];
  const refRedFlags = reference.authenticity_indicators.red_flags || [];

  if (aiRedFlags.length > 0 && refRedFlags.length === 0) {
    discrepancies.push({
      field_path: 'authenticity_indicators.red_flags',
      field_label: 'Red Flags',
      importance: 'critical' as FieldImportance,
      severity: 'critical' as DiscrepancySeverity,
      ai_value: aiRedFlags,
      reference_value: refRedFlags,
      explanation: `AI detected ${aiRedFlags.length} red flag(s) not expected in genuine examples`,
    });
  }

  return discrepancies;
}

/**
 * Main function: Calculate all discrepancies between AI analysis and reference
 */
export function calculateDiscrepancies(
  aiAnalysis: WatchPhotoExtraction,
  reference: ReferenceWatch
): FieldDiscrepancy[] {
  const discrepancies: FieldDiscrepancy[] = [];

  // Process each field category
  for (const [, fields] of Object.entries(FIELD_CONFIG)) {
    for (const field of fields) {
      const aiValue = getNestedValue(aiAnalysis, field.path);
      const refValue = getNestedValue(reference, field.path);

      const discrepancy = compareField(field, aiValue, refValue);

      if (discrepancy) {
        discrepancies.push(discrepancy);
      }
    }
  }

  // Handle array fields (authenticity indicators)
  const arrayDiscrepancies = compareArrayFields(aiAnalysis, reference);
  discrepancies.push(...arrayDiscrepancies);

  return discrepancies;
}

/**
 * Generate summary statistics for discrepancies
 */
export function summarizeDiscrepancies(discrepancies: FieldDiscrepancy[]): {
  total: number;
  by_severity: Record<DiscrepancySeverity, number>;
  by_importance: Record<FieldImportance, number>;
  critical_issues: FieldDiscrepancy[];
} {
  const bySeverity: Record<string, number> = {};
  const byImportance: Record<string, number> = {};
  const criticalIssues: FieldDiscrepancy[] = [];

  for (const disc of discrepancies) {
    // Count by severity
    bySeverity[disc.severity] = (bySeverity[disc.severity] || 0) + 1;

    // Count by importance
    byImportance[disc.importance] = (byImportance[disc.importance] || 0) + 1;

    // Collect critical issues
    if (disc.severity === 'critical') {
      criticalIssues.push(disc);
    }
  }

  return {
    total: discrepancies.length,
    by_severity: bySeverity as Record<DiscrepancySeverity, number>,
    by_importance: byImportance as Record<FieldImportance, number>,
    critical_issues: criticalIssues,
  };
}
