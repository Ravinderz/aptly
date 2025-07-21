import { useRouter } from "expo-router";
import { ArrowLeft, CreditCard, Smartphone, Building2, Shield, Bell, Download, Trash2, Plus, Edit3, Check } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Switch, TextInput } from "react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showAlert, showDeleteConfirmAlert } from "@/utils/alert";

interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "upi" | "wallet";
  name: string;
  details: string;
  isDefault: boolean;
  lastUsed?: string;
}

interface BillingSettings {
  autoPayEnabled: boolean;
  defaultPaymentMethod: string;
  autoPayDay: number; // Days before due date
  reminderEnabled: boolean;
  reminderDays: number;
  gstDetails: {
    registered: boolean;
    gstin?: string;
    businessName?: string;
  };
  downloadFormat: "pdf" | "excel";
  currency: "INR";
}

export default function BillingSettings() {
  const router = useRouter();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      name: "HDFC Credit Card",
      details: "**** **** **** 1234",
      isDefault: true,
      lastUsed: "2024-03-02"
    },
    {
      id: "2",
      type: "upi",
      name: "PhonePe",
      details: "priya.kumar@ybl",
      isDefault: false,
      lastUsed: "2024-02-25"
    },
    {
      id: "3",
      type: "bank",
      name: "HDFC Savings",
      details: "****1234 - Auto Debit",
      isDefault: false
    }
  ]);

  const [settings, setSettings] = useState<BillingSettings>({
    autoPayEnabled: true,
    defaultPaymentMethod: "1",
    autoPayDay: 2,
    reminderEnabled: true,
    reminderDays: 3,
    gstDetails: {
      registered: false,
      gstin: "",
      businessName: ""
    },
    downloadFormat: "pdf",
    currency: "INR"
  });

  const [editingGST, setEditingGST] = useState(false);

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "card": return <CreditCard size={20} color="#6366f1" />;
      case "upi": return <Smartphone size={20} color="#FF9800" />;
      case "bank": return <Building2 size={20} color="#4CAF50" />;
      case "wallet": return <Smartphone size={20} color="#9C27B0" />;
      default: return <CreditCard size={20} color="#6366f1" />;
    }
  };

  const handleSetDefaultPaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    setSettings(prev => ({ ...prev, defaultPaymentMethod: methodId }));
    showAlert("Default Payment Method", "Payment method updated successfully");
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    if (method.isDefault) {
      showAlert("Cannot Delete", "Cannot delete the default payment method. Please set another method as default first.");
      return;
    }

    showDeleteConfirmAlert(
      "Delete Payment Method",
      `Are you sure you want to delete ${method.name}?`,
      () => {
        setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      }
    );
  };

  const handleAddPaymentMethod = () => {
    showAlert("Add Payment Method", "This feature would integrate with payment gateways to add new payment methods.");
  };

  const updateSetting = (key: keyof BillingSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveGSTDetails = () => {
    setEditingGST(false);
    showAlert("GST Details Saved", "Your GST information has been updated successfully");
  };

  const validateGSTIN = (gstin: string): boolean => {
    // Basic GSTIN validation (15 characters, alphanumeric)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">Billing Settings</Text>
          <Text className="text-text-secondary text-sm">Manage payments and preferences</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-6">
          {/* Auto Pay Settings */}
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-text-primary mb-1">Auto Pay</Text>
                <Text className="text-text-secondary text-sm">
                  Automatically pay bills before due date
                </Text>
              </View>
              <Switch
                value={settings.autoPayEnabled}
                onValueChange={(value) => updateSetting("autoPayEnabled", value)}
                trackColor={{ false: "#E0E0E0", true: "#6366f1" }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            {settings.autoPayEnabled && (
              <View className="space-y-4 pt-4 border-t border-divider">
                <View>
                  <Text className="text-text-primary font-medium mb-2">Auto Pay Timing</Text>
                  <Text className="text-text-secondary text-sm mb-3">
                    Pay bills {settings.autoPayDay} days before due date
                  </Text>
                  <View className="flex-row gap-2">
                    {[1, 2, 3, 5, 7].map((days) => (
                      <TouchableOpacity
                        key={days}
                        onPress={() => updateSetting("autoPayDay", days)}
                        className={`px-4 py-2 rounded-lg border ${
                          settings.autoPayDay === days
                            ? "bg-primary border-primary"
                            : "bg-background border-divider"
                        }`}
                      >
                        <Text
                          className={`font-medium ${
                            settings.autoPayDay === days ? "text-white" : "text-text-secondary"
                          }`}
                        >
                          {days}d
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </Card>

          {/* Payment Methods */}
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-text-primary">Payment Methods</Text>
              <TouchableOpacity
                onPress={handleAddPaymentMethod}
                className="bg-primary rounded-full p-2"
              >
                <Plus size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-3">
              {paymentMethods.map((method) => (
                <View key={method.id} className="bg-background rounded-xl p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <View className="mr-3">
                        {getPaymentMethodIcon(method.type)}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-text-primary font-medium">{method.name}</Text>
                          {method.isDefault && (
                            <View className="bg-success rounded-full px-2 py-1 ml-2">
                              <Text className="text-white text-xs font-bold">DEFAULT</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-text-secondary text-sm">{method.details}</Text>
                        {method.lastUsed && (
                          <Text className="text-text-secondary text-xs">
                            Last used: {new Date(method.lastUsed).toLocaleDateString('en-IN')}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View className="flex-row gap-2">
                      {!method.isDefault && (
                        <TouchableOpacity
                          onPress={() => handleSetDefaultPaymentMethod(method.id)}
                          className="p-2 rounded-full bg-primary/10"
                        >
                          <Check size={14} color="#6366f1" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeletePaymentMethod(method.id)}
                        className="p-2 rounded-full bg-error/10"
                        disabled={method.isDefault}
                      >
                        <Trash2 
                          size={14} 
                          color={method.isDefault ? "#CCCCCC" : "#D32F2F"} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* GST Details */}
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-text-primary">GST Details</Text>
              <TouchableOpacity
                onPress={() => setEditingGST(!editingGST)}
                className="p-2 rounded-full bg-primary/10"
              >
                <Edit3 size={16} color="#6366f1" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-text-primary font-medium">GST Registered</Text>
                <Switch
                  value={settings.gstDetails.registered}
                  onValueChange={(value) => updateSetting("gstDetails", { 
                    ...settings.gstDetails, 
                    registered: value 
                  })}
                  trackColor={{ false: "#E0E0E0", true: "#6366f1" }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              {settings.gstDetails.registered && (
                <View className="space-y-4 pt-4 border-t border-divider">
                  <View>
                    <Text className="text-text-primary font-medium mb-2">GSTIN</Text>
                    {editingGST ? (
                      <TextInput
                        className="bg-background border border-divider rounded-lg px-3 py-3 text-text-primary"
                        placeholder="Enter GSTIN (15 characters)"
                        value={settings.gstDetails.gstin}
                        onChangeText={(text) => updateSetting("gstDetails", {
                          ...settings.gstDetails,
                          gstin: text.toUpperCase()
                        })}
                        maxLength={15}
                        autoCapitalize="characters"
                      />
                    ) : (
                      <Text className="text-text-secondary">
                        {settings.gstDetails.gstin || "Not provided"}
                      </Text>
                    )}
                  </View>
                  
                  <View>
                    <Text className="text-text-primary font-medium mb-2">Business Name</Text>
                    {editingGST ? (
                      <TextInput
                        className="bg-background border border-divider rounded-lg px-3 py-3 text-text-primary"
                        placeholder="Enter registered business name"
                        value={settings.gstDetails.businessName}
                        onChangeText={(text) => updateSetting("gstDetails", {
                          ...settings.gstDetails,
                          businessName: text
                        })}
                      />
                    ) : (
                      <Text className="text-text-secondary">
                        {settings.gstDetails.businessName || "Not provided"}
                      </Text>
                    )}
                  </View>
                  
                  {editingGST && (
                    <Button onPress={handleSaveGSTDetails}>
                      Save GST Details
                    </Button>
                  )}
                </View>
              )}
            </View>
          </Card>

          {/* Download & Export Settings */}
          <Card>
            <Text className="text-lg font-semibold text-text-primary mb-4">Download Settings</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-text-primary font-medium mb-3">Default Download Format</Text>
                <View className="flex-row gap-3">
                  {[
                    { key: "pdf", label: "PDF", icon: <Download size={16} color="#D32F2F" /> },
                    { key: "excel", label: "Excel", icon: <Download size={16} color="#4CAF50" /> }
                  ].map((format) => (
                    <TouchableOpacity
                      key={format.key}
                      onPress={() => updateSetting("downloadFormat", format.key)}
                      className={`flex-1 flex-row items-center justify-center py-3 rounded-lg border ${
                        settings.downloadFormat === format.key
                          ? "bg-primary border-primary"
                          : "bg-background border-divider"
                      }`}
                    >
                      <View className="mr-2">
                        {format.icon}
                      </View>
                      <Text
                        className={`font-medium ${
                          settings.downloadFormat === format.key ? "text-white" : "text-text-secondary"
                        }`}
                      >
                        {format.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </Card>

          {/* Security & Privacy */}
          <Card>
            <Text className="text-lg font-semibold text-text-primary mb-4">Security & Privacy</Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-text-primary font-medium mb-1">Biometric Authentication</Text>
                  <Text className="text-text-secondary text-sm">Use fingerprint/face ID for payments</Text>
                </View>
                <Switch
                  value={true}
                  onValueChange={(value) => showAlert("Security", "Biometric authentication settings would be managed here")}
                  trackColor={{ false: "#E0E0E0", true: "#6366f1" }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-text-primary font-medium mb-1">Save Payment History</Text>
                  <Text className="text-text-secondary text-sm">Store payment history for easy access</Text>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: "#E0E0E0", true: "#6366f1" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </Card>

          {/* Reset Settings */}
          <View className="space-y-3">
            <Button 
              variant="outline"
              onPress={() => {
                showAlert("Settings Reset", "All billing settings have been reset to defaults");
              }}
            >
              Reset All Settings
            </Button>
            
            <Button 
              variant="outline"
              className="border-error"
              onPress={() => {
                showDeleteConfirmAlert(
                  "Clear Payment History",
                  "This will permanently delete all payment history. This action cannot be undone.",
                  () => {
                    showAlert("Data Cleared", "Payment history has been cleared");
                  }
                );
              }}
            >
              <Text className="text-error font-medium">Clear Payment History</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}