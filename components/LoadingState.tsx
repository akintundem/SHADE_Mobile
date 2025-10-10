import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppIcon } from './AppIcon';

type Props = { message?: string };

export default function LoadingState({ message }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
      }}
    >
      <AppIcon size={48} color={colors.textPrimary} />
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
        Shade
      </Text>
      <ActivityIndicator size="large" color={colors.textPrimary} />
      {message ? (
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 16 }}>{message}</Text>
      ) : (
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 16 }}>
          Your personal sanctuary
        </Text>
      )}
    </View>
  );
}
