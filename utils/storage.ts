import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  VEHICLES: 'aptly_vehicles',
  DOCUMENTS: 'aptly_documents',
  EMERGENCY_CONTACTS: 'aptly_emergency_contacts',
  USER_PROFILE: 'aptly_user_profile',
  SETTINGS: 'aptly_settings',
  COMMUNITY_POSTS: 'aptly_community_posts',
  NOTICES: 'aptly_notices',
  MAINTENANCE_REQUESTS: 'aptly_maintenance_requests',
  BILLING_DATA: 'aptly_billing_data'
} as const;

// Generic storage operations
export class StorageService {
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving to storage (${key}):`, error);
      throw error;
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage (${key}):`, error);
      throw error;
    }
  }

  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  static async multiGet(keys: string[]): Promise<readonly [string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Error with multiGet:', error);
      return [];
    }
  }

  static async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Error with multiSet:', error);
      throw error;
    }
  }
}

// Vehicle-specific storage operations
export interface Vehicle {
  id: string;
  type: 'car' | 'bike' | 'bicycle' | 'other';
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
  parkingSlot?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export class VehicleStorage {
  static async getVehicles(): Promise<Vehicle[]> {
    const vehicles = await StorageService.getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES);
    return vehicles || [];
  }

  static async saveVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const vehicles = await this.getVehicles();
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If this is set as primary, remove primary from others
    if (newVehicle.isPrimary) {
      vehicles.forEach(v => v.isPrimary = false);
    }

    vehicles.push(newVehicle);
    await StorageService.setItem(STORAGE_KEYS.VEHICLES, vehicles);
    return newVehicle;
  }

  static async updateVehicle(id: string, updates: Partial<Omit<Vehicle, 'id' | 'createdAt'>>): Promise<Vehicle | null> {
    const vehicles = await this.getVehicles();
    const vehicleIndex = vehicles.findIndex(v => v.id === id);
    
    if (vehicleIndex === -1) return null;

    // If setting as primary, remove primary from others
    if (updates.isPrimary) {
      vehicles.forEach(v => v.isPrimary = false);
    }

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await StorageService.setItem(STORAGE_KEYS.VEHICLES, vehicles);
    return vehicles[vehicleIndex];
  }

  static async deleteVehicle(id: string): Promise<boolean> {
    const vehicles = await this.getVehicles();
    const filteredVehicles = vehicles.filter(v => v.id !== id);
    
    if (filteredVehicles.length === vehicles.length) return false;
    
    await StorageService.setItem(STORAGE_KEYS.VEHICLES, filteredVehicles);
    return true;
  }
}

// Document-specific storage operations
export interface Document {
  id: string;
  name: string;
  type: 'aadhar' | 'pan' | 'passport' | 'driving_license' | 'property_papers' | 'other';
  description?: string;
  fileUri: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export class DocumentStorage {
  static async getDocuments(): Promise<Document[]> {
    const documents = await StorageService.getItem<Document[]>(STORAGE_KEYS.DOCUMENTS);
    return documents || [];
  }

  static async saveDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const documents = await this.getDocuments();
    const newDocument: Document = {
      ...document,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    documents.push(newDocument);
    await StorageService.setItem(STORAGE_KEYS.DOCUMENTS, documents);
    return newDocument;
  }

  static async deleteDocument(id: string): Promise<boolean> {
    const documents = await this.getDocuments();
    const filteredDocuments = documents.filter(d => d.id !== id);
    
    if (filteredDocuments.length === documents.length) return false;
    
    await StorageService.setItem(STORAGE_KEYS.DOCUMENTS, filteredDocuments);
    return true;
  }
}

// Emergency Contacts storage operations
export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string;
  address?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export class EmergencyContactStorage {
  static async getContacts(): Promise<EmergencyContact[]> {
    const contacts = await StorageService.getItem<EmergencyContact[]>(STORAGE_KEYS.EMERGENCY_CONTACTS);
    return contacts || [];
  }

  static async saveContact(contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyContact> {
    const contacts = await this.getContacts();
    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If this is set as primary, remove primary from others
    if (newContact.isPrimary) {
      contacts.forEach(c => c.isPrimary = false);
    }

    contacts.push(newContact);
    await StorageService.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts);
    return newContact;
  }

  static async updateContact(id: string, updates: Partial<Omit<EmergencyContact, 'id' | 'createdAt'>>): Promise<EmergencyContact | null> {
    const contacts = await this.getContacts();
    const contactIndex = contacts.findIndex(c => c.id === id);
    
    if (contactIndex === -1) return null;

    // If setting as primary, remove primary from others
    if (updates.isPrimary) {
      contacts.forEach(c => c.isPrimary = false);
    }

    contacts[contactIndex] = {
      ...contacts[contactIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await StorageService.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts);
    return contacts[contactIndex];
  }

  static async deleteContact(id: string): Promise<boolean> {
    const contacts = await this.getContacts();
    const filteredContacts = contacts.filter(c => c.id !== id);
    
    if (filteredContacts.length === contacts.length) return false;
    
    await StorageService.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, filteredContacts);
    return true;
  }
}

// Settings storage operations
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  security: {
    biometricEnabled: boolean;
    autoLock: boolean;
    autoLockTimeout: number; // minutes
  };
  privacy: {
    shareWithSociety: boolean;
    allowMentions: boolean;
    profileVisibility: 'public' | 'residents' | 'private';
  };
  createdAt: string;
  updatedAt: string;
}

