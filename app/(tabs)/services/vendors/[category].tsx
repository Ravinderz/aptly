import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, TextInput, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Phone, 
  MessageCircle, 
  MapPin,
  Clock,
  Shield,
  Filter,
  SortAsc
} from 'lucide-react-native';

// Mock vendor data - in production this would come from Supabase
const mockVendors = {
  plumbing: [
    {
      id: '1',
      name: 'Rajesh Plumbing Services',
      rating: 4.8,
      reviewCount: 124,
      phone: '+91 98765 43210',
      specializations: ['Bathroom Fitting', 'Pipeline Repair', 'Water Tank'],
      priceRange: '₹200-400/hour',
      distance: '0.5 km',
      availability: 'Available',
      verified: true,
      image: null,
      experience: '8 years',
      responseTime: '< 30 min',
      description: 'Expert in bathroom renovations and water system repairs. Available for emergency services.',
    },
    {
      id: '2', 
      name: 'Modern Plumbers Co.',
      rating: 4.5,
      reviewCount: 89,
      phone: '+91 97654 32109',
      specializations: ['Kitchen Plumbing', 'Drainage', 'Water Heater'],
      priceRange: '₹250-500/hour',
      distance: '1.2 km',
      availability: 'Busy',
      verified: true,
      image: null,
      experience: '12 years',
      responseTime: '< 1 hour',
      description: 'Professional plumbing services with modern equipment and techniques.',
    },
    {
      id: '3',
      name: 'Quick Fix Plumbing',
      rating: 4.2,
      reviewCount: 67,
      phone: '+91 96543 21098',
      specializations: ['Emergency Repairs', 'Leak Detection', 'Pipe Installation'],
      priceRange: '₹180-350/hour',
      distance: '2.1 km',
      availability: 'Available',
      verified: false,
      image: null,
      experience: '5 years',
      responseTime: '< 45 min',
      description: 'Fast and reliable plumbing solutions for residential properties.',
    }
  ],
  electrical: [
    {
      id: '4',
      name: 'PowerTech Electricians',
      rating: 4.9,
      reviewCount: 156,
      phone: '+91 95432 10987',
      specializations: ['Home Wiring', 'AC Installation', 'Solar Systems'],
      priceRange: '₹300-600/hour',
      distance: '0.8 km',
      availability: 'Available',
      verified: true,
      image: null,
      experience: '15 years',
      responseTime: '< 20 min',
      description: 'Licensed electricians specializing in residential and commercial electrical work.',
    },
    {
      id: '5',
      name: 'City Electrical Services',
      rating: 4.4,
      reviewCount: 92,
      phone: '+91 94321 09876',
      specializations: ['Switch Boards', 'Fan Installation', 'Lighting'],
      priceRange: '₹250-450/hour',
      distance: '1.5 km',
      availability: 'Available',
      verified: true,
      image: null,
      experience: '10 years',
      responseTime: '< 40 min',
      description: 'Expert electrical services with safety-first approach and quality materials.',
    }
  ],
  // Add more categories as needed
};

const categoryTitles = {
  plumbing: 'Plumbing Services',
  electrical: 'Electrical Services',
  'home-services': 'Home Services',
  'ac-appliances': 'AC & Appliances',
  delivery: 'Delivery & Logistics',
  security: 'Security Services',
  gardening: 'Gardening & Landscaping',
  vehicle: 'Vehicle Services',
};

