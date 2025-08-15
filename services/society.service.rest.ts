/**
 * Society REST Service
 * Complete society management service with REST API integration
 * Handles society verification, search, onboarding, and association management
 */

import { API_ENDPOINTS } from '@/config/api.config';
import { apiClient, APIClientError } from '@/services/api.client';
import {
  AssociatedSociety,
  SocietyHealthMetrics,
  SocietyInfo,
  SocietyJoinRequest,
  SocietyJoinResponse,
  SocietyOnboardingState,
  SocietySearchRequest,
  SocietySearchResponse,
  SocietyVerificationRequest,
  SocietyVerificationResponse,
  UserSocietyAssociation,
  UserSocietyAssociationResponse,
} from '@/types/society';
import {
  SecureProfileStorage,
  SecureSessionStorage,
} from '@/utils/storage.secure';
import { z } from 'zod';

// Validation schemas using Zod
const societyCodeSchema = z
  .string()
  .min(4, 'Society code must be at least 4 characters')
  .max(12, 'Society code cannot exceed 12 characters')
  .regex(
    /^[A-Z0-9]+$/,
    'Society code must contain only uppercase letters and numbers',
  );

const phoneNumberSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number cannot exceed 15 digits')
  .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number');

const flatNumberSchema = z
  .string()
  .min(1, 'Flat number is required')
  .max(10, 'Flat number cannot exceed 10 characters')
  .regex(
    /^[A-Z0-9\-\/]+$/i,
    'Flat number can only contain letters, numbers, hyphens, and forward slashes',
  );

const societySearchSchema = z.object({
  query: z.string().optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      radius: z.number().min(0.1).max(50).optional(),
    })
    .optional(),
  filters: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      minFlats: z.number().min(1).optional(),
      maxFlats: z.number().min(1).optional(),
      amenities: z.array(z.string()).optional(),
    })
    .optional(),
  pagination: z
    .object({
      page: z.number().min(1),
      limit: z.number().min(1).max(100),
    })
    .optional(),
});

const societyJoinRequestSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required'),
  societyCode: societyCodeSchema,
  userProfile: z.object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name too long'),
    phoneNumber: phoneNumberSchema,
    email: z.string().email('Please enter a valid email address').optional(),
    dateOfBirth: z.string().optional(),
    photo: z.string().optional(),
  }),
  residenceDetails: z.object({
    flatNumber: flatNumberSchema,
    block: z.string().max(5).optional(),
    floor: z.string().max(5).optional(),
    ownershipType: z.enum(['owner', 'tenant', 'family_member']),
    moveInDate: z.string().min(1, 'Move-in date is required'),
    isPrimary: z.boolean(),
  }),
  emergencyContacts: z
    .array(
      z.object({
        name: z.string().min(2, 'Contact name is required'),
        relationship: z.string().min(1, 'Relationship is required'),
        phoneNumber: phoneNumberSchema,
        email: z.string().email().optional(),
        address: z.string().optional(),
        isPrimary: z.boolean(),
      }),
    )
    .min(1, 'At least one emergency contact is required'),
  documents: z
    .object({
      proofOfResidence: z
        .object({
          id: z.string(),
          filename: z.string(),
          url: z.string(),
          mimeType: z.string(),
          size: z.number(),
          uploadedAt: z.string(),
        })
        .optional(),
      identityProof: z
        .object({
          id: z.string(),
          filename: z.string(),
          url: z.string(),
          mimeType: z.string(),
          size: z.number(),
          uploadedAt: z.string(),
        })
        .optional(),
      ownershipProof: z
        .object({
          id: z.string(),
          filename: z.string(),
          url: z.string(),
          mimeType: z.string(),
          size: z.number(),
          uploadedAt: z.string(),
        })
        .optional(),
      agreementCopy: z
        .object({
          id: z.string(),
          filename: z.string(),
          url: z.string(),
          mimeType: z.string(),
          size: z.number(),
          uploadedAt: z.string(),
        })
        .optional(),
    })
    .optional(),
  consentAgreements: z.object({
    termsAndConditions: z
      .boolean()
      .refine((val) => val === true, 'Terms and conditions must be accepted'),
    privacyPolicy: z
      .boolean()
      .refine((val) => val === true, 'Privacy policy must be accepted'),
    societyRules: z
      .boolean()
      .refine((val) => val === true, 'Society rules must be accepted'),
    dataSharing: z.boolean(),
  }),
});

/**
 * Society Service Result Interface
 */
export interface SocietyServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  suggestions?: string[];
}

