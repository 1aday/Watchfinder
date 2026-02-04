'use client';

import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

/**
 * Chart configuration constants
 */
const CHART_CONFIG = {
  colors: {
    gold: '#D4AF37',
    gridStroke: 'oklch(0.48 0.015 70)',
  },
  domain: [0, 100] as const,
  tickCount: 6,
  animationDuration: 1000,
} as const;

/**
 * Clamps a value between 0 and 100
 */
const clamp = (value: number) => Math.max(0, Math.min(100, value));

interface ConditionRadarChartProps {
  crystal: number;
  case: number;
  bezel: number;
  dial: number;
  bracelet: number;
}

/**
 * ConditionRadarChart displays a radar chart visualization of watch component conditions.
 *
 * @example
 * ```tsx
 * <ConditionRadarChart
 *   crystal={95}
 *   case={85}
 *   bezel={90}
 *   dial={88}
 *   bracelet={82}
 * />
 * ```
 *
 * @param props - Component properties containing condition scores for each watch component
 * @param props.crystal - Crystal condition score (0-100)
 * @param props.case - Case condition score (0-100)
 * @param props.bezel - Bezel condition score (0-100)
 * @param props.dial - Dial condition score (0-100)
 * @param props.bracelet - Bracelet condition score (0-100)
 * @returns A radar chart visualization component
 */
export function ConditionRadarChart({
  crystal,
  case: caseCondition,
  bezel,
  dial,
  bracelet,
}: ConditionRadarChartProps) {
  const data = [
    {
      component: 'Crystal',
      score: clamp(crystal),
      fullMark: 100,
    },
    {
      component: 'Case',
      score: clamp(caseCondition),
      fullMark: 100,
    },
    {
      component: 'Bezel',
      score: clamp(bezel),
      fullMark: 100,
    },
    {
      component: 'Dial',
      score: clamp(dial),
      fullMark: 100,
    },
    {
      component: 'Bracelet',
      score: clamp(bracelet),
      fullMark: 100,
    },
  ];

  return (
    <motion.div
      className="glass rounded-xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      role="img"
      aria-label={`Condition radar chart showing crystal at ${clamp(crystal)}%, case at ${clamp(caseCondition)}%, bezel at ${clamp(bezel)}%, dial at ${clamp(dial)}%, and bracelet at ${clamp(bracelet)}%`}
    >
      <div className="w-full h-[300px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid
              stroke="oklch(0.88 0.010 75 / 0.3)"
              strokeDasharray="3 3"
            />
            <PolarRadiusAxis
              angle={90}
              domain={CHART_CONFIG.domain}
              tick={{
                fill: CHART_CONFIG.colors.gridStroke,
                fontSize: 11,
                fontFamily: 'var(--font-sans)',
              }}
              tickCount={CHART_CONFIG.tickCount}
            />
            <PolarAngleAxis
              dataKey="component"
              tick={{
                fill: 'oklch(0.20 0.010 65)',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
            />
            <Radar
              name="Condition"
              dataKey="score"
              stroke={CHART_CONFIG.colors.gold}
              fill={CHART_CONFIG.colors.gold}
              fillOpacity={0.25}
              strokeWidth={2.5}
              animationDuration={CHART_CONFIG.animationDuration}
              animationEasing="ease-out"
              dot={{
                r: 5,
                fill: CHART_CONFIG.colors.gold,
                strokeWidth: 2,
                stroke: '#fff',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
