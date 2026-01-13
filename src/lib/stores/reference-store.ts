/**
 * Reference Store
 *
 * Global state management for reference matching and comparison
 */

import { create } from 'zustand';
import type {
  WatchPhotoExtraction,
  MatchResult,
} from '@/types/watch-schema';

interface ReferenceStore {
  // Current analysis state
  currentAnalysis: WatchPhotoExtraction | null;
  matchResults: MatchResult[];
  selectedMatch: MatchResult | null;

  // Loading states
  isMatching: boolean;
  error: string | null;

  // Actions
  setCurrentAnalysis: (analysis: WatchPhotoExtraction | null) => void;
  findMatches: (analysis: WatchPhotoExtraction, sessionId?: string) => Promise<void>;
  selectMatch: (match: MatchResult | null) => void;
  clearResults: () => void;
}

export const useReferenceStore = create<ReferenceStore>((set, get) => ({
  // Initial state
  currentAnalysis: null,
  matchResults: [],
  selectedMatch: null,
  isMatching: false,
  error: null,

  // Set current analysis
  setCurrentAnalysis: (analysis) => {
    set({ currentAnalysis: analysis });
  },

  // Find matching references
  findMatches: async (analysis, sessionId) => {
    set({ isMatching: true, error: null, matchResults: [] });
    console.log('🔍 Starting reference match search...');

    try {
      const response = await fetch('/api/references/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis,
          sessionId: sessionId || `session_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Match API failed:', response.status, errorText);
        throw new Error('Failed to find matches');
      }

      const data = await response.json();
      console.log('✅ Match API response:', data);

      const matches = data.matches || [];
      console.log(`📊 Found ${matches.length} match(es)`);

      set({
        matchResults: matches,
        selectedMatch: matches[0] || null,
        isMatching: false,
      });
    } catch (error) {
      console.error('❌ Match error:', error);
      set({
        error: error instanceof Error ? error.message : 'Matching failed',
        isMatching: false,
        matchResults: [],
        selectedMatch: null,
      });
    }
  },

  // Select a specific match
  selectMatch: (match) => {
    set({ selectedMatch: match });
  },

  // Clear all results
  clearResults: () => {
    set({
      currentAnalysis: null,
      matchResults: [],
      selectedMatch: null,
      error: null,
    });
  },
}));
