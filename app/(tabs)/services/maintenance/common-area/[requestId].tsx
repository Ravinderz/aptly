import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Linking, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { showSuccessAlert } from '@/utils/alert';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  DollarSign,
  Camera,
  Mic,
  CheckCircle,
  AlertTriangle,
  Users,
  Star
} from 'lucide-react-native';

// Mock request data - in production this would come from Supabase
const mockRequestData = {
  'demo-request-id': {
    id: 'demo-request-id',
    title: 'Main Lobby Lighting Issue',
    location: 'building',
    area: 'Main Lobby',
    category: 'electrical',
    priority: 'high',
    status: 'in_progress',
    description: 'Several LED lights in the main lobby are flickering and two have completely stopped working. This is affecting visibility during evening hours and creating safety concerns for residents.',
    submittedBy: 'Priya Sharma',
    flatNumber: 'A-301',
    submittedAt: '2024-01-15T10:30:00Z',
    affectedResidents: 25,
    suggestedVendor: 'PowerTech Electricians',
    budgetEstimate: 5000,
    assignedVendor: {
      id: '4',
      name: 'PowerTech Electricians',
      phone: '+91 95432 10987',
      rating: 4.9,
      responseTime: '< 20 min'
    },
    estimatedCost: 4500,
    approvedBudget: 5000,
    workSchedule: {
      startDate: '2024-01-16',
      estimatedCompletion: '2024-01-17',
      workingHours: '9 AM - 5 PM'
    },
    mediaFiles: [
      { id: '1', type: 'image', name: 'lobby_lights_1.jpg', url: '' },
      { id: '2', type: 'image', name: 'lobby_lights_2.jpg', url: '' },
      { id: '3', type: 'audio', name: 'issue_description.m4a', url: '' }
    ],
    timeline: [
      {
        id: '1',
        status: 'submitted',
        title: 'Request Submitted',
        description: 'Common area maintenance request submitted by Priya Sharma',
        timestamp: '2024-01-15T10:30:00Z',
        user: 'Priya Sharma'
      },
      {
        id: '2',
        status: 'committee_review',
        title: 'Under Committee Review',
        description: 'Request is being reviewed by the society committee for priority and budget approval',
        timestamp: '2024-01-15T14:20:00Z',
        user: 'Committee'
      },
      {
        id: '3',
        status: 'approved',
        title: 'Request Approved',
        description: 'Committee approved the request with budget of ₹5,000. Vendor assignment in progress.',
        timestamp: '2024-01-15T16:45:00Z',
        user: 'Society Committee'
      },
      {
        id: '4',
        status: 'vendor_assigned',
        title: 'Vendor Assigned',
        description: 'PowerTech Electricians has been assigned to handle this work',
        timestamp: '2024-01-16T09:00:00Z',
        user: 'Committee'
      },
      {
        id: '5',
        status: 'in_progress',
        title: 'Work Started',
        description: 'Vendor has started working on the electrical issue. Expected completion: Jan 17',
        timestamp: '2024-01-16T10:00:00Z',
        user: 'PowerTech Electricians'
      }
    ],
    communityVotes: {
      upvotes: 18,
      totalVotes: 20,
      hasUserVoted: false
    },
    comments: [
      {
        id: '1',
        user: 'Amit Kumar',
        flatNumber: 'B-205',
        message: 'This has been an issue for weeks. Good that it\'s finally being addressed.',
        timestamp: '2024-01-15T11:00:00Z',
        likes: 5
      },
      {
        id: '2',
        user: 'Sneha Patel',
        flatNumber: 'C-102',
        message: 'Safety concern especially for elderly residents. Thank you for reporting this.',
        timestamp: '2024-01-15T12:30:00Z',
        likes: 3
      }
    ]
  }
};

