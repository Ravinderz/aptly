/**
 * Form Wrapper Component
 * Provides form context, validation, and state management
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native';
import { z } from 'zod';
import { useFormValidation, UseFormValidationReturn } from '@/hooks/useFormValidation';

interface FormContextValue<T extends Record<string, any>> {
  form: UseFormValidationReturn<T>;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue<any> | null>(null);

export interface FormWrapperProps<T extends Record<string, any>> {
  children: ReactNode;
  schema: z.ZodSchema<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validationOptions?: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
  };
  style?: any;
  showScrollView?: boolean;
  keyboardAvoiding?: boolean;
}

export function FormWrapper<T extends Record<string, any>>({
  children,
  schema,
  initialValues,
  onSubmit,
  validationOptions = {},
  style,
  showScrollView = true,
  keyboardAvoiding = true,
}: FormWrapperProps<T>) {
  const form = useFormValidation(schema, initialValues, {
    validateOnChange: false,
    validateOnBlur: true,
    validateOnSubmit: true,
    ...validationOptions,
  });

  const handleSubmit = async () => {
    try {
      await form.handleSubmit(onSubmit);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const contextValue: FormContextValue<T> = {
    form,
    isSubmitting: form.isSubmitting,
  };

  const FormContent = (
    <FormContext.Provider value={contextValue}>
      <View style={[styles.container, style]}>
        {children}
      </View>
    </FormContext.Provider>
  );

  if (!showScrollView && !keyboardAvoiding) {
    return FormContent;
  }

  if (keyboardAvoiding) {
    const content = showScrollView ? (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {FormContent}
      </ScrollView>
    ) : FormContent;

    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  if (showScrollView) {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {FormContent}
      </ScrollView>
    );
  }

  return FormContent;
}

// Hook to use form context
export function useFormContext<T extends Record<string, any>>(): FormContextValue<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormWrapper');
  }
  return context;
}

// Individual Field Component that automatically connects to form context
export interface FormFieldProps {
  name: string;
  children: (props: {
    value: any;
    onChangeText: (value: any) => void;
    onBlur: () => void;
    error: string;
    isValid: boolean;
    touched: boolean;
  }) => ReactNode;
}

export function FormField({ name, children }: FormFieldProps) {
  const { form } = useFormContext();
  
  const fieldProps = form.getFieldProps(name);
  const field = form.fields[name];
  
  return (
    <>
      {children({
        ...fieldProps,
        isValid: field?.isValid || false,
        touched: field?.touched || false,
      })}
    </>
  );
}

// Pre-built form actions component
export interface FormActionsProps {
  children?: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  showSecondary?: boolean;
  style?: any;
}

export function FormActions({
  children,
  primaryLabel = 'Submit',
  secondaryLabel = 'Cancel',
  onPrimary,
  onSecondary,
  primaryDisabled,
  secondaryDisabled = false,
  showSecondary = true,
  style,
}: FormActionsProps) {
  const { form, isSubmitting } = useFormContext();

  if (children) {
    return (
      <View style={[styles.actions, style]}>
        {children}
      </View>
    );
  }

  const handlePrimary = onPrimary || (() => {
    // Default submit action
    form.handleSubmit(() => {});
  });

  return (
    <View style={[styles.actions, style]}>
      {showSecondary && (
        <View style={styles.actionButton}>
          {/* Secondary button would be implemented here */}
        </View>
      )}
      <View style={styles.actionButton}>
        {/* Primary button would be implemented here */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default FormWrapper;