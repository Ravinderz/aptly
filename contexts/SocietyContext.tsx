import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Society, SocietyContext as SocietyContextType, AdminUser } from '@/types/admin';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SocietyProviderProps {
  children: ReactNode;
  adminUser: AdminUser | null;
  onSocietyChange?: (society: Society) => void;
}

interface ExtendedSocietyContextType extends SocietyContextType {
  // Data isolation
  societyData: Map<string, any>;
  getSocietyData: (societyId: string, key: string) => any;
  setSocietyData: (societyId: string, key: string, data: any) => void;
  clearSocietyData: (societyId: string) => void;
  
  // Society management
  refreshSocieties: () => Promise<void>;
  getSocietyStats: (societyId: string) => Promise<any>;
  validateSocietyAccess: (societyId: string) => boolean;
  
  // Multi-society operations
  bulkOperation: (operation: string, data: any, targetSocieties?: string[]) => Promise<any>;
  crossSocietyQuery: (query: string, params?: any) => Promise<any>;
  
  // Notification filtering
  filterNotificationsForSociety: (notifications: any[], societyId: string) => any[];
  
  // Session management
  lastSwitchTime: Date | null;
  switchHistory: SocietySwitchRecord[];
}

interface SocietySwitchRecord {
  fromSocietyId: string | null;
  toSocietyId: string;
  timestamp: Date;
  reason?: string;
}

const SocietyContext = createContext<ExtendedSocietyContextType | undefined>(undefined);

