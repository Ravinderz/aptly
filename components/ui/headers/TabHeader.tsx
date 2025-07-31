import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Bell, HelpCircle, MapPin } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { router } from 'expo-router';
import { navigateWithReset } from '@/utils/navigation';
import HeaderAction from './HeaderAction';

interface TabHeaderProps {
  onNotificationPress?: () => void;
  onHelpPress?: () => void;
  notificationCount?: number;
  showAnimatedEntrance?: boolean;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function TabHeader({
  onNotificationPress,
  onHelpPress,
  notificationCount = 0,
  showAnimatedEntrance = true,
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
}: TabHeaderProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (showAnimatedEntrance && !mounted) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!showAnimatedEntrance) {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      setMounted(true);
    }
  }, [showAnimatedEntrance, mounted]);

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      // Default behavior: navigate to notifications page
      router.push('/notifications');
    }
  };

  const handleHelpPress = () => {
    if (onHelpPress) {
      onHelpPress();
    } else {
      // Default behavior: navigate to support page
      navigateWithReset('/(tabs)/settings/support');
    }
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  if (!mounted && showAnimatedEntrance) {
    return <View style={{ height: 80 }} />; // Placeholder during animation
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="bg-surface border-b border-divider shadow-sm shadow-primary/5">
      <View className="flex-row items-center justify-between px-6 py-4 pt-6">
        {/* Back Button */}
        {showBackButton && (
          <HeaderAction
            icon={ArrowLeft}
            onPress={handleBackPress}
            size={20}
            className="mr-3"
          />
        )}

        {/* Content Section */}
        <View className="flex-1 pr-4">
          {title ? (
            <>
              {/* Custom Title */}
              <Text className="text-headline-medium font-semibold text-text-primary mb-1">
                {title}
              </Text>
              {subtitle && (
                <Text className="text-body-medium text-text-secondary">
                  {subtitle}
                </Text>
              )}
            </>
          ) : (
            <>
              {/* User Context */}
              <Text className="text-headline-medium font-semibold text-text-primary mb-1">
                {user?.name || 'Welcome'}
              </Text>

              {/* Location Info */}
              <View className="flex-row items-center">
                <MapPin
                  size={14}
                  className="text-text-secondary mr-1"
                  strokeWidth={1.5}
                />
                <Text className="text-body-medium text-text-secondary">
                  {user?.flatNumber ? `${user.flatNumber} • ` : ''}
                  {user?.societyName || 'Green Valley Apartments'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-3">
          {/* Help Action */}
          <HeaderAction icon={HelpCircle} onPress={handleHelpPress} size={20} />

          {/* Notification Action */}
          <HeaderAction
            icon={Bell}
            onPress={handleNotificationPress}
            size={20}
            showBadge={notificationCount > 0}
            badgeCount={notificationCount}
          />
        </View>
      </View>
    </Animated.View>
  );
}
