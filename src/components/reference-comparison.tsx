"use client";

/**
 * Reference Comparison Component
 *
 * Shows detailed field-by-field comparison between AI analysis and reference
 */

import { motion } from "framer-motion";
import type {
  MatchResult,
  FieldDiscrepancy,
  DiscrepancySeverity,
} from "@/types/watch-schema";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ReferenceComparisonProps {
  match: MatchResult;
}

const SEVERITY_CONFIG: Record<
  DiscrepancySeverity,
  {
    icon: string;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  exact_match: {
    icon: "✓",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    label: "Match",
  },
  minor_diff: {
    icon: "~",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    label: "Minor Variation",
  },
  major_diff: {
    icon: "!",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    label: "Significant Difference",
  },
  critical: {
    icon: "✕",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    label: "Critical Mismatch",
  },
  missing_data: {
    icon: "?",
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-800",
    label: "No Data",
  },
};

function DiscrepancyCard({ discrepancy }: { discrepancy: FieldDiscrepancy }) {
  const config = SEVERITY_CONFIG[discrepancy.severity] || SEVERITY_CONFIG.missing_data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
    >
      <div className="flex items-start gap-3">
        <div className={`text-lg font-bold ${config.color}`}>{config.icon}</div>

        <div className="flex-1 min-w-0">
          {/* Field name and severity badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-sm">{discrepancy.field_label}</span>
            <Badge variant="outline" className={`text-xs ${config.color}`}>
              {config.label}
            </Badge>
            {discrepancy.similarity_score !== undefined && (
              <span className="text-xs text-muted-foreground">
                {discrepancy.similarity_score.toFixed(0)}% match
              </span>
            )}
          </div>

          {/* Value comparison */}
          <div className="space-y-1.5 text-sm mb-2">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground text-xs w-12 flex-shrink-0">
                AI:
              </span>
              <span className="font-mono text-xs break-all">
                {formatValue(discrepancy.ai_value)}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground text-xs w-12 flex-shrink-0">
                Ref:
              </span>
              <span className="font-mono text-xs break-all">
                {formatValue(discrepancy.reference_value)}
              </span>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {discrepancy.explanation}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value.join(", ");
  }
  return String(value);
}

export function ReferenceComparison({ match }: ReferenceComparisonProps) {
  // Group discrepancies by severity
  const groupedDiscrepancies = match.discrepancies.reduce(
    (acc, disc) => {
      if (!acc[disc.severity]) {
        acc[disc.severity] = [];
      }
      acc[disc.severity].push(disc);
      return acc;
    },
    {} as Record<DiscrepancySeverity, FieldDiscrepancy[]>
  );

  const criticalCount = groupedDiscrepancies.critical?.length || 0;
  const majorCount = groupedDiscrepancies.major_diff?.length || 0;
  const minorCount = groupedDiscrepancies.minor_diff?.length || 0;
  const matchCount = groupedDiscrepancies.exact_match?.length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="mb-1">
              {match.reference_watch.brand} {match.reference_watch.model_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {match.reference_watch.reference_number}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {match.match_score.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              {match.confidence_tier}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Brand</div>
            <div className="text-sm font-semibold">
              {match.component_scores.brand.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Model</div>
            <div className="text-sm font-semibold">
              {match.component_scores.model.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ref #</div>
            <div className="text-sm font-semibold">
              {match.component_scores.reference.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Physical</div>
            <div className="text-sm font-semibold">
              {match.component_scores.physical.toFixed(0)}%
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({match.discrepancies.length})
            </TabsTrigger>
            <TabsTrigger value="critical" disabled={criticalCount === 0}>
              Critical ({criticalCount})
            </TabsTrigger>
            <TabsTrigger value="major" disabled={majorCount === 0}>
              Major ({majorCount})
            </TabsTrigger>
            <TabsTrigger value="minor" disabled={minorCount === 0}>
              Minor ({minorCount})
            </TabsTrigger>
            <TabsTrigger value="match" disabled={matchCount === 0}>
              Match ({matchCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {match.discrepancies.map((disc, idx) => (
              <DiscrepancyCard key={idx} discrepancy={disc} />
            ))}
          </TabsContent>

          {criticalCount > 0 && (
            <TabsContent value="critical" className="space-y-3 mt-4">
              {groupedDiscrepancies.critical?.map((disc, idx) => (
                <DiscrepancyCard key={idx} discrepancy={disc} />
              ))}
            </TabsContent>
          )}

          {majorCount > 0 && (
            <TabsContent value="major" className="space-y-3 mt-4">
              {groupedDiscrepancies.major_diff?.map((disc, idx) => (
                <DiscrepancyCard key={idx} discrepancy={disc} />
              ))}
            </TabsContent>
          )}

          {minorCount > 0 && (
            <TabsContent value="minor" className="space-y-3 mt-4">
              {groupedDiscrepancies.minor_diff?.map((disc, idx) => (
                <DiscrepancyCard key={idx} discrepancy={disc} />
              ))}
            </TabsContent>
          )}

          {matchCount > 0 && (
            <TabsContent value="match" className="space-y-3 mt-4">
              {groupedDiscrepancies.exact_match?.map((disc, idx) => (
                <DiscrepancyCard key={idx} discrepancy={disc} />
              ))}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
