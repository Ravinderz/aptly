/**
 * Society Search Flow - Search and select society
 *
 * Allows users to search for societies by:
 * 1. Name/text search
 * 2. Location-based search
 * 3. Browse nearby societies
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
  useSocietySearch,
} from '@/stores/slices/societyOnboardingStore';
import type { SocietyInfo } from '@/types/society';
import { showErrorAlert } from '@/utils/alert';
import { responsive } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React, { useState, useCallback, useMemo } from 'react';
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

// Search form validation
const searchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
});

type SearchForm = z.infer<typeof searchSchema>;

export default function SocietySearchFlow() {
  const router = useRouter();
  
  // Simplified state to avoid re-render loops
  const [searchMode, setSearchMode] = useState<'text' | 'location' | null>(null);

  // Simple store selectors without memoization to avoid loops
  const phoneNumber = useSocietyOnboardingStore((state) => state.userProfile?.phoneNumber);
  const results = useSocietyOnboardingStore((state) => state.searchResults || []);
  const loading = useSocietyOnboardingStore((state) => state.searchLoading || false);
  const error = useSocietyOnboardingStore((state) => state.searchError || null);
  const hasMore = useSocietyOnboardingStore((state) => state.searchHasMore || false);
  
  // Get actions directly
  const { searchSocieties, selectSociety, loadMoreResults } = useSocietyOnboardingActions();

  // // Check if phoneNumber is available, if not redirect back
  // React.useEffect(() => {
  //   if (!phoneNumber) {
  //     router.replace('/auth/phone-registration');
  //   }
  // }, [phoneNumber, router]);

  // Form validation for text search
  const {
    fields,
    errors,
    isValid,
    isSubmitting,
    getFieldProps,
    handleSubmit,
    setValue,
  } = useFormValidation<SearchForm>(
    searchSchema,
    { query: '' },
    {
      validateOnChange: false, // Only validate on blur, not during typing
      validateOnBlur: true,
      debounceMs: 300,
    },
  );

  const handleTextSearch = useCallback(async (formData: SearchForm) => {
    try {
      await searchSocieties({
        query: formData.query.trim(),
        pagination: { page: 1, limit: 20 },
      });
    } catch (error: any) {
      showErrorAlert('Error', error.message || 'Search failed');
    }
  }, [searchSocieties]);

  const handleLocationSearch = useCallback(async () => {
    // TODO: Implement location-based search
    // For now, show mock results based on location
    try {
      await searchSocieties({
        location: {
          latitude: 28.5355, // Delhi coordinates as example
          longitude: 77.391,
          radius: 5, // 5km radius
        },
        pagination: { page: 1, limit: 20 },
      });
    } catch (error: any) {
      showErrorAlert('Error', error.message || 'Location search failed');
    }
  }, [searchSocieties]);

  const handleSocietySelect = useCallback((society: SocietyInfo) => {
    selectSociety(society);
    // Navigate to details form - phoneNumber is already stored in Zustand
    router.push('/auth/society-details-form');
  }, [selectSociety, router]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMoreResults();
    }
  }, [hasMore, loading, loadMoreResults]);

  const renderSocietyItem = useCallback(({ item }: { item: SocietyInfo }) => (
    <TouchableOpacity
      onPress={() => handleSocietySelect(item)}
      className="bg-surface border border-divider rounded-xl p-4 mb-4"
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
            {item.address.city}, {item.address.state}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-text-secondary text-xs">
              {item.totalFlats} units • {item.code}
            </Text>
          </View>
        </View>
        <LucideIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  ), [handleSocietySelect]);

  const renderEmptyState = useCallback(() => (
    <View className="items-center py-12">
      <LucideIcons name="search-outline" size={48} color="#9CA3AF" />
      <Text className="text-text-secondary font-medium text-lg mt-4 mb-2">
        No societies found
      </Text>
      <Text className="text-text-secondary text-sm text-center">
        Try adjusting your search criteria or check the spelling
      </Text>
    </View>
  ), []);

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
          <Text className="text-xl font-bold text-text-primary">
            Find Your Society
          </Text>
        </View>

        <ResponsiveContainer
          type="scroll"
          padding="lg"
          keyboardAware={true}
          preventOverflow={true}>
          {/* Search Options */}
          {!searchMode && results.length === 0 && (
            <>
              <View className="items-center mb-8">
                <View
                  className="bg-primary/10 rounded-full items-center justify-center mb-4"
                  style={{
                    width: responsive.spacing(64),
                    height: responsive.spacing(64),
                  }}>
                  <LucideIcons
                    name="location-outline"
                    size={responsive.spacing(32)}
                    color="#6366f1"
                  />
                </View>
                <ResponsiveText
                  variant="display"
                  size="small"
                  className="font-bold mb-2 text-center">
                  Search Your Society
                </ResponsiveText>
                <ResponsiveText
                  variant="body"
                  size="medium"
                  className="text-text-secondary text-center">
                  Find your housing society by name or browse nearby societies
                </ResponsiveText>
              </View>

              {/* Text Search Option */}
              <TouchableOpacity
                onPress={() => setSearchMode('text')}
                className="bg-surface border border-divider rounded-xl p-6 mb-4"
                activeOpacity={0.8}>
                <View className="flex-row items-center">
                  <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mr-4">
                    <LucideIcons name="search" size={24} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold text-lg mb-1">
                      Search by Name
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      Enter your society or building name
                    </Text>
                  </View>
                  <LucideIcons name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              {/* Location Search Option */}
              <TouchableOpacity
                onPress={() => setSearchMode('location')}
                className="bg-surface border border-divider rounded-xl p-6 mb-6"
                activeOpacity={0.8}>
                <View className="flex-row items-center">
                  <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mr-4">
                    <LucideIcons
                      name="location-outline"
                      size={24}
                      color="#6366f1"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold text-lg mb-1">
                      Browse Nearby
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      Find societies near your location
                    </Text>
                  </View>
                  <LucideIcons name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* Text Search Input */}
          {(searchMode === 'text' || results.length > 0) && (
            <View className="mb-6">
              <ValidatedInput
                label="Society Name"
                value={fields.query.value}
                onChangeText={(text) => setValue('query', text)}
                onBlur={getFieldProps('query').onBlur}
                error={errors.query}
                placeholder="e.g., Green Valley Apartments, DLF Phase 1"
                autoFocus={searchMode === 'text'}
                helperText="Enter the full or partial name of your society"
                onSubmitEditing={useCallback(() => handleSubmit(handleTextSearch), [handleSubmit, handleTextSearch])}
              />

              <Button
                onPress={useCallback(() => handleSubmit(handleTextSearch), [handleSubmit, handleTextSearch])}
                loading={isSubmitting || loading}
                disabled={!isValid || isSubmitting}
                className="mb-4">
                Search Societies
              </Button>
            </View>
          )}

          {/* Location Search */}
          {searchMode === 'location' && results.length === 0 && (
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setSearchMode(null)}
                className="flex-row items-center mb-4">
                <LucideIcons name="arrow-left" size={20} color="#6366f1" />
                <Text className="text-primary font-medium ml-2">
                  Back to search options
                </Text>
              </TouchableOpacity>

              <Text className="text-text-primary font-semibold text-lg mb-4">
                Browse Nearby Societies
              </Text>
              <Text className="text-text-secondary mb-6">
                We&apos;ll show you housing societies within a 5km radius of
                your location.
              </Text>

              <Button
                onPress={handleLocationSearch}
                loading={loading}
                className="mb-4">
                <View className="mr-2">
                  <LucideIcons
                    name="location-outline"
                    size={20}
                    color="#ffffff"
                  />
                </View>
                Find Nearby Societies
              </Button>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View className="bg-error/5 border border-error/20 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <LucideIcons name="alert-circle" size={20} color="#EF4444" />
                <Text className="text-error font-semibold ml-2">
                  Search Failed
                </Text>
              </View>
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-text-primary font-semibold text-lg">
                  Search Results
                </Text>
                {searchMode && (
                  <TouchableOpacity
                    onPress={() => setSearchMode(null)}
                    className="flex-row items-center">
                    <Text className="text-primary text-sm mr-1">
                      New search
                    </Text>
                    <LucideIcons name="search" size={16} color="#6366f1" />
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={results}
                renderItem={renderSocietyItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmptyState}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                  hasMore && loading ? (
                    <View className="py-4 items-center">
                      <ActivityIndicator size="small" color="#6366f1" />
                    </View>
                  ) : null
                }
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Help Section */}
          <View className="bg-primary/5 rounded-xl p-4 mt-4">
            <Text className="text-primary font-semibold mb-2">Search Tips</Text>
            <Text className="text-text-secondary text-sm leading-5">
              • Try different variations of your society name{'\n'}• Include
              locality or area name for better results{'\n'}• Check with your
              society management if you can&apos;t find it
            </Text>
          </View>
        </ResponsiveContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
