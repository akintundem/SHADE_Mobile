import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { ticketService } from '../../../../core/tickets/services/ticket';
import { TicketTypeResponse, TicketTypeCategory } from '../../../../core/tickets/types/ticket';
import Button from '../../../../common/components/ui/Button';
import { useTheme, useSwitchTrackColors } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  ticketType: TicketTypeResponse | null;
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

export function EditTicketTypeModal({
  visible,
  eventId,
  ticketType,
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

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketTypeCategory | null>(null);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [quantity, setQuantity] = useState('');
  const [maxPerPerson, setMaxPerPerson] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (ticketType) {
      setName(ticketType.name || '');
      setDescription(ticketType.description || '');
      setCategory(ticketType.category || null);
      setIsFree(!ticketType.priceMinor);
      setPrice(ticketType.priceMinor ? String(ticketType.priceMinor / 100) : '');
      setCurrency(ticketType.currency || 'USD');
      setQuantity(String(ticketType.quantityAvailable || ''));
      setMaxPerPerson(ticketType.maxTicketsPerPerson ? String(ticketType.maxTicketsPerPerson) : '');
      setRequiresApproval(ticketType.requiresApproval || false);
      setIsActive(ticketType.isActive !== false);
    }
  }, [ticketType]);

  const selectedCategoryLabel = useMemo(() => {
    const found = categoryOptions.find(c => c.value === category);
    return found?.label || null;
  }, [category, categoryOptions]);

  const handleClose = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!ticketType) return;

    if (!name.trim()) {
      setError(t('TicketTypeNameRequired'));
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
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

    setIsSubmitting(true);
    setError(null);

    try {
      await ticketService.updateTicketType(eventId, ticketType.id, {
        name: name.trim(),
        description: description.trim() || null,
        category: category || null,
        priceMinor,
        currency: isFree ? null : currency.toUpperCase(),
        quantityAvailable: qty,
        maxTicketsPerPerson: maxPer,
        requiresApproval,
        isActive,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToUpdateTicketType'));
      ErrorHandler.handle(err, 'updateTicketType');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    ticketType,
    name,
    description,
    category,
    isFree,
    price,
    currency,
    quantity,
    maxPerPerson,
    requiresApproval,
    isActive,
    eventId,
    t,
    onSuccess,
    onClose,
  ]);

  if (!ticketType) return null;

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
                {t('EditTicketType')}
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

              {/* Price (if not free) */}
              {!isFree && (
                <View className="mb-lg">
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
              )}

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
              </View>

              {/* Requires Approval Toggle */}
              <View className="flex-row items-center justify-between mb-lg py-md">
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

              {/* Is Active Toggle */}
              <View className="flex-row items-center justify-between mb-xl py-md">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]">
                    {t('Active')}
                  </Text>
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                    {t('ActiveDescription')}
                  </Text>
                </View>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
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
