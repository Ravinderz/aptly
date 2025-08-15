/**
 * Unified Society Selection Screen
 * 
 * Simplified onboarding experience with:
 * - Toggle between society code and name/address search
 * - Real-time search results displayed inline
 * - Society selection with immediate confirmation
 * - Single screen without sub-navigation
 */
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { Button } from '@/components/ui/Button';
import LucideIcons from '@/components/ui/LucideIcons';
import {
  ResponsiveContainer,
  ResponsiveText,
} from '@/components/ui/ResponsiveContainer';
import { useFormValidation } from '@/hooks/useFormValidation';
import {
  useSocietyOnboardingActions,
  useSocietyOnboardingStore,
} from '@/stores/slices/societyOnboardingStore';
import type { SocietyInfo } from '@/types/society';
import { showErrorAlert } from '@/utils/alert';
import { responsive } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

// Validation schemas
const codeSearchSchema = z.object({
  societyCode: z
    .string()
    .min(4, 'Society code must be at least 4 characters')
    .max(12, 'Society code cannot exceed 12 characters')
    .regex(/^[A-Z0-9]+$/i, 'Society code can only contain letters and numbers'),
});

const nameSearchSchema = z.object({
  societyName: z
    .string()
    .min(2, 'Society name must be at least 2 characters')
    .max(100, 'Society name cannot exceed 100 characters'),
});

type CodeSearchForm = z.infer<typeof codeSearchSchema>;
type NameSearchForm = z.infer<typeof nameSearchSchema>;

