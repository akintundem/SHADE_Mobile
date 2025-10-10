import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = { onPress?: () => void };

export const SharePostCard = ({ onPress }: Props) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.surface,
        paddingVertical: 20,
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            height: 48,
            width: 48,
            borderRadius: 24,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Camera size={20} color={colors.textPrimary} />
        </View>
        <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Share a Post</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>
          Connect a moment to music or an event and share it
        </Text>
      </View>
    </TouchableOpacity>
  );
};

