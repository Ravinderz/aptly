import { AlertTriangle, Clock, Ellipsis, Megaphone } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { cn } from "../utils/cn";

const AlertCard = () => {
  // Mock notice data with priority levels - simulate checking for today's notices
  const todaysNotices = [
    {
      title: "Water Supply Interruption",
      message:
        "Please note that the community center will be closed on Saturday, June 3rd from 8am-1pm for maintenance.",
      priority: "high", // high, medium, low
      timestamp: new Date(),
      isUrgent: true,
    }
  ];

  // Check if there are any notices for today
  const hasNoticesForToday = todaysNotices.length > 0;

  // If no notices for today, don't render the section
  if (!hasNoticesForToday) {
    return null;
  }

  // Get the first notice to display
  const notice = todaysNotices[0];

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          container: "border-error/30 border-2",
          badge: "bg-error text-white",
          iconColor: "text-error",
          iconBg: "bg-error/20",
        };
      case "medium":
        return {
          container: "border-warning/30 border-2",
          badge: "bg-warning text-white",
          iconColor: "text-warning",
          iconBg: "bg-warning/20",
        };
      default:
        return {
          container: "border-primary/30 border-2",
          badge: "bg-primary text-white",
          iconColor: "text-primary",
          iconBg: "bg-primary/20",
        };
    }
  };

  const priorityStyles = getPriorityStyles(notice.priority);

  return (
    <View className="mb-6">
      {/* Enhanced Header with Urgency Indicator */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View
            className={cn(
              "w-3 h-3 rounded-full mr-2",
              notice.isUrgent ? "" : "bg-primary"
            )}
          />
          <Text className="text-headline-large text-text-primary">
            Important Notices
          </Text>
        </View>
        <TouchableOpacity className="bg-primary/10 rounded-full px-3 py-1">
          <Text className="text-primary text-label-large font-semibold">View All</Text>
        </TouchableOpacity>
      </View>

      {/* Prominent Notice Card */}
      <View className={cn("rounded-2xl p-5", priorityStyles.container)}>
        {/* Priority Badge */}
        <View className="flex-row items-center justify-between mb-3">
          <View
            className={cn(
              "px-3 py-1 rounded-full flex-row items-center",
              priorityStyles.badge
            )}
          >
            <AlertTriangle size={16} color="white" />
            <Text className="text-white text-label-large font-bold ml-1 uppercase">
              {notice.priority} Priority
            </Text>
          </View>
          <TouchableOpacity>
            <Ellipsis size={20} className="text-text-secondary" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Notice Content */}
        <View className="flex-row items-start mb-4">
          <View className={cn("rounded-full p-3 mr-4", priorityStyles.iconBg)}>
            <Megaphone size={24} className={priorityStyles.iconColor} strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-headline-medium text-text-primary mb-2">
              {notice.title}
            </Text>
            <Text className="text-body-medium leading-5 text-text-secondary">
              {notice.message}
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View className="flex-row items-center justify-between pt-3 border-t border-divider/50">
          <View className="flex-row items-center">
            <Clock size={16} className="text-text-secondary" />
            <Text className="text-label-large text-text-secondary ml-1">
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(notice.timestamp)}
            </Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="bg-surface rounded-lg px-4 py-2">
              <Text className="text-text-primary text-body-medium font-medium">
                Dismiss
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary rounded-lg px-4 py-2">
              <Text className="text-white text-body-medium font-semibold">
                Read More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AlertCard;
