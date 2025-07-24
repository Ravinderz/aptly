import React, { useState } from 'react';
import { ScrollView, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Plus, Edit3, Trash2, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';
import { showDeleteConfirmAlert } from '../../../utils/alert';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  phoneNumber?: string;
  occupation?: string;
  aadharNumber?: string;
}

export default function FamilyMembers() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Priya Kumar',
      relationship: 'Wife',
      age: 32,
      phoneNumber: '+91 98765 43211',
      occupation: 'Teacher',
      aadharNumber: '2345 6789 0123',
    },
    {
      id: '2',
      name: 'Arjun Kumar',
      relationship: 'Son',
      age: 8,
      occupation: 'Student',
    },
    {
      id: '3',
      name: 'Kavya Kumar',
      relationship: 'Daughter',
      age: 5,
      occupation: 'Student',
    },
  ]);

  const handleAddMember = () => {
    router.push('/(tabs)/settings/add-family-member');
  };

  const handleEditMember = (member: FamilyMember) => {
    router.push(`/(tabs)/settings/edit-family-member/${member.id}`);
  };

  const handleDeleteMember = (member: FamilyMember) => {
    showDeleteConfirmAlert(
      'Remove Family Member',
      `Are you sure you want to remove ${member.name} from your family list?`,
      () => {
        setFamilyMembers(prev => prev.filter(m => m.id !== member.id));
      }
    );
  };

  const getRelationshipColor = (relationship: string) => {
    const colors = {
      'Wife': '#4CAF50',
      'Husband': '#4CAF50',
      'Son': '#2196F3',
      'Daughter': '#E91E63',
      'Father': '#FF9800',
      'Mother': '#9C27B0',
      'Brother': '#00BCD4',
      'Sister': '#FF5722',
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
            Family Members
          </Text>
        </View>
        
        <Button size="sm" onPress={handleAddMember}>
          <Plus size={16} color="white" />
        </Button>
      </View>

      <ScrollView 
        className="flex-1 p-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Family Members List */}
        {familyMembers.map((member, index) => (
          <Card key={member.id} className="mb-4">
            <View className="flex-row items-start">
              {/* Avatar */}
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mr-4">
                <User size={24} color="#6366f1" />
              </View>

              {/* Member Info */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-text-primary text-headline-medium font-semibold">
                    {member.name}
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleEditMember(member)}
                      className="p-2 rounded-full bg-primary/10"
                      activeOpacity={0.7}
                    >
                      <Edit3 size={14} color="#6366f1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteMember(member)}
                      className="p-2 rounded-full bg-error/10"
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Relationship Badge */}
                <View 
                  className="self-start px-3 py-1 rounded-full mb-2"
                  style={{ backgroundColor: `${getRelationshipColor(member.relationship)}15` }}
                >
                  <Text 
                    className="text-label-large font-medium"
                    style={{ color: getRelationshipColor(member.relationship) }}
                  >
                    {member.relationship}
                  </Text>
                </View>

                {/* Member Details */}
                <View className="space-y-1">
                  <Text className="text-text-secondary text-body-medium">
                    Age: {member.age} years
                  </Text>
                  
                  {member.phoneNumber && (
                    <Text className="text-text-secondary text-body-medium">
                      Phone: {member.phoneNumber}
                    </Text>
                  )}
                  
                  {member.occupation && (
                    <Text className="text-text-secondary text-body-medium">
                      Occupation: {member.occupation}
                    </Text>
                  )}
                  
                  {member.aadharNumber && (
                    <Text className="text-text-secondary text-body-medium">
                      Aadhar: {member.aadharNumber}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </Card>
        ))}

        {/* Empty State */}
        {familyMembers.length === 0 && (
          <View className="items-center justify-center py-12">
            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-4">
              <User size={32} color="#6366f1" />
            </View>
            <Text className="text-text-primary text-headline-medium font-semibold mb-2">
              No Family Members Added
            </Text>
            <Text className="text-text-secondary text-center mb-6 px-4">
              Add your family members to help with visitor management and emergency contacts.
            </Text>
            <Button onPress={handleAddMember}>
              Add Family Member
            </Button>
          </View>
        )}

        {/* Add Member Card */}
        {familyMembers.length > 0 && (
          <TouchableOpacity
            onPress={handleAddMember}
            className={cn(
              "border-2 border-dashed border-primary/30 rounded-xl p-6",
              "items-center justify-center bg-primary/5",
              "active:bg-primary/10"
            )}
            activeOpacity={0.8}
          >
            <Plus size={24} color="#6366f1" />
            <Text className="text-primary text-body-large font-medium mt-2">
              Add Family Member
            </Text>
          </TouchableOpacity>
        )}

        {/* Info Card */}
        <Card className="mt-6 bg-secondary/10 border-secondary/20">
          <Text className="text-secondary text-body-medium font-medium mb-2">
            💡 Family Member Benefits
          </Text>
          <Text className="text-text-secondary text-body-medium leading-5">
            • Pre-approve visitors for family members{'\n'}
            • Emergency contact management{'\n'}
            • Society directory access{'\n'}
            • Event and notification preferences
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}