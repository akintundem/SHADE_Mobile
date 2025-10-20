import React from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidator {
  private rules: Record<string, ValidationRule[]> = {};

  addRule(field: string, rule: ValidationRule) {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push(rule);
    return this;
  }

  validateField(field: string, value: any): string | null {
    const fieldRules = this.rules[field];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = this.validateRule(value, rule);
      if (error) return error;
    }
    return null;
  }

  validateForm(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, value] of Object.entries(data)) {
      const error = this.validateField(field, value);
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private validateRule(value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || 'This field is required';
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `Minimum length is ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `Maximum length is ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || 'Invalid format';
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }
}

// Common validation rules
export const commonRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'This field is required',
  }),

  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address',
  }),

  phone: (message?: string): ValidationRule => ({
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: message || 'Please enter a valid phone number',
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message: message || `Minimum length is ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message: message || `Maximum length is ${length} characters`,
  }),

  url: (message?: string): ValidationRule => ({
    pattern: /^https?:\/\/.+/,
    message: message || 'Please enter a valid URL',
  }),

  positiveNumber: (message?: string): ValidationRule => ({
    custom: (value) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return message || 'Please enter a positive number';
      }
      return null;
    },
  }),

  futureDate: (message?: string): ValidationRule => ({
    custom: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime()) || date <= new Date()) {
        return message || 'Please select a future date';
      }
      return null;
    },
  }),

  timeFormat: (message?: string): ValidationRule => ({
    pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    message: message || 'Please enter time in HH:MM format',
  }),

  dateFormat: (message?: string): ValidationRule => ({
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: message || 'Please enter date in YYYY-MM-DD format',
  }),
};

// Event-specific validation rules
export const eventValidationRules = {
  title: [
    commonRules.required('Event title is required'),
    commonRules.minLength(3, 'Event title must be at least 3 characters'),
    commonRules.maxLength(100, 'Event title must be less than 100 characters'),
  ],

  description: [
    commonRules.required('Event description is required'),
    commonRules.minLength(10, 'Event description must be at least 10 characters'),
    commonRules.maxLength(1000, 'Event description must be less than 1000 characters'),
  ],

  startDate: [
    commonRules.required('Start date is required'),
    commonRules.dateFormat('Please enter date in YYYY-MM-DD format'),
    commonRules.futureDate('Start date must be in the future'),
  ],

  startTime: [
    commonRules.required('Start time is required'),
    commonRules.timeFormat('Please enter time in HH:MM format'),
  ],

  endDate: [
    commonRules.dateFormat('Please enter date in YYYY-MM-DD format'),
  ],

  endTime: [
    commonRules.timeFormat('Please enter time in HH:MM format'),
  ],

  location: [
    commonRules.required('Location is required'),
    commonRules.minLength(3, 'Location must be at least 3 characters'),
  ],

  capacity: [
    commonRules.positiveNumber('Capacity must be a positive number'),
  ],

  price: [
    commonRules.positiveNumber('Price must be a positive number'),
  ],

  email: [
    commonRules.required('Email is required'),
    commonRules.email('Please enter a valid email address'),
  ],

  phone: [
    commonRules.phone('Please enter a valid phone number'),
  ],
};

// Create event form validator
export const createEventValidator = new FormValidator()
  .addRule('title', ...eventValidationRules.title)
  .addRule('description', ...eventValidationRules.description)
  .addRule('startDate', ...eventValidationRules.startDate)
  .addRule('startTime', ...eventValidationRules.startTime)
  .addRule('endDate', ...eventValidationRules.endDate)
  .addRule('endTime', ...eventValidationRules.endTime)
  .addRule('location', ...eventValidationRules.location)
  .addRule('capacity', ...eventValidationRules.capacity)
  .addRule('price', ...eventValidationRules.price);

// Attendee form validator
export const attendeeValidator = new FormValidator()
  .addRule('firstName', ...eventValidationRules.title)
  .addRule('lastName', ...eventValidationRules.title)
  .addRule('email', ...eventValidationRules.email)
  .addRule('phone', ...eventValidationRules.phone);

// Real-time validation hook
export const useFormValidation = (validator: FormValidator) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = React.useCallback((field: string, value: any) => {
    const error = validator.validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
    return error;
  }, [validator]);

  const validateForm = React.useCallback((data: Record<string, any>) => {
    const result = validator.validateForm(data);
    setErrors(result.errors);
    return result;
  }, [validator]);

  const setFieldTouched = React.useCallback((field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  const getFieldError = React.useCallback((field: string) => {
    return touched[field] ? errors[field] : '';
  }, [errors, touched]);

  const clearErrors = React.useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    getFieldError,
    clearErrors,
  };
};
