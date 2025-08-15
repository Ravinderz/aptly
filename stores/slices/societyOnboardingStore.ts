/**
 * Society Onboarding Store - Zustand store for society onboarding flow
 *
 * Manages the complete society onboarding state including verification,
 * search, selection, and join request processes.
 */
import { SocietyService } from '@/services/society.service.rest';
import {
  EmergencyContactInfo,
  FamilyMemberInfo,
  SocietyInfo,
  SocietyJoinRequest,
  SocietyJoinResponse,
  SocietySearchRequest,
  SocietyVerificationRequest,
  SocietyVerificationResponse,
  UserSocietyAssociation,
  VehicleInfo,
} from '@/types/society';
import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { BaseStore } from '../types';
import {
  createStorageManager,
  safeParse,
  safeStringify,
} from '../utils/storageManager';

// Onboarding flow steps
export const ONBOARDING_STEPS = [
  'verification',
  'search',
  'selection',
  'details',
  'profile',
  'review',
  'completion',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

// Society onboarding store state
interface SocietyOnboardingStoreState extends BaseStore {
  // Flow state
  currentStep: OnboardingStep;
  progress: {
    currentStep: number;
    totalSteps: number;
    completedSteps: OnboardingStep[];
  };
  canGoBack: boolean;
  canGoNext: boolean;

  // Verification state
  verificationRequest: SocietyVerificationRequest | null;
  verificationResponse: SocietyVerificationResponse | null;
  verificationLoading: boolean;
  verificationError: string | null;

  // Search state
  searchRequest: SocietySearchRequest | null;
  searchResults: SocietyInfo[];
  searchLoading: boolean;
  searchError: string | null;
  searchHasMore: boolean;
  searchTotal: number;

  // Selection state
  selectedSociety: SocietyInfo | null;
  societyDetailsLoading: boolean;
  societyDetailsError: string | null;

  // Onboarding data
  userProfile: {
    fullName: string;
    phoneNumber: string;
    email: string;
    dateOfBirth: string;
    photo: string;
    sessionId?: string; // Optional session ID for verification
  };
  residenceDetails: {
    flatNumber: string;
    block: string;
    floor: string;
    ownershipType: 'owner' | 'tenant' | 'family_member';
    moveInDate: string;
    isPrimary: boolean;
  };
  emergencyContacts: EmergencyContactInfo[];
  vehicleDetails: VehicleInfo[];
  familyMembers: FamilyMemberInfo[];
  additionalInfo: {
    specialRequirements: string;
    previousAddress: string;
  };
  consentAgreements: {
    termsAndConditions: boolean;
    privacyPolicy: boolean;
    societyRules: boolean;
    dataSharing: boolean;
  };

  // Submission state
  submitLoading: boolean;
  submitError: string | null;
  submitResponse: SocietyJoinResponse | null;

  // Validation state
  validationErrors: Record<string, string>;

  // User associations
  userAssociations: UserSocietyAssociation[];
  hasExistingAssociations: boolean;
}

// Store actions
interface SocietyOnboardingActions {
  // Flow navigation
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (step: OnboardingStep) => void;
  resetFlow: () => void;

  // Verification actions
  setVerificationRequest: (request: SocietyVerificationRequest) => void;
  verifySociety: (request: SocietyVerificationRequest) => Promise<void>;
  clearVerification: () => void;

  // Search actions
  setSearchRequest: (request: SocietySearchRequest) => void;
  searchSocieties: (
    request: SocietySearchRequest,
    append?: boolean,
  ) => Promise<void>;
  loadMoreResults: () => Promise<void>;
  clearSearch: () => void;

  // Selection actions
  selectSociety: (society: SocietyInfo) => void;
  loadSocietyDetails: (societyId: string) => Promise<void>;
  clearSelection: () => void;

  // Form data actions
  updateUserProfile: (
    profile: Partial<SocietyOnboardingStoreState['userProfile']>,
  ) => void;
  updateResidenceDetails: (
    details: Partial<SocietyOnboardingStoreState['residenceDetails']>,
  ) => void;
  addEmergencyContact: (contact: EmergencyContactInfo) => void;
  updateEmergencyContact: (
    index: number,
    contact: EmergencyContactInfo,
  ) => void;
  removeEmergencyContact: (index: number) => void;
  addVehicleDetails: (vehicle: VehicleInfo) => void;
  updateVehicleDetails: (index: number, vehicle: VehicleInfo) => void;
  removeVehicleDetails: (index: number) => void;
  addFamilyMember: (member: FamilyMemberInfo) => void;
  updateFamilyMember: (index: number, member: FamilyMemberInfo) => void;
  removeFamilyMember: (index: number) => void;
  updateAdditionalInfo: (
    info: Partial<SocietyOnboardingStoreState['additionalInfo']>,
  ) => void;
  updateConsentAgreements: (
    consents: Partial<SocietyOnboardingStoreState['consentAgreements']>,
  ) => void;

  // Validation actions
  validateStep: (step: OnboardingStep) => boolean;
  setValidationError: (field: string, error: string) => void;
  clearValidationError: (field: string) => void;
  clearAllValidationErrors: () => void;

  // Submission actions
  submitJoinRequest: () => Promise<void>;
  retrySubmission: () => Promise<void>;

  // Association management
  setUserAssociations: (associations: UserSocietyAssociation[]) => void;
  checkExistingAssociations: (phoneNumber: string) => Promise<void>;

  // Utility actions
  getOnboardingData: () => Partial<SocietyJoinRequest>;
  loadSavedState: () => void;
  saveCurrentState: () => void;
  isStepCompleted: (step: OnboardingStep) => boolean;
  getStepValidationErrors: (step: OnboardingStep) => string[];
}

type SocietyOnboardingStore = SocietyOnboardingStoreState &
  SocietyOnboardingActions;

// Initial state
const initialState: SocietyOnboardingStoreState = {
  // Base store
  loading: false,
  error: null,

  // Flow state
  currentStep: 'verification',
  progress: {
    currentStep: 1,
    totalSteps: ONBOARDING_STEPS.length,
    completedSteps: [],
  },
  canGoBack: false,
  canGoNext: false,

  // Verification state
  verificationRequest: null,
  verificationResponse: null,
  verificationLoading: false,
  verificationError: null,

  // Search state
  searchRequest: null,
  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchHasMore: false,
  searchTotal: 0,

  // Selection state
  selectedSociety: null,
  societyDetailsLoading: false,
  societyDetailsError: null,

  // Onboarding data
  userProfile: {
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    photo: '',
  },
  residenceDetails: {
    flatNumber: '',
    block: '',
    floor: '',
    ownershipType: 'owner',
    moveInDate: '',
    isPrimary: true,
  },
  emergencyContacts: [],
  vehicleDetails: [],
  familyMembers: [],
  additionalInfo: {
    specialRequirements: '',
    previousAddress: '',
  },
  consentAgreements: {
    termsAndConditions: false,
    privacyPolicy: false,
    societyRules: false,
    dataSharing: false,
  },

  // Submission state
  submitLoading: false,
  submitError: null,
  submitResponse: null,

  // Validation state
  validationErrors: {},

  // User associations
  userAssociations: [],
  hasExistingAssociations: false,

  // Base store methods (will be overridden)
  setLoading: () => {},
  setError: () => {},
  reset: () => {},
};

// Create the Zustand store
export const useSocietyOnboardingStore = create<SocietyOnboardingStore>()(
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

        // Flow navigation
        goToStep: (step: OnboardingStep) =>
          set((state) => {
            state.currentStep = step;
            state.progress.currentStep = ONBOARDING_STEPS.indexOf(step) + 1;

            // Update navigation state
            state.canGoBack = state.progress.currentStep > 1;
            state.canGoNext =
              get().validateStep(step) &&
              state.progress.currentStep < ONBOARDING_STEPS.length;
          }),

        nextStep: () => {
          const state = get();
          const currentIndex = ONBOARDING_STEPS.indexOf(state.currentStep);

          if (currentIndex < ONBOARDING_STEPS.length - 1) {
            const nextStep = ONBOARDING_STEPS[currentIndex + 1];
            get().completeStep(state.currentStep);
            get().goToStep(nextStep);
          }
        },

        previousStep: () => {
          const state = get();
          const currentIndex = ONBOARDING_STEPS.indexOf(state.currentStep);

          if (currentIndex > 0) {
            const previousStep = ONBOARDING_STEPS[currentIndex - 1];
            get().goToStep(previousStep);
          }
        },

        completeStep: (step: OnboardingStep) =>
          set((state) => {
            if (!state.progress.completedSteps.includes(step)) {
              state.progress.completedSteps.push(step);
            }
          }),

        resetFlow: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),

        // Verification actions
        setVerificationRequest: (request: SocietyVerificationRequest) =>
          set((state) => {
            state.verificationRequest = request;
            state.userProfile.phoneNumber = request.phoneNumber;
          }),

        verifySociety: async (request: SocietyVerificationRequest) => {
          set((state) => {
            state.verificationLoading = true;
            state.verificationError = null;
            state.verificationRequest = request;
          });

          try {
            const result = await SocietyService.verifySociety(request);

            set((state) => {
              state.verificationLoading = false;

              if (result.success && result.data) {
                state.verificationResponse = result.data;

                if (result.data.success && result.data.data) {
                  // Society found and verified
                  state.selectedSociety = result.data.data.society;

                  // if (result.data.data.userAssociation) {
                  //   state.userAssociations = [result.data.data.userAssociation];
                  //   state.hasExistingAssociations = true;
                  // }

                  // Auto-advance to next step based on verification result
                  if (result.data.data.society) {
                    get().goToStep('details');
                  } else {
                    get().goToStep('completion');
                  }
                } else {
                  // Society not found, go to search
                  state.verificationError =
                    result.data.error?.message || 'Society not found';
                  get().goToStep('search');
                }
              } else {
                state.verificationError = result.error || 'Verification failed';
              }
            });

            // Return the result for UI handling
            return result;
          } catch (error: any) {
            set((state) => {
              state.verificationLoading = false;
              state.verificationError = error.message || 'Network error';
            });
            throw error;
          }
        },

        clearVerification: () =>
          set((state) => {
            state.verificationRequest = null;
            state.verificationResponse = null;
            state.verificationError = null;
          }),

        // Search actions
        setSearchRequest: (request: SocietySearchRequest) =>
          set((state) => {
            state.searchRequest = request;
          }),

        searchSocieties: async (
          request: SocietySearchRequest,
          append = false,
        ) => {
          console.log('🏪 Store: Starting society search', { request, append });

          set((state) => {
            state.searchLoading = true;
            state.searchError = null;
            state.searchRequest = request;

            if (!append) {
              state.searchResults = [];
              state.searchTotal = 0;
            }
          });

          try {
            const result = await SocietyService.searchSocieties(request);
            console.log('🏪 Store: Search API result', result);

            set((state) => {
              state.searchLoading = false;

              if (result.success && result.data?.success && result.data.data) {
                const { societies, total, hasMore } = result.data.data;
                console.log('🏪 Store: Updating search results', {
                  societies,
                  total,
                  hasMore,
                });

                if (append) {
                  state.searchResults.push(...societies);
                } else {
                  state.searchResults = societies;
                }

                state.searchTotal = total;
                state.searchHasMore = hasMore;
              } else {
                const errorMsg =
                  result.error ||
                  result.data?.error?.message ||
                  'Search failed';
                console.log('🏪 Store: Search failed', errorMsg);
                state.searchError = errorMsg;
              }
            });

            // Return the result for UI handling
            return result;
          } catch (error: any) {
            console.error('🏪 Store: Search error', error);

            set((state) => {
              state.searchLoading = false;
              state.searchError = error.message || 'Network error';
            });

            throw error;
          }
        },

        loadMoreResults: async () => {
          const state = get();
          if (
            !state.searchHasMore ||
            state.searchLoading ||
            !state.searchRequest
          ) {
            return;
          }

          const nextPageRequest = {
            ...state.searchRequest,
            pagination: {
              ...state.searchRequest.pagination,
              page: (state.searchRequest.pagination?.page || 1) + 1,
            },
          };

          await get().searchSocieties(nextPageRequest, true);
        },

        clearSearch: () =>
          set((state) => {
            state.searchRequest = null;
            state.searchResults = [];
            state.searchError = null;
            state.searchHasMore = false;
            state.searchTotal = 0;
          }),

        // Selection actions
        selectSociety: (society: SocietyInfo) =>
          set((state) => {
            state.selectedSociety = society;
            get().goToStep('details');
          }),

        loadSocietyDetails: async (societyId: string) => {
          set((state) => {
            state.societyDetailsLoading = true;
            state.societyDetailsError = null;
          });

          try {
            const result = await SocietyService.loadSocietyDetails(societyId);

            set((state) => {
              state.societyDetailsLoading = false;

              if (result.success && result.data) {
                state.selectedSociety = result.data;
              } else {
                state.societyDetailsError =
                  result.error || 'Failed to load society details';
              }
            });
          } catch (error: any) {
            set((state) => {
              state.societyDetailsLoading = false;
              state.societyDetailsError = error.message || 'Network error';
            });
          }
        },

        clearSelection: () =>
          set((state) => {
            state.selectedSociety = null;
            state.societyDetailsError = null;
          }),

        // Form data actions
        updateUserProfile: (profile) =>
          set((state) => {
            Object.assign(state.userProfile, profile);
          }),

        updateResidenceDetails: (details) =>
          set((state) => {
            Object.assign(state.residenceDetails, details);
          }),

        addEmergencyContact: (contact) =>
          set((state) => {
            state.emergencyContacts.push(contact);
          }),

        updateEmergencyContact: (index, contact) =>
          set((state) => {
            if (state.emergencyContacts[index]) {
              state.emergencyContacts[index] = contact;
            }
          }),

        removeEmergencyContact: (index) =>
          set((state) => {
            state.emergencyContacts.splice(index, 1);
          }),

        addVehicleDetails: (vehicle) =>
          set((state) => {
            state.vehicleDetails.push(vehicle);
          }),

        updateVehicleDetails: (index, vehicle) =>
          set((state) => {
            if (state.vehicleDetails[index]) {
              state.vehicleDetails[index] = vehicle;
            }
          }),

        removeVehicleDetails: (index) =>
          set((state) => {
            state.vehicleDetails.splice(index, 1);
          }),

        addFamilyMember: (member) =>
          set((state) => {
            state.familyMembers.push(member);
          }),

        updateFamilyMember: (index, member) =>
          set((state) => {
            if (state.familyMembers[index]) {
              state.familyMembers[index] = member;
            }
          }),

        removeFamilyMember: (index) =>
          set((state) => {
            state.familyMembers.splice(index, 1);
          }),

        updateAdditionalInfo: (info) =>
          set((state) => {
            Object.assign(state.additionalInfo, info);
          }),

        updateConsentAgreements: (consents) =>
          set((state) => {
            Object.assign(state.consentAgreements, consents);
          }),

        // Validation actions
        validateStep: (step: OnboardingStep) => {
          const state = get();
          const errors = get().getStepValidationErrors(step);

          // Update validation errors
          set((draft) => {
            draft.validationErrors = {
              ...draft.validationErrors,
              ...errors.reduce(
                (acc, error) => {
                  acc[error] = error;
                  return acc;
                },
                {} as Record<string, string>,
              ),
            };
          });

          return errors.length === 0;
        },

        setValidationError: (field, error) =>
          set((state) => {
            state.validationErrors[field] = error;
          }),

        clearValidationError: (field) =>
          set((state) => {
            delete state.validationErrors[field];
          }),

        clearAllValidationErrors: () =>
          set((state) => {
            state.validationErrors = {};
          }),

        // Submission actions
        submitJoinRequest: async () => {
          const state = get();

          // Final validation
          if (!get().validateStep('review')) {
            return;
          }

          set((draft) => {
            draft.submitLoading = true;
            draft.submitError = null;
          });

          try {
            const onboardingData = get().getOnboardingData();
            const result = await SocietyService.submitSocietyJoinRequest(
              onboardingData as SocietyJoinRequest,
            );

            set((draft) => {
              draft.submitLoading = false;

              if (result.success && result.data) {
                draft.submitResponse = result.data;

                if (result.data.success && result.data.data) {
                  // Update user associations
                  draft.userAssociations.push(result.data.data.association);
                  draft.hasExistingAssociations = true;

                  // Go to completion step
                  get().completeStep('review');
                  get().goToStep('completion');
                } else {
                  draft.submitError =
                    result.data.error?.message || 'Submission failed';
                }
              } else {
                draft.submitError = result.error || 'Submission failed';
              }
            });
          } catch (error: any) {
            set((state) => {
              state.submitLoading = false;
              state.submitError = error.message || 'Network error';
            });
          }
        },

        retrySubmission: async () => {
          await get().submitJoinRequest();
        },

        // Association management
        setUserAssociations: (associations) =>
          set((state) => {
            state.userAssociations = associations;
            state.hasExistingAssociations = associations.length > 0;
          }),

        checkExistingAssociations: async (phoneNumber: string) => {
          try {
            const result =
              await SocietyService.checkSocietyAssociation(phoneNumber);

            if (result.success && result.data) {
              set((state) => {
                state.userAssociations = result.data.associations;
                state.hasExistingAssociations = result.data.hasAssociation;

                if (result.data.hasAssociation) {
                  // User has existing associations, skip onboarding
                  get().goToStep('completion');
                } else {
                  // No associations, start onboarding
                  get().goToStep('verification');
                }
              });
            }
          } catch (error: any) {
            console.warn('Failed to check existing associations:', error);
          }
        },

        // Utility actions
        getOnboardingData: (): Partial<SocietyJoinRequest> => {
          const state = get();

          if (!state.selectedSociety) {
            return {};
          }

          return {
            societyId: state.selectedSociety.id,
            societyCode: state.selectedSociety.code,
            userProfile: state.userProfile,
            residenceDetails: state.residenceDetails,
            emergencyContacts: state.emergencyContacts,
            additionalInfo: {
              vehicleDetails: state.vehicleDetails,
              familyMembers: state.familyMembers,
              specialRequirements: state.additionalInfo.specialRequirements,
              previousAddress: state.additionalInfo.previousAddress,
            },
            consentAgreements: state.consentAgreements,
          };
        },

        loadSavedState: () => {
          // Implementation depends on your storage mechanism
          // This would load from SecureStorage if needed
        },

        saveCurrentState: () => {
          // Save current state to SecureStorage
          const state = get();
          SocietyService.setOnboardingState({
            currentStep: state.currentStep,
            selectedSociety: state.selectedSociety,
            onboardingData: get().getOnboardingData(),
            progress: state.progress,
            errors: state.validationErrors,
            loading: false,
          });
        },

        isStepCompleted: (step: OnboardingStep) => {
          const state = get();
          return state.progress.completedSteps.includes(step);
        },

        getStepValidationErrors: (step: OnboardingStep): string[] => {
          const state = get();
          const errors: string[] = [];

          switch (step) {
            case 'verification':
              if (!state.verificationRequest?.phoneNumber) {
                errors.push('Phone number is required');
              }
              break;

            case 'search':
              if (!state.searchRequest && state.searchResults.length === 0) {
                errors.push('Please search for societies');
              }
              break;

            case 'selection':
              if (!state.selectedSociety) {
                errors.push('Please select a society');
              }
              break;

            case 'details':
              if (!state.userProfile.fullName) {
                errors.push('Full name is required');
              }
              if (!state.residenceDetails.flatNumber) {
                errors.push('Flat number is required');
              }
              if (!state.residenceDetails.moveInDate) {
                errors.push('Move-in date is required');
              }
              break;

            case 'profile':
              if (state.emergencyContacts.length === 0) {
                errors.push('At least one emergency contact is required');
              }
              break;

            case 'review':
              if (!state.consentAgreements.termsAndConditions) {
                errors.push('Terms and conditions must be accepted');
              }
              if (!state.consentAgreements.privacyPolicy) {
                errors.push('Privacy policy must be accepted');
              }
              if (!state.consentAgreements.societyRules) {
                errors.push('Society rules must be accepted');
              }
              break;
          }

          return errors;
        },
      })),
      {
        name: 'society-onboarding-storage',
        storage: {
          ...createStorageManager('SocietyOnboardingStore'),
          // Override setItem and getItem to ensure proper serialization
          setItem: async (key: string, value: any) => {
            const storage = createStorageManager('SocietyOnboardingStore');
            const serializedValue = safeStringify(value);
            return storage.setItem(key, serializedValue);
          },
          getItem: async (key: string) => {
            const storage = createStorageManager('SocietyOnboardingStore');
            const value = await storage.getItem(key);
            return value ? safeParse(value) : null;
          },
        } as any,
        partialize: (state: SocietyOnboardingStore) => {
          // Create a clean serializable state object
          const cleanState = {
            currentStep: state.currentStep,
            progress: state.progress,
            selectedSociety: state.selectedSociety,
            userProfile: state.userProfile,
            residenceDetails: state.residenceDetails,
            emergencyContacts: state.emergencyContacts,
            vehicleDetails: state.vehicleDetails,
            familyMembers: state.familyMembers,
            additionalInfo: state.additionalInfo,
            consentAgreements: state.consentAgreements,
            userAssociations: state.userAssociations,
            hasExistingAssociations: state.hasExistingAssociations,
          };

          // Ensure all nested objects are serializable
          return JSON.parse(safeStringify(cleanState));
        },
        // Serialization is handled by our custom storage wrapper
      },
    ),
    { name: 'SocietyOnboardingStore' },
  ),
);

