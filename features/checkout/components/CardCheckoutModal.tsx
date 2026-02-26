import React, { useState } from 'react';
import { View, Text, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { CardForm } from './CardForm';
import type { CardPaymentPayload, CardCheckoutModalProps } from '../types';

export function CardCheckoutModal({
  visible,
  amountLabel,
  onPay,
  onClose,
  loading = false,
  errorMessage,
}: CardCheckoutModalProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handlePay = async (payload: CardPaymentPayload) => {
    setLocalError(null);
    setSubmitting(true);
    try {
      await onPay(payload);
      onClose();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      </TouchableWithoutFeedback>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          justifyContent: 'flex-end',
        }}
        pointerEvents="box-none"
      >
        <View
          className="rounded-t-[20px] max-h-[90%] bg-light-background dark:bg-dark-background"
          style={{
            paddingBottom: Math.max(insets.bottom, 24),
            paddingHorizontal: 20,
          }}
        >
          <View className="flex-row items-center mb-2">
            <TouchableWithoutFeedback onPress={onClose}>
              <View className="p-2 -ml-2">
                <ArrowLeft size={24} color={colors.text.primary} strokeWidth={2} />
              </View>
            </TouchableWithoutFeedback>
            <Text className="text-lg font-semibold ml-2 text-txt-primary dark:text-txt-dark-primary">
              {t('CardDetails')}
            </Text>
          </View>
          {amountLabel ? (
            <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary mb-4">
              {amountLabel}
            </Text>
          ) : null}
          {(errorMessage || localError) && (
            <View className="p-3 rounded-[10px] mb-4 bg-semantic-error-light dark:bg-semantic-error/20">
              <Text className="text-sm text-semantic-error">
                {localError ?? errorMessage}
              </Text>
            </View>
          )}
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <CardForm
              onSubmit={handlePay}
              loading={loading || submitting}
              submitLabel={t('PaySecurely')}
              cardNumberLabel={t('CardNumber')}
              expiryLabel={t('ExpiryDate')}
              cvcLabel={t('CVV')}
              nameLabel={t('NameOnCard')}
              cardNumberPlaceholder={t('CardNumberPlaceholder')}
              expiryPlaceholder={t('ExpiryPlaceholder')}
              cvcPlaceholder={t('CVVPlaceholder')}
              namePlaceholder={t('NameOnCardPlaceholder')}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
