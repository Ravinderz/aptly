import { useRouter } from "expo-router";
import { ArrowLeft, Download, Calendar, AlertCircle, CheckCircle } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Billing() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("pending");

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
    if (selectedTab === "pending") return bill.status === "pending" || bill.status === "overdue";
    if (selectedTab === "paid") return bill.status === "paid";
    return true;
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
      <View className="flex-row items-center px-4 py-4 border-b border-divider bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">Billing</Text>
          <Text className="text-text-secondary text-sm">Flat A-201</Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View className="px-4 py-4 bg-surface border-b border-divider">
        <View className="flex-row gap-4">
          <View className="flex-1 bg-error/10 rounded-2xl p-4 border border-error/20">
            <Text className="text-error text-sm font-medium mb-1">Total Pending</Text>
            <Text className="text-error text-2xl font-bold">{formatCurrency(totalPending)}</Text>
            <Text className="text-error/70 text-xs mt-1">2 bills pending</Text>
          </View>
          <View className="flex-1 bg-success/10 rounded-2xl p-4 border border-success/20">
            <Text className="text-success text-sm font-medium mb-1">Paid This Month</Text>
            <Text className="text-success text-2xl font-bold">{formatCurrency(totalPaidThisMonth)}</Text>
            <Text className="text-success/70 text-xs mt-1">On time payment</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="px-4 py-4 bg-surface border-b border-divider">
        <View className="flex-row bg-background rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setSelectedTab("pending")}
            className={`flex-1 py-3 rounded-lg ${
              selectedTab === "pending" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                selectedTab === "pending" ? "text-white" : "text-text-secondary"
              }`}
            >
              Pending ({bills.filter(b => b.status === "pending" || b.status === "overdue").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab("paid")}
            className={`flex-1 py-3 rounded-lg ${
              selectedTab === "paid" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                selectedTab === "paid" ? "text-white" : "text-text-secondary"
              }`}
            >
              Paid ({bills.filter(b => b.status === "paid").length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bills List */}
      <ScrollView className="flex-1 px-4 py-4">
        {filteredBills.map((bill) => (
          <TouchableOpacity
            key={bill.id}
            className="bg-surface rounded-2xl p-6 mb-4 border border-divider"
            onPress={() => router.push(`/(tabs)/services/billing/${bill.id}`)}
          >
            {/* Header */}
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-text-primary mb-1">{bill.title}</Text>
                <Text className="text-text-secondary text-sm">Bill #{bill.billNumber}</Text>
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
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-text-secondary text-lg mb-2">No bills found</Text>
            <Text className="text-text-secondary text-center">
              {selectedTab === "pending" ? "All bills are up to date!" : "No payment history available"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}