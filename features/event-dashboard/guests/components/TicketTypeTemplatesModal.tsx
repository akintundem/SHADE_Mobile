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
  Switch,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Tag,
  Plus,
  Edit,
  Trash2,
  Check,
  DollarSign,
  Hash,
  ChevronDown,
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { ticketService } from '../../../../core/tickets/services/ticket';
import {
  TicketTypeTemplateResponse,
  TicketTypeCategory,
} from '../../../../core/tickets/types/ticket';
import Button from '../../../../common/components/ui/Button';
import { useTheme, useSwitchTrackColors } from '../../../../common/theme/ThemeProvider';
import { ConfirmModal } from '../../../../common/components/ui/ConfirmModal';

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

type ViewMode = 'list' | 'create' | 'edit';

export function TicketTypeTemplatesModal({
  visible,
  eventId,
  onClose,
  onSuccess,
}: Props) {
  const { colors, spacing, isDark } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const switchTrackColor = useSwitchTrackColors();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [templates, setTemplates] = useState<TicketTypeTemplateResponse[]>([]);
  const [_loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTypeTemplateResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketTypeCategory | null>(null);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [quantity, setQuantity] = useState('');
  const [maxPerPerson, setMaxPerPerson] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const categoryOptions = CATEGORY_OPTIONS.map(option => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketService.listTicketTypeTemplates();
      setTemplates(data);
    } catch (err) {
      ErrorHandler.handle(err, 'listTicketTypeTemplates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadTemplates();
    }
  }, [visible, loadTemplates]);

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setCategory(null);
    setPrice('');
    setCurrency('USD');
    setQuantity('');
    setMaxPerPerson('');
    setRequiresApproval(false);
    setError(null);
    setSelectedTemplate(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    setViewMode('list');
    onClose();
  }, [resetForm, onClose]);

  const handleCreate = useCallback(() => {
    resetForm();
    setViewMode('create');
  }, [resetForm]);

  const handleEdit = useCallback((template: TicketTypeTemplateResponse) => {
    setSelectedTemplate(template);
    setName(template.name || '');
    setDescription(template.description || '');
    setCategory(template.category || null);
    setPrice(template.priceMinor ? String(template.priceMinor / 100) : '');
    setCurrency(template.currency || 'USD');
    setQuantity(String(template.quantityAvailable || ''));
    setMaxPerPerson(template.maxTicketsPerPerson ? String(template.maxTicketsPerPerson) : '');
    setRequiresApproval(template.requiresApproval || false);
    setViewMode('edit');
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedTemplate) return;
    setIsProcessing(true);
    setShowDeleteConfirm(false);
    try {
      await ticketService.deleteTicketTypeTemplate(selectedTemplate.id);
      await loadTemplates();
    } catch (err) {
      ErrorHandler.handle(err, 'deleteTicketTypeTemplate');
    } finally {
      setIsProcessing(false);
      setSelectedTemplate(null);
    }
  }, [selectedTemplate, loadTemplates]);

  const handleApply = useCallback(async (template: TicketTypeTemplateResponse) => {
    setIsProcessing(true);
    try {
      await ticketService.applyTicketTypeTemplate(template.id, eventId);
      onSuccess();
      handleClose();
    } catch (err) {
      ErrorHandler.handle(err, 'applyTicketTypeTemplate');
    } finally {
      setIsProcessing(false);
    }
  }, [eventId, onSuccess, handleClose]);

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
    if (price.trim()) {
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

    setIsProcessing(true);
    setError(null);

    try {
      if (viewMode === 'create') {
        await ticketService.createTicketTypeTemplate({
          name: name.trim(),
          description: description.trim() || null,
          category: category || null,
          priceMinor,
          currency: priceMinor ? currency.toUpperCase() : null,
          quantityAvailable: qty,
          maxTicketsPerPerson: maxPer,
          requiresApproval,
        });
      } else if (viewMode === 'edit' && selectedTemplate) {
        await ticketService.updateTicketTypeTemplate(selectedTemplate.id, {
          name: name.trim(),
          description: description.trim() || null,
          category: category || null,
          priceMinor,
          currency: priceMinor ? currency.toUpperCase() : null,
          quantityAvailable: qty,
          maxTicketsPerPerson: maxPer,
          requiresApproval,
        });
      }
      await loadTemplates();
      resetForm();
      setViewMode('list');
    } catch (err: unknown) {
      setError(t('FailedToSaveTemplate'));
      ErrorHandler.handle(err, 'saveTicketTypeTemplate');
    } finally {
      setIsProcessing(false);
    }
  }, [
    viewMode,
    name,
    description,
    category,
    price,
    currency,
    quantity,
    maxPerPerson,
    requiresApproval,
    selectedTemplate,
    t,
    loadTemplates,
    resetForm,
  ]);

  const formatCurrency = useCallback(
    (priceMinor: number | null | undefined, currency: string | null | undefined) => {
      if (!priceMinor) return t('Free');
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(priceMinor / 100);
    },
    [t]
  );

  const selectedCategoryLabel = categoryOptions.find(c => c.value === category)?.label || null;

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
                {viewMode === 'list' ? t('TicketTypeTemplates') : viewMode === 'create' ? t('CreateTemplate') : t('EditTemplate')}
              </Text>
              <View className="flex-row items-center gap-sm">
                {viewMode !== 'list' && (
                  <TouchableOpacity
                    onPress={() => {
                      resetForm();
                      setViewMode('list');
                    }}
                    className="px-sm py-xs"
                  >
                    <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                      {t('Cancel')}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
                >
                  <X size={18} color={colors.text.primary} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            {viewMode === 'list' ? (
              <ScrollView
                className="px-xl"
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={async () => {
                      setRefreshing(true);
                      await loadTemplates();
                      setRefreshing(false);
                    }}
                  />
                }
              >
                <TouchableOpacity
                  onPress={handleCreate}
                  className="flex-row items-center justify-center gap-xs py-md rounded-lg border border-[0.5px] bg-brand-primary mb-lg"
                >
                  <Plus size={16} color={colors.text.inverse} strokeWidth={2.4} />
                  <Text className="text-sm font-semibold text-txt-inverse">
                    {t('CreateTemplate')}
                  </Text>
                </TouchableOpacity>

                {templates.length === 0 ? (
                  <View className="py-2xl items-center">
                    <Tag size={32} color={colors.text.tertiary} strokeWidth={1.5} />
                    <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                      {t('NoTemplatesYet')}
                    </Text>
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center">
                      {t('CreateTemplateToStart')}
                    </Text>
                  </View>
                ) : (
                  <View className="gap-sm">
                    {templates.map(template => (
                      <View
                        key={template.id}
                        className="rounded-lg border p-md bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                      >
                        <View className="flex-row items-start justify-between mb-sm">
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
                              {template.name}
                            </Text>
                            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                              {formatCurrency(template.priceMinor, template.currency)} • {template.quantityAvailable} {t('Available')}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-xs">
                            <TouchableOpacity
                              onPress={() => handleApply(template)}
                              className="p-xs"
                              disabled={isProcessing}
                            >
                              <Check size={16} color={colors.semantic.success} strokeWidth={2.2} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleEdit(template)}
                              className="p-xs"
                            >
                              <Edit size={16} color={colors.text.primary} strokeWidth={2.2} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedTemplate(template);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-xs"
                            >
                              <Trash2 size={16} color={colors.semantic.error} strokeWidth={2.2} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            ) : (
              <ScrollView
                className="px-xl"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {error && (
                  <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                    <Text className="text-sm text-semantic-error">{error}</Text>
                  </View>
                )}

                {/* Name */}
                <View className="mb-lg">
                  <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                    {t('TicketTypeName')} *
                  </Text>
                  <View className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                    <Tag size={16} color={colors.text.tertiary} strokeWidth={2.2} />
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

                {/* Description */}
                <View className="mb-lg">
                  <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                    {t('Description')}
                  </Text>
                  <View className="rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
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

                {/* Category */}
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
                  {showCategoryPicker && (
                    <View className="mt-sm rounded-lg border border-[0.5px] overflow-hidden max-h-[200px] border-light-border-muted dark:border-dark-border-muted">
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

                {/* Quantity */}
                <View className="mb-lg">
                  <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                    {t('QuantityAvailable')} *
                  </Text>
                  <View className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
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

                {/* Price */}
                <View className="mb-lg">
                  <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                    {t('Price')} ({t('Optional')})
                  </Text>
                  <View className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
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

                {/* Max Per Person */}
                <View className="mb-lg">
                  <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                    {t('MaxTicketsPerPerson')}
                  </Text>
                  <View className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
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

                {/* Requires Approval */}
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
                    disabled={isProcessing || !name.trim() || !quantity.trim()}
                    leftIcon={<Tag size={18} color={colors.text.inverse} strokeWidth={2.2} />}
                  >
                    {isProcessing ? t('Saving') : t('Save')}
                  </Button>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={showDeleteConfirm}
        title={t('DeleteTemplate')}
        message={t('DeleteTemplateConfirm', { name: selectedTemplate?.name })}
        confirmLabel={t('Delete')}
        cancelLabel={t('Cancel')}
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedTemplate(null);
        }}
      />
    </Modal>
  );
}
