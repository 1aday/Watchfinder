'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

/**
 * Gauge configuration constants
 */
const GAUGE_CONFIG = {
  colors: {
    red: 'oklch(0.48 0.15 25)',
    yellow: 'oklch(0.72 0.12 70)',
    gold: 'oklch(0.72 0.11 85)',
    stroke: 'oklch(0.88 0.010 75 / 0.3)',
    highlight: '#fff',
  },
  thresholds: {
    low: 50,
    medium: 75,
  },
  arcWidth: 20,
  radius: 100,
  startAngle: -150,
  endAngle: 150,
  needleLength: 85,
  animationDuration: 1.5,
} as const;

/**
 * Clamps a value between 0 and 100
 */
const clamp = (value: number) => Math.max(0, Math.min(100, value));

/**
 * Converts degrees to radians
 */
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Converts score (0-100) to angle in degrees
 */
const scoreToAngle = (score: number) => {
  const { startAngle, endAngle } = GAUGE_CONFIG;
  const range = endAngle - startAngle;
  return startAngle + (score / 100) * range;
};

/**
 * Calculates the needle tip position
 */
const calculateNeedlePosition = (angle: number, length: number) => {
  const radians = toRadians(angle);
  return {
    x: Math.cos(radians) * length,
    y: Math.sin(radians) * length,
  };
};

/**
 * Generates SVG arc path
 */
