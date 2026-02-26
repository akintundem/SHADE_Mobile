import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { X, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';

export interface ErrorInfo {
  title: string;
  message: string;
  code?: string;
  details?: string;
  retryable?: boolean;
  onRetry?: () => void;
}

type ErrorModalProps = {
  visible: boolean;
  error: ErrorInfo | null;
  onClose: () => void;
  onRetry?: () => void;
};

export function ErrorModal({ visible, error, onClose, onRetry }: ErrorModalProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  if (!error) return null;

  const handleRetry = () => {
    if (error.onRetry) {
      error.onRetry();
    } else if (onRetry) {
      onRetry();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center p-lg bg-light-overlay dark:bg-dark-overlay">
        <View className="w-full max-w-[400px] rounded-xl p-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-md">
            <View className="flex-row items-center gap-sm">
              <AlertTriangle size={24} color={colors.semantic.error} />
              <Text className="font-bold text-lg text-txt-primary dark:text-txt-dark-primary">
                {error.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-xs">
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          <Text className="leading-6 text-base text-txt-secondary dark:text-txt-dark-secondary mb-md">
            {error.message}
          </Text>

          {/* Error Code */}
          {error.code && (
            <View className="bg-light-background dark:bg-dark-background p-sm rounded-md mb-md">
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary font-mono">
                {t('ErrorCode')} {error.code}
              </Text>
            </View>
          )}

          {/* Details */}
          {error.details && (
            <View className="bg-light-background dark:bg-dark-background p-sm rounded-md mb-md">
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                {error.details}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View className="flex-row justify-end gap-sm">
            <TouchableOpacity
              onPress={onClose}
              className="flex-row items-center px-lg py-sm rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface"
            >
              <Text className="font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('Close')}
              </Text>
            </TouchableOpacity>
            {error.retryable && (
              <TouchableOpacity
                onPress={handleRetry}
                className="flex-row items-center gap-xs px-lg py-sm rounded-md bg-brand-primary"
              >
                <RefreshCw size={16} color={colors.text.inverse} />
                <Text className="font-semibold text-txt-inverse">
                  {t('Retry')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
