import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../../../common/i18n/I18nProvider';
import BrandLogo from '../../../common/components/brand/BrandLogo';
import Button from '../../../common/components/ui/Button';

type Props = {
  email: string;
  title: string;
  message: string;
  onBackToSignIn: () => void;
};

export default function EmailSentConfirmationScreen({ email: _email, title, message, onBackToSignIn }: Props) {
  const { t } = useI18n();

  const ICON_SIZE = 56;
  const ICON_RADIUS = Math.round(ICON_SIZE * 0.225);

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      <View className="flex-1 justify-center items-center px-2xl">
        {/* Logo */}
        <View className="items-center mb-3xl">
          <View className="mb-3">
            <BrandLogo
              size={ICON_SIZE}
              borderRadius={ICON_RADIUS}
            />
          </View>
          <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-tight mb-3xl">
            Shade
          </Text>
        </View>

        {/* Message */}
        <View className="items-center mb-4xl gap-md">
          <Text className="text-3xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-tight text-center mb-sm">
            {title}
          </Text>
          <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary leading-5 font-normal tracking-wide text-center px-xl">
            {message}
          </Text>
        </View>

        {/* Back to Sign In Button */}
        <View className="w-full px-xl">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onBackToSignIn}
          >
            {t('SignIn')}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