// Selector hooks for optimized re-renders
export const useSocietyOnboardingFlow = () =>
  useSocietyOnboardingStore((state) => ({
    currentStep: state.currentStep,
    progress: state.progress,
    canGoBack: state.canGoBack,
    canGoNext: state.canGoNext,
  }));

export const useSocietyVerification = () =>
  useSocietyOnboardingStore((state) => ({
    request: state.verificationRequest,
    response: state.verificationResponse,
    loading: state.verificationLoading,
    error: state.verificationError,
  }));

export const useSocietySearch = () =>
  useSocietyOnboardingStore((state) => ({
    request: state.searchRequest,
    results: state.searchResults,
    loading: state.searchLoading,
    error: state.searchError,
    hasMore: state.searchHasMore,
    total: state.searchTotal,
  }));

export const useSocietySelection = () =>
  useSocietyOnboardingStore((state) => ({
    selectedSociety: state.selectedSociety,
    loading: state.societyDetailsLoading,
    error: state.societyDetailsError,
  }));

export const useSocietyOnboardingData = () =>
  useSocietyOnboardingStore((state) => ({
    userProfile: state.userProfile,
    residenceDetails: state.residenceDetails,
    emergencyContacts: state.emergencyContacts,
    vehicleDetails: state.vehicleDetails,
    familyMembers: state.familyMembers,
    additionalInfo: state.additionalInfo,
    consentAgreements: state.consentAgreements,
  }));

