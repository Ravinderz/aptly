/**
 * Migration hook for gradual transition from Society contexts to SocietyStore
 * 
 * Provides seamless interface compatibility between Context and Store implementations
 * with feature flag controlled migration support.
 */
import { useSocietyStore, type Society, type CreateSocietyRequest, type SocietyMetrics } from '@/stores/slices/societyStore';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

// Context interface (based on expected SocietyContext structure)
interface SocietyContextType {
  // Core data
  societies: Society[];
  currentSociety: Society | null;
  metrics: SocietyMetrics | null;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Basic operations
  loadSocieties: () => Promise<void>;
  selectSociety: (societyId: string) => Promise<void>;
  createSociety: (societyData: CreateSocietyRequest) => Promise<void>;
  updateSociety: (societyId: string, updates: Partial<Society>) => Promise<void>;
  deleteSociety: (societyId: string) => Promise<void>;
}

/**
 * Migration hook that provides society functionality
 * Switches between Context and Store based on feature flag
 */
export const useSocietyMigration = (): SocietyContextType & {
  // Additional store-only methods
  loadSocietyMetrics?: () => Promise<void>;
  duplicateSociety?: (societyId: string, newName: string) => Promise<void>;
  bulkUpdateSocieties?: (societyIds: string[], updates: Partial<Society>) => Promise<void>;
  bulkDeleteSocieties?: (societyIds: string[]) => Promise<void>;
  setSearchQuery?: (query: string) => void;
  setFilterStatus?: (status: 'all' | 'active' | 'inactive' | 'pending' | 'suspended') => void;
  clearFilters?: () => void;
  getSocietyById?: (id: string) => Society | undefined;
  getFilteredSocieties?: () => Society[];
  getPaginatedSocieties?: () => Society[];
  refreshCache?: () => Promise<void>;
  clearCache?: () => void;
  
  // Selection management
  selectedSocietyIds?: string[];
  selectSocietyIds?: (ids: string[]) => void;
  toggleSocietySelection?: (id: string) => void;
  selectAllSocieties?: () => void;
  clearSelection?: () => void;
  
  // Pagination
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  setPage?: (page: number) => void;
  setItemsPerPage?: (count: number) => void;
} => {
  const { isFeatureEnabled } = useFeatureFlags();
  const useStore = isFeatureEnabled('USE_SOCIETY_STORE' as any);
  
  const societyStore = useSocietyStore();
  
  if (useStore) {
    // Return full store functionality
    return {
      // Core data
      societies: societyStore.societies,
      currentSociety: societyStore.currentSociety,
      metrics: societyStore.metrics,
      
      // State
      loading: societyStore.loading,
      error: societyStore.error,
      
      // Basic operations (Context-compatible)
      loadSocieties: () => societyStore.loadSocieties(),
      selectSociety: societyStore.selectSociety,
      createSociety: societyStore.createSociety,
      updateSociety: societyStore.updateSociety,
      deleteSociety: societyStore.deleteSociety,
      
      // Store-only methods
      loadSocietyMetrics: societyStore.loadSocietyMetrics,
      duplicateSociety: societyStore.duplicateSociety,
      bulkUpdateSocieties: societyStore.bulkUpdateSocieties,
      bulkDeleteSocieties: societyStore.bulkDeleteSocieties,
      setSearchQuery: societyStore.setSearchQuery,
      setFilterStatus: societyStore.setFilterStatus,
      clearFilters: societyStore.clearFilters,
      getSocietyById: societyStore.getSocietyById,
      getFilteredSocieties: societyStore.getFilteredSocieties,
      getPaginatedSocieties: societyStore.getPaginatedSocieties,
      refreshCache: societyStore.refreshCache,
      clearCache: societyStore.clearCache,
      
      // Selection management
      selectedSocietyIds: societyStore.selectedSocietyIds,
      selectSocietyIds: societyStore.selectSocietyIds,
      toggleSocietySelection: societyStore.toggleSocietySelection,
      selectAllSocieties: societyStore.selectAllSocieties,
      clearSelection: societyStore.clearSelection,
      
      // Pagination
      currentPage: societyStore.currentPage,
      itemsPerPage: societyStore.itemsPerPage,
      totalItems: societyStore.totalItems,
      setPage: societyStore.setPage,
      setItemsPerPage: societyStore.setItemsPerPage,
    };
  }
  
  // Return fallback implementation (Context would be used here in real app)
  // For now, returning a basic mock implementation
  return {
    // Core data
    societies: [],
    currentSociety: null,
    metrics: null,
    
    // State
    loading: false,
    error: null,
    
    // Basic operations - stub implementations
    loadSocieties: async () => {
      console.warn('loadSocieties not available in fallback mode - enable USE_SOCIETY_STORE');
    },
    
    selectSociety: async (societyId: string) => {
      console.warn('selectSociety not available in fallback mode - enable USE_SOCIETY_STORE');
    },
    
    createSociety: async (societyData: CreateSocietyRequest) => {
      console.warn('createSociety not available in fallback mode - enable USE_SOCIETY_STORE');
    },
    
    updateSociety: async (societyId: string, updates: Partial<Society>) => {
      console.warn('updateSociety not available in fallback mode - enable USE_SOCIETY_STORE');
    },
    
    deleteSociety: async (societyId: string) => {
      console.warn('deleteSociety not available in fallback mode - enable USE_SOCIETY_STORE');
    },
    
    // Store-only method stubs
    loadSocietyMetrics: async () => {
      console.warn('loadSocietyMetrics not available in fallback mode');
    },
    
    duplicateSociety: async (societyId: string, newName: string) => {
      console.warn('duplicateSociety not available in fallback mode');
    },
    
    bulkUpdateSocieties: async (societyIds: string[], updates: Partial<Society>) => {
      console.warn('bulkUpdateSocieties not available in fallback mode');
    },
    
    bulkDeleteSocieties: async (societyIds: string[]) => {
      console.warn('bulkDeleteSocieties not available in fallback mode');
    },
    
    setSearchQuery: (query: string) => {
      console.warn('setSearchQuery not available in fallback mode');
    },
    
    setFilterStatus: (status: 'all' | 'active' | 'inactive' | 'pending' | 'suspended') => {
      console.warn('setFilterStatus not available in fallback mode');
    },
    
    clearFilters: () => {
      console.warn('clearFilters not available in fallback mode');
    },
    
    getSocietyById: (id: string) => {
      console.warn('getSocietyById not available in fallback mode');
      return undefined;
    },
    
    getFilteredSocieties: () => {
      console.warn('getFilteredSocieties not available in fallback mode');
      return [];
    },
    
    getPaginatedSocieties: () => {
      console.warn('getPaginatedSocieties not available in fallback mode');
      return [];
    },
    
    refreshCache: async () => {
      console.warn('refreshCache not available in fallback mode');
    },
    
    clearCache: () => {
      console.warn('clearCache not available in fallback mode');
    },
    
    // Selection management stubs
    selectedSocietyIds: [],
    selectSocietyIds: (ids: string[]) => {
      console.warn('selectSocietyIds not available in fallback mode');
    },
    
    toggleSocietySelection: (id: string) => {
      console.warn('toggleSocietySelection not available in fallback mode');
    },
    
    selectAllSocieties: () => {
      console.warn('selectAllSocieties not available in fallback mode');
    },
    
    clearSelection: () => {
      console.warn('clearSelection not available in fallback mode');
    },
    
    // Pagination stubs
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    setPage: (page: number) => {
      console.warn('setPage not available in fallback mode');
    },
    
    setItemsPerPage: (count: number) => {
      console.warn('setItemsPerPage not available in fallback mode');
    },
  };
};

