"use client";

/**
 * Watch Analyzer - Main Orchestration Component
 *
 * Handles the complete flow:
 * 1. Photo capture
 * 2. AI analysis
 * 3. Reference matching
 * 4. Results display
 */

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { CameraCapture } from "./camera-capture";
import { AnalysisLoading } from "./analysis-loading";
import { AnalysisResults } from "./analysis-results";
import { ReferenceComparison } from "./reference-comparison";
import { NoWatchDetected } from "./no-watch-detected";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useReferenceStore } from "@/lib/stores/reference-store";
import type { WatchPhotoExtraction } from "@/types/watch-schema";

export function WatchAnalyzer() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WatchPhotoExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearchedReferences, setHasSearchedReferences] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { findMatches, matchResults, isMatching, error: matchError } = useReferenceStore();

  const handleCapture = (imageData: string) => {
    setPhotos((prev) => [...prev, imageData]);
  };

  const handleCloseCamera = () => {
    setIsCapturing(false);
  };

  const handleStartCapture = () => {
    setIsCapturing(true);
    setPhotos([]);
    setAnalysisResult(null);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Filter to only image files
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setError("Please select image files only");
      return;
    }

    let processed = 0;
    const newPhotos: string[] = [];

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPhotos.push(event.target.result as string);
        }
        processed++;

        // When all files are processed, add them to photos
        if (processed === imageFiles.length) {
          setPhotos((prev) => [...prev, ...newPhotos]);
          setError(null);
        }
      };
      reader.onerror = () => {
        processed++;
        if (processed === imageFiles.length && newPhotos.length > 0) {
          setPhotos((prev) => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: photos }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Analysis failed");
      }

      setAnalysisResult(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze watch");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setPhotos([]);
    setAnalysisResult(null);
    setError(null);
    setHasSearchedReferences(false);
  };

  const handleRetryMatch = () => {
    if (analysisResult) {
      setHasSearchedReferences(false);
      findMatches(analysisResult);
    }
  };

  // Check if no watch was detected
  const noWatchDetected = analysisResult && (
    analysisResult.watch_identity?.brand?.toLowerCase().includes("unknown") ||
    analysisResult.watch_identity?.brand?.toLowerCase().includes("not a watch") ||
    analysisResult.watch_identity?.brand?.toLowerCase().includes("no watch") ||
    analysisResult.preliminary_assessment?.toLowerCase().includes("no watch")
  );

  // Auto-match when analysis completes (only if watch was detected)
  useEffect(() => {
    if (analysisResult && !noWatchDetected && !hasSearchedReferences && !isMatching) {
      console.log('🔎 Auto-triggering reference search');
      setHasSearchedReferences(true);
      findMatches(analysisResult);
    }
  }, [analysisResult, noWatchDetected, hasSearchedReferences, isMatching, findMatches]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Main Content */}
        {!analysisResult ? (
          <>
            {/* Photo Capture Section */}
            {photos.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <Card className="border border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-16 pb-16 px-8">
                    <div className="text-center space-y-8">
                      {/* Icon */}
                      <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur">
                        <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>

                      {/* Text */}
                      <div className="space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          Authenticate Your Watch
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                          Upload high-quality photos from multiple angles. Our AI will analyze your timepiece and match it against our reference library.
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button
                          size="lg"
                          onClick={handleStartCapture}
                          className="min-w-[180px] h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          </svg>
                          Open Camera
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="min-w-[180px] h-12 border-2 hover:bg-accent/50"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload Photos
                        </Button>
                      </div>

                      {/* Tips */}
                      <div className="pt-8 mt-8 border-t border-border/50">
                        <div className="grid sm:grid-cols-3 gap-6">
                          <div className="flex flex-col items-center gap-3 group">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="text-lg font-bold text-emerald-400">1</span>
                            </div>
                            <p className="text-sm font-medium">Multiple Angles</p>
                            <p className="text-xs text-muted-foreground">Dial, case back, side profile</p>
                          </div>
                          <div className="flex flex-col items-center gap-3 group">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="text-lg font-bold text-amber-400">2</span>
                            </div>
                            <p className="text-sm font-medium">Good Lighting</p>
                            <p className="text-xs text-muted-foreground">Natural light, no glare</p>
                          </div>
                          <div className="flex flex-col items-center gap-3 group">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="text-lg font-bold text-purple-400">3</span>
                            </div>
                            <p className="text-sm font-medium">Clear Focus</p>
                            <p className="text-xs text-muted-foreground">Sharp details visible</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Large Analyzing Image - Shows ABOVE photo review when analyzing */}
                {isAnalyzing && <AnalysisLoading photos={photos} />}

                {/* Photo Review Card */}
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Compact header */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs">
                          Clear
                        </Button>
                      </div>

                      {error && (
                        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                          {error}
                        </div>
                      )}

                      {/* Analyze Button - Positioned ABOVE photo list */}
                      {!isAnalyzing && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            size="default"
                            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Analyze
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleStartCapture}
                            size="icon"
                            className="flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            size="icon"
                            className="flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </Button>
                        </div>
                      )}

                      {/* Compact Photo Strip - Now BELOW analyze button */}
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative group flex-shrink-0">
                            <img
                              src={photo}
                              alt={`${index + 1}`}
                              className="h-20 w-20 object-cover rounded border-2 border-border hover:border-primary transition-colors"
                            />
                            <button
                              onClick={() => handleRemovePhoto(index)}
                              className="absolute -top-1.5 -right-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="h-20 w-20 flex-shrink-0 border-2 border-dashed border-border hover:border-primary rounded flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
          </>
        ) : (
          <>
            {/* Analysis Results */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {noWatchDetected ? "Analysis Complete" : "Analysis Results"}
                </h2>
                <Button variant="outline" onClick={handleReset}>
                  New Analysis
                </Button>
              </div>

              {noWatchDetected ? (
                <NoWatchDetected onRetry={handleReset} />
              ) : (
                <AnalysisResults data={analysisResult} photos={photos} />
              )}

              {/* Reference Matching Status */}
              {!noWatchDetected && isMatching && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Searching reference library...
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Reference Matching Error */}
              {!noWatchDetected && matchError && (
                <Card className="border-destructive/50">
                  <CardContent className="py-6">
                    <h3 className="font-semibold text-destructive mb-2">
                      Reference Matching Error
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Unable to search the reference library. This is likely due to a database configuration issue.
                    </p>
                    <div className="p-3 bg-muted rounded text-xs font-mono mb-3">
                      {matchError}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="/admin/setup">Fix Database</a>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleRetryMatch}>
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Matches Found */}
              {!noWatchDetected && !isMatching && !matchError && matchResults.length === 0 && analysisResult && (
                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent className="py-6">
                    <h3 className="font-semibold mb-2">No Reference Matches Found</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      No similar watches found in your reference library for{' '}
                      <span className="font-medium text-foreground">
                        {analysisResult.watch_identity.brand} {analysisResult.watch_identity.model_name}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="/admin/references">Add to Reference Library</a>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleRetryMatch}>
                        Search Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {matchResults.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Reference Library Matches</h3>
                      <p className="text-sm text-muted-foreground">
                        Found {matchResults.length} potential match{matchResults.length !== 1 ? 'es' : ''} in reference library
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRetryMatch}>
                      Re-compare
                    </Button>
                  </div>

                  {matchResults.map((match, index) => (
                    <ReferenceComparison key={index} match={match} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Camera Capture Modal */}
        <AnimatePresence>
          {isCapturing && (
            <CameraCapture
              onCapture={handleCapture}
              onClose={handleCloseCamera}
              photoCount={photos.length}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