export class SettingsStorage {
  static async getSettings(): Promise<AppSettings> {
    const settings = await StorageService.getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
    return settings || {
      theme: 'system',
      notifications: {
        push: true,
        email: false,
        sms: true
      },
      security: {
        biometricEnabled: false,
        autoLock: false,
        autoLockTimeout: 5
      },
      privacy: {
        shareWithSociety: true,
        allowMentions: true,
        profileVisibility: 'residents'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static async updateSettings(updates: Partial<Omit<AppSettings, 'createdAt' | 'updatedAt'>>): Promise<AppSettings> {
    const settings = await this.getSettings();
    const updatedSettings: AppSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await StorageService.setItem(STORAGE_KEYS.SETTINGS, updatedSettings);
    return updatedSettings;
  }

  static async resetSettings(): Promise<AppSettings> {
    await StorageService.removeItem(STORAGE_KEYS.SETTINGS);
    return await this.getSettings(); // Returns default settings
  }
}

// Notice storage operations
export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'billing' | 'emergency' | 'event';
  priority: 'low' | 'medium' | 'high';
  author: string;
  publishedAt: string;
  expiresAt?: string;
  attachments?: string[];
  isRead: boolean;
}

export class NoticeStorage {
  static async getNotices(): Promise<Notice[]> {
    const notices = await StorageService.getItem<Notice[]>(STORAGE_KEYS.NOTICES);
    return notices || [];
  }

  static async markNoticeAsRead(id: string): Promise<boolean> {
    const notices = await this.getNotices();
    const noticeIndex = notices.findIndex(n => n.id === id);
    
    if (noticeIndex === -1) return false;
    
    notices[noticeIndex].isRead = true;
    await StorageService.setItem(STORAGE_KEYS.NOTICES, notices);
    return true;
  }

  static async getNoticesInDateRange(startDate: Date, endDate: Date): Promise<Notice[]> {
    const notices = await this.getNotices();
    return notices.filter(notice => {
      const publishedDate = new Date(notice.publishedAt);
      return publishedDate >= startDate && publishedDate <= endDate;
    });
  }
}

// Utility functions
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Initialize storage with mock data (for development)
export const initializeMockData = async () => {
  // Only initialize if no data exists
  const vehicles = await VehicleStorage.getVehicles();
  if (vehicles.length === 0) {
    await VehicleStorage.saveVehicle({
      type: 'car',
      make: 'Maruti',
      model: 'Swift',
      registrationNumber: 'DL-01-AB-1234',
      color: 'White',
      parkingSlot: 'A-15',
      isPrimary: true
    });
  }

  // Mock documents
  const documents = await DocumentStorage.getDocuments();
  if (documents.length === 0) {
    await DocumentStorage.saveDocument({
      name: 'Aadhar Card',
      type: 'aadhar',
      description: 'Identity proof document',
      fileUri: 'mock://aadhar.pdf',
      mimeType: 'application/pdf',
      size: 1024000
    });
  }

  // Mock emergency contacts
  const contacts = await EmergencyContactStorage.getContacts();
  if (contacts.length === 0) {
    await EmergencyContactStorage.saveContact({
      name: 'Dr. Priya Kumar',
      relationship: 'Wife',
      phoneNumber: '9876543211',
      alternatePhone: '8765432198',
      address: 'Same flat - A-301',
      isPrimary: true
    });
  }
};