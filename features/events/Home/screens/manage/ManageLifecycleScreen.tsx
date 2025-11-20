import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Copy, Archive, RotateCcw } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../../shared/services/eventService';

type RouteParams = { eventId: string };

const ManageLifecycleScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [duplicateName, setDuplicateName] = useState('');
  const [archiveReason, setArchiveReason] = useState('');
  const [busy, setBusy] = useState(false);

  const handleDuplicate = async () => {
    setBusy(true);
    try {
      const result = await eventService.duplicateEvent(params.eventId, {
        newEventName: duplicateName || undefined,
      });
      Alert.alert('Success', `Event duplicated with ID ${result.id}.`);
      setDuplicateName('');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to duplicate event.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  };

  const handleArchive = async () => {
    setBusy(true);
    try {
      await eventService.archiveEvent(params.eventId, archiveReason || undefined);
      Alert.alert('Archived', 'Event archived successfully.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to archive event.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      await eventService.restoreEvent(params.eventId);
      Alert.alert('Restored', 'Event restored successfully.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to restore event.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  };

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
            Lifecycle
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
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
            Duplicate event
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
            Create a copy of this event for a future run. Content, media, and settings can be reviewed after duplication.
          </Text>
          <TextInput
            value={duplicateName}
            onChangeText={setDuplicateName}
            placeholder="New event name (optional)"
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
          <TouchableOpacity
            onPress={handleDuplicate}
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
              backgroundColor: colors.text.primary,
            }}
          >
            <Copy size={18} color={colors.background} />
            <Text style={{ color: colors.background, fontWeight: typography.weight.semibold }}>
              Duplicate event
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
            Archive or restore
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
            Archive events you no longer need in active circulation. Archived events can be restored later.
          </Text>
          <TextInput
            value={archiveReason}
            onChangeText={setArchiveReason}
            placeholder="Reason for archiving (optional)"
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
          <TouchableOpacity
            onPress={handleArchive}
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
              backgroundColor: colors.text.primary,
            }}
          >
            <Archive size={18} color={colors.background} />
            <Text style={{ color: colors.background, fontWeight: typography.weight.semibold }}>
              Archive event
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRestore}
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
              backgroundColor: colors.text.primary,
            }}
          >
            <RotateCcw size={18} color={colors.background} />
            <Text style={{ color: colors.background, fontWeight: typography.weight.semibold }}>
              Restore event
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageLifecycleScreen;

