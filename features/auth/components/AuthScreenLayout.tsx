import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import KeyboardAwareContainer from '../../../common/components/ui/KeyboardAwareContainer';
import BrandLogo from '../../../common/components/brand/BrandLogo';
import { AppleIcon, SpotifyIcon } from './icons';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';

const ICON_SIZE = 56;
const ICON_RADIUS = Math.round(ICON_SIZE * 0.225);

type Props = {
  children: React.ReactNode;
  scrollEnabled?: boolean;
};

export default function AuthScreenLayout({ children, scrollEnabled = false }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const inverseColor = colors.text.inverse;

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      <KeyboardAwareContainer
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={16}
        scrollEnabled={scrollEnabled}
      >
        <View className="px-[24px] pt-[32px] pb-[24px] min-h-full">
          {/* Brand header */}
          <View className="items-center mb-3xl">
            <View className="mb-3">
              <BrandLogo size={ICON_SIZE} borderRadius={ICON_RADIUS} />
            </View>
            <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-tight">
              Shade
            </Text>
          </View>

          {children}

          {/* Or divider */}
          <View className="flex-row items-center my-xl">
            <View className="flex-1 h-px bg-light-divider dark:bg-dark-divider" />
            <Text className="mx-lg text-xs font-normal tracking-wider uppercase text-txt-tertiary dark:text-txt-dark-tertiary">
              {t('Or')}
            </Text>
            <View className="flex-1 h-px bg-light-divider dark:bg-dark-divider" />
          </View>

          {/* Social auth placeholders */}
          <View className="flex-row justify-center items-center gap-xl">
            <View className="w-14 h-14 rounded-full items-center justify-center opacity-50 bg-social-apple">
              <AppleIcon size={24} color={inverseColor} />
            </View>
            <View className="w-14 h-14 rounded-full items-center justify-center opacity-50 bg-social-spotify">
              <SpotifyIcon size={24} color={inverseColor} />
            </View>
          </View>

          {/* Legal footer */}
          <View className="items-center mt-2xl" style={{ marginBottom: Math.max(insets.bottom, 16) }}>
            <Text className="text-xs font-normal text-center leading-[18px] px-xl text-txt-tertiary dark:text-txt-dark-tertiary">
              {t('ByContinuing')}{' '}
              <Text className="font-medium text-txt-secondary dark:text-txt-dark-secondary">
                {t('TermsOfService')}
              </Text>
              {' '}{t('And')}{' '}
              <Text className="font-medium text-txt-secondary dark:text-txt-dark-secondary">
                {t('PrivacyPolicy')}
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAwareContainer>
    </SafeAreaView>
  );
}
