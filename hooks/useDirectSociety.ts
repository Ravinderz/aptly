// Direct society hook using only Zustand stores (no Context dependency)
import { 
  useSocietyStore, 
  useSocietyLoading, 
  useSocietyError, 
  useSocietyList, 
  useSocietyMetrics, 
  useSocietyActions 
} from '@/stores/slices/societyStore';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useMemo, useCallback } from 'react';

/**
 * Direct society hook that uses stores directly without Context dependencies
 * This replaces useSocietyMigration to avoid circular dependencies during initialization
 */
export const useDirectSociety = () => {
  // Get society store state
  const loading = useSocietyLoading();
  const error = useSocietyError();
  const societies = useSocietyList();
  const societyMetrics = useSocietyMetrics();
  
  // Get society actions
  const {
    loadSocieties,
    selectSociety,
    createSociety,
    updateSociety,
    deleteSociety,
  } = useSocietyActions();

  // Get current society
  const currentSociety = useSocietyStore((state) => state.currentSociety);
  const selectedSociety = useSocietyStore((state) => state.selectedSociety);

  // Get additional society store actions with stable callbacks
  const loadSocietyMetrics = useCallback(useSocietyStore.getState().loadSocietyMetrics, []);
  const duplicateSociety = useCallback(useSocietyStore.getState().duplicateSociety, []);
  const bulkUpdateSocieties = useCallback(useSocietyStore.getState().bulkUpdateSocieties, []);
  const bulkDeleteSocieties = useCallback(useSocietyStore.getState().bulkDeleteSocieties, []);
  const setSearchQuery = useCallback(useSocietyStore.getState().setSearchQuery, []);
  const setFilterStatus = useCallback(useSocietyStore.getState().setFilterStatus, []);
  const clearFilters = useCallback(useSocietyStore.getState().clearFilters, []);
  const getSocietyById = useCallback(useSocietyStore.getState().getSocietyById, []);
  const getFilteredSocieties = useCallback(useSocietyStore.getState().getFilteredSocieties, []);
  const getPaginatedSocieties = useCallback(useSocietyStore.getState().getPaginatedSocieties, []);
  const refreshCache = useCallback(useSocietyStore.getState().refreshCache, []);
  const clearCache = useCallback(useSocietyStore.getState().clearCache, []);

  // Get UI state
  const searchQuery = useSocietyStore((state) => state.searchQuery);
  const filterStatus = useSocietyStore((state) => state.filterStatus);
  const selectedSocietyIds = useSocietyStore((state) => state.selectedSocietyIds);
  const selectSocietyIds = useCallback(useSocietyStore.getState().selectSocietyIds, []);
  const toggleSocietySelection = useCallback(useSocietyStore.getState().toggleSocietySelection, []);
  const selectAllSocieties = useCallback(useSocietyStore.getState().selectAllSocieties, []);
  const clearSelection = useCallback(useSocietyStore.getState().clearSelection, []);

  // Additional utility methods
  const getSocietyStats = useCallback((societyId: string) => {
    const society = getSocietyById(societyId);
    if (!society) return null;
    
    return {
      totalUnits: society.totalUnits,
      occupiedUnits: society.occupiedUnits,
      occupancyRate: (society.occupiedUnits / society.totalUnits) * 100,
      totalAmenities: society.amenities.length,
    };
  }, [getSocietyById]);

  const bulkOperation = useCallback(async (operation: string, societyIds: string[], data?: any) => {
    switch (operation) {
      case 'update':
        await bulkUpdateSocieties(societyIds, data);
        break;
      case 'delete':
        await bulkDeleteSocieties(societyIds);
        break;
      default:
        console.warn(`Unknown bulk operation: ${operation}`);
    }
  }, [bulkUpdateSocieties, bulkDeleteSocieties]);

  const filterNotificationsForSociety = useCallback((societyId: string, notifications: any[]) => {
    // This would filter notifications for a specific society
    // For now, just return all notifications as a mock
    return notifications.filter(notification => 
      !notification.societyId || notification.societyId === societyId
    );
  }, []);

  // Memoize the return object to prevent infinite re-renders
  return useMemo(() => ({
    // Core data
    societies,
    currentSociety,
    selectedSociety,
    metrics: societyMetrics,
    
    // State
    loading,
    error,
    
    // Basic operations
    loadSocieties,
    selectSociety,
    createSociety,
    updateSociety,
    deleteSociety,
    
    // Additional operations
    loadSocietyMetrics,
    duplicateSociety,
    bulkUpdateSocieties,
    bulkDeleteSocieties,
    
    // Search and filtering
    searchQuery,
    filterStatus,
    setSearchQuery,
    setFilterStatus,
    clearFilters,
    
    // Utilities
    getSocietyById,
    getFilteredSocieties,
    getPaginatedSocieties,
    getSocietyStats,
    bulkOperation,
    filterNotificationsForSociety,
    
    // Selection management
    selectedSocietyIds,
    selectSocietyIds,
    toggleSocietySelection,
    selectAllSocieties,
    clearSelection,
    
    // Cache management
    refreshCache,
    clearCache,
    
    // Metadata
    isUsingStore: true,
    migrationStatus: 'active' as const,
  }), [
    societies,
    currentSociety,
    selectedSociety,
    societyMetrics,
    loading,
    error,
    loadSocieties,
    selectSociety,
    createSociety,
    updateSociety,
    deleteSociety,
    loadSocietyMetrics,
    duplicateSociety,
    bulkUpdateSocieties,
    bulkDeleteSocieties,
    searchQuery,
    filterStatus,
    setSearchQuery,
    setFilterStatus,
    clearFilters,
    getSocietyById,
    getFilteredSocieties,
    getPaginatedSocieties,
    getSocietyStats,
    bulkOperation,
    filterNotificationsForSociety,
    selectedSocietyIds,
    selectSocietyIds,
    toggleSocietySelection,
    selectAllSocieties,
    clearSelection,
    refreshCache,
    clearCache,
  ]);
};

/**
 * Hook to check if society store is active
 */
export const useIsSocietyStoreActive = (): boolean => {
  return useFeatureFlagStore((state) => state.flags.USE_SOCIETY_STORE);
};

/**
 * Emergency fallback that provides basic society state
 */
export const useSocietyFallback = () => {
  return {
    societies: [],
    currentSociety: null,
    selectedSociety: null,
    metrics: null,
    loading: false,
    error: null,
    loadSocieties: async () => {},
    selectSociety: async () => {},
    createSociety: async () => {},
    updateSociety: async () => {},
    deleteSociety: async () => {},
    loadSocietyMetrics: async () => {},
    duplicateSociety: async () => {},
    bulkUpdateSocieties: async () => {},
    bulkDeleteSocieties: async () => {},
    searchQuery: '',
    filterStatus: 'all' as const,
    setSearchQuery: () => {},
    setFilterStatus: () => {},
    clearFilters: () => {},
    getSocietyById: () => undefined,
    getFilteredSocieties: () => [],
    getPaginatedSocieties: () => [],
    getSocietyStats: () => null,
    bulkOperation: async () => {},
    filterNotificationsForSociety: () => [],
    selectedSocietyIds: [],
    selectSocietyIds: () => {},
    toggleSocietySelection: () => {},
    selectAllSocieties: () => {},
    clearSelection: () => {},
    refreshCache: async () => {},
    clearCache: () => {},
    isUsingStore: false,
    migrationStatus: 'fallback',
  };
};