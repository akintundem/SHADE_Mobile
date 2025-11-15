import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, ClipboardList, RefreshCcw } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../../shared/services/eventService';
import { EventHealthCheckResponse, EventValidationResponse } from '../../../../../shared/types';

type RouteParams = { eventId: string };

const ManageIntegrityScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [validation, setValidation] = useState<EventValidationResponse | null>(null);
  const [health, setHealth] = useState<EventHealthCheckResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [validationData, healthData] = await Promise.all([
        eventService.validateEvent(params.eventId),
        eventService.getEventHealth(params.eventId),
      ]);
      setValidation(validationData);
      setHealth(healthData);
    } catch (error) {
      Alert.alert('Error', 'Unable to load validation details.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

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
            Validation & Health
          </Text>
        </View>
        <TouchableOpacity onPress={load} disabled={busy} style={{ padding: spacing.xs }}>
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
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <ClipboardList size={20} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
              Validation report
            </Text>
          </View>
          <Text style={{ color: colors.text.secondary }}>
            Score: {validation?.validationScore ?? '—'}
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            Valid: {validation?.isValid ? 'Yes' : 'No'}
          </Text>
          {validation?.errors?.length ? (
            <View>
              <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
                Errors
              </Text>
              {validation.errors.map(item => (
                <Text key={item} style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={{ color: colors.text.secondary }}>No blocking issues detected.</Text>
          )}
          {validation?.warnings?.length ? (
            <View>
              <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
                Warnings
              </Text>
              {validation.warnings.map(item => (
                <Text key={item} style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <ClipboardList size={20} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
              Health check
            </Text>
          </View>
          <Text style={{ color: colors.text.secondary }}>
            Status: {health?.healthStatus ?? '—'}
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            Score: {health?.healthScore ?? '—'}
          </Text>
          {health?.issues?.length ? (
            <View>
              <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
                Issues
              </Text>
              {health.issues.map(item => (
                <Text key={item} style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={{ color: colors.text.secondary }}>No issues reported.</Text>
          )}
          {health?.recommendations?.length ? (
            <View>
              <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
                Recommendations
              </Text>
              {health.recommendations.map(item => (
                <Text key={item} style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageIntegrityScreen;

