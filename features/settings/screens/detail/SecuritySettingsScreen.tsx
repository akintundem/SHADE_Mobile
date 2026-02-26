import React, { useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { SettingsSection, SettingsRow } from '../../components';
import CustomSwitch from '../../../../common/components/ui/CustomSwitch';
import { useSettings } from '../../context';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  onBack?: () => void;
};

export default function SecuritySettingsScreen({ onBack }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { settings, updateSecurity, isUpdating } = useSettings();

  const mfaEnabled = settings?.mfaEnabled ?? false;

  const handleMfaToggle = useCallback(
    async (value: boolean) => {
      if (value && !mfaEnabled) {
        Alert.alert(t('EnableTwoFactorAuthentication'), t('EnableMFAConfirmation'), [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Enable'),
            onPress: async () => {
              const ok = await updateSecurity({ mfaEnabled: true });
              if (ok) {
                Alert.alert(t('Success'), t('MFAEnabledSuccessfully'));
              } else {
                Alert.alert(t('Error'), t('FailedToEnableMFA'));
              }
            },
          },
        ]);
      } else if (!value && mfaEnabled) {
        Alert.alert(t('DisableTwoFactorAuthentication'), t('DisableMFAWarning'), [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Disable'),
            style: 'destructive',
            onPress: async () => {
              const ok = await updateSecurity({ mfaEnabled: false });
              if (ok) {
                Alert.alert(t('Success'), t('MFADisabledSuccessfully'));
              } else {
                Alert.alert(t('Error'), t('FailedToDisableMFA'));
              }
            },
          },
        ]);
      }
    },
    [mfaEnabled, t, updateSecurity]
  );

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <View className="flex-row items-center justify-between px-xl py-md">
        <TouchableOpacity onPress={onBack} className="p-xs">
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
          {t('Security')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pb-5">
          <SettingsSection title={t('Authentication')} />
        <SettingsRow
          icon={Shield}
          title={t('TwoFactorAuthentication')}
          subtitle={mfaEnabled ? t('MFAEnabled') : t('AddExtraSecurityToYourAccount')}
          end={
            <CustomSwitch
              value={mfaEnabled}
              onValueChange={handleMfaToggle}
              disabled={isUpdating}
            />
          }
        />
          {mfaEnabled ? (
            <View className="px-xl py-sm">
              <Text className="text-xs text-semantic-success">
                {t('MFAIsActive')}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
