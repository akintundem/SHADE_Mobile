import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Shield, Key } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { SettingsSection, SettingsRow } from '../components';
import CustomSwitch from '../../../common/components/ui/CustomSwitch';
import { useCurrentUser } from '../../../common/hooks/useCurrentUser';
import { authService } from '../../../core/auth/services/authService';

type Props = {
  onBack?: () => void;
  onChangePassword?: () => void;
};

export default function SecuritySettingsScreen({ onBack, onChangePassword }: Props) {
  const { t } = useI18n();
  const { colors, spacing, typography } = useTheme();
  const { user, refetch } = useCurrentUser();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const settings = user?.settings;

  const [mfaEnabled, setMfaEnabled] = useState(settings?.mfaEnabled ?? false);

  useEffect(() => {
    if (settings) {
      setMfaEnabled(settings.mfaEnabled ?? false);
    }
  }, [settings]);

  const handleMfaToggle = async (value: boolean) => {
    if (value && !mfaEnabled) {
      // Enable MFA - show confirmation
      Alert.alert(
        t('EnableTwoFactorAuthentication'),
        t('EnableMFAConfirmation'),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Enable'),
            onPress: async () => {
              if (!user) return;
              setMfaEnabled(true);
              setIsUpdating(true);
              try {
                await authService.updateUserProfile(user.id, {
                  name: user.name,
                  settings: { mfaEnabled: true },
                });
                await refetch();
                Alert.alert(t('Success'), t('MFAEnabledSuccessfully'));
              } catch (error) {
                setMfaEnabled(false);
                Alert.alert(t('Error'), t('FailedToEnableMFA'));
              } finally {
                setIsUpdating(false);
              }
            },
          },
        ]
      );
    } else if (!value && mfaEnabled) {
      // Disable MFA - show warning
      Alert.alert(
        t('DisableTwoFactorAuthentication'),
        t('DisableMFAWarning'),
        [
          { text: t('Cancel'), style: 'cancel', onPress: () => setMfaEnabled(true) },
          {
            text: t('Disable'),
            style: 'destructive',
            onPress: async () => {
              if (!user) return;
              setMfaEnabled(false);
              setIsUpdating(true);
              try {
                await authService.updateUserProfile(user.id, {
                  name: user.name,
                  settings: { mfaEnabled: false },
                });
                await refetch();
                Alert.alert(t('Success'), t('MFADisabledSuccessfully'));
              } catch (error) {
                setMfaEnabled(true);
                Alert.alert(t('Error'), t('FailedToDisableMFA'));
              } finally {
                setIsUpdating(false);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderBottomWidth: 0.5,
          borderColor: colors.divider,
        }}
      >
        <TouchableOpacity onPress={onBack} style={{ padding: spacing.xs }}>
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: typography.weight.semibold,
            fontSize: typography.size.base,
          }}
        >
          {t('Security')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <SettingsSection title={t('Authentication')} />
        <SettingsRow
          icon={Key}
          title={t('ChangePassword')}
          subtitle={t('UpdateYourPasswordSecurely')}
          onPress={onChangePassword}
        />
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
        {mfaEnabled && (
          <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }}>
            <Text style={{ color: colors.semantic.success, fontSize: typography.size.xs }}>
              {t('MFAIsActive')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

