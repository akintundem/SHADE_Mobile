import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { ArrowLeft, DollarSign, Calendar, FileText, User, CreditCard } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useFormValidation } from '../../../../common/utils/formValidation';
import { expenseValidator } from '../../../../common/utils/validationSchemas';
import { ExpenseDTO } from '../../../core/events/types';
import { useErrorHandler } from '../../../../common/hooks/useErrorHandler';
import ErrorModal from '../../../../common/components/common/ErrorModal';
import { Section, FieldLabel, Input, SelectInput } from '../../../../common/components/common/FormComponents';

type Props = { 
  budgetId: string;
  onBack: () => void; 
  onSave?: (expense: ExpenseDTO) => void;
};

export default function AddExpenseScreen({ budgetId, onBack, onSave }: Props) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'OTHER'>('CREDIT_CARD');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { error, handleError, hideError } = useErrorHandler();

  // Form validation
  const { errors, validateField, setFieldTouched, getFieldError, validateForm } = useFormValidation(expenseValidator);

  // Memoized form data for validation
  const formData = useMemo(() => ({
    category,
    description,
    amount,
    vendor,
    date,
  }), [category, description, amount, vendor, date]);

  // Validation result
  const validationResult = useMemo(() => validateForm(formData), [formData, validateForm]);
  const canSave = validationResult.isValid && !isLoading;

  const handleSave = async () => {
    if (!canSave) return;

    setIsLoading(true);
    try {
      const expenseData: ExpenseDTO = {
        id: `exp_${Date.now()}`,
        budgetId,
        category,
        description,
        amount: Number(amount),
        currency: 'USD',
        date: date || new Date().toISOString(),
        vendor,
        paymentMethod,
        status: 'PENDING',
        receiptUrl: receiptUrl || undefined,
        notes: notes || undefined
      };

      onSave?.(expenseData);
    } catch (err) {
      handleError(err, 'Saving expense');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Venue', 'Catering', 'Marketing', 'Equipment', 'Transportation', 
    'Entertainment', 'Staff', 'Insurance', 'Miscellaneous'
  ];

  const paymentMethods = [
    { label: 'Credit Card', value: 'CREDIT_CARD', icon: '' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER', icon: '' },
    { label: 'Cash', value: 'CASH', icon: '' },
    { label: 'Other', value: 'OTHER', icon: '' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorModal
        visible={!!error}
        error={error}
        onClose={hideError}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: spacing.lg, 
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}>
          <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
            <ArrowLeft size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{ 
            color: colors.text.primary, 
            fontWeight: '700',
            fontSize: typography.size.lg
          }}>
            Add Expense
          </Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={!canSave}
            style={{ 
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: canSave ? brand.primary : colors.text.disabled,
              borderRadius: borderRadius.md
            }}
          >
            <Text style={{ 
              color: canSave ? colors.text.inverse : colors.text.tertiary,
              fontWeight: '600'
            }}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <Section title="Expense Details">
            <FieldLabel icon={<FileText size={16} color={colors.text.secondary} />} label="Category" />
            <SelectInput
              value={category}
              onValueChange={setCategory}
              options={categories.map(cat => ({ label: cat, value: cat }))}
            />

            <FieldLabel icon={<FileText size={16} color={colors.text.secondary} />} label="Description" />
            <Input 
              placeholder="Enter expense description" 
              value={description} 
              onChangeText={(text) => {
                setDescription(text);
                validateField('description', text);
              }}
              onBlur={() => setFieldTouched('description')}
              error={getFieldError('description')}
            />

            <FieldLabel icon={<DollarSign size={16} color={colors.text.secondary} />} label="Amount" />
            <Input 
              placeholder="0.00" 
              value={amount} 
              onChangeText={(text) => {
                setAmount(text);
                validateField('amount', text);
              }}
              onBlur={() => setFieldTouched('amount')}
              error={getFieldError('amount')}
              keyboardType="numeric"
            />

            <FieldLabel icon={<User size={16} color={colors.text.secondary} />} label="Vendor" />
            <Input 
              placeholder="Enter vendor name" 
              value={vendor} 
              onChangeText={(text) => {
                setVendor(text);
                validateField('vendor', text);
              }}
              onBlur={() => setFieldTouched('vendor')}
              error={getFieldError('vendor')}
            />
          </Section>

          {/* Payment Information */}
          <Section title="Payment Information">
            <FieldLabel icon={<CreditCard size={16} color={colors.text.secondary} />} label="Payment Method" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {paymentMethods.map(method => (
                <TouchableOpacity
                  key={method.value}
                  onPress={() => setPaymentMethod(method.value as any)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: paymentMethod === method.value ? brand.primary : colors.surface,
                    borderRadius: borderRadius.full,
                    borderWidth: 1,
                    borderColor: paymentMethod === method.value ? brand.primary : colors.border
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{method.icon}</Text>
                  <Text style={{
                    color: paymentMethod === method.value ? colors.text.inverse : colors.text.primary,
                    fontWeight: '600',
                    fontSize: 14
                  }}>
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FieldLabel icon={<Calendar size={16} color={colors.text.secondary} />} label="Date" />
            <Input 
              placeholder="YYYY-MM-DD" 
              value={date} 
              onChangeText={(text) => {
                setDate(text);
                validateField('date', text);
              }}
              onBlur={() => setFieldTouched('date')}
              error={getFieldError('date')}
            />
          </Section>

          {/* Additional Information */}
          <Section title="Additional Information">
            <FieldLabel icon={<FileText size={16} color={colors.text.secondary} />} label="Notes" />
            <Input 
              placeholder="Add any additional notes..." 
              multiline 
              numberOfLines={3} 
              style={{ height: 80, paddingTop: spacing.md }} 
              value={notes} 
              onChangeText={setNotes}
            />

            <FieldLabel icon={<FileText size={16} color={colors.text.secondary} />} label="Receipt URL" />
            <Input 
              placeholder="https://example.com/receipt.pdf" 
              value={receiptUrl} 
              onChangeText={setReceiptUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