export const useSocietyOnboardingSubmission = () =>
  useSocietyOnboardingStore((state) => ({
    loading: state.submitLoading,
    error: state.submitError,
    response: state.submitResponse,
  }));

export const useSocietyOnboardingActions = () => {
  // Using direct selectors to ensure we get the latest actions
  const goToStep = useSocietyOnboardingStore((state) => state.goToStep);
  const nextStep = useSocietyOnboardingStore((state) => state.nextStep);
  const previousStep = useSocietyOnboardingStore((state) => state.previousStep);
  const resetFlow = useSocietyOnboardingStore((state) => state.resetFlow);
  const verifySociety = useSocietyOnboardingStore(
    (state) => state.verifySociety,
  );
  const searchSocieties = useSocietyOnboardingStore(
    (state) => state.searchSocieties,
  );
  const loadMoreResults = useSocietyOnboardingStore(
    (state) => state.loadMoreResults,
  );
  const clearSearch = useSocietyOnboardingStore((state) => state.clearSearch);
  const selectSociety = useSocietyOnboardingStore(
    (state) => state.selectSociety,
  );
  const updateUserProfile = useSocietyOnboardingStore(
    (state) => state.updateUserProfile,
  );
  const updateResidenceDetails = useSocietyOnboardingStore(
    (state) => state.updateResidenceDetails,
  );
  const addEmergencyContact = useSocietyOnboardingStore(
    (state) => state.addEmergencyContact,
  );
  const updateEmergencyContact = useSocietyOnboardingStore(
    (state) => state.updateEmergencyContact,
  );
  const removeEmergencyContact = useSocietyOnboardingStore(
    (state) => state.removeEmergencyContact,
  );
  const updateConsentAgreements = useSocietyOnboardingStore(
    (state) => state.updateConsentAgreements,
  );
  const validateStep = useSocietyOnboardingStore((state) => state.validateStep);
  const submitJoinRequest = useSocietyOnboardingStore(
    (state) => state.submitJoinRequest,
  );
  const retrySubmission = useSocietyOnboardingStore(
    (state) => state.retrySubmission,
  );

  return useMemo(
    () => ({
      goToStep,
      nextStep,
      previousStep,
      resetFlow,
      verifySociety,
      searchSocieties,
      loadMoreResults,
      clearSearch,
      selectSociety,
      updateUserProfile,
      updateResidenceDetails,
      addEmergencyContact,
      updateEmergencyContact,
      removeEmergencyContact,
      updateConsentAgreements,
      validateStep,
      submitJoinRequest,
      retrySubmission,
    }),
    [
      goToStep,
      nextStep,
      previousStep,
      resetFlow,
      verifySociety,
      searchSocieties,
      loadMoreResults,
      clearSearch,
      selectSociety,
      updateUserProfile,
      updateResidenceDetails,
      addEmergencyContact,
      updateEmergencyContact,
      removeEmergencyContact,
      updateConsentAgreements,
      validateStep,
      submitJoinRequest,
      retrySubmission,
    ],
  );
};