export default function SocietySelection() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<'code' | 'name'>('code');
  const [selectedSociety, setSelectedSociety] = useState<SocietyInfo | null>(null);

  // Debug logging
  console.log('🏠 Society Selection rendered', {
    searchMode,
    selectedSociety: selectedSociety?.name,
  });

  // Store hooks - using proper selectors
  const searchResults = useSocietyOnboardingStore((state) => state.searchResults);
  const searchLoading = useSocietyOnboardingStore((state) => state.searchLoading);
  const searchError = useSocietyOnboardingStore((state) => state.searchError);
  const searchTotal = useSocietyOnboardingStore((state) => state.searchTotal);

  // Debug store state
  console.log('🏪 Store state:', {
    searchResults: searchResults?.length || 0,
    searchLoading,
    searchError,
    searchTotal,
  });
  
  const { searchSocieties, verifySociety, selectSociety, clearSearch } = useSocietyOnboardingActions();

  // Form validation for code search
  const codeForm = useFormValidation<CodeSearchForm>(
    codeSearchSchema,
    { societyCode: '' },
    {
      validateOnChange: false,
      validateOnBlur: true,
      debounceMs: 300,
    },
  );

  // Form validation for name search
  const nameForm = useFormValidation<NameSearchForm>(
    nameSearchSchema,
    { societyName: '' },
    {
      validateOnChange: false,
      validateOnBlur: true,
      debounceMs: 500, // Longer debounce for search
    },
  );

  // Get current form based on search mode
  const currentForm = searchMode === 'code' ? codeForm : nameForm;

  // Handle search mode toggle
  const handleSearchModeChange = useCallback((mode: 'code' | 'name') => {
    setSearchMode(mode);
    setSelectedSociety(null);
    // Clear form data when switching modes
    if (mode === 'code') {
      nameForm.fields.societyName.value && nameForm.setValue?.('societyName', '');
    } else {
      codeForm.fields.societyCode.value && codeForm.setValue?.('societyCode', '');
    }
  }, [codeForm, nameForm]);

  // Handle code-based verification
  const handleCodeVerification = useCallback(async (formData: CodeSearchForm) => {
    try {
      const result = await verifySociety({
        phoneNumber: '', // Will be handled by store
        societyCode: formData.societyCode.toUpperCase(),
      });
      
      if (result && result.society) {
        setSelectedSociety(result.society);
      }
    } catch (error: any) {
      showErrorAlert('Error', error.message || 'Failed to verify society code');
    }
  }, [verifySociety]);

  // Handle name-based search
  const handleNameSearch = useCallback(async (formData: NameSearchForm) => {
    const searchQuery = formData.societyName.trim();
    
    if (searchQuery.length < 2) {
      console.log('⏭️ Search query too short:', searchQuery);
      return;
    }
    
    try {
      console.log('🚀 Starting search for:', searchQuery);
      console.log('🔗 Search function available:', typeof searchSocieties);
      
      const searchRequest = {
        query: searchQuery,
        pagination: { page: 1, limit: 10 },
      };
      
      console.log('📤 Search request:', searchRequest);
      const result = await searchSocieties(searchRequest);
      console.log('✅ Search completed:', result);
      
      if (result && !result.success) {
        console.log('⚠️ Search returned unsuccessful result:', result.error);
      }
    } catch (error: any) {
      console.error('❌ Search error:', error);
      showErrorAlert('Error', error.message || 'Search failed');
    }
  }, [searchSocieties]);

  // Handle society selection from search results
  const handleSocietySelect = useCallback((society: SocietyInfo) => {
    setSelectedSociety(society);
  }, []);

  // Handle continue to next screen
  const handleContinue = useCallback(() => {
    if (!selectedSociety) return;
    
    selectSociety(selectedSociety);
    router.push('/auth/society-profile-complete');
  }, [selectedSociety, selectSociety, router]);

  // Auto-search when name input changes with debouncing
  useEffect(() => {
    if (searchMode === 'name') {
      const searchValue = nameForm.fields.societyName.value.trim();
      
      if (searchValue.length >= 2) {
        const timeoutId = setTimeout(() => {
          console.log('🔍 Auto-search triggered for:', searchValue);
          handleNameSearch({ societyName: searchValue });
        }, 500);
        
        return () => clearTimeout(timeoutId);
      } else if (searchValue.length === 0) {
        // Clear results when search is empty
        console.log('🧹 Clearing search results');
        clearSearch();
      }
    }
  }, [searchMode, nameForm.fields.societyName.value, handleNameSearch, clearSearch]);

  // Render society result item
  const renderSocietyItem = useCallback(({ item }: { item: SocietyInfo }) => (
    <TouchableOpacity
      onPress={() => handleSocietySelect(item)}
      className={`bg-surface border rounded-xl p-4 mb-3 ${
        selectedSociety?.id === item.id ? 'border-primary bg-primary/5' : 'border-divider'
      }`}
      activeOpacity={0.8}>
      <View className="flex-row items-start">
        <View className="bg-primary/10 rounded-lg w-12 h-12 items-center justify-center mr-3">
          <LucideIcons name="building" size={20} color="#6366f1" />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold text-lg mb-1">
            {item.name}
          </Text>
          <Text className="text-text-secondary text-sm mb-2">
            {item.address.street}, {item.address.city}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-text-secondary text-xs">
              {item.stats?.totalFlats || item.totalFlats || 'N/A'} units • Code: {item.code}
            </Text>
          </View>
        </View>
        {selectedSociety?.id === item.id && (
          <View className="bg-primary rounded-full w-6 h-6 items-center justify-center">
            <LucideIcons name="check" size={16} color="#ffffff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [selectedSociety, handleSocietySelect]);

  // Render selected society confirmation
  const renderSelectedSociety = () => {
    if (!selectedSociety) return null;

    return (
      <View className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
        <View className="flex-row items-center mb-2">
          <LucideIcons name="checkmark-circle" size={20} color="#10B981" />
          <Text className="text-success font-semibold ml-2">Society Selected</Text>
        </View>
        <Text className="text-text-primary font-semibold text-lg mb-1">
          {selectedSociety.name}
        </Text>
        <Text className="text-text-secondary text-sm">
          {selectedSociety.address.street}, {selectedSociety.address.city}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Header */}
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <LucideIcons name="arrow-left" size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary flex-1">
            Find Your Society
          </Text>
        </View>

        <ResponsiveContainer
          type="scroll"
          padding="lg"
          keyboardAware={true}
          preventOverflow={true}>
          
          {/* Welcome Section */}
          <View className="items-center mb-8">
            <View
              className="bg-primary/10 rounded-full items-center justify-center mb-4"
              style={{
                width: responsive.spacing(64),
                height: responsive.spacing(64),
              }}>
              <LucideIcons
                name="building"
                size={responsive.spacing(32)}
                color="#6366f1"
              />
            </View>
            <ResponsiveText
              variant="display"
              size="small"
              className="font-bold mb-2 text-center">
              Find Your Society
            </ResponsiveText>
            <ResponsiveText
              variant="body"
              size="medium"
              className="text-text-secondary text-center">
              Search by society code or name to get started
            </ResponsiveText>
          </View>

          {/* Search Mode Toggle */}
          <View className="bg-surface rounded-xl p-2 mb-6 flex-row">
            <TouchableOpacity
              onPress={() => handleSearchModeChange('code')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                searchMode === 'code' ? 'bg-primary' : 'bg-transparent'
              }`}
              activeOpacity={0.8}>
              <Text className={`text-center font-medium ${
                searchMode === 'code' ? 'text-white' : 'text-text-secondary'
              }`}>
                Society Code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSearchModeChange('name')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                searchMode === 'name' ? 'bg-primary' : 'bg-transparent'
              }`}
              activeOpacity={0.8}>
              <Text className={`text-center font-medium ${
                searchMode === 'name' ? 'text-white' : 'text-text-secondary'
              }`}>
                Society Name
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          {searchMode === 'code' ? (
            <View className="mb-6">
              <ValidatedInput
                label="Society Code"
                value={codeForm.fields.societyCode.value}
                onChangeText={(text) => codeForm.setValue('societyCode', text.toUpperCase())}
                onBlur={codeForm.getFieldProps('societyCode').onBlur}
                error={codeForm.errors.societyCode}
                placeholder="e.g., APT001, RES123"
                autoCapitalize="characters"
                maxLength={12}
                helperText="Enter the code provided by your society management"
                icon={<LucideIcons name="key-round" size={20} color="#6b7280" />}
              />
              <Button
                onPress={() => codeForm.handleSubmit(handleCodeVerification)}
                loading={codeForm.isSubmitting || searchLoading}
                disabled={!codeForm.isValid || codeForm.isSubmitting}
                className="mt-4">
                Verify Society Code
              </Button>
            </View>
          ) : (
            <View className="mb-6">
              <ValidatedInput
                label="Society Name or Address"
                value={nameForm.fields.societyName.value}
                onChangeText={(text) => nameForm.setValue('societyName', text)}
                onBlur={nameForm.getFieldProps('societyName').onBlur}
                error={nameForm.errors.societyName}
                placeholder="e.g., Green Valley Apartments, DLF Phase 1"
                maxLength={100}
                helperText="Enter society name or area for instant search"
                icon={<LucideIcons name="search" size={20} color="#6b7280" />}
              />
              
              {/* Debug Test Button */}
              {__DEV__ && nameForm.fields.societyName.value.length >= 2 && (
                <TouchableOpacity
                  onPress={() => {
                    console.log('🧪 Manual test search triggered');
                    handleNameSearch({ societyName: nameForm.fields.societyName.value });
                  }}
                  className="bg-blue-500 rounded-lg px-4 py-2 mt-2">
                  <Text className="text-white text-center font-medium">Test Search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Search Results */}
          {searchMode === 'name' && (
            <>
              {searchLoading && (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#6366f1" />
                  <Text className="text-text-secondary mt-2">Searching societies...</Text>
                  <Text className="text-text-secondary text-xs mt-1">Please wait while we find matching societies</Text>
                </View>
              )}

              {searchError && (
                <View className="bg-error/5 border border-error/20 rounded-xl p-4 mb-4">
                  <View className="flex-row items-center mb-2">
                    <LucideIcons name="alert-circle" size={20} color="#EF4444" />
                    <Text className="text-error font-semibold ml-2">Search Failed</Text>
                  </View>
                  <Text className="text-error text-sm mb-2">{searchError}</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      const searchValue = nameForm.fields.societyName.value.trim();
                      if (searchValue.length >= 2) {
                        handleNameSearch({ societyName: searchValue });
                      }
                    }}
                    className="bg-error/10 rounded-lg px-3 py-2 self-start">
                    <Text className="text-error text-sm font-medium">Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {searchResults && searchResults.length > 0 && (
                <View className="mb-6">
                  <Text className="text-text-primary font-semibold text-lg mb-4">
                    Search Results ({searchResults.length}{searchTotal && searchTotal > searchResults.length ? ` of ${searchTotal}` : ''})
                  </Text>
                  <FlatList
                    data={searchResults}
                    renderItem={renderSocietyItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              )}

              {!searchLoading && !searchError && searchResults && searchResults.length === 0 && nameForm.fields.societyName.value.trim().length >= 2 && (
                <View className="items-center py-8">
                  <LucideIcons name="search" size={48} color="#9CA3AF" />
                  <Text className="text-text-secondary font-medium text-lg mt-4 mb-2">
                    No societies found
                  </Text>
                  <Text className="text-text-secondary text-sm text-center px-4">
                    Try different search terms like society name, area, or landmark.{"\n"}Contact your society management if you can't find it.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Selected Society Confirmation */}
          {renderSelectedSociety()}

          {/* Continue Button */}
          {selectedSociety && (
            <Button
              onPress={handleContinue}
              className="mb-6">
              Continue with {selectedSociety.name}
            </Button>
          )}

          {/* Help Section */}
          <View className="bg-primary/5 rounded-xl p-4 mt-4">
            <Text className="text-primary font-semibold mb-2">Need Help?</Text>
            <Text className="text-text-secondary text-sm leading-5">
              • Society code is usually 4-12 characters long{'\n'}
              • Contact your society management for the code{'\n'}
              • Try searching by society name or area name{'\n'}
              • Check notice boards or society apps for this information
            </Text>
          </View>

          {/* Skip Option */}
          <View className="mt-8 pt-8 border-t border-divider">
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              className="items-center py-4">
              <Text className="text-text-secondary text-sm">
                I'll do this later
              </Text>
              <Text className="text-primary font-medium mt-1">
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}