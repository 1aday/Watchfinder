"use client";

/**
 * Analysis Detail Page
 *
 * View full details of a specific watch analysis
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResults } from "@/components/analysis-results";
import type { WatchPhotoExtraction } from "@/types/watch-schema";

interface AnalysisDetail {
  id: string;
  created_at: string;
  analysis_data: WatchPhotoExtraction;
  photo_urls: string[];
}

export default function AnalysisDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/history/${id}`);
        if (!response.ok) {
          throw new Error("Failed to load analysis");
        }

        const result = await response.json();
        setAnalysis(result.data);
      } catch (err) {
        setError("Failed to load analysis details");
        console.error(err);
        toast.error("Failed to load analysis details");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete analysis");
      }

      toast.success("Analysis deleted successfully!");
      router.push("/history");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete analysis");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/history">
            <Button variant="outline" className="gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to History
            </Button>
          </Link>

          {analysis && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analysis...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Link href="/history">
                <Button>Back to History</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 text-sm text-muted-foreground">
              Analyzed on{" "}
              {new Date(analysis.created_at).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>

            <AnalysisResults
              data={analysis.analysis_data}
              photos={analysis.photo_urls}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
