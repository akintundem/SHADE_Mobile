import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, ImageIcon, Upload, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../../shared/services/eventService';
import { EventMediaResponse, EventMediaUploadRequest } from '../../../../../shared/types';

type RouteParams = { eventId: string };

const ManageMediaScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [media, setMedia] = useState<EventMediaResponse[]>([]);
  const [fileName, setFileName] = useState('');
  const [contentType, setContentType] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pendingUpload, setPendingUpload] =
    useState<(EventMediaUploadRequest & { uploadUrl?: string; expiresAt?: string }) | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await eventService.getEventMedia(params.eventId);
      setMedia(data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load media library.');
      console.warn(error);
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const buildPayload = (): EventMediaUploadRequest => ({
    fileName,
    contentType,
    fileSize: fileSize ? Number(fileSize) : undefined,
    category: category || undefined,
    description: description || undefined,
  });

  const requestUpload = useCallback(
    async (target: 'media' | 'cover') => {
      if (!fileName || !contentType) {
        Alert.alert('Missing data', 'File name and content type are required.');
        return;
      }
      setBusy(true);
      try {
        const payload = buildPayload();
        const response =
          target === 'media'
            ? await eventService.uploadEventMedia(params.eventId, payload)
            : await eventService.updateEventCoverImage(params.eventId, payload);
        setPendingUpload({ ...payload, ...response });
        Alert.alert(
          'Upload prepared',
          'Use the generated presigned URL to complete the upload from your client or automation.',
        );
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to request upload.');
        console.warn(error);
      } finally {
        setBusy(false);
      }
    },
    [buildPayload, contentType, fileName, params.eventId],
  );

  const removeMedia = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        await eventService.deleteEventMedia(params.eventId, id);
        setMedia(current => current.filter(item => item.id !== id));
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to delete media.');
        console.warn(error);
      } finally {
        setBusy(false);
      }
    },
    [params.eventId],
  );

  const removeCover = useCallback(async () => {
    setBusy(true);
    try {
      await eventService.removeEventCoverImage(params.eventId);
      Alert.alert('Success', 'Cover image removed.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to remove cover image.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  }, [params.eventId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.lg,
              textTransform: 'uppercase',
            }}
          >
            Media & Assets
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>FILE NAME</Text>
          <TextInput
            value={fileName}
            onChangeText={setFileName}
            placeholder="cover.jpg"
            placeholderTextColor={colors.text.tertiary}
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>CONTENT TYPE</Text>
          <TextInput
            value={contentType}
            onChangeText={setContentType}
            placeholder="image/jpeg"
            placeholderTextColor={colors.text.tertiary}
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>FILE SIZE (BYTES)</Text>
          <TextInput
            value={fileSize}
            onChangeText={setFileSize}
            placeholder="204800"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>CATEGORY</Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="GALLERY"
            placeholderTextColor={colors.text.tertiary}
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>DESCRIPTION</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            placeholderTextColor={colors.text.tertiary}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              color: colors.text.primary,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />
        </View>

        <TouchableOpacity
          onPress={() => requestUpload('media')}
          disabled={busy}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.text.primary,
          }}
        >
          <Upload size={18} color={colors.text.primary} />
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
            Request media upload
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => requestUpload('cover')}
          disabled={busy}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.text.primary,
          }}
        >
          <ImageIcon size={18} color={colors.text.primary} />
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
            Request cover upload
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={removeCover}
          disabled={busy}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.error?.text ?? '#ef4444',
          }}
        >
          <Trash2 size={18} color={colors.error?.text ?? '#ef4444'} />
          <Text style={{ color: colors.error?.text ?? '#ef4444', fontWeight: typography.weight.semibold }}>
            Remove cover image
          </Text>
        </TouchableOpacity>

        {pendingUpload ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              gap: spacing.xs,
            }}
          >
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
              Presigned upload
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
              URL: {pendingUpload.uploadUrl ?? '—'}
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
              Expires: {pendingUpload.expiresAt ?? '—'}
            </Text>
          </View>
        ) : null}

        <View style={{ gap: spacing.md }}>
          {media.map(item => (
            <View
              key={item.id}
              style={{
                borderWidth: 1,
                borderColor: colors.text.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                gap: spacing.xs,
              }}
            >
              <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
                {item.fileName}
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                {item.contentType}
              </Text>
              {item.description ? (
                <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                  {item.description}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={() => removeMedia(item.id)}
                disabled={busy}
                style={{ marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
              >
                <Trash2 size={16} color={colors.error?.text ?? '#ef4444'} />
                <Text style={{ color: colors.error?.text ?? '#ef4444' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageMediaScreen;

