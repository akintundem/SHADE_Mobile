import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, User as UserIcon } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import KeyboardOptimizedInput from '../../../../shared/components/ui/KeyboardOptimizedInput';
import Button from '../../../../shared/components/ui/Button';
import { authService } from '../../../../shared/services/authService';
import { OnboardingRequest } from '../../../../shared/types';

type Props = {
  email?: string;
  onBack?: () => void;
  onComplete?: (user: import('../../../../shared/types').UserResponse) => void;
};

export const CompleteProfile = ({ email, onBack, onComplete }: Props) => {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation: name must be 2-100 characters, no HTML tags
  const nameValid = name.trim().length >= 2 && name.trim().length <= 100 && !name.includes('<') && !name.includes('>');
  const canSubmit = useMemo(() => 
    nameValid && acceptTerms && acceptPrivacy,
    [name, acceptTerms, acceptPrivacy]
  );

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      },
      (response) => {
        if (response.didCancel || response.errorMessage) {
          return;
        }
        if (response.assets && response.assets[0]?.uri) {
          setProfileImageUri(response.assets[0].uri);
        }
      },
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const onboardingRequest: OnboardingRequest = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        acceptTerms: true, // Must be true
        acceptPrivacy: true, // Must be true
        marketingOptIn: marketingOptIn,
      };

      const user = await authService.completeOnboarding(onboardingRequest);
      
      // TODO: Upload profile image if selected
      // if (profileImageUri) {
      //   await uploadProfileImage(profileImageUri);
      // }
      
      onComplete?.(user);
    } catch (e: any) {
      let errorMessage = e?.message || 'Onboarding failed';
      if (errorMessage.includes('EMAIL_NOT_VERIFIED')) {
        errorMessage = 'Please verify your email first';
      } else if (errorMessage.includes('PROFILE_ALREADY_COMPLETED')) {
        errorMessage = 'Profile has already been completed';
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ 
          paddingHorizontal: spacing['2xl'],
          paddingTop: spacing['4xl'],
          paddingBottom: spacing['3xl'],
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
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
            textAlign: 'center',
          }}>
            Tell us a bit about yourself
          </Text>
        </View>

        {/* Profile Image Upload */}
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.7}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.surface,
              borderWidth: 2,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              ...shadows.md,
            }}
          >
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="cover"
              />
            ) : (
              <UserIcon size={48} color={colors.text.tertiary} />
            )}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: brand.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: colors.surface,
              }}
            >
              <Camera size={18} color={colors.text.inverse} />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              marginTop: spacing.sm,
              color: colors.text.secondary,
              fontSize: typography.size.sm,
            }}
          >
            {profileImageUri ? 'Tap to change photo' : 'Tap to add photo'}
          </Text>
        </View>

      <KeyboardOptimizedInput
        label="Full name *"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError(null);
        }}
        placeholder="Enter your full name"
        inputType="name"
        enableNativeAutocomplete={true}
        containerStyle={{ marginBottom: 0 }}
      />
      {name && !nameValid && (
        <Text style={{
          fontSize: typography.size.xs,
          color: colors.semantic.error,
        }}>
          Name must be 2-100 characters
        </Text>
      )}

      <KeyboardOptimizedInput
        label="Phone number (optional)"
        value={phoneNumber}
        onChangeText={(text) => {
          setPhoneNumber(text);
          setError(null);
        }}
        placeholder="+1234567890"
        inputType="phone"
        enableNativeAutocomplete={true}
        containerStyle={{ marginBottom: 0 }}
      />

      <KeyboardOptimizedInput
        label="Date of birth (optional)"
        value={dateOfBirth}
        onChangeText={(text) => {
          setDateOfBirth(text);
          setError(null);
        }}
        placeholder="YYYY-MM-DD"
        inputType="default"
        enableNativeAutocomplete={false}
        containerStyle={{ marginBottom: 0 }}
      />
      {/* Note: For date picker, you might want to use a proper date picker component in production */}

      <TouchableOpacity
        onPress={() => setMarketingOptIn(!marketingOptIn)}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.sm,
          marginTop: spacing.xs,
        }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: borderRadius.sm,
            borderWidth: 2,
            borderColor: marketingOptIn ? brand.primary : colors.border,
            backgroundColor: marketingOptIn ? brand.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          {marketingOptIn && (
            <Text
              style={{
                color: colors.text.inverse,
                fontSize: 12,
                fontWeight: typography.weight.bold,
              }}
            >
              ✓
            </Text>
          )}
        </View>
        <Text
          style={{
            flex: 1,
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            lineHeight: 20,
          }}
        >
          Receive marketing communications
        </Text>
      </TouchableOpacity>

      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        <TouchableOpacity
          onPress={() => setAcceptTerms(!acceptTerms)}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: borderRadius.sm,
              borderWidth: 2,
              borderColor: acceptTerms ? brand.primary : colors.border,
              backgroundColor: acceptTerms ? brand.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            {acceptTerms && (
              <Text
                style={{
                  color: colors.text.inverse,
                  fontSize: 12,
                  fontWeight: typography.weight.bold,
                }}
              >
                ✓
              </Text>
            )}
          </View>
          <Text
            style={{
              flex: 1,
              color: colors.text.secondary,
              fontSize: typography.size.sm,
              lineHeight: 20,
            }}
          >
            I accept the{' '}
            <Text
              style={{
                color: brand.primary,
                fontWeight: typography.weight.medium,
              }}
            >
              Terms and Conditions
            </Text>
            {' *'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAcceptPrivacy(!acceptPrivacy)}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: borderRadius.sm,
              borderWidth: 2,
              borderColor: acceptPrivacy ? brand.primary : colors.border,
              backgroundColor: acceptPrivacy ? brand.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            {acceptPrivacy && (
              <Text
                style={{
                  color: colors.text.inverse,
                  fontSize: 12,
                  fontWeight: typography.weight.bold,
                }}
              >
                ✓
              </Text>
            )}
          </View>
          <Text
            style={{
              flex: 1,
              color: colors.text.secondary,
              fontSize: typography.size.sm,
              lineHeight: 20,
            }}
          >
            I accept the{' '}
            <Text
              style={{
                color: brand.primary,
                fontWeight: typography.weight.medium,
              }}
            >
              Privacy Policy
            </Text>
            {' *'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text
          style={{
            color: colors.semantic.error,
            fontSize: typography.size.sm,
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          loading={submitting}
          style={{ marginTop: spacing.md }}
        >
          Complete profile
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};
