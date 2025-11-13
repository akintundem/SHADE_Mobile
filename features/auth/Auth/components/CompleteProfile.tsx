import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Camera, User as UserIcon } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import KeyboardOptimizedInput from '../../../../shared/components/ui/KeyboardOptimizedInput';
import Button from '../../../../shared/components/ui/Button';

type Props = {
  email?: string;
  onBack?: () => void;
  onComplete?: (payload: { name: string; username: string }) => void;
};

export const CompleteProfile = ({ email, onBack, onComplete }: Props) => {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const canSubmit = useMemo(() => name.trim().length > 0 && username.trim().length > 0, [name, username]);

  return (
    <View style={{ gap: spacing.lg }}>
      <TouchableOpacity 
        onPress={onBack} 
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: spacing.sm,
          marginBottom: spacing.xs,
        }}
        activeOpacity={0.7}
      >
        <ArrowLeft size={18} color={colors.text.secondary} />
        <Text style={{ 
          color: colors.text.secondary,
          fontSize: typography.size.sm,
          fontWeight: typography.weight.medium,
        }}>
          Back to credentials
        </Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
        <Text style={{ 
          fontSize: typography.size['2xl'],
          fontWeight: typography.weight.bold,
          color: colors.text.primary,
          marginBottom: spacing.xs,
        }}>
          Complete your profile
        </Text>
        <Text style={{ 
          color: colors.text.secondary,
          fontSize: typography.size.sm,
        }}>
          Tell us a bit about yourself
        </Text>
      </View>

      <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
        <View
          style={{
            height: 100,
            width: 100,
            borderRadius: borderRadius.full,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.md,
          }}
        >
          <UserIcon size={36} color={colors.text.tertiary} />
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              height: 28,
              width: 28,
              borderRadius: borderRadius.full,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.sm,
            }}
          >
            <Camera size={16} color={colors.text.primary} />
          </View>
        </View>
        <Text style={{ 
          marginTop: spacing.sm,
          color: colors.text.tertiary,
          fontSize: typography.size.sm,
        }}>
          Add a profile picture
        </Text>
      </View>

      <KeyboardOptimizedInput
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
        inputType="name"
        enableNativeAutocomplete={true}
        containerStyle={{ marginBottom: 0 }}
      />

      <KeyboardOptimizedInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Choose a username"
        inputType="name"
        enableNativeAutocomplete={true}
        containerStyle={{ marginBottom: 0 }}
      />

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={() => onComplete?.({ name, username })}
        disabled={!canSubmit}
        style={{ marginTop: spacing.md, backgroundColor: brand.primary }}
      >
        Complete profile
      </Button>
    </View>
  );
};