interface VendorCardProps {
  vendor: any;
  onPress: () => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onPress }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${vendor.phone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${vendor.phone.replace(/\s/g, '')}&text=Hi, I found your contact through Aptly app. I need help with plumbing services.`);
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'text-secondary';
      case 'Busy':
        return 'text-warning';
      case 'Offline':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface rounded-xl p-4 mb-4 border border-divider shadow-sm shadow-black/5"
      activeOpacity={0.7}
    >
      {/* Vendor Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-headline-medium font-semibold text-text-primary mr-2">
              {vendor.name}
            </Text>
            {vendor.verified && (
              <Shield size={16} color="#4CAF50" />
            )}
          </View>
          
          <View className="flex-row items-center mb-2">
            <View className="flex-row items-center mr-4">
              <Star size={14} color="#FF9800" fill="#FF9800" />
              <Text className="text-body-medium font-semibold text-text-primary ml-1">
                {vendor.rating}
              </Text>
              <Text className="text-body-medium text-text-secondary ml-1">
                ({vendor.reviewCount})
              </Text>
            </View>
            <View className="flex-row items-center">
              <MapPin size={14} color="#757575" />
              <Text className="text-body-medium text-text-secondary ml-1">
                {vendor.distance}
              </Text>
            </View>
          </View>

          <Text className={`text-body-medium font-medium ${getAvailabilityColor(vendor.availability)}`}>
            ● {vendor.availability}
          </Text>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleCall}
            className="bg-primary rounded-full w-10 h-10 items-center justify-center"
          >
            <Phone size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleWhatsApp}
            className="bg-secondary rounded-full w-10 h-10 items-center justify-center"
          >
            <MessageCircle size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Specializations */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {vendor.specializations.slice(0, 3).map((spec: string, index: number) => (
          <View key={index} className="bg-primary/10 rounded-full px-3 py-1">
            <Text className="text-label-large text-primary">
              {spec}
            </Text>
          </View>
        ))}
      </View>

      {/* Details Row */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-body-medium text-text-secondary">
          {vendor.priceRange}
        </Text>
        <Text className="text-body-medium text-text-secondary">
          Exp: {vendor.experience}
        </Text>
        <View className="flex-row items-center">
          <Clock size={12} color="#757575" />
          <Text className="text-body-medium text-text-secondary ml-1">
            {vendor.responseTime}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text className="text-body-medium text-text-secondary" numberOfLines={2}>
        {vendor.description}
      </Text>
    </TouchableOpacity>
  );
};

export default function VendorCategory() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');
  const [filterAvailable, setFilterAvailable] = useState(false);

  // Get vendors for this category
  const categoryVendors = mockVendors[category as keyof typeof mockVendors] || [];
  
  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let filtered = categoryVendors;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.specializations.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Availability filter
    if (filterAvailable) {
      filtered = filtered.filter(vendor => vendor.availability === 'Available');
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'price':
          const aPrice = parseInt(a.priceRange.split('-')[0].replace('₹', ''));
          const bPrice = parseInt(b.priceRange.split('-')[0].replace('₹', ''));
          return aPrice - bPrice;
        default:
          return 0;
      }
    });

    return filtered;
  }, [categoryVendors, searchQuery, sortBy, filterAvailable]);

  const handleVendorPress = (vendorId: string) => {
    router.push(`/services/vendors/${category}/${vendorId}`);
  };

  const categoryTitle = categoryTitles[category as keyof typeof categoryTitles] || 'Services';

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-headline-large font-semibold text-text-primary">
            {categoryTitle}
          </Text>
          <Text className="text-body-medium text-text-secondary">
            {filteredVendors.length} vendors available
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Search and Filters */}
        <View className="px-4 py-4">
          {/* Search Bar */}
          <View className="flex-row items-center bg-surface rounded-xl border border-divider px-4 py-3 mb-4">
            <Search size={20} color="#757575" />
            <TextInput
              className="flex-1 ml-3 text-body-large text-text-primary"
              placeholder="Search vendors or services..."
              placeholderTextColor="#757575"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter and Sort Row */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setFilterAvailable(!filterAvailable)}
              className={`flex-row items-center px-4 py-2 rounded-lg border ${
                filterAvailable 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-surface border-divider'
              }`}
            >
              <Filter size={16} color={filterAvailable ? "#6366f1" : "#757575"} />
              <Text className={`ml-2 text-body-medium font-medium ${
                filterAvailable ? 'text-primary' : 'text-text-secondary'
              }`}>
                Available Only
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <Text className="text-body-medium text-text-secondary">Sort by:</Text>
              <TouchableOpacity
                onPress={() => setSortBy(sortBy === 'rating' ? 'distance' : sortBy === 'distance' ? 'price' : 'rating')}
                className="flex-row items-center px-3 py-2 rounded-lg bg-surface border border-divider"
              >
                <SortAsc size={16} color="#757575" />
                <Text className="ml-2 text-body-medium text-text-primary capitalize">
                  {sortBy}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Vendors List */}
        <View className="px-4">
          {filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onPress={() => handleVendorPress(vendor.id)}
              />
            ))
          ) : (
            <View className="items-center py-8">
              <Text className="text-headline-medium text-text-secondary mb-2">
                No vendors found
              </Text>
              <Text className="text-body-medium text-text-secondary text-center">
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}