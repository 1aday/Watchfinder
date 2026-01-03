"use client";

/*
 * Analysis Loading State — The Moment of Anticipation
 * 
 * Design Philosophy (Pixar's "Anticipation"):
 * This is not just a loading screen. It's a narrative moment.
 * We're building anticipation for the reveal. The scanning animation
 * makes the user feel like the AI is actively examining the watch.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { WatchIcon, ScanIcon, ShieldIcon, SparkleIcon } from "./icons";

interface AnalysisLoadingProps {
  photos: string[];
}

// Analysis stages with personality
const STAGES = [
  {
    id: "processing",
    icon: WatchIcon,
    title: "Processing Images",
    description: "Enhancing and preparing your photos",
    duration: 2000,
  },
  {
    id: "identifying",
    icon: ScanIcon,
    title: "Identifying Watch",
    description: "Analyzing brand, model, and reference",
    duration: 3000,
  },
  {
    id: "examining",
    icon: SparkleIcon,
    title: "Examining Details",
    description: "Inspecting dial, case, bezel, and movement markers",
    duration: 4000,
  },
  {
    id: "authenticating",
    icon: ShieldIcon,
    title: "Evaluating Authenticity",
    description: "Checking for authentication markers",
    duration: 3000,
  },
];

export function AnalysisLoading({ photos }: AnalysisLoadingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage progression
    const stageTimers = STAGES.map((stage, index) => {
      const delay = STAGES.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
      return setTimeout(() => {
        if (index < STAGES.length) {
          setCurrentStage(index);
        }
      }, delay);
    });

    // Smooth progress animation
    const totalDuration = STAGES.reduce((acc, s) => acc + s.duration, 0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (totalDuration / 100));
        return Math.min(next, 95); // Cap at 95% until complete
      });
    }, 100);

    return () => {
      stageTimers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, []);

  const stage = STAGES[currentStage];

  return (
    <div className="relative py-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-64 h-64 rounded-full bg-primary/20 blur-3xl"
        />
      </div>

      <div className="relative space-y-6">
        {/* Large Watch Image with Scanning Effect */}
        <div className="relative mx-auto w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border">
          {/* Watch Image */}
          <Image
            src={photos[0]}
            alt="Analyzing watch"
            fill
            className="object-contain p-4"
            sizes="280px"
            priority
          />
          
          {/* Vertical Scanning Line */}
          <motion.div
            animate={{
              x: ["-100%", "400%"],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-y-0 w-[60px] pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.15) 30%, rgba(212, 175, 55, 0.4) 50%, rgba(212, 175, 55, 0.15) 70%, transparent 100%)",
            }}
          />
          
          {/* Scan Line Glow */}
          <motion.div
            animate={{
              x: ["-100%", "400%"],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-y-0 w-[2px] pointer-events-none shadow-[0_0_20px_8px_rgba(212,175,55,0.3)]"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(212, 175, 55, 0.8) 20%, rgba(212, 175, 55, 1) 50%, rgba(212, 175, 55, 0.8) 80%, transparent 100%)",
            }}
          />

          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/50 rounded-tl" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/50 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/50 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/50 rounded-br" />
          
          {/* Analyzing badge */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
              <span className="text-xs font-medium text-white">Analyzing</span>
            </div>
          </div>
        </div>

        {/* Additional photos being analyzed */}
        {photos.length > 1 && (
          <div className="flex justify-center gap-2">
            {photos.slice(1, 4).map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative w-14 h-14 rounded-lg overflow-hidden ring-1 ring-border"
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
                {/* Mini scan effect */}
                <motion.div
                  animate={{ y: ["-100%", "200%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                  className="absolute left-0 right-0 h-1/3 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
                />
              </motion.div>
            ))}
            {photos.length > 4 && (
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center ring-1 ring-border">
                <span className="text-xs text-muted-foreground">+{photos.length - 4}</span>
              </div>
            )}
          </div>
        )}

        {/* Stage info */}
        <div className="text-center space-y-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-1"
            >
              <h3 className="text-lg font-semibold">{stage?.title}</h3>
              <p className="text-sm text-muted-foreground">{stage?.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto space-y-3">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          
          {/* Stage indicators */}
          <div className="flex justify-between px-1">
            {STAGES.map((s, index) => (
              <div key={s.id} className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={false}
                  animate={{
                    scale: index === currentStage ? 1.3 : 1,
                    opacity: index <= currentStage ? 1 : 0.3,
                  }}
                  className={`
                    w-2 h-2 rounded-full transition-colors duration-300
                    ${index <= currentStage ? "bg-primary" : "bg-muted-foreground/30"}
                  `}
                />
                <span className={`text-[10px] ${index === currentStage ? "text-primary font-medium" : "text-muted-foreground/50"}`}>
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subtle tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center text-xs text-muted-foreground/60 pt-2"
        >
          This typically takes 10-15 seconds
        </motion.p>
      </div>
    </div>
  );
}
