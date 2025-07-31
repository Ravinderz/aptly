import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AptlyAccordionItem = ({
  isExpanded,
  children,
  viewKey,
  style,
  duration = 500,
}: {
  isExpanded: any;
  children: React.ReactNode;
  viewKey: string;
  style: any;
  duration?: number;
}) => {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * Number(isExpanded.value), {
      duration,
    }),
  );
  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
  }));

  return (
    <Animated.View
      key={`accordionItem_${viewKey}`}
      style={[styles.animatedView, bodyStyle, style]}>
      <View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={styles.wrapper}>
        {children}
      </View>
    </Animated.View>
  );
};

export default AptlyAccordionItem;
