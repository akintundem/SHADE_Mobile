import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Check, AlertCircle, Loader } from 'lucide-react-native';
import SmartInput from './SmartInput';
import KeyboardAwareContainer from './KeyboardAwareContainer';
import Button from './Button';
import { useI18n } from '../../i18n/I18nProvider';

type FormField = {
  name: string;
  label: string;
  type: 'email' | 'password' | 'name' | 'location' | 'event' | 'description' | 'phone' | 'url' | 'date' | 'capacity' | 'category';
  required?: boolean;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  suggestions?: any[];
};

type EnhancedFormProps = {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitButtonText?: string;
  loading?: boolean;
  contextData?: {
    recentEvents?: string[];
    savedLocations?: string[];
    userPreferences?: any;
  };
  style?: any;
};

export default function EnhancedForm({
  fields,
  onSubmit,
  submitButtonText = 'Submit',
  loading = false,
  contextData,
  style,
}: EnhancedFormProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<View>(null);

  // Handle field change
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Handle field blur
  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  // Validate individual field
  const validateField = (fieldName: string, value: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return;

    let error = '';

    // Required validation
    if (field.required && !value.trim()) {
      error = t('FieldRequired', { field: field.label });
    }

    // Length validation
    if (value && field.validation?.minLength && value.length < field.validation.minLength) {
      error = t('FieldMinLength', { field: field.label, min: field.validation.minLength });
    }

    if (value && field.validation?.maxLength && value.length > field.validation.maxLength) {
      error = t('FieldMaxLength', { field: field.label, max: field.validation.maxLength });
    }

    // Pattern validation
    if (value && field.validation?.pattern && !field.validation.pattern.test(value)) {
      error = t('FieldInvalidFormat', { field: field.label });
    }

    // Custom validation
    if (value && field.validation?.custom) {
      const customError = field.validation.custom(value);
      if (customError) {
        error = customError;
      }
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name] || '';
      let error = '';

      if (field.required && !value.trim()) {
        error = t('FieldRequired', { field: field.label });
        isValid = false;
      } else if (value && field.validation?.minLength && value.length < field.validation.minLength) {
        error = t('FieldMinLength', { field: field.label, min: field.validation.minLength });
        isValid = false;
      } else if (value && field.validation?.maxLength && value.length > field.validation.maxLength) {
        error = t('FieldMaxLength', { field: field.label, max: field.validation.maxLength });
        isValid = false;
      } else if (value && field.validation?.pattern && !field.validation.pattern.test(value)) {
        error = t('FieldInvalidFormat', { field: field.label });
        isValid = false;
      } else if (value && field.validation?.custom) {
        const customError = field.validation.custom(value);
        if (customError) {
          error = customError;
          isValid = false;
        }
      }

      newErrors[field.name] = error;
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(t('ValidationError'), t('FixErrorsBeforeSubmitting'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert(t('Error'), t('FailedToSubmitForm'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get field validation status
  const getFieldStatus = (fieldName: string) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];
    const isTouched = touched[fieldName];

    if (!isTouched) return null;
    if (error) return 'error';
    if (value && !error) return 'success';
    return null;
  };

  return (
    <KeyboardAwareContainer
      style={[{ flex: 1 }, style]}
      contentContainerStyle={{ padding: spacing.lg }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: spacing.lg }}>
        {fields.map((field) => {
          const status = getFieldStatus(field.name);
          const fieldValue = formData[field.name] || '';

          return (
            <View key={field.name}>
              <SmartInput
                label={field.label}
                placeholder={field.placeholder || t('EnterField', { field: field.label.toLowerCase() })}
                value={fieldValue}
                onChangeText={(value) => handleFieldChange(field.name, value)}
                onBlur={() => handleFieldBlur(field.name)}
                inputType={field.type}
                error={status === 'error' ? errors[field.name] : undefined}
                success={status === 'success' ? t('FieldLooksGood', { field: field.label }) : undefined}
                contextData={contextData}
                validationRules={{
                  required: field.required,
                  ...field.validation,
                }}
                showValidation={true}
                animated={true}
              />
            </View>
          );
        })}

        <Button
          onPress={handleSubmit}
          disabled={isSubmitting || loading}
          loading={isSubmitting || loading}
          variant="primary"
          size="lg"
          fullWidth
          style={{ marginTop: spacing.lg }}
        >
          {isSubmitting ? t('Submitting') : submitButtonText}
        </Button>
      </View>
    </KeyboardAwareContainer>
  );
}
