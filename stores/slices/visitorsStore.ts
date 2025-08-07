/**
 * Visitors Store - Zustand implementation for visitor management with REST API integration
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { VisitorsService, VisitorResult } from '@/services/visitors.service.rest';
import { useApiError } from '@/hooks/useApiError';
import { BaseStore } from '../types';
import {
  Visitor,
  VisitorCreateRequest,
  VisitorListQuery,
  VisitorCheckInRequest,
  VisitorCheckOutRequest,
  VisitorApprovalRequest,
  VisitorRejectionRequest,
  VisitorStats,
} from '@/types/api';

// Visitor filter options
export type VisitorFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'expired';
export type VisitorSortOption = 'createdAt' | 'name' | 'checkInTime' | 'expectedDuration';

// State interface
interface VisitorsState extends BaseStore {
  // Visitor lists
  visitors: Visitor[];
  todayVisitors: Visitor[];
  pendingVisitors: Visitor[];
  activeVisitors: Visitor[];
  
  // Selected visitor
  selectedVisitor: Visitor | null;
  
  // Statistics
  visitorStats: VisitorStats | null;
  
  // UI state
  currentFilter: VisitorFilter;
  currentSort: VisitorSortOption;
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalVisitors: number;
  pageSize: number;
  
  // Loading states for different operations
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  isLoadingStats: boolean;
}

// Actions interface
interface VisitorsActions {
  // CRUD operations
  fetchVisitors: (query?: VisitorListQuery) => Promise<void>;
  fetchVisitor: (id: string) => Promise<void>;
  createVisitor: (visitorData: VisitorCreateRequest) => Promise<VisitorResult>;
  updateVisitor: (id: string, visitorData: Partial<VisitorCreateRequest>) => Promise<VisitorResult>;
  deleteVisitor: (id: string) => Promise<VisitorResult>;
  
  // Visitor operations
  checkInVisitor: (id: string, checkInData?: VisitorCheckInRequest) => Promise<VisitorResult>;
  checkOutVisitor: (id: string, checkOutData?: VisitorCheckOutRequest) => Promise<VisitorResult>;
  approveVisitor: (id: string, approvalData: VisitorApprovalRequest) => Promise<VisitorResult>;
  rejectVisitor: (id: string, rejectionData: VisitorRejectionRequest) => Promise<VisitorResult>;
  generateQRCode: (id: string) => Promise<VisitorResult>;
  
  // Specialized fetching
  fetchTodayVisitors: () => Promise<void>;
  fetchPendingVisitors: () => Promise<void>;
  fetchActiveVisitors: () => Promise<void>;
  fetchVisitorStats: (dateRange?: { startDate: string; endDate: string }) => Promise<void>;
  
  // Search and filter
  searchVisitors: (query: string) => Promise<void>;
  setFilter: (filter: VisitorFilter) => void;
  setSort: (sort: VisitorSortOption, order?: 'asc' | 'desc') => void;
  clearSearch: () => void;
  
  // UI state management
  setSelectedVisitor: (visitor: Visitor | null) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Utility methods
  refreshData: () => Promise<void>;
  clearVisitorData: () => void;
  getVisitorById: (id: string) => Visitor | null;
  getVisitorsByStatus: (status: string) => Visitor[];
}

type VisitorsStore = VisitorsState & VisitorsActions;

// Initial state
const initialState: VisitorsState = {
  visitors: [],
  todayVisitors: [],
  pendingVisitors: [],
  activeVisitors: [],
  selectedVisitor: null,
  visitorStats: null,
  currentFilter: 'all',
  currentSort: 'createdAt',
  sortOrder: 'desc',
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  totalVisitors: 0,
  pageSize: 20,
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isCheckingIn: false,
  isCheckingOut: false,
  isApproving: false,
  isRejecting: false,
  isLoadingStats: false,
  setLoading: function (loading: boolean): void {
    throw new Error('Function not implemented.');
  },
  setError: function (error: string | null): void {
    throw new Error('Function not implemented.');
  },
  reset: function (): void {
    throw new Error('Function not implemented.');
  },
};

/**
 * Visitors Store - Zustand store for visitor management
 */
