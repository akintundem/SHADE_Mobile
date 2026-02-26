import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './ui';
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
  const { colors, spacing } = useTheme();
  const { t } = useI18n();

  return (
    <View className="flex-1 items-center justify-center p-xl bg-light-background dark:bg-dark-background">
      <AlertTriangle size={64} color={colors.semantic.error} style={{ marginBottom: spacing.lg }} />
      <Text className="text-center text-xl font-bold text-txt-primary dark:text-txt-dark-primary mb-sm">
        {t('SomethingWentWrongGeneric')}
      </Text>
      <Text className="text-center leading-6 text-base text-txt-secondary dark:text-txt-dark-secondary mb-xl">
        {t('SomethingWentWrongMessage')}
      </Text>
      {__DEV__ && error && (
        <View className="w-full rounded-lg p-md mb-lg bg-light-surface dark:bg-dark-surface">
          <Text className="text-sm text-semantic-error font-mono">
            {error.message}
          </Text>
        </View>
      )}
      
      <Button
        onPress={onRetry}
        variant="primary"
        leftIcon={<RefreshCw size={16} color={colors.text.inverse} />}
      >
        {t('TryAgain')}
      </Button>
    </View>
  );
};

// Root-level error boundary with no theme/i18n dependencies.
// Place above all providers to catch catastrophic failures.
interface RootErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class RootErrorBoundary extends Component<{ children: ReactNode }, RootErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: wire up crash reporting (e.g. Sentry.captureException(error))
    if (__DEV__) {
      console.error('[RootErrorBoundary]', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={rootStyles.container}>
          <Text style={rootStyles.title}>Something went wrong</Text>
          <Text style={rootStyles.message}>
            An unexpected error occurred. Please try again.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={rootStyles.errorBox}>
              <Text style={rootStyles.errorText}>{this.state.error.message}</Text>
            </View>
          )}
          <TouchableOpacity style={rootStyles.button} onPress={this.handleRetry}>
            <Text style={rootStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const rootStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#c00',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#111',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

