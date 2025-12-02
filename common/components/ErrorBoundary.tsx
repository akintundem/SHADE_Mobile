import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { BaseButton } from './common/BaseButton';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useI18n } from '../i18n/I18nProvider';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useI18n();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.background,
      }}
    >
      <AlertTriangle size={64} color={colors.semantic.error} style={{ marginBottom: spacing.lg }} />
      
      <Text
        style={{
          fontSize: typography.size.xl,
          fontWeight: typography.weight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {t('SomethingWentWrongGeneric')}
      </Text>
      
      <Text
        style={{
          fontSize: typography.size.base,
          color: colors.text.secondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: spacing.xl,
        }}
      >
        {t('SomethingWentWrongMessage')}
      </Text>
      
      {__DEV__ && error && (
        <View
          style={{
            backgroundColor: colors.surface,
            padding: spacing.md,
            borderRadius: 8,
            marginBottom: spacing.lg,
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: typography.size.sm,
              color: colors.semantic.error,
              fontFamily: 'monospace',
            }}
          >
            {error.message}
          </Text>
        </View>
      )}
      
      <BaseButton
        title={t('TryAgain')}
        onPress={onRetry}
        variant="primary"
        icon={<RefreshCw size={16} color="#FFFFFF" />}
        iconPosition="left"
      />
    </View>
  );
};

// Hook for error boundary
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    // Here you would typically send the error to a crash reporting service
    // Example: crashlytics().recordError(error);
  };

  return { handleError };
};
