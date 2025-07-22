import { router } from "expo-router";
import { Calendar, Clock, Phone, User, FileText } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface VisitorFormData {
  visitorName: string;
  contactNumber: string;
  visitDate: string;
  visitTime: string;
  visitPurpose: string;
  category: "Personal" | "Delivery" | "Service" | "Official";
}

const VISITOR_CATEGORIES = [
  { key: "Personal", label: "Personal Visit", description: "Friends, family members" },
  { key: "Delivery", label: "Delivery", description: "Amazon, Flipkart, food delivery" },
  { key: "Service", label: "Service Provider", description: "Plumber, electrician, cleaning" },
  { key: "Official", label: "Official", description: "Government, bank, insurance" },
];

const QUICK_TEMPLATES = [
  { name: "Amazon Delivery", category: "Delivery", purpose: "Package delivery" },
  { name: "Flipkart Delivery", category: "Delivery", purpose: "Package delivery" },
  { name: "Zomato Delivery", category: "Delivery", purpose: "Food delivery" },
  { name: "Plumber", category: "Service", purpose: "Plumbing work" },
  { name: "Electrician", category: "Service", purpose: "Electrical work" },
];

export default function AddVisitor() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Personal");
  const [showTemplates, setShowTemplates] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VisitorFormData>({
    defaultValues: {
      visitorName: "",
      contactNumber: "",
      visitDate: "",
      visitTime: "",
      visitPurpose: "",
      category: "Personal",
    },
  });

  const validatePhoneNumber = (phone: string): boolean => {
    // Indian mobile number validation: starts with 6-9, followed by 9 digits
    const indianMobileRegex = /^[6-9]\d{9}$/;
    return indianMobileRegex.test(phone.replace(/\D/g, ''));
  };

  const formatPhoneNumber = (text: string): string => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    
    // Format as XXX-XXX-XXXX for display
    if (limited.length >= 6) {
      return `${limited.substring(0, 3)}-${limited.substring(3, 6)}-${limited.substring(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.substring(0, 3)}-${limited.substring(3)}`;
    }
    
    return limited;
  };

  const onSubmit = (data: VisitorFormData) => {
    // Validate phone number
    const cleanedPhone = data.contactNumber.replace(/\D/g, '');
    if (!validatePhoneNumber(cleanedPhone)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid Indian mobile number (10 digits, starting with 6-9)");
      return;
    }

    console.log("Visitor data:", {
      ...data,
      contactNumber: cleanedPhone,
      category: selectedCategory,
    });
    
    Alert.alert("Success", "Visitor added successfully!", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  const useTemplate = (template: any) => {
    setValue("visitorName", template.name);
    setValue("visitPurpose", template.purpose);
    setSelectedCategory(template.category);
    setValue("category", template.category as any);
    setShowTemplates(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Quick Templates */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-headline-medium font-semibold text-text-primary">
              Quick Add
            </Text>
            <TouchableOpacity
              onPress={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1 bg-primary/10 rounded-full"
            >
              <Text className="text-primary text-label-medium font-medium">
                {showTemplates ? "Hide" : "Show"} Templates
              </Text>
            </TouchableOpacity>
          </View>
          
          {showTemplates && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {QUICK_TEMPLATES.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => useTemplate(template)}
                  className="bg-surface border border-divider rounded-lg p-3 mr-3 min-w-32"
                >
                  <Text className="text-body-medium font-semibold text-text-primary mb-1">
                    {template.name}
                  </Text>
                  <Text className="text-label-small text-text-secondary">
                    {template.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Visitor Category */}
        <View className="mb-6">
          <Text className="text-headline-medium font-semibold text-text-primary mb-3">
            Visitor Type
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {VISITOR_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => {
                  setSelectedCategory(category.key);
                  setValue("category", category.key as any);
                }}
                className={`flex-1 min-w-40 p-4 rounded-xl border ${
                  selectedCategory === category.key
                    ? "bg-primary/5 border-primary"
                    : "bg-surface border-divider"
                }`}
              >
                <Text
                  className={`text-body-large font-semibold mb-1 ${
                    selectedCategory === category.key
                      ? "text-primary"
                      : "text-text-primary"
                  }`}
                >
                  {category.label}
                </Text>
                <Text className="text-label-medium text-text-secondary">
                  {category.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visitor Name */}
        <View className="mb-4">
          <Text className="text-headline-medium font-semibold text-text-primary mb-2">
            Visitor Name
          </Text>
          <Controller
            control={control}
            rules={{
              required: "Visitor name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters"
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="relative">
                <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                  <User size={20} className="text-text-secondary" />
                </View>
                <TextInput
                  placeholder="Enter visitor's full name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="w-full p-4 pl-12 border border-divider rounded-xl bg-surface text-text-primary text-body-large placeholder:text-text-secondary"
                />
              </View>
            )}
            name="visitorName"
          />
          {errors.visitorName && (
            <Text className="text-error text-body-medium mt-2">
              {errors.visitorName.message}
            </Text>
          )}
        </View>

        {/* Contact Number */}
        <View className="mb-4">
          <Text className="text-headline-medium font-semibold text-text-primary mb-2">
            Contact Number
          </Text>
          <Controller
            control={control}
            rules={{
              required: "Contact number is required",
              validate: (value) => {
                const cleaned = value.replace(/\D/g, '');
                if (!validatePhoneNumber(cleaned)) {
                  return "Enter a valid Indian mobile number (10 digits, starting with 6-9)";
                }
                return true;
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="relative">
                <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                  <Phone size={20} className="text-text-secondary" />
                </View>
                <TextInput
                  placeholder="9876543210"
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const formatted = formatPhoneNumber(text);
                    onChange(formatted);
                  }}
                  value={value}
                  keyboardType="phone-pad"
                  maxLength={12} // XXX-XXX-XXXX format
                  className="w-full p-4 pl-12 border border-divider rounded-xl bg-surface text-text-primary text-body-large placeholder:text-text-secondary"
                />
              </View>
            )}
            name="contactNumber"
          />
          {errors.contactNumber && (
            <Text className="text-error text-body-medium mt-2">
              {errors.contactNumber.message}
            </Text>
          )}
        </View>

        {/* Date and Time Row */}
        <View className="flex-row gap-4 mb-4">
          {/* Visit Date */}
          <View className="flex-1">
            <Text className="text-headline-medium font-semibold text-text-primary mb-2">
              Visit Date
            </Text>
            <Controller
              control={control}
              rules={{
                required: "Visit date is required"
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <Calendar size={20} className="text-primary" />
                  </View>
                  <TextInput
                    placeholder="DD/MM/YYYY"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="w-full p-4 pl-12 border border-divider rounded-xl bg-surface text-text-primary text-body-large placeholder:text-text-secondary"
                  />
                </View>
              )}
              name="visitDate"
            />
            {errors.visitDate && (
              <Text className="text-error text-body-medium mt-2">
                {errors.visitDate.message}
              </Text>
            )}
          </View>

          {/* Visit Time */}
          <View className="flex-1">
            <Text className="text-headline-medium font-semibold text-text-primary mb-2">
              Visit Time
            </Text>
            <Controller
              control={control}
              rules={{
                required: "Visit time is required"
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <Clock size={20} className="text-primary" />
                  </View>
                  <TextInput
                    placeholder="10:00 AM"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="w-full p-4 pl-12 border border-divider rounded-xl bg-surface text-text-primary text-body-large placeholder:text-text-secondary"
                  />
                </View>
              )}
              name="visitTime"
            />
            {errors.visitTime && (
              <Text className="text-error text-body-medium mt-2">
                {errors.visitTime.message}
              </Text>
            )}
          </View>
        </View>

        {/* Purpose of Visit */}
        <View className="mb-6">
          <Text className="text-headline-medium font-semibold text-text-primary mb-2">
            Purpose of Visit
          </Text>
          <Controller
            control={control}
            rules={{
              required: "Purpose of visit is required",
              minLength: {
                value: 3,
                message: "Purpose must be at least 3 characters"
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <FileText size={20} className="text-text-secondary" />
                </View>
                <TextInput
                  placeholder="Brief description of the visit purpose"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="w-full p-4 pl-12 border border-divider rounded-xl bg-surface text-text-primary text-body-large placeholder:text-text-secondary min-h-20"
                />
              </View>
            )}
            name="visitPurpose"
          />
          {errors.visitPurpose && (
            <Text className="text-error text-body-medium mt-2">
              {errors.visitPurpose.message}
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="bg-primary p-4 rounded-xl mb-6"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold text-headline-medium">
            Add Visitor
          </Text>
        </TouchableOpacity>

        {/* Info Card */}
        <View className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <Text className="text-primary text-body-medium font-semibold mb-2">
            📱 Quick Tip
          </Text>
          <Text className="text-text-secondary text-body-medium leading-5">
            Your visitor will receive a QR code once approved. They can show this at the gate for quick entry.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}