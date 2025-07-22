import { router } from "expo-router";
import { ArrowLeft, LucideIcon } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Text, TouchableOpacity, View } from "react-native";
import HeaderAction from "./HeaderAction";

interface StackHeaderAction {
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
}

interface StackHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  actions?: StackHeaderAction[];
  backgroundColor?: string;
  showAnimatedEntrance?: boolean;
  showBottomBorder?: boolean;
  contentSpacing?: boolean; // Adds spacing after header for content
}

export default function StackHeader({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  actions = [],
  backgroundColor = "#ffffff",
  showAnimatedEntrance = true,
  showBottomBorder = true,
  contentSpacing = true,
}: StackHeaderProps) {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (showAnimatedEntrance) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlideAnim, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      titleSlideAnim.setValue(0);
    }
  }, [showAnimatedEntrance]);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <>
      <Animated.View
        style={{
          opacity: fadeAnim,
          backgroundColor,
        }}
        className={`shadow-sm shadow-primary/5 ${showBottomBorder ? 'border-b border-divider' : ''}`}
      >
        <View className={`flex-row items-${subtitle ? 'start' : 'center'} justify-between px-4 ${subtitle ? 'py-4' : 'py-3'} min-h-14`}>
            {/* Back Button */}
            <View className="w-10 mt-1">
              {showBackButton && (
                <TouchableOpacity
                  onPress={handleBackPress}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  activeOpacity={0.7}
                >
                  <ArrowLeft size={20} className="text-text-primary" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            {/* Title & Subtitle */}
            <Animated.View
              style={{
                transform: [{ translateY: titleSlideAnim }],
              }}
              className="flex-1 items-start px-2"
            >
              <Text 
                className="text-headline-medium font-semibold text-text-primary text-left"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
              {subtitle && (
                <Text 
                  className="text-body-medium text-text-secondary text-left mt-1"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {subtitle}
                </Text>
              )}
            </Animated.View>

            {/* Actions */}
            <View className="w-10 items-end mt-1">
              {actions.length > 0 && (
                <View className="flex-row items-center gap-2">
                  {actions.slice(0, 2).map((action, index) => (
                    <HeaderAction
                      key={index}
                      icon={action.icon}
                      onPress={action.onPress}
                      size={18}
                      disabled={action.disabled}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
      </Animated.View>

      {/* Content Spacing */}
      {contentSpacing && <View className="h-2" />}
    </>
  );
}