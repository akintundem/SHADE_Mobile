import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, ChevronLeft, XCircle } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import Button from '../../../../common/components/ui/Button';
import { collaborationService } from '../../../../core/collaboration/services/collaboration';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { EventCollaboratorResponse } from '../../../../core/collaboration/types/collaboration';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { UserAccessStatus } from '../../../../core/events/types/event';
import type { RootStackParamList } from '../../../../types/navigation';
import type { RootStackNavigationProp } from '../../../../navigation/types';

export function AcceptInviteByTokenScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'AcceptInviteByToken'>>();
  const { token } = route.params;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<EventCollaboratorResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptToken = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setErrorMessage(t('InvalidInviteToken'));
      return;
    }

    setStatus('loading');
    try {
      const response = await collaborationService.acceptInviteByToken(token);
      setResult(response);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      const message = err instanceof Error ? err.message : t('FailedToAcceptInvite');
      setErrorMessage(message);
      ErrorHandler.handle(err, 'acceptInviteByToken');
    }
  }, [token, t]);

  useEffect(() => {
    acceptToken();
  }, [acceptToken]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  }, [navigation]);

  const handleGoToEvent = useCallback(() => {
    if (result?.eventId) {
      navigation.replace('EventAdmin', {
        eventId: result.eventId,
        userContext: {
          accessStatus: UserAccessStatus.COLLABORATOR,
          isOwner: false,
          isCollaborator: true,
          eventRole: result.role ?? null,
        },
      });
    }
  }, [navigation, result]);

  const bottomGutter = Math.max(16, Math.min(insets.bottom, 20));

  if (status === 'loading') {
    return <LoadingOverlay visible={true} message={t('AcceptingInvite')} />;
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={t('CollaboratorInvite')}
        leftAction={{
          icon: ChevronLeft,
          onPress: handleGoBack,
          size: 32,
        }}
      />

      <View className="flex-1 items-center justify-center px-2xl" style={{ paddingBottom: bottomGutter }}>
        {status === 'success' && (
          <View className="items-center">
            <CheckCircle size={56} color={colors.semantic.success} strokeWidth={1.5} />
            <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary mt-xl mb-sm text-center">
              {t('InviteAccepted')}
            </Text>
            <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary text-center leading-relaxed mb-2xl">
              {t('InviteAcceptedDescription')}
            </Text>
            {result?.eventId && (
              <Button variant="primary" size="lg" onPress={handleGoToEvent}>
                {t('GoToEvent')}
              </Button>
            )}
          </View>
        )}

        {status === 'error' && (
          <View className="items-center">
            <XCircle size={56} color={colors.semantic.error} strokeWidth={1.5} />
            <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary mt-xl mb-sm text-center">
              {t('InviteFailed')}
            </Text>
            <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary text-center leading-relaxed mb-2xl">
              {errorMessage || t('FailedToAcceptInvite')}
            </Text>
            <View className="gap-md w-full">
              <Button variant="primary" size="lg" onPress={acceptToken} disabled={status === 'loading'}>
                {t('TryAgain')}
              </Button>
              <Button variant="outline" size="lg" onPress={handleGoBack}>
                {t('GoBack')}
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
