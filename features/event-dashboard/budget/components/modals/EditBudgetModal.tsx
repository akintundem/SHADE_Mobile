import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  DollarSign,
  Percent,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { useI18n } from '../../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../../common/utils/errorHandler';
import { budgetService } from '../../../../../core/budget/services/budget';
import { BudgetDetailResponse, UpdateBudgetRequest, BudgetStatus } from '../../../../../core/budget/types/budget';
import Button from '../../../../../common/components/ui/Button';
import { useTheme } from '../../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  budget: BudgetDetailResponse | null;
  onClose: () => void;
  onSuccess: () => void;
};

const BUDGET_STATUS_OPTIONS = [
  { value: BudgetStatus.DRAFT, labelKey: 'Draft' },
  { value: BudgetStatus.PLANNING, labelKey: 'Planning' },
  { value: BudgetStatus.APPROVED, labelKey: 'Approved' },
  { value: BudgetStatus.ACTIVE, labelKey: 'Active' },
  { value: BudgetStatus.LOCKED, labelKey: 'Locked' },
  { value: BudgetStatus.ARCHIVED, labelKey: 'Archived' },
] as const;

const CURRENCY_OPTIONS = [
  { value: 'USD', labelKey: 'CurrencyUSD' },
  { value: 'EUR', labelKey: 'CurrencyEUR' },
  { value: 'GBP', labelKey: 'CurrencyGBP' },
  { value: 'CAD', labelKey: 'CurrencyCAD' },
  { value: 'AUD', labelKey: 'CurrencyAUD' },
  { value: 'NGN', labelKey: 'CurrencyNGN' },
  { value: 'JPY', labelKey: 'CurrencyJPY' },
  { value: 'CHF', labelKey: 'CurrencyCHF' },
] as const;

