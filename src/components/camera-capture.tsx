"use client";

/*
 * Camera Capture — The Heart of the Experience
 * 
 * Design Philosophy:
 * This is the moment of truth. Every detail matters:
 * - The viewfinder should feel professional yet accessible
 * - Guides help without cluttering
 * - The capture moment should feel satisfying
 * - Transitions should be smooth and purposeful
 * 
 * Jony Ive would say: "The best interface is invisible.
 * It gets out of the way and lets you focus on your task."
 */

import { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloseIcon, FlipCameraIcon } from "./icons";
import { PhotoGuideMinimal, REQUIRED_ANGLES } from "./photo-guide";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  photoCount: number;
}

export function CameraCapture({ onCapture, onClose, photoCount }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // Current suggested angle
  const currentAngle = REQUIRED_ANGLES[Math.min(photoCount, REQUIRED_ANGLES.length - 1)];

  const startCamera = useCallback(async () => {
    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsReady(true);
        setError(null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please enable camera permissions.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsReady(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    setShowFlash(true);

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 100));

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Use actual video dimensions for quality
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // High quality JPEG
    const imageData = canvas.toDataURL("image/jpeg", 0.92);
    
    // Brief pause to let flash animation complete
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    setShowFlash(false);
    setIsCapturing(false);
    onCapture(imageData);
  }, [isCapturing, onCapture]);

  const switchCamera = useCallback(() => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Camera viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Capture flash effect */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Top safe area gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 safe-top">
          <div className="flex items-center justify-between px-4 pt-4">
            {/* Close button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
            >
              <CloseIcon size={20} className="text-white" />
            </motion.button>

            {/* Photo count indicator */}
            <PhotoGuideMinimal capturedCount={photoCount} />

            {/* Camera flip button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={switchCamera}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
            >
              <FlipCameraIcon size={20} className="text-white" />
            </motion.button>
          </div>
        </div>

        {/* Center alignment guide - watch-inspired circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Outer guide ring */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-72 h-72 rounded-full border-2 border-white/20"
            />
            
            {/* Inner focus ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute inset-4 rounded-full border border-white/10"
            />

            {/* Corner brackets for precision feel */}
            <div className="absolute inset-0">
              {/* Top left */}
              <div className="absolute top-0 left-0 w-8 h-8">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/70" />
                <div className="absolute top-0 left-0 w-0.5 h-full bg-primary/70" />
              </div>
              {/* Top right */}
              <div className="absolute top-0 right-0 w-8 h-8">
                <div className="absolute top-0 right-0 w-full h-0.5 bg-primary/70" />
                <div className="absolute top-0 right-0 w-0.5 h-full bg-primary/70" />
              </div>
              {/* Bottom left */}
              <div className="absolute bottom-0 left-0 w-8 h-8">
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/70" />
                <div className="absolute bottom-0 left-0 w-0.5 h-full bg-primary/70" />
              </div>
              {/* Bottom right */}
              <div className="absolute bottom-0 right-0 w-8 h-8">
                <div className="absolute bottom-0 right-0 w-full h-0.5 bg-primary/70" />
                <div className="absolute bottom-0 right-0 w-0.5 h-full bg-primary/70" />
              </div>
            </div>

            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-0.5 bg-primary/50" />
              <div className="w-0.5 h-4 bg-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Angle suggestion - bottom hint */}
        <motion.div 
          key={currentAngle?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-32 left-0 right-0 text-center pointer-events-none"
        >
          <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-sm font-medium">
            {currentAngle?.description || "Capture any angle"}
          </span>
        </motion.div>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-8 flex items-center justify-center"
            >
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 text-center max-w-sm">
                <p className="text-white/90 mb-4">{error}</p>
                <button
                  onClick={startCamera}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="bg-black px-6 pt-6 pb-8 safe-bottom">
        <div className="flex items-center justify-center gap-8">
          {/* Capture button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={capturePhoto}
            disabled={!isReady || isCapturing}
            className="relative group"
          >
            {/* Outer ring */}
            <div className={`
              w-20 h-20 rounded-full border-4 transition-all duration-200
              ${isReady 
                ? "border-white group-active:border-white/70" 
                : "border-white/30"
              }
            `}>
              {/* Inner button */}
              <motion.div
                animate={{
                  scale: isCapturing ? 0.85 : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`
                  absolute inset-1.5 rounded-full transition-colors duration-200
                  ${isReady 
                    ? "bg-white group-active:bg-white/90" 
                    : "bg-white/30"
                  }
                `}
              />
            </div>
            
            {/* Pulse animation when ready */}
            {isReady && !isCapturing && (
              <motion.div
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border-2 border-white"
              />
            )}
          </motion.button>
        </div>

        {/* Instruction text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/40 text-xs mt-4"
        >
          Tap to capture · {photoCount > 0 ? `${photoCount} photo${photoCount !== 1 ? 's' : ''} taken` : 'Position watch in frame'}
        </motion.p>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