export const useVisitorsStore = create<VisitorsStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // CRUD operations
      fetchVisitors: async (query?: VisitorListQuery) => {
        try {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          const currentQuery = {
            page: get().currentPage,
            limit: get().pageSize,
            sortBy: get().currentSort,
            sortOrder: get().sortOrder,
            ...query,
          };

          // Apply current filter if no specific query
          if (!query && get().currentFilter !== 'all') {
            currentQuery.status = get().currentFilter as any;
          }

          // Apply search query if exists
          if (!query?.search && get().searchQuery) {
            currentQuery.search = get().searchQuery;
          }

          const result = await VisitorsService.getVisitors(currentQuery);

          if (result.success) {
            set((state) => {
              state.visitors = result.data || [];
              state.loading = false;
              // Update pagination info if available
              if (result.data?.pagination) {
                state.currentPage = result.data.pagination.currentPage;
                state.totalPages = result.data.pagination.totalPages;
                state.totalVisitors = result.data.pagination.totalItems;
              }
            });
          } else {
            set((state) => {
              state.loading = false;
              state.error = result.error || 'Failed to fetch visitors';
            });
          }
        } catch (error: any) {
          console.error('❌ Failed to fetch visitors:', error);
          set((state) => {
            state.loading = false;
            state.error = error.message || 'Failed to fetch visitors';
          });
        }
      },

      fetchVisitor: async (id: string) => {
        try {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          const result = await VisitorsService.getVisitor(id);

          if (result.success) {
            set((state) => {
              state.selectedVisitor = result.data;
              state.loading = false;
            });
          } else {
            set((state) => {
              state.loading = false;
              state.error = result.error || 'Failed to fetch visitor';
            });
          }
        } catch (error: any) {
          console.error('❌ Failed to fetch visitor:', error);
          set((state) => {
            state.loading = false;
            state.error = error.message || 'Failed to fetch visitor';
          });
        }
      },

      createVisitor: async (visitorData: VisitorCreateRequest) => {
        try {
          set((state) => {
            state.isCreating = true;
            state.error = null;
          });

          const result = await VisitorsService.createVisitor(visitorData);

          if (result.success) {
            set((state) => {
              // Add new visitor to the list
              state.visitors = [result.data, ...state.visitors];
              state.totalVisitors += 1;
              state.isCreating = false;
              
              // Update today's visitors if applicable
              const today = new Date().toISOString().split('T')[0];
              const visitorDate = new Date(result.data.createdAt).toISOString().split('T')[0];
              if (visitorDate === today) {
                state.todayVisitors = [result.data, ...state.todayVisitors];
              }
              
              // Update pending visitors if status is pending
              if (result.data.status === 'pending') {
                state.pendingVisitors = [result.data, ...state.pendingVisitors];
              }
            });
          } else {
            set((state) => {
              state.isCreating = false;
              state.error = result.error || 'Failed to create visitor';
            });
          }

          return result;
        } catch (error: any) {
          console.error('❌ Failed to create visitor:', error);
          set((state) => {
            state.isCreating = false;
            state.error = error.message || 'Failed to create visitor';
          });
          return { success: false, error: error.message || 'Failed to create visitor' };
        }
      },

      updateVisitor: async (id: string, visitorData: Partial<VisitorCreateRequest>) => {
        try {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });

          const result = await VisitorsService.updateVisitor(id, visitorData);

          if (result.success) {
            set((state) => {
              // Update visitor in all relevant lists
              const updateVisitorInList = (list: Visitor[]) => {
                const index = list.findIndex(v => v.id === id);
                if (index !== -1) {
                  list[index] = { ...list[index], ...result.data };
                }
              };

              updateVisitorInList(state.visitors);
              updateVisitorInList(state.todayVisitors);
              updateVisitorInList(state.pendingVisitors);
              updateVisitorInList(state.activeVisitors);

              // Update selected visitor if it's the one being updated
              if (state.selectedVisitor?.id === id) {
                state.selectedVisitor = { ...state.selectedVisitor, ...result.data };
              }

              state.isUpdating = false;
            });
          } else {
            set((state) => {
              state.isUpdating = false;
              state.error = result.error || 'Failed to update visitor';
            });
          }

          return result;
        } catch (error: any) {
          console.error('❌ Failed to update visitor:', error);
          set((state) => {
            state.isUpdating = false;
            state.error = error.message || 'Failed to update visitor';
          });
          return { success: false, error: error.message || 'Failed to update visitor' };
        }
      },

      deleteVisitor: async (id: string) => {
        try {
          set((state) => {
            state.isDeleting = true;
            state.error = null;
          });

          const result = await VisitorsService.deleteVisitor(id);

          if (result.success) {
            set((state) => {
              // Remove visitor from all lists
              state.visitors = state.visitors.filter(v => v.id !== id);
              state.todayVisitors = state.todayVisitors.filter(v => v.id !== id);
              state.pendingVisitors = state.pendingVisitors.filter(v => v.id !== id);
              state.activeVisitors = state.activeVisitors.filter(v => v.id !== id);
              state.totalVisitors = Math.max(0, state.totalVisitors - 1);

              // Clear selected visitor if it's the one being deleted
              if (state.selectedVisitor?.id === id) {
                state.selectedVisitor = null;
              }

              state.isDeleting = false;
            });
          } else {
            set((state) => {
              state.isDeleting = false;
              state.error = result.error || 'Failed to delete visitor';
            });
          }

          return result;
        } catch (error: any) {
          console.error('❌ Failed to delete visitor:', error);
          set((state) => {
            state.isDeleting = false;
            state.error = error.message || 'Failed to delete visitor';
          });
          return { success: false, error: error.message || 'Failed to delete visitor' };
        }
      },

      // Visitor operations
      checkInVisitor: async (id: string, checkInData?: VisitorCheckInRequest) => {
        try {
          set((state) => {
            state.isCheckingIn = true;
            state.error = null;
          });

          const result = await VisitorsService.checkInVisitor(id, checkInData);

          if (result.success) {
            set((state) => {
              // Update visitor status to checked_in
              const updateVisitorStatus = (list: Visitor[]) => {
                const index = list.findIndex(v => v.id === id);
                if (index !== -1) {
                  list[index] = result.data;
                }
              };

              updateVisitorStatus(state.visitors);
              updateVisitorStatus(state.todayVisitors);
              
              // Move from pending to active if applicable
              state.pendingVisitors = state.pendingVisitors.filter(v => v.id !== id);
              if (result.data.status === 'checked_in') {
                const existingIndex = state.activeVisitors.findIndex(v => v.id === id);
                if (existingIndex === -1) {
                  state.activeVisitors.unshift(result.data);
                } else {
                  state.activeVisitors[existingIndex] = result.data;
                }
              }

              // Update selected visitor
              if (state.selectedVisitor?.id === id) {
                state.selectedVisitor = result.data;
              }

              state.isCheckingIn = false;
            });
          } else {
            set((state) => {
              state.isCheckingIn = false;
              state.error = result.error || 'Failed to check in visitor';
            });
          }

          return result;
        } catch (error: any) {
          console.error('❌ Failed to check in visitor:', error);
          set((state) => {
            state.isCheckingIn = false;
            state.error = error.message || 'Failed to check in visitor';
          });
          return { success: false, error: error.message || 'Failed to check in visitor' };
        }
      },

      checkOutVisitor: async (id: string, checkOutData?: VisitorCheckOutRequest) => {
        try {
          set((state) => {
            state.isCheckingOut = true;
            state.error = null;
          });

          const result = await VisitorsService.checkOutVisitor(id, checkOutData);

          if (result.success) {
            set((state) => {
              // Update visitor status to checked_out
              const updateVisitorStatus = (list: Visitor[]) => {
                const index = list.findIndex(v => v.id === id);
                if (index !== -1) {
                  list[index] = result.data;
                }
              };

              updateVisitorStatus(state.visitors);
              updateVisitorStatus(state.todayVisitors);
              
              // Remove from active visitors
              state.activeVisitors = state.activeVisitors.filter(v => v.id !== id);

              // Update selected visitor
              if (state.selectedVisitor?.id === id) {
                state.selectedVisitor = result.data;
              }

              state.isCheckingOut = false;
            });
          } else {
            set((state) => {
              state.isCheckingOut = false;
              state.error = result.error || 'Failed to check out visitor';
            });
          }

          return result;
        } catch (error: any) {
          console.error('❌ Failed to check out visitor:', error);
          set((state) => {
            state.isCheckingOut = false;
            state.error = error.message || 'Failed to check out visitor';
          });
          return { success: false, error: error.message || 'Failed to check out visitor' };
        }
      },

      approveVisitor: async (id: string, approvalData: VisitorApprovalRequest) => {
        try {
          set((state) => {
            state.isApproving = true;
            state.error = null;
          });

          const result = await VisitorsService.approveVisitor(id, approvalData);

          if (result.success) {
            set((state) => {
              // Update visitor status
              const updateVisitorStatus = (list: Visitor[]) => {
                const index = list.findIndex(v => v.id === id);
                if (index !== -1) {
                  list[index] = result.data;
                }
              };

              updateVisitorStatus(state.visitors);
              updateVisitorStatus(state.todayVisitors);
              updateVisitorStatus(state.pendingVisitors);

              // Update selected visitor
              if (state.selectedVisitor?.id === id) {
                state.selectedVisitor = result.data;
              }

              state.isApproving = false;
            });
          } else {
            set((state) => {
              state.isApproving = false;
              state.error = result.error || 'Failed to approve visitor';
            });
          }

          return result;
        } catch (error: any) {
          console.error('❌ Failed to approve visitor:', error);
          set((state) => {
            state.isApproving = false;
            state.error = error.message || 'Failed to approve visitor';
          });
          return { success: false, error: error.message || 'Failed to approve visitor' };
        }
      },

      rejectVisitor: async (id: string, rejectionData: VisitorRejectionRequest) => {
        try {
          set((state) => {
            state.isRejecting = true;
            state.error = null;
          });

          const result = await VisitorsService.rejectVisitor(id, rejectionData);

          if (result.success) {
            set((state) => {
              // Update visitor status
              const updateVisitorStatus = (list: Visitor[]) => {
                const index = list.findIndex(v => v.id === id);
                if (index !== -1) {
                  list[index] = result.data;
                }
              };

              updateVisitorStatus(state.visitors);
              updateVisitorStatus(state.todayVisitors);
              
              // Remove from pending visitors
              state.pendingVisitors = state.pendingVisitors.filter(v => v.id !== id);

              // Update selected visitor
              if (state.selectedVisitor?.id === id) {
                state.selectedVisitor = result.data;
              }

              state.isRejecting = false;
            });
          } else {
            set((state) => {
              state.isRejecting = false;
              state.error = result.error || 'Failed to reject visitor';
            });
          }

          return result;
        } catch (error: any) {
          console.error('❌ Failed to reject visitor:', error);
          set((state) => {
            state.isRejecting = false;
            state.error = error.message || 'Failed to reject visitor';
          });
          return { success: false, error: error.message || 'Failed to reject visitor' };
        }
      },

      generateQRCode: async (id: string) => {
        try {
          const result = await VisitorsService.getVisitorQRCode(id);
          return result;
        } catch (error: any) {
          console.error('❌ Failed to generate QR code:', error);
          return { success: false, error: error.message || 'Failed to generate QR code' };
        }
      },

      // Specialized fetching
      fetchTodayVisitors: async () => {
        try {
          const result = await VisitorsService.getTodayVisitors();
          if (result.success) {
            set((state) => {
              state.todayVisitors = result.data || [];
            });
          }
        } catch (error) {
          console.error('❌ Failed to fetch today\'s visitors:', error);
        }
      },

      fetchPendingVisitors: async () => {
        try {
          const result = await VisitorsService.getPendingVisitors();
          if (result.success) {
            set((state) => {
              state.pendingVisitors = result.data || [];
            });
          }
        } catch (error) {
          console.error('❌ Failed to fetch pending visitors:', error);
        }
      },

      fetchActiveVisitors: async () => {
        try {
          const result = await VisitorsService.getActiveVisitors();
          if (result.success) {
            set((state) => {
              state.activeVisitors = result.data || [];
            });
          }
        } catch (error) {
          console.error('❌ Failed to fetch active visitors:', error);
        }
      },

      fetchVisitorStats: async (dateRange?: { startDate: string; endDate: string }) => {
        try {
          set((state) => {
            state.isLoadingStats = true;
          });

          const result = await VisitorsService.getVisitorStats(dateRange);
          
          if (result.success) {
            set((state) => {
              state.visitorStats = result.data;
              state.isLoadingStats = false;
            });
          } else {
            set((state) => {
              state.isLoadingStats = false;
            });
          }
        } catch (error) {
          console.error('❌ Failed to fetch visitor stats:', error);
          set((state) => {
            state.isLoadingStats = false;
          });
        }
      },

      // Search and filter
      searchVisitors: async (query: string) => {
        try {
          set((state) => {
            state.searchQuery = query;
            state.currentPage = 1; // Reset to first page
          });
          await get().fetchVisitors();
        } catch (error) {
          console.error('❌ Failed to search visitors:', error);
        }
      },

      setFilter: (filter: VisitorFilter) => {
        set((state) => {
          state.currentFilter = filter;
          state.currentPage = 1; // Reset to first page
        });
        get().fetchVisitors();
      },

      setSort: (sort: VisitorSortOption, order: 'asc' | 'desc' = 'desc') => {
        set((state) => {
          state.currentSort = sort;
          state.sortOrder = order;
          state.currentPage = 1; // Reset to first page
        });
        get().fetchVisitors();
      },

      clearSearch: () => {
        set((state) => {
          state.searchQuery = '';
          state.currentPage = 1;
        });
        get().fetchVisitors();
      },

      // UI state management
      setSelectedVisitor: (visitor: Visitor | null) => {
        set((state) => {
          state.selectedVisitor = visitor;
        });
      },

      setCurrentPage: (page: number) => {
        set((state) => {
          state.currentPage = page;
        });
        get().fetchVisitors();
      },

      setPageSize: (size: number) => {
        set((state) => {
          state.pageSize = size;
          state.currentPage = 1; // Reset to first page
        });
        get().fetchVisitors();
      },

      // Utility methods
      refreshData: async () => {
        await Promise.all([
          get().fetchVisitors(),
          get().fetchTodayVisitors(),
          get().fetchPendingVisitors(),
          get().fetchActiveVisitors(),
          get().fetchVisitorStats(),
        ]);
      },

      clearVisitorData: () => {
        set((state) => {
          Object.assign(state, initialState);
        });
      },

      getVisitorById: (id: string) => {
        const state = get();
        return state.visitors.find(v => v.id === id) || 
               state.todayVisitors.find(v => v.id === id) ||
               state.pendingVisitors.find(v => v.id === id) ||
               state.activeVisitors.find(v => v.id === id) ||
               null;
      },

      getVisitorsByStatus: (status: string) => {
        return get().visitors.filter(v => v.status === status);
      },

      // BaseStore methods
      setLoading: (loading: boolean) => {
        set((state) => {
          state.loading = loading;
        });
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },

      reset: () => {
        set((state) => {
          Object.assign(state, initialState);
        });
      },
    })),
    { name: 'VisitorsStore' }
  )
);

