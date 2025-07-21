import { useRouter } from "expo-router";
import { ArrowLeft, Download, Calendar, AlertCircle, CheckCircle, Bell, CreditCard, TrendingUp, Filter, Search, Plus, Settings, Smartphone, Wifi, Zap, Car, Tv, Home } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, TextInput } from "react-native";
import { showAlert } from "@/utils/alert";
import HighlightCard from "@/components/ui/HighlightCard";
import { Card } from "@/components/ui/Card";

export default function Billing() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mock billing data
  const bills = [
    {
      id: "1",
      title: "Maintenance Bill - March 2024",
      billNumber: "MB-2024-03-001",
      amount: 5250,
      gstAmount: 945,
      totalAmount: 6195,
      dueDate: "2024-03-31",
      issueDate: "2024-03-01",
      status: "overdue",
      items: [
        { description: "Security Charges", amount: 2000 },
        { description: "Housekeeping", amount: 1500 },
        { description: "Lift Maintenance", amount: 800 },
        { description: "Common Area Electricity", amount: 950 }
      ]
    },
    {
      id: "2",
      title: "Water Bill - March 2024",
      billNumber: "WB-2024-03-001", 
      amount: 750,
      gstAmount: 135,
      totalAmount: 885,
      dueDate: "2024-04-05",
      issueDate: "2024-03-20",
      status: "pending",
      items: [
        { description: "Water Consumption", amount: 600 },
        { description: "Water Tank Cleaning", amount: 150 }
      ]
    },
    {
      id: "3",
      title: "Maintenance Bill - February 2024",
      billNumber: "MB-2024-02-001",
      amount: 5250,
      gstAmount: 945,
      totalAmount: 6195,
      dueDate: "2024-02-29",
      issueDate: "2024-02-01",
      status: "paid",
      paidDate: "2024-02-25",
      items: [
        { description: "Security Charges", amount: 2000 },
        { description: "Housekeeping", amount: 1500 },
        { description: "Lift Maintenance", amount: 800 },
        { description: "Common Area Electricity", amount: 950 }
      ]
    },
    {
      id: "4",
      title: "Water Bill - February 2024",
      billNumber: "WB-2024-02-001",
      amount: 680,
      gstAmount: 122,
      totalAmount: 802,
      dueDate: "2024-03-05",
      issueDate: "2024-02-20",
      status: "paid",
      paidDate: "2024-03-02",
      items: [
        { description: "Water Consumption", amount: 530 },
        { description: "Water Tank Cleaning", amount: 150 }
      ]
    },
    {
      id: "5",
      title: "Common Area Maintenance - Main Lobby",
      billNumber: "CAM-2024-01-001",
      amount: 2800,
      gstAmount: 504,
      totalAmount: 3304,
      dueDate: "2024-04-15",
      issueDate: "2024-04-01",
      status: "pending",
      type: "common_area",
      items: [
        { description: "Lobby Lighting Repair", amount: 2800 }
      ],
      splitBetween: 25,
      costPerFlat: 132
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-success";
      case "pending": return "text-warning";
      case "overdue": return "text-error";
      default: return "text-text-secondary";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success/20";
      case "pending": return "bg-warning/20";
      case "overdue": return "bg-error/20";
      default: return "bg-text-secondary/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle size={16} color="#4CAF50" />;
      case "pending": return <Calendar size={16} color="#FF9800" />;
      case "overdue": return <AlertCircle size={16} color="#D32F2F" />;
      default: return <Calendar size={16} color="#757575" />;
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = searchQuery === "" || 
      bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = true;
    if (selectedTab === "pending") matchesTab = bill.status === "pending" || bill.status === "overdue";
    if (selectedTab === "paid") matchesTab = bill.status === "paid";
    if (selectedTab === "common_area") matchesTab = bill.type === "common_area";
    
    return matchesSearch && matchesTab;
  });

  const totalPending = bills
    .filter(bill => bill.status === "pending" || bill.status === "overdue")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  const totalPaidThisMonth = bills
    .filter(bill => bill.status === "paid" && bill.paidDate?.includes("2024-03"))
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-divider bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2">
          <ArrowLeft size={20} color="#6366f1" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-headline-large font-semibold text-text-primary">Billing</Text>
          <Text className="text-body-medium text-text-secondary">Flat A-201</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/services/billing/notifications")}
          className="mr-4 p-2 relative"
        >
          <Bell size={20} color="#6366f1" />
          <View className="absolute top-1 right-1 bg-error rounded-full w-3 h-3" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/services/billing/settings")}
          className="p-2"
        >
          <Settings size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View className="px-6 py-6 bg-surface border-b border-divider">
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-error/10 rounded-xl p-4 border border-error/20">
            <View className="flex-row items-center mb-3">
              <AlertCircle size={16} color="#D32F2F" />
              <Text className="text-error text-body-medium font-medium ml-2">Total Pending</Text>
            </View>
            <Text className="text-error text-display-small font-bold mb-1">{formatCurrency(totalPending)}</Text>
            <Text className="text-error/70 text-label-large">3 bills pending</Text>
          </View>
          <View className="flex-1 bg-success/10 rounded-xl p-4 border border-success/20">
            <View className="flex-row items-center mb-3">
              <CheckCircle size={16} color="#4CAF50" />
              <Text className="text-success text-body-medium font-medium ml-2">Paid This Month</Text>
            </View>
            <Text className="text-success text-display-small font-bold mb-1">{formatCurrency(totalPaidThisMonth)}</Text>
            <Text className="text-success/70 text-label-large">On time payment</Text>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View className="flex-row gap-4">
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/services/billing/auto-pay")}
            className="flex-1 bg-primary rounded-xl p-4 flex-row items-center justify-center"
          >
            <CreditCard size={16} color="white" />
            <Text className="text-white font-semibold ml-2 text-body-medium">Setup Auto Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/services/billing/analytics")}
            className="flex-1 bg-surface border border-divider rounded-xl p-4 flex-row items-center justify-center"
          >
            <TrendingUp size={16} color="#6366f1" />
            <Text className="text-primary font-semibold ml-2 text-body-medium">View Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Utility Billers Section */}
      <View className="px-6 py-6 bg-background">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-headline-large font-semibold text-text-primary">Utility & Recharge</Text>
          <View className="bg-success/10 rounded-full px-3 py-1">
            <Text className="text-success text-label-large font-bold">💰 Earn Cashback</Text>
          </View>
        </View>
        
        <Text className="text-text-secondary text-body-medium mb-6 leading-5">
          Pay utility bills and recharge services. Earn cashback on every transaction!
        </Text>

        {/* Utility Billers Grid */}
        <View className="flex-row flex-wrap gap-4">
          {/* Mobile Recharge */}
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/services/billing/mobile-recharge")}
            className="bg-surface rounded-xl p-4 border border-divider flex-1 min-w-[45%] items-center"
            activeOpacity={0.7}
          >
            <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mb-3">
              <Smartphone size={20} color="#6366f1" />
            </View>
            <Text className="text-text-primary font-semibold text-body-medium text-center mb-1">Mobile Recharge</Text>
            <Text className="text-text-secondary text-label-large text-center">Prepaid & Postpaid</Text>
          </TouchableOpacity>

          {/* Broadband */}
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/services/billing/broadband-recharge")}
            className="bg-surface rounded-xl p-4 border border-divider flex-1 min-w-[45%] items-center"
            activeOpacity={0.7}
          >
            <View className="bg-secondary/10 rounded-full w-12 h-12 items-center justify-center mb-3">
              <Wifi size={20} color="#4CAF50" />
            </View>
            <Text className="text-text-primary font-semibold text-body-medium text-center mb-1">Broadband</Text>
            <Text className="text-text-secondary text-label-large text-center">Internet Bills</Text>
          </TouchableOpacity>

          {/* Gas Cylinder */}
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/services/billing/cylinder-booking")}
            className="bg-surface rounded-xl p-4 border border-divider flex-1 min-w-[45%] items-center"
            activeOpacity={0.7}
          >
            <View className="bg-warning/10 rounded-full w-12 h-12 items-center justify-center mb-3">
              <Zap size={20} color="#FF9800" />
            </View>
            <Text className="text-text-primary font-semibold text-body-medium text-center mb-1">Gas Cylinder</Text>
            <Text className="text-text-secondary text-label-large text-center">LPG Booking</Text>
          </TouchableOpacity>

          {/* Prepaid Gas */}
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/services/billing/gas-recharge")}
            className="bg-surface rounded-xl p-4 border border-divider flex-1 min-w-[45%] items-center"
            activeOpacity={0.7}
          >
            <View className="bg-error/10 rounded-full w-12 h-12 items-center justify-center mb-3">
              <Car size={20} color="#D32F2F" />
            </View>
            <Text className="text-text-primary font-semibold text-body-medium text-center mb-1">Prepaid Gas</Text>
            <Text className="text-text-secondary text-label-large text-center">PNG Recharge</Text>
          </TouchableOpacity>

          {/* DishTV */}
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/services/billing/dishtv-recharge")}
            className="bg-surface rounded-xl p-4 border border-divider flex-1 min-w-[45%] items-center"
            activeOpacity={0.7}
          >
            <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mb-3">
              <Tv size={20} color="#6366f1" />
            </View>
            <Text className="text-text-primary font-semibold text-body-medium text-center mb-1">DishTV</Text>
            <Text className="text-text-secondary text-label-large text-center">DTH Recharge</Text>
          </TouchableOpacity>

          {/* Electricity (Future) */}
          <TouchableOpacity 
            onPress={() => showAlert("Coming Soon", "Electricity bill payment will be available soon!")}
            className="bg-surface rounded-xl p-4 border border-divider flex-1 min-w-[45%] items-center opacity-60"
            activeOpacity={0.7}
          >
            <View className="bg-warning/10 rounded-full w-12 h-12 items-center justify-center mb-3">
              <Home size={20} color="#FF9800" />
            </View>
            <Text className="text-text-primary font-semibold text-body-medium text-center mb-1">Electricity</Text>
            <Text className="text-text-secondary text-label-large text-center">Coming Soon</Text>
          </TouchableOpacity>
        </View>

        {/* Cashback Info */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <View className="flex-row items-center">
            <View className="bg-success rounded-full w-10 h-10 items-center justify-center mr-4">
              <Text className="text-white text-body-large">💸</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-semibold text-body-medium mb-1">
                Earn up to 5% Cashback
              </Text>
              <Text className="text-text-secondary text-body-medium leading-5">
                On all utility payments. Cashback credited within 24-48 hours.
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Society Bills Section Header */}
      <View className="px-6 py-4 bg-background border-t border-divider">
        <View className="flex-row items-center mb-2">
          <Home size={20} color="#6366f1" />
          <Text className="text-headline-large font-semibold text-text-primary ml-3">Society Bills</Text>
        </View>
        <Text className="text-text-secondary text-body-medium">
          Maintenance and society-related payments
        </Text>
      </View>

      {/* Search & Filter */}
      <View className="px-6 py-5 bg-surface border-b border-divider">
        <View className="flex-row items-center bg-background rounded-xl px-4 py-4 mb-5">
          <Search size={20} color="#757575" />
          <TextInput
            className="flex-1 ml-3 text-text-primary"
            placeholder="Search bills..."
            placeholderTextColor="#757575"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {[
              { key: "pending", label: "Pending", count: bills.filter(b => b.status === "pending" || b.status === "overdue").length },
              { key: "paid", label: "Paid", count: bills.filter(b => b.status === "paid").length },
              { key: "common_area", label: "Common Area", count: bills.filter(b => b.type === "common_area").length }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                className={`px-4 py-3 rounded-full border ${
                  selectedTab === tab.key
                    ? "bg-primary border-primary"
                    : "bg-background border-divider"
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedTab === tab.key ? "text-white" : "text-text-secondary"
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bills List */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-4">
          {filteredBills.map((bill) => (
            <TouchableOpacity
              key={bill.id}
              className="bg-surface rounded-2xl p-6 border border-divider"
              onPress={() => router.push(`/(tabs)/services/billing/${bill.id}`)}
            >
            {/* Header */}
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-lg font-semibold text-text-primary">{bill.title}</Text>
                  {bill.type === 'common_area' && (
                    <View className="bg-primary/10 rounded-full px-2 py-1 ml-2">
                      <Text className="text-primary text-xs font-medium">Split Bill</Text>
                    </View>
                  )}
                </View>
                <Text className="text-text-secondary text-sm">Bill #{bill.billNumber}</Text>
                {bill.type === 'common_area' && (
                  <Text className="text-text-secondary text-xs mt-1">
                    Split between {bill.splitBetween} flats • Your share: {formatCurrency(bill.costPerFlat)}
                  </Text>
                )}
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold text-text-primary">{formatCurrency(bill.totalAmount)}</Text>
                <Text className="text-text-secondary text-sm">Inc. GST</Text>
              </View>
            </View>

            {/* Status and Dates */}
            <View className="flex-row items-center justify-between mb-4">
              <View className={`flex-row items-center px-3 py-2 rounded-full ${getStatusBgColor(bill.status)}`}>
                {getStatusIcon(bill.status)}
                <Text className={`font-medium text-sm ml-2 capitalize ${getStatusColor(bill.status)}`}>
                  {bill.status}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-text-secondary text-xs">
                  {bill.status === "paid" ? "Paid on" : "Due on"}
                </Text>
                <Text className={`text-sm font-medium ${
                  bill.status === "overdue" ? "text-error" : "text-text-primary"
                }`}>
                  {bill.status === "paid" ? formatDate(bill.paidDate!) : formatDate(bill.dueDate)}
                </Text>
              </View>
            </View>

            {/* Amount Breakdown */}
            <View className="bg-background rounded-xl p-4">
              <Text className="text-text-primary font-medium mb-3">Amount Breakdown</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-text-secondary">Bill Amount</Text>
                  <Text className="text-text-primary">{formatCurrency(bill.amount)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-text-secondary">GST (18%)</Text>
                  <Text className="text-text-primary">{formatCurrency(bill.gstAmount)}</Text>
                </View>
                <View className="h-px bg-divider my-2" />
                <View className="flex-row justify-between">
                  <Text className="text-text-primary font-semibold">Total</Text>
                  <Text className="text-text-primary font-bold">{formatCurrency(bill.totalAmount)}</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            {bill.status !== "paid" && (
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity className="flex-1 bg-primary rounded-xl py-3">
                  <Text className="text-white font-semibold text-center">Pay Now</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-surface border border-divider rounded-xl p-3">
                  <Download size={20} color="#6366f1" />
                </TouchableOpacity>
              </View>
            )}

            {bill.status === "paid" && (
              <TouchableOpacity className="flex-row items-center justify-center mt-4 py-3 bg-background rounded-xl">
                <Download size={16} color="#6366f1" />
                <Text className="text-primary font-medium ml-2">Download Receipt</Text>
              </TouchableOpacity>
            )}
            </TouchableOpacity>
          ))}

          {filteredBills.length === 0 && (
            <View className="flex-1 items-center justify-center py-16">
              <Text className="text-text-secondary text-lg mb-2">No bills found</Text>
              <Text className="text-text-secondary text-center">
                {selectedTab === "pending" ? "All bills are up to date!" : "No payment history available"}
              </Text>
            </View>
          )}

          {/* Payment Security Notice */}
          {selectedTab === "pending" && filteredBills.length > 0 && (
            <HighlightCard
              title="Secure Payments"
              variant="primary" 
              size="sm"
              className="mt-4"
            >
              <Text className="text-text-secondary leading-5">
                All payments are processed through encrypted gateways. Your financial data is protected.
              </Text>
            </HighlightCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}