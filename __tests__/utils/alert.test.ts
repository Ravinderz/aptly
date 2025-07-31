import {
  setGlobalAlertHandler,
  showAlert,
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showConfirmAlert,
  showDeleteConfirmAlert,
  AlertOptions,
} from '../../utils/alert';
import { AlertCardProps } from '../../components/ui/AlertCard';

// Mock console.warn to test warning messages
const mockConsoleWarn = jest
  .spyOn(console, 'warn')
  .mockImplementation(() => {});

describe('Alert Utilities', () => {
  let mockHandler: jest.MockedFunction<
    (config: Omit<AlertCardProps, 'visible' | 'onClose'>) => void
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandler = jest.fn();
    setGlobalAlertHandler(mockHandler);
  });

  afterEach(() => {
    // Reset global handler
    setGlobalAlertHandler(null);
  });

  describe('setGlobalAlertHandler', () => {
    test('should set the global alert handler', () => {
      const newHandler = jest.fn();
      setGlobalAlertHandler(newHandler);

      showAlert('Test', 'Message');
      expect(newHandler).toHaveBeenCalled();
    });

    test('should allow setting handler to null', () => {
      setGlobalAlertHandler(null);

      showAlert('Test', 'Message');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Global alert handler not set. Make sure to call setGlobalAlertHandler.',
      );
    });
  });

  describe('showAlert', () => {
    test('should call global handler with basic config', () => {
      showAlert('Test Title', 'Test Message');

      expect(mockHandler).toHaveBeenCalledWith({
        type: 'info',
        title: 'Test Title',
        message: 'Test Message',
        primaryAction: undefined,
        secondaryAction: undefined,
        persistent: false,
        showCloseButton: true,
      });
    });

    test('should handle title only', () => {
      showAlert('Title Only');

      expect(mockHandler).toHaveBeenCalledWith({
        type: 'info',
        title: 'Title Only',
        message: undefined,
        primaryAction: undefined,
        secondaryAction: undefined,
        persistent: false,
        showCloseButton: true,
      });
    });

    test('should apply custom options', () => {
      const options: AlertOptions = {
        type: 'warning',
        persistent: true,
        showCloseButton: false,
        primaryAction: {
          label: 'Primary',
          onPress: jest.fn(),
          variant: 'destructive',
        },
        secondaryAction: {
          label: 'Secondary',
          onPress: jest.fn(),
        },
      };

      showAlert('Test', 'Message', options);

      expect(mockHandler).toHaveBeenCalledWith({
        type: 'warning',
        title: 'Test',
        message: 'Message',
        primaryAction: options.primaryAction,
        secondaryAction: options.secondaryAction,
        persistent: true,
        showCloseButton: false,
      });
    });

    test('should use default values for optional options', () => {
      const options: AlertOptions = {
        type: 'success',
        // Other options omitted to test defaults
      };

      showAlert('Test', 'Message', options);

      expect(mockHandler).toHaveBeenCalledWith({
        type: 'success',
        title: 'Test',
        message: 'Message',
        primaryAction: undefined,
        secondaryAction: undefined,
        persistent: false,
        showCloseButton: true,
      });
    });

    test('should handle empty options object', () => {
      showAlert('Test', 'Message', {});

      expect(mockHandler).toHaveBeenCalledWith({
        type: 'info',
        title: 'Test',
        message: 'Message',
        primaryAction: undefined,
        secondaryAction: undefined,
        persistent: false,
        showCloseButton: true,
      });
    });

    test('should warn when no global handler is set', () => {
      setGlobalAlertHandler(null);

      showAlert('Test', 'Message');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Global alert handler not set. Make sure to call setGlobalAlertHandler.',
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    test('should handle showCloseButton explicitly set to false', () => {
      showAlert('Test', 'Message', { showCloseButton: false });

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          showCloseButton: false,
        }),
      );
    });

    test('should handle all alert types', () => {
      const types: Array<'success' | 'error' | 'warning' | 'info'> = [
        'success',
        'error',
        'warning',
        'info',
      ];

      types.forEach((type) => {
        showAlert('Test', 'Message', { type });
        expect(mockHandler).toHaveBeenCalledWith(
          expect.objectContaining({ type }),
        );
      });
    });
  });

  describe('showSuccessAlert', () => {
    test('should show success alert with default OK button', () => {
      showSuccessAlert('Success Title', 'Success Message');

      expect(mockHandler).toHaveBeenCalledWith({
        type: 'success',
        title: 'Success Title',
        message: 'Success Message',
        primaryAction: {
          label: 'OK',
          onPress: expect.any(Function),
        },
        secondaryAction: undefined,
        persistent: false,
        showCloseButton: true,
      });
    });

    test('should handle custom onOk callback', () => {
      const onOk = jest.fn();
      showSuccessAlert('Success', 'Message', onOk);

      const config = mockHandler.mock.calls[0][0];
      expect(config.primaryAction?.label).toBe('OK');
      expect(config.primaryAction?.onPress).toBe(onOk);
    });

    test('should handle title only', () => {
      showSuccessAlert('Success Only');

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Success Only',
          message: undefined,
        }),
      );
    });

    test('should provide empty function when no onOk provided', () => {
      showSuccessAlert('Success', 'Message');

      const config = mockHandler.mock.calls[0][0];
      expect(config.primaryAction?.onPress).toEqual(expect.any(Function));

      // Test that the empty function doesn't throw
      expect(() => config.primaryAction?.onPress()).not.toThrow();
    });
  });

  describe('showErrorAlert', () => {
    test('should show error alert with correct type', () => {
      showErrorAlert('Error Title', 'Error Message');

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Error Title',
          message: 'Error Message',
        }),
      );
    });

    test('should handle custom onOk callback', () => {
      const onOk = jest.fn();
      showErrorAlert('Error', 'Message', onOk);

      const config = mockHandler.mock.calls[0][0];
      expect(config.primaryAction?.onPress).toBe(onOk);
    });

    test('should provide default OK button', () => {
      showErrorAlert('Error', 'Message');

      const config = mockHandler.mock.calls[0][0];
      expect(config.primaryAction?.label).toBe('OK');
    });
  });

  describe('showWarningAlert', () => {
    test('should show warning alert with correct type', () => {
      showWarningAlert('Warning Title', 'Warning Message');

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          title: 'Warning Title',
          message: 'Warning Message',
        }),
      );
    });

    test('should handle custom onOk callback', () => {
      const onOk = jest.fn();
      showWarningAlert('Warning', 'Message', onOk);

      const config = mockHandler.mock.calls[0][0];
      expect(config.primaryAction?.onPress).toBe(onOk);
    });

    test('should provide default OK button', () => {
      showWarningAlert('Warning', 'Message');

      const config = mockHandler.mock.calls[0][0];
      expect(config.primaryAction?.label).toBe('OK');
    });
  });

  describe('showConfirmAlert', () => {
    test('should show confirm alert with default labels', () => {
      const onConfirm = jest.fn();
      showConfirmAlert('Confirm Title', 'Confirm Message', onConfirm);

      expect(mockHandler).toHaveBeenCalledWith({
        type: 'info',
        title: 'Confirm Title',
        message: 'Confirm Message',
        primaryAction: {
          label: 'Confirm',
          onPress: onConfirm,
          variant: 'primary',
        },
        secondaryAction: {
          label: 'Cancel',
          onPress: expect.any(Function),
        },
        persistent: true,
        showCloseButton: true,
      });
    });

    test('should handle custom labels', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      showConfirmAlert(
        'Custom Confirm',
        'Message',
        onConfirm,
        onCancel,
        'Yes',
        'No',
      );

      const config = mockHandler.mock.calls[0][0];
      expect(config.primaryAction?.label).toBe('Yes');
      expect(config.secondaryAction?.label).toBe('No');
      expect(config.secondaryAction?.onPress).toBe(onCancel);
    });

    test('should handle destructive confirmation', () => {
      const onConfirm = jest.fn();

      showConfirmAlert(
        'Destructive',
        'Message',
        onConfirm,
        undefined,
        'Delete',
        'Cancel',
        true,
      );

      const config = mockHandler.mock.calls[0][0];
      expect(config.type).toBe('error');
      expect(config.primaryAction?.variant).toBe('destructive');
    });

    test('should handle non-destructive confirmation', () => {
      const onConfirm = jest.fn();

      showConfirmAlert(
        'Non-destructive',
        'Message',
        onConfirm,
        undefined,
        'Confirm',
        'Cancel',
        false,
      );

      const config = mockHandler.mock.calls[0][0];
      expect(config.type).toBe('info');
      expect(config.primaryAction?.variant).toBe('primary');
    });

    test('should provide default onCancel when not provided', () => {
      const onConfirm = jest.fn();
      showConfirmAlert('Test', 'Message', onConfirm);

      const config = mockHandler.mock.calls[0][0];
      expect(config.secondaryAction?.onPress).toEqual(expect.any(Function));

      // Test that the empty function doesn't throw
      expect(() => config.secondaryAction?.onPress()).not.toThrow();
    });

    test('should set persistent to true', () => {
      const onConfirm = jest.fn();
      showConfirmAlert('Test', 'Message', onConfirm);

      const config = mockHandler.mock.calls[0][0];
      expect(config.persistent).toBe(true);
    });

    test('should handle async onConfirm function', async () => {
      const onConfirm = jest.fn().mockResolvedValue(undefined);
      showConfirmAlert('Test', 'Message', onConfirm);

      const config = mockHandler.mock.calls[0][0];
      const result = config.primaryAction?.onPress();

      expect(result).toBeInstanceOf(Promise);
      await result; // Ensure it resolves without error
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  describe('showDeleteConfirmAlert', () => {
    test('should show delete confirmation with correct defaults', () => {
      const onDelete = jest.fn();
      showDeleteConfirmAlert('Delete Item', 'Are you sure?', onDelete);

      expect(mockHandler).toHaveBeenCalledWith({
        type: 'error',
        title: 'Delete Item',
        message: 'Are you sure?',
        primaryAction: {
          label: 'Delete',
          onPress: onDelete,
          variant: 'destructive',
        },
        secondaryAction: {
          label: 'Cancel',
          onPress: expect.any(Function),
        },
        persistent: true,
        showCloseButton: true,
      });
    });

    test('should handle custom onCancel callback', () => {
      const onDelete = jest.fn();
      const onCancel = jest.fn();

      showDeleteConfirmAlert('Delete', 'Message', onDelete, onCancel);

      const config = mockHandler.mock.calls[0][0];
      expect(config.secondaryAction?.onPress).toBe(onCancel);
    });

    test('should provide default onCancel when not provided', () => {
      const onDelete = jest.fn();
      showDeleteConfirmAlert('Delete', 'Message', onDelete);

      const config = mockHandler.mock.calls[0][0];
      expect(config.secondaryAction?.onPress).toEqual(expect.any(Function));
      expect(() => config.secondaryAction?.onPress()).not.toThrow();
    });

    test('should be destructive by design', () => {
      const onDelete = jest.fn();
      showDeleteConfirmAlert('Delete', 'Message', onDelete);

      const config = mockHandler.mock.calls[0][0];
      expect(config.type).toBe('error');
      expect(config.primaryAction?.variant).toBe('destructive');
      expect(config.primaryAction?.label).toBe('Delete');
    });

    test('should handle async onDelete function', async () => {
      const onDelete = jest.fn().mockResolvedValue(undefined);
      showDeleteConfirmAlert('Delete', 'Message', onDelete);

      const config = mockHandler.mock.calls[0][0];
      const result = config.primaryAction?.onPress();

      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(onDelete).toHaveBeenCalled();
    });
  });

  describe('integration and edge cases', () => {
    test('should handle multiple alert calls', () => {
      showSuccessAlert('Success 1');
      showErrorAlert('Error 1');
      showWarningAlert('Warning 1');

      expect(mockHandler).toHaveBeenCalledTimes(3);
      expect(mockHandler).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ type: 'success' }),
      );
      expect(mockHandler).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ type: 'error' }),
      );
      expect(mockHandler).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ type: 'warning' }),
      );
    });

    test('should handle handler changes', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      setGlobalAlertHandler(handler1);
      showAlert('Test 1');
      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();

      setGlobalAlertHandler(handler2);
      showAlert('Test 2');
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalled();
    });

    test('should handle empty strings', () => {
      showAlert('', '');

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '',
          message: '',
        }),
      );
    });

    test('should maintain function references for actions', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      showConfirmAlert('Test', 'Message', onConfirm, onCancel);

      const config = mockHandler.mock.calls[0][0];
      expect(config.primaryAction?.onPress).toBe(onConfirm);
      expect(config.secondaryAction?.onPress).toBe(onCancel);
    });

    test('should handle complex alert workflow', () => {
      // Simulate a complex user interaction workflow
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const onConfirm = jest.fn();

      // Show confirmation
      showConfirmAlert('Proceed?', 'This will delete data', onConfirm);
      expect(mockHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'info', persistent: true }),
      );

      // Show success after confirmation
      showSuccessAlert('Done!', 'Data deleted', onSuccess);
      expect(mockHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'success' }),
      );

      // Show error if something goes wrong
      showErrorAlert('Failed!', 'Could not delete', onError);
      expect(mockHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'error' }),
      );

      expect(mockHandler).toHaveBeenCalledTimes(3);
    });
  });
});
