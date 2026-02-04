/**
 * Condition Radar Chart - Usage Example
 *
 * This file demonstrates how to use the ConditionRadarChart component
 * in your application.
 */

import { ConditionRadarChart } from './condition-radar-chart';

export function ConditionRadarChartExample() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Example 1: Excellent condition watch */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Excellent Condition</h2>
        <ConditionRadarChart
          crystal={95}
          case={92}
          bezel={94}
          dial={96}
          bracelet={90}
        />
      </div>

      {/* Example 2: Good condition watch with some wear */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Good Condition</h2>
        <ConditionRadarChart
          crystal={85}
          case={78}
          bezel={82}
          dial={88}
          bracelet={75}
        />
      </div>

      {/* Example 3: Fair condition watch */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Fair Condition</h2>
        <ConditionRadarChart
          crystal={70}
          case={65}
          bezel={68}
          dial={75}
          bracelet={60}
        />
      </div>
    </div>
  );
}

/**
 * Usage in a page:
 *
 * import { ConditionRadarChart } from '@/components/condition-radar-chart';
 *
 * export default function WatchDetailsPage() {
 *   // Get condition data from your API/database
 *   const conditionData = {
 *     crystal: 92,
 *     case: 88,
 *     bezel: 90,
 *     dial: 95,
 *     bracelet: 85,
 *   };
 *
 *   return (
 *     <div className="container mx-auto py-12">
 *       <ConditionRadarChart {...conditionData} />
 *     </div>
 *   );
 * }
 */
