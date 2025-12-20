import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Download, Database } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { SettingsSection, SettingsRow } from '../components';
import CustomSwitch from '../../../common/components/ui/CustomSwitch';
import { useCurrentUser } from '../../../common/hooks/useCurrentUser';
import { authService } from '../../../core/auth/services/authService';

type Props = {
  onBack?: () => void;
};

export default function DataSettingsScreen({ onBack }: Props) {
  const { t } = useI18n();
  const { colors, spacing, typography } = useTheme();
  const { user, refetch } = useCurrentUser();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const settings = user?.settings;

  const [exportEnabled, setExportEnabled] = useState(settings?.exportEventDataEnabled ?? false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (settings) {
      setExportEnabled(settings.exportEventDataEnabled ?? false);
    }
  }, [settings]);

  const handleExportToggle = async (value: boolean) => {
    if (!user) return;
    setExportEnabled(value);
    setIsUpdating(true);
    try {
      await authService.updateUserProfile(user.id, {
        name: user.name,
        settings: { exportEventDataEnabled: value },
      });
      await refetch();
    } catch (error) {
      // Revert on error
      setExportEnabled(settings?.exportEventDataEnabled ?? false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestDataExport = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement actual data export API call
      // This would typically trigger a background job that emails the user
      Alert.alert(
        t('DataExportRequested'),
        t('DataExportRequestedMessage'),
        [{ text: t('OK') }]
      );
    } catch (error) {
      Alert.alert(t('Error'), t('FailedToRequestDataExport'));
    } finally {
      setIsExporting(false);
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
          {t('DataAndStorage')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <SettingsSection title={t('DataExport')} />
        <SettingsRow
          icon={Download}
          title={t('DownloadYourData')}
          subtitle={t('RequestACopyOfYourInformation')}
          onPress={handleRequestDataExport}
        />
        <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>
            {t('DataExportDescription')}
          </Text>
        </View>

        <SettingsRow
          icon={Database}
          title={t('EnableDataExport')}
          subtitle={t('AllowAutomaticDataExport')}
          end={
            <CustomSwitch
              value={exportEnabled}
              onValueChange={handleExportToggle}
              disabled={isUpdating}
            />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

