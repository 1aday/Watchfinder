/**
 * Admin Store
 *
 * Global state management for admin reference library management
 */

import { create } from 'zustand';
import type { ReferenceWatchWithStats } from '@/types/watch-schema';

interface AdminStore {
  // References data
  references: ReferenceWatchWithStats[];
  isLoading: boolean;
  error: string | null;

  // Filters and pagination
  filters: {
    brand?: string;
    model?: string;
    status?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };

  // Actions
  loadReferences: () => Promise<void>;
  setFilters: (filters: Partial<AdminStore['filters']>) => void;
  setPage: (page: number) => void;
  deleteReference: (id: string) => Promise<void>;
  refreshReferences: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  references: [],
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 0,
  },

  // Load references with current filters and pagination
  loadReferences: async () => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.brand) params.append('brand', filters.brand);
      if (filters.model) params.append('model', filters.model);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/references?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to load references');
      }

      const { data, pagination: paginationData } = await response.json();

      set({
        references: data || [],
        pagination: paginationData,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load references',
        isLoading: false,
      });
    }
  },

  // Update filters and reload
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }, // Reset to page 1 on filter change
    }));
    get().loadReferences();
  },

  // Change page
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().loadReferences();
  },

  // Delete a reference
  deleteReference: async (id) => {
    try {
      const response = await fetch(`/api/references/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reference');
      }

      // Reload references after delete
      await get().loadReferences();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete reference',
      });
      throw error;
    }
  },

  // Refresh/reload references
  refreshReferences: async () => {
    await get().loadReferences();
  },
}));