/**
 * Enhanced REST Society Service
 */
export class RestSocietyService {
  private static instance: RestSocietyService;
  private currentSociety: SocietyInfo | null = null;
  private userAssociations: UserSocietyAssociation[] = [];
  private onboardingState: SocietyOnboardingState | null = null;

  private constructor() {
    this.initializeFromStorage();
  }

  static getInstance(): RestSocietyService {
    if (!RestSocietyService.instance) {
      RestSocietyService.instance = new RestSocietyService();
    }
    return RestSocietyService.instance;
  }

  /**
   * Initialize from stored data
   */
  private async initializeFromStorage(): Promise<void> {
    try {
      const storedSociety =
        SecureProfileStorage.getProfile<SocietyInfo>('society');
      const storedAssociations = SecureProfileStorage.getProfile<
        UserSocietyAssociation[]
      >('societyAssociations');

      if (storedSociety) {
        this.currentSociety = storedSociety;
      }

      if (storedAssociations) {
        this.userAssociations = storedAssociations;
      }
    } catch (error) {
      console.warn(
        '⚠️ Failed to initialize society service from storage:',
        error,
      );
    }
  }

  /**
   * Check if user has society association after authentication
   */
  async checkSocietyAssociation(phoneNumber: string): Promise<
    SocietyServiceResult<{
      hasAssociation: boolean;
      associations: AssociatedSociety[];
      requiresOnboarding: boolean;
    }>
  > {
    try {
      // Validate phone number
      const phoneValidation = phoneNumberSchema.safeParse(phoneNumber);
      if (!phoneValidation.success) {
        return {
          success: false,
          error: phoneValidation.error.issues[0].message,
          code: 'INVALID_PHONE',
        };
      }

      // Make API call to check associations
      const response = await apiClient.get<UserSocietyAssociationResponse>(
        `${API_ENDPOINTS.SOCIETY.CHECK_ASSOCIATION}?phone=${encodeURIComponent(phoneNumber)}`,
      );

      if (response.success && response.data) {
        const { user, societies, total_societies } = response.data;

        // Store associations
        // this.userAssociations = societies;
        SecureProfileStorage.storeProfile(societies, 'societyAssociations');

        // Set default society if available
        if (total_societies > 0) {
          const defaultSociety = societies[0];
          if (defaultSociety) {
            await this.loadSocietyDetails(defaultSociety.id);
          }
        }

        return {
          success: true,
          data: {
            hasAssociation: total_societies > 0,
            associations: societies,
            requiresOnboarding: total_societies === 0,
          },
        };
      } else {
        return {
          success: false,
          error:
            response.error?.message || 'Failed to check society association',
          code: 'API_ERROR',
        };
      }
    } catch (error) {
      console.error('❌ Society association check failed:', error);

      // Fallback: assume no association and require onboarding
      return {
        success: true,
        data: {
          hasAssociation: false,
          associations: [],
          requiresOnboarding: true,
        },
      };
    }
  }