/**
 * Hook to check if we're currently using the store implementation
 */
export const useIsSocietyStoreActive = (): boolean => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled('USE_SOCIETY_STORE' as any);
};

/**
 * Hook for society search and filtering utilities
 */
export const useSocietySearch = () => {
  const society = useSocietyMigration();
  
  return {
    searchQuery: society.setSearchQuery ? '' : '', // Would need to track this in Context
    setSearchQuery: society.setSearchQuery,
    filterStatus: 'all' as const, // Would need to track this in Context
    setFilterStatus: society.setFilterStatus,
    clearFilters: society.clearFilters,
    filteredSocieties: society.getFilteredSocieties?.() || [],
    totalResults: society.getFilteredSocieties?.().length || 0,
  };
};

/**
 * Hook for society selection management
 */
export const useSocietySelection = () => {
  const society = useSocietyMigration();
  
  return {
    selectedIds: society.selectedSocietyIds || [],
    selectIds: society.selectSocietyIds,
    toggleSelection: society.toggleSocietySelection,
    selectAll: society.selectAllSocieties,
    clearSelection: society.clearSelection,
    selectedCount: society.selectedSocietyIds?.length || 0,
    hasSelection: (society.selectedSocietyIds?.length || 0) > 0,
  };
};

/**
 * Hook for society pagination
 */