// Selectors for optimized subscriptions
export const useVisitors = () => useVisitorsStore((state) => state.visitors);
useVisitors.displayName = 'useVisitors';

export const useTodayVisitors = () => useVisitorsStore((state) => state.todayVisitors);
useTodayVisitors.displayName = 'useTodayVisitors';

export const usePendingVisitors = () => useVisitorsStore((state) => state.pendingVisitors);
usePendingVisitors.displayName = 'usePendingVisitors';

export const useActiveVisitors = () => useVisitorsStore((state) => state.activeVisitors);
useActiveVisitors.displayName = 'useActiveVisitors';

export const useSelectedVisitor = () => useVisitorsStore((state) => state.selectedVisitor);
useSelectedVisitor.displayName = 'useSelectedVisitor';

export const useVisitorStats = () => useVisitorsStore((state) => state.visitorStats);
useVisitorStats.displayName = 'useVisitorStats';

export const useVisitorsLoading = () => useVisitorsStore((state) => state.loading);
useVisitorsLoading.displayName = 'useVisitorsLoading';

export const useVisitorsError = () => useVisitorsStore((state) => state.error);
useVisitorsError.displayName = 'useVisitorsError';

export const useVisitorsActions = () =>
  useVisitorsStore((state) => ({
    fetchVisitors: state.fetchVisitors,
    fetchVisitor: state.fetchVisitor,
    createVisitor: state.createVisitor,
    updateVisitor: state.updateVisitor,
    deleteVisitor: state.deleteVisitor,
    checkInVisitor: state.checkInVisitor,
    checkOutVisitor: state.checkOutVisitor,
    approveVisitor: state.approveVisitor,
    rejectVisitor: state.rejectVisitor,
    generateQRCode: state.generateQRCode,
    searchVisitors: state.searchVisitors,
    setFilter: state.setFilter,
    setSort: state.setSort,
    clearSearch: state.clearSearch,
    refreshData: state.refreshData,
    setSelectedVisitor: state.setSelectedVisitor,
  }));
useVisitorsActions.displayName = 'useVisitorsActions';

// Computed selectors
export const useVisitorsComputed = () =>
  useVisitorsStore((state) => ({
    hasVisitors: state.visitors.length > 0,
    hasPendingVisitors: state.pendingVisitors.length > 0,
    hasActiveVisitors: state.activeVisitors.length > 0,
    totalVisitors: state.totalVisitors,
    isFirstPage: state.currentPage === 1,
    isLastPage: state.currentPage === state.totalPages,
    hasNextPage: state.currentPage < state.totalPages,
    hasPrevPage: state.currentPage > 1,
    isSearching: state.searchQuery.length > 0,
    isFiltered: state.currentFilter !== 'all',
    loadingOperations: {
      creating: state.isCreating,
      updating: state.isUpdating,
      deleting: state.isDeleting,
      checkingIn: state.isCheckingIn,
      checkingOut: state.isCheckingOut,
      approving: state.isApproving,
      rejecting: state.isRejecting,
    },
  }));
useVisitorsComputed.displayName = 'useVisitorsComputed';