/**
 * Form Validation Hook
 * Custom hook for comprehensive form validation using Zod schemas
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { validateForm, validateField } from '@/utils/validation.enhanced';

export interface FormField<T = any> {
  value: T;
  error: string;
  touched: boolean;
  isValid: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
  touchedFields: Set<keyof T>;
  errors: { [K in keyof T]?: string };
}

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  revalidateOnChange?: boolean;
  debounceMs?: number;
}

export interface UseFormValidationReturn<T extends Record<string, any>> {
  // Form state
  fields: FormState<T>['fields'];
  errors: FormState<T>['errors'];
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
  touchedFields: Set<keyof T>;

  // Field operations
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  clearError: <K extends keyof T>(field: K) => void;
  clearAllErrors: () => void;
  touchField: <K extends keyof T>(field: K) => void;
  untouchField: <K extends keyof T>(field: K) => void;

  // Form operations
  setValues: (values: Partial<T>) => void;
  resetForm: (newInitialValues?: Partial<T>) => void;
  validateField: <K extends keyof T>(field: K) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => Promise<void>;

  // Utilities
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    onChangeText: (value: T[K]) => void;
    onBlur: () => void;
    error: string;
  };
  isDirty: boolean;
  dirtyFields: Set<keyof T>;
}

export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialValues: T,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn<T> {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    validateOnSubmit = true,
    revalidateOnChange = true,
    debounceMs = 300,
  } = options;

  // State management
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const fields = {} as FormState<T>['fields'];
    
    Object.keys(initialValues).forEach((key) => {
      const fieldKey = key as keyof T;
      fields[fieldKey] = {
        value: initialValues[fieldKey],
        error: '',
        touched: false,
        isValid: true,
      };
    });

    return {
      fields,
      isValid: true,
      isSubmitting: false,
      submitCount: 0,
      touchedFields: new Set<keyof T>(),
      errors: {},
    };
  });

  const initialValuesRef = useRef(initialValues);
  const debounceTimersRef = useRef<Map<keyof T, NodeJS.Timeout>>(new Map());

  // Update initial values if they change
  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Derived state
  const isDirty = Object.keys(formState.fields).some(
    (key) => formState.fields[key as keyof T].value !== initialValuesRef.current[key as keyof T]
  );

  const dirtyFields = new Set(
    Object.keys(formState.fields).filter(
      (key) => formState.fields[key as keyof T].value !== initialValuesRef.current[key as keyof T]
    ) as (keyof T)[]
  );

  // Validation functions
  const validateSingleField = useCallback(
    async <K extends keyof T>(field: K): Promise<boolean> => {
      const fieldSchema = (schema as any).shape?.[field];
      if (!fieldSchema) return true;

      const result = validateField(fieldSchema, formState.fields[field].value);
      
      setFormState((prev) => ({
        ...prev,
        fields: {
          ...prev.fields,
          [field]: {
            ...prev.fields[field],
            error: result.error || '',
            isValid: result.isValid,
          },
        },
        errors: {
          ...prev.errors,
          [field]: result.error || undefined,
        },
      }));

      return result.isValid;
    },
    [schema, formState.fields]
  );

  const validateEntireForm = useCallback(async (): Promise<boolean> => {
    const formValues = Object.keys(formState.fields).reduce((acc, key) => {
      acc[key as keyof T] = formState.fields[key as keyof T].value;
      return acc;
    }, {} as T);

    const result = validateForm(schema, formValues);

    setFormState((prev) => {
      const newFields = { ...prev.fields };
      const newErrors = {} as { [K in keyof T]?: string };

      // Clear all errors first
      Object.keys(newFields).forEach((key) => {
        const fieldKey = key as keyof T;
        newFields[fieldKey] = {
          ...newFields[fieldKey],
          error: '',
          isValid: true,
        };
      });

      // Set new errors
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, error]) => {
          const fieldKey = key as keyof T;
          if (newFields[fieldKey]) {
            newFields[fieldKey] = {
              ...newFields[fieldKey],
              error: error as string,
              isValid: false,
            };
            newErrors[fieldKey] = error as string;
          }
        });
      }

      return {
        ...prev,
        fields: newFields,
        errors: newErrors,
        isValid: result.isValid,
      };
    });

    return result.isValid;
  }, [schema, formState.fields]);

  // Field operations
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: {
          ...prev.fields[field],
          value,
        },
      },
    }));

    // Debounced validation on change
    if (validateOnChange || (revalidateOnChange && formState.fields[field].error)) {
      const timer = debounceTimersRef.current.get(field);
      if (timer) clearTimeout(timer);

      const newTimer = setTimeout(() => {
        validateSingleField(field);
      }, debounceMs);

      debounceTimersRef.current.set(field, newTimer);
    }
  }, [validateOnChange, revalidateOnChange, debounceMs, formState.fields, validateSingleField]);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setFormState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: {
          ...prev.fields[field],
          error,
          isValid: !error,
        },
      },
      errors: {
        ...prev.errors,
        [field]: error || undefined,
      },
    }));
  }, []);

  const clearError = useCallback(<K extends keyof T>(field: K) => {
    setFormState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: {
          ...prev.fields[field],
          error: '',
          isValid: true,
        },
      },
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setFormState((prev) => {
      const newFields = { ...prev.fields };
      Object.keys(newFields).forEach((key) => {
        const fieldKey = key as keyof T;
        newFields[fieldKey] = {
          ...newFields[fieldKey],
          error: '',
          isValid: true,
        };
      });

      return {
        ...prev,
        fields: newFields,
        errors: {},
        isValid: true,
      };
    });
  }, []);

  const touchField = useCallback(<K extends keyof T>(field: K) => {
    setFormState((prev) => {
      const newTouchedFields = new Set(prev.touchedFields);
      newTouchedFields.add(field);

      return {
        ...prev,
        fields: {
          ...prev.fields,
          [field]: {
            ...prev.fields[field],
            touched: true,
          },
        },
        touchedFields: newTouchedFields,
      };
    });

    if (validateOnBlur) {
      validateSingleField(field);
    }
  }, [validateOnBlur, validateSingleField]);

  const untouchField = useCallback(<K extends keyof T>(field: K) => {
    setFormState((prev) => {
      const newTouchedFields = new Set(prev.touchedFields);
      newTouchedFields.delete(field);

      return {
        ...prev,
        fields: {
          ...prev.fields,
          [field]: {
            ...prev.fields[field],
            touched: false,
          },
        },
        touchedFields: newTouchedFields,
      };
    });
  }, []);

  // Form operations
  const setValues = useCallback((values: Partial<T>) => {
    setFormState((prev) => {
      const newFields = { ...prev.fields };
      
      Object.entries(values).forEach(([key, value]) => {
        const fieldKey = key as keyof T;
        if (newFields[fieldKey]) {
          newFields[fieldKey] = {
            ...newFields[fieldKey],
            value: value as T[keyof T],
          };
        }
      });

      return {
        ...prev,
        fields: newFields,
      };
    });
  }, []);

  const resetForm = useCallback((newInitialValues?: Partial<T>) => {
    const valuesToUse = { ...initialValuesRef.current, ...newInitialValues };
    
    setFormState(() => {
      const fields = {} as FormState<T>['fields'];
      
      Object.keys(valuesToUse).forEach((key) => {
        const fieldKey = key as keyof T;
        fields[fieldKey] = {
          value: valuesToUse[fieldKey],
          error: '',
          touched: false,
          isValid: true,
        };
      });

      return {
        fields,
        isValid: true,
        isSubmitting: false,
        submitCount: 0,
        touchedFields: new Set<keyof T>(),
        errors: {},
      };
    });

    // Clear debounce timers
    debounceTimersRef.current.forEach((timer) => clearTimeout(timer));
    debounceTimersRef.current.clear();
  }, []);

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => void | Promise<void>) => {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        submitCount: prev.submitCount + 1,
      }));

      try {
        let isFormValid = true;

        if (validateOnSubmit) {
          isFormValid = await validateEntireForm();
        }

        if (isFormValid) {
          const formValues = Object.keys(formState.fields).reduce((acc, key) => {
            acc[key as keyof T] = formState.fields[key as keyof T].value;
            return acc;
          }, {} as T);

          await onSubmit(formValues);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        throw error;
      } finally {
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
        }));
      }
    },
    [validateOnSubmit, validateEntireForm, formState.fields]
  );

  // Utility functions
  const getFieldProps = useCallback(<K extends keyof T>(field: K) => {
    return {
      value: formState.fields[field].value,
      onChangeText: (value: T[K]) => setValue(field, value),
      onBlur: () => touchField(field),
      error: formState.fields[field].error,
    };
  }, [formState.fields, setValue, touchField]);

  return {
    // State
    fields: formState.fields,
    errors: formState.errors,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    submitCount: formState.submitCount,
    touchedFields: formState.touchedFields,

    // Field operations
    setValue,
    setError,
    clearError,
    clearAllErrors,
    touchField,
    untouchField,

    // Form operations
    setValues,
    resetForm,
    validateField: validateSingleField,
    validateForm: validateEntireForm,
    handleSubmit,

    // Utilities
    getFieldProps,
    isDirty,
    dirtyFields,
  };
}