import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { UpdateUserProfileRequest } from '../../../core/auth/types/auth';
import { authService } from '../../../core/auth/services/authService';
import KeyboardAwareContainer from '../../../common/components/ui/KeyboardAwareContainer';
import Input from '../../../common/components/ui/Input';
import Button from '../../../common/components/ui/Button';
import { User } from '../../../core/auth/types/auth';
import { Camera, X } from 'lucide-react-native';
import NotificationModal, { NotificationInfo } from '../../../common/components/common/NotificationModal';

type Props = {
  user: User;
  onComplete: (user: User) => void;
};

export default function OnboardingScreen({ user, onComplete }: Props) {
  const { colors, spacing, typography, borderRadius, brand } = useTheme();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationInfo | null>(null);

  const canSubmit = name.trim().length >= 2 && acceptTerms && acceptPrivacy;

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: false,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorCode) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setProfileImage(asset.uri);
        }
      }
    });
  };

  const uploadImageToS3 = async (imageUri: string): Promise<void> => {
    // Get file extension and content type
    const fileExtension = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `profile-${Date.now()}.${fileExtension}`;
    const contentType = `image/${fileExtension === 'png' ? 'png' : fileExtension === 'gif' ? 'gif' : 'jpeg'}`;

    // Step 1: Get presigned upload URL
    const uploadUrlResponse = await authService.getProfileImageUploadUrl({
      fileName,
      contentType,
    });

    // Step 2: Upload image directly to S3
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const uploadResponse = await fetch(uploadUrlResponse.uploadUrl, {
      method: uploadUrlResponse.uploadMethod || 'PUT',
      body: blob,
      headers: uploadUrlResponse.headers,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to S3');
    }

    // Step 3: Complete the image upload (this sets profilePictureUrl on the user account)
    await authService.completeProfileImageUpload({
      objectKey: uploadUrlResponse.objectKey,
      resourceUrl: uploadUrlResponse.resourceUrl,
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Step 1: Upload image first (if selected)
      // This will set profilePictureUrl on the user account
      if (profileImage) {
        try {
          setUploadingImage(true);
          await uploadImageToS3(profileImage);
        } catch (imageError: any) {
          setUploadingImage(false);
          setError(imageError?.message || t('ImageUploadFailed'));
          setNotification({
            type: 'error',
            title: t('ImageUploadFailed'),
            message: imageError?.message || t('ImageUploadFailed'),
          });
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // Step 2: Update profile (image is already set if uploaded)
      const request: UpdateUserProfileRequest = {
        name: name.trim(),
        username: username.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        dateOfBirth: undefined, // Can be added later if needed
        acceptTerms,
        acceptPrivacy,
        marketingOptIn,
      };

      const updatedUser = await authService.updateUserProfile(user.id, request);
      const mapped: User = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        provider: 'password',
      };

      onComplete(mapped);
    } catch (e: any) {
      const errorMessage = e?.message || t('RegistrationFailed');
      setError(errorMessage);
      setNotification({
        type: 'error',
        title: t('RegistrationFailed'),
        message: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareContainer
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingTop: spacing['4xl'],
          paddingBottom: spacing['2xl'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={spacing.lg}
        scrollEnabled={true}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing['5xl'], alignItems: 'center' }}>
          <Text
            style={{
              fontSize: typography.size['3xl'],
              fontWeight: typography.weight.bold,
              color: colors.text.primary,
              marginBottom: spacing.md,
              letterSpacing: -0.5,
            }}
          >
            {t('CompleteYourProfile')}
          </Text>
          <Text
            style={{
              fontSize: typography.size.sm,
              color: colors.text.secondary,
              lineHeight: 22,
              textAlign: 'center',
              paddingHorizontal: spacing.lg,
            }}
          >
            {t('CompleteYourProfileDescription')}
          </Text>
        </View>

        {/* Profile Picture Section */}
        <View style={{ alignItems: 'center', marginBottom: spacing['4xl'] }}>
          <TouchableOpacity
            onPress={handleImagePicker}
            activeOpacity={0.7}
            style={{
              width: 100,
              height: 100,
              borderRadius: borderRadius.full,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: profileImage ? 'transparent' : colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {profileImage ? (
              <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setProfileImage(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    borderRadius: borderRadius.full,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <X size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <Camera size={32} color={colors.text.tertiary} />
            )}
          </TouchableOpacity>
          {!profileImage && (
            <TouchableOpacity
              onPress={handleImagePicker}
              style={{ marginTop: spacing.md }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: typography.size.sm,
                  color: brand.primary,
                  fontWeight: typography.weight.medium,
                }}
              >
                {t('AddPhoto')}
              </Text>
            </TouchableOpacity>
          )}
          {uploadingImage && (
            <View style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <ActivityIndicator size="small" color={brand.primary} />
              <Text style={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
                {t('UploadingImage')}
              </Text>
            </View>
          )}
        </View>

        <View style={{ gap: spacing['2xl'] }}>
          <View style={{ gap: spacing.lg }}>
            <Input
              label={t('FullName')}
              value={name}
              onChangeText={text => {
                setName(text);
                setError(null);
              }}
              placeholder={t('EnterYourFullName')}
              inputType="name"
              enableNativeAutocomplete={true}
              error={error && error.toLowerCase().includes('name') ? error : undefined}
              containerStyle={{ marginBottom: 0 }}
            />

            <Input
              label={t('Username')}
              value={username}
              onChangeText={text => {
                setUsername(text);
                setError(null);
              }}
              placeholder={t('EnterYourUsername')}
              inputType="name"
              enableNativeAutocomplete={false}
              error={error && error.toLowerCase().includes('username') ? error : undefined}
              containerStyle={{ marginBottom: 0 }}
            />

            <Input
              label={t('PhoneNumber')}
              value={phoneNumber}
              onChangeText={text => {
                setPhoneNumber(text);
                setError(null);
              }}
              placeholder={t('EnterYourPhoneNumber')}
              inputType="phone"
              enableNativeAutocomplete={true}
              error={error && error.toLowerCase().includes('phone') ? error : undefined}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          {error && !error.toLowerCase().includes('name') && !error.toLowerCase().includes('username') && !error.toLowerCase().includes('phone') ? (
            <View>
              <Text
                style={{
                  color: colors.semantic.error,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <View style={{ gap: spacing.lg, marginTop: spacing.md }}>
            <TouchableOpacity
              onPress={() => setAcceptTerms(!acceptTerms)}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: spacing.md,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: acceptTerms ? brand.primary : colors.border,
                  backgroundColor: acceptTerms ? brand.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                {acceptTerms && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: colors.text.inverse,
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.regular,
                  flex: 1,
                  lineHeight: 22,
                }}
              >
                {t('IAgreeTo')}{' '}
                <Text style={{ color: brand.primary, fontWeight: typography.weight.medium }}>
                  {t('TermsOfService')}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAcceptPrivacy(!acceptPrivacy)}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: spacing.md,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: acceptPrivacy ? brand.primary : colors.border,
                  backgroundColor: acceptPrivacy ? brand.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                {acceptPrivacy && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: colors.text.inverse,
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.regular,
                  flex: 1,
                  lineHeight: 22,
                }}
              >
                {t('IAgreeTo')}{' '}
                <Text style={{ color: brand.primary, fontWeight: typography.weight.medium }}>
                  {t('PrivacyPolicy')}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMarketingOptIn(!marketingOptIn)}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: spacing.md,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: marketingOptIn ? brand.primary : colors.border,
                  backgroundColor: marketingOptIn ? brand.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                {marketingOptIn && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: colors.text.inverse,
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.regular,
                  flex: 1,
                  lineHeight: 22,
                }}
              >
                {t('MarketingOptIn')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: spacing['2xl'] }}>
            <Button
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              loading={submitting}
              variant="primary"
              size="lg"
              fullWidth
            >
              {t('CompleteProfile')}
            </Button>
          </View>
        </View>
      </KeyboardAwareContainer>

      <NotificationModal
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </SafeAreaView>
  );
}

