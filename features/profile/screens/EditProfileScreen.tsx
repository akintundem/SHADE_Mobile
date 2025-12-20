import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { User } from '../../../core/auth/types/auth';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useCurrentUser } from '../../../common/hooks/useCurrentUser';
import { authService } from '../../../core/auth/services/authService';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';

type Props = {
  user: User;
  onBack?: () => void;
  onSave?: (data: { name: string; username: string; bio?: string; location?: string }) => void;
};

export default function EditProfileScreen({ user, onBack, onSave }: Props) {
  const { t } = useI18n();
  const { colors, spacing, typography } = useTheme();
  const { user: currentUser, refetch } = useCurrentUser();
  const settings = currentUser?.settings;
  
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const initialNameRef = useRef(user.name || '');
  const initialBioRef = useRef('');
  const initialLocationRef = useRef('');
  const initialImageRef = useRef<string | null>(null);

  // Load initial values from user settings
  useEffect(() => {
    if (settings) {
      const bioValue = settings.bio || '';
      const locationValue = settings.location || '';
      setBio(bioValue);
      setLocation(locationValue);
      initialBioRef.current = bioValue;
      initialLocationRef.current = locationValue;
    }
    if (currentUser) {
      const nameValue = currentUser.name || '';
      setName(nameValue);
      setUsername(currentUser.username || '');
      initialNameRef.current = nameValue;
      
      if (currentUser.profilePictureUrl) {
        setProfileImage(currentUser.profilePictureUrl);
        initialImageRef.current = currentUser.profilePictureUrl;
      }
    }
  }, [settings, currentUser]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return (
      name.trim() !== initialNameRef.current.trim() ||
      bio.trim() !== initialBioRef.current.trim() ||
      location.trim() !== initialLocationRef.current.trim() ||
      profileImage !== initialImageRef.current
    );
  };

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        t('UnsavedChanges'), 
        t('YouHaveUnsavedChanges'),
        [
          {
            text: t('Discard'),
            style: 'destructive',
            onPress: onBack,
          },
          {
            text: t('Save'),
            onPress: handleSave,
          },
          {
            text: t('Cancel'),
            style: 'cancel',
          },
        ]
      );
    } else {
      onBack?.();
    }
  };

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
          await uploadImageToS3(asset.uri);
        }
      }
    });
  };

  const uploadImageToS3 = async (imageUri: string): Promise<void> => {
    if (!currentUser) return;

    setUploadingImage(true);
    try {
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
      const completeResponse = await authService.completeProfileImageUpload({
        objectKey: uploadUrlResponse.objectKey,
        resourceUrl: uploadUrlResponse.resourceUrl,
      });

      // Update local state with the new URL
      setProfileImage(completeResponse.profilePictureUrl);
      await refetch();
    } catch (error: any) {
      Alert.alert(t('Error'), error?.message || t('FailedToUploadImage'));
      // Revert to original image on error
      if (currentUser?.profilePictureUrl) {
        setProfileImage(currentUser.profilePictureUrl);
      } else {
        setProfileImage(null);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      // Update profile with name and settings (bio, location)
      // Note: username is immutable and cannot be changed
      await authService.updateUserProfile(currentUser.id, {
        name: name.trim(),
        settings: {
          bio: bio.trim() || undefined,
          location: location.trim() || undefined,
        },
      });

      // Refetch user data
      await refetch();

      // Update initial refs to reflect saved state
      initialNameRef.current = name.trim();
      initialBioRef.current = bio.trim();
      initialLocationRef.current = location.trim();
      if (currentUser?.profilePictureUrl) {
        initialImageRef.current = currentUser.profilePictureUrl;
      }

      // Call onSave callback if provided
      onSave?.({ name, username, bio, location });

      Alert.alert(t('Success'), t('ProfileUpdatedSuccessfully'));
      onBack?.();
    } catch (error: any) {
      Alert.alert(t('Error'), error?.message || t('FailedToUpdateProfile'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: spacing.xl, 
          paddingVertical: spacing.md,
          borderBottomWidth: 0.5, 
          borderColor: colors.divider 
        }}>
          <TouchableOpacity onPress={handleBack} style={{ padding: spacing.xs }}>
            <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={{ 
            color: colors.text.primary, 
            fontWeight: typography.weight.semibold, 
            fontSize: typography.size.sm,
            marginLeft: spacing.md,
          }}>
            {t('EditProfile')}
          </Text>
        </View>

        <ScrollView 
          contentContainerStyle={{ paddingBottom: spacing['3xl'], paddingTop: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <View style={{ alignItems: 'center', marginBottom: spacing.xl, paddingTop: spacing.lg }}>
            <TouchableOpacity
              onPress={handleImagePicker}
              disabled={uploadingImage}
              style={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.divider,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={24} color={colors.text.tertiary} strokeWidth={1.5} />
                </View>
              )}
              
              {/* Overlay with camera icon */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.text.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.background,
                }}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <Camera size={12} color={colors.text.inverse} strokeWidth={2} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields - List Style */}
          <View style={{ paddingHorizontal: spacing.xl }}>
            {/* Full Name */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.md,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.divider,
            }}>
              <Text style={{
                color: colors.text.secondary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.medium,
                width: 80,
                marginRight: spacing.md,
              }}>
                {t('Name')}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('EnterYourFullName')}
                placeholderTextColor={colors.text.disabled}
                style={{
                  flex: 1,
                  fontSize: typography.size.sm,
                  color: colors.text.primary,
                  padding: 0,
                }}
              />
            </View>

            {/* Username - Read Only */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.md,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.divider,
            }}>
              <Text style={{
                color: colors.text.secondary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.medium,
                width: 80,
                marginRight: spacing.md,
              }}>
                {t('Username')}
              </Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{
                  color: colors.text.tertiary,
                  fontSize: typography.size.sm,
                  marginRight: spacing.xs / 2,
                }}>
                  @
                </Text>
                <Text style={{
                  fontSize: typography.size.sm,
                  color: colors.text.tertiary,
                }}>
                  {username || t('NotSet')}
                </Text>
              </View>
            </View>

            {/* Bio */}
            <View style={{
              paddingVertical: spacing.md,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.divider,
            }}>
              <View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.medium,
                  width: 80,
                  marginRight: spacing.md,
                }}>
                  {t('Bio')}
                </Text>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder={t('TellPeopleAboutYourself')}
                    placeholderTextColor={colors.text.disabled}
                    multiline
                    numberOfLines={3}
                    maxLength={150}
                    style={{
                      fontSize: typography.size.sm,
                      color: colors.text.primary,
                      minHeight: 60,
                      textAlignVertical: 'top',
                      padding: 0,
                    }}
                  />
                  <Text style={{
                    color: colors.text.disabled,
                    fontSize: typography.size.xs,
                    marginTop: spacing.xs / 2,
                    alignSelf: 'flex-end',
                  }}>
                    {(bio?.length || 0)}/150
                  </Text>
                </View>
              </View>
            </View>

            {/* Location */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.md,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.divider,
            }}>
              <Text style={{
                color: colors.text.secondary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.medium,
                width: 80,
                marginRight: spacing.md,
              }}>
                {t('Location')}
              </Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder={t('CityCountry')}
                placeholderTextColor={colors.text.disabled}
                style={{
                  flex: 1,
                  fontSize: typography.size.sm,
                  color: colors.text.primary,
                  padding: 0,
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
