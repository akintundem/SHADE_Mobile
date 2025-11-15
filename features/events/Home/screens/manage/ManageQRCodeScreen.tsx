import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, QrCode, RefreshCcw, RotateCcw, XCircle, FilePlus2 } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../../shared/services/eventService';
import { EventQRCodeResponse } from '../../../../../shared/types';

type RouteParams = { eventId: string };

const ManageQRCodeScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [info, setInfo] = useState<EventQRCodeResponse | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await eventService.getEventQRCode(params.eventId);
      setInfo(data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load QR code.');
      console.warn(error);
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const perform = useCallback(
    async (action: 'generate' | 'regenerate' | 'disable') => {
      setIsBusy(true);
      try {
        if (action === 'generate') {
          await eventService.generateEventQRCode(params.eventId);
        } else if (action === 'regenerate') {
          await eventService.regenerateEventQRCode(params.eventId);
        } else {
          await eventService.disableEventQRCode(params.eventId);
        }
        await load();
        Alert.alert('Success', `QR code ${action === 'disable' ? 'disabled' : 'updated'}.`);
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Action failed.');
        console.warn(error);
      } finally {
        setIsBusy(false);
      }
    },
    [load, params.eventId],
  );

  const imageUri = (() => {
    if (!info) return undefined;
    if (info.qrCodeImageBase64) {
      return info.qrCodeImageBase64.startsWith('data:')
        ? info.qrCodeImageBase64
        : `data:image/png;base64,${info.qrCodeImageBase64}`;
    }
    if (info.qrCodeImageUrl) return info.qrCodeImageUrl;
    if (info.qrCode) return info.qrCode;
    return undefined;
  })();

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
            Event QR Code
          </Text>
        </View>
        <TouchableOpacity onPress={load} disabled={isBusy} style={{ padding: spacing.xs }}>
          <RefreshCcw size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 220,
              height: 220,
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              borderColor: colors.text.primary,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.background,
            }}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%', borderRadius: borderRadius.xl }}
                resizeMode="contain"
              />
            ) : (
              <QrCode size={120} color={colors.text.secondary} />
            )}
          </View>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
            {info?.qrCodeEnabled ? 'QR code is active' : 'QR code disabled'}
          </Text>
          {info?.qrCode ? (
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.sm,
                textAlign: 'center',
              }}
            >
              {info.qrCode}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: spacing.md }}>
          <ActionButton
            icon={FilePlus2}
            label="Generate"
            onPress={() => perform('generate')}
            disabled={isBusy}
          />
          <ActionButton
            icon={RotateCcw}
            label="Regenerate"
            onPress={() => perform('regenerate')}
            disabled={isBusy}
          />
          <ActionButton
            icon={XCircle}
            label="Disable"
            onPress={() => perform('disable')}
            disabled={isBusy}
            destructive
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  onPress,
  disabled,
  destructive,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const color = destructive ? colors.error?.text ?? '#ef4444' : colors.text.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: disabled ? colors.background : 'transparent',
      }}
    >
      <Icon size={18} color={color} />
      <Text style={{ color, fontWeight: typography.weight.semibold, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default ManageQRCodeScreen;

