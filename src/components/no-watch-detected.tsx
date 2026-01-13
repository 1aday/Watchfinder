"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface NoWatchDetectedProps {
  onRetry: () => void;
}

export function NoWatchDetected({ onRetry }: NoWatchDetectedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-8 text-center space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">No Watch Detected</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              The AI couldn't identify a watch in the uploaded images. Please make sure to upload clear photos of a wristwatch or timepiece.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={onRetry}>Try Again</Button>
            <Button variant="outline" asChild>
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <h4 className="font-semibold mb-3 text-sm">Tips for Best Results:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Ensure the entire watch is visible in the frame</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use good lighting without glare or shadows</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Take photos of the dial, case back, and side profile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Avoid blurry or out-of-focus images</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
