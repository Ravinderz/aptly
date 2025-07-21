import { useRouter } from "expo-router";
import { ArrowLeft, CreditCard, Calendar, Shield, CheckCircle, AlertTriangle, Info, Settings } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Switch } from "react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showAlert, showDeleteConfirmAlert } from "@/utils/alert";
import HighlightCard from "@/components/ui/HighlightCard";

interface AutoPayRule {
  id: string;
  billType: string;
  enabled: boolean;
  paymentMethod: string;
  daysBefore: number;
  maxAmount: number;
  lastTriggered?: string;
  status: "active" | "paused" | "failed";
}

interface PaymentMethod {
  id: string;
  name: string;
  details: string;
  type: string;
}

export default function AutoPaySetup() {
  const router = useRouter();
  
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("1");
  
  const paymentMethods: PaymentMethod[] = [
    { id: "1", name: "HDFC Credit Card", details: "**** **** **** 1234", type: "card" },
    { id: "2", name: "PhonePe UPI", details: "priya.kumar@ybl", type: "upi" },
    { id: "3", name: "HDFC Savings", details: "****1234 - Auto Debit", type: "bank" }
  ];

  const [autoPayRules, setAutoPayRules] = useState<AutoPayRule[]>([
    {
      id: "1",
      billType: "Maintenance Bills",
      enabled: true,
      paymentMethod: "1",
      daysBefore: 2,
      maxAmount: 10000,
      lastTriggered: "2024-03-01",
      status: "active"
    },
    {
      id: "2", 
      billType: "Water Bills",
      enabled: true,
      paymentMethod: "1",
      daysBefore: 3,
      maxAmount: 2000,
      lastTriggered: "2024-02-20",
      status: "active"
    },
    {
      id: "3",
      billType: "Common Area Maintenance",
      enabled: false,
      paymentMethod: "1",
      daysBefore: 1,
      maxAmount: 5000,
      status: "paused"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-success";
      case "paused": return "text-warning";
      case "failed": return "text-error";
      default: return "text-text-secondary";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/20";
      case "paused": return "bg-warning/20";
      case "failed": return "bg-error/20";
      default: return "bg-text-secondary/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle size={16} color="#4CAF50" />;
      case "paused": return <AlertTriangle size={16} color="#FF9800" />;
      case "failed": return <AlertTriangle size={16} color="#D32F2F" />;
      default: return <Info size={16} color="#757575" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleToggleRule = (ruleId: string) => {
    setAutoPayRules(prev =>
      prev.map(rule =>
        rule.id === ruleId
          ? { 
              ...rule, 
              enabled: !rule.enabled,
              status: !rule.enabled ? "active" : "paused"
            }
          : rule
      )
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    const rule = autoPayRules.find(r => r.id === ruleId);
    if (!rule) return;

    showDeleteConfirmAlert(
      "Delete Auto Pay Rule",
      `Are you sure you want to delete the auto pay rule for ${rule.billType}?`,
      () => {
        setAutoPayRules(prev => prev.filter(r => r.id !== ruleId));
        showAlert("Rule Deleted", "Auto pay rule has been deleted successfully");
      }
    );
  };

  const handleTestAutoPayment = () => {
    showAlert(
      "Test Auto Payment", 
      "A test transaction of ₹1 will be processed to verify your payment method. This amount will be refunded immediately."
    );
  };

  const handleSetupNewRule = () => {
    showAlert(
      "Add New Rule", 
      "Feature to add custom auto pay rules for different bill types would be implemented here."
    );
  };

  const totalAutoPayBudget = autoPayRules
    .filter(rule => rule.enabled)
    .reduce((sum, rule) => sum + rule.maxAmount, 0);

  const activeRules = autoPayRules.filter(rule => rule.enabled && rule.status === "active").length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">Auto Pay Setup</Text>
          <Text className="text-text-secondary text-sm">
            {activeRules} active rules • {formatCurrency(totalAutoPayBudget)} monthly budget
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/services/billing/settings")}
          className="p-2"
        >
          <Settings size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-6">
          {/* Master Toggle */}
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-semibold text-text-primary mb-1">Auto Pay</Text>
                <Text className="text-text-secondary text-sm">
                  Automatically pay bills before due date to avoid late fees
                </Text>
              </View>
              <Switch
                value={autoPayEnabled}
                onValueChange={setAutoPayEnabled}
                trackColor={{ false: "#E0E0E0", true: "#6366f1" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>

          {autoPayEnabled && (
            <>
              {/* Default Payment Method */}
              <Card>
                <Text className="text-lg font-semibold text-text-primary mb-4">Default Payment Method</Text>
                <View className="space-y-3">
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => setSelectedPaymentMethod(method.id)}
                      className={`flex-row items-center p-4 rounded-xl border ${
                        selectedPaymentMethod === method.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-divider"
                      }`}
                    >
                      <View className="mr-3">
                        <CreditCard size={20} color="#6366f1" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-text-primary font-medium">{method.name}</Text>
                        <Text className="text-text-secondary text-sm">{method.details}</Text>
                      </View>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle size={20} color="#6366f1" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onPress={handleTestAutoPayment}
                >
                  Test Payment Method
                </Button>
              </Card>

              {/* Auto Pay Rules */}
              <Card>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-semibold text-text-primary">Auto Pay Rules</Text>
                  <TouchableOpacity 
                    onPress={handleSetupNewRule}
                    className="bg-primary rounded-lg px-3 py-2"
                  >
                    <Text className="text-white text-sm font-medium">Add Rule</Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  {autoPayRules.map((rule) => (
                    <View key={rule.id} className="bg-background rounded-xl p-4">
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <Text className="text-text-primary font-semibold">{rule.billType}</Text>
                            <View className={`ml-2 px-2 py-1 rounded-full ${getStatusBgColor(rule.status)}`}>
                              <View className="flex-row items-center">
                                {getStatusIcon(rule.status)}
                                <Text className={`text-xs font-medium ml-1 capitalize ${getStatusColor(rule.status)}`}>
                                  {rule.status}
                                </Text>
                              </View>
                            </View>
                          </View>
                          
                          <View className="space-y-1">
                            <Text className="text-text-secondary text-sm">
                              Pay {rule.daysBefore} days before due date
                            </Text>
                            <Text className="text-text-secondary text-sm">
                              Max amount: {formatCurrency(rule.maxAmount)}
                            </Text>
                            {rule.lastTriggered && (
                              <Text className="text-text-secondary text-xs">
                                Last triggered: {formatDate(rule.lastTriggered)}
                              </Text>
                            )}
                          </View>
                        </View>
                        
                        <View className="flex-row items-center gap-3">
                          <Switch
                            value={rule.enabled}
                            onValueChange={() => handleToggleRule(rule.id)}
                            trackColor={{ false: "#E0E0E0", true: "#6366f1" }}
                            thumbColor="#FFFFFF"
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                          />
                        </View>
                      </View>

                      {rule.enabled && (
                        <View className="pt-3 border-t border-divider">
                          <View className="flex-row justify-between items-center">
                            <Text className="text-text-secondary text-sm">Next auto pay in</Text>
                            <Text className="text-primary font-medium text-sm">2 days</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </Card>

              {/* Auto Pay Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <Text className="text-primary font-semibold mb-3">Auto Pay Summary</Text>
                <View className="space-y-3">
                  <View className="flex-row justify-between">
                    <Text className="text-text-secondary">Active Rules</Text>
                    <Text className="text-text-primary font-medium">{activeRules}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-text-secondary">Monthly Budget</Text>
                    <Text className="text-text-primary font-medium">{formatCurrency(totalAutoPayBudget)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-text-secondary">Payment Method</Text>
                    <Text className="text-text-primary font-medium">
                      {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-text-secondary">Next Payment</Text>
                    <Text className="text-primary font-medium">Tomorrow</Text>
                  </View>
                </View>
              </Card>

              {/* Safety Features */}
              <Card>
                <Text className="text-lg font-semibold text-text-primary mb-4">Safety Features</Text>
                <View className="space-y-4">
                  <View className="flex-row items-start">
                    <Shield size={20} color="#4CAF50" className="mr-3 mt-1" />
                    <View className="flex-1">
                      <Text className="text-text-primary font-medium mb-1">Amount Limits</Text>
                      <Text className="text-text-secondary text-sm">
                        Auto pay will only trigger for amounts within your set limits
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-start">
                    <Calendar size={20} color="#4CAF50" className="mr-3 mt-1" />
                    <View className="flex-1">
                      <Text className="text-text-primary font-medium mb-1">Timing Control</Text>
                      <Text className="text-text-secondary text-sm">
                        Payments are scheduled based on your preferred timing
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-start">
                    <CheckCircle size={20} color="#4CAF50" className="mr-3 mt-1" />
                    <View className="flex-1">
                      <Text className="text-text-primary font-medium mb-1">Instant Notifications</Text>
                      <Text className="text-text-secondary text-sm">
                        Get notified immediately when auto payments are processed
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>

              {/* Important Notice */}
              <HighlightCard
                title="Important Notice"
                variant="warning"
                size="md"
              >
                <Text className="text-text-secondary leading-5">
                  • Auto payments will be processed only if sufficient balance is available{'\n'}
                  • You'll receive notifications 24 hours before auto payment{'\n'}
                  • You can cancel or modify auto payments anytime{'\n'}
                  • Failed payments will retry once after 24 hours
                </Text>
              </HighlightCard>
            </>
          )}

          {!autoPayEnabled && (
            <Card className="items-center py-8">
              <View className="w-20 h-20 rounded-full bg-warning/10 items-center justify-center mb-4">
                <Calendar size={32} color="#FF9800" />
              </View>
              <Text className="text-text-primary text-lg font-semibold mb-2 text-center">
                Auto Pay is Disabled
              </Text>
              <Text className="text-text-secondary text-center mb-6">
                Enable auto pay to automatically pay your bills on time and avoid late fees.
              </Text>
              <Button onPress={() => setAutoPayEnabled(true)}>
                Enable Auto Pay
              </Button>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}