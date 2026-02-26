import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Download, Database } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { SettingsSection, SettingsRow } from '../../components';
import CustomSwitch from '../../../../common/components/ui/CustomSwitch';
import { useSettings } from '../../context';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  onBack?: () => void;
};

export default function DataSettingsScreen({ onBack }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { settings, updateSecurity, isUpdating } = useSettings();
  const [isExporting, setIsExporting] = useState(false);

  const exportEnabled = settings?.exportEventDataEnabled ?? false;

  const handleExportToggle = useCallback(
    async (value: boolean) => {
      await updateSecurity({ exportEventDataEnabled: value });
    },
    [updateSecurity]
  );

  const handleRequestDataExport = useCallback(async () => {
    setIsExporting(true);
    try {
      Alert.alert(t('DataExportRequested'), t('DataExportRequestedMessage'), [{ text: t('OK') }]);
    } catch (error) {
      Alert.alert(t('Error'), t('FailedToRequestDataExport'));
    } finally {
      setIsExporting(false);
    }
  }, [t]);

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <View className="flex-row items-center justify-between px-xl py-md">
        <TouchableOpacity onPress={onBack} className="p-xs">
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
          {t('DataAndStorage')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pb-5">
          <SettingsSection title={t('DataExport')} />
        <SettingsRow
          icon={Download}
          title={t('DownloadYourData')}
          subtitle={t('RequestACopyOfYourInformation')}
          onPress={handleRequestDataExport}
        />
        <View className="px-xl py-sm">
          <Text className="text-xs text-txt-secondary dark:text-txt-dark-secondary">
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
              disabled={isUpdating || isExporting}
            />
          }
        />
        </View>
      </ScrollView>
    </View>
  );
}
