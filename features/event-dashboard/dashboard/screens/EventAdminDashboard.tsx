import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  Calendar,
  CalendarClock,
  ChevronLeft,
  DollarSign,
  Edit2,
  File,
  Hash,
  Image as ImageIcon,
  MapPin,
  Ticket,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import {
  EventAccessType,
  EventData,
  EventMediaUploadRequest,
  TicketTypeSummary,
  UserEventContext,
  isFullEventResponse,
} from '../../../../core/events/types/event';
import { eventService } from '../../../../core/events/services/event';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import EventLocationHeader from '../components/EventLocationHeader';
import { EditEventDetailsModal } from '../components/EditEventDetailsModal';
import { ManageMenuItem } from '../components/ManageMenuItem';
import { TimelineSection } from '../../timeline/components/TimelineSection';
import { EventDashboardProvider, useEventDashboard } from '../../context';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../../config/appConfig';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

type Params = {
  eventId?: string;
  title?: string;
  imageUrl?: string;
  accessType?: EventAccessType | null;
  userContext?: UserEventContext | null;
  ticketTypes?: TicketTypeSummary[] | null;
  eventData?: EventData | null;
};

function EventAdminDashboardContent({ params }: { params: Params }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const iconColor = colors.text.primary;
  const overlayTextColor = isDark ? colors.text.primary : colors.text.inverse;

  const {
    event,
    eventData,
    loading,
    error,
    refresh,
    updateEvent,
    eventId,
    userContext,
    permissions,
  } = useEventDashboard();

  const {
    goBack,
    goToBudget,
    goToCollaboration,
    goToRSVP,
    goToTickets,
    goToTimeline,
    goToFeeds,
    goToMediaLibrary,
    goToAssets,
    goToReminders,
  } = useEventDashboardFlow(eventId, userContext);

  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);

  const venueCoordinates = useMemo(() => {
    if (eventData && isFullEventResponse(eventData) && eventData.venue) {
      const latitude = eventData.venue?.latitude;
      const longitude = eventData.venue?.longitude;
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        return { latitude, longitude };
      }
    }
    return null;
  }, [eventData]);

  const formattedVenueAddress = useMemo(() => {
    if (eventData && isFullEventResponse(eventData) && eventData.venue) {
      const venue = eventData.venue;
      const parts = [venue.address, venue.city, venue.state, venue.country].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : null;
    }
    return null;
  }, [eventData]);

  const formattedStart = event?.startDateTime
    ? dateUtils.formatDate(event.startDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;
  const formattedEnd = event?.endDateTime
    ? dateUtils.formatDate(event.endDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;
  const formattedRegistration = event?.registrationDeadline
    ? dateUtils.formatDate(event.registrationDeadline, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;

  const bottomGutter = Math.max(16, Math.min(insets.bottom, 20));

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await refresh(true);
    setRefreshing(false);
  }, [eventId, refresh]);

  const handleEditCoverImage = useCallback(() => {
    if (!eventId || isUpdatingCover) {
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      async response => {
        if (response.didCancel || response.errorMessage) {
          if (response.errorMessage) {
            Alert.alert(t('ImageUploadFailed'), response.errorMessage, [{ text: t('OK') }]);
          }
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          return;
        }

        try {
          setIsUpdatingCover(true);

          const coverUploadRequest: EventMediaUploadRequest = {
            fileName: asset.fileName || 'cover.jpg',
            contentType: asset.type || 'image/jpeg',
            category: 'cover',
            isPublic: true,
          };

          const presignedResponse = await eventService.updateCoverImage(eventId, coverUploadRequest);

          const imageResponse = await fetch(asset.uri);
          const blob = await imageResponse.blob();

          const uploadUrl = getImageUrl(presignedResponse.uploadUrl) ?? presignedResponse.uploadUrl;
          const uploadResponse = await fetch(uploadUrl, {
            method: presignedResponse.uploadMethod || 'PUT',
            body: blob,
            headers: presignedResponse.headers,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to storage');
          }

          const coverResponse = await eventService.completeCoverImageUpload(
            eventId,
            presignedResponse.mediaId,
            {
              objectKey: presignedResponse.objectKey,
              resourceUrl: presignedResponse.resourceUrl,
              fileName: coverUploadRequest.fileName,
              contentType: coverUploadRequest.contentType,
              category: coverUploadRequest.category,
              isPublic: coverUploadRequest.isPublic,
            }
          );

          updateEvent({ coverImageUrl: coverResponse.coverImageUrl });
          await refresh(true);
        } catch (uploadError) {
          Alert.alert(t('ImageUploadFailed'), t('ImageUploadFailedMessage'), [{ text: t('OK') }]);
          ErrorHandler.handle(uploadError, 'updateCoverImage');
        } finally {
          setIsUpdatingCover(false);
        }
      }
    );
  }, [eventId, isUpdatingCover, refresh, t, updateEvent]);

  if (!eventId) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('EventNotFound')}
            subtitle={t('WeCouldNotDetermineEvent')}
            action={{ label: t('GoBack'), onPress: goBack }}
          />
        </View>
      </View>
    );
  }

  if (loading) {
    return <LoadingOverlay visible={true} message={t('LoadingEvent')} />;
  }

  const showEmpty = error && !event;

  return (
    <View className="flex-1 bg-light-surface dark:bg-dark-surface">
      {!showEmpty && event && (
        <View
          className="absolute left-0 right-0 z-50 flex-row items-center justify-between px-lg"
          style={{
            top: -insets.top,
            paddingTop: insets.top,
          }}
        >
          <TouchableOpacity
            onPress={goBack}
            className="w-10 h-10 rounded-full items-center justify-center bg-light-surface dark:bg-dark-surface"
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color={iconColor} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Share button placeholder — re-enable when shareUtils is restored */}
          <View className="w-10 h-10" />
        </View>
      )}

      {showEmpty ? (
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('UnableToLoadEvent')}
            subtitle={error?.message || t('SomethingWentWrong')}
            action={{ label: t('TryAgain'), onPress: () => refresh(true) }}
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-light-background dark:bg-dark-background"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={iconColor}
              colors={[iconColor]}
            />
          }
        >
          <View className="bg-light-background dark:bg-dark-background" style={{ paddingBottom: bottomGutter }}>
            <View className="relative h-[320px] overflow-hidden bg-light-surface dark:bg-dark-surface">
              <ImageBackground
                source={{ uri: getImageUrl(event?.coverImageUrl ?? params.imageUrl) ?? FALLBACK_IMAGE }}
                resizeMode="cover"
                className="w-full h-full"
              >
                {event && permissions.canEditEvent && (
                  <TouchableOpacity
                    onPress={handleEditCoverImage}
                    activeOpacity={0.85}
                    className="absolute right-lg bottom-lg flex-row items-center rounded-full bg-light-overlay-strong dark:bg-dark-overlay-strong px-md py-sm"
                  >
                    <Edit2 size={16} color={overlayTextColor} strokeWidth={2.5} />
                    <Text className="ml-xs text-xs font-semibold tracking-wide text-txt-inverse">
                      {t('EditCoverImage')}
                    </Text>
                  </TouchableOpacity>
                )}

                {isUpdatingCover && (
                  <View className="absolute inset-0 items-center justify-center bg-light-overlay-soft dark:bg-dark-overlay-soft px-lg gap-sm">
                    <ActivityIndicator color={overlayTextColor} />
                    <Text className="text-sm font-medium text-txt-inverse">
                      {t('UploadingImage')}
                    </Text>
                  </View>
                )}
              </ImageBackground>
            </View>

            <View className="px-xl pt-2xl pb-xl bg-light-background dark:bg-dark-background">
              <Text
                className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-tight"
                numberOfLines={2}
              >
                {event?.name ?? params.title ?? t('EventName')}
              </Text>

              {formattedVenueAddress && (
                <View className="flex-row items-center mt-xs">
                  <MapPin size={14} color={iconColor} strokeWidth={2} />
                  <Text
                    className="ml-xs text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary"
                    numberOfLines={1}
                  >
                    {formattedVenueAddress}
                  </Text>
                </View>
              )}
            </View>

            {venueCoordinates && (
              <View className="px-xl mb-2xl">
                <View className="h-[200px] rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
                  <EventLocationHeader
                    latitude={venueCoordinates.latitude}
                    longitude={venueCoordinates.longitude}
                  />
                </View>
              </View>
            )}
          </View>

          <View
            className="px-xl"
            style={{ paddingTop: venueCoordinates ? 0 : 24 }}
          >
            {event?.description && (
              <View className="mb-3xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
                  {t('About')}
                </Text>
                <Text className="text-sm text-txt-primary dark:text-txt-dark-primary leading-relaxed">
                  {event.description}
                </Text>
              </View>
            )}

            <View className="mb-3xl">
              <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
                {t('Schedule')}
              </Text>
              {formattedStart || formattedEnd || formattedRegistration ? (
                <View className="gap-xl">
                  {formattedStart && (
                    <View className="flex-row items-start gap-md pt-lg">
                      <CalendarClock size={18} color={iconColor} strokeWidth={2} />
                      <View className="flex-1">
                        <Text className="text-xs font-medium uppercase tracking-wider text-txt-tertiary dark:text-txt-dark-tertiary mb-xs">
                          {t('Starts')}
                        </Text>
                        <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                          {formattedStart}
                        </Text>
                      </View>
                    </View>
                  )}
                  {formattedEnd && (
                    <View
                      className="flex-row items-start border-t border-light-border dark:border-dark-border gap-md pt-xl"
                    >
                      <CalendarClock size={18} color={iconColor} strokeWidth={2} />
                      <View className="flex-1">
                        <Text className="text-xs font-medium uppercase tracking-wider text-txt-tertiary dark:text-txt-dark-tertiary mb-xs">
                          {t('Ends')}
                        </Text>
                        <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                          {formattedEnd}
                        </Text>
                      </View>
                    </View>
                  )}
                  {formattedRegistration && (
                    <View
                      className="flex-row items-start border-t border-light-border dark:border-dark-border gap-md pt-xl"
                    >
                      <CalendarClock size={18} color={iconColor} strokeWidth={2} />
                      <View className="flex-1">
                        <Text className="text-xs font-medium uppercase tracking-wider text-txt-tertiary dark:text-txt-dark-tertiary mb-xs">
                          {t('RegistrationDeadline')}
                        </Text>
                        <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                          {formattedRegistration}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                  {t('NoScheduleInformationAvailable')}
                </Text>
              )}
            </View>

            {eventId && <TimelineSection eventId={eventId} />}

            <View className="mb-3xl">
              <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
                {t('Manage')}
              </Text>

              <View>
                {permissions.canEditEvent && (
                  <ManageMenuItem
                    icon={Hash}
                    title={t('EventDetails')}
                    subtitle={t('EditInformation')}
                    onPress={() => setShowEditModal(true)}
                  />
                )}

                {permissions.canViewBudget && (
                  <ManageMenuItem
                    icon={DollarSign}
                    title={t('Budget')}
                    subtitle={t('ManageBudget')}
                    onPress={goToBudget}
                  />
                )}

                {permissions.canViewTimeline && (
                  <ManageMenuItem
                    icon={Calendar}
                    title={t('Timeline')}
                    subtitle={t('ManageTimeline')}
                    onPress={goToTimeline}
                  />
                )}

                {permissions.canViewCollaboration && (
                  <ManageMenuItem
                    icon={UserPlus}
                    title={t('Collaboration')}
                    subtitle={t('ManageCollaborators')}
                    onPress={goToCollaboration}
                  />
                )}

                {permissions.canViewRSVP && (
                  <ManageMenuItem
                    icon={Users}
                    title={t('GuestList')}
                    subtitle={t('ManageRSVPAndAttendees')}
                    onPress={goToRSVP}
                  />
                )}

                {permissions.canViewTickets && (
                  <ManageMenuItem
                    icon={Ticket}
                    title={t('Tickets')}
                    subtitle={t('ManageTicketTypes')}
                    onPress={goToTickets}
                  />
                )}

                {permissions.canViewMedia && (
                  <ManageMenuItem
                    icon={ImageIcon}
                    title={t('MediaLibrary')}
                    subtitle={t('ManageEventMedia')}
                    onPress={goToMediaLibrary}
                  />
                )}

                {permissions.canViewAssets && (
                  <ManageMenuItem
                    icon={File}
                    title={t('Assets')}
                    subtitle={t('ManageEventFiles')}
                    onPress={goToAssets}
                  />
                )}

                {permissions.canViewReminders && (
                  <ManageMenuItem
                    icon={CalendarClock}
                    title={t('Reminders')}
                    subtitle={t('ManageEventReminders')}
                    onPress={goToReminders}
                  />
                )}

                {permissions.canViewFeeds && (
                  <ManageMenuItem
                    icon={Hash}
                    title={t('EventFeeds')}
                    subtitle={t('ViewAndManagePosts')}
                    onPress={() => goToFeeds({ eventName: event?.name, coverImageUrl: event?.coverImageUrl ?? undefined })}
                    showBorder={false}
                  />
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <LoadingOverlay visible={loading && !refreshing} message={t('LoadingEvent')} transparent />

      <EditEventDetailsModal
        visible={showEditModal}
        event={event}
        onClose={() => setShowEditModal(false)}
        onUpdate={() => refresh(true)}
      />
    </View>
  );
}

export default function EventAdminDashboard() {
  const { eventId, params } = useEventDashboardRoute<Params>();

  return (
    <EventDashboardProvider
      eventId={eventId}
      initialData={params.eventData ?? null}
      initialAccessType={params.accessType ?? null}
      initialUserContext={params.userContext ?? null}
    >
      <EventAdminDashboardContent params={params} />
    </EventDashboardProvider>
  );
}
