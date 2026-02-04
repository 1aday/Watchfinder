'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useMemo } from 'react';

/**
 * Chart configuration constants
 */
const CHART_CONFIG = {
  colors: {
    gold: '#D4AF37',
    gridStroke: 'oklch(0.48 0.015 70)',
    axisStroke: 'oklch(0.88 0.010 75 / 0.3)',
    tooltipBg: 'oklch(0.99 0.006 75 / 0.95)',
    tooltipBorder: 'oklch(0.88 0.010 75)',
  },
  strokeWidth: 2.5,
  dotRadius: 4,
  animationDuration: 1000,
  curveType: 'monotone' as const,
} as const;

/**
 * Validates that data point has required properties
 */
const isValidDataPoint = (
  point: unknown
): point is { date: string; value: number } => {
  return (
    typeof point === 'object' &&
    point !== null &&
    'date' in point &&
    'value' in point &&
    typeof (point as { date: unknown }).date === 'string' &&
    typeof (point as { value: unknown }).value === 'number' &&
    !isNaN((point as { value: number }).value)
  );
};

/**
 * Formats currency value with proper thousands separators
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats date for display
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Custom tooltip component for the line chart
 */
const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="glass-subtle rounded-lg p-3 shadow-lg"
      style={{
        border: `1px solid ${CHART_CONFIG.colors.tooltipBorder}`,
      }}
    >
      <div className="text-xs font-medium mb-1" style={{ color: CHART_CONFIG.colors.gridStroke }}>
        {formatDate(data.date)}
      </div>
      <div className="text-lg font-bold" style={{ color: CHART_CONFIG.colors.gold }}>
        {formatCurrency(data.value)}
      </div>
    </motion.div>
  );
};

interface ValueTimelineChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  modelName?: string;
}

/**
 * ValueTimelineChart displays a line chart visualization of historical market values.
 *
 * The chart shows price trends over time with a champagne gold line, helping users
 * understand the investment potential and market trajectory of authenticated watches.
 *
 * Features:
 * - Smooth monotone curve interpolation
 * - Interactive hover tooltips with formatted values
 * - Responsive design that adapts to container size
 * - Glass morphism styling matching app aesthetic
 * - Handles edge cases (empty data, single data point)
 *
 * @example
 * ```tsx
 * <ValueTimelineChart
 *   data={[
 *     { date: "2020-01", value: 12500 },
 *     { date: "2021-01", value: 14200 },
 *     { date: "2022-01", value: 15800 },
 *   ]}
 *   modelName="Rolex Submariner 116610LN"
 * />
 * ```
 *
 * @param props - Component properties
 * @param props.data - Array of time series data points with date and value
 * @param props.modelName - Optional watch model name for context
 * @returns A line chart visualization component with historical market values
 */
