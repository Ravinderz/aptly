import React, { useState } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity,
  TextInput,
  Linking
} from 'react-native';
import { router } from 'expo-router';
import LucideIcons from '@/components/ui/LucideIcons';
import { showSuccessAlert, showErrorAlert } from '@/utils/alert';
import { safeGoBack } from '@/utils/navigation';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import StackHeader from '@/components/ui/headers/StackHeader';

export default function SupportPage() {
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const supportCategories = [
    { id: 'account', label: 'Account Issues', icon: 'person-outline' },
    { id: 'billing', label: 'Billing & Payments', icon: 'card-outline' },
    { id: 'maintenance', label: 'Maintenance Requests', icon: 'build-outline' },
    { id: 'community', label: 'Community Features', icon: 'people-outline' },
    { id: 'technical', label: 'Technical Support', icon: 'settings-outline' },
    { id: 'other', label: 'Other', icon: 'help-circle-outline' }
  ];

  const faqItems = [
    {
      question: 'How do I submit a maintenance request?',
      answer: 'Go to Services > Maintenance Requests and tap "Common Area Request" to submit a new request. Provide details about the issue and attach photos if needed.'
    },
    {
      question: 'How can I pay my society maintenance bills?',
      answer: 'Navigate to Services > Billing to view and pay your bills. You can use UPI, net banking, or cards for payment.'
    },
    {
      question: 'How do I add family members to my account?',
      answer: 'Go to Settings > Family Members and tap the "+" button to add new family members with their details.'
    },
    {
      question: 'Can I participate in society voting from the app?',
      answer: 'Yes! Go to Services > Governance to view active voting campaigns and cast your vote securely.'
    },
    {
      question: 'How do I register visitors?',
      answer: 'Use the Visitors tab to pre-register guests. Share the QR code with them for easy entry at the gate.'
    },
    {
      question: 'What should I do if I forgot my password?',
      answer: 'On the login screen, tap "Forgot Password" and follow the instructions to reset your password via SMS.'
    }
  ];

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim() || !selectedCategory) {
      showErrorAlert('Missing Information', 'Please select a category and enter your feedback message.');
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      
      // In a real app, this would submit to the support API
      console.log('Submitting feedback:', {
        category: selectedCategory,
        message: feedbackMessage
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFeedbackMessage('');
      setSelectedCategory('');
      showSuccessAlert('Feedback Sent', 'Thank you for your feedback! Our support team will review it and get back to you.');
    } catch (error) {
      showErrorAlert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:+911234567890');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@aptly.app?subject=Support Request');
  };

  const handleWhatsApp = () => {
    const message = 'Hi, I need help with the Aptly app.';
    Linking.openURL(`whatsapp://send?phone=+911234567890&text=${encodeURIComponent(message)}`);
  };

  const renderContactOptions = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Contact Support
        </Text>
        
        <View className="space-y-3">
          <TouchableOpacity
            className="flex-row items-center bg-primary/10 rounded-xl p-4"
            onPress={handleCall}
          >
            <View className="bg-primary rounded-full w-10 h-10 items-center justify-center mr-4">
              <LucideIcons name="call-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-body-medium font-semibold text-text-primary">
                Call Support
              </Text>
              <Text className="text-body-small text-text-secondary">
                +91 123 456 7890 • Available 9 AM - 6 PM
              </Text>
            </View>
            <LucideIcons name="chevron-forward" size={20} color="#6366f1" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-secondary/10 rounded-xl p-4"
            onPress={handleWhatsApp}
          >
            <View className="bg-secondary rounded-full w-10 h-10 items-center justify-center mr-4">
              <LucideIcons name="logo-whatsapp" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-body-medium font-semibold text-text-primary">
                WhatsApp Support
              </Text>
              <Text className="text-body-small text-text-secondary">
                Quick responses • Usually replies within 30 minutes
              </Text>
            </View>
            <LucideIcons name="chevron-forward" size={20} color="#4CAF50" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-background rounded-xl p-4 border border-divider"
            onPress={handleEmail}
          >
            <View className="bg-warning rounded-full w-10 h-10 items-center justify-center mr-4">
              <LucideIcons name="mail-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-body-medium font-semibold text-text-primary">
                Email Support
              </Text>
              <Text className="text-body-small text-text-secondary">
                support@aptly.app • Response within 24 hours
              </Text>
            </View>
            <LucideIcons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderFAQ = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Frequently Asked Questions
        </Text>
        
        <View className="space-y-4">
          {faqItems.map((item, index) => (
            <View key={index} className="border-b border-divider pb-4 last:border-b-0 last:pb-0">
              <Text className="text-body-medium font-semibold text-text-primary mb-2">
                {item.question}
              </Text>
              <Text className="text-body-medium text-text-secondary leading-5">
                {item.answer}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );

  const renderFeedbackForm = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Send Feedback
        </Text>
        
        {/* Category Selection */}
        <Text className="text-body-medium font-medium text-text-primary mb-3">
          What's this about?
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {supportCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              className={`flex-row items-center px-3 py-2 rounded-full border ${
                selectedCategory === category.id
                  ? 'border-primary bg-primary/10'
                  : 'border-divider bg-background'
              }`}
            >
              <LucideIcons 
                name={category.icon as any} 
                size={14} 
                color={selectedCategory === category.id ? '#6366f1' : '#757575'} 
              />
              <Text className={`ml-2 text-body-small font-medium ${
                selectedCategory === category.id ? 'text-primary' : 'text-text-secondary'
              }`}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message Input */}
        <Text className="text-body-medium font-medium text-text-primary mb-3">
          Your message
        </Text>
        <TextInput
          className="bg-background rounded-lg p-3 text-text-primary border border-divider min-h-[100px]"
          placeholder="Describe your issue or feedback in detail..."
          placeholderTextColor="#757575"
          multiline
          textAlignVertical="top"
          value={feedbackMessage}
          onChangeText={setFeedbackMessage}
          editable={!isSubmittingFeedback}
        />

        <Button
          variant="primary"
          onPress={handleSubmitFeedback}
          disabled={!feedbackMessage.trim() || !selectedCategory || isSubmittingFeedback}
          className="mt-4"
        >
          {isSubmittingFeedback ? "Sending..." : "Send Feedback"}
        </Button>
      </View>
    </Card>
  );

  const renderAppInfo = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          App Information
        </Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-body-medium text-text-secondary">Version</Text>
            <Text className="text-body-medium text-text-primary font-medium">1.0.0</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-body-medium text-text-secondary">Build</Text>
            <Text className="text-body-medium text-text-primary font-medium">2024.1.15</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-body-medium text-text-secondary">Platform</Text>
            <Text className="text-body-medium text-text-primary font-medium">React Native</Text>
          </View>
        </View>

        <View className="flex-row gap-3 mt-4 pt-4 border-t border-divider">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-background border border-divider rounded-lg p-3"
            onPress={() => Linking.openURL('https://aptly.app/privacy')}
          >
            <LucideIcons name="shield-outline" size={16} color="#757575" />
            <Text className="text-text-secondary font-medium ml-2">Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-background border border-divider rounded-lg p-3"
            onPress={() => Linking.openURL('https://aptly.app/terms')}
          >
            <LucideIcons name="document-text-outline" size={16} color="#757575" />
            <Text className="text-text-secondary font-medium ml-2">Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StackHeader
        title="Help & Support"
        onBackPress={() => safeGoBack()}
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {renderContactOptions()}
        {renderFAQ()}
        {renderFeedbackForm()}
        {renderAppInfo()}
      </ScrollView>
    </SafeAreaView>
  );
}