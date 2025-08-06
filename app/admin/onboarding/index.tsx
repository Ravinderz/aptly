import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native'; 
import { Clock, CheckCircle, X, AlertTriangle, FileText, Users, Building2 } from 'lucide-react-native';
import { RequireSuperAdmin } from '@/components/auth/RoleGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface OnboardingRequest {
  id: string;
  societyName: string;
  city: string;
  state: string;
  totalUnits: number;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
  documents: {
    registrationCertificate: boolean;
    taxDocuments: boolean;
    societyBylaws: boolean;
    ownershipProof: boolean;
  };
  reviewNotes?: string;
}

function AdminOnboarding() {
  const [onboardingRequests, setOnboardingRequests] = useState<OnboardingRequest[]>([
    {
      id: 'req_001',
      societyName: 'Emerald Heights Society',
      city: 'Mumbai',
      state: 'Maharashtra', 
      totalUnits: 180,
      subscriptionPlan: 'premium',
      contactPerson: {
        name: 'Rajesh Kumar',
        email: 'rajesh@emeraldheights.com',
        phone: '+91 98765 43210',
        role: 'Society Secretary',
      },
      status: 'pending',
      submittedAt: '2024-03-01T10:30:00Z',
      priority: 'high',
      documents: {
        registrationCertificate: true,
        taxDocuments: true,
        societyBylaws: false,
        ownershipProof: true,
      },
    },
    {
      id: 'req_002',
      societyName: 'Garden View Apartments',
      city: 'Bangalore',
      state: 'Karnataka',
      totalUnits: 120,
      subscriptionPlan: 'basic',
      contactPerson: {
        name: 'Priya Sharma',
        email: 'priya@gardenview.com',
        phone: '+91 87654 32109',
        role: 'President',
      },
      status: 'under_review',
      submittedAt: '2024-02-28T14:15:00Z',
      priority: 'medium',
      documents: {
        registrationCertificate: true,
        taxDocuments: true,
        societyBylaws: true,
        ownershipProof: true,
      },
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all');

  const getStatusColor = (status: OnboardingRequest['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'under_review': return 'text-blue-600';
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: OnboardingRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} color="#d97706" />;
      case 'under_review': return <AlertTriangle size={16} color="#0284c7" />;
      case 'approved': return <CheckCircle size={16} color="#059669" />;
      case 'rejected': return <X size={16} color="#dc2626" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const handleViewDetails = (request: OnboardingRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleApprove = async (requestId: string) => {
    setOnboardingRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'approved' as const }
        : req
    ));
    setShowModal(false);
    Alert.alert('Success', 'Society onboarding request approved!');
  };

  const handleReject = async (requestId: string) => {
    setOnboardingRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'rejected' as const }
        : req
    ));
    setShowModal(false);
    Alert.alert('Success', 'Society onboarding request rejected!');
  };

  const handleStartReview = async (requestId: string) => {
    setOnboardingRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'under_review' as const }
        : req
    ));
    setShowModal(false);
  };

  const filteredRequests = onboardingRequests.filter(request => 
    filter === 'all' || request.status === filter
  );

  const getDocumentCompletionRate = (docs: OnboardingRequest['documents']) => {
    const total = Object.keys(docs).length;
    const completed = Object.values(docs).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <RequireSuperAdmin>
      <View className="flex-1 bg-gray-50">
        <AdminHeader title="Society Onboarding" showBack />
        
        <ScrollView className="flex-1 px-4 py-2">
          {/* Filter Pills */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {(['all', 'pending', 'under_review', 'approved', 'rejected'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setFilter(status)}
                className={cn(
                  "px-3 py-2 rounded-full border",
                  filter === status 
                    ? "bg-blue-100 border-blue-300" 
                    : "bg-white border-gray-300"
                )}
              >
                <Text className={cn(
                  "text-sm font-medium capitalize",
                  filter === status ? "text-blue-800" : "text-gray-700"
                )}>
                  {status.replace('_', ' ')} ({onboardingRequests.filter(r => status === 'all' || r.status === status).length})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Stats */}
          <View className="flex-row gap-3 mb-6">
            <Card className="flex-1 p-4">
              <View className="flex-row items-center justify-between">
                <Building2 size={24} color="#0284c7" />
                <Text className="text-2xl font-bold text-gray-900">
                  {onboardingRequests.filter(r => r.status === 'pending').length}
                </Text>
              </View>
              <Text className="text-sm font-medium text-gray-900 mt-1">Pending Review</Text>
            </Card>
            
            <Card className="flex-1 p-4">
              <View className="flex-row items-center justify-between">
                <CheckCircle size={24} color="#059669" />
                <Text className="text-2xl font-bold text-gray-900">
                  {onboardingRequests.filter(r => r.status === 'approved').length}
                </Text>
              </View>
              <Text className="text-sm font-medium text-gray-900 mt-1">Approved</Text>
            </Card>
          </View>

          {/* Onboarding Requests */}
          <View className="space-y-3">
            {filteredRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                onPress={() => handleViewDetails(request)}
              >
                <Card className="p-4">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {request.societyName}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {request.city}, {request.state} • {request.totalUnits} units
                      </Text>
                      <Text className="text-sm text-gray-600 capitalize">
                        {request.subscriptionPlan} plan
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center mb-1">
                        {getStatusIcon(request.status)}
                        <Text className={cn("text-sm font-medium ml-1 capitalize", getStatusColor(request.status))}>
                          {request.status.replace('_', ' ')}
                        </Text>
                      </View>
                      <Text className={cn("text-xs font-medium", getPriorityColor(request.priority))}>
                        {request.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-gray-600">
                      Documents: {getDocumentCompletionRate(request.documents)}% complete
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Detail Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View className="flex-1 bg-black bg-opacity-50 justify-end">
            <View className="bg-white rounded-t-xl max-h-4/5">
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold">
                  {selectedRequest?.societyName}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              {selectedRequest && (
                <ScrollView className="p-4">
                  {/* Society Details */}
                  <Card className="p-4 mb-4">
                    <Text className="text-sm font-semibold text-gray-900 mb-3">Society Information</Text>
                    <View className="space-y-2">
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Location:</Text>
                        <Text className="text-sm text-gray-900">{selectedRequest.city}, {selectedRequest.state}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Total Units:</Text>
                        <Text className="text-sm text-gray-900">{selectedRequest.totalUnits}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Plan:</Text>
                        <Text className="text-sm text-gray-900 capitalize">{selectedRequest.subscriptionPlan}</Text>
                      </View>
                    </View>
                  </Card>

                  {/* Contact Person */}
                  <Card className="p-4 mb-4">
                    <Text className="text-sm font-semibold text-gray-900 mb-3">Contact Person</Text>
                    <View className="space-y-2">
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Name:</Text>
                        <Text className="text-sm text-gray-900">{selectedRequest.contactPerson.name}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Role:</Text>
                        <Text className="text-sm text-gray-900">{selectedRequest.contactPerson.role}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Email:</Text>
                        <Text className="text-sm text-blue-600">{selectedRequest.contactPerson.email}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Phone:</Text>
                        <Text className="text-sm text-gray-900">{selectedRequest.contactPerson.phone}</Text>
                      </View>
                    </View>
                  </Card>

                  {/* Documents */}
                  <Card className="p-4 mb-4">
                    <Text className="text-sm font-semibold text-gray-900 mb-3">Document Status</Text>
                    <View className="space-y-2">
                      {Object.entries(selectedRequest.documents).map(([doc, status]) => (
                        <View key={doc} className="flex-row items-center justify-between">
                          <Text className="text-sm text-gray-600 capitalize">
                            {doc.replace(/([A-Z])/g, ' $1').trim()}:
                          </Text>
                          <View className="flex-row items-center">
                            {status ? (
                              <CheckCircle size={16} color="#059669" />
                            ) : (
                              <X size={16} color="#dc2626" />
                            )}
                            <Text className={cn("text-sm ml-1", status ? "text-green-600" : "text-red-600")}>
                              {status ? 'Uploaded' : 'Missing'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </Card>

                  {/* Action Buttons */}
                  <View className="space-y-3">
                    {selectedRequest.status === 'pending' && (
                      <Button
                        onPress={() => handleStartReview(selectedRequest.id)}
                        variant="outline"
                      >
                        Start Review
                      </Button>
                    )}
                    
                    {(selectedRequest.status === 'pending' || selectedRequest.status === 'under_review') && (
                      <View className="flex-row gap-3">
                        <Button
                          onPress={() => handleApprove(selectedRequest.id)}
                          variant="primary"
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          onPress={() => handleReject(selectedRequest.id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </View>
                    )}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </RequireSuperAdmin>
  );
}

export default AdminOnboarding;