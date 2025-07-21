import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Calendar, AlertCircle, CheckCircle, Settings, Trash2, BellRing, BellOff } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Switch } from "react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showDeleteConfirmAlert, showAlert } from "@/utils/alert";

interface Notification {
  id: string;
  type: "payment_reminder" | "payment_success" | "bill_generated" | "overdue" | "auto_pay";
  title: string;
  message: string;
  amount?: number;
  billId?: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
}

interface NotificationSettings {
  paymentReminders: boolean;
  billGenerated: boolean;
  paymentSuccess: boolean;
  overdueAlerts: boolean;
  autoPayNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderDays: number;
}

export default function BillingNotifications() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">("notifications");
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "overdue",
      title: "Overdue Payment Alert",
      message: "Your maintenance bill for March 2024 is overdue. Please pay ₹6,195 to avoid late fees.",
      amount: 6195,
      billId: "1",
      timestamp: "2024-04-02T10:30:00Z",
      read: false,
      urgent: true
    },
    {
      id: "2", 
      type: "payment_reminder",
      title: "Payment Due Tomorrow",
      message: "Water bill payment of ₹885 is due tomorrow. Pay now to avoid late charges.",
      amount: 885,
      billId: "2",
      timestamp: "2024-04-04T09:00:00Z", 
      read: false,
      urgent: false
    },
    {
      id: "3",
      type: "bill_generated",
      title: "New Bill Generated",
      message: "Common Area Maintenance bill for ₹3,304 has been generated. Due date: April 15, 2024.",
      amount: 3304,
      billId: "5",
      timestamp: "2024-04-01T14:20:00Z",
      read: true,
      urgent: false
    },
    {
      id: "4",
      type: "payment_success",
      title: "Payment Successful",
      message: "Your payment of ₹802 for February water bill has been processed successfully.",
      amount: 802,
      billId: "4",
      timestamp: "2024-03-02T11:45:00Z",
      read: true,
      urgent: false
    },
    {
      id: "5",
      type: "auto_pay",
      title: "Auto Pay Scheduled",
      message: "Auto payment of ₹6,195 for maintenance bill is scheduled for tomorrow.",
      amount: 6195,
      billId: "1",
      timestamp: "2024-03-30T16:00:00Z",
      read: true,
      urgent: false
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    paymentReminders: true,
    billGenerated: true,
    paymentSuccess: true,
    overdueAlerts: true,
    autoPayNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    reminderDays: 3
  });

  const getNotificationIcon = (type: string, urgent: boolean) => {
    const color = urgent ? "#D32F2F" : "#6366f1";
    const size = 20;
    
    switch (type) {
      case "overdue": return <AlertCircle size={size} color="#D32F2F" />;
      case "payment_reminder": return <Calendar size={size} color="#FF9800" />;
      case "bill_generated": return <Bell size={size} color={color} />;
      case "payment_success": return <CheckCircle size={size} color="#4CAF50" />;
      case "auto_pay": return <BellRing size={size} color={color} />;
      default: return <Bell size={size} color={color} />;
    }
  };

  const getNotificationBgColor = (type: string, urgent: boolean) => {
    if (urgent) return "bg-error/10 border-error/20";
    
    switch (type) {
      case "overdue": return "bg-error/10 border-error/20";
      case "payment_reminder": return "bg-warning/10 border-warning/20";
      case "payment_success": return "bg-success/10 border-success/20";
      case "auto_pay": return "bg-primary/10 border-primary/20";
      default: return "bg-surface border-divider";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    showDeleteConfirmAlert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      () => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    showAlert("Success", "All notifications marked as read");
  };

  const handleClearAll = () => {
    showDeleteConfirmAlert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications? This action cannot be undone.",
      () => {
        setNotifications([]);
      }
    );
  };

  const handleNotificationTap = (notification: Notification) => {
    // Mark as read
    handleMarkAsRead(notification.id);
    
    // Navigate to bill if applicable
    if (notification.billId) {
      router.push(`/(tabs)/services/billing/${notification.billId}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateSetting = (key: keyof NotificationSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">Notifications</Text>
          {activeTab === "notifications" && unreadCount > 0 && (
            <Text className="text-text-secondary text-sm">{unreadCount} unread notifications</Text>
          )}
        </View>
        {activeTab === "notifications" && notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} className="mr-2">
            <Text className="text-primary font-medium text-sm">Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-surface border-b border-divider">
        {[
          { key: "notifications", label: "Notifications", count: unreadCount },
          { key: "settings", label: "Settings", count: 0 }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as "notifications" | "settings")}
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === tab.key ? "border-primary" : "border-transparent"
            }`}
          >
            <Text
              className={`font-medium ${
                activeTab === tab.key ? "text-primary" : "text-text-secondary"
              }`}
            >
              {tab.label}
              {tab.count > 0 && ` (${tab.count})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === "notifications" ? (
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Bell size={32} color="#6366f1" />
              </View>
              <Text className="text-text-primary text-lg font-semibold mb-2">No Notifications</Text>
              <Text className="text-text-secondary text-center">
                You're all caught up! Billing notifications will appear here.
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => handleNotificationTap(notification)}
                  className={`${getNotificationBgColor(notification.type, notification.urgent)} rounded-2xl p-4 border ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View className="mr-3">
                        {getNotificationIcon(notification.type, notification.urgent)}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className={`text-lg font-semibold ${
                            notification.urgent ? "text-error" : "text-text-primary"
                          }`}>
                            {notification.title}
                          </Text>
                          {!notification.read && (
                            <View className="w-2 h-2 bg-primary rounded-full ml-2" />
                          )}
                        </View>
                        <Text className="text-text-secondary text-sm">
                          {formatTimestamp(notification.timestamp)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteNotification(notification.id)}
                      className="p-2 rounded-full bg-error/10"
                    >
                      <Trash2 size={14} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text className="text-text-primary leading-5 mb-3">
                    {notification.message}
                  </Text>
                  
                  {notification.amount && (
                    <View className="bg-background/50 rounded-lg p-3">
                      <Text className="text-text-primary font-bold">
                        Amount: {formatCurrency(notification.amount)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              
              {notifications.length > 3 && (
                <TouchableOpacity
                  onPress={handleClearAll}
                  className="bg-error/10 rounded-xl p-4 items-center"
                >
                  <Text className="text-error font-medium">Clear All Notifications</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="space-y-6">
            {/* Notification Types */}
            <Card>
              <Text className="text-lg font-semibold text-text-primary mb-4">Notification Types</Text>
              <View className="space-y-4">
                {[
                  { key: "paymentReminders", label: "Payment Reminders", description: "Get notified before bills are due" },
                  { key: "billGenerated", label: "New Bills", description: "Notification when new bills are generated" },
                  { key: "paymentSuccess", label: "Payment Success", description: "Confirmation when payments are processed" },
                  { key: "overdueAlerts", label: "Overdue Alerts", description: "Important alerts for overdue payments" },
                  { key: "autoPayNotifications", label: "Auto Pay Updates", description: "Status updates for automatic payments" }
                ].map((setting) => (
                  <View key={setting.key} className="flex-row items-center justify-between">
                    <View className="flex-1 mr-4">
                      <Text className="text-text-primary font-medium mb-1">{setting.label}</Text>
                      <Text className="text-text-secondary text-sm">{setting.description}</Text>
                    </View>
                    <Switch
                      value={settings[setting.key as keyof NotificationSettings] as boolean}
                      onValueChange={(value) => updateSetting(setting.key as keyof NotificationSettings, value)}
                      trackColor={{ false: "#E0E0E0", true: "#6366f1" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                ))}
              </View>
            </Card>

            {/* Delivery Methods */}
            <Card>
              <Text className="text-lg font-semibold text-text-primary mb-4">Delivery Methods</Text>
              <View className="space-y-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-text-primary font-medium mb-1">Push Notifications</Text>
                    <Text className="text-text-secondary text-sm">Always enabled for critical notifications</Text>
                  </View>
                  <View className="w-12 h-6 bg-success rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">ON</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-text-primary font-medium mb-1">SMS Notifications</Text>
                    <Text className="text-text-secondary text-sm">Receive notifications via SMS</Text>
                  </View>
                  <Switch
                    value={settings.smsNotifications}
                    onValueChange={(value) => updateSetting("smsNotifications", value)}
                    trackColor={{ false: "#E0E0E0", true: "#6366f1" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-text-primary font-medium mb-1">Email Notifications</Text>
                    <Text className="text-text-secondary text-sm">Receive notifications via email</Text>
                  </View>
                  <Switch
                    value={settings.emailNotifications}
                    onValueChange={(value) => updateSetting("emailNotifications", value)}
                    trackColor={{ false: "#E0E0E0", true: "#6366f1" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </Card>

            {/* Timing Settings */}
            <Card>
              <Text className="text-lg font-semibold text-text-primary mb-4">Timing Settings</Text>
              <View className="space-y-4">
                <View>
                  <Text className="text-text-primary font-medium mb-2">Reminder Days Before Due</Text>
                  <Text className="text-text-secondary text-sm mb-3">
                    Get payment reminders {settings.reminderDays} days before the due date
                  </Text>
                  <View className="flex-row gap-2">
                    {[1, 2, 3, 5, 7].map((days) => (
                      <TouchableOpacity
                        key={days}
                        onPress={() => updateSetting("reminderDays", days)}
                        className={`px-4 py-2 rounded-lg border ${
                          settings.reminderDays === days
                            ? "bg-primary border-primary"
                            : "bg-background border-divider"
                        }`}
                      >
                        <Text
                          className={`font-medium ${
                            settings.reminderDays === days ? "text-white" : "text-text-secondary"
                          }`}
                        >
                          {days}d
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </Card>

            {/* Reset Settings */}
            <Button 
              variant="outline"
              onPress={() => {
                setSettings({
                  paymentReminders: true,
                  billGenerated: true,
                  paymentSuccess: true,
                  overdueAlerts: true,
                  autoPayNotifications: true,
                  emailNotifications: false,
                  smsNotifications: true,
                  reminderDays: 3
                });
                showAlert("Settings Reset", "Notification settings have been reset to defaults");
              }}
            >
              Reset to Defaults
            </Button>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}