'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ComparisonSliderProps {
  userPhoto: string;
  referencePhoto: string;
}

export function ComparisonSlider({ userPhoto, referencePhoto }: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Reference photo (background) */}
      <div className="absolute inset-0">
        <img src={referencePhoto} alt="Reference" className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 glass px-2 py-1 rounded text-xs font-medium">
          Reference
        </div>
      </div>

      {/* User photo (foreground, clipped) */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 glass px-2 py-1 rounded text-xs font-medium">
          Your Photo
        </div>
      </motion.div>

      {/* Slider handle */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: typeof window !== 'undefined' ? window.innerWidth : 800 }}
        dragElastic={0}
        onDrag={(e, info) => {
          const target = e.currentTarget as HTMLElement | null;
          if (!target || !target.parentElement) return;

          const rect = target.parentElement.getBoundingClientRect();
          const newPosition = ((info.point.x - rect.left) / rect.width) * 100;
          setSliderPosition(Math.max(0, Math.min(100, newPosition)));
        }}
        className="absolute inset-y-0 w-1 bg-primary cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-primary-foreground rounded" />
            <div className="w-0.5 h-4 bg-primary-foreground rounded" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
