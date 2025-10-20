import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { BaseButton } from './common/BaseButton';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

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

    // Log error to crash reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
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
      <AlertTriangle size={64} color={colors.error} style={{ marginBottom: spacing.lg }} />
      
      <Text
        style={{
          fontSize: typography.size.xl,
          fontWeight: typography.weight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        Something went wrong
      </Text>
      
      <Text
        style={{
          fontSize: typography.size.md,
          color: colors.text.secondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: spacing.xl,
        }}
      >
        We're sorry, but something unexpected happened. Please try again.
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
              color: colors.error,
              fontFamily: 'monospace',
            }}
          >
            {error.message}
          </Text>
        </View>
      )}
      
      <BaseButton
        title="Try Again"
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
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // Here you would typically send the error to a crash reporting service
    // Example: crashlytics().recordError(error);
  };

  return { handleError };
};
