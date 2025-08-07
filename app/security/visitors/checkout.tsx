import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert,
  TouchableOpacity 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AptlySearchBar } from '@/components/ui/AptlySearchBar';
import { 
  UserX, 
  Search, 
  Clock, 
  MapPin, 
  Phone,
  Car,
  Star,
  CheckCircle,
  ArrowLeft,
  Timer,
  AlertTriangle,
  User
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import type { SecurityVisitor, VisitorCheckOutFormData } from '@/types/security';

/**
 * Visitor Check-out Interface - Phase 2
 * 
 * Features:
 * - Visitor search and selection
 * - Check-out time tracking
 * - Feedback collection
 * - Vehicle departure confirmation
 * - Duration tracking and overstay alerts
 * - Automatic calculations
 */
const VisitorCheckOut = () => {
  const params = useLocalSearchParams();
  const { user } = useDirectAuth();
  const preselectedVisitorId = params.visitorId as string;
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<SecurityVisitor | null>(null);
  
  const [formData, setFormData] = useState<VisitorCheckOutFormData>({
    visitorId: '',
    actualDepartureTime: new Date(),
    notes: '',
    vehicleDeparted: true,
    feedbackRating: 5,
    feedbackComments: ''
  });

  // Mock data - will be replaced with real API calls
  const [insideVisitors] = useState<SecurityVisitor[]>([
    {
      id: '1',
      name: 'John Doe',
      phoneNumber: '+91-9876543210',
      purpose: 'Meeting with resident',
      hostFlatNumber: 'A-204',
      checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      expectedCheckOutTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      status: 'inside',
      gateNumber: '1',
      createdBy: 'guard1',
      societyCode: 'APT001',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      securityInfo: {
        idVerified: true,
        idType: 'license',
        idNumber: 'DL123456789',
        checkInBy: 'guard1',
        vehicleInfo: {
          type: 'car',
          number: 'KA-01-AB-1234',
          make: 'Honda',
          model: 'City',
          color: 'White',
          parkingSpot: 'P-12'
        }
      },
      timing: {
        scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        actualCheckIn: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expectedDuration: 3,
        expectedCheckOut: new Date(Date.now() + 1 * 60 * 60 * 1000),
        overstayThreshold: new Date(Date.now() + 2 * 60 * 60 * 1000),
        overstayNotified: false
      },
      auditLog: [],
      visitInfo: {
        purpose: 'meeting',
        description: 'Business meeting',
        hostResident: {
          id: 'resident1',
          name: 'Resident Name',
          unit: 'A-204',
          phone: '+91-9876543210'
        },
        approvalRequired: false
      }
    },
    {
      id: '2',
      name: 'Sarah Smith',
      phoneNumber: '+91-9876543211',
      purpose: 'Delivery',
      hostFlatNumber: 'B-105',
      checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      expectedCheckOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago (overstay)
      status: 'overstay',
      gateNumber: '2',
      createdBy: 'guard1',
      societyCode: 'APT001',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      securityInfo: {
        idVerified: true,
        idType: 'national_id',
        checkInBy: 'guard1',
        securityNotes: 'Package delivery - overstaying'
      },
      timing: {
        scheduledTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        actualCheckIn: new Date(Date.now() - 4 * 60 * 60 * 1000),
        expectedDuration: 2,
        expectedCheckOut: new Date(Date.now() - 1 * 60 * 60 * 1000),
        overstayThreshold: new Date(Date.now() - 30 * 60 * 1000),
        overstayNotified: true
      },
      auditLog: [],
      visitInfo: {
        purpose: 'delivery',
        description: 'Package delivery',
        hostResident: {
          id: 'resident2',
          name: 'Another Resident',
          unit: 'B-105',
          phone: '+91-9876543211'
        },
        approvalRequired: false
      }
    }
  ]);

  const filteredVisitors = insideVisitors.filter(visitor =>
    visitor.status === 'inside' || visitor.status === 'overstay'
  ).filter(visitor => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      visitor.name.toLowerCase().includes(query) ||
      visitor.phoneNumber.includes(query) ||
      visitor.hostFlatNumber.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    // If a visitor ID is provided in params, pre-select that visitor
    if (preselectedVisitorId) {
      const visitor = insideVisitors.find(v => v.id === preselectedVisitorId);
      if (visitor) {
        setSelectedVisitor(visitor);
        setFormData(prev => ({
          ...prev,
          visitorId: visitor.id,
          vehicleDeparted: !!visitor.securityInfo.vehicleInfo
        }));
      }
    }
  }, [preselectedVisitorId, insideVisitors]);

  const handleVisitorSelect = (visitor: SecurityVisitor) => {
    setSelectedVisitor(visitor);
    setFormData(prev => ({
      ...prev,
      visitorId: visitor.id,
      vehicleDeparted: !!visitor.securityInfo.vehicleInfo
    }));
  };

  const handleInputChange = (field: keyof VisitorCheckOutFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDuration = (): string => {
    if (!selectedVisitor?.checkInTime) return 'N/A';
    
    const checkIn = selectedVisitor.checkInTime;
    const checkOut = formData.actualDepartureTime;
    const durationMs = checkOut.getTime() - checkIn.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${durationHours}h ${durationMinutes}m`;
  };

  const isOverstaying = (): boolean => {
    if (!selectedVisitor?.expectedCheckOutTime) return false;
    return formData.actualDepartureTime > selectedVisitor.expectedCheckOutTime;
  };

  const getOverstayDuration = (): string => {
    if (!selectedVisitor?.expectedCheckOutTime || !isOverstaying()) return '';
    
    const overstayMs = formData.actualDepartureTime.getTime() - selectedVisitor.expectedCheckOutTime.getTime();
    const overstayHours = Math.floor(overstayMs / (1000 * 60 * 60));
    const overstayMinutes = Math.floor((overstayMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${overstayHours}h ${overstayMinutes}m`;
  };

  const validateForm = (): boolean => {
    if (!selectedVisitor) {
      Alert.alert('Validation Error', 'Please select a visitor to check out');
      return false;
    }

    return true;
  };

  const handleCheckOut = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isOverstay = isOverstaying();
      const duration = calculateDuration();
      
      // Success feedback
      Alert.alert(
        'Check-out Successful',
        `${selectedVisitor!.name} has been checked out successfully.\nDuration: ${duration}${isOverstay ? ` (Overstayed by ${getOverstayDuration()})` : ''}`,
        [
          {
            text: 'Check-out Another',
            onPress: () => {
              setSelectedVisitor(null);
              setFormData({
                visitorId: '',
                actualDepartureTime: new Date(),
                notes: '',
                vehicleDeparted: true,
                feedbackRating: 5,
                feedbackComments: ''
              });
              setSearchQuery('');
            }
          },
          {
            text: 'View Visitors',
            onPress: () => router.push('/security/visitors')
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to check out visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m ago`;
    }
    return `${diffMins}m ago`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="mr-2 p-2"
          >
            <ArrowLeft size={20} color="#6b7280" />
          </Button>
          <UserX size={24} color="#6366f1" />
          <Text className="text-2xl font-bold text-gray-900 ml-2">
            Check-out Visitor
          </Text>
        </View>
        <Text className="text-gray-600">
          {selectedVisitor ? 'Complete check-out process' : 'Select a visitor to check out'}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
      >
        {!selectedVisitor ? (
          <>
            {/* Visitor Search */}
            <Card className="p-4 mb-4 bg-white">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Select Visitor
              </Text>
              
              <AptlySearchBar
                placeholder="Search by name, phone, or unit..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="mb-4"
              />

              <Text className="text-sm text-gray-600 mb-3">
                Visitors currently inside ({filteredVisitors.length})
              </Text>
              
              {filteredVisitors.length === 0 ? (
                <View className="items-center py-6">
                  <User size={48} color="#9ca3af" />
                  <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
                    No visitors found
                  </Text>
                  <Text className="text-gray-600 text-center">
                    {searchQuery.trim() 
                      ? `No visitors match "${searchQuery}"` 
                      : 'No visitors are currently inside'
                    }
                  </Text>
                </View>
              ) : (
                <View className="space-y-2">
                  {filteredVisitors.map((visitor) => (
                    <TouchableOpacity
                      key={visitor.id}
                      onPress={() => handleVisitorSelect(visitor)}
                      className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <Text className="text-lg font-semibold text-gray-900 mr-2">
                              {visitor.name}
                            </Text>
                            {visitor.status === 'overstay' && (
                              <View className="px-2 py-1 bg-red-100 rounded-full">
                                <Text className="text-xs font-medium text-red-800">
                                  Overstaying
                                </Text>
                              </View>
                            )}
                          </View>
                          <View className="flex-row items-center mb-1">
                            <Phone size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-1 mr-4">
                              {visitor.phoneNumber}
                            </Text>
                            <MapPin size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-1">
                              {visitor.hostFlatNumber}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Clock size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-500 ml-1">
                              In: {formatTimeAgo(visitor.checkInTime!)} • Purpose: {visitor.purpose}
                            </Text>
                          </View>
                          {visitor.securityInfo.vehicleInfo && (
                            <View className="flex-row items-center mt-1">
                              <Car size={14} color="#6b7280" />
                              <Text className="text-sm text-gray-500 ml-1">
                                {visitor.securityInfo.vehicleInfo.number} ({visitor.securityInfo.vehicleInfo.type})
                              </Text>
                            </View>
                          )}
                        </View>
                        <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
                          <CheckCircle size={16} color="#6366f1" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>
          </>
        ) : (
          <>
            {/* Selected Visitor Info */}
            <Card className="p-4 mb-4 bg-white">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  Visitor Information
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setSelectedVisitor(null);
                    setFormData(prev => ({ ...prev, visitorId: '' }));
                  }}
                >
                  Change
                </Button>
              </View>

              <View className="bg-gray-50 rounded-lg p-3 mb-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-xl font-bold text-gray-900 mr-2">
                    {selectedVisitor.name}
                  </Text>
                  {selectedVisitor.status === 'overstay' && (
                    <View className="px-2 py-1 bg-red-100 rounded-full">
                      <Text className="text-xs font-medium text-red-800">
                        Overstaying
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center mb-2">
                  <Phone size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2 mr-4">{selectedVisitor.phoneNumber}</Text>
                  <MapPin size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">Unit {selectedVisitor.hostFlatNumber}</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Clock size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">
                    Checked in: {formatTimeAgo(selectedVisitor.checkInTime!)}
                  </Text>
                </View>
                <Text className="text-gray-600">Purpose: {selectedVisitor.purpose}</Text>
                
                {selectedVisitor.securityInfo.vehicleInfo && (
                  <View className="flex-row items-center mt-2 pt-2 border-t border-gray-200">
                    <Car size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">
                      {selectedVisitor.securityInfo.vehicleInfo.number} 
                      ({selectedVisitor.securityInfo.vehicleInfo.type})
                      {selectedVisitor.securityInfo.vehicleInfo.parkingSpot && 
                        ` • Parked at ${selectedVisitor.securityInfo.vehicleInfo.parkingSpot}`
                      }
                    </Text>
                  </View>
                )}
              </View>

              {/* Duration & Overstay Alert */}
              <View className="border border-gray-200 rounded-lg p-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-gray-700">Visit Duration</Text>
                  <Text className="text-lg font-bold text-gray-900">
                    {calculateDuration()}
                  </Text>
                </View>
                
                {isOverstaying() && (
                  <View className="flex-row items-center mt-2 p-2 bg-red-50 rounded">
                    <AlertTriangle size={16} color="#dc2626" />
                    <Text className="text-sm text-red-700 ml-2">
                      Overstayed by {getOverstayDuration()}
                    </Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Check-out Details */}
            <Card className="p-4 mb-4 bg-white">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Check-out Details
              </Text>

              <Text className="text-sm text-gray-600 mb-2">Departure Time</Text>
              <View className="flex-row items-center p-3 bg-gray-50 rounded-lg mb-4">
                <Clock size={16} color="#6b7280" />
                <Text className="text-gray-900 ml-2 font-medium">
                  {formatTime(formData.actualDepartureTime)}
                </Text>
              </View>

              {selectedVisitor.securityInfo.vehicleInfo && (
                <View className="mb-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">Vehicle Departed</Text>
                    <Button
                      variant={formData.vehicleDeparted ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => handleInputChange('vehicleDeparted', !formData.vehicleDeparted)}
                    >
                      {formData.vehicleDeparted ? 'Yes' : 'No'}
                    </Button>
                  </View>
                </View>
              )}

              <Input
                label="Notes (Optional)"
                value={formData.notes || ''}
                onChangeText={(value) => handleInputChange('notes', value)}
                placeholder="Any additional notes or observations..."
                multiline
                numberOfLines={3}
              />
            </Card>

            {/* Feedback */}
            <Card className="p-4 mb-6 bg-white">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Visit Feedback (Optional)
              </Text>

              <Text className="text-sm text-gray-600 mb-2">Rating</Text>
              <View className="flex-row items-center mb-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => handleInputChange('feedbackRating', rating)}
                    className="mr-2"
                  >
                    <Star 
                      size={24} 
                      color={rating <= (formData.feedbackRating || 0) ? "#fbbf24" : "#d1d5db"}
                      fill={rating <= (formData.feedbackRating || 0) ? "#fbbf24" : "transparent"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Comments"
                value={formData.feedbackComments || ''}
                onChangeText={(value) => handleInputChange('feedbackComments', value)}
                placeholder="How was your visit experience?"
                multiline
                numberOfLines={2}
              />
            </Card>

            {/* Check-out Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleCheckOut}
            >
              <View className="flex-row items-center">
                <UserX size={20} color="#ffffff" />
                <Text className="text-white font-semibold ml-2">
                  Complete Check-out
                </Text>
              </View>
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  );
};

VisitorCheckOut.displayName = 'VisitorCheckOut';

export default VisitorCheckOut;