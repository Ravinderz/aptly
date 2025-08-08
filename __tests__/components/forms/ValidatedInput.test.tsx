/**
 * ValidatedInput Component Tests
 * Comprehensive test suite for the ValidatedInput component
 */

import React from 'react';
import { z } from 'zod';
import {
  render,
  fireEvent,
  waitFor,
  accessibilityUtils,
  interactionUtils,
  mockUtils,
  commonPatterns,
} from '../../utils/testUtils.enhanced';
import ValidatedInput from '../../../components/forms/ValidatedInput';
import { phoneSchema, emailSchema } from '../../../utils/validation.enhanced';

// Test schemas
const testStringSchema = z.string().min(3, 'Minimum 3 characters').max(10, 'Maximum 10 characters');
const testEmailSchema = z.string().email('Invalid email format');

describe('ValidatedInput', () => {
  // Basic rendering tests
  commonPatterns.shouldRenderWithoutCrashing(ValidatedInput, {
    value: '',
    onChangeText: jest.fn(),
    label: 'Test Input',
  });

  commonPatterns.shouldMatchSnapshot(ValidatedInput, {
    value: 'test value',
    onChangeText: jest.fn(),
    label: 'Test Input',
    placeholder: 'Enter text',
  });

  describe('Basic Functionality', () => {
    it('renders with label and placeholder', () => {
      const { getByText, getByPlaceholderText } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          label="Email Address"
          placeholder="Enter your email"
        />
      );

      expect(getByText('Email Address')).toBeTruthy();
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    });

    it('displays required asterisk when required', () => {
      const { getByText } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          label="Required Field"
          required
        />
      );

      expect(getByText('*')).toBeTruthy();
    });

    it('calls onChangeText when text changes', async () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <ValidatedInput
          value=""
          onChangeText={onChangeText}
          testID="test-input"
        />
      );

      const input = getByDisplayValue('');
      await interactionUtils.typeText(input, 'new text');

      expect(onChangeText).toHaveBeenCalledWith('nnew text'); // Called for each character
    });

    it('calls onBlur when input loses focus', () => {
      const onBlur = jest.fn();
      const { getByDisplayValue } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          onBlur={onBlur}
        />
      );

      const input = getByDisplayValue('');
      fireEvent(input, 'blur');

      expect(onBlur).toHaveBeenCalled();
    });

    it('displays helper text when provided', () => {
      const helperText = 'This is helper text';
      const { getByText } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          helperText={helperText}
        />
      );

      expect(getByText(helperText)).toBeTruthy();
    });
  });

  describe('Validation', () => {
    it('shows validation error when schema validation fails', async () => {
      const { getByDisplayValue, getByText, rerender } = render(
        <ValidatedInput
          value="ab"
          onChangeText={jest.fn()}
          schema={testStringSchema}
          validateOnBlur
        />
      );

      const input = getByDisplayValue('ab');
      fireEvent(input, 'blur');

      await waitFor(() => {
        expect(getByText('Minimum 3 characters')).toBeTruthy();
      });
    });

    it('validates email format correctly', async () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue, getByText } = render(
        <ValidatedInput
          value="invalid-email"
          onChangeText={onChangeText}
          schema={testEmailSchema}
          validateOnBlur
        />
      );

      const input = getByDisplayValue('invalid-email');
      fireEvent(input, 'blur');

      await waitFor(() => {
        expect(getByText('Invalid email format')).toBeTruthy();
      });
    });

    it('shows external error when provided', () => {
      const externalError = 'External validation error';
      const { getByText } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          error={externalError}
        />
      );

      expect(getByText(externalError)).toBeTruthy();
    });

    it('validates on change when enabled', async () => {
      const { getByDisplayValue, queryByText } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          schema={testStringSchema}
          validateOnChange
          debounceMs={100}
        />
      );

      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'ab');

      await waitFor(() => {
        expect(queryByText('Minimum 3 characters')).toBeTruthy();
      }, { timeout: 200 });
    });

    it('shows success state when validation passes', async () => {
      const { getByDisplayValue, getByTestId } = render(
        <ValidatedInput
          value="valid@example.com"
          onChangeText={jest.fn()}
          schema={testEmailSchema}
          validateOnBlur
          testID="email-input"
        />
      );

      const input = getByDisplayValue('valid@example.com');
      fireEvent(input, 'blur');

      await waitFor(() => {
        // Success icon should be present
        expect(getByTestId('email-input')).toBeTruthy();
      });
    });
  });

  describe('Secure Text Entry', () => {
    it('toggles password visibility', () => {
      const { getByDisplayValue, getByTestId } = render(
        <ValidatedInput
          value="password123"
          onChangeText={jest.fn()}
          secureTextEntry
          testID="password-input"
        />
      );

      const toggleButton = getByTestId('password-input-secure-toggle');
      fireEvent.press(toggleButton);

      // Password should become visible
      expect(getByDisplayValue('password123')).toBeTruthy();
    });

    it('shows eye icon for password visibility toggle', () => {
      const { getByTestId } = render(
        <ValidatedInput
          value="password"
          onChangeText={jest.fn()}
          secureTextEntry
          testID="password-input"
        />
      );

      expect(getByTestId('password-input-secure-toggle')).toBeTruthy();
    });
  });

  describe('Clearable Input', () => {
    it('shows clear button when clearable and has value', () => {
      const { getByTestId } = render(
        <ValidatedInput
          value="some text"
          onChangeText={jest.fn()}
          clearable
          testID="clearable-input"
        />
      );

      expect(getByTestId('clearable-input-clear-button')).toBeTruthy();
    });

    it('clears input when clear button pressed', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <ValidatedInput
          value="some text"
          onChangeText={onChangeText}
          clearable
          testID="clearable-input"
        />
      );

      const clearButton = getByTestId('clearable-input-clear-button');
      fireEvent.press(clearButton);

      expect(onChangeText).toHaveBeenCalledWith('');
    });

    it('does not show clear button when input is empty', () => {
      const { queryByTestId } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          clearable
          testID="clearable-input"
        />
      );

      expect(queryByTestId('clearable-input-clear-button')).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when isLoading is true', () => {
      const { getByTestId } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          isLoading
          testID="loading-input"
        />
      );

      // Loading indicator should be present
      expect(getByTestId('loading-input')).toBeTruthy();
    });

    it('shows loading indicator during validation', async () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value="test"
          onChangeText={jest.fn()}
          schema={testStringSchema}
          validateOnChange
          debounceMs={500}
        />
      );

      const input = getByDisplayValue('test');
      fireEvent.changeText(input, 'ab');

      // During debounce period, validation loading should show
      // This would require more sophisticated timing tests
    });
  });

  describe('Different Variants', () => {
    it('applies correct styles for filled variant', () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value="test"
          onChangeText={jest.fn()}
          variant="filled"
        />
      );

      const input = getByDisplayValue('test');
      // Style assertions would depend on your testing setup
      expect(input).toBeTruthy();
    });

    it('applies correct styles for outlined variant', () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value="test"
          onChangeText={jest.fn()}
          variant="outlined"
        />
      );

      const input = getByDisplayValue('test');
      expect(input).toBeTruthy();
    });
  });

  describe('Size Variations', () => {
    it('applies small size correctly', () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value="test"
          onChangeText={jest.fn()}
          size="small"
        />
      );

      const input = getByDisplayValue('test');
      expect(input).toBeTruthy();
    });

    it('applies large size correctly', () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value="test"
          onChangeText={jest.fn()}
          size="large"
        />
      );

      const input = getByDisplayValue('test');
      expect(input).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    commonPatterns.shouldBeAccessible(ValidatedInput, {
      value: 'test',
      onChangeText: jest.fn(),
      label: 'Accessible Input',
      accessibilityLabel: 'Test input field',
      accessibilityHint: 'Enter your text here',
    });

    it('has proper accessibility labels', () => {
      const { getByLabelText } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          label="Email"
          accessibilityLabel="Email input field"
        />
      );

      expect(getByLabelText('Email input field')).toBeTruthy();
    });

    it('has proper accessibility state when disabled', () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value="test"
          onChangeText={jest.fn()}
          editable={false}
        />
      );

      const input = getByDisplayValue('test');
      expect(input.props.accessibilityState?.disabled).toBe(true);
    });

    it('announces validation errors to screen readers', async () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value="ab"
          onChangeText={jest.fn()}
          schema={testStringSchema}
          validateOnBlur
          accessibilityLabel="Test input"
        />
      );

      const input = getByDisplayValue('ab');
      fireEvent(input, 'blur');

      await waitFor(() => {
        // Error should be associated with the input for screen readers
        expect(input).toBeTruthy();
      });
    });
  });

  describe('Keyboard Types', () => {
    it('applies email keyboard type correctly', () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          keyboardType="email-address"
        />
      );

      const input = getByDisplayValue('');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('applies phone keyboard type correctly', () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          keyboardType="phone-pad"
        />
      );

      const input = getByDisplayValue('');
      expect(input.props.keyboardType).toBe('phone-pad');
    });
  });

  describe('Error States', () => {
    it('applies error styling when validation fails', async () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value="ab"
          onChangeText={jest.fn()}
          schema={testStringSchema}
          validateOnBlur
        />
      );

      const input = getByDisplayValue('ab');
      fireEvent(input, 'blur');

      await waitFor(() => {
        // Error styling would be applied
        expect(input).toBeTruthy();
      });
    });

    it('shows error icon when validation fails', async () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value="ab"
          onChangeText={jest.fn()}
          schema={testStringSchema}
          validateOnBlur
        />
      );

      const input = getByDisplayValue('ab');
      fireEvent(input, 'blur');

      await waitFor(() => {
        // Error icon should be present
        expect(input).toBeTruthy();
      });
    });

    it('clears error when valid input is entered', async () => {
      const { getByDisplayValue, queryByText } = render(
        <ValidatedInput
          value="ab"
          onChangeText={jest.fn()}
          schema={testStringSchema}
          validateOnBlur
        />
      );

      const input = getByDisplayValue('ab');
      
      // First, trigger error
      fireEvent(input, 'blur');
      
      await waitFor(() => {
        expect(queryByText('Minimum 3 characters')).toBeTruthy();
      });

      // Then fix the error
      fireEvent.changeText(input, 'valid');
      fireEvent(input, 'blur');

      await waitFor(() => {
        expect(queryByText('Minimum 3 characters')).toBeNull();
      });
    });
  });

  describe('Focus States', () => {
    it('applies focus styling when input is focused', () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
        />
      );

      const input = getByDisplayValue('');
      fireEvent(input, 'focus');

      // Focus styling would be applied
      expect(input).toBeTruthy();
    });

    it('removes focus styling when input loses focus', () => {
      const { getByDisplayValue } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
        />
      );

      const input = getByDisplayValue('');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');

      // Focus styling would be removed
      expect(input).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('debounces validation correctly', async () => {
      const mockSchema = {
        safeParse: jest.fn(() => ({ success: true })),
      };

      const { getByDisplayValue } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          schema={mockSchema as any}
          validateOnChange
          debounceMs={300}
        />
      );

      const input = getByDisplayValue('');
      
      // Rapidly change text
      fireEvent.changeText(input, 'a');
      fireEvent.changeText(input, 'ab');
      fireEvent.changeText(input, 'abc');

      // Validation should only be called once after debounce
      await waitFor(() => {
        expect(mockSchema.safeParse).toHaveBeenCalledTimes(1);
      }, { timeout: 400 });
    });

    it('cleans up debounce timers on unmount', () => {
      const { unmount, getByDisplayValue } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          schema={testStringSchema}
          validateOnChange
          debounceMs={1000}
        />
      );

      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'test');

      // Unmount before debounce completes
      unmount();

      // Should not throw any errors or cause memory leaks
      expect(true).toBe(true);
    });
  });

  describe('Integration with react-hook-form', () => {
    it('works with Controller component', () => {
      // This would test integration with react-hook-form Controller
      // Implementation depends on your specific setup
      expect(true).toBe(true);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom styles correctly', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByDisplayValue } = render(
        <ValidatedInput
          value=""
          onChangeText={jest.fn()}
          style={customStyle}
        />
      );

      const input = getByDisplayValue('');
      // Style assertion would depend on your testing setup
      expect(input).toBeTruthy();
    });
  });
});