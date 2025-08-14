/**
 * Validated Input Component
 * Reusable form input with built-in validation, error handling, and accessibility
 */

import React, { useState, useCallback, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInputProps,
  StyleSheet,
} from 'react-native';
import { Eye, EyeOff, AlertCircle, CheckCircle2, X } from 'lucide-react-native';
import { z } from 'zod';
import { validateField } from '@/utils/validation.enhanced';
import { useAlert } from '@/components/ui/AlertCard';

export interface ValidatedInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  // Core props
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  
  // Validation props
  schema?: z.ZodSchema<any>;
  error?: string;
  showError?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  
  // UI props
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  helperText?: string;
  required?: boolean;
  clearable?: boolean;
  
  // Special input types
  secureTextEntry?: boolean;
  isLoading?: boolean;
  success?: boolean;
  
  // Accessibility
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

interface ValidatedInputState {
  isFocused: boolean;
  isSecureVisible: boolean;
  internalError: string;
  isValidating: boolean;
  hasBeenTouched: boolean;
}

export const ValidatedInput = forwardRef<TextInput, ValidatedInputProps>(
  (
    {
      // Core props
      label,
      value,
      onChangeText,
      onBlur,
      
      // Validation props
      schema,
      error: externalError,
      showError = true,
      validateOnChange = false,
      validateOnBlur = true,
      debounceMs = 300,
      
      // UI props
      variant = 'default',
      size = 'medium',
      icon,
      helperText,
      required = false,
      clearable = false,
      
      // Special props
      secureTextEntry = false,
      isLoading = false,
      success = false,
      
      // Accessibility
      testID,
      accessibilityLabel,
      accessibilityHint,
      
      // TextInput props
      style,
      placeholder,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      autoComplete,
      maxLength,
      multiline,
      numberOfLines,
      editable = true,
      ...restProps
    },
    ref
  ) => {
    const [state, setState] = useState<ValidatedInputState>({
      isFocused: false,
      isSecureVisible: false,
      internalError: '',
      isValidating: false,
      hasBeenTouched: false,
    });

    // Debounce timer ref
    const debounceTimerRef = React.useRef<NodeJS.Timeout>();

    // Determine which error to show
    const displayError = externalError || state.internalError;
    const hasError = Boolean(displayError) && showError;
    const isValid = success || (!hasError && state.hasBeenTouched && value.length > 0);

    // Validation function
    const validateInput = useCallback(async (inputValue: string) => {
      if (!schema) return true;

      setState(prev => ({ ...prev, isValidating: true }));
      
      try {
        const result = validateField(schema, inputValue);
        
        setState(prev => ({
          ...prev,
          internalError: result.error || '',
          isValidating: false,
        }));

        return result.isValid;
      } catch (error) {
        setState(prev => ({
          ...prev,
          internalError: 'Validation error',
          isValidating: false,
        }));
        return false;
      }
    }, [schema]);

    // Handle change with optional validation
    const handleChangeText = useCallback((text: string) => {
      onChangeText(text);
      setState(prev => ({ ...prev, hasBeenTouched: true }));

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounced validation on change
      if (validateOnChange && schema) {
        debounceTimerRef.current = setTimeout(() => {
          validateInput(text);
        }, debounceMs);
      }
    }, [onChangeText, validateOnChange, schema, validateInput, debounceMs]);

    // Handle blur with validation
    const handleBlur = useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        isFocused: false, 
        hasBeenTouched: true 
      }));
      
      if (validateOnBlur && schema) {
        validateInput(value);
      }
      
      onBlur?.();
    }, [onBlur, validateOnBlur, schema, validateInput, value]);

    // Handle focus
    const handleFocus = useCallback(() => {
      setState(prev => ({ ...prev, isFocused: true }));
    }, []);

    // Toggle secure text visibility
    const toggleSecureVisibility = useCallback(() => {
      setState(prev => ({ ...prev, isSecureVisible: !prev.isSecureVisible }));
    }, []);

    // Clear input
    const clearInput = useCallback(() => {
      onChangeText('');
      setState(prev => ({ ...prev, internalError: '', hasBeenTouched: false }));
    }, [onChangeText]);

    // Cleanup timer on unmount
    React.useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    // Style variations
    const getInputStyles = () => {
      const baseStyle = styles.input;
      const sizeStyles = styles[`${size}Input`];
      const variantStyles = styles[`${variant}Input`];
      
      let stateStyles = {};
      if (state.isFocused) stateStyles = { ...stateStyles, ...styles.focusedInput };
      if (hasError) stateStyles = { ...stateStyles, ...styles.errorInput };
      if (isValid) stateStyles = { ...stateStyles, ...styles.successInput };
      if (!editable) stateStyles = { ...stateStyles, ...styles.disabledInput };
      
      // Add left padding when icon is present
      if (icon) stateStyles = { ...stateStyles, ...styles.inputWithLeftIcon };

      return [baseStyle, sizeStyles, variantStyles, stateStyles, style];
    };

    const getContainerStyles = () => {
      return [
        styles.container,
        state.isFocused && styles.focusedContainer,
        hasError && styles.errorContainer,
        isValid && styles.successContainer,
      ];
    };

    // Render right icons
    const renderRightIcons = () => {
      const icons = [];
      
      // Loading indicator
      if (isLoading || state.isValidating) {
        icons.push(
          <ActivityIndicator
            key="loading"
            size="small"
            color="#666"
            style={styles.icon}
          />
        );
      }
      // Success icon
      else if (isValid) {
        icons.push(
          <CheckCircle2
            key="success"
            size={20}
            color="#10B981"
            style={styles.icon}
          />
        );
      }
      // Error icon
      else if (hasError) {
        icons.push(
          <AlertCircle
            key="error"
            size={20}
            color="#EF4444"
            style={styles.icon}
          />
        );
      }

      // Clear button
      if (clearable && value.length > 0 && editable) {
        icons.push(
          <TouchableOpacity
            key="clear"
            onPress={clearInput}
            style={styles.iconButton}
            accessibilityLabel="Clear input"
            testID={`${testID}-clear-button`}
          >
            <X size={20} color="#666" />
          </TouchableOpacity>
        );
      }

      // Secure text toggle
      if (secureTextEntry) {
        icons.push(
          <TouchableOpacity
            key="secure"
            onPress={toggleSecureVisibility}
            style={styles.iconButton}
            accessibilityLabel={state.isSecureVisible ? "Hide text" : "Show text"}
            testID={`${testID}-secure-toggle`}
          >
            {state.isSecureVisible ? (
              <EyeOff size={20} color="#666" />
            ) : (
              <Eye size={20} color="#666" />
            )}
          </TouchableOpacity>
        );
      }

      return icons.length > 0 ? (
        <View style={styles.rightIconsContainer}>
          {icons}
        </View>
      ) : null;
    };

    return (
      <View style={getContainerStyles()}>
        {/* Label */}
        {label && (
          <Text style={[
            styles.label,
            hasError && styles.errorLabel,
            isValid && styles.successLabel,
            required && styles.requiredLabel,
          ]}>
            {label}
            {required && <Text style={styles.requiredAsterisk}> *</Text>}
          </Text>
        )}

        {/* Input Container */}
        <View style={styles.inputContainer}>
          {/* Left Icon */}
          {icon && (
            <View style={styles.leftIcon}>
              {icon}
            </View>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry && !state.isSecureVisible}
            style={getInputStyles()}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            autoComplete={autoComplete}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
            testID={testID}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityHint={accessibilityHint}
            accessibilityState={{
              disabled: !editable,
              expanded: state.isFocused,
            }}
            {...restProps}
          />

          {/* Right Icons */}
          {renderRightIcons()}
        </View>

        {/* Helper Text / Error Message */}
        {(helperText || displayError) && (
          <View style={styles.messageContainer}>
            <Text style={[
              styles.helperText,
              hasError && styles.errorText,
              isValid && styles.successText,
            ]}>
              {hasError ? displayError : helperText}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  focusedContainer: {
    // Add focus styles if needed
  },
  errorContainer: {
    // Add error container styles if needed
  },
  successContainer: {
    // Add success container styles if needed
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  requiredLabel: {
    // Required label styles
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  errorLabel: {
    color: '#EF4444',
  },
  successLabel: {
    color: '#10B981',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  smallInput: {
    height: 36,
    fontSize: 14,
    paddingHorizontal: 8,
  },
  mediumInput: {
    height: 44,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  largeInput: {
    height: 52,
    fontSize: 18,
    paddingHorizontal: 16,
  },
  defaultInput: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  filledInput: {
    backgroundColor: '#F3F4F6',
    borderColor: 'transparent',
  },
  outlinedInput: {
    backgroundColor: 'transparent',
    borderColor: '#D1D5DB',
  },
  focusedInput: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  errorInput: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  successInput: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  inputWithLeftIcon: {
    paddingLeft: 44, // Increase left padding when icon is present (12 base + 24 icon + 8 gap)
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconsContainer: {
    position: 'absolute',
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 4,
  },
  iconButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  messageContainer: {
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
  },
  successText: {
    color: '#10B981',
  },
});

export default ValidatedInput;