export function EditBudgetModal({
  visible,
  eventId,
  budget,
  onClose,
  onSuccess,
}: Props) {
  const { colors, spacing, isDark } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const [totalBudget, setTotalBudget] = useState('');
  const [contingencyPercentage, setContingencyPercentage] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (budget) {
      setTotalBudget(budget.totalBudget ? String(budget.totalBudget) : '');
      setContingencyPercentage(budget.contingencyPercentage ? String(budget.contingencyPercentage) : '');
      setCurrency(budget.currency || 'USD');
      setNotes(budget.notes || '');
      setBudgetStatus(budget.budgetStatus as BudgetStatus || BudgetStatus.DRAFT);
    }
  }, [budget]);

  const currencyOptions = CURRENCY_OPTIONS.map(option => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  const statusOptions = BUDGET_STATUS_OPTIONS.map(option => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  const selectedCurrencyLabel = currencyOptions.find(c => c.value === currency)?.label || currency;
  const selectedStatusLabel = statusOptions.find(s => s.value === budgetStatus)?.label || '';

  const resetForm = useCallback(() => {
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!budget) return;

    const totalBudgetNum = parseFloat(totalBudget);
    if (isNaN(totalBudgetNum) || totalBudgetNum <= 0) {
      setError(t('InvalidTotalBudget'));
      return;
    }

    let contingencyPercent: number | null = null;
    if (contingencyPercentage.trim()) {
      const parsed = parseFloat(contingencyPercentage);
      if (isNaN(parsed) || parsed < 0 || parsed > 50) {
        setError(t('InvalidContingencyPercentage'));
        return;
      }
      contingencyPercent = parsed;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: UpdateBudgetRequest = {
        totalBudget: totalBudgetNum,
        contingencyPercentage: contingencyPercent,
        currency: currency.toUpperCase(),
        notes: notes.trim() || null,
        budgetStatus: budgetStatus || null,
      };

      await budgetService.updateBudget(eventId, request);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToUpdateBudget'));
      ErrorHandler.handle(err, 'updateBudget');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    budget,
    totalBudget,
    contingencyPercentage,
    currency,
    notes,
    budgetStatus,
    eventId,
    t,
    onSuccess,
    onClose,
  ]);

  if (!budget) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-light-overlay dark:bg-dark-overlay">
          <View
            className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-xl max-h-[90%]"
            style={{ paddingBottom: Math.max(insets.bottom, spacing.xl) }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <Text
                className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary"
              >
                {t('EditBudget')}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
              >
                <X size={18} color={colors.text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="px-xl"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Error Message */}
              {error && (
                <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                  <Text className="text-sm text-semantic-error">
                    {error}
                  </Text>
                </View>
              )}

              {/* Total Budget */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('TotalBudget')} *
                </Text>
                <View className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                  <DollarSign size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                  <TextInput
                    value={totalBudget}
                    onChangeText={(text) => setTotalBudget(text.replace(/[^0-9.]/g, ''))}
                    placeholder="0.00"
                    placeholderTextColor={colors.text.tertiary}
                    className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Contingency Percentage */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('ContingencyPercentage')} ({t('Optional')})
                </Text>
                <View className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                  <Percent size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                  <TextInput
                    value={contingencyPercentage}
                    onChangeText={(text) => setContingencyPercentage(text.replace(/[^0-9.]/g, ''))}
                    placeholder="10"
                    placeholderTextColor={colors.text.tertiary}
                    className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                    keyboardType="decimal-pad"
                  />
                </View>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                  {t('ContingencyPercentageHint')}
                </Text>
              </View>

              {/* Currency */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Currency')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  className="flex-row items-center rounded-lg px-md py-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                >
                  <DollarSign size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                  <Text className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary">
                    {selectedCurrencyLabel}
                  </Text>
                  <ChevronDown size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                </TouchableOpacity>
                {showCurrencyPicker && (
                  <View className="mt-sm rounded-lg border border-[0.5px] overflow-hidden max-h-[200px] border-light-border-muted dark:border-dark-border-muted">
                    <ScrollView nestedScrollEnabled>
                      {currencyOptions.map((opt, index) => (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => {
                            setCurrency(opt.value);
                            setShowCurrencyPicker(false);
                          }}
                          className={`flex-row items-center px-md py-md ${
                            index < currencyOptions.length - 1 ? 'border-b-[0.5px] border-light-border-subtle dark:border-dark-border-subtle' : ''
                          } ${currency === opt.value ? (isDark ? 'bg-neutral-white/5' : 'bg-light-surface-subtle') : ''}`}
                        >
                          <Text className="flex-1 text-sm text-txt-primary dark:text-txt-dark-primary">
                            {opt.label}
                          </Text>
                          {currency === opt.value && (
                            <Check size={16} color={colors.text.primary} strokeWidth={2.5} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Budget Status */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('BudgetStatus')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowStatusPicker(!showStatusPicker)}
                  className="flex-row items-center rounded-lg px-md py-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                >
                  <Text className="flex-1 text-sm text-txt-primary dark:text-txt-dark-primary">
                    {selectedStatusLabel || t('SelectStatus')}
                  </Text>
                  <ChevronDown size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                </TouchableOpacity>
                {showStatusPicker && (
                  <View className="mt-sm rounded-lg border border-[0.5px] overflow-hidden max-h-[200px] border-light-border-muted dark:border-dark-border-muted">
                    <ScrollView nestedScrollEnabled>
                      {statusOptions.map((opt, index) => (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => {
                            setBudgetStatus(opt.value);
                            setShowStatusPicker(false);
                          }}
                          className={`flex-row items-center px-md py-md ${
                            index < statusOptions.length - 1 ? 'border-b-[0.5px] border-light-border-subtle dark:border-dark-border-subtle' : ''
                          } ${budgetStatus === opt.value ? (isDark ? 'bg-neutral-white/5' : 'bg-light-surface-subtle') : ''}`}
                        >
                          <Text className="flex-1 text-sm text-txt-primary dark:text-txt-dark-primary">
                            {opt.label}
                          </Text>
                          {budgetStatus === opt.value && (
                            <Check size={16} color={colors.text.primary} strokeWidth={2.5} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Notes */}
              <View className="mb-xl">
                <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Notes')} ({t('Optional')})
                </Text>
                <View className="rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={t('EnterNotes')}
                    placeholderTextColor={colors.text.tertiary}
                    className="text-sm text-txt-primary dark:text-txt-dark-primary py-md min-h-[80px]"
                    style={{ textAlignVertical: 'top' }}
                    multiline
                    maxLength={2000}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <View className="mb-lg">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isSubmitting || !totalBudget.trim()}
                  leftIcon={<DollarSign size={18} color={colors.text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? t('Saving') : t('SaveChanges')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
