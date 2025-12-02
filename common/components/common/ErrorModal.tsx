import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
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

interface ErrorModalProps {
  visible: boolean;
  error: ErrorInfo | null;
  onClose: () => void;
  onRetry?: () => void;
}

export default function ErrorModal({ visible, error, onClose, onRetry }: ErrorModalProps) {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
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
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg
      }}>
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          width: '100%',
          maxWidth: 400,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <AlertTriangle size={24} color={colors.semantic.error} />
              <Text style={{
                color: colors.text.primary,
                fontSize: typography.size.lg,
                fontWeight: '700'
              }}>
                {error.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: spacing.xs }}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.base,
            lineHeight: 24,
            marginBottom: spacing.md
          }}>
            {error.message}
          </Text>

          {/* Error Code */}
          {error.code && (
            <View style={{
              backgroundColor: colors.background,
              padding: spacing.sm,
              borderRadius: borderRadius.md,
              marginBottom: spacing.md
            }}>
              <Text style={{
                color: colors.text.tertiary,
                fontSize: typography.size.sm,
                fontFamily: 'monospace'
              }}>
                {t('ErrorCode')} {error.code}
              </Text>
            </View>
          )}

          {/* Details */}
          {error.details && (
            <View style={{
              backgroundColor: colors.background,
              padding: spacing.sm,
              borderRadius: borderRadius.md,
              marginBottom: spacing.md
            }}>
              <Text style={{
                color: colors.text.tertiary,
                fontSize: typography.size.sm
              }}>
                {error.details}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={{
            flexDirection: 'row',
            gap: spacing.sm,
            justifyContent: 'flex-end'
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{
                color: colors.text.primary,
                fontWeight: '600'
              }}>
                {t('Close')}
              </Text>
            </TouchableOpacity>
            
            {error.retryable && (
              <TouchableOpacity
                onPress={handleRetry}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  backgroundColor: brand.primary,
                  borderRadius: borderRadius.md
                }}
              >
                <RefreshCw size={16} color={colors.text.inverse} />
                <Text style={{
                  color: colors.text.inverse,
                  fontWeight: '600'
                }}>
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
