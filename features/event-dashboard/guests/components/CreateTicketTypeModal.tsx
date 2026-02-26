import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Ticket,
  Tag,
  DollarSign,
  Hash,
  ChevronDown,
  Check,
  FileText,
  Percent,
  Plus,
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { ticketService } from '../../../../core/tickets/services/ticket';
import { CreateTicketTypeRequest, TicketTypeCategory } from '../../../../core/tickets/types/ticket';
import Button from '../../../../common/components/ui/Button';
import { useTheme, useSwitchTrackColors } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
};

const CATEGORY_OPTIONS = [
  { value: TicketTypeCategory.GENERAL_ADMISSION, labelKey: 'GeneralAdmission' },
  { value: TicketTypeCategory.VIP, labelKey: 'VIP' },
  { value: TicketTypeCategory.EARLY_BIRD, labelKey: 'EarlyBird' },
  { value: TicketTypeCategory.STUDENT, labelKey: 'Student' },
  { value: TicketTypeCategory.SENIOR, labelKey: 'Senior' },
  { value: TicketTypeCategory.CHILD, labelKey: 'Child' },
  { value: TicketTypeCategory.GROUP, labelKey: 'Group' },
  { value: TicketTypeCategory.PREMIUM, labelKey: 'Premium' },
  { value: TicketTypeCategory.BACKSTAGE, labelKey: 'Backstage' },
  { value: TicketTypeCategory.MEET_AND_GREET, labelKey: 'MeetAndGreet' },
  { value: TicketTypeCategory.ALL_ACCESS, labelKey: 'AllAccess' },
  { value: TicketTypeCategory.SINGLE_DAY, labelKey: 'SingleDay' },
  { value: TicketTypeCategory.WEEKEND_PASS, labelKey: 'WeekendPass' },
  { value: TicketTypeCategory.SEASON_PASS, labelKey: 'SeasonPass' },
  { value: TicketTypeCategory.STANDING_ROOM, labelKey: 'StandingRoom' },
  { value: TicketTypeCategory.RESERVED_SEATING, labelKey: 'ReservedSeating' },
  { value: TicketTypeCategory.OTHER, labelKey: 'Other' },
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

export function CreateTicketTypeModal({
  visible,
  eventId,
  onClose,
  onSuccess,
}: Props) {
  const { colors, spacing, isDark } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const switchTrackColor = useSwitchTrackColors();

  const categoryOptions = useMemo(
    () => CATEGORY_OPTIONS.map(option => ({
      value: option.value,
      label: t(option.labelKey),
    })),
    [t]
  );

  const currencyOptions = useMemo(
    () => CURRENCY_OPTIONS.map(option => ({
      value: option.value,
      label: t(option.labelKey),
    })),
    [t]
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketTypeCategory | null>(null);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [quantity, setQuantity] = useState('');
  const [maxPerPerson, setMaxPerPerson] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  type PromotionForm = {
    id: string;
    code: string;
    percent: string;
    amount: string;
    active: boolean;
  };

  const createEmptyPromotion = useCallback(
    (suffix: string): PromotionForm => ({
      id: `promo-${suffix}`,
      code: '',
      percent: '',
      amount: '',
      active: true,
    }),
    []
  );

  const [includePromotion, setIncludePromotion] = useState(false);
  const [promotions, setPromotions] = useState<PromotionForm[]>([createEmptyPromotion('0')]);

  const handlePromotionChange = useCallback(
    (id: string, key: keyof PromotionForm, value: string | boolean) => {
      setPromotions(prev =>
        prev.map(p => (p.id === id ? { ...p, [key]: value } as PromotionForm : p))
      );
    },
    []
  );

  const handleAddPromotion = useCallback(() => {
    setPromotions(prev => [...prev, createEmptyPromotion(String(prev.length))]);
  }, [createEmptyPromotion]);

  const handleRemovePromotion = useCallback((id: string) => {
    setPromotions(prev => (prev.length > 1 ? prev.filter(p => p.id !== id) : prev));
  }, []);

  const selectedCategoryLabel = useMemo(() => {
    const found = categoryOptions.find(c => c.value === category);
    return found?.label || null;
  }, [category, categoryOptions]);

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setCategory(null);
    setIsFree(true);
    setPrice('');
    setCurrency('USD');
    setQuantity('');
    setMaxPerPerson('');
    setRequiresApproval(false);
    setIncludePromotion(false);
    setPromotions([createEmptyPromotion('0')]);
    setError(null);
  }, [createEmptyPromotion]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError(t('TicketTypeNameRequired'));
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      setError(t('InvalidQuantityAvailable'));
      return;
    }

    let priceMinor: number | null = null;
    if (!isFree) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        setError(t('InvalidPrice'));
        return;
      }
      priceMinor = Math.round(parsedPrice * 100);
    }

    const maxPer = maxPerPerson.trim() ? parseInt(maxPerPerson, 10) : null;
    if (maxPer !== null && (isNaN(maxPer) || maxPer < 0 || maxPer > 100)) {
      setError(t('InvalidMaxPerPerson'));
      return;
    }

    let promotionsPayload: CreateTicketTypeRequest['promotions'] = undefined;
    if (includePromotion) {
      const preparedPromos = [];
      for (const promo of promotions) {
        const hasValues = promo.code.trim() || promo.percent.trim() || promo.amount.trim();
        if (!hasValues) continue;

        if (!promo.code.trim()) {
          setError(t('PromotionCodeRequired'));
          return;
        }

        const percentValue = promo.percent.trim() ? parseFloat(promo.percent) : null;
        const amountValue = promo.amount.trim() ? parseFloat(promo.amount) : null;

        let percentOffBasisPoints: number | null = null;
        let amountOffMinor: number | null = null;

        if (percentValue !== null) {
          if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
            setError(t('InvalidPromotionPercent'));
            return;
          }
          percentOffBasisPoints = Math.round(percentValue * 100);
        }

        if (amountValue !== null) {
          if (isNaN(amountValue) || amountValue < 0) {
            setError(t('InvalidPromotionAmount'));
            return;
          }
          amountOffMinor = Math.round(amountValue * 100);
        }

        if (percentOffBasisPoints === null && amountOffMinor === null) {
          setError(t('PromotionValueRequired'));
          return;
        }

        preparedPromos.push({
          code: promo.code.trim().toUpperCase(),
          percentOffBasisPoints: percentOffBasisPoints ?? undefined,
          amountOffMinor: amountOffMinor ?? undefined,
          active: promo.active,
        });
      }

      promotionsPayload = preparedPromos.length ? preparedPromos : undefined;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await ticketService.createTicketType(eventId, {
        name: name.trim(),
        description: description.trim() || null,
        category: category || null,
        priceMinor,
        currency: isFree ? null : currency.toUpperCase(),
        quantityAvailable: qty,
        maxTicketsPerPerson: maxPer,
        requiresApproval,
        promotions: promotionsPayload,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToCreateTicketType'));
      ErrorHandler.handle(err, 'createTicketType');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    name,
    description,
    category,
    isFree,
    price,
    currency,
    quantity,
    maxPerPerson,
    requiresApproval,
    includePromotion,
    promotions,
    eventId,
    t,
    resetForm,
    onSuccess,
    onClose,
  ]);

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
                {t('CreateTicketType')}
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

              {/* Name Field */}
              <View className="mb-lg">
                <Text
                  className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm"
                >
                  {t('TicketTypeName')} *
                </Text>
                <View
                  className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                >
                  <Ticket size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t('EnterTicketTypeName')}
                    placeholderTextColor={colors.text.tertiary}
                    className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                    maxLength={100}
                  />
                </View>
              </View>

              {/* Description Field */}
              <View className="mb-lg">
                <Text
                  className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm"
                >
                  {t('Description')}
                </Text>
                <View
                  className="rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                >
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('EnterTicketTypeDescription')}
                    placeholderTextColor={colors.text.tertiary}
                    className="text-sm text-txt-primary dark:text-txt-dark-primary py-md min-h-[80px]"
                    style={{ textAlignVertical: 'top' }}
                    multiline
                    maxLength={2000}
                  />
                </View>
              </View>

              {/* Category Selector */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Category')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                  className="flex-row items-center rounded-lg px-md py-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                >
                  <Tag size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                  <Text
                    className={`flex-1 ml-sm text-sm ${
                      selectedCategoryLabel
                        ? 'text-txt-primary dark:text-txt-dark-primary'
                        : 'text-txt-tertiary dark:text-txt-dark-tertiary'
                    }`}
                  >
                    {selectedCategoryLabel || t('SelectCategory')}
                  </Text>
                  <ChevronDown size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                </TouchableOpacity>

                {/* Category Options */}
                {showCategoryPicker && (
                  <View
                    className="mt-sm rounded-lg border border-[0.5px] overflow-hidden max-h-[200px] border-light-border-muted dark:border-dark-border-muted"
                    style={{
                      backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
                    }}
                  >
                    <ScrollView nestedScrollEnabled>
                      {categoryOptions.map((opt, index) => (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => {
                            setCategory(opt.value);
                            setShowCategoryPicker(false);
                          }}
                          className={`flex-row items-center px-md py-md ${
                            index < categoryOptions.length - 1 ? 'border-b-[0.5px] border-light-border-subtle dark:border-dark-border-subtle' : ''
                          } ${category === opt.value ? (isDark ? 'bg-neutral-white/5' : 'bg-light-surface-subtle') : ''}`}
                        >
                          <Text className="flex-1 text-sm text-txt-primary dark:text-txt-dark-primary">
                            {opt.label}
                          </Text>
                          {category === opt.value && (
                            <Check size={16} color={colors.text.primary} strokeWidth={2.5} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Quantity Available */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('QuantityAvailable')} *
                </Text>
                <View
                  className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                >
                  <Hash size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                  <TextInput
                    value={quantity}
                    onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
                    placeholder={t('EnterQuantity')}
                    placeholderTextColor={colors.text.tertiary}
                    className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Free Ticket Toggle */}
              <View
                className="flex-row items-center justify-between mb-lg py-md border-b-[0.5px] border-light-border-muted dark:border-dark-border-strong"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]">
                    {t('FreeTicket')}
                  </Text>
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                    {t('FreeTicketDescription')}
                  </Text>
                </View>
                <Switch
                  value={isFree}
                  onValueChange={setIsFree}
                  trackColor={{
                    false: switchTrackColor.false,
                    true: switchTrackColor.true,
                  }}
                  thumbColor={colors.background}
                />
              </View>

              {/* Price and Currency (if not free) */}
              {!isFree && (
                <View className="flex-row gap-md mb-lg">
                  {/* Price Field */}
                  <View className="flex-[2]">
                    <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                      {t('Price')} *
                    </Text>
                    <View
                      className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                    >
                      <DollarSign size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                      <TextInput
                        value={price}
                        onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
                        placeholder="0.00"
                        placeholderTextColor={colors.text.tertiary}
                        className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  {/* Currency Selector */}
                  <View className="flex-1">
                    <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                      {t('Currency')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                      className="flex-row items-center rounded-lg px-md py-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                    >
                      <Text className="flex-1 text-sm text-txt-primary dark:text-txt-dark-primary">
                        {currency}
                      </Text>
                      <ChevronDown size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Currency Picker */}
              {!isFree && showCurrencyPicker && (
                <View
                  className="mb-lg rounded-lg border border-[0.5px] overflow-hidden max-h-[160px] border-light-border-muted dark:border-dark-border-muted"
                  style={{
                    backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
                  }}
                >
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

              {/* Promotions (optional) */}
              <View className="mb-lg">
                <View className="flex-row items-center justify-between mb-sm">
                  <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary">
                    {t('AddPromotion')}
                  </Text>
                  <Switch
                    value={includePromotion}
                    onValueChange={setIncludePromotion}
                    trackColor={{
                      false: switchTrackColor.false,
                      true: switchTrackColor.true,
                    }}
                    thumbColor={colors.background}
                  />
                </View>

                {includePromotion && (
                  <View className="gap-md">
                    {promotions.map((promo, index) => (
                      <View
                        key={promo.id}
                        className="rounded-lg border p-md bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                      >
                        <View className="flex-row items-center justify-between mb-sm">
                          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                            {t('PromotionCode')} #{index + 1}
                          </Text>
                          {promotions.length > 1 && (
                            <TouchableOpacity onPress={() => handleRemovePromotion(promo.id)}>
                              <Text className="text-xs text-semantic-error">
                                {t('Delete')}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <View className="gap-sm">
                          {/* Promo Code */}
                          <View
                            className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                          >
                            <FileText size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                            <TextInput
                              value={promo.code}
                              onChangeText={(text) => handlePromotionChange(promo.id, 'code', text.toUpperCase())}
                              placeholder={t('EnterPromotionCode')}
                              placeholderTextColor={colors.text.tertiary}
                              className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                              autoCapitalize="characters"
                              autoCorrect={false}
                            />
                          </View>

                          {/* Percent Off & Amount Off in row */}
                          <View className="flex-row gap-sm">
                            <View className="flex-1">
                              <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-xs">
                                {t('PercentOff')}
                              </Text>
                              <View
                                className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                              >
                                <Percent size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                                <TextInput
                                  value={promo.percent}
                                  onChangeText={(text) => handlePromotionChange(promo.id, 'percent', text.replace(/[^0-9.]/g, ''))}
                                  placeholder="15"
                                  placeholderTextColor={colors.text.tertiary}
                                  className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                                  keyboardType="decimal-pad"
                                />
                              </View>
                            </View>

                            <View className="flex-1">
                              <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-xs">
                                {t('AmountOff')}
                              </Text>
                              <View
                                className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                              >
                                <DollarSign size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                                <TextInput
                                  value={promo.amount}
                                  onChangeText={(text) => handlePromotionChange(promo.id, 'amount', text.replace(/[^0-9.]/g, ''))}
                                  placeholder="0.00"
                                  placeholderTextColor={colors.text.tertiary}
                                  className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                                  keyboardType="decimal-pad"
                                />
                              </View>
                            </View>
                          </View>

                          {/* Active toggle */}
                          <View className="flex-row items-center justify-between mt-sm">
                            <View className="flex-1">
                              <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]">
                                {t('Active')}
                              </Text>
                              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                                {t('PromotionActiveHint')}
                              </Text>
                            </View>
                            <Switch
                              value={promo.active}
                              onValueChange={(val) => handlePromotionChange(promo.id, 'active', val)}
                              trackColor={{
                                false: switchTrackColor.false,
                                true: switchTrackColor.true,
                              }}
                              thumbColor={colors.background}
                            />
                          </View>
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity
                      onPress={handleAddPromotion}
                      className="flex-row items-center justify-center gap-xs py-md rounded-lg border border-[0.5px] bg-light-surface-subtle dark:bg-dark-surface-muted border-light-border dark:border-dark-border-strong"
                    >
                      <Plus size={16} color={colors.text.primary} strokeWidth={2.4} />
                      <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                        {t('AddPromotion')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Max Tickets Per Person */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('MaxTicketsPerPerson')}
                </Text>
                <View
                  className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                >
                  <Hash size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                  <TextInput
                    value={maxPerPerson}
                    onChangeText={(text) => setMaxPerPerson(text.replace(/[^0-9]/g, ''))}
                    placeholder={t('NoLimit')}
                    placeholderTextColor={colors.text.tertiary}
                    className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                    keyboardType="number-pad"
                  />
                </View>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                  {t('MaxTicketsPerPersonHint')}
                </Text>
              </View>

              {/* Requires Approval Toggle */}
              <View className="flex-row items-center justify-between mb-xl py-md">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]">
                    {t('RequiresApproval')}
                  </Text>
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                    {t('RequiresApprovalDescription')}
                  </Text>
                </View>
                <Switch
                  value={requiresApproval}
                  onValueChange={setRequiresApproval}
                  trackColor={{
                    false: switchTrackColor.false,
                    true: switchTrackColor.true,
                  }}
                  thumbColor={colors.background}
                />
              </View>

              {/* Submit Button */}
              <View className="mb-lg">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isSubmitting || !name.trim() || !quantity.trim()}
                  leftIcon={<Ticket size={18} color={colors.text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? t('Creating') : t('CreateTicketType')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
