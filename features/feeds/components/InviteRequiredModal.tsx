import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Calendar, MapPin, Users, ArrowRight } from 'lucide-react-native';
import { dateUtils } from '../../../common/utils/helpers';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

export type InviteRequiredModalProps = {
  visible: boolean;
  eventId: string;
  eventName: string;
  description?: string | null;
  coverImageUrl?: string | null;
  startDateTime?: string | null;
  venue?: string | null;
  city?: string | null;
  state?: string | null;
  attendeeCount?: number | null;
  capacity?: number | null;
  onAction: () => Promise<void>;
  loading?: boolean;
  errorMessage?: string;
  successMessage?: string | null;
  onClose: () => void;
};

export const InviteRequiredModal = ({
  visible,
  eventName,
  description,
  coverImageUrl,
  startDateTime,
  venue,
  city,
  state,
  attendeeCount,
  capacity,
  onAction,
  loading = false,
  errorMessage,
  successMessage,
  onClose,
}: InviteRequiredModalProps) => {
  const { t } = useI18n();
  const { colors, disabledButtonBackground } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const overlayIconColor = colors.text.inverse;

  const MODAL_HEIGHT = height * 0.66;

  if (!visible) return null;

  const formattedDate = startDateTime
    ? dateUtils.formatDate(startDateTime, 'EEE, MMM d · h:mm a')
    : null;

  const locationParts = [venue, city, state].filter(Boolean);
  const formattedLocation = locationParts.length > 0 ? locationParts.join(', ') : null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-light-overlay-soft dark:bg-dark-overlay-soft" />
      </TouchableWithoutFeedback>

      <View
        className="absolute bottom-0 left-0 right-0 bg-light-background dark:bg-dark-background rounded-t-2xl overflow-hidden"
        style={{ height: MODAL_HEIGHT }}
      >
        <View style={{ width, height: width * 0.55 }}>
          <ImageBackground
            source={{ uri: getImageUrl(coverImageUrl) || FALLBACK_IMAGE }}
            className="w-full h-full"
            resizeMode="cover"
          >
            <View className="flex-1 justify-between p-lg bg-light-overlay-soft dark:bg-dark-overlay-soft">
              <View className="items-center">
                <View className="w-9 h-1 rounded-full bg-neutral-white/50" />
              </View>

              <View
                className="absolute top-xl left-lg flex-row items-center px-sm py-xs rounded-sm bg-light-overlay dark:bg-dark-overlay"
              >
                <Lock size={12} color={overlayIconColor} strokeWidth={2} />
                <Text className="text-xs font-medium text-txt-inverse ml-xs">{t('InviteOnly')}</Text>
              </View>

              <View>
                <Text className="text-xl font-bold text-txt-inverse" numberOfLines={2}>
                  {eventName}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View className="flex-1 p-lg">
          <View className="mb-md">
            {formattedDate ? (
              <View className="flex-row items-center mb-sm">
                <Calendar size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary ml-sm">
                  {formattedDate}
                </Text>
              </View>
            ) : null}

            {formattedLocation ? (
              <View className="flex-row items-center mb-sm">
                <MapPin size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary ml-sm" numberOfLines={1}>
                  {formattedLocation}
                </Text>
              </View>
            ) : null}

            {attendeeCount !== null && attendeeCount !== undefined ? (
              <View className="flex-row items-center">
                <Users size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary ml-sm">
                  {capacity
                    ? `${attendeeCount} / ${capacity} ${t('Attending')}`
                    : `${attendeeCount} ${t('Attending')}`}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mb-md" />

          <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary leading-relaxed" numberOfLines={3}>
            {description || t('InviteOnlyDescription')}
          </Text>
        </View>

        <View
          className="px-lg pt-md border-t border-light-border dark:border-dark-border"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          {successMessage ? (
            <View className="rounded-md p-sm mb-sm bg-semantic-success-light dark:bg-semantic-success/20">
              <Text className="text-xs text-semantic-success">
                {successMessage}
              </Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View className="rounded-md p-sm mb-sm bg-semantic-error-light dark:bg-semantic-error/[0.15]">
              <Text className="text-xs text-semantic-error">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {successMessage ? (
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="w-full h-[52px] rounded-md flex-row items-center justify-center bg-neutral-black dark:bg-neutral-white"
            >
              <Text className="text-base font-semibold text-txt-inverse dark:text-txt-dark-inverse">
                {t('Done')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onAction}
              disabled={loading}
              activeOpacity={0.8}
              className="w-full h-[52px] rounded-md flex-row items-center justify-center"
              style={{
                backgroundColor: loading ? disabledButtonBackground : colors.text.primary,
              }}
            >
              <Text className="text-base font-semibold text-txt-inverse dark:text-txt-dark-inverse">
                {loading ? t('Processing') : t('RequestInvite')}
              </Text>
              <View className="ml-1">
                <ArrowRight size={18} color={colors.text.inverse} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};
