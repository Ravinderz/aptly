import React, { useRef } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface HeaderActionProps {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  color?: string;
  showBadge?: boolean;
  badgeCount?: number;
  disabled?: boolean;
}

export default function HeaderAction({
  icon: Icon,
  onPress,
  size = 20,
  color = "#6b7280",
  showBadge = false,
  badgeCount = 0,
  disabled = false,
}: HeaderActionProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  const shadowRadius = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      className="relative"
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          shadowColor: "#6366f1",
          shadowOpacity,
          shadowRadius,
          shadowOffset: { width: 0, height: 2 },
          elevation: shadowAnim,
        }}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          disabled ? "opacity-50" : ""
        } bg-surface border border-divider`}
      >
        <Icon 
          size={size} 
          className={disabled ? "text-text-disabled" : "text-text-secondary"} 
          strokeWidth={1.5}
        />
        
        {/* Badge for notifications */}
        {showBadge && badgeCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-error rounded-full min-w-5 h-5 items-center justify-center px-1">
            <Animated.Text 
              className="text-white text-xs font-bold"
              style={{
                fontSize: badgeCount > 99 ? 9 : 10,
              }}
            >
              {badgeCount > 99 ? "99+" : badgeCount.toString()}
            </Animated.Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}