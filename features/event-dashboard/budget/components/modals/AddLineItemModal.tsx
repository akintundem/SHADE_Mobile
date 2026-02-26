import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown, X } from 'lucide-react-native';
import { useI18n } from '../../../../../common/i18n/I18nProvider';
import { ScreenHeader } from '../../../../../common/components/ScreenHeader';
import { LoadingOverlay } from '../../../../../common/components/LoadingStates';
import { ErrorHandler } from '../../../../../common/utils/errorHandler';
import { budgetService } from '../../../../../core/budget/services/budget';
import { BudgetCategoryResponse, BudgetLineItemAutoSaveRequest } from '../../../../../core/budget/types/budget';
import { useTheme } from '../../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  categories: BudgetCategoryResponse[];
  onClose: () => void;
  onSuccess: () => void;
};

export function AddLineItemModal({ visible, eventId, categories, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;

  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!visible) {
      setSelectedCategoryId(null);
      setDescription('');
      setEstimatedCost('');
      setActualCost('');
      setQuantity('');
      setUnitCost('');
      setNotes('');
      setShowCategoryPicker(false);
    }
  }, [visible]);

  const selectedCategory = useMemo(() => {
    return categories.find(cat => cat.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  const canSave = useMemo(() => {
    return selectedCategoryId !== null && description.trim().length > 0;
  }, [selectedCategoryId, description]);

  const parseNumber = (value: string): number | null => {
    const cleaned = value.trim().replace(/[^0-9.-]/g, '');
    if (!cleaned) return null;
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const handleSave = useCallback(async () => {
    if (!eventId || !selectedCategoryId) {
      Alert.alert(t('Error'), t('PleaseSelectCategory'));
      return;
    }

    if (!canSave) {
      return;
    }

    setIsLoading(true);
    try {
      const request: BudgetLineItemAutoSaveRequest = {
        budgetCategoryId: selectedCategoryId,
        description: description.trim() || null,
        estimatedCost: parseNumber(estimatedCost),
        actualCost: parseNumber(actualCost),
        quantity: parseNumber(quantity) ? Math.max(1, Math.floor(parseNumber(quantity)!)) : null,
        unitCost: parseNumber(unitCost),
        notes: notes.trim() || null,
      };

      await budgetService.autoSaveDraft(eventId, request);
      onSuccess();
      onClose();
    } catch (error) {
      ErrorHandler.handle(error, 'createLineItem');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, selectedCategoryId, description, estimatedCost, actualCost, quantity, unitCost, notes, canSave, onSuccess, onClose, t]);

  const bottomGutter = Math.max(16, Math.min(insets.bottom, 20));

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View className="flex-1 bg-light-background dark:bg-dark-background" style={{ paddingTop: insets.top }}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScreenHeader
            title={t('AddExpense')}
            titleSize={17}
            leftAction={{
              icon: X,
              onPress: onClose,
              size: 40,
            }}
            rightAction={{
              icon: Check,
              onPress: handleSave,
              size: 32,
              variant: 'filled',
              disabled: !canSave || isLoading,
            }}
          />

          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-[20px] pt-6" style={{ paddingBottom: bottomGutter + 20 }}>
              <View className="mb-2xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('Category')} *
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                  activeOpacity={0.7}
                  className="rounded-lg border px-md py-md flex-row items-center justify-between bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border min-h-[48px]"
                >
                  <Text className="text-sm" style={{ color: selectedCategory ? text.primary : text.tertiary }}>
                    {selectedCategory ? selectedCategory.name : t('SelectCategory')}
                  </Text>
                  <ChevronDown size={18} color={text.tertiary} strokeWidth={2} />
                </TouchableOpacity>

                {showCategoryPicker && (
                  <View
                    className="mt-xs rounded-lg border overflow-hidden bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border"
                    style={{ maxHeight: 200 }}
                  >
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
                      {categories.map(category => {
                        const isSelected = selectedCategoryId === category.id;
                        return (
                          <TouchableOpacity
                            key={category.id}
                            onPress={() => {
                              setSelectedCategoryId(category.id);
                              setShowCategoryPicker(false);
                            }}
                            activeOpacity={0.7}
                            className={`px-md py-sm border-b border-light-border dark:border-dark-border ${
                              isSelected ? 'bg-light-surface-elevated dark:bg-dark-surface-elevated' : ''
                            }`}
                          >
                            <Text
                              className="text-sm"
                              style={{
                                color: isSelected ? text.primary : text.secondary,
                                fontWeight: isSelected ? '600' : '400',
                              }}
                            >
                              {category.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

            <View className="mb-2xl">
              <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                {t('Description')} *
              </Text>
              <TextInput
                placeholder={t('EnterDescription')}
                placeholderTextColor={text.tertiary}
                value={description}
                onChangeText={setDescription}
                className="rounded-lg px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border min-h-[48px]"
              />
            </View>

            <View className="flex-row mb-2xl gap-3">
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('Estimated')}
                </Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={text.tertiary}
                  value={estimatedCost}
                  onChangeText={setEstimatedCost}
                  keyboardType="decimal-pad"
                  className="rounded-lg px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border min-h-[48px]"
                />
              </View>

              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('Actual')}
                </Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={text.tertiary}
                  value={actualCost}
                  onChangeText={setActualCost}
                  keyboardType="decimal-pad"
                  className="rounded-lg px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border min-h-[48px]"
                />
              </View>
            </View>

            <View className="flex-row mb-2xl gap-3">
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('Quantity')}
                </Text>
                <TextInput
                  placeholder="1"
                  placeholderTextColor={text.tertiary}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  className="rounded-lg px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border min-h-[48px]"
                />
              </View>

              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('UnitCost')}
                </Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={text.tertiary}
                  value={unitCost}
                  onChangeText={setUnitCost}
                  keyboardType="decimal-pad"
                  className="rounded-lg px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border min-h-[48px]"
                />
              </View>
            </View>

            <View className="mb-2xl">
              <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                {t('Notes')}
              </Text>
              <TextInput
                placeholder={t('EnterNotes')}
                placeholderTextColor={text.tertiary}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                className="rounded-lg px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border min-h-[100px]"
                style={{ textAlignVertical: 'top' }}
              />
            </View>
            </View>
          </ScrollView>

          <LoadingOverlay visible={isLoading} message={t('Saving')} />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
