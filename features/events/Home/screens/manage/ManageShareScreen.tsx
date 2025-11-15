import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Share2, RefreshCcw } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../../shared/services/eventService';
import { EventShareRequest, EventShareResponse, EventSharingOptionsResponse } from '../../../../../shared/types';

type RouteParams = { eventId: string };

const CHANNELS: EventShareRequest['channel'][] = ['EMAIL', 'LINK', 'SOCIAL'];

const ManageShareScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [options, setOptions] = useState<EventSharingOptionsResponse | null>(null);
  const [shareResult, setShareResult] = useState<EventShareResponse | null>(null);
  const [channel, setChannel] = useState<EventShareRequest['channel']>('LINK');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeQr, setIncludeQr] = useState(true);
  const [expiration, setExpiration] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadOptions = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await eventService.getSharingOptions(params.eventId);
      setOptions(data);
      if (data.availableChannels?.length) {
        setChannel(data.availableChannels[0] as EventShareRequest['channel']);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to load sharing options right now.');
      console.warn(error);
    } finally {
      setRefreshing(false);
    }
  }, [params.eventId]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const disabled = useMemo(() => {
    if (channel === 'EMAIL') {
      return recipients.trim().length === 0;
    }
    return false;
  }, [channel, recipients]);

  const handleShare = useCallback(async () => {
    if (disabled) return;
    setLoading(true);
    try {
      const payload: EventShareRequest = {
        channel,
        message: message || undefined,
        includeEventDetails: includeDetails,
        includeQRCode: includeQr,
        expirationDate: expiration || undefined,
        recipients:
          channel === 'EMAIL'
            ? recipients
                .split(/[,;\n]+/)
                .map(item => item.trim())
                .filter(Boolean)
            : undefined,
      };
      const response = await eventService.shareEvent(params.eventId, payload);
      setShareResult(response);
      Alert.alert('Success', 'Your event has been shared.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Failed to share event.');
      console.warn(error);
    } finally {
      setLoading(false);
    }
  }, [channel, disabled, expiration, includeDetails, includeQr, message, params.eventId, recipients]);

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
            Share Event
          </Text>
        </View>
        <TouchableOpacity onPress={loadOptions} disabled={refreshing} style={{ padding: spacing.xs }}>
          <RefreshCcw size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>CHANNEL</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {CHANNELS.map(item => {
              const isActive = channel === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setChannel(item)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.full,
                    borderWidth: 1,
                    borderColor: colors.text.primary,
                    backgroundColor: isActive ? colors.text.primary : colors.background,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? colors.background : colors.text.primary,
                      fontWeight: typography.weight.medium,
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {options?.availableChannels && options.availableChannels.length === 0 ? (
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
              No channels are currently available for this event.
            </Text>
          ) : null}
        </View>

        {channel === 'EMAIL' ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>RECIPIENTS</Text>
            <TextInput
              value={recipients}
              onChangeText={setRecipients}
              style={{
                borderWidth: 1,
                borderColor: colors.text.primary,
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                color: colors.text.primary,
                minHeight: 96,
                textAlignVertical: 'top',
              }}
              multiline
              placeholder="guest@example.com, speaker@example.com"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>MESSAGE</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              color: colors.text.primary,
              minHeight: 96,
              textAlignVertical: 'top',
            }}
            multiline
            placeholder={options?.defaultMessage ?? 'Add a personal note'}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <TouchableOpacity onPress={() => setIncludeDetails(prev => !prev)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: colors.text.primary,
                backgroundColor: includeDetails ? colors.text.primary : colors.background,
              }}
            />
            <Text style={{ color: colors.text.primary }}>Include event details</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIncludeQr(prev => !prev)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: colors.text.primary,
                backgroundColor: includeQr ? colors.text.primary : colors.background,
              }}
            />
            <Text style={{ color: colors.text.primary }}>Include QR code</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>EXPIRATION (OPTIONAL)</Text>
          <TextInput
            value={expiration}
            onChangeText={setExpiration}
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
            placeholder="2025-01-01T12:00:00Z"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          disabled={loading || disabled}
          onPress={handleShare}
          style={{
            paddingVertical: spacing.md,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.text.primary,
            backgroundColor: disabled ? colors.background : colors.text.primary,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.sm,
          }}
        >
          <Share2 size={18} color={disabled ? colors.text.secondary : colors.background} />
          <Text
            style={{
              color: disabled ? colors.text.secondary : colors.background,
              fontWeight: typography.weight.semibold,
              textTransform: 'uppercase',
            }}
          >
            {loading ? 'Sharing…' : 'Share'}
          </Text>
        </TouchableOpacity>

        {shareResult ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              gap: spacing.xs,
            }}
          >
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
              Last share summary
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
              Channel: {shareResult.channel}
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
              Recipients: {shareResult.recipientCount}
            </Text>
            {shareResult.shareLink ? (
              <Text style={{ color: colors.text.primary, fontSize: typography.size.sm }}>
                Link: {shareResult.shareLink}
              </Text>
            ) : null}
            {shareResult.expirationDate ? (
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                Expires: {shareResult.expirationDate}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageShareScreen;

