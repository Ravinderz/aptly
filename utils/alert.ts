import { AlertCardProps } from '@/components/ui/AlertCard';

export interface AlertOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  primaryAction?: {
    label: string;
    onPress: () => void | Promise<void>;
    variant?: 'primary' | 'destructive';
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  persistent?: boolean;
  showCloseButton?: boolean;
}

// Global alert state management
let globalShowAlert:
  | ((config: Omit<AlertCardProps, 'visible' | 'onClose'>) => void)
  | null = null;

export const setGlobalAlertHandler = (handler: typeof globalShowAlert) => {
  globalShowAlert = handler;
};

// Convenience functions that match the original Alert.alert API
export const showAlert = (
  title: string,
  message?: string,
  options?: AlertOptions,
) => {
  if (!globalShowAlert) {
    console.warn(
      'Global alert handler not set. Make sure to call setGlobalAlertHandler.',
    );
    return;
  }

  const config: Omit<AlertCardProps, 'visible' | 'onClose'> = {
    type: options?.type || 'info',
    title,
    message,
    primaryAction: options?.primaryAction,
    secondaryAction: options?.secondaryAction,
    persistent: options?.persistent || false,
    showCloseButton: options?.showCloseButton ?? true,
  };

  globalShowAlert(config);
};

// Specific alert types for common use cases
export const showSuccessAlert = (
  title: string,
  message?: string,
  onOk?: () => void,
) => {
  showAlert(title, message, {
    type: 'success',
    primaryAction: { label: 'OK', onPress: onOk || (() => {}) },
  });
};

export const showErrorAlert = (
  title: string,
  message?: string,
  onOk?: () => void,
) => {
  showAlert(title, message, {
    type: 'error',
    primaryAction: { label: 'OK', onPress: onOk || (() => {}) },
  });
};

export const showWarningAlert = (
  title: string,
  message?: string,
  onOk?: () => void,
) => {
  showAlert(title, message, {
    type: 'warning',
    primaryAction: { label: 'OK', onPress: onOk || (() => {}) },
  });
};

export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void,
  confirmLabel: string = 'Confirm',
  cancelLabel: string = 'Cancel',
  destructive: boolean = false,
) => {
  showAlert(title, message, {
    type: destructive ? 'error' : 'info',
    primaryAction: {
      label: confirmLabel,
      onPress: onConfirm,
      variant: destructive ? 'destructive' : 'primary',
    },
    secondaryAction: {
      label: cancelLabel,
      onPress: onCancel || (() => {}),
    },
    persistent: true,
  });
};

export const showDeleteConfirmAlert = (
  title: string,
  message: string,
  onDelete: () => void | Promise<void>,
  onCancel?: () => void,
) => {
  showConfirmAlert(
    title,
    message,
    onDelete,
    onCancel,
    'Delete',
    'Cancel',
    true,
  );
};
