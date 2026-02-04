# Condition Radar Chart Component

A luxury-styled radar chart component for visualizing watch condition assessments across 5 key physical components.

## Features

- **5-Axis Radar Chart**: Visualizes condition scores for Crystal, Case, Bezel, Dial, and Bracelet
- **Glass Morphism Design**: Matches the luxury aesthetic of the Watchfinder app
- **Champagne Gold Theme**: Uses #D4AF37 (champagne gold) color scheme
- **Smooth Animations**: Spring physics animations for chart load and component breakdown
- **Responsive Layout**: Adapts to mobile and desktop screen sizes
- **Condition Rating**: Automatically calculates average score with color-coded rating
- **Component Breakdown**: Shows individual scores with animated progress bars

## Props

```typescript
interface ConditionRadarChartProps {
  crystal: number;    // Crystal condition score (0-100)
  case: number;       // Case condition score (0-100)
  bezel: number;      // Bezel condition score (0-100)
  dial: number;       // Dial condition score (0-100)
  bracelet: number;   // Bracelet/strap condition score (0-100)
}
```

## Usage

```tsx
import { ConditionRadarChart } from '@/components/condition-radar-chart';

export default function WatchAuthenticationPage() {
  return (
    <div className="container mx-auto py-12">
      <ConditionRadarChart
        crystal={95}
        case={92}
        bezel={94}
        dial={96}
        bracelet={90}
      />
    </div>
  );
}
```

## Condition Rating Scale

The component automatically calculates an average score and assigns a rating:

- **Mint** (95-100): Pristine condition, like new
- **Excellent** (90-94): Minor signs of wear
- **Very Good** (80-89): Light wear, well maintained
- **Good** (70-79): Moderate wear, normal use
- **Fair** (60-69): Visible wear, may need service
- **Poor** (0-59): Heavy wear, restoration needed

## Styling

The component uses the luxury design system with:

- Glass morphism card wrapper (`.glass`)
- Champagne gold color (#D4AF37)
- Text gradient for score display (`.text-gradient`)
- Luxury divider (`.divider-luxury`)
- Custom OKLCH color values from design tokens
- Framer Motion spring animations

## Animations

- **Card entrance**: Fade in from bottom with ease-out-expo (600ms)
- **Chart appearance**: Scale and fade with spring easing (800ms, 200ms delay)
- **Component breakdown**: Staggered fade and slide (400ms each, 100ms delays)
- **Progress bars**: Width animation with ease-out-expo (800ms)

## Responsive Behavior

- **Mobile**: Single column component breakdown
- **Tablet+**: Two-column grid for component details
- **Chart height**: 300px on mobile, 350px on desktop

## Accessibility

- Semantic HTML structure
- Clear axis labels with readable font sizes
- Color-coded ratings with text labels
- Info note explaining the scoring system
- Keyboard accessible (via standard HTML elements)

## Dependencies

- `recharts` (^3.7.0) - For the radar chart visualization
- `framer-motion` (^12.23.26) - For smooth animations
- Tailwind CSS - For utility styling

## Design Philosophy

This component follows the Watchfinder luxury design system inspired by Swiss watch craftsmanship and Jony Ive's design principles:

1. **Reduction to essence** - Clean, uncluttered interface
2. **Quiet confidence** - Elegant without being flashy
3. **Tactile experience** - Smooth animations and transitions
4. **Natural feel** - Intuitive and inevitable design choices
5. **Generous spacing** - Room to breathe

## Color Reference

- **Primary Gold**: #D4AF37 (champagne gold)
- **Chart Fill**: #D4AF37 with 25% opacity
- **Grid**: oklch(0.88 0.010 75 / 0.3)
- **Labels**: oklch(0.20 0.010 65)
- **Muted Text**: oklch(0.48 0.015 70)

## File Location

`/Users/am/Desktop/Scripts/Watchfinder/src/components/condition-radar-chart.tsx`
