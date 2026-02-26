import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { JitSignupRequest } from '../../../core/auth/types/auth';
import { authService } from '../../../core/auth/services/authService';
import { AuthError, AuthErrorCode } from '../../../core/auth/errors/AuthError';
import { mapToUser } from '../../../core/auth/utils/authUtils';
import KeyboardAwareContainer from '../../../common/components/ui/KeyboardAwareContainer';
import Input from '../../../common/components/ui/Input';
import Button from '../../../common/components/ui/Button';
import { User } from '../../../core/auth/types/auth';
import { Camera, X } from 'lucide-react-native';
import NotificationModal, { NotificationInfo } from '../../../common/components/common/NotificationModal';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';

type Props = {
  user: User;
  onComplete: (user: User) => void;
};

// Location verification temporarily disabled

export default function OnboardingScreen({ user, onComplete }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
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
  // Location verification temporarily disabled
  // const [locationId, setLocationId] = useState<string | null>(null);
  // const [fetchingLocation, setFetchingLocation] = useState(false);
  // const [locationApproved, setLocationApproved] = useState(false);

  const canSubmit =
    name.trim().length >= 2 &&
    username.trim().length >= 3 &&
    phoneNumber.trim().length > 0 &&
    acceptTerms &&
    acceptPrivacy;

  // // Fetch user location on mount and validate against approved locations
  // useEffect(() => {
  //   // Location verification disabled
  // }, [t]);

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
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

    // Step 2: Upload image directly to S3 (resolve MinIO host so app can reach storage)
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const uploadUrl = getImageUrl(uploadUrlResponse.uploadUrl) ?? uploadUrlResponse.uploadUrl;
    const uploadResponse = await fetch(uploadUrl, {
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

      const signupRequest: JitSignupRequest = {
        email: user.email,
        username: username.trim(),
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        marketingOptIn,
        acceptTerms,
        acceptPrivacy,
      };

      let session = await authService.completeSignup(signupRequest);
      let updatedUser = session.user;

      // Upload image after user is created (if selected)
      if (profileImage) {
        try {
          setUploadingImage(true);
          await uploadImageToS3(profileImage);
          session = await authService.getAuthSession();
          updatedUser = session.user;
        } catch (imageError: any) {
          setError(t('ImageUploadFailed'));
          setNotification({
            type: 'error',
            title: t('ImageUploadFailed'),
            message: t('ImageUploadFailed'),
          });
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      onComplete(mapToUser(updatedUser));
    } catch (e: unknown) {
      const code = AuthError.codeOf(e);
      let title = t('OnboardingFailed');
      let message = t('OnboardingFailed');

      if (code === AuthErrorCode.USERNAME_TAKEN) {
        title = t('UsernameTaken');
        message = t('UsernameTaken');
      } else if (code === AuthErrorCode.EMAIL_NOT_VERIFIED) {
        title = t('EmailNotVerified');
        message = t('EmailNotVerified');
      } else if (
        code === AuthErrorCode.ONBOARDING_EMAIL_MISMATCH ||
        code === AuthErrorCode.VALIDATION_ERROR
      ) {
        title = t('EmailMismatch');
        message = t('EmailMismatch');
      }

      setError(message);
      setNotification({
        type: 'error',
        title,
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      <KeyboardAwareContainer
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={16}
        scrollEnabled={true}
      >
        <View className="px-4 pt-[20px] pb-4">
        {/* Header */}
        <View className="mb-xl items-center">
          <Text className="text-xl font-bold text-txt-primary dark:text-txt-dark-primary mb-sm tracking-tight">
            {t('CompleteYourProfile')}
          </Text>
          <Text className="text-xs text-txt-secondary dark:text-txt-dark-secondary leading-[18px] text-center px-md">
            {t('CompleteYourProfileDescription')}
          </Text>
        </View>

        {/* Location Validation disabled temporarily */}

        {/* Profile Picture Section */}
        <View className="items-center mb-xl">
          <TouchableOpacity
            onPress={handleImagePicker}
            activeOpacity={0.7}
            className={`w-[100px] h-[100px] rounded-full bg-light-surface dark:bg-dark-surface border items-center justify-center overflow-hidden ${
              profileImage ? 'border-transparent' : 'border-light-border dark:border-dark-border'
            }`}
          >
            {profileImage ? (
              <View className="w-full h-full relative">
                <Image
                  source={{ uri: profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setProfileImage(null);
                  }}
                  className="absolute top-0 right-0 w-8 h-8 rounded-full bg-light-background dark:bg-dark-background items-center justify-center border border-light-border dark:border-dark-border"
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
              className="mt-md"
              activeOpacity={0.7}
            >
              <Text className="text-sm text-brand-primary font-medium">
                {t('AddPhoto')}
              </Text>
            </TouchableOpacity>
          )}
          {uploadingImage && (
            <View className="mt-md flex-row items-center gap-sm">
              <ActivityIndicator size="small" color={colors.text.primary} />
              <Text className="text-xs text-txt-secondary dark:text-txt-dark-secondary">
                {t('UploadingImage')}
              </Text>
            </View>
          )}
        </View>

        <View className="gap-lg">
          <View className="gap-md">
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
              <Text className="text-xs font-medium text-semantic-error">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="gap-md mt-sm">
            <TouchableOpacity
              onPress={() => setAcceptTerms(!acceptTerms)}
              className="flex-row items-start gap-md"
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded border-[1.5px] items-center justify-center mt-0.5 ${
                  acceptTerms
                    ? 'border-brand-primary bg-brand-primary'
                    : 'border-light-border dark:border-dark-border bg-transparent'
                }`}
              >
                {acceptTerms && (
                  <View className="w-2.5 h-2.5 rounded-sm bg-txt-inverse" />
                )}
              </View>
              <Text className="flex-1 text-sm font-normal leading-[22px] text-txt-primary dark:text-txt-dark-primary">
                {t('IAgreeTo')}{' '}
                <Text className="font-medium text-brand-primary dark:text-txt-dark-primary">
                  {t('TermsOfService')}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAcceptPrivacy(!acceptPrivacy)}
              className="flex-row items-start gap-md"
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded border-[1.5px] items-center justify-center mt-0.5 ${
                  acceptPrivacy
                    ? 'border-brand-primary bg-brand-primary'
                    : 'border-light-border dark:border-dark-border bg-transparent'
                }`}
              >
                {acceptPrivacy && (
                  <View className="w-2.5 h-2.5 rounded-sm bg-txt-inverse" />
                )}
              </View>
              <Text className="flex-1 text-sm font-normal leading-[22px] text-txt-primary dark:text-txt-dark-primary">
                {t('IAgreeTo')}{' '}
                <Text className="font-medium text-brand-primary dark:text-txt-dark-primary">
                  {t('PrivacyPolicy')}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMarketingOptIn(!marketingOptIn)}
              className="flex-row items-start gap-md"
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded border-[1.5px] items-center justify-center mt-0.5 ${
                  marketingOptIn
                    ? 'border-brand-primary bg-brand-primary'
                    : 'border-light-border dark:border-dark-border bg-transparent'
                }`}
              >
                {marketingOptIn && (
                  <View className="w-2.5 h-2.5 rounded-sm bg-txt-inverse" />
                )}
              </View>
              <Text className="flex-1 text-sm font-normal leading-[22px] text-txt-primary dark:text-txt-dark-primary">
                {t('MarketingOptIn')}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-lg">
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
        </View>
      </KeyboardAwareContainer>

      <NotificationModal
        visible={notification !== null}
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </SafeAreaView>
  );
}
