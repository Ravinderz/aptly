import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, TextInput, Linking } from 'react-native';
import { showErrorAlert, showSuccessAlert, showAlert } from '@/utils/alert';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Star, 
  Phone, 
  MessageCircle, 
  MapPin,
  Clock,
  Shield,
  Camera,
  Calendar,
  DollarSign,
  Award,
  MessageSquare,
  ThumbsUp,
  User
} from 'lucide-react-native';

// Mock vendor details - in production this would come from Supabase
const mockVendorDetails = {
  '1': {
    id: '1',
    name: 'Rajesh Plumbing Services',
    rating: 4.8,
    reviewCount: 124,
    phone: '+91 98765 43210',
    specializations: ['Bathroom Fitting', 'Pipeline Repair', 'Water Tank', 'Emergency Repairs', 'Kitchen Plumbing'],
    priceRange: '₹200-400/hour',
    distance: '0.5 km',
    availability: 'Available',
    verified: true,
    experience: '8 years',
    responseTime: '< 30 min',
    description: 'Expert in bathroom renovations and water system repairs. Available for emergency services 24/7. Licensed plumber with insurance coverage.',
    workingHours: 'Mon-Sat: 8AM-8PM, Sun: Emergency only',
    address: 'Shop 15, Market Complex, Sector 21, Gurgaon',
    services: [
      { name: 'Bathroom Renovation', price: '₹5,000-15,000', duration: '1-3 days' },
      { name: 'Pipe Repair', price: '₹200-500', duration: '1-2 hours' },
      { name: 'Water Tank Cleaning', price: '₹800-1,200', duration: '2-3 hours' },
      { name: 'Emergency Call-out', price: '₹300-600', duration: 'Immediate' },
    ],
    certifications: ['Licensed Plumber', 'Insurance Covered', 'Government Approved'],
    gallery: [], // Would contain image URLs
    recentWork: [
      { date: '2024-01-15', description: 'Complete bathroom renovation in B-402', rating: 5 },
      { date: '2024-01-10', description: 'Pipeline repair in common area', rating: 5 },
      { date: '2024-01-05', description: 'Water heater installation in A-301', rating: 4 },
    ]
  }
};

// Mock reviews
const mockReviews = [
  {
    id: '1',
    userName: 'Priya Sharma',
    userFlat: 'A-301',
    rating: 5,
    date: '2024-01-15',
    comment: 'Excellent work! Fixed our bathroom leak quickly and professionally. Highly recommended.',
    service: 'Pipe Repair',
    helpful: 12,
    images: []
  },
  {
    id: '2',
    userName: 'Amit Kumar',
    userFlat: 'B-205',
    rating: 5,
    date: '2024-01-10',
    comment: 'Very punctual and skilled. Completed the water tank cleaning on time. Fair pricing.',
    service: 'Water Tank Cleaning',
    helpful: 8,
    images: []
  },
  {
    id: '3',
    userName: 'Sneha Patel',
    userFlat: 'C-102',
    rating: 4,
    date: '2024-01-05',
    comment: 'Good service but took a bit longer than expected. Quality of work was good.',
    service: 'Kitchen Plumbing',
    helpful: 5,
    images: []
  }
];

