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
import { cn } from "@/lib/utils";

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
  const [showGuidance, setShowGuidance] = useState(photoCount < 3);
  const [zoom, setZoom] = useState(1);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{x: number, y: number} | null>(null);

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

    // Show guidance for next photo if we're still in the first 3
    if (photoCount < 2) {
      setTimeout(() => setShowGuidance(true), 500);
    }
  }, [isCapturing, onCapture, photoCount]);

  const switchCamera = useCallback(() => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, [stopCamera]);

  const toggleTorch = useCallback(async () => {
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;

    if (capabilities.torch) {
      try {
        await track.applyConstraints({
          // @ts-ignore
          advanced: [{ torch: !torchEnabled }]
        });
        setTorchEnabled(!torchEnabled);

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(5);
        }
      } catch (err) {
        console.error('Torch error:', err);
      }
    }
  }, [stream, torchEnabled]);

  const handleTapToFocus = useCallback(async (e: React.TouchEvent | React.MouseEvent) => {
    if (!stream) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setFocusPoint({ x, y });

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;

    if (capabilities.focusMode) {
      try {
        await track.applyConstraints({
          // @ts-ignore
          advanced: [{ focusMode: 'single-shot' }]
        });
      } catch (err) {
        console.error('Focus error:', err);
      }
    }

    // Clear focus point after 2s
    setTimeout(() => setFocusPoint(null), 2000);
  }, [stream]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // Apply zoom to video track
  useEffect(() => {
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;

    if (capabilities.zoom) {
      track.applyConstraints({
        // @ts-ignore
        advanced: [{ zoom: zoom }]
      }).catch((err) => {
        console.error('Zoom error:', err);
      });
    }
  }, [zoom, stream]);

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
          onClick={handleTapToFocus}
          onTouchStart={handleTapToFocus}
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
            <div className="flex items-center gap-2">
              <PhotoGuideMinimal capturedCount={photoCount} />
              {!showGuidance && photoCount < 3 && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowGuidance(true)}
                  className="w-8 h-8 rounded-full bg-blue-500/20 backdrop-blur-md flex items-center justify-center border border-blue-500/30"
                  title="Show photo guide"
                >
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.button>
              )}
            </div>

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

        {/* Zoom slider (right side) */}
        <div className="absolute top-20 right-4 flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
            disabled={zoom >= 3}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </motion.button>

          <div className="h-24 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
            <div
              className="w-1 bg-white rounded-full transition-all"
              style={{ height: `${((zoom - 1) / 2) * 80}%` }}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
            disabled={zoom <= 1}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </motion.button>

          {/* Zoom level indicator */}
          <div className="text-center text-white/70 text-xs font-medium mt-1">
            {zoom.toFixed(1)}x
          </div>
        </div>

        {/* Torch toggle (top right, below camera flip) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTorch}
          className={cn(
            "absolute top-16 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors",
            torchEnabled
              ? "bg-yellow-500/30 border border-yellow-500/50"
              : "bg-white/10"
          )}
        >
          <svg
            className={cn("w-5 h-5 transition-colors", torchEnabled ? "text-yellow-300" : "text-white")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </motion.button>

        {/* Focus point indicator */}
        <AnimatePresence>
          {focusPoint && (
            <motion.div
              className="absolute w-20 h-20 border-2 border-yellow-400 rounded-full pointer-events-none"
              style={{ left: focusPoint.x - 40, top: focusPoint.y - 40 }}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-full bg-yellow-400/50" />
                <div className="w-full h-1 bg-yellow-400/50 absolute" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Enhanced Step-by-Step Guidance Overlay */}
        <AnimatePresence>
          {showGuidance && photoCount < 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-md border border-white/10 shadow-2xl">
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i < photoCount ? 'w-8 bg-blue-500' : 'w-6 bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Step number */}
                <div className="text-center mb-4">
                  <span className="inline-block px-4 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium">
                    Step {photoCount + 1} of 3
                  </span>
                </div>

                {/* Main instruction */}
                <h3 className="text-2xl font-bold text-white text-center mb-3">
                  {currentAngle?.label === "Dial" && "Capture the Dial"}
                  {currentAngle?.label === "Crown" && "Show the Crown Side"}
                  {currentAngle?.label === "Caseback" && "Photograph the Caseback"}
                </h3>

                <p className="text-white/70 text-center mb-6 leading-relaxed">
                  {currentAngle?.label === "Dial" && "Position your watch face-up with the dial clearly visible. Center it in the frame for best results."}
                  {currentAngle?.label === "Crown" && "Rotate your watch to show the crown and side profile. This helps identify the model."}
                  {currentAngle?.label === "Caseback" && "Flip your watch over to capture the caseback. Serial numbers and engravings are often here."}
                </p>

                {/* Visual tips */}
                <div className="bg-white/5 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-white/90 text-sm font-medium">Good lighting</p>
                      <p className="text-white/50 text-xs">Natural light works best</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-white/90 text-sm font-medium">Fill the frame</p>
                      <p className="text-white/50 text-xs">Get close for detail</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-white/90 text-sm font-medium">Stay steady</p>
                      <p className="text-white/50 text-xs">Avoid blurry shots</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowGuidance(false)}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/30"
                  >
                    {photoCount === 0 ? "Got it, let's go!" : "Continue Taking Photos"}
                  </button>

                  {photoCount >= 1 && (
                    <button
                      onClick={onClose}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Analyze with {photoCount} Photo{photoCount !== 1 ? 's' : ''}
                    </button>
                  )}

                  {photoCount === 0 && (
                    <button
                      onClick={onClose}
                      className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/10"
                    >
                      Skip Camera
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
        <div className="flex items-center justify-center gap-4">
          {/* Done button - appears after first photo */}
          <AnimatePresence>
            {photoCount >= 1 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full font-semibold shadow-lg shadow-green-500/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Done ({photoCount})
              </motion.button>
            )}
          </AnimatePresence>

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
          {photoCount === 0 && 'Position watch in frame and tap to capture'}
          {photoCount === 1 && 'Take more angles or tap Done to analyze'}
          {photoCount >= 2 && `${photoCount} photos captured · Tap Done when ready`}
        </motion.p>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
