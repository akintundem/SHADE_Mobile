import React, { useMemo } from 'react';
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Clock,
  Heart,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  UserCheck,
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import {
  EventAccessType,
  EventStatus,
  UserEventContext,
} from '../../../../core/events/types/event';
import { TicketTypeSummary } from '../../../../core/tickets/types/ticket';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { withAlpha } from '../../../../common/utils/colorUtils';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../../config/appConfig';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

export type EventItem = {
  id: string;
  ownerId?: string | null;
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  venue?: string;
  city?: string;
  state?: string;
  imageUrl?: string;
  stats?: { posts?: number; comments?: number; likes?: number };
  tag?: string;
  hashtags?: string[];
  cosigners?: string[];
  cosignedCount?: number;
  status?: EventStatus;
  isPublic?: boolean | null;
  isLive?: boolean;
  isPast?: boolean;
  capacity?: number | null;
  attendeeCount?: number | null;
  accessType?: EventAccessType | null;
  userContext?: UserEventContext | null;
  ticketTypes?: TicketTypeSummary[] | null;
};

type Props = {
  item: EventItem;
  width?: number;
  onPress?: (item: EventItem) => void;
};

type AccessOverlayProps = {
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  overlayColor: string;
  glowOuter: string;
  glowInner: string;
  contrastLight: string;
  contrastDark: string;
};

const AccessOverlay = ({
  label,
  Icon,
  overlayColor,
  glowOuter,
  glowInner,
  contrastLight,
  contrastDark,
}: AccessOverlayProps) => (
  <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: overlayColor }}>
    <View className="w-[110px] h-[110px] rounded-full items-center justify-center" style={{ backgroundColor: glowOuter }}>
      <View className="w-[85px] h-[85px] rounded-full items-center justify-center" style={{ backgroundColor: glowInner }}>
        <View
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: contrastLight, shadowColor: contrastLight, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 12 }}
        >
          <Icon size={28} color={contrastDark} strokeWidth={2.2} />
        </View>
      </View>
    </View>
    <Text className="text-xs font-bold uppercase tracking-[3px] mt-lg" style={{ color: contrastLight }}>
      {label}
    </Text>
  </View>
);

const formatStatusLabel = (status: EventStatus) =>
  status
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