  /**
   * Verify society by code and phone number
   */
  async verifySociety(
    request: SocietyVerificationRequest,
  ): Promise<SocietyServiceResult<SocietyVerificationResponse>> {
    try {
      if (request.societyCode) {
        const codeValidation = societyCodeSchema.safeParse(request.societyCode);
        if (!codeValidation.success) {
          return {
            success: false,
            error: codeValidation.error.issues[0].message,
            code: 'INVALID_CODE',
          };
        }
      }

      // Build query parameters
      const params = new URLSearchParams();

      params.append('code', request.societyCode);

      // Make API call
      const response = await apiClient.get<SocietySearchResponse['data']>(
        `${API_ENDPOINTS.SOCIETY.VERIFY}?${params.toString()}`,
      );

      if (response.success && response.data) {
        const verificationResponse: SocietyVerificationResponse = {
          success: true,
          data: {
            society: response.data.societies[0] || null,
          },
        };

        // Store society info if found
        if (response.data.societies && response.data.societies.length > 0) {
          this.currentSociety = response.data.societies[0];
          SecureProfileStorage.storeProfile(this.currentSociety, 'society');
        }

        return {
          success: true,
          data: verificationResponse,
        };
      } else {
        const errorCode = response.error?.code || 'VERIFICATION_FAILED';
        const errorMessage =
          response.error?.message || 'Failed to verify society details';

        const verificationResponse: SocietyVerificationResponse = {
          success: false,
          error: {
            code: errorCode as any,
            message: errorMessage,
            suggestions: this.generateErrorSuggestions(errorCode),
          },
        };

        return {
          success: false,
          data: verificationResponse,
          error: errorMessage,
          code: errorCode,
          suggestions: verificationResponse.error?.suggestions,
        };
      }
    } catch (error) {
      console.error('❌ Society verification failed:', error);

      if (error instanceof APIClientError) {
        const verificationResponse: SocietyVerificationResponse = {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message,
            suggestions: ['Check your internet connection', 'Try again later'],
          },
        };

        return {
          success: false,
          data: verificationResponse,
          error: error.message,
          code: 'NETWORK_ERROR',
        };
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Search societies by query, location, or filters
   */
  async searchSocieties(
    request: SocietySearchRequest,
  ): Promise<SocietyServiceResult<SocietySearchResponse>> {
    try {
      // Validate request
      const validation = societySearchSchema.safeParse(request);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message,
          code: 'INVALID_REQUEST',
        };
      }

      // Build query parameters
      const params = new URLSearchParams();

      if (request.query) {
        params.append('query', request.query);
      }

      if (request.location) {
        params.append('lat', request.location.latitude.toString());
        params.append('lng', request.location.longitude.toString());
        if (request.location.radius) {
          params.append('radius', request.location.radius.toString());
        }
      }

      if (request.filters) {
        Object.entries(request.filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(`${key}[]`, v));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      if (request.pagination) {
        params.append('page', request.pagination.page.toString());
        params.append('limit', request.pagination.limit.toString());
      }

      // Make API call
      const response = await apiClient.get<SocietySearchResponse['data']>(
        `${API_ENDPOINTS.SOCIETY.SEARCH}?${params.toString()}`,
      );

      if (response.success && response.data) {
        const searchResponse: SocietySearchResponse = {
          success: true,
          data: response.data,
        };

        return {
          success: true,
          data: searchResponse,
        };
      } else {
        const searchResponse: SocietySearchResponse = {
          success: false,
          error: {
            code: response.error?.code || 'SEARCH_FAILED',
            message: response.error?.message || 'Failed to search societies',
          },
        };

        return {
          success: false,
          data: searchResponse,
          error: searchResponse.error?.message,
          code: searchResponse.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Society search failed:', error);

      if (error instanceof APIClientError) {
        const searchResponse: SocietySearchResponse = {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message,
          },
        };

        return {
          success: false,
          data: searchResponse,
          error: error.message,
          code: 'NETWORK_ERROR',
        };
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Submit society join/onboarding request
   */
  async submitSocietyJoinRequest(
    request: SocietyJoinRequest,
  ): Promise<SocietyServiceResult<SocietyJoinResponse>> {
    try {
      // Validate request
      const validation = societyJoinRequestSchema.safeParse(request);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message,
          code: 'VALIDATION_ERROR',
        };
      }

      // Make API call
      const response = await apiClient.post<SocietyJoinResponse['data']>(
        API_ENDPOINTS.SOCIETY.JOIN,
        request,
      );

      if (response.success && response.data) {
        const joinResponse: SocietyJoinResponse = {
          success: true,
          data: response.data,
        };

        // Store new association
        if (response.data.association) {
          this.userAssociations.push(response.data.association);
          SecureProfileStorage.storeProfile(
            this.userAssociations,
            'societyAssociations',
          );
        }

        // Clear onboarding state on success
        this.onboardingState = null;
        SecureSessionStorage.clearValue('societyOnboardingState');

        return {
          success: true,
          data: joinResponse,
        };
      } else {
        const joinResponse: SocietyJoinResponse = {
          success: false,
          error: {
            code: response.error?.code || 'JOIN_FAILED',
            message: response.error?.message || 'Failed to submit join request',
            validationErrors: response.error?.details?.validationErrors,
          },
        };

        return {
          success: false,
          data: joinResponse,
          error: joinResponse.error?.message,
          code: joinResponse.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Society join request failed:', error);

      if (error instanceof APIClientError) {
        const joinResponse: SocietyJoinResponse = {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message,
          },
        };

        return {
          success: false,
          data: joinResponse,
          error: error.message,
          code: 'NETWORK_ERROR',
        };
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Load detailed society information
   */
  async loadSocietyDetails(
    societyId: string,
  ): Promise<SocietyServiceResult<SocietyInfo>> {
    try {
      const response = await apiClient.get<SocietyInfo>(
        API_ENDPOINTS.SOCIETY.DETAILS(societyId),
      );

      if (response.success && response.data) {
        this.currentSociety = response.data;
        SecureProfileStorage.storeProfile(response.data, 'society');

        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to load society details',
          code: response.error?.code || 'LOAD_FAILED',
        };
      }
    } catch (error) {
      console.error('❌ Failed to load society details:', error);

      if (error instanceof APIClientError) {
        return {
          success: false,
          error: error.message,
          code: 'NETWORK_ERROR',
        };
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Get society health metrics
   */
  async getSocietyHealthMetrics(
    societyId: string,
  ): Promise<SocietyServiceResult<SocietyHealthMetrics>> {
    try {
      const response = await apiClient.get<SocietyHealthMetrics>(
        API_ENDPOINTS.SOCIETY.HEALTH(societyId),
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error:
            response.error?.message || 'Failed to load society health metrics',
          code: response.error?.code || 'METRICS_FAILED',
        };
      }
    } catch (error) {
      console.error('❌ Failed to load society health metrics:', error);

      return {
        success: false,
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Get current society
   */
  getCurrentSociety(): SocietyInfo | null {
    return this.currentSociety;
  }

  /**
   * Get user associations
   */
  getUserAssociations(): UserSocietyAssociation[] {
    return this.userAssociations;
  }

  /**
   * Set onboarding state
   */
  setOnboardingState(state: Partial<SocietyOnboardingState>): void {
    this.onboardingState = {
      ...this.onboardingState,
      ...state,
    } as SocietyOnboardingState;

    // Store in session storage
    SecureSessionStorage.storeValue(
      'societyOnboardingState',
      JSON.stringify(this.onboardingState),
    );
  }

  /**
   * Get onboarding state
   */
  getOnboardingState(): SocietyOnboardingState | null {
    if (this.onboardingState) {
      return this.onboardingState;
    }

    try {
      const storedState = SecureSessionStorage.getValue(
        'societyOnboardingState',
      );
      if (storedState) {
        this.onboardingState = JSON.parse(storedState);
        return this.onboardingState;
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse stored onboarding state:', error);
    }

    return null;
  }

  /**
   * Clear onboarding state
   */
  clearOnboardingState(): void {
    this.onboardingState = null;
    SecureSessionStorage.clearValue('societyOnboardingState');
  }

  /**
   * Switch to different society (for multi-society users)
   */
  async switchSociety(
    societyId: string,
  ): Promise<SocietyServiceResult<SocietyInfo>> {
    try {
      const association = this.userAssociations.find(
        (assoc) => assoc.societyId === societyId,
      );
      if (!association) {
        return {
          success: false,
          error: 'You are not associated with this society',
          code: 'NOT_ASSOCIATED',
        };
      }

      return await this.loadSocietyDetails(societyId);
    } catch (error) {
      console.error('❌ Failed to switch society:', error);
      return {
        success: false,
        error: 'Failed to switch society',
        code: 'SWITCH_FAILED',
      };
    }
  }

  /**
   * Clear all society data (logout)
   */
  async clearSocietyData(): Promise<void> {
    try {
      this.currentSociety = null;
      this.userAssociations = [];
      this.onboardingState = null;

      // Clear stored data
      SecureProfileStorage.clearProfile('society');
      SecureProfileStorage.clearProfile('societyAssociations');
      SecureSessionStorage.clearValue('societyOnboardingState');
    } catch (error) {
      console.warn('⚠️ Failed to clear society data:', error);
    }
  }

  /**
   * Generate error suggestions based on error code
   */
  private generateErrorSuggestions(errorCode: string): string[] {
    switch (errorCode) {
      case 'SOCIETY_NOT_FOUND':
        return [
          'Check if the society code is correct',
          'Contact your society management for the correct code',
          'Try searching by society name instead',
        ];
      case 'INVALID_CODE':
        return [
          'Society codes are usually 4-12 characters long',
          'Use only uppercase letters and numbers',
          'Remove any spaces or special characters',
        ];
      case 'PHONE_NOT_ASSOCIATED':
        return [
          'Your phone number may not be registered with this society',
          'Contact society management to register your number',
          'Try a different phone number if you have multiple',
        ];
      case 'NETWORK_ERROR':
        return [
          'Check your internet connection',
          'Try again in a few moments',
          'Switch to a different network if possible',
        ];
      default:
        return [
          'Try again in a few moments',
          'Contact support if the issue persists',
        ];
    }
  }
}

// Create singleton instance
const restSocietyService = RestSocietyService.getInstance();
export default restSocietyService;

// Export compatible interface
export { restSocietyService as SocietyService, type SocietyServiceResult };
