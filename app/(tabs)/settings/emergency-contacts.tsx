import React, { useState } from 'react';
import { ScrollView, SafeAreaView, View, Text, TouchableOpacity, Linking } from 'react-native';
import { ArrowLeft, Plus, Phone, Edit3, Trash2, PhoneCall } from 'lucide-react-native';
import { router } from 'expo-router';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';
import { showErrorAlert, showDeleteConfirmAlert } from '../../../utils/alert';
import { validateEmergencyContact, formatIndianPhoneNumber } from '../../../utils/validation';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string;
  address?: string;
  isPrimary: boolean;
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Dr. Priya Kumar',
      relationship: 'Wife',
      phoneNumber: '9876543211',
      alternatePhone: '8765432198',
      address: 'Same flat - A-301',
      isPrimary: true,
    },
    {
      id: '2',
      name: 'Mr. Suresh Kumar',
      relationship: 'Father',
      phoneNumber: '9876543212',
      address: 'B-Block, Sector 15, Noida',
      isPrimary: false,
    },
  ]);

  const handleAddContact = () => {
    router.push('/(tabs)/settings/add-emergency-contact');
  };

  const handleEditContact = (contact: EmergencyContact) => {
    router.push(`/(tabs)/settings/edit-emergency-contact/${contact.id}`);
  };

  const handleDeleteContact = (contact: EmergencyContact) => {
    if (contact.isPrimary) {
      showErrorAlert(
        'Cannot Delete Primary Contact',
        'You cannot delete your primary emergency contact. Please set another contact as primary first.'
      );
      return;
    }

    showDeleteConfirmAlert(
      'Delete Emergency Contact',
      `Are you sure you want to delete ${contact.name}?`,
      () => {
        setContacts(prev => prev.filter(c => c.id !== contact.id));
      }
    );
  };

  const handleCallContact = (phoneNumber: string) => {
    // Emergency service numbers (100, 101, 108) don't need validation
    const emergencyNumbers = ['100', '101', '108'];
    
    if (!emergencyNumbers.includes(phoneNumber)) {
      // Validate phone number before calling for regular contacts
      const validation = validateEmergencyContact(phoneNumber);
      if (!validation.isValid) {
        showErrorAlert('Invalid Phone Number', validation.error || 'Invalid phone number format');
        return;
      }
    }

    // Format phone URL correctly
    const phoneUrl = emergencyNumbers.includes(phoneNumber) 
      ? `tel:${phoneNumber}` 
      : `tel:+91${phoneNumber}`;
      
    Linking.canOpenURL(phoneUrl).then((supported) => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        showErrorAlert('Error', 'Unable to make phone call from this device');
      }
    }).catch(() => {
      showErrorAlert('Error', 'Unable to make phone call');
    });
  };

  const handleSetPrimary = (contactId: string) => {
    setContacts(prev => 
      prev.map(contact => ({
        ...contact,
        isPrimary: contact.id === contactId
      }))
    );
  };

  const getRelationshipColor = (relationship: string) => {
    const colors = {
      'Wife': '#4CAF50',
      'Husband': '#4CAF50',
      'Father': '#FF9800',
      'Mother': '#9C27B0',
      'Son': '#2196F3',
      'Daughter': '#E91E63',
      'Brother': '#00BCD4',
      'Sister': '#FF5722',
      'Friend': '#607D8B',
      'Doctor': '#F44336',
      'Other': '#757575',
    };
    return colors[relationship as keyof typeof colors] || colors.Other;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-divider bg-surface">
        <View className="flex-row items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="mr-2 p-2"
          >
            <ArrowLeft size={20} color="#6366f1" />
          </Button>
          <Text className="text-text-primary text-headline-large font-semibold">
            Emergency Contacts
          </Text>
        </View>
        
        <Button size="sm" onPress={handleAddContact}>
          <Plus size={16} color="white" />
        </Button>
      </View>

      <ScrollView 
        className="flex-1 p-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Emergency Contacts List */}
        {contacts.map((contact) => (
          <Card 
            key={contact.id} 
            className={cn(
              "mb-4",
              contact.isPrimary && "border-primary/50 bg-primary/5"
            )}
          >
            {/* Primary Badge */}
            {contact.isPrimary && (
              <View className="bg-primary rounded-lg px-3 py-1 self-start mb-3">
                <Text className="text-white text-xs font-bold">
                  PRIMARY CONTACT
                </Text>
              </View>
            )}

            <View className="flex-row items-start">
              {/* Contact Icon */}
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${getRelationshipColor(contact.relationship)}15` }}
              >
                <Phone size={24} color={getRelationshipColor(contact.relationship)} />
              </View>

              {/* Contact Info */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-text-primary text-lg font-semibold">
                    {contact.name}
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleEditContact(contact)}
                      className="p-2 rounded-full bg-primary/10"
                      activeOpacity={0.7}
                    >
                      <Edit3 size={14} color="#6366f1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteContact(contact)}
                      className="p-2 rounded-full bg-error/10"
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Relationship Badge */}
                <View 
                  className="self-start px-3 py-1 rounded-full mb-3"
                  style={{ backgroundColor: `${getRelationshipColor(contact.relationship)}15` }}
                >
                  <Text 
                    className="text-xs font-medium"
                    style={{ color: getRelationshipColor(contact.relationship) }}
                  >
                    {contact.relationship}
                  </Text>
                </View>

                {/* Contact Details */}
                <View className="space-y-2 mb-4">
                  <TouchableOpacity
                    onPress={() => handleCallContact(contact.phoneNumber)}
                    className="flex-row items-center bg-secondary/10 rounded-lg p-2"
                    activeOpacity={0.7}
                  >
                    <PhoneCall size={16} color="#4CAF50" />
                    <Text className="text-text-primary text-sm font-medium ml-2">
                      +91 {formatIndianPhoneNumber(contact.phoneNumber)}
                    </Text>
                  </TouchableOpacity>
                  
                  {contact.alternatePhone && (
                    <TouchableOpacity
                      onPress={() => handleCallContact(contact.alternatePhone)}
                      className="flex-row items-center bg-background rounded-lg p-2"
                      activeOpacity={0.7}
                    >
                      <Phone size={16} color="#757575" />
                      <Text className="text-text-secondary text-sm ml-2">
                        +91 {formatIndianPhoneNumber(contact.alternatePhone)} (Alternate)
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {contact.address && (
                    <Text className="text-text-secondary text-sm">
                      📍 {contact.address}
                    </Text>
                  )}
                </View>

                {/* Set Primary Button */}
                {!contact.isPrimary && (
                  <TouchableOpacity
                    onPress={() => handleSetPrimary(contact.id)}
                    className="bg-primary/10 rounded-lg py-2 px-3 self-start"
                    activeOpacity={0.7}
                  >
                    <Text className="text-primary text-sm font-medium">
                      Set as Primary
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        ))}

        {/* Empty State */}
        {contacts.length === 0 && (
          <View className="items-center justify-center py-12">
            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Phone size={32} color="#6366f1" />
            </View>
            <Text className="text-text-primary text-lg font-semibold mb-2">
              No Emergency Contacts
            </Text>
            <Text className="text-text-secondary text-center mb-6 px-4">
              Add emergency contacts who can be reached in case of urgent situations.
            </Text>
            <Button onPress={handleAddContact}>
              Add Emergency Contact
            </Button>
          </View>
        )}

        {/* Add Contact Card */}
        {contacts.length > 0 && contacts.length < 5 && (
          <TouchableOpacity
            onPress={handleAddContact}
            className={cn(
              "border-2 border-dashed border-primary/30 rounded-xl p-6",
              "items-center justify-center bg-primary/5",
              "active:bg-primary/10"
            )}
            activeOpacity={0.8}
          >
            <Plus size={24} color="#6366f1" />
            <Text className="text-primary text-body-large font-medium mt-2">
              Add Emergency Contact
            </Text>
            {contacts.length >= 3 && (
              <Text className="text-text-secondary text-sm mt-1">
                Maximum 5 contacts allowed
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Emergency Numbers Card */}
        <Card className="mt-6 bg-error/10 border-error/20">
          <Text className="text-error text-sm font-bold mb-3">
            🚨 Emergency Services
          </Text>
          <View className="space-y-2">
            <TouchableOpacity
              onPress={() => handleCallContact('100')}
              className="flex-row items-center justify-between py-2"
              activeOpacity={0.7}
            >
              <Text className="text-text-primary text-sm font-medium">Police</Text>
              <View className="flex-row items-center">
                <Text className="text-error text-sm font-bold mr-2">100</Text>
                <PhoneCall size={16} color="#D32F2F" />
              </View>
            </TouchableOpacity>
            
            <View className="h-px bg-error/20" />
            
            <TouchableOpacity
              onPress={() => handleCallContact('101')}
              className="flex-row items-center justify-between py-2"
              activeOpacity={0.7}
            >
              <Text className="text-text-primary text-sm font-medium">Fire Brigade</Text>
              <View className="flex-row items-center">
                <Text className="text-error text-sm font-bold mr-2">101</Text>
                <PhoneCall size={16} color="#D32F2F" />
              </View>
            </TouchableOpacity>
            
            <View className="h-px bg-error/20" />
            
            <TouchableOpacity
              onPress={() => handleCallContact('108')}
              className="flex-row items-center justify-between py-2"
              activeOpacity={0.7}
            >
              <Text className="text-text-primary text-sm font-medium">Ambulance</Text>
              <View className="flex-row items-center">
                <Text className="text-error text-sm font-bold mr-2">108</Text>
                <PhoneCall size={16} color="#D32F2F" />
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 bg-secondary/10 border-secondary/20">
          <Text className="text-secondary text-sm font-medium mb-2">
            📞 Emergency Contact Tips
          </Text>
          <Text className="text-text-secondary text-sm leading-5">
            • Add at least 2 emergency contacts{'\n'}
            • Include people from different locations{'\n'}
            • Update contact details regularly{'\n'}
            • Primary contact will be called first{'\n'}
            • Society security has access to these contacts
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}