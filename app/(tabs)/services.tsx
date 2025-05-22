import React from 'react';
import { Text, View, ScrollView, FlatList, Dimensions, TouchableOpacity } from "react-native"; // Removed StyleSheet
import { Ionicons } from '@expo/vector-icons';
import AptlySearchBar from '../../../components/ui/AptlySearchBar';

const popularServices = [
  { id: '1', name: 'Plumbing', iconName: 'water-outline' },
  { id: '2', name: 'Electrician', iconName: 'flash-outline' },
  { id: '3', name: 'Cleaning', iconName: 'trash-bin-outline' },
  { id: '4', name: 'Repairs', iconName: 'build-outline' },
  { id: '5', name: 'Painting', iconName: 'color-palette-outline' },
  { id: '6', name: 'Gardening', iconName: 'leaf-outline' },
  { id: '7', name: 'Movers', iconName: 'move-outline' },
  { id: '8', name: 'Laundry', iconName: 'shirt-outline' },
  { id: '9', name: 'Pest Control', iconName: 'bug-outline' },
];

const PRIMARY_COLOR = '#16519f';
const GRID_ITEM_TEXT_COLOR = '#6B7280'; // gray-500
const GRID_ITEM_BACKGROUND_COLOR = '#16519f1A'; // Primary with 10% opacity

// Calculate item size for 3 columns
const screenWidth = Dimensions.get('window').width;
const numColumns = 3;
const itemMargin = 5; // Used in calculations and NativeWind m-[5px]
// Adjusted calculation for itemWidth to be more precise with margins
// Each item has margin on left and right (total 2*itemMargin).
// There are numColumns items. Total margin for items = numColumns * 2 * itemMargin.
// This doesn't account for the fact that margins collapse or how FlatList distributes.
// A common approach: ScreenWidth = (itemWidth * numColumns) + (itemMargin * (numColumns + 1) * 2) (if margin is on all sides + padding)
// Let's stick to: itemWidth = (screenWidth - totalPaddingOrMarginAroundGrid) / numColumns
// If grid has horizontal padding P, and items have margin M:
// ScreenWidth = P_left + P_right + (itemWidth * numColumns) + (M * (numColumns-1) * 2 for inner items)
// This is complex. The previous itemWidth calculation might be okay if FlatList's columnWrapperStyle handles spacing.
// For NativeWind, we give items margin, and the FlatList itself some padding.
// Let FlatList container have padding equivalent to one itemMargin on each side.
const flatListPadding = itemMargin;
const availableWidth = screenWidth - (flatListPadding * 2);
const itemWidth = (availableWidth - (itemMargin * (numColumns - 1) * 2)) / numColumns;


export default function ServicesScreen() {
  const renderGridItem = ({ item }: { item: typeof popularServices[0] }) => (
    <View style={{ width: itemWidth }} className="bg-[#16519f1A] items-center justify-center rounded-lg p-4 m-[5px] aspect-square">
      <Ionicons name={item.iconName as any} size={32} color={PRIMARY_COLOR} />
      <Text className="text-gray-500 mt-2 text-center text-xs">{item.name}</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <AptlySearchBar placeholder="Search for services..." />
      <Text className="text-lg font-bold my-2.5 ml-4">Popular Services</Text>
      <FlatList
        data={popularServices}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        className="px-[5px]" // Padding for the FlatList container itself
        // columnWrapperStyle removed, item margins should handle spacing
        scrollEnabled={false} 
      />

      {/* Home Maintenance Section */}
      <Text className="text-lg font-bold my-2.5 ml-4">Home Maintenance</Text>
      {homeMaintenanceServices.map(item => renderServiceListItem(item))}

      {/* Beauty & Wellness Section */}
      <Text className="text-lg font-bold my-2.5 ml-4">Beauty & Wellness</Text>
      {beautyWellnessServices.map(item => renderServiceListItem(item))}

      {/* Emergency Services Section */}
      <Text className="text-lg font-bold my-2.5 ml-4">Emergency Services</Text>
      {emergencyServices.map(item => renderServiceListItem(item))}

    </ScrollView>
  );
}

// Placeholder data for new sections (remains the same)
const homeMaintenanceServices = [
  { id: 'hm1', name: 'Appliance Repair', iconName: 'construct-outline' as const },
  { id: 'hm2', name: 'Home Cleaning', iconName: 'sparkles-outline' as const },
  { id: 'hm3', name: 'Pest Control', iconName: 'bug-outline' as const },
];

const beautyWellnessServices = [
  { id: 'bw1', name: 'Salon at Home', iconName: 'cut-outline' as const },
  { id: 'bw2', name: 'Spa Services', iconName: 'rose-outline' as const },
  { id: 'bw3', name: 'Yoga & Fitness', iconName: 'barbell-outline' as const },
];

const emergencyServices = [
  { id: 'es1', name: '24/7 Doctor', iconName: 'medkit-outline' as const },
  { id: 'es2', name: 'Ambulance', iconName: 'pulse-outline' as const },
  { id: 'es3', name: 'Security', iconName: 'shield-checkmark-outline' as const },
];

// Helper function to render list items
const renderServiceListItem = (item: { id: string; name: string; iconName: keyof typeof Ionicons.glyphMap }) => (
  <TouchableOpacity 
    key={item.id} 
    className="flex-row items-center py-3 px-5 bg-gray-100 mb-2 rounded-md mx-4 border-b border-gray-200"
  >
    <Ionicons name={item.iconName} size={24} color="#555" className="mr-4" />
    <Text className="text-base text-gray-700">{item.name}</Text>
  </TouchableOpacity>
);

// StyleSheet.create block is removed