export const SocietyProvider: React.FC<SocietyProviderProps> = ({ 
  children, 
  adminUser, 
  onSocietyChange 
}) => {
  const [currentSociety, setCurrentSociety] = useState<Society | null>(null);
  const [availableSocieties, setAvailableSocieties] = useState<Society[]>([]);
  const [societyData, setSocietyDataState] = useState<Map<string, any>>(new Map());
  const [lastSwitchTime, setLastSwitchTime] = useState<Date | null>(null);
  const [switchHistory, setSwitchHistory] = useState<SocietySwitchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const canSwitch = adminUser?.societies.length > 1 && 
                   adminUser?.societies.some(s => s.isActive);

  useEffect(() => {
    initializeSocieties();
  }, [adminUser]);

  useEffect(() => {
    // Load cached society data when society changes
    if (currentSociety) {
      loadCachedSocietyData(currentSociety.id);
    }
  }, [currentSociety]);

  const initializeSocieties = async () => {
    if (!adminUser) {
      resetSocietyContext();
      return;
    }

    try {
      setIsLoading(true);
      
      // Load accessible societies
      const societies = await loadAccessibleSocieties(adminUser);
      setAvailableSocieties(societies);
      
      // Set default society
      const lastSelectedSociety = await getLastSelectedSociety(adminUser.id);
      const defaultSociety = societies.find(s => s.id === lastSelectedSociety) || 
                           societies.find(s => s.status === 'active') || 
                           societies[0];
      
      if (defaultSociety) {
        await switchSociety(defaultSociety.id);
      }
    } catch (error) {
      console.error('Failed to initialize societies:', error);
      resetSocietyContext();
    } finally {
      setIsLoading(false);
    }
  };

  const resetSocietyContext = () => {
    setCurrentSociety(null);
    setAvailableSocieties([]);
    setSocietyDataState(new Map());
    setLastSwitchTime(null);
    setSwitchHistory([]);
  };

  const loadAccessibleSocieties = async (admin: AdminUser): Promise<Society[]> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockSocieties: Society[] = admin.societies.map((access, index) => ({
          id: access.societyId,
          name: access.societyName,
          code: `SOC${index + 1}`,
          address: `${access.societyName} Address, Mumbai`,
          totalFlats: Math.floor(Math.random() * 200) + 50,
          activeResidents: Math.floor(Math.random() * 150) + 40,
          adminCount: Math.floor(Math.random() * 5) + 1,
          status: access.isActive ? 'active' : 'inactive',
          createdAt: new Date().toISOString(),
          settings: {
            billingCycle: 'monthly',
            gstEnabled: true,
            emergencyContacts: [],
            policies: [],
            features: []
          }
        }));
        resolve(mockSocieties);
      }, 500);
    });
  };

  const switchSociety = async (societyId: string): Promise<void> => {
    if (!adminUser || !validateSocietyAccess(societyId)) {
      throw new Error('Access denied to society');
    }

    const society = availableSocieties.find(s => s.id === societyId);
    if (!society) {
      throw new Error('Society not found');
    }

    try {
      setIsLoading(true);
      
      // Record switch history
      const switchRecord: SocietySwitchRecord = {
        fromSocietyId: currentSociety?.id || null,
        toSocietyId: societyId,
        timestamp: new Date()
      };
      setSwitchHistory(prev => [...prev.slice(-9), switchRecord]); // Keep last 10 switches
      
      // Update current society
      setCurrentSociety(society);
      setLastSwitchTime(new Date());
      
      // Save preference
      await saveLastSelectedSociety(adminUser.id, societyId);
      
      // Load society-specific data
      await loadSocietySpecificData(societyId);
      
      // Notify parent component
      if (onSocietyChange) {
        onSocietyChange(society);
      }
      
      // Log audit event
      await logSocietySwitch(switchRecord);
      
    } catch (error) {
      console.error('Failed to switch society:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateSocietyAccess = (societyId: string): boolean => {
    if (!adminUser) return false;
    
    return adminUser.societies.some(access => 
      access.societyId === societyId && access.isActive
    );
  };

  const loadSocietySpecificData = async (societyId: string): Promise<void> => {
    try {
      // Load cached data first
      await loadCachedSocietyData(societyId);
      
      // Then refresh with fresh data
      const freshData = await fetchSocietyData(societyId);
      setSocietyData(societyId, 'fresh_data', freshData);
      
    } catch (error) {
      console.error('Failed to load society data:', error);
    }
  };

  const loadCachedSocietyData = async (societyId: string): Promise<void> => {
    try {
      const cachedData = await AsyncStorage.getItem(`society_data_${societyId}`);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        setSocietyData(societyId, 'cached_data', data);
      }
    } catch (error) {
      console.error('Failed to load cached society data:', error);
    }
  };

  const fetchSocietyData = async (societyId: string): Promise<any> => {
    // Mock implementation - replace with actual API calls
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          residents: Math.floor(Math.random() * 200) + 50,
          pendingBills: Math.floor(Math.random() * 20),
          maintenanceRequests: Math.floor(Math.random() * 10),
          visitors: Math.floor(Math.random() * 30),
          lastUpdated: new Date().toISOString()
        });
      }, 200);
    });
  };

  const getSocietyData = (societyId: string, key: string): any => {
    const data = societyData.get(societyId);
    return data?.[key];
  };

  const setSocietyData = (societyId: string, key: string, data: any): void => {
    const existingData = societyData.get(societyId) || {};
    const updatedData = { ...existingData, [key]: data };
    
    setSocietyDataState(prev => {
      const newMap = new Map(prev);
      newMap.set(societyId, updatedData);
      return newMap;
    });
    
    // Cache the data
    cacheSocietyData(societyId, updatedData);
  };

  const clearSocietyData = (societyId: string): void => {
    setSocietyDataState(prev => {
      const newMap = new Map(prev);
      newMap.delete(societyId);
      return newMap;
    });
    
    // Clear cache
    AsyncStorage.removeItem(`society_data_${societyId}`);
  };

  const cacheSocietyData = async (societyId: string, data: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(`society_data_${societyId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cache society data:', error);
    }
  };

  const refreshSocieties = async (): Promise<void> => {
    if (!adminUser) return;
    
    try {
      const societies = await loadAccessibleSocieties(adminUser);
      setAvailableSocieties(societies);
      
      // Update current society if it still exists
      if (currentSociety) {
        const updatedCurrentSociety = societies.find(s => s.id === currentSociety.id);
        if (updatedCurrentSociety) {
          setCurrentSociety(updatedCurrentSociety);
        }
      }
    } catch (error) {
      console.error('Failed to refresh societies:', error);
    }
  };

  const getSocietyStats = async (societyId: string): Promise<any> => {
    if (!validateSocietyAccess(societyId)) {
      throw new Error('Access denied to society');
    }
    
    return await fetchSocietyData(societyId);
  };

  const bulkOperation = async (
    operation: string, 
    data: any, 
    targetSocieties?: string[]
  ): Promise<any> => {
    const societies = targetSocieties || availableSocieties.map(s => s.id);
    
    // Validate access to all target societies
    const accessibleSocieties = societies.filter(societyId => 
      validateSocietyAccess(societyId)
    );
    
    if (accessibleSocieties.length === 0) {
      throw new Error('No accessible societies for bulk operation');
    }
    
    // Mock implementation - replace with actual bulk API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          operation,
          societies: accessibleSocieties,
          results: accessibleSocieties.map(societyId => ({
            societyId,
            success: Math.random() > 0.1, // 90% success rate
            message: 'Operation completed'
          }))
        });
      }, 1000);
    });
  };

  const crossSocietyQuery = async (query: string, params?: any): Promise<any> => {
    const accessibleSocietyIds = availableSocieties
      .filter(s => validateSocietyAccess(s.id))
      .map(s => s.id);
    
    // Mock implementation - replace with actual cross-society API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          query,
          params,
          societies: accessibleSocietyIds,
          results: accessibleSocietyIds.reduce((acc, societyId) => {
            acc[societyId] = {
              data: `Mock data for ${query} in society ${societyId}`,
              timestamp: new Date().toISOString()
            };
            return acc;
          }, {} as Record<string, any>)
        });
      }, 800);
    });
  };

  const filterNotificationsForSociety = (notifications: any[], societyId: string): any[] => {
    return notifications.filter(notification => {
      // Filter notifications based on society context
      if (!notification.societyId) return true; // Global notifications
      if (notification.societyId === societyId) return true; // Society-specific
      if (notification.affectedSocieties?.includes(societyId)) return true; // Multi-society
      return false;
    });
  };

  const getLastSelectedSociety = async (userId: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(`last_selected_society_${userId}`);
    } catch (error) {
      console.error('Failed to get last selected society:', error);
      return null;
    }
  };

  const saveLastSelectedSociety = async (userId: string, societyId: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(`last_selected_society_${userId}`, societyId);
    } catch (error) {
      console.error('Failed to save last selected society:', error);
    }
  };

  const logSocietySwitch = async (switchRecord: SocietySwitchRecord): Promise<void> => {
    // Mock audit logging - replace with actual audit service
    console.log('Society Switch Audit:', {
      userId: adminUser?.id,
      from: switchRecord.fromSocietyId,
      to: switchRecord.toSocietyId,
      timestamp: switchRecord.timestamp.toISOString()
    });
  };

  const value: ExtendedSocietyContextType = {
    currentSociety,
    availableSocieties,
    canSwitch,
    switchSociety,
    societyData,
    getSocietyData,
    setSocietyData,
    clearSocietyData,
    refreshSocieties,
    getSocietyStats,
    validateSocietyAccess,
    bulkOperation,
    crossSocietyQuery,
    filterNotificationsForSociety,
    lastSwitchTime,
    switchHistory
  };

  return (
    <SocietyContext.Provider value={value}>
      {children}
    </SocietyContext.Provider>
  );
};

export const useSociety = (): ExtendedSocietyContextType => {
  const context = useContext(SocietyContext);
  if (context === undefined) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
};

export default SocietyContext;