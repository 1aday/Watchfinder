/**
 * Test file for ValueTimelineChart component
 * Verify component renders with various data scenarios
 */

import { ValueTimelineChart } from './value-timeline-chart';

// Test case 1: Normal data with multiple points
const normalData = [
  { date: '2020-01', value: 12500 },
  { date: '2020-07', value: 13200 },
  { date: '2021-01', value: 14500 },
  { date: '2021-07', value: 15800 },
  { date: '2022-01', value: 16200 },
  { date: '2022-07', value: 17500 },
  { date: '2023-01', value: 18900 },
];

// Test case 2: Single data point
const singlePoint = [
  { date: '2023-01', value: 18900 },
];

// Test case 3: Empty data
const emptyData: Array<{ date: string; value: number }> = [];

// Test case 4: With model name
const withModelName = (
  <ValueTimelineChart
    data={normalData}
    modelName="Rolex Submariner 116610LN"
  />
);

// Test case 5: Increasing trend
const increasingTrend = [
  { date: '2020-01', value: 10000 },
  { date: '2021-01', value: 12000 },
  { date: '2022-01', value: 15000 },
  { date: '2023-01', value: 18000 },
];

// Test case 6: Decreasing trend
const decreasingTrend = [
  { date: '2020-01', value: 20000 },
  { date: '2021-01', value: 18000 },
  { date: '2022-01', value: 15000 },
  { date: '2023-01', value: 12000 },
];

// Test case 7: Volatile market
const volatileMarket = [
  { date: '2020-01', value: 15000 },
  { date: '2020-06', value: 18000 },
  { date: '2021-01', value: 14000 },
  { date: '2021-06', value: 17000 },
  { date: '2022-01', value: 13500 },
  { date: '2022-06', value: 19000 },
];

export function ValueTimelineChartTests() {
  return (
    <div className="p-8 space-y-8 bg-background">
      <section>
        <h2 className="text-2xl font-bold mb-4">Normal Data (Multiple Points)</h2>
        <ValueTimelineChart data={normalData} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">With Model Name</h2>
        <ValueTimelineChart
          data={normalData}
          modelName="Rolex Submariner 116610LN"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Single Data Point</h2>
        <ValueTimelineChart data={singlePoint} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Empty Data</h2>
        <ValueTimelineChart data={emptyData} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Increasing Trend</h2>
        <ValueTimelineChart
          data={increasingTrend}
          modelName="Patek Philippe Nautilus 5711"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Decreasing Trend</h2>
        <ValueTimelineChart
          data={decreasingTrend}
          modelName="Omega Seamaster"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Volatile Market</h2>
        <ValueTimelineChart
          data={volatileMarket}
          modelName="Audemars Piguet Royal Oak"
        />
      </section>
    </div>
  );
}

export default ValueTimelineChartTests;
