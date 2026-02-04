"use client";

/**
 * Analysis History Page
 *
 * Display all previous watch analyses in a beautiful grid
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WatchPhotoExtraction } from "@/types/watch-schema";

interface AnalysisHistoryItem {
  id: string;
  created_at: string;
  analysis_data: WatchPhotoExtraction;
  photo_urls: string[];
  primary_photo_url: string;
  brand: string;
  model_name: string;
  reference_number: string;
  confidence_level: string;
  overall_grade: string;
  photo_count: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    total_pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [brandSearch, setBrandSearch] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");

  const loadHistory = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (brandSearch) {
        params.append("brand", brandSearch);
      }

      if (confidenceFilter && confidenceFilter !== "all") {
        params.append("confidence", confidenceFilter);
      }

      const response = await fetch(`/api/history?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load history");

      const result = await response.json();
      setAnalyses(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError("Failed to load analysis history");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandSearch, confidenceFilter]);

  const handleClearFilters = () => {
    setBrandSearch("");
    setConfidenceFilter("all");
  };

  const hasActiveFilters = brandSearch || confidenceFilter !== "all";

  const getConfidenceColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getGradeColor = (grade: string) => {
    const g = grade?.toLowerCase();
    if (g === "mint" || g === "excellent") return "text-emerald-500";
    if (g === "very_good" || g === "good") return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Analysis History
          </h1>
          <p className="text-muted-foreground">
            {pagination.total} watch{pagination.total !== 1 ? "es" : ""} analyzed
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Brand Search */}
              <div className="flex-1">
                <Input
                  placeholder="Search by brand (e.g., Rolex, Omega)..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Confidence Filter */}
              <div className="w-full md:w-48">
                <Select
                  value={confidenceFilter}
                  onValueChange={setConfidenceFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Confidence Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Confidence</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="whitespace-nowrap"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {brandSearch && (
                  <Badge variant="secondary" className="gap-1">
                    Brand: {brandSearch}
                    <button
                      onClick={() => setBrandSearch("")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {confidenceFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 capitalize">
                    Confidence: {confidenceFilter}
                    <button
                      onClick={() => setConfidenceFilter("all")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => loadHistory(pagination.page)}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && analyses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No analyses yet. Start by analyzing your first watch!
              </p>
              <Link href="/">
                <Button>New Analysis</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {!isLoading && !error && analyses.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {analyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/history/${analysis.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    {/* Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50">
                      {analysis.primary_photo_url && (
                        <Image
                          src={analysis.primary_photo_url}
                          alt={`${analysis.brand} ${analysis.model_name}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      )}

                      {/* Photo count badge */}
                      {analysis.photo_count > 1 && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                          <span className="text-xs text-white font-medium">
                            {analysis.photo_count} photos
                          </span>
                        </div>
                      )}

                      {/* Confidence badge */}
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getConfidenceColor(
                            analysis.confidence_level
                          )}`}
                        >
                          {analysis.confidence_level}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {/* Brand & Model */}
                        <div>
                          <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                            {analysis.brand || "Unknown"}
                          </p>
                          <h3 className="font-semibold line-clamp-1">
                            {analysis.model_name || "Unknown Model"}
                          </h3>
                        </div>

                        {/* Reference & Grade */}
                        <div className="flex items-center justify-between text-xs">
                          <code className="px-2 py-1 bg-muted rounded text-xs">
                            {analysis.reference_number || "—"}
                          </code>
                          <span
                            className={`capitalize font-medium ${getGradeColor(
                              analysis.overall_grade
                            )}`}
                          >
                            {analysis.overall_grade?.replace(/_/g, " ") || "—"}
                          </span>
                        </div>

                        {/* Date */}
                        <p className="text-xs text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => loadHistory(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => loadHistory(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
