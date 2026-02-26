import { useState, useCallback, useMemo } from 'react';
import { authService } from '../../../core/auth/services/authService';
import { AuthError, AuthErrorCode } from '../../../core/auth/errors/AuthError';
import { mapToUser } from '../../../core/auth/utils/authUtils';
import { User, JitSignupRequest } from '../../../core/auth/types/auth';
import { OnboardingErrorCode, OnboardingFormData } from '../types';
import { getImageUrl } from '../../../config/appConfig';

export interface UseOnboardingState {
  loading: boolean;
  uploadingImage: boolean;
  error: OnboardingErrorCode | null;
}

export interface UseOnboardingActions {
  completeOnboarding: (
    userEmail: string,
    formData: OnboardingFormData,
  ) => Promise<User | null>;
  uploadProfileImage: (imageUri: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export interface UseOnboardingReturn extends UseOnboardingState {
  actions: UseOnboardingActions;
}

/** Map structured error codes to UI-layer onboarding codes. */
function toOnboardingError(error: unknown): OnboardingErrorCode {
  const code = AuthError.codeOf(error);
  switch (code) {
    case AuthErrorCode.USERNAME_TAKEN:
      return 'USERNAME_TAKEN';
    case AuthErrorCode.EMAIL_NOT_VERIFIED:
      return 'EMAIL_NOT_VERIFIED';
    case AuthErrorCode.ONBOARDING_EMAIL_MISMATCH:
    case AuthErrorCode.VALIDATION_ERROR:
      return 'EMAIL_MISMATCH';
    default:
      return 'ONBOARDING_FAILED';
  }
}

export function useOnboarding(): UseOnboardingReturn {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<OnboardingErrorCode | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setLoading(false);
    setUploadingImage(false);
    setError(null);
  }, []);

  const uploadProfileImage = useCallback(async (imageUri: string): Promise<boolean> => {
    try {
      setUploadingImage(true);

      const fileExtension = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `profile-${Date.now()}.${fileExtension}`;
      const contentType = `image/${
        fileExtension === 'png' ? 'png' : fileExtension === 'gif' ? 'gif' : 'jpeg'
      }`;

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

      // Step 3: Complete the image upload
      await authService.completeProfileImageUpload({
        objectKey: uploadUrlResponse.objectKey,
        resourceUrl: uploadUrlResponse.resourceUrl,
      });

      return true;
    } catch {
      setError('IMAGE_UPLOAD_FAILED');
      return false;
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const completeOnboarding = useCallback(async (
    userEmail: string,
    formData: OnboardingFormData,
  ): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);

      const signupRequest: JitSignupRequest = {
        email: userEmail,
        username: formData.username.trim(),
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        marketingOptIn: formData.marketingOptIn,
        acceptTerms: formData.acceptTerms,
        acceptPrivacy: formData.acceptPrivacy,
      };

      let session = await authService.completeSignup(signupRequest);
      let updatedUser = session.user;

      // Upload image after user is created (if selected)
      if (formData.profileImage) {
        const imageUploaded = await uploadProfileImage(formData.profileImage);
        if (!imageUploaded) return null; // error already set by uploadProfileImage

        // Refresh session to get updated profile picture URL
        session = await authService.getAuthSession();
        updatedUser = session.user;
      }

      return mapToUser(updatedUser);
    } catch (e: unknown) {
      setError(toOnboardingError(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, [uploadProfileImage]);

  const actions = useMemo<UseOnboardingActions>(
    () => ({ completeOnboarding, uploadProfileImage, clearError, reset }),
    [completeOnboarding, uploadProfileImage, clearError, reset],
  );

  return { loading, uploadingImage, error, actions };
}
