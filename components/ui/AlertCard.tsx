import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface AlertCardProps {
  visible: boolean;
  onClose: () => void;
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
    variant?: "primary" | "destructive";
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  showCloseButton?: boolean;
  persistent?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

const typeConfig = {
  success: {
    icon: CheckCircle,
    iconColor: "#4CAF50",
    backgroundColor: "bg-success/10",
    borderColor: "border-success/30",
    titleColor: "text-success",
  },
  error: {
    icon: AlertCircle,
    iconColor: "#F44336",
    backgroundColor: "bg-error/10",
    borderColor: "border-error/30",
    titleColor: "text-error",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "#FF9800",
    backgroundColor: "bg-warning/10",
    borderColor: "border-warning/30",
    titleColor: "text-warning",
  },
  info: {
    icon: Info,
    iconColor: "#2196F3",
    backgroundColor: "bg-primary/10",
    borderColor: "border-primary/30",
    titleColor: "text-primary",
  },
};

export const AlertCard: React.FC<AlertCardProps> = ({
  visible,
  onClose,
  type = "info",
  title,
  message,
  primaryAction,
  secondaryAction,
  showCloseButton = true,
  persistent = false,
}) => {
  const scaleValue = new Animated.Value(0);
  const opacityValue = new Animated.Value(0);

  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleBackdropPress = () => {
    if (!persistent) {
      onClose();
    }
  };

  const handlePrimaryAction = async () => {
    if (primaryAction?.onPress) {
      await primaryAction.onPress();
    }
    // Auto-dismiss alert after primary action
    onClose();
  };

  const handleSecondaryAction = () => {
    if (secondaryAction?.onPress) {
      secondaryAction.onPress();
    }
    // Auto-dismiss alert after secondary action
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={persistent ? undefined : onClose}
    >
      <Animated.View
        className="flex-1 bg-black/50 items-center justify-center px-6"
        style={{ opacity: opacityValue }}
      >
        <TouchableOpacity
          className="absolute inset-0"
          onPress={handleBackdropPress}
          activeOpacity={1}
        />

        <Animated.View
          className="bg-surface rounded-2xl p-6 w-full max-w-sm border-2 shadow-2xl border-divider"
          style={{
            transform: [{ scale: scaleValue }],
            maxWidth: screenWidth - 48,
          }}
        >
          {/* Header */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View className="mr-3">
                <Icon size={24} color={config.iconColor} />
              </View>
              <Text className={`text-headline-medium font-bold flex-1 ${config.titleColor}`}>
                {title}
              </Text>
            </View>

            {showCloseButton && !persistent && (
              <TouchableOpacity
                onPress={onClose}
                className="ml-2 p-1"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color="#757575" />
              </TouchableOpacity>
            )}
          </View>

          {/* Message */}
          {message && (
            <Text className="text-text-secondary leading-6 mb-6">
              {message}
            </Text>
          )}

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <View className="flex-row gap-3">
              {secondaryAction && (
                <TouchableOpacity
                  onPress={handleSecondaryAction}
                  className="flex-1 bg-transparent border border-divider rounded-xl py-3 px-4"
                >
                  <Text className="text-text-primary font-semibold text-center">
                    {secondaryAction.label}
                  </Text>
                </TouchableOpacity>
              )}

              {primaryAction && (
                <TouchableOpacity
                  onPress={handlePrimaryAction}
                  disabled={primaryAction.loading}
                  className={`flex-1 rounded-xl py-3 px-4 ${
                    primaryAction.variant === "destructive"
                      ? "bg-error"
                      : "bg-primary"
                  } ${primaryAction.loading ? "opacity-70" : ""}`}
                >
                  <View className="flex-row items-center justify-center">
                    {primaryAction.loading && (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        className="mr-2"
                      />
                    )}
                    {primaryAction.variant === "destructive" &&
                      !primaryAction.loading && (
                        <Trash2 size={16} color="white" className="mr-2" />
                      )}
                    <Text className="text-white font-semibold text-center">
                      {primaryAction.loading
                        ? "Loading..."
                        : primaryAction.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Convenience hook for using alerts
export const useAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<AlertCardProps | null>(
    null
  );

  const showAlert = (config: Omit<AlertCardProps, "visible" | "onClose">) => {
    setAlertConfig({
      ...config,
      visible: true,
      onClose: () => setAlertConfig(null),
    });
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  const AlertComponent = alertConfig ? (
    <AlertCard {...alertConfig} visible={!!alertConfig} onClose={hideAlert} />
  ) : null;

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};

export default AlertCard;