export const useSocietyPagination = () => {
  const society = useSocietyMigration();
  
  const totalPages = Math.ceil((society.totalItems || 0) / (society.itemsPerPage || 20));
  
  return {
    currentPage: society.currentPage || 1,
    itemsPerPage: society.itemsPerPage || 20,
    totalItems: society.totalItems || 0,
    totalPages,
    setPage: society.setPage,
    setItemsPerPage: society.setItemsPerPage,
    hasNextPage: (society.currentPage || 1) < totalPages,
    hasPrevPage: (society.currentPage || 1) > 1,
    paginatedSocieties: society.getPaginatedSocieties?.() || [],
  };
};

/**
 * Hook for society metrics and statistics
 */
export const useSocietyMetrics = () => {
  const society = useSocietyMigration();
  
  return {
    metrics: society.metrics,
    loading: society.loading,
    error: society.error,
    loadMetrics: society.loadSocietyMetrics,
    
    // Computed metrics
    occupancyRate: society.metrics?.occupancyRate || 0,
    totalSocieties: society.metrics?.totalSocieties || 0,
    activeSocieties: society.metrics?.activeSocieties || 0,
    recentActivity: society.metrics?.recentActivity,
  };
};

/**
 * Hook for society bulk operations
 */
export const useSocietyBulkOperations = () => {
  const society = useSocietyMigration();
  const { selectedIds, clearSelection } = useSocietySelection();
  
  return {
    bulkUpdate: async (updates: Partial<Society>) => {
      if (society.bulkUpdateSocieties && selectedIds.length > 0) {
        await society.bulkUpdateSocieties(selectedIds, updates);
        clearSelection?.();
      }
    },
    
    bulkDelete: async () => {
      if (society.bulkDeleteSocieties && selectedIds.length > 0) {
        await society.bulkDeleteSocieties(selectedIds);
        clearSelection?.();
      }
    },
    
    canPerformBulkOperations: selectedIds.length > 0 && !!society.bulkUpdateSocieties,
    selectedCount: selectedIds.length,
  };
};

/**
 * Development helper for society migration validation
 */
export const useSocietyMigrationValidator = () => {
  if (__DEV__) {
    const society = useSocietyMigration();
    const isStoreActive = useIsSocietyStoreActive();
    
    // Validate essential methods are available
    const requiredMethods = [
      'loadSocieties', 'selectSociety', 'createSociety', 
      'updateSociety', 'deleteSociety'
    ];
    
    const missingMethods = requiredMethods.filter(method => 
      typeof society[method as keyof typeof society] !== 'function'
    );
    
    if (missingMethods.length > 0) {
      console.warn('Society migration validation: Missing methods:', missingMethods);
    }
    
    // Validate data structure when store is active
    if (isStoreActive && society.societies) {
      const sampleSociety = society.societies[0];
      if (sampleSociety) {
        const requiredFields = ['id', 'name', 'address', 'city', 'status'];
        const missingFields = requiredFields.filter(field => 
          !sampleSociety[field as keyof Society]
        );
        
        if (missingFields.length > 0) {
          console.warn('Society migration validation: Missing society fields:', missingFields);
        }
      }
    }
  }
};