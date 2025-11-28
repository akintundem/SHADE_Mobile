import { useState, useCallback, useMemo } from 'react';
import { EventType } from '../../../../shared/types';
import { Venue } from '../components/types';
import {
  createEventValidator,
  useFormValidation,
} from '../../../../shared/utils/formValidation';

export function useCreateEventForm() {
  // Form state
  const [isPublic, setPublic] = useState(true);
  const [free, setFree] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [enableContrib, setEnableContrib] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState<Venue | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');

  // Form validation
  const {
    errors,
    validateField: validateFieldRaw,
    setFieldTouched: setFieldTouchedRaw,
    getFieldError: getFieldErrorRaw,
    validateForm,
  } = useFormValidation(createEventValidator);

  // Wrap validation functions in useCallback to stabilize them
  const validateField = useCallback((field: string, value: any) => {
    validateFieldRaw(field, value);
  }, [validateFieldRaw]);

  const setFieldTouched = useCallback((field: string) => {
    setFieldTouchedRaw(field);
  }, [setFieldTouchedRaw]);

  const getFieldError = useCallback((field: string) => {
    return getFieldErrorRaw(field);
  }, [getFieldErrorRaw]);

  // Memoized form data for validation
  const formData = useMemo(
    () => ({
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location: venue?.address || '',
      capacity: capacity ? Number(capacity) : undefined,
      price: !free && price ? Number(price) : undefined,
    }),
    [
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      venue,
      capacity,
      price,
      free,
    ],
  );

  // Validation result
  const validationResult = useMemo(
    () => validateForm(formData),
    [formData, validateForm],
  );

  const handleToggleTag = useCallback((tag: string) => {
    setTags(prevTags => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  }, []);

  return {
    // State
    isPublic,
    free,
    tags,
    selectedEventType,
    title,
    description,
    price,
    capacity,
    enableContrib,
    startDate,
    startTime,
    endDate,
    endTime,
    venue,
    locationSearchQuery,
    contributionAmount,
    // Setters
    setPublic,
    setFree,
    setTags,
    setSelectedEventType,
    setTitle,
    setDescription,
    setPrice,
    setCapacity,
    setEnableContrib,
    setStartDate,
    setStartTime,
    setEndDate,
    setEndTime,
    setVenue,
    setLocationSearchQuery,
    setContributionAmount,
    // Validation
    validateField,
    setFieldTouched,
    getFieldError,
    validationResult,
    // Helpers
    handleToggleTag,
  };
}
