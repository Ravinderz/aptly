/**
 * SocietyStore - Zustand store for society data and operations
 *
 * Handles multi-society management, current society selection,
 * and society-related operations with comprehensive caching and error handling.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStorageManager } from '../utils/storageManager';
import type { BaseStore } from '../types';

// Society types
export interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  email: string;
  website?: string;
  description?: string;
  totalUnits: number;
  occupiedUnits: number;
  amenities: string[];
  rules: string[];
  establishedDate: string;
  adminContacts: AdminContact[];
  billingInfo: BillingInfo;
  settings: SocietySettings;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface AdminContact {
  id: string;
  name: string;
  role: string;
  phoneNumber: string;
  email: string;
  isPrimary: boolean;
}

export interface BillingInfo {
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  nextBillingDate: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  paymentMethod?: {
    type: 'card' | 'bank' | 'upi';
    last4: string;
    expiryDate?: string;
  };
}

export interface SocietySettings {
  allowGuestRegistration: boolean;
  requireAdminApproval: boolean;
  enableNotifications: boolean;
  enableBilling: boolean;
  enableMaintenanceTracking: boolean;
  enableVisitorManagement: boolean;
  timeZone: string;
  currency: string;
  language: string;
}

export interface CreateSocietyRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  email: string;
  website?: string;
  description?: string;
  totalUnits: number;
  adminContact: Omit<AdminContact, 'id' | 'isPrimary'>;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
}

export interface SocietyMetrics {
  totalSocieties: number;
  activeSocieties: number;
  totalUnits: number;
  occupancyRate: number;
  recentActivity: {
    newSocieties: number;
    updatedSocieties: number;
    period: string;
  };
}

// Society store state
interface SocietyState extends BaseStore {
  // Core data
  societies: Society[];
  currentSociety: Society | null;
  metrics: SocietyMetrics | null;

  // UI state
  searchQuery: string;
  selectedSocietyIds: string[];
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'totalUnits';
  sortOrder: 'asc' | 'desc';
  filterStatus: 'all' | 'active' | 'inactive' | 'pending' | 'suspended';

  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;

  // Cache management
  lastFetchTime: number | null;
  cacheExpiry: number; // 5 minutes default
}

// Store actions
interface SocietyActions {
  // Data operations
  loadSocieties: (force?: boolean) => Promise<void>;
  loadSocietyMetrics: () => Promise<void>;
  selectSociety: (societyId: string) => Promise<void>;
  createSociety: (societyData: CreateSocietyRequest) => Promise<void>;
  updateSociety: (
    societyId: string,
    updates: Partial<Society>,
  ) => Promise<void>;
  deleteSociety: (societyId: string) => Promise<void>;
  duplicateSociety: (societyId: string, newName: string) => Promise<void>;

  // Bulk operations
  bulkUpdateSocieties: (
    societyIds: string[],
    updates: Partial<Society>,
  ) => Promise<void>;
  bulkDeleteSocieties: (societyIds: string[]) => Promise<void>;

  // Search and filtering
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SocietyState['sortBy']) => void;
  setSortOrder: (order: SocietyState['sortOrder']) => void;
  setFilterStatus: (status: SocietyState['filterStatus']) => void;
  clearFilters: () => void;

  // Selection management
  selectSocietyIds: (ids: string[]) => void;
  toggleSocietySelection: (id: string) => void;
  selectAllSocieties: () => void;
  clearSelection: () => void;

  // Pagination
  setPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;

  // Utility methods
  getSocietyById: (id: string) => Society | undefined;
  getFilteredSocieties: () => Society[];
  getPaginatedSocieties: () => Society[];
  getSocietyStats: (societyId: string) => {
    occupancyRate: number;
    activeContacts: number;
    isActive: boolean;
  } | null;

  // Cache management
  isCacheValid: () => boolean;
  refreshCache: () => Promise<void>;
  clearCache: () => void;
}

type SocietyStore = SocietyState & SocietyActions;

// Initial state
const initialState: SocietyState = {
  // Base store
  loading: false,
  error: null,

  // Core data
  societies: [],
  currentSociety: null,
  metrics: null,

  // UI state
  searchQuery: '',
  selectedSocietyIds: [],
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  filterStatus: 'all',

  // Pagination
  currentPage: 1,
  itemsPerPage: 20,
  totalItems: 0,

  // Cache
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
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

// Mock society service (replace with actual service)
const societyService = {
  async getSocieties(): Promise<Society[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        name: 'Green Valley Society',
        address: '123 Garden Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        phoneNumber: '+91-9876543210',
        email: 'admin@greenvalley.com',
        website: 'https://greenvalley.com',
        description: 'A premium residential society with modern amenities',
        totalUnits: 150,
        occupiedUnits: 142,
        amenities: ['Swimming Pool', 'Gym', 'Garden', 'Security'],
        rules: ['No pets allowed', 'Quiet hours 10 PM - 6 AM'],
        establishedDate: '2015-01-15',
        adminContacts: [
          {
            id: 'admin1',
            name: 'John Doe',
            role: 'Society Secretary',
            phoneNumber: '+91-9876543210',
            email: 'john@greenvalley.com',
            isPrimary: true,
          },
        ],
        billingInfo: {
          billingCycle: 'monthly',
          nextBillingDate: '2024-02-01',
          subscriptionPlan: 'premium',
          paymentMethod: {
            type: 'card',
            last4: '1234',
            expiryDate: '12/25',
          },
        },
        settings: {
          allowGuestRegistration: true,
          requireAdminApproval: true,
          enableNotifications: true,
          enableBilling: true,
          enableMaintenanceTracking: true,
          enableVisitorManagement: true,
          timeZone: 'Asia/Kolkata',
          currency: 'INR',
          language: 'en',
        },
        status: 'active',
        createdAt: '2015-01-15T00:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      },
    ] as Society[];
  },

  async getSociety(id: string): Promise<Society> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const societies = await this.getSocieties();
    const society = societies.find((s) => s.id === id);
    if (!society) {
      throw new Error(`Society with id ${id} not found`);
    }
    return society;
  },

  async createSociety(data: CreateSocietyRequest): Promise<Society> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newSociety: Society = {
      id: `society_${Date.now()}`,
      ...data,
      occupiedUnits: 0,
      establishedDate: new Date().toISOString(),
      amenities: [],
      rules: [],
      adminContacts: [
        {
          id: `admin_${Date.now()}`,
          ...data.adminContact,
          isPrimary: true,
        },
      ],
      billingInfo: {
        billingCycle: 'monthly',
        nextBillingDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        subscriptionPlan: data.subscriptionPlan,
      },
      settings: {
        allowGuestRegistration: false,
        requireAdminApproval: true,
        enableNotifications: true,
        enableBilling: true,
        enableMaintenanceTracking: true,
        enableVisitorManagement: true,
        timeZone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'en',
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newSociety;
  },

  async updateSociety(id: string, updates: Partial<Society>): Promise<Society> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const society = await this.getSociety(id);
    return {
      ...society,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  },

  async deleteSociety(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // In real implementation, would make API call
  },

  async getMetrics(): Promise<SocietyMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      totalSocieties: 45,
      activeSocieties: 42,
      totalUnits: 6750,
      occupancyRate: 0.89,
      recentActivity: {
        newSocieties: 3,
        updatedSocieties: 8,
        period: 'last_30_days',
      },
    };
  },
};

// Create the Zustand store
export const useSocietyStore = create<SocietyStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Base store methods
        setLoading: (loading: boolean) =>
          set((state) => {
            state.loading = loading;
          }),

        setError: (error: string | null) =>
          set((state) => {
            state.error = error;
          }),

        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),

        // Data operations
        loadSocieties: async (force = false) => {
          const state = get();

          // Check cache validity unless forced
          if (!force && state.isCacheValid()) {
            return;
          }

          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const societies = await societyService.getSocieties();

            set((state) => {
              state.societies = societies;
              state.totalItems = societies.length;
              state.loading = false;
              state.lastFetchTime = Date.now();
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load societies';
              state.loading = false;
            });
          }
        },

        loadSocietyMetrics: async () => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const metrics = await societyService.getMetrics();

            set((state) => {
              state.metrics = metrics;
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load society metrics';
              state.loading = false;
            });
          }
        },

        selectSociety: async (societyId: string) => {
          const state = get();
          const existingSociety = state.societies.find(
            (s) => s.id === societyId,
          );

          if (existingSociety) {
            set((state) => {
              state.currentSociety = existingSociety;
            });
            return;
          }

          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const society = await societyService.getSociety(societyId);

            set((state) => {
              state.currentSociety = society;
              state.loading = false;

              // Add to societies array if not exists
              if (!state.societies.find((s) => s.id === society.id)) {
                state.societies.push(society);
              }
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load society';
              state.loading = false;
            });
          }
        },

        createSociety: async (societyData: CreateSocietyRequest) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const newSociety = await societyService.createSociety(societyData);

            set((state) => {
              state.societies.unshift(newSociety); // Add to beginning
              state.currentSociety = newSociety;
              state.totalItems = state.societies.length;
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to create society';
              state.loading = false;
            });
            throw error;
          }
        },

        updateSociety: async (societyId: string, updates: Partial<Society>) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const updatedSociety = await societyService.updateSociety(
              societyId,
              updates,
            );

            set((state) => {
              // Update in societies array
              const index = state.societies.findIndex(
                (s) => s.id === societyId,
              );
              if (index !== -1) {
                state.societies[index] = updatedSociety;
              }

              // Update current society if it's the one being updated
              if (state.currentSociety?.id === societyId) {
                state.currentSociety = updatedSociety;
              }

              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to update society';
              state.loading = false;
            });
            throw error;
          }
        },

        deleteSociety: async (societyId: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            await societyService.deleteSociety(societyId);

            set((state) => {
              state.societies = state.societies.filter(
                (s) => s.id !== societyId,
              );
              state.totalItems = state.societies.length;

              // Clear current society if it's the one being deleted
              if (state.currentSociety?.id === societyId) {
                state.currentSociety = null;
              }

              // Remove from selection if selected
              state.selectedSocietyIds = state.selectedSocietyIds.filter(
                (id) => id !== societyId,
              );

              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to delete society';
              state.loading = false;
            });
            throw error;
          }
        },

        duplicateSociety: async (societyId: string, newName: string) => {
          const state = get();
          const originalSociety = state.societies.find(
            (s) => s.id === societyId,
          );

          if (!originalSociety) {
            throw new Error('Society not found');
          }

          const duplicateData: CreateSocietyRequest = {
            name: newName,
            address: originalSociety.address,
            city: originalSociety.city,
            state: originalSociety.state,
            zipCode: originalSociety.zipCode,
            country: originalSociety.country,
            phoneNumber: originalSociety.phoneNumber,
            email: originalSociety.email,
            website: originalSociety.website,
            description: originalSociety.description,
            totalUnits: originalSociety.totalUnits,
            adminContact: {
              name: originalSociety.adminContacts[0]?.name || '',
              role: originalSociety.adminContacts[0]?.role || '',
              phoneNumber: originalSociety.adminContacts[0]?.phoneNumber || '',
              email: originalSociety.adminContacts[0]?.email || '',
            },
            subscriptionPlan: originalSociety.billingInfo.subscriptionPlan,
          };

          await get().createSociety(duplicateData);
        },

        // Bulk operations
        bulkUpdateSocieties: async (
          societyIds: string[],
          updates: Partial<Society>,
        ) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            // In real implementation, would make bulk API call
            await Promise.all(
              societyIds.map((id) => societyService.updateSociety(id, updates)),
            );

            set((state) => {
              societyIds.forEach((id) => {
                const index = state.societies.findIndex((s) => s.id === id);
                if (index !== -1) {
                  state.societies[index] = {
                    ...state.societies[index],
                    ...updates,
                  };
                }
              });
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to update societies';
              state.loading = false;
            });
            throw error;
          }
        },

        bulkDeleteSocieties: async (societyIds: string[]) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            // In real implementation, would make bulk API call
            await Promise.all(
              societyIds.map((id) => societyService.deleteSociety(id)),
            );

            set((state) => {
              state.societies = state.societies.filter(
                (s) => !societyIds.includes(s.id),
              );
              state.totalItems = state.societies.length;

              // Clear current society if deleted
              if (
                state.currentSociety &&
                societyIds.includes(state.currentSociety.id)
              ) {
                state.currentSociety = null;
              }

              // Clear selections
              state.selectedSocietyIds = [];
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to delete societies';
              state.loading = false;
            });
            throw error;
          }
        },

        // Search and filtering
        setSearchQuery: (query: string) =>
          set((state) => {
            state.searchQuery = query;
            state.currentPage = 1; // Reset to first page
          }),

        setSortBy: (sortBy: SocietyState['sortBy']) =>
          set((state) => {
            state.sortBy = sortBy;
          }),

        setSortOrder: (order: SocietyState['sortOrder']) =>
          set((state) => {
            state.sortOrder = order;
          }),

        setFilterStatus: (status: SocietyState['filterStatus']) =>
          set((state) => {
            state.filterStatus = status;
            state.currentPage = 1; // Reset to first page
          }),

        clearFilters: () =>
          set((state) => {
            state.searchQuery = '';
            state.filterStatus = 'all';
            state.sortBy = 'updatedAt';
            state.sortOrder = 'desc';
            state.currentPage = 1;
          }),

        // Selection management
        selectSocietyIds: (ids: string[]) =>
          set((state) => {
            state.selectedSocietyIds = ids;
          }),

        toggleSocietySelection: (id: string) =>
          set((state) => {
            const index = state.selectedSocietyIds.indexOf(id);
            if (index === -1) {
              state.selectedSocietyIds.push(id);
            } else {
              state.selectedSocietyIds.splice(index, 1);
            }
          }),

        selectAllSocieties: () =>
          set((state) => {
            const filteredSocieties = get().getFilteredSocieties();
            state.selectedSocietyIds = filteredSocieties.map((s) => s.id);
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedSocietyIds = [];
          }),

        // Pagination
        setPage: (page: number) =>
          set((state) => {
            state.currentPage = page;
          }),

        setItemsPerPage: (count: number) =>
          set((state) => {
            state.itemsPerPage = count;
            state.currentPage = 1; // Reset to first page
          }),

        // Utility methods
        getSocietyById: (id: string) => {
          return get().societies.find((s) => s.id === id);
        },

        getFilteredSocieties: () => {
          const state = get();
          let filtered = [...state.societies];

          // Apply search filter
          if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (society) =>
                society.name.toLowerCase().includes(query) ||
                society.city.toLowerCase().includes(query) ||
                society.address.toLowerCase().includes(query) ||
                society.email.toLowerCase().includes(query),
            );
          }

          // Apply status filter
          if (state.filterStatus !== 'all') {
            filtered = filtered.filter(
              (society) => society.status === state.filterStatus,
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (state.sortBy) {
              case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
              case 'createdAt':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
              case 'updatedAt':
                aValue = new Date(a.updatedAt).getTime();
                bValue = new Date(b.updatedAt).getTime();
                break;
              case 'totalUnits':
                aValue = a.totalUnits;
                bValue = b.totalUnits;
                break;
              default:
                return 0;
            }

            if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
            return 0;
          });

          return filtered;
        },

        getPaginatedSocieties: () => {
          const filtered = get().getFilteredSocieties();
          const state = get();
          const startIndex = (state.currentPage - 1) * state.itemsPerPage;
          const endIndex = startIndex + state.itemsPerPage;
          return filtered.slice(startIndex, endIndex);
        },

        getSocietyStats: (societyId: string) => {
          const society = get().getSocietyById(societyId);
          if (!society) return null;

          return {
            occupancyRate:
              society.totalUnits > 0
                ? society.occupiedUnits / society.totalUnits
                : 0,
            activeContacts: society.adminContacts.length,
            isActive: society.status === 'active',
          };
        },

        // Cache management
        isCacheValid: () => {
          const state = get();
          if (!state.lastFetchTime) return false;
          return Date.now() - state.lastFetchTime < state.cacheExpiry;
        },

        refreshCache: async () => {
          await get().loadSocieties(true);
        },

        clearCache: () =>
          set((state) => {
            state.societies = [];
            state.currentSociety = null;
            state.metrics = null;
            state.lastFetchTime = null;
            state.totalItems = 0;
          }),
      })),
      {
        name: 'society-storage',
        storage: createStorageManager('SocietyStore') as any,
        partialize: (state: SocietyStore) => ({
          currentSociety: state.currentSociety,
          // Don't persist the full societies array to save space
          // Will be loaded fresh on app start
        }),
      },
    ),
    { name: 'SocietyStore' },
  ),
);

// Selector hooks for optimized re-renders
export const useSocietyUser = () =>
  useSocietyStore((state) => state.currentSociety);
export const useSocietyLoading = () =>
  useSocietyStore((state) => state.loading);
export const useSocietyError = () => useSocietyStore((state) => state.error);
export const useSocietyList = () =>
  useSocietyStore((state) => {
    // Get filtered societies without pagination function call to prevent infinite loops
    const filtered = state.societies.filter((society) => {
      if (!state.searchQuery) return true;
      return society.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
             society.address.toLowerCase().includes(state.searchQuery.toLowerCase());
    });
    
    // Apply pagination
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  });
export const useSocietyMetrics = () =>
  useSocietyStore((state) => state.metrics);
export const useSocietyActions = () =>
  useSocietyStore((state) => ({
    loadSocieties: state.loadSocieties,
    selectSociety: state.selectSociety,
    createSociety: state.createSociety,
    updateSociety: state.updateSociety,
    deleteSociety: state.deleteSociety,
    setSearchQuery: state.setSearchQuery,
    setFilterStatus: state.setFilterStatus,
    clearFilters: state.clearFilters,
  }));