export const EventCard = ({ item, width, onPress }: Props) => {
  const { t } = useI18n();
  const { width: screenWidth } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const textColor = colors.text;

  const cardWidth = width ?? screenWidth;

  const contrastLight = isDark ? colors.text.primary : colors.text.inverse;
  const contrastDark = isDark ? colors.text.inverse : colors.text.primary;
  const glowOuter = withAlpha(contrastLight, 0.08);
  const glowInner = withAlpha(contrastLight, 0.12);
  const overlayColor = colors.overlay;

  const accessLabel =
    item.isPublic == null ? undefined : item.isPublic ? t('OpenToEveryone') : t('InviteOnly');
  const accessChipLabel =
    item.isPublic == null ? undefined : item.isPublic ? t('Public') : t('InviteOnly');

  const userContext = item.userContext;
  const hasManagementAccess =
    (userContext?.isOwner || userContext?.isCollaborator) ?? false;
  const canViewContent = hasManagementAccess || (userContext?.canViewFeeds ?? false);

  const showTicketedOverlay = item.accessType === EventAccessType.TICKETED && !canViewContent && !hasManagementAccess;
  const showRSVPOverlay = item.accessType === EventAccessType.RSVP_REQUIRED && !canViewContent && !hasManagementAccess;
  const showInviteOnlyOverlay = item.accessType === EventAccessType.INVITE_ONLY && !canViewContent && !hasManagementAccess;

  const locationLabel = useMemo(() => {
    const cityState = [item.city, item.state].filter(Boolean).join(', ');
    if (cityState) return cityState;
    if (item.venue && item.venue !== accessLabel) return item.venue;
    return undefined;
  }, [item.city, item.state, item.venue, accessLabel]);

  const eventDateLabel = useMemo(
    () => (item.startAt ? dateUtils.formatDate(item.startAt, DATE_FORMATS.DISPLAY_DATE) : undefined),
    [item.startAt],
  );

  const isLive = item.status === EventStatus.IN_PROGRESS || (!!item.isLive && !item.status);

  const statusLabel = useMemo(() => {
    if (isLive) return t('Live');
    if (!item.status && item.isPast) return t('Past');
    if (!item.status) return undefined;

    const labels: Partial<Record<EventStatus, string>> = {
      [EventStatus.DRAFT]: t('Draft'),
      [EventStatus.PLANNING]: t('Planning'),
      [EventStatus.PUBLISHED]: t('Published'),
      [EventStatus.REGISTRATION_OPEN]: t('RegistrationOpen'),
      [EventStatus.REGISTRATION_CLOSED]: t('RegistrationClosed'),
      [EventStatus.IN_PROGRESS]: t('InProgress'),
      [EventStatus.COMPLETED]: t('Completed'),
      [EventStatus.CANCELLED]: t('Cancelled'),
      [EventStatus.POSTPONED]: t('Postponed'),
    };
    return labels[item.status] ?? formatStatusLabel(item.status);
  }, [isLive, item.status, item.isPast, t]);

  const statusColor = isLive || item.status === EventStatus.CANCELLED
    ? colors.semantic.error
    : item.status === EventStatus.COMPLETED
    ? colors.semantic.success
    : item.isPast
    ? textColor.tertiary
    : colors.semantic.warning;

  const tagLabel = useMemo(() => {
    const tag = item.tag ?? item.hashtags?.[0];
    if (!tag) return undefined;
    return tag.startsWith('#') ? tag : `#${tag}`;
  }, [item.tag, item.hashtags]);

  const likesCount = item.stats?.likes ?? 0;
  const commentsCount = item.stats?.comments ?? 0;

  const overlayProps = { overlayColor, glowOuter, glowInner, contrastLight, contrastDark };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onPress?.(item)}
      style={{ width: cardWidth }}
      className="bg-light-background dark:bg-dark-background"
    >
      <View className="w-full overflow-hidden bg-light-surface dark:bg-dark-surface" style={{ aspectRatio: 1 }}>
        <ImageBackground
          source={{ uri: getImageUrl(item.imageUrl) ?? FALLBACK_IMAGE }}
          resizeMode="cover"
          className="w-full h-full"
        >
          {showTicketedOverlay && <AccessOverlay {...overlayProps} Icon={Lock} label={t('TicketRequired')} />}
          {showRSVPOverlay && <AccessOverlay {...overlayProps} Icon={UserCheck} label={t('RSVPRequired')} />}
          {showInviteOnlyOverlay && <AccessOverlay {...overlayProps} Icon={Mail} label={t('InviteOnly')} />}
        </ImageBackground>
      </View>

      <View className="px-xl py-lg bg-light-background dark:bg-dark-background">
        {(tagLabel || statusLabel || accessChipLabel) && (
          <View className="flex-row flex-wrap items-center mb-md gap-md">
            {tagLabel ? (
              <Text className="text-xs font-semibold uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary">
                {tagLabel}
              </Text>
            ) : null}

            {statusLabel ? (
              <View className="flex-row items-center gap-xs px-sm py-xs">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
                <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                  {statusLabel}
                </Text>
              </View>
            ) : null}

            {accessChipLabel ? (
              <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
                {accessChipLabel}
              </Text>
            ) : null}
          </View>
        )}

        <Text
          className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-tight"
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {item.description ? (
          <Text
            className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-sm leading-relaxed"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}

        {(locationLabel || eventDateLabel) && (
          <View className="flex-row flex-wrap mt-md gap-lg">
            {locationLabel ? (
              <View className="flex-row items-center gap-xs">
                <MapPin size={16} color={textColor.tertiary} strokeWidth={2} />
                <Text className="text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary">
                  {locationLabel}
                </Text>
              </View>
            ) : null}

            {eventDateLabel ? (
              <View className="flex-row items-center gap-xs">
                <Clock size={16} color={textColor.tertiary} strokeWidth={2} />
                <Text className="text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary">
                  {eventDateLabel}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View className="flex-row items-center justify-between pt-lg mt-lg border-t border-light-border dark:border-dark-border">
          <View className="flex-row items-center gap-xl">
            {likesCount > 0 ? (
              <View className="flex-row items-center gap-xs">
                <Heart size={18} color={colors.semantic.error} strokeWidth={2.2} fill={colors.semantic.error} />
                <Text className="text-sm font-semibold text-txt-secondary dark:text-txt-dark-secondary">
                  {likesCount}
                </Text>
              </View>
            ) : null}
            {commentsCount > 0 ? (
              <View className="flex-row items-center gap-xs">
                <MessageCircle size={18} color={textColor.tertiary} strokeWidth={2.2} />
                <Text className="text-sm font-semibold text-txt-secondary dark:text-txt-dark-secondary">
                  {commentsCount}
                </Text>
              </View>
            ) : null}
            {likesCount === 0 && commentsCount === 0 ? (
              <View className="flex-row items-center gap-xs">
                <Heart size={18} color={textColor.tertiary} strokeWidth={2.2} />
                <Text className="text-sm font-medium text-txt-tertiary dark:text-txt-dark-tertiary">0</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
