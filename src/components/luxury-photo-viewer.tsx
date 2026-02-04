'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { ZoomInIcon, ZoomOutIcon } from './icons';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface LuxuryPhotoViewerProps {
  photos: string[];
  showMagnifier?: boolean;
  enableAnnotations?: boolean;
  comparisonPhoto?: string;
}

export function LuxuryPhotoViewer({
  photos,
  showMagnifier = true,
  comparisonPhoto
}: LuxuryPhotoViewerProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));

  // Magnifier positioning
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [showMagnifierGlass, setShowMagnifierGlass] = useState(false);

  return (
    <div className="relative w-full h-full bg-muted/5 rounded-lg overflow-hidden">
      {/* Main photo with zoom/pan */}
      <motion.div
        className="relative w-full h-full cursor-move"
        drag={zoomLevel > 1}
        dragElastic={0.1}
        dragMomentum={false}
        style={{ scale: zoomLevel, x, y }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseMove={(e) => {
          if (showMagnifier && zoomLevel === 1) {
            const rect = e.currentTarget.getBoundingClientRect();
            setMagnifierPos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
          }
        }}
        onMouseEnter={() => setShowMagnifierGlass(true)}
        onMouseLeave={() => setShowMagnifierGlass(false)}
      >
        <img
          src={photos[currentPhoto]}
          alt={`Watch photo ${currentPhoto + 1}`}
          className="w-full h-full object-contain"
          draggable={false}
        />

        {/* Magnifying glass overlay */}
        {showMagnifier && showMagnifierGlass && zoomLevel === 1 && (
          <motion.div
            className="absolute w-32 h-32 rounded-full border-4 border-primary pointer-events-none overflow-hidden"
            style={{
              left: magnifierPos.x - 64,
              top: magnifierPos.y - 64,
              backgroundImage: `url(${photos[currentPhoto]})`,
              backgroundSize: '400% 400%',
              backgroundPosition: `${magnifierPos.x * 4}px ${magnifierPos.y * 4}px`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          />
        )}
      </motion.div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="glass"
          size="icon"
          onClick={zoomOut}
          disabled={zoomLevel <= 1}
        >
          <ZoomOutIcon />
        </Button>
        <div className="glass px-3 py-1 rounded-md text-sm font-medium">
          {Math.round(zoomLevel * 100)}%
        </div>
        <Button
          variant="glass"
          size="icon"
          onClick={zoomIn}
          disabled={zoomLevel >= 4}
        >
          <ZoomInIcon />
        </Button>
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setCurrentPhoto(i)}
            className={cn(
              "w-16 h-16 rounded-md overflow-hidden",
              "border-2 transition-all duration-200",
              currentPhoto === i
                ? "border-primary ring-2 ring-primary/30 scale-110"
                : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
            )}
          >
            <img src={photo} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
