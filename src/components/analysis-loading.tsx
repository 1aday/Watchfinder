"use client";

/*
 * Analysis Loading State — The Moment of Anticipation
 * 
 * Design Philosophy (Pixar's "Anticipation"):
 * This is not just a loading screen. It's a narrative moment.
 * We're building anticipation for the reveal. Each stage
 * tells the user what's happening, making the wait meaningful.
 * 
 * The visual should feel like the AI is actually "examining"
 * the watch, not just spinning a generic loader.
 */

import { useState, useEffect } from "react";
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

  const CurrentIcon = STAGES[currentStage]?.icon || WatchIcon;
  const stage = STAGES[currentStage];

  return (
    <div className="relative">
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

      <div className="relative space-y-8 py-8">
        {/* Animated icon */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Scanning rings */}
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border border-primary"
            />
            <motion.div
              animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 rounded-full border border-primary"
            />

            {/* Main icon container */}
            <motion.div
              animate={{ 
                rotate: currentStage === 1 ? [0, 360] : 0,
              }}
              transition={{ 
                duration: 3, 
                repeat: currentStage === 1 ? Infinity : 0,
                ease: "linear" 
              }}
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStage}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentIcon size={32} className="text-primary" />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Stage info */}
        <div className="text-center space-y-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold">{stage?.title}</h3>
              <p className="text-sm text-muted-foreground">{stage?.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto space-y-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
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
              <motion.div
                key={s.id}
                initial={false}
                animate={{
                  scale: index === currentStage ? 1.2 : 1,
                  opacity: index <= currentStage ? 1 : 0.3,
                }}
                className={`
                  w-1.5 h-1.5 rounded-full transition-colors duration-300
                  ${index <= currentStage ? "bg-primary" : "bg-muted-foreground/30"}
                `}
              />
            ))}
          </div>
        </div>

        {/* Photo preview - showing what's being analyzed */}
        <div className="flex justify-center gap-2 pt-4">
          {photos.slice(0, 3).map((photo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: currentStage === index % STAGES.length ? -4 : 0,
              }}
              transition={{ delay: index * 0.1 }}
              className="relative w-12 h-12 rounded-lg overflow-hidden ring-2 ring-primary/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt=""
                className="w-full h-full object-cover"
              />
              
              {/* Scanning line effect */}
              <motion.div
                animate={{
                  y: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
                className="absolute left-0 right-0 h-1/3 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
              />
            </motion.div>
          ))}
          {photos.length > 3 && (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">+{photos.length - 3}</span>
            </div>
          )}
        </div>

        {/* Subtle tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center text-xs text-muted-foreground/60"
        >
          This typically takes 10-15 seconds
        </motion.p>
      </div>
    </div>
  );
}

