/**
 * Optimized UI Components
 * Performance-optimized versions of common UI components
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ListRenderItem,
  FlatListProps,
} from 'react-native';
import { memo, getItemKey, useRenderTime, performanceMonitor } from '@/utils/performance';

// ============================================================================
// OPTIMIZED CARD COMPONENT
// ============================================================================

interface OptimizedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  testID?: string;
}

const OptimizedCardComponent: React.FC<OptimizedCardProps> = ({ 
  children, 
  style, 
  onPress, 
  testID 
}) => {
  useRenderTime('OptimizedCard');

  const content = (
    <View 
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        style
      ]}
      testID={testID}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => {
          performanceMonitor.markInteraction('card-press');
          onPress();
        }}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export const OptimizedCard = memo(OptimizedCardComponent, {
  ignoreProps: ['testID'], // testID changes don't require re-render
});

// ============================================================================
// OPTIMIZED LIST ITEM COMPONENT
// ============================================================================

interface OptimizedListItemProps {
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  rightElement?: React.ReactNode;
  onPress?: (id: string) => void;
  style?: ViewStyle;
}

const OptimizedListItemComponent: React.FC<OptimizedListItemProps> = ({
  id,
  title,
  subtitle,
  avatar,
  rightElement,
  onPress,
  style,
}) => {
  useRenderTime('OptimizedListItem');

  const handlePress = React.useCallback(() => {
    if (onPress) {
      performanceMonitor.markInteraction('list-item-press');
      onPress(id);
    }
  }, [id, onPress]);

  const content = (
    <View 
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
        },
        style
      ]}
    >
      {avatar && (
        <OptimizedImage
          source={{ uri: avatar }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
          }}
          placeholder="avatar"
        />
      )}
      
      <View style={{ flex: 1 }}>
        <Text 
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#111827',
            marginBottom: subtitle ? 2 : 0,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            style={{
              fontSize: 14,
              color: '#6B7280',
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export const OptimizedListItem = memo(OptimizedListItemComponent, {
  deep: false, // Shallow comparison is sufficient for simple props
});

// ============================================================================
// OPTIMIZED IMAGE COMPONENT
// ============================================================================

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: ImageStyle;
  placeholder?: string;
  fallbackSource?: { uri: string } | number;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImageComponent: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
  fallbackSource,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = React.useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  const imageSource = hasError && fallbackSource ? fallbackSource : source;

  return (
    <View style={[style, { position: 'relative' }]}>
      <Image
        source={imageSource}
        style={[
          style,
          { 
            opacity: isLoading ? 0 : 1,
          }
        ]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode="cover"
      />
      
      {isLoading && (
        <View 
          style={[
            style,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
            }
          ]}
        >
          <ActivityIndicator size="small" color="#9CA3AF" />
        </View>
      )}
    </View>
  );
};

export const OptimizedImage = memo(OptimizedImageComponent, {
  ignoreProps: ['onLoad', 'onError'], // Function props that don't affect rendering
});

// ============================================================================
// OPTIMIZED FLAT LIST
// ============================================================================

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'keyExtractor'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  enableVirtualization?: boolean;
  itemHeight?: number;
  bufferSize?: number;
}

function OptimizedFlatListComponent<T>({
  data,
  renderItem,
  keyExtractor,
  enableVirtualization = true,
  itemHeight = 60,
  bufferSize = 5,
  ...props
}: OptimizedFlatListProps<T>) {
  useRenderTime('OptimizedFlatList');

  // Use optimized key extractor if not provided
  const getKey = React.useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      return getItemKey(item, index);
    },
    [keyExtractor]
  );

  // Memoized render item to prevent unnecessary re-renders
  const memoizedRenderItem = React.useCallback<ListRenderItem<T>>(
    ({ item, index }) => {
      const key = getKey(item, index);
      return (
        <View key={key}>
          {renderItem({ item, index, separators: {} as any })}
        </View>
      );
    },
    [renderItem, getKey]
  );

  return (
    <FlatList
      {...props}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={getKey}
      removeClippedSubviews={enableVirtualization}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={bufferSize * 2}
      updateCellsBatchingPeriod={16}
      getItemLayout={
        itemHeight > 0
          ? (data, index) => ({
              length: itemHeight,
              offset: itemHeight * index,
              index,
            })
          : undefined
      }
    />
  );
}

export const OptimizedFlatList = memo(OptimizedFlatListComponent, {
  deep: true, // Deep comparison for complex list props
}) as <T>(props: OptimizedFlatListProps<T>) => React.ReactElement;

// ============================================================================
// OPTIMIZED HEADER COMPONENT
// ============================================================================

interface OptimizedHeaderProps {
  title: string;
  subtitle?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

const OptimizedHeaderComponent: React.FC<OptimizedHeaderProps> = ({
  title,
  subtitle,
  leftElement,
  rightElement,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  useRenderTime('OptimizedHeader');

  return (
    <View 
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        style
      ]}
    >
      {leftElement && (
        <View style={{ marginRight: 12 }}>
          {leftElement}
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text 
          style={[
            {
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
            },
            titleStyle
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            style={[
              {
                fontSize: 14,
                color: '#6B7280',
                marginTop: 2,
              },
              subtitleStyle
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement && (
        <View style={{ marginLeft: 12 }}>
          {rightElement}
        </View>
      )}
    </View>
  );
};

export const OptimizedHeader = memo(OptimizedHeaderComponent, {
  deep: false,
  ignoreProps: ['style', 'titleStyle', 'subtitleStyle'], // Style changes less frequent
});

// ============================================================================
// OPTIMIZED BUTTON COMPONENT
// ============================================================================

interface OptimizedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const OptimizedButtonComponent: React.FC<OptimizedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  testID,
}) => {
  useRenderTime('OptimizedButton');

  const handlePress = React.useCallback(() => {
    if (!disabled && !loading) {
      performanceMonitor.markInteraction('button-press');
      onPress();
    }
  }, [onPress, disabled, loading]);

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      borderWidth: 1,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32 },
      medium: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 40 },
      large: { paddingHorizontal: 20, paddingVertical: 14, minHeight: 48 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? '#9CA3AF' : '#3B82F6',
        borderColor: disabled ? '#9CA3AF' : '#3B82F6',
      },
      secondary: {
        backgroundColor: disabled ? '#F3F4F6' : '#E5E7EB',
        borderColor: disabled ? '#F3F4F6' : '#E5E7EB',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: disabled ? '#9CA3AF' : '#3B82F6',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '500',
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: disabled ? '#FFFFFF' : '#FFFFFF' },
      secondary: { color: disabled ? '#9CA3AF' : '#374151' },
      outline: { color: disabled ? '#9CA3AF' : '#3B82F6' },
      ghost: { color: disabled ? '#9CA3AF' : '#3B82F6' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : '#3B82F6'} 
        />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export const OptimizedButton = memo(OptimizedButtonComponent, {
  ignoreProps: ['testID', 'style', 'textStyle'],
});

// ============================================================================
// OPTIMIZED SECTION HEADER
// ============================================================================

interface OptimizedSectionHeaderProps {
  title: string;
  count?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

const OptimizedSectionHeaderComponent: React.FC<OptimizedSectionHeaderProps> = ({
  title,
  count,
  action,
  style,
}) => {
  return (
    <View 
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        style
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text 
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
          }}
        >
          {title}
        </Text>
        {count !== undefined && (
          <View 
            style={{
              backgroundColor: '#E5E7EB',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 2,
              marginLeft: 8,
            }}
          >
            <Text 
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#6B7280',
              }}
            >
              {count}
            </Text>
          </View>
        )}
      </View>

      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text 
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#3B82F6',
            }}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const OptimizedSectionHeader = memo(OptimizedSectionHeaderComponent, {
  deep: true, // Deep comparison for action object
});

// ============================================================================
// PERFORMANCE DEBUG OVERLAY (DEV ONLY)
// ============================================================================

const PerformanceDebugOverlay: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [metrics, setMetrics] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (__DEV__ && visible) {
      const interval = setInterval(() => {
        setMetrics(performanceMonitor.getReport());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [visible]);

  if (!__DEV__) return null;

  return (
    <>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 100,
          right: 20,
          backgroundColor: '#000000CC',
          padding: 8,
          borderRadius: 4,
          zIndex: 9999,
        }}
        onPress={() => setVisible(!visible)}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 12 }}>PERF</Text>
      </TouchableOpacity>

      {visible && (
        <View
          style={{
            position: 'absolute',
            top: 150,
            right: 20,
            left: 20,
            backgroundColor: '#000000DD',
            padding: 16,
            borderRadius: 8,
            maxHeight: 400,
            zIndex: 9998,
          }}
        >
          <ScrollView>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
              Performance Metrics
            </Text>
            {Object.entries(metrics).map(([name, data]) => (
              <View key={name} style={{ marginBottom: 8 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '500' }}>
                  {name}
                </Text>
                <Text style={{ color: '#CCCCCC', fontSize: 11 }}>
                  Avg: {data.average?.toFixed(2)}ms | Count: {data.count}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

export { PerformanceDebugOverlay };