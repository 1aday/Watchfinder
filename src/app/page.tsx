"use client";

/*
 * Watchfinder — Main Experience
 * 
 * Design Philosophy:
 * "Simplicity is the ultimate sophistication." — Leonardo da Vinci
 * 
 * This page orchestrates the entire user journey:
 * 1. Welcome state — Inviting, clear value proposition
 * 2. Capture state — Focused, guided photo collection
 * 3. Analysis state — Anticipation building, professional feel
 * 4. Results state — Comprehensive yet scannable report
 * 
 * Every transition should feel purposeful. Every interaction
 * should provide feedback. The app should feel like a trusted
 * expert in your pocket.
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraCapture } from "@/components/camera-capture";
import { PhotoGallery } from "@/components/photo-gallery";
import { PhotoGuide } from "@/components/photo-guide";
import { AnalysisLoading } from "@/components/analysis-loading";
import { AnalysisResults } from "@/components/analysis-results";
import { 
  WatchIcon, 
  CameraIcon, 
  UploadIcon, 
  ScanIcon,
  RefreshIcon,
  PlusIcon,
} from "@/components/icons";
import type { WatchPhotoExtraction } from "@/types/watch-schema";

// App states for clear flow management
type AppState = "welcome" | "capture" | "analyzing" | "results";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("welcome");
  const [photos, setPhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [results, setResults] = useState<WatchPhotoExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo capture handler
  const handleCapture = useCallback((imageData: string) => {
    setPhotos((prev) => [...prev, imageData]);
    setAppState("capture");
    setError(null);
    setShowCamera(false);
  }, []);

  // File upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          setPhotos((prev) => [...prev, result]);
          setAppState("capture");
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Remove photo handler
  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const newPhotos = prev.filter((_, i) => i !== index);
      if (newPhotos.length === 0) {
        setAppState("welcome");
      }
      return newPhotos;
    });
  }, []);

  // Reorder photos handler
  const reorderPhotos = useCallback((newOrder: string[]) => {
    setPhotos(newOrder);
  }, []);

  // Analysis handler
  const analyzePhotos = useCallback(async () => {
    if (photos.length === 0) return;

    setAppState("analyzing");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: photos }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResults(data.data);
      setAppState("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setAppState("capture");
    }
  }, [photos]);

  // Reset handler
  const resetAll = useCallback(() => {
    setPhotos([]);
    setResults(null);
    setError(null);
    setAppState("welcome");
  }, []);

  // Start new analysis (keep photos)
  const newAnalysis = useCallback(() => {
    setResults(null);
    setError(null);
    setAppState("capture");
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative">
        <div className="px-5 pt-14 pb-6 safe-top">
          <div className="max-w-lg mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <WatchIcon size={22} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Watchfinder</h1>
                <p className="text-xs text-muted-foreground">AI Authentication</p>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative px-5 pb-8">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {/* Welcome State */}
            {appState === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Hero section */}
                <div className="text-center pt-8 pb-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-24 h-24 mx-auto mb-6"
                  >
                    {/* Animated rings */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border border-primary/30"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.05, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      className="absolute inset-0 rounded-full border border-primary/20"
                    />
                    
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <ScanIcon size={28} className="text-primary" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-semibold tracking-tight mb-2"
                  >
                    Authenticate Any Watch
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground max-w-xs mx-auto"
                  >
                    Capture photos and get instant AI analysis of authenticity, condition, and specifications
                  </motion.p>
                </div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <button
                    onClick={() => setShowCamera(true)}
                    className="w-full flex items-center justify-center gap-3 h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-2xl font-medium transition-all shadow-lg shadow-primary/20 btn-press"
                  >
                    <CameraIcon size={20} />
                    Open Camera
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 h-14 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-2xl font-medium transition-colors btn-press"
                  >
                    <UploadIcon size={20} />
                    Upload Photos
                  </button>
                </motion.div>

                {/* Feature highlights */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-3 gap-4 pt-4"
                >
                  {[
                    { label: "Instant", sublabel: "Analysis" },
                    { label: "Detailed", sublabel: "Report" },
                    { label: "Expert", sublabel: "AI Model" },
                  ].map((feature, i) => (
                    <div key={i} className="text-center">
                      <p className="text-sm font-medium">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.sublabel}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Capture State */}
            {appState === "capture" && (
              <motion.div
                key="capture"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Photo guide */}
                <PhotoGuide capturedCount={photos.length} />

                {/* Photo gallery */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Your Photos</h3>
                    <span className="text-xs text-muted-foreground">{photos.length} captured</span>
                  </div>
                  <PhotoGallery 
                    photos={photos} 
                    onRemove={removePhoto}
                    onReorder={reorderPhotos}
                  />
                </div>

                {/* Add more buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCamera(true)}
                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-medium transition-colors btn-press"
                  >
                    <CameraIcon size={16} />
                    Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-medium transition-colors btn-press"
                  >
                    <PlusIcon size={16} />
                    Upload
                  </button>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                    >
                      <p className="text-sm text-destructive">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analyze button */}
                <button
                  onClick={analyzePhotos}
                  disabled={photos.length < 1}
                  className="w-full flex items-center justify-center gap-3 h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 disabled:from-muted disabled:to-muted disabled:text-muted-foreground text-primary-foreground rounded-2xl font-medium transition-all shadow-lg shadow-primary/20 disabled:shadow-none btn-press"
                >
                  <ScanIcon size={20} />
                  {photos.length < 3 
                    ? `Analyze (${3 - photos.length} more recommended)` 
                    : "Analyze Watch"
                  }
                </button>

                {/* Cancel link */}
                <button
                  onClick={resetAll}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Start Over
                </button>
              </motion.div>
            )}

            {/* Analyzing State */}
            {appState === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <AnalysisLoading photos={photos} />
              </motion.div>
            )}

            {/* Results State */}
            {appState === "results" && results && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Results header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Analysis Complete</h2>
                    <p className="text-xs text-muted-foreground">
                      Based on {photos.length} photo{photos.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={newAnalysis}
                      className="h-9 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors flex items-center gap-2 btn-press"
                    >
                      <PlusIcon size={14} />
                      Add Photos
                    </button>
                    <button
                      onClick={resetAll}
                      className="h-9 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors flex items-center gap-2 btn-press"
                    >
                      <RefreshIcon size={14} />
                      New
                    </button>
                  </div>
                </div>

                {/* Results content */}
                <AnalysisResults data={results} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Camera overlay */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onCapture={handleCapture}
            onClose={() => setShowCamera(false)}
            photoCount={photos.length}
          />
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Bottom safe area spacer */}
      <div className="h-8 safe-bottom" />
    </main>
  );
}
