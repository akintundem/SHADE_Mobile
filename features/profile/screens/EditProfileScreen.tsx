import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ArrowLeft, Camera, X } from 'lucide-react-native';
import { User, LocationSearchResponse, LocationDto } from '../../../core/auth/types/auth';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useCurrentUser } from '../../auth/hooks';
import { authService } from '../../../core/auth/services/authService';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';

type Props = {
  user: User;
  onBack?: () => void;
  onSave?: (data: { name: string; username: string; bio?: string; location?: string }) => void;
};

export default function EditProfileScreen({ user, onBack, onSave }: Props) {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const { user: currentUser, refetch } = useCurrentUser();
  const settings = currentUser?.settings;

  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSearchResponse[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResponse | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const locationSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationSearchAbortRef = useRef<AbortController | null>(null);

  const initialNameRef = useRef(user.name || '');
  const initialBioRef = useRef('');
  const initialLocationIdRef = useRef<string | null>(null);
  const initialImageRef = useRef<string | null>(null);

  useEffect(() => {
    if (settings) {
      const bioValue = settings.bio || '';
      setBio(bioValue);
      initialBioRef.current = bioValue;

      if (settings.location?.locationId) {
        initialLocationIdRef.current = settings.location.locationId;
      }
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

  useEffect(() => {
    if (!locationSearchQuery || locationSearchQuery.trim().length === 0) {
      locationSearchDebounceRef.current && clearTimeout(locationSearchDebounceRef.current);
      locationSearchAbortRef.current?.abort();
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      setIsSearchingLocation(false);
      return;
    }

    setIsSearchingLocation(true);
    setShowLocationSuggestions(true);

    if (locationSearchDebounceRef.current) {
      clearTimeout(locationSearchDebounceRef.current);
    }

    locationSearchDebounceRef.current = setTimeout(async () => {
      try {
        locationSearchAbortRef.current?.abort();
        const controller = new AbortController();
        locationSearchAbortRef.current = controller;

        const response = await authService.searchLocations(locationSearchQuery.trim(), {
          page: 0,
          size: 10,
        });

        if (!controller.signal.aborted) {
          setLocationSuggestions(response.content || []);
          setIsSearchingLocation(false);
        }
      } catch (error: any) {
        if (!error?.message?.includes('aborted')) {
          console.error('Location search error:', error);
          setLocationSuggestions([]);
        }
        setIsSearchingLocation(false);
      }
    }, 300);

    return () => {
      if (locationSearchDebounceRef.current) {
        clearTimeout(locationSearchDebounceRef.current);
      }
      locationSearchAbortRef.current?.abort();
    };
  }, [locationSearchQuery]);

  const handleLocationSelect = useCallback((location: LocationSearchResponse) => {
    setSelectedLocation(location);
    setLocationSearchQuery(location.displayName);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  }, []);

  const handleLocationClear = useCallback(() => {
    setSelectedLocation(null);
    setLocationSearchQuery('');
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  }, []);

  const hasUnsavedChanges = useCallback(() => {
    const currentLocationId = selectedLocation?.id || null;
    return (
      name.trim() !== initialNameRef.current.trim() ||
      bio.trim() !== initialBioRef.current.trim() ||
      currentLocationId !== initialLocationIdRef.current ||
      profileImage !== initialImageRef.current
    );
  }, [name, bio, selectedLocation, profileImage]);

  const handleSave = useCallback(async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const hadLocation = initialLocationIdRef.current !== null;
      const locationUpdate: LocationDto | null | undefined = selectedLocation
        ? { locationId: selectedLocation.id }
        : hadLocation
        ? null
        : undefined;

      await authService.updateUserProfile(currentUser.id, {
        name: name.trim(),
        settings: {
          bio: bio.trim() || undefined,
          ...(locationUpdate !== undefined && { location: locationUpdate }),
        },
      });

      await refetch();

      initialNameRef.current = name.trim();
      initialBioRef.current = bio.trim();
      initialLocationIdRef.current = selectedLocation?.id || null;
      if (currentUser?.profilePictureUrl) {
        initialImageRef.current = currentUser.profilePictureUrl;
      }

      onSave?.({
        name,
        username,
        bio,
        location: selectedLocation?.displayName || undefined,
      });

      Alert.alert(t('Success'), t('ProfileUpdatedSuccessfully'));
      onBack?.();
    } catch (error: any) {
      Alert.alert(t('Error'), t('FailedToUpdateProfile'));
    } finally {
      setIsSaving(false);
    }
  }, [bio, currentUser, name, onBack, onSave, refetch, selectedLocation, t, username]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges()) {
      Alert.alert(t('UnsavedChanges'), t('YouHaveUnsavedChanges'), [
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
      ]);
    } else {
      onBack?.();
    }
  }, [handleSave, hasUnsavedChanges, onBack, t]);

  const uploadImageToS3 = useCallback(
    async (imageUri: string): Promise<void> => {
      if (!currentUser) return;

      setUploadingImage(true);
      try {
        const fileExtension = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `profile-${Date.now()}.${fileExtension}`;
        const contentType = `image/${fileExtension === 'png' ? 'png' : fileExtension === 'gif' ? 'gif' : 'jpeg'}`;

        const uploadUrlResponse = await authService.getProfileImageUploadUrl({
          fileName,
          contentType,
        });

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

        const completeResponse = await authService.completeProfileImageUpload({
          objectKey: uploadUrlResponse.objectKey,
          resourceUrl: uploadUrlResponse.resourceUrl,
        });

        setProfileImage(completeResponse.profilePictureUrl);
        await refetch();
      } catch (error: any) {
        Alert.alert(t('Error'), t('FailedToUploadImage'));
        if (currentUser?.profilePictureUrl) {
          setProfileImage(currentUser.profilePictureUrl);
        } else {
          setProfileImage(null);
        }
      } finally {
        setUploadingImage(false);
      }
    },
    [currentUser, refetch, t]
  );

  const handleImagePicker = useCallback(() => {
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
  }, [uploadImageToS3]);

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-row items-center px-xl py-md">
          <TouchableOpacity onPress={handleBack} className="p-xs">
            <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text className="ml-md text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {t('EditProfile')}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="pt-[20px] pb-8">
            <View className="items-center mb-xl pt-lg">
            <TouchableOpacity
              onPress={handleImagePicker}
              disabled={uploadingImage}
              className="relative h-20 w-20 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border items-center justify-center overflow-hidden"
            >
              {profileImage ? (
                <Image source={{ uri: getImageUrl(profileImage) ?? profileImage ?? '' }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="items-center justify-center">
                  <Camera size={24} color={colors.text.tertiary} strokeWidth={1.5} />
                </View>
              )}

              <View
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full items-center justify-center border-2 bg-txt-primary dark:bg-txt-dark-primary border-light-background dark:border-dark-background"
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <Camera size={12} color={colors.text.inverse} strokeWidth={2} />
                )}
              </View>
            </TouchableOpacity>
            </View>

            <View className="px-xl">
              <View className="flex-row items-center py-md ">
                <Text className="w-20 mr-md text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary">
                  {t('Name')}
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t('EnterYourFullName')}
                  placeholderTextColor={colors.text.disabled}
                  className="flex-1 text-sm text-txt-primary dark:text-txt-dark-primary p-0"
                />
              </View>

            <View className="flex-row items-center py-md ">
              <Text className="w-20 mr-md text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary">
                {t('Username')}
              </Text>
              <View className="flex-1 flex-row items-center">
                <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mr-[2px]">@</Text>
                <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                  {username || t('NotSet')}
                </Text>
              </View>
            </View>

            <View className="py-md ">
              <View className="flex-row mb-xs">
                <Text className="w-20 mr-md text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary">
                  {t('Bio')}
                </Text>
                <View className="flex-1">
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder={t('TellPeopleAboutYourself')}
                    placeholderTextColor={colors.text.disabled}
                    multiline
                    numberOfLines={3}
                    maxLength={150}
                    className="text-sm text-txt-primary dark:text-txt-dark-primary min-h-[60px] p-0"
                    textAlignVertical="top"
                  />
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs self-end">
                    {(bio?.length || 0)}/150
                  </Text>
                </View>
              </View>
            </View>

            <View className="py-md ">
              <View className="flex-row items-center mb-xs">
                <Text className="w-20 mr-md text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary">
                  {t('Location')}
                </Text>
                <View className="flex-1 relative">
                  <View className="flex-row items-center">
                    <TextInput
                      value={locationSearchQuery}
                      onChangeText={setLocationSearchQuery}
                      placeholder={t('CityCountry')}
                      placeholderTextColor={colors.text.disabled}
                      className="flex-1 text-sm text-txt-primary dark:text-txt-dark-primary p-0"
                      onFocus={() => {
                        if (locationSearchQuery && locationSuggestions.length > 0) {
                          setShowLocationSuggestions(true);
                        }
                      }}
                    />
                    {locationSearchQuery.length > 0 ? (
                      <TouchableOpacity onPress={handleLocationClear} className="p-xs ml-xs">
                        <X size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                      </TouchableOpacity>
                    ) : null}
                    {isSearchingLocation ? (
                      <View className="ml-1">
                        <ActivityIndicator size="small" color={colors.text.tertiary} />
                      </View>
                    ) : null}
                  </View>

                  {showLocationSuggestions && locationSuggestions.length > 0 ? (
                    <View
                      className="absolute left-0 right-0 top-8 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg overflow-hidden max-h-[200px]"
                      style={{
                        zIndex: 1000,
                        shadowColor: isDark ? colors.text.inverse : colors.text.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5,
                      }}
                    >
                      <FlatList
                        data={locationSuggestions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onPress={() => handleLocationSelect(item)}
                            className="px-md py-sm "
                          >
                            <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                              {item.displayName}
                            </Text>
                            {(item.city || item.state || item.country) ? (
                              <Text className="text-xs text-txt-secondary dark:text-txt-dark-secondary mt-[2px]">
                                {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                              </Text>
                            ) : null}
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View className="mt-xl">
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className={`w-full h-12 rounded-full bg-brand-primary items-center justify-center ${isSaving ? 'opacity-60' : 'opacity-100'}`}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <Text className="text-base font-semibold text-txt-inverse">{t('Save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
