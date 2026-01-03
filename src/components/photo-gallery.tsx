"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

interface PhotoGalleryProps {
  photos: string[];
  onRemove: (index: number) => void;
  maxPhotos?: number;
}

export function PhotoGallery({ photos, onRemove, maxPhotos = 10 }: PhotoGalleryProps) {
  if (photos.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Photos ({photos.length}/{maxPhotos})
        </h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
          >
            <Image
              src={photo}
              alt={`Watch photo ${index + 1}`}
              fill
              className="object-cover"
            />
            
            {/* Delete overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => onRemove(index)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </Button>
            </div>

            {/* Photo number badge */}
            <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

