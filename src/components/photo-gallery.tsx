"use client";

/*
 * Photo Gallery — Visual Collection of Captured Moments
 * 
 * Design Philosophy:
 * Each photo is a piece of evidence. The gallery should:
 * - Make photos feel precious and organized
 * - Allow easy review and removal
 * - Provide satisfying interactions
 * - Scale gracefully from 1 to many photos
 */

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { TrashIcon, EyeIcon } from "./icons";

interface PhotoGalleryProps {
  photos: string[];
  onRemove: (index: number) => void;
  onReorder?: (photos: string[]) => void;
}

export function PhotoGallery({ photos, onRemove, onReorder }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      {/* Gallery grid */}
      <Reorder.Group
        axis="x"
        values={photos}
        onReorder={onReorder || (() => {})}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1"
      >
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => (
            <Reorder.Item
              key={photo}
              value={photo}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative flex-shrink-0 cursor-grab active:cursor-grabbing"
            >
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted group"
              >
                <Image
                  src={photo}
                  alt={`Watch photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />

                {/* Hover overlay */}
                <motion.div
                  initial={false}
                  animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1"
                >
                  {/* View button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(index);
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <EyeIcon size={14} className="text-white" />
                  </motion.button>

                  {/* Delete button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(index);
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-destructive/80 transition-colors"
                  >
                    <TrashIcon size={14} className="text-white" />
                  </motion.button>
                </motion.div>

                {/* Index badge */}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                  <span className="text-[10px] font-medium text-white/90">{index + 1}</span>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close hint */}
            <div className="absolute top-6 left-0 right-0 text-center">
              <span className="text-white/50 text-sm">Tap anywhere to close</span>
            </div>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-[90vw] max-h-[80vh] aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[selectedIndex]}
                alt={`Watch photo ${selectedIndex + 1}`}
                fill
                className="object-contain rounded-2xl"
                sizes="90vw"
              />
            </motion.div>

            {/* Navigation dots */}
            {photos.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(i);
                    }}
                    className={`
                      w-2 h-2 rounded-full transition-all duration-200
                      ${i === selectedIndex 
                        ? "bg-white w-4" 
                        : "bg-white/40 hover:bg-white/60"
                      }
                    `}
                  />
                ))}
              </div>
            )}

            {/* Delete from viewer */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(selectedIndex);
                if (selectedIndex >= photos.length - 1) {
                  setSelectedIndex(photos.length > 1 ? photos.length - 2 : null);
                }
              }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 hover:bg-destructive/80 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <TrashIcon size={16} />
              Remove Photo
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Compact inline preview
export function PhotoPreviewStrip({ photos, maxShow = 4 }: { photos: string[]; maxShow?: number }) {
  if (photos.length === 0) return null;

  const showCount = Math.min(photos.length, maxShow);
  const overflow = photos.length - maxShow;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-3">
        {photos.slice(0, showCount).map((photo, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative w-10 h-10 rounded-lg overflow-hidden ring-2 ring-background"
            style={{ zIndex: showCount - index }}
          >
            <Image
              src={photo}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="40px"
            />
          </motion.div>
        ))}
        
        {overflow > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative w-10 h-10 rounded-lg bg-muted ring-2 ring-background flex items-center justify-center"
          >
            <span className="text-xs font-medium text-muted-foreground">+{overflow}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