export function ValueTimelineChart({ data, modelName }: ValueTimelineChartProps) {
  // Validate and filter data
  const validData = useMemo(() => {
    const filtered = data.filter(isValidDataPoint);

    // Warn in development if invalid data points were found
    if (process.env.NODE_ENV === 'development' && filtered.length !== data.length) {
      console.warn(
        `ValueTimelineChart: ${data.length - filtered.length} invalid data points were filtered out`
      );
    }

    return filtered;
  }, [data]);

  // Calculate statistics for accessibility label
  const stats = useMemo(() => {
    if (validData.length === 0) {
      return { min: 0, max: 0, latest: 0, trend: 'no data' };
    }

    const values = validData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];
    const first = values[0];
    const trend = latest > first ? 'increasing' : latest < first ? 'decreasing' : 'stable';

    return { min, max, latest, trend };
  }, [validData]);

  // Empty state
  if (validData.length === 0) {
    return (
      <motion.div
        className="glass rounded-xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        role="img"
        aria-label="No market value data available"
      >
        <div className="w-full h-[300px] md:h-[350px] flex items-center justify-center">
          <div className="text-center">
            <div
              className="text-sm font-medium uppercase tracking-wide mb-2"
              style={{ color: CHART_CONFIG.colors.gridStroke }}
            >
              No Data Available
            </div>
            <div className="text-xs" style={{ color: 'oklch(0.68 0.010 70)' }}>
              Market value history will appear here
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Single data point state
  if (validData.length === 1) {
    const singlePoint = validData[0];
    return (
      <motion.div
        className="glass rounded-xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        role="img"
        aria-label={`Single market value data point: ${formatCurrency(singlePoint.value)} on ${formatDate(singlePoint.date)}`}
      >
        <div className="w-full h-[300px] md:h-[350px] flex flex-col items-center justify-center">
          <div className="text-center">
            <div
              className="text-sm font-medium uppercase tracking-wide mb-3"
              style={{ color: CHART_CONFIG.colors.gridStroke }}
            >
              {formatDate(singlePoint.date)}
            </div>
            <motion.div
              className="text-5xl font-bold mb-2"
              style={{ color: CHART_CONFIG.colors.gold }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 10,
                delay: 0.3,
              }}
            >
              {formatCurrency(singlePoint.value)}
            </motion.div>
            {modelName && (
              <div className="text-xs mt-2" style={{ color: 'oklch(0.68 0.010 70)' }}>
                {modelName}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Full chart with multiple data points
  return (
    <motion.div
      className="glass rounded-xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      role="img"
      aria-label={`Market value timeline chart${modelName ? ` for ${modelName}` : ''} showing ${stats.trend} trend from ${formatCurrency(stats.min)} to ${formatCurrency(stats.max)}, currently at ${formatCurrency(stats.latest)}`}
    >
      {modelName && (
        <div className="mb-4">
          <h3
            className="text-sm font-medium uppercase tracking-wide"
            style={{ color: CHART_CONFIG.colors.gridStroke }}
          >
            {modelName}
          </h3>
        </div>
      )}

      <div className="w-full h-[300px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={validData}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_CONFIG.colors.axisStroke}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke={CHART_CONFIG.colors.gridStroke}
              tick={{
                fill: CHART_CONFIG.colors.gridStroke,
                fontSize: 11,
                fontFamily: 'var(--font-sans)',
              }}
              tickLine={{ stroke: CHART_CONFIG.colors.axisStroke }}
              axisLine={{ stroke: CHART_CONFIG.colors.axisStroke }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              stroke={CHART_CONFIG.colors.gridStroke}
              tick={{
                fill: CHART_CONFIG.colors.gridStroke,
                fontSize: 11,
                fontFamily: 'var(--font-sans)',
              }}
              tickLine={{ stroke: CHART_CONFIG.colors.axisStroke }}
              axisLine={{ stroke: CHART_CONFIG.colors.axisStroke }}
              width={80}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: CHART_CONFIG.colors.gold,
                strokeWidth: 1,
                strokeDasharray: '5 5',
                opacity: 0.3,
              }}
            />
            <Line
              type={CHART_CONFIG.curveType}
              dataKey="value"
              stroke={CHART_CONFIG.colors.gold}
              strokeWidth={CHART_CONFIG.strokeWidth}
              dot={{
                fill: CHART_CONFIG.colors.gold,
                strokeWidth: 2,
                r: CHART_CONFIG.dotRadius,
                stroke: '#fff',
              }}
              activeDot={{
                r: CHART_CONFIG.dotRadius + 2,
                fill: CHART_CONFIG.colors.gold,
                strokeWidth: 2,
                stroke: '#fff',
              }}
              animationDuration={CHART_CONFIG.animationDuration}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary statistics */}
      <motion.div
        className="mt-4 flex justify-between items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex-1 text-center">
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'oklch(0.68 0.010 70)' }}>
            Low
          </div>
          <div className="text-sm font-semibold" style={{ color: CHART_CONFIG.colors.gridStroke }}>
            {formatCurrency(stats.min)}
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'oklch(0.68 0.010 70)' }}>
            High
          </div>
          <div className="text-sm font-semibold" style={{ color: CHART_CONFIG.colors.gridStroke }}>
            {formatCurrency(stats.max)}
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'oklch(0.68 0.010 70)' }}>
            Latest
          </div>
          <div className="text-sm font-semibold" style={{ color: CHART_CONFIG.colors.gold }}>
            {formatCurrency(stats.latest)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