const describeArc = (
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = {
    x: Math.cos(toRadians(endAngle)) * radius,
    y: Math.sin(toRadians(endAngle)) * radius,
  };
  const end = {
    x: Math.cos(toRadians(startAngle)) * radius,
    y: Math.sin(toRadians(startAngle)) * radius,
  };
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

/**
 * Gets color based on score thresholds
 */
const getScoreColor = (score: number): string => {
  const { colors, thresholds } = GAUGE_CONFIG;
  if (score < thresholds.low) return colors.red;
  if (score < thresholds.medium) return colors.yellow;
  return colors.gold;
};

/**
 * Gets confidence label based on score
 */
const getConfidenceLabel = (score: number): string => {
  const { thresholds } = GAUGE_CONFIG;
  if (score < thresholds.low) return 'Low Confidence';
  if (score < thresholds.medium) return 'Medium Confidence';
  return 'High Confidence';
};

interface AuthenticityGaugeProps {
  score: number;
}

/**
 * AuthenticityGauge displays an arc gauge visualization of authenticity confidence.
 *
 * The gauge uses a semi-circular arc divided into three color zones:
 * - Red (0-50): Low confidence
 * - Yellow (50-75): Medium confidence
 * - Gold (75-100): High confidence
 *
 * An animated needle points to the current score, with smooth spring physics
 * animation on mount.
 *
 * @example
 * ```tsx
 * <AuthenticityGauge score={85} />
 * ```
 *
 * @param props - Component properties
 * @param props.score - Authenticity confidence score (0-100)
 * @returns An animated arc gauge visualization component
 */
export function AuthenticityGauge({ score }: AuthenticityGaugeProps) {
  const clampedScore = clamp(score);

  // Warn in development if score is out of valid range
  if (process.env.NODE_ENV === 'development' && (score < 0 || score > 100)) {
    console.warn(`AuthenticityGauge: score ${score} is outside valid range [0-100], clamping to ${clampedScore}`);
  }

  const angle = scoreToAngle(clampedScore);
  const scoreColor = getScoreColor(clampedScore);
  const confidenceLabel = getConfidenceLabel(clampedScore);

  const { redArc, yellowArc, goldArc } = useMemo(() => {
    const { radius, arcWidth, startAngle, thresholds } = GAUGE_CONFIG;
    const innerRadius = radius - arcWidth;

    const lowEnd = scoreToAngle(thresholds.low);
    const mediumEnd = scoreToAngle(thresholds.medium);

    return {
      redArc: {
        outer: describeArc(radius, startAngle, lowEnd),
        inner: describeArc(innerRadius, lowEnd, startAngle),
      },
      yellowArc: {
        outer: describeArc(radius, lowEnd, mediumEnd),
        inner: describeArc(innerRadius, mediumEnd, lowEnd),
      },
      goldArc: {
        outer: describeArc(radius, mediumEnd, GAUGE_CONFIG.endAngle),
        inner: describeArc(innerRadius, GAUGE_CONFIG.endAngle, mediumEnd),
      },
    };
  }, []);

  return (
    <motion.div
      className="glass rounded-xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      role="img"
      aria-label={`Authenticity gauge showing ${clampedScore}% confidence - ${confidenceLabel}`}
    >
      <div className="w-full flex flex-col items-center">
        {/* SVG Gauge */}
        <div className="relative w-full max-w-[280px] aspect-square">
          <svg
            viewBox="-120 -120 240 140"
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* Color zones */}
            <g>
              {/* Red zone (0-50) */}
              <path
                d={`${redArc.outer} L ${redArc.inner.split('M ')[1]} Z`}
                fill={GAUGE_CONFIG.colors.red}
                opacity={0.25}
              />
              <path
                d={redArc.outer}
                fill="none"
                stroke={GAUGE_CONFIG.colors.red}
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Yellow zone (50-75) */}
              <path
                d={`${yellowArc.outer} L ${yellowArc.inner.split('M ')[1]} Z`}
                fill={GAUGE_CONFIG.colors.yellow}
                opacity={0.25}
              />
              <path
                d={yellowArc.outer}
                fill="none"
                stroke={GAUGE_CONFIG.colors.yellow}
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Gold zone (75-100) */}
              <path
                d={`${goldArc.outer} L ${goldArc.inner.split('M ')[1]} Z`}
                fill={GAUGE_CONFIG.colors.gold}
                opacity={0.25}
              />
              <path
                d={goldArc.outer}
                fill="none"
                stroke={GAUGE_CONFIG.colors.gold}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const tickAngle = scoreToAngle(tick);
              const tickRadians = toRadians(tickAngle);
              const outerPoint = {
                x: Math.cos(tickRadians) * (GAUGE_CONFIG.radius + 5),
                y: Math.sin(tickRadians) * (GAUGE_CONFIG.radius + 5),
              };
              const innerPoint = {
                x: Math.cos(tickRadians) * (GAUGE_CONFIG.radius - 5),
                y: Math.sin(tickRadians) * (GAUGE_CONFIG.radius - 5),
              };

              return (
                <line
                  key={tick}
                  x1={innerPoint.x}
                  y1={innerPoint.y}
                  x2={outerPoint.x}
                  y2={outerPoint.y}
                  stroke={GAUGE_CONFIG.colors.stroke}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Center pivot */}
            <circle cx="0" cy="0" r="5" fill={scoreColor} opacity={0.3} />
            <circle cx="0" cy="0" r="3" fill={scoreColor} />

            {/* Animated needle */}
            <motion.g
              initial={{ rotate: GAUGE_CONFIG.startAngle }}
              animate={{ rotate: angle }}
              transition={{
                type: 'spring',
                stiffness: 60,
                damping: 15,
                duration: GAUGE_CONFIG.animationDuration,
              }}
              style={{ originX: '0px', originY: '0px' }}
            >
              {/* Needle shadow */}
              <line
                x1="0"
                y1="0"
                x2={GAUGE_CONFIG.needleLength}
                y2="0"
                stroke="oklch(0 0 0 / 0.2)"
                strokeWidth="3"
                strokeLinecap="round"
                transform="translate(1, 1)"
              />
              {/* Needle */}
              <line
                x1="0"
                y1="0"
                x2={GAUGE_CONFIG.needleLength}
                y2="0"
                stroke={scoreColor}
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Needle tip highlight */}
              <circle
                cx={GAUGE_CONFIG.needleLength}
                cy="0"
                r="4"
                fill={scoreColor}
              />
              <circle
                cx={GAUGE_CONFIG.needleLength}
                cy="0"
                r="2.5"
                fill={GAUGE_CONFIG.colors.highlight}
                opacity={0.8}
              />
            </motion.g>
          </svg>
        </div>

        {/* Score display */}
        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            className="text-5xl font-bold mb-2"
            style={{ color: scoreColor }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 10,
              delay: 0.8,
            }}
          >
            {Math.round(clampedScore)}%
          </motion.div>
          <div
            className="text-sm font-medium uppercase tracking-wide"
            style={{
              color: 'oklch(0.48 0.015 70)',
            }}
          >
            {confidenceLabel}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