const statusConfig = {
  submitted: { color: 'text-primary', bg: 'bg-primary/10', icon: '📝' },
  committee_review: { color: 'text-warning', bg: 'bg-warning/10', icon: '👥' },
  approved: { color: 'text-secondary', bg: 'bg-secondary/10', icon: '✅' },
  vendor_assigned: { color: 'text-primary', bg: 'bg-primary/10', icon: '👷' },
  in_progress: { color: 'text-warning', bg: 'bg-warning/10', icon: '🔧' },
  quality_check: { color: 'text-primary', bg: 'bg-primary/10', icon: '🔍' },
  completed: { color: 'text-secondary', bg: 'bg-secondary/10', icon: '✅' },
  rejected: { color: 'text-error', bg: 'bg-error/10', icon: '❌' }
};

const priorityConfig = {
  emergency: { color: 'text-error', bg: 'bg-error/20', icon: '🚨' },
  high: { color: 'text-warning', bg: 'bg-warning/20', icon: '🔴' },
  medium: { color: 'text-primary', bg: 'bg-primary/20', icon: '🟡' },
  low: { color: 'text-secondary', bg: 'bg-secondary/20', icon: '🟢' }
};

interface TimelineItemProps {
  item: any;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, isLast }) => {
  const config = statusConfig[item.status as keyof typeof statusConfig];
  
  return (
    <View className="flex-row">
      <View className="items-center mr-4">
        <View className={`w-10 h-10 rounded-full ${config.bg} items-center justify-center`}>
          <Text className="text-lg">{config.icon}</Text>
        </View>
        {!isLast && <View className="w-0.5 h-12 bg-divider mt-2" />}
      </View>
      <View className="flex-1 pb-6">
        <Text className="text-headline-medium font-semibold text-text-primary">
          {item.title}
        </Text>
        <Text className="text-body-medium text-text-secondary mt-1">
          {item.description}
        </Text>
        <View className="flex-row items-center mt-2">
          <Clock size={14} color="#757575" />
          <Text className="text-body-medium text-text-secondary ml-1">
            {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        <Text className="text-body-medium text-primary mt-1">
          by {item.user}
        </Text>
      </View>
    </View>
  );
};

interface CommentItemProps {
  comment: any;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => (
  <View className="bg-surface rounded-xl p-4 border border-divider mb-3">
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-row items-center">
        <View className="bg-primary/10 rounded-full w-8 h-8 items-center justify-center mr-3">
          <User size={16} color="#6366f1" />
        </View>
        <View>
          <Text className="text-headline-medium font-semibold text-text-primary">
            {comment.user}
          </Text>
          <Text className="text-body-medium text-text-secondary">
            {comment.flatNumber}
          </Text>
        </View>
      </View>
      <Text className="text-body-medium text-text-secondary">
        {new Date(comment.timestamp).toLocaleDateString()}
      </Text>
    </View>
    <Text className="text-body-medium text-text-primary mb-3">
      {comment.message}
    </Text>
    <View className="flex-row items-center">
      <TouchableOpacity className="flex-row items-center">
        <ThumbsUp size={14} color="#757575" />
        <Text className="text-body-medium text-text-secondary ml-1">
          {comment.likes}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function CommonAreaRequestDetail() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'community'>('timeline');
  const [hasVoted, setHasVoted] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Get request data
  const request = mockRequestData[requestId as keyof typeof mockRequestData];

  if (!request) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-headline-large text-text-secondary">Request not found</Text>
      </SafeAreaView>
    );
  }

  const statusInfo = statusConfig[request.status as keyof typeof statusConfig];
  const priorityInfo = priorityConfig[request.priority as keyof typeof priorityConfig];

  const handleVendorCall = () => {
    if (request.assignedVendor) {
      Linking.openURL(`tel:${request.assignedVendor.phone}`);
    }
  };

  const handleVendorWhatsApp = () => {
    if (request.assignedVendor) {
      const message = `Hi, regarding the common area maintenance request #${request.id} at Green Valley Apartments.`;
      Linking.openURL(`whatsapp://send?phone=${request.assignedVendor.phone.replace(/\s/g, '')}&text=${encodeURIComponent(message)}`);
    }
  };

  const handleVoteUp = () => {
    setHasVoted(true);
    showSuccessAlert('Vote Recorded', 'Thank you for supporting this request!');
  };

  const handleVoteDown = () => {
    showSuccessAlert('Vote Recorded', 'Your feedback has been noted.');
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      // In a real app, this would make an API call to submit the comment
      console.log('Submitting comment:', newComment);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNewComment('');
      showSuccessAlert('Comment Posted', 'Your comment has been added to the discussion.');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const renderTimeline = () => (
    <View className="px-6 py-6">
      <Text className="text-headline-large font-semibold text-text-primary mb-6">
        Request Timeline
      </Text>
      {request.timeline.map((item, index) => (
        <TimelineItem
          key={item.id}
          item={item}
          isLast={index === request.timeline.length - 1}
        />
      ))}
    </View>
  );

  const renderDetails = () => (
    <View className="px-6 py-6 space-y-6">
      {/* Request Info */}
      <View className="bg-surface rounded-xl p-4 border border-divider">
        <Text className="text-headline-medium font-semibold text-text-primary mb-4">
          Request Information
        </Text>
        <View className="space-y-3">
          <View className="flex-row items-center">
            <MapPin size={16} color="#757575" />
            <Text className="text-body-medium text-text-secondary ml-3">
              Location: {request.area}
            </Text>
          </View>
          <View className="flex-row items-center">
            <User size={16} color="#757575" />
            <Text className="text-body-medium text-text-secondary ml-3">
              Reported by: {request.submittedBy} ({request.flatNumber})
            </Text>
          </View>
          <View className="flex-row items-center">
            <Users size={16} color="#757575" />
            <Text className="text-body-medium text-text-secondary ml-3">
              Affected residents: {request.affectedResidents}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={16} color="#757575" />
            <Text className="text-body-medium text-text-secondary ml-3">
              Submitted: {new Date(request.submittedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View className="bg-surface rounded-xl p-4 border border-divider">
        <Text className="text-headline-medium font-semibold text-text-primary mb-3">
          Issue Description
        </Text>
        <Text className="text-body-medium text-text-primary leading-6">
          {request.description}
        </Text>
      </View>

      {/* Vendor Information */}
      {request.assignedVendor && (
        <View className="bg-surface rounded-xl p-4 border border-divider">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            Assigned Vendor
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-headline-medium font-semibold text-text-primary">
                {request.assignedVendor.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Star size={14} color="#FF9800" fill="#FF9800" />
                <Text className="text-body-medium text-text-secondary ml-1">
                  {request.assignedVendor.rating} rating
                </Text>
              </View>
              <Text className="text-body-medium text-text-secondary">
                Response time: {request.assignedVendor.responseTime}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleVendorCall}
                className="bg-primary rounded-full w-10 h-10 items-center justify-center"
              >
                <Phone size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleVendorWhatsApp}
                className="bg-secondary rounded-full w-10 h-10 items-center justify-center"
              >
                <MessageCircle size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Cost Information */}
      <View className="bg-surface rounded-xl p-4 border border-divider">
        <Text className="text-headline-medium font-semibold text-text-primary mb-4">
          Cost Information
        </Text>
        <View className="space-y-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-body-medium text-text-secondary">Budget Estimate:</Text>
            <Text className="text-body-medium text-text-primary font-semibold">
              ₹{request.budgetEstimate?.toLocaleString()}
            </Text>
          </View>
          {request.estimatedCost && (
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Vendor Quote:</Text>
              <Text className="text-body-medium text-text-primary font-semibold">
                ₹{request.estimatedCost.toLocaleString()}
              </Text>
            </View>
          )}
          {request.approvedBudget && (
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Approved Budget:</Text>
              <Text className="text-body-medium text-secondary font-semibold">
                ₹{request.approvedBudget.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Work Schedule */}
      {request.workSchedule && (
        <View className="bg-surface rounded-xl p-4 border border-divider">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            Work Schedule
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Calendar size={16} color="#757575" />
              <Text className="text-body-medium text-text-secondary ml-3">
                Start Date: {new Date(request.workSchedule.startDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Calendar size={16} color="#757575" />
              <Text className="text-body-medium text-text-secondary ml-3">
                Expected Completion: {new Date(request.workSchedule.estimatedCompletion).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={16} color="#757575" />
              <Text className="text-body-medium text-text-secondary ml-3">
                Working Hours: {request.workSchedule.workingHours}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Media Files */}
      {request.mediaFiles.length > 0 && (
        <View className="bg-surface rounded-xl p-4 border border-divider">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            Attachments
          </Text>
          <View className="space-y-2">
            {request.mediaFiles.map((file) => (
              <View key={file.id} className="flex-row items-center bg-background rounded-lg p-3">
                <Text className="text-lg mr-3">
                  {file.type === 'image' ? '📷' : '🎤'}
                </Text>
                <Text className="flex-1 text-body-medium text-text-primary">
                  {file.name}
                </Text>
                <TouchableOpacity className="text-primary">
                  <Text className="text-body-medium text-primary">View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderCommunity = () => (
    <View className="px-6 py-6 space-y-6">
      {/* Community Voting */}
      <View className="bg-surface rounded-xl p-4 border border-divider">
        <Text className="text-headline-medium font-semibold text-text-primary mb-4">
          Community Support
        </Text>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-body-medium text-text-secondary">
            {request.communityVotes.upvotes} out of {request.communityVotes.totalVotes} residents support this request
          </Text>
          <Text className="text-headline-medium font-semibold text-secondary">
            {Math.round((request.communityVotes.upvotes / request.communityVotes.totalVotes) * 100)}%
          </Text>
        </View>
        
        {!hasVoted && !request.communityVotes.hasUserVoted && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleVoteUp}
              className="flex-1 flex-row items-center justify-center bg-secondary rounded-lg p-3"
            >
              <ThumbsUp size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleVoteDown}
              className="flex-1 flex-row items-center justify-center bg-surface border border-divider rounded-lg p-3"
            >
              <ThumbsDown size={16} color="#757575" />
              <Text className="text-text-secondary font-semibold ml-2">Not Priority</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {(hasVoted || request.communityVotes.hasUserVoted) && (
          <View className="bg-secondary/10 rounded-lg p-3">
            <Text className="text-secondary text-center font-medium">
              Thank you for your feedback!
            </Text>
          </View>
        )}
      </View>

      {/* Comments */}
      <View>
        <Text className="text-headline-medium font-semibold text-text-primary mb-4">
          Community Comments ({request.comments.length})
        </Text>
        
        {/* Add Comment Input */}
        <View className="bg-surface rounded-xl p-4 border border-divider mb-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Add your comment
          </Text>
          <TextInput
            className="bg-background rounded-lg p-3 text-text-primary border border-divider min-h-[80px]"
            placeholder="Share your thoughts about this maintenance request..."
            placeholderTextColor="#757575"
            multiline
            textAlignVertical="top"
            value={newComment}
            onChangeText={setNewComment}
            editable={!isSubmittingComment}
          />
          <TouchableOpacity
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || isSubmittingComment}
            className={`mt-3 rounded-lg p-3 flex-row items-center justify-center ${
              !newComment.trim() || isSubmittingComment
                ? 'bg-text-secondary/20'
                : 'bg-primary'
            }`}
          >
            <MessageCircle size={16} color={!newComment.trim() || isSubmittingComment ? '#757575' : 'white'} />
            <Text className={`font-semibold ml-2 ${
              !newComment.trim() || isSubmittingComment
                ? 'text-text-secondary'
                : 'text-white'
            }`}>
              {isSubmittingComment ? 'Posting...' : 'Post Comment'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {request.comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-divider">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-headline-large font-semibold text-text-primary">
              {request.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className={`${statusInfo.bg} rounded-full px-3 py-1 mr-3`}>
                <Text className={`${statusInfo.color} text-label-large font-medium`}>
                  {request.status.replace('_', ' ')}
                </Text>
              </View>
              <View className={`${priorityInfo.bg} rounded-full px-3 py-1`}>
                <Text className={`${priorityInfo.color} text-label-large font-medium`}>
                  {request.priority} priority
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-surface border-b border-divider">
          {(['timeline', 'details', 'community'] as const).map((tab) => (
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
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'timeline' && renderTimeline()}
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'community' && renderCommunity()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}