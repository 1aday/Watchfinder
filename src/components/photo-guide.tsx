"use client";

/*
 * Photo Guide Component
 * 
 * Design Philosophy (Pixar's "Plus"):
 * Instead of just showing what photos to take, we make it an 
 * engaging checklist that celebrates progress. Each completed
 * photo feels like an achievement.
 * 
 * The visual design mimics a watch dial's hour markers,
 * creating subconscious brand coherence.
 */

import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon } from "./icons";

export interface PhotoAngle {
  id: string;
  label: string;
  description: string;
  priority: "essential" | "recommended" | "optional";
  captured: boolean;
}

export const REQUIRED_ANGLES: Omit<PhotoAngle, "captured">[] = [
  {
    id: "dial_front",
    label: "Dial",
    description: "Straight-on view of the dial",
    priority: "essential",
  },
  {
    id: "crown_side",
    label: "Crown",
    description: "Side view showing crown",
    priority: "essential",
  },
  {
    id: "caseback",
    label: "Caseback",
    description: "Back of the watch",
    priority: "essential",
  },
  {
    id: "bezel",
    label: "Bezel",
    description: "Bezel markings closeup",
    priority: "recommended",
  },
  {
    id: "serial",
    label: "Serial",
    description: "Serial number if visible",
    priority: "recommended",
  },
  {
    id: "bracelet",
    label: "Bracelet",
    description: "Bracelet or strap detail",
    priority: "optional",
  },
];

interface PhotoGuideProps {
  capturedCount: number;
  totalCount?: number;
  compact?: boolean;
}

export function PhotoGuide({ 
  capturedCount, 
  totalCount = REQUIRED_ANGLES.length,
  compact = false 
}: PhotoGuideProps) {
  const progress = Math.min(capturedCount / 3, 1); // 3 is minimum for good analysis
  
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Progress ring - watch dial inspired */}
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            {/* Background ring */}
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted/30"
            />
            {/* Progress ring */}
            <motion.circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary"
              initial={{ strokeDasharray: "0 100" }}
              animate={{ 
                strokeDasharray: `${progress * 100} ${100 - progress * 100}` 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                strokeDashoffset: 0,
              }}
            />
          </svg>
          {/* Center count */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{capturedCount}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {capturedCount === 0 && "Add photos"}
            {capturedCount > 0 && capturedCount < 3 && `${3 - capturedCount} more needed`}
            {capturedCount >= 3 && "Ready to analyze"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {capturedCount >= 3 
              ? "Good coverage for analysis" 
              : "Dial, crown, caseback minimum"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Photo Checklist</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            More angles = better analysis
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-muted-foreground">{capturedCount}</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-mono text-muted-foreground">{totalCount}</span>
        </div>
      </div>

      {/* Visual progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(capturedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Angle grid - watch dial inspired layout */}
      <div className="grid grid-cols-3 gap-2">
        {REQUIRED_ANGLES.map((angle, index) => {
          const isCaptured = index < capturedCount;
          const isNext = index === capturedCount;
          
          return (
            <motion.div
              key={angle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative p-3 rounded-xl text-center transition-all duration-300
                ${isCaptured 
                  ? "bg-primary/10 border border-primary/20" 
                  : isNext
                    ? "bg-muted/50 border border-primary/30 ring-1 ring-primary/20"
                    : "bg-muted/30 border border-transparent"
                }
              `}
            >
              {/* Priority indicator */}
              <div className={`
                absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full
                ${angle.priority === "essential" ? "bg-primary" : ""}
                ${angle.priority === "recommended" ? "bg-primary/50" : ""}
                ${angle.priority === "optional" ? "bg-muted-foreground/30" : ""}
              `} />
              
              {/* Check mark for captured */}
              <AnimatePresence>
                {isCaptured && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <CheckIcon size={12} className="text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Label */}
              <span className={`
                text-xs font-medium block
                ${isCaptured ? "text-primary" : "text-muted-foreground"}
              `}>
                {angle.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Hint for next photo */}
      {capturedCount < REQUIRED_ANGLES.length && (
        <motion.p 
          key={capturedCount}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-center text-muted-foreground"
        >
          Next: {REQUIRED_ANGLES[capturedCount]?.description}
        </motion.p>
      )}
    </div>
  );
}

// Minimal inline version for camera overlay
export function PhotoGuideMinimal({ capturedCount }: { capturedCount: number }) {
  const essentialCaptured = Math.min(capturedCount, 3);
  
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            scale: i < essentialCaptured ? 1 : 0.85,
            opacity: i < essentialCaptured ? 1 : 0.4,
          }}
          className={`
            w-2 h-2 rounded-full transition-colors duration-300
            ${i < essentialCaptured ? "bg-primary" : "bg-white/40"}
          `}
        />
      ))}
      {capturedCount > 3 && (
        <span className="text-xs text-white/70 ml-1">+{capturedCount - 3}</span>
      )}
    </div>
  );
}