interface ServiceCardProps {
  service: any;
  onSelect: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => (
  <TouchableOpacity
    onPress={onSelect}
    className="bg-surface rounded-xl p-4 mb-3 border border-divider"
    activeOpacity={0.7}
  >
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-headline-medium font-semibold text-text-primary flex-1">
        {service.name}
      </Text>
      <Text className="text-body-large font-semibold text-primary">
        {service.price}
      </Text>
    </View>
    <View className="flex-row items-center">
      <Clock size={14} color="#757575" />
      <Text className="text-body-medium text-text-secondary ml-1">
        {service.duration}
      </Text>
    </View>
  </TouchableOpacity>
);

interface ReviewCardProps {
  review: any;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => (
  <View className="bg-surface rounded-xl p-4 mb-4 border border-divider">
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center">
        <View className="bg-primary/10 rounded-full w-10 h-10 items-center justify-center mr-3">
          <User size={20} color="#6366f1" />
        </View>
        <View>
          <Text className="text-headline-medium font-semibold text-text-primary">
            {review.userName}
          </Text>
          <Text className="text-body-medium text-text-secondary">
            {review.userFlat} • {review.date}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            color={star <= review.rating ? "#FF9800" : "#E0E0E0"}
            fill={star <= review.rating ? "#FF9800" : "transparent"}
          />
        ))}
      </View>
    </View>
    
    <View className="bg-primary/5 rounded-lg px-3 py-2 mb-3">
      <Text className="text-body-medium text-primary font-medium">
        Service: {review.service}
      </Text>
    </View>
    
    <Text className="text-body-medium text-text-primary mb-3">
      {review.comment}
    </Text>
    
    <View className="flex-row items-center">
      <TouchableOpacity className="flex-row items-center">
        <ThumbsUp size={14} color="#757575" />
        <Text className="text-body-medium text-text-secondary ml-1">
          Helpful ({review.helpful})
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function VendorProfile() {
  const router = useRouter();
  const { category, vendorId } = useLocalSearchParams<{ category: string; vendorId: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews'>('overview');
  const [quoteRequest, setQuoteRequest] = useState('');

  // Get vendor details
  const vendor = mockVendorDetails[vendorId as keyof typeof mockVendorDetails];

  if (!vendor) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-headline-large text-text-secondary">Vendor not found</Text>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${vendor.phone}`);
  };

  const handleWhatsApp = () => {
    const message = `Hi ${vendor.name}, I found your contact through Aptly app. I need help with ${category} services.`;
    Linking.openURL(`whatsapp://send?phone=${vendor.phone.replace(/\s/g, '')}&text=${encodeURIComponent(message)}`);
  };

  const handleQuoteRequest = () => {
    if (!quoteRequest.trim()) {
      showErrorAlert('Error', 'Please describe what you need help with');
      return;
    }
    
    showSuccessAlert(
      'Quote Request Sent',
      `Your quote request has been sent to ${vendor.name}. They will contact you within ${vendor.responseTime}.`,
      () => setQuoteRequest('')
    );
  };

  const renderOverview = () => (
    <View>
      {/* Description */}
      <View className="bg-surface rounded-xl p-4 mb-4 border border-divider">
        <Text className="text-headline-medium font-semibold text-text-primary mb-3">
          About
        </Text>
        <Text className="text-body-medium text-text-primary leading-6">
          {vendor.description}
        </Text>
      </View>

      {/* Quick Info */}
      <View className="bg-surface rounded-xl p-4 mb-4 border border-divider">
        <Text className="text-headline-medium font-semibold text-text-primary mb-3">
          Quick Info
        </Text>
        <View className="space-y-3">
          <View className="flex-row items-center">
            <Clock size={16} color="#757575" />
            <Text className="text-body-medium text-text-secondary ml-3">
              Response Time: {vendor.responseTime}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={16} color="#757575" />
            <Text className="text-body-medium text-text-secondary ml-3">
              {vendor.address}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Calendar size={16} color="#757575" />
            <Text className="text-body-medium text-text-secondary ml-3">
              {vendor.workingHours}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Award size={16} color="#757575" />
            <Text className="text-body-medium text-text-secondary ml-3">
              Experience: {vendor.experience}
            </Text>
          </View>
        </View>
      </View>

      {/* Certifications */}
      <View className="bg-surface rounded-xl p-4 mb-4 border border-divider">
        <Text className="text-headline-medium font-semibold text-text-primary mb-3">
          Certifications & Verification
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {vendor.certifications.map((cert, index) => (
            <View key={index} className="bg-secondary/10 rounded-full px-3 py-2 flex-row items-center">
              <Shield size={14} color="#4CAF50" />
              <Text className="text-body-medium text-secondary ml-2">
                {cert}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Work */}
      <View className="bg-surface rounded-xl p-4 mb-4 border border-divider">
        <Text className="text-headline-medium font-semibold text-text-primary mb-3">
          Recent Work
        </Text>
        {vendor.recentWork.map((work, index) => (
          <View key={index} className="flex-row items-center justify-between py-2 border-b border-divider last:border-b-0">
            <View className="flex-1">
              <Text className="text-body-medium text-text-primary">
                {work.description}
              </Text>
              <Text className="text-body-medium text-text-secondary">
                {work.date}
              </Text>
            </View>
            <View className="flex-row items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  color={star <= work.rating ? "#FF9800" : "#E0E0E0"}
                  fill={star <= work.rating ? "#FF9800" : "transparent"}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderServices = () => (
    <View>
      <Text className="text-headline-medium font-semibold text-text-primary mb-4 px-1">
        Available Services
      </Text>
      {vendor.services.map((service, index) => (
        <ServiceCard
          key={index}
          service={service}
          onSelect={() => showAlert('Service Selected', `You selected: ${service.name}`)}
        />
      ))}
    </View>
  );

  const renderReviews = () => (
    <View>
      <Text className="text-headline-medium font-semibold text-text-primary mb-4 px-1">
        Customer Reviews ({vendor.reviewCount})
      </Text>
      {mockReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <Text className="text-headline-large font-semibold text-text-primary">
          Vendor Profile
        </Text>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Vendor Header */}
        <View className="bg-surface px-6 py-6 border-b border-divider">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-display-small font-bold text-text-primary mr-2">
                  {vendor.name}
                </Text>
                {vendor.verified && (
                  <Shield size={20} color="#4CAF50" />
                )}
              </View>
              
              <View className="flex-row items-center mb-2">
                <View className="flex-row items-center mr-4">
                  <Star size={16} color="#FF9800" fill="#FF9800" />
                  <Text className="text-body-large font-semibold text-text-primary ml-1">
                    {vendor.rating}
                  </Text>
                  <Text className="text-body-large text-text-secondary ml-1">
                    ({vendor.reviewCount} reviews)
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={16} color="#757575" />
                  <Text className="text-body-large text-text-secondary ml-1">
                    {vendor.distance}
                  </Text>
                </View>
              </View>

              <Text className={`text-body-large font-medium ${
                vendor.availability === 'Available' ? 'text-secondary' : 'text-warning'
              }`}>
                ● {vendor.availability}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCall}
                className="bg-primary rounded-full w-12 h-12 items-center justify-center"
              >
                <Phone size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWhatsApp}
                className="bg-secondary rounded-full w-12 h-12 items-center justify-center"
              >
                <MessageCircle size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Range */}
          <View className="bg-primary/10 rounded-xl px-4 py-3">
            <View className="flex-row items-center">
              <DollarSign size={16} color="#6366f1" />
              <Text className="text-body-large font-semibold text-primary ml-2">
                {vendor.priceRange}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-surface border-b border-divider">
          {(['overview', 'services', 'reviews'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === tab ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Text className={`text-body-large font-semibold capitalize ${
                activeTab === tab ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="px-6 py-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'services' && renderServices()}
          {activeTab === 'reviews' && renderReviews()}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-surface px-6 py-4 border-t border-divider">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextInput
              className="bg-background border border-divider rounded-lg px-4 py-3 text-body-medium"
              placeholder="Describe what you need help with..."
              placeholderTextColor="#757575"
              value={quoteRequest}
              onChangeText={setQuoteRequest}
              multiline
              numberOfLines={2}
            />
          </View>
          <TouchableOpacity
            onPress={handleQuoteRequest}
            className="bg-primary rounded-lg px-6 py-3 justify-center"
          >
            <MessageSquare size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}