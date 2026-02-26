import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import {
  validateCardNumber,
  validateExpiry,
  validateCvc,
  formatCardNumber,
  parseExpiry,
  getLast4,
  getCardBrandHint,
} from '../utils/validation';
import type { CardPaymentPayload } from '../types';

type CardFormProps = {
  onSubmit: (payload: CardPaymentPayload) => void;
  loading?: boolean;
  submitLabel: string;
  cardNumberLabel: string;
  expiryLabel: string;
  cvcLabel: string;
  nameLabel: string;
  cardNumberPlaceholder: string;
  expiryPlaceholder: string;
  cvcPlaceholder: string;
  namePlaceholder: string;
  errorCardNumber?: string;
  errorExpiry?: string;
  errorCvc?: string;
};

const DIGITS_ONLY = /^\d*$/;
const CVC_MAX = 4;

export function CardForm({
  onSubmit,
  loading = false,
  submitLabel,
  cardNumberLabel,
  expiryLabel,
  cvcLabel,
  nameLabel,
  cardNumberPlaceholder,
  expiryPlaceholder,
  cvcPlaceholder,
  namePlaceholder,
  errorCardNumber,
  errorExpiry,
  errorCvc,
}: CardFormProps) {
  const { colors, disabledButtonBackground } = useTheme();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [touched, setTouched] = useState({ number: false, expiry: false, cvc: false });

  const { month: expiryMonth, year: expiryYear } = useMemo(() => parseExpiry(expiry), [expiry]);

  const handleNumberChange = useCallback((text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 19);
    setNumber(formatCardNumber(digits));
  }, []);

  const handleExpiryChange = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    let m = cleaned.slice(0, 2);
    const y = cleaned.slice(2, 4);
    if (cleaned.length >= 2 && parseInt(m, 10) > 12) m = '12';
    if (cleaned.length <= 2) {
      setExpiry(m);
      return;
    }
    setExpiry(`${m}/${y}`);
  }, []);

  const handleCvcChange = useCallback((text: string) => {
    if (DIGITS_ONLY.test(text)) setCvc(text.slice(0, CVC_MAX));
  }, []);

  const numValidation = useMemo(() => validateCardNumber(number), [number]);
  const expValidation = useMemo(() => validateExpiry(expiryMonth, expiryYear), [expiryMonth, expiryYear]);
  const cvcValidation = useMemo(() => validateCvc(cvc), [cvc]);

  const showNumError = touched.number && !numValidation.valid;
  const showExpError = touched.expiry && !expValidation.valid;
  const showCvcError = touched.cvc && !cvcValidation.valid;

  const handleSubmit = useCallback(() => {
    setTouched({ number: true, expiry: true, cvc: true });
    if (!numValidation.valid || !expValidation.valid || !cvcValidation.valid) return;
    const last4 = getLast4(number);
    const month = parseInt(expiryMonth, 10);
    const year = parseInt(expiryYear.length === 2 ? `20${expiryYear}` : expiryYear, 10);
    onSubmit({
      last4,
      expiryMonth: month,
      expiryYear: year,
      brand: getCardBrandHint(number),
    });
  }, [number, expiryMonth, expiryYear, numValidation, expValidation, cvcValidation, onSubmit]);

  const canSubmit = number.replace(/\D/g, '').length >= 13 && expiryMonth.length === 2 && expiryYear.length === 2 && cvc.length >= 3;

  const inputStyle = {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: colors.text.primary,
    borderColor: colors.borderLight,
  };
  const inputErrorStyle = { borderColor: colors.semantic?.error ?? '#DC2626' };
  const labelStyle = { fontSize: 12, fontWeight: '600' as const, color: colors.text.secondary, marginBottom: 6 };

  return (
    <View>
      <Text style={[labelStyle, { marginTop: 0 }]}>{cardNumberLabel}</Text>
      <TextInput
        value={number}
        onChangeText={handleNumberChange}
        onBlur={() => setTouched(t => ({ ...t, number: true }))}
        placeholder={cardNumberPlaceholder}
        placeholderTextColor={colors.text.tertiary}
        keyboardType="number-pad"
        maxLength={19 + 3}
        style={[inputStyle, showNumError ? inputErrorStyle : null]}
        editable={!loading}
        autoComplete="cc-number"
        accessibilityLabel={cardNumberLabel}
      />
      {(showNumError && (errorCardNumber || numValidation.message)) && (
        <Text style={{ fontSize: 12, color: colors.semantic?.error ?? '#DC2626', marginTop: 4 }}>
          {errorCardNumber || numValidation.message}
        </Text>
      )}

      <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={labelStyle}>{expiryLabel}</Text>
          <TextInput
            value={expiry}
            onChangeText={handleExpiryChange}
            onBlur={() => setTouched(t => ({ ...t, expiry: true }))}
            placeholder={expiryPlaceholder}
            placeholderTextColor={colors.text.tertiary}
            keyboardType="number-pad"
            maxLength={5}
            style={[inputStyle, showExpError ? inputErrorStyle : null]}
            editable={!loading}
            accessibilityLabel={expiryLabel}
          />
          {(showExpError && (errorExpiry || expValidation.message)) && (
            <Text style={{ fontSize: 12, color: colors.semantic?.error ?? '#DC2626', marginTop: 4 }}>
              {errorExpiry || expValidation.message}
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={labelStyle}>{cvcLabel}</Text>
          <TextInput
            value={cvc}
            onChangeText={handleCvcChange}
            onBlur={() => setTouched(t => ({ ...t, cvc: true }))}
            placeholder={cvcPlaceholder}
            placeholderTextColor={colors.text.tertiary}
            keyboardType="number-pad"
            maxLength={CVC_MAX}
            secureTextEntry
            style={[inputStyle, showCvcError ? inputErrorStyle : null]}
            editable={!loading}
            accessibilityLabel={cvcLabel}
          />
          {(showCvcError && (errorCvc || cvcValidation.message)) && (
            <Text style={{ fontSize: 12, color: colors.semantic?.error ?? '#DC2626', marginTop: 4 }}>
              {errorCvc || cvcValidation.message}
            </Text>
          )}
        </View>
      </View>

      <Text style={[labelStyle, { marginTop: 16 }]}>{nameLabel}</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={namePlaceholder}
        placeholderTextColor={colors.text.tertiary}
        autoCapitalize="words"
        style={inputStyle}
        editable={!loading}
        autoComplete="cc-name"
        accessibilityLabel={nameLabel}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!canSubmit || loading}
        activeOpacity={0.8}
        style={{
          marginTop: 24,
          height: 48,
          borderRadius: 10,
          backgroundColor: canSubmit && !loading ? (colors.primary ?? colors.text.primary) : disabledButtonBackground,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: canSubmit && !loading ? (colors.text?.inverse ?? '#FFF') : colors.text.tertiary,
          }}
        >
          {loading ? '…' : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
