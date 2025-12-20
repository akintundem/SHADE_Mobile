import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search,
  UserPlus,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Plus,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { InvitationResponse } from '../../attendees/types/attendees';
import { attendeeService } from '../../attendees/services/attendeeService';
import { authService } from '../../../auth/services/authService';
import { useDebounce } from '../../../../common/hooks/useDebounce';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { LoadingOverlay } from '../../../../common/components/LoadingStates';

type Props = {
  eventId: string;
  onBack: () => void;
};

type SearchUser = {
  id: string;
  name: string;
  maskedEmail: string;
  profileImageUrl?: string | null;
  isInvited: boolean;
};

export default function GuestListScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius, brand, shadows } =
    useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const loadInvitations = useCallback(
    async (pageToLoad: number = 0, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const response = await attendeeService.getEventInvitations(eventId, {
          page: pageToLoad,
          size: 20,
          sort: 'invitedAt,desc',
        });

        const content = response.content || [];
        setInvitations(prev =>
          append ? [...prev, ...content] : content,
        );
        setPage(response.number ?? pageToLoad);
        setTotalPages(response.totalPages ?? 1);
      } catch (err) {
        ErrorHandler.handle(err, 'loadInvitations');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [eventId],
  );

  // Load invitations
  useEffect(() => {
    loadInvitations(0, false);
  }, [loadInvitations]);

  // Search for users when query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      searchUsers(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const searchUsers = async (query: string) => {
    try {
      setSearching(true);
      const response = await authService.searchDirectory(query, { size: 10 });
      const invitedUserIds = new Set(
        invitations.map(inv => inv.userId).filter(Boolean) as string[],
      );
      const results: SearchUser[] = (response.content || []).map(user => ({
        id: user.id,
        name: user.name,
        maskedEmail: user.maskedEmail,
        profileImageUrl: user.profileImageUrl,
        isInvited: invitedUserIds.has(user.id),
      }));
      setSearchResults(results);
    } catch (err) {
      // If API fails, fall back to empty results
      ErrorHandler.handle(err, 'searchUsers');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const isMaskedEmail = (email?: string) => {
    if (!email) return false;
    // directory endpoint returns masked emails like "m***@g***.com"
    return /[*•]/.test(email);
  };

  const handleInviteUser = async (user: SearchUser) => {
    try {
      await attendeeService.registerForEvent(eventId, {
        userId: user.id,
        name: user.name?.trim() || 'Guest',
        // Never send masked emails to backend validators
        ...(isMaskedEmail(user.maskedEmail) ? {} : { email: user.maskedEmail }),
      });
      await loadInvitations(0, false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      ErrorHandler.handle(err, 'inviteUser');
    }
  };

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) return;

    try {
      await attendeeService.registerForEvent(eventId, {
        name: inviteName.trim() || inviteEmail.trim(),
        email: inviteEmail.trim().toLowerCase(),
      });
      await loadInvitations(0, false);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
    } catch (err) {
      ErrorHandler.handle(err, 'inviteByEmail');
    }
  };

  const filteredInvitations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? invitations.filter(
          invite =>
            invite.name.toLowerCase().includes(query) ||
            invite.email.toLowerCase().includes(query),
        )
      : invitations;

    return [...filtered].sort((a, b) =>
      (a.name || a.email).localeCompare(b.name || b.email),
    );
  }, [invitations, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return '#22c55e';
      case 'SENT':
        return '#3b82f6';
      case 'QUEUED':
        return '#f59e0b';
      case 'FAILED':
        return '#ef4444';
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle size={14} color="#22c55e" />;
      case 'SENT':
        return <Clock size={14} color="#3b82f6" />;
      case 'QUEUED':
        return <Clock size={14} color="#f59e0b" />;
      case 'FAILED':
        return <XCircle size={14} color="#ef4444" />;
      default:
        return null;
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading guest list..." />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.surface }}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View>
            <Text
              style={{
                fontSize: typography.size.xl,
                fontFamily: typography.family.bold,
                fontWeight: typography.weight.bold,
                color: colors.text.primary,
                letterSpacing: -0.3,
              }}
            >
              Guest List
            </Text>
            <Text
              style={{
                fontSize: typography.size.sm,
                fontFamily: typography.family.medium,
                color: colors.text.tertiary,
                marginTop: 1,
              }}
            >
              {invitations.length}{' '}
              {invitations.length === 1 ? 'guest' : 'guests'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowInviteModal(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            backgroundColor: colors.text.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.full,
          }}
        >
          <UserPlus size={18} color={colors.background} />
          <Text
            style={{
              color: colors.background,
              fontFamily: typography.family.semibold,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.sm,
            }}
          >
            Invite
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.cardElevated,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
            height: 48,
          }}
        >
          <Search
            size={18}
            color={colors.text.tertiary}
          />
          <TextInput
            placeholder="Search guests or invite people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontFamily: typography.family.regular,
            }}
            placeholderTextColor={colors.text.tertiary}
          />
          {searching && (
            <ActivityIndicator size="small" color={brand.primary} />
          )}
        </View>
      </View>

      {/* Search Results */}
      {searchQuery.trim().length >= 2 && searchResults.length > 0 && (
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: typography.size.xs,
              fontFamily: typography.family.bold,
              fontWeight: typography.weight.bold,
              color: colors.text.tertiary,
              marginBottom: spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Search Results
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm }}
          >
            {searchResults.map(user => (
              <TouchableOpacity
                key={user.id}
                onPress={() => !user.isInvited && handleInviteUser(user)}
                disabled={user.isInvited}
                activeOpacity={0.7}
                style={{
                  width: 140,
                  backgroundColor: colors.cardElevated,
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  alignItems: 'center',
                  opacity: user.isInvited ? 0.6 : 1,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    overflow: 'hidden',
                    marginBottom: spacing.sm,
                    backgroundColor: colors.surface,
                  }}
                >
                  {user.profileImageUrl ? (
                    <Image
                      source={{ uri: user.profileImageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: colors.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: typography.size.lg,
                          fontFamily: typography.family.bold,
                          fontWeight: typography.weight.bold,
                          color: colors.text.primary,
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: typography.size.sm,
                    fontFamily: typography.family.semibold,
                    fontWeight: typography.weight.semibold,
                    color: colors.text.primary,
                    textAlign: 'center',
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {user.name}
                </Text>
                <Text
                  style={{
                    fontSize: typography.size.xs,
                    fontFamily: typography.family.regular,
                    color: colors.text.tertiary,
                    textAlign: 'center',
                    marginBottom: spacing.sm,
                  }}
                  numberOfLines={1}
                >
                  {user.maskedEmail}
                </Text>
                {user.isInvited ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4,
                      backgroundColor: colors.semantic.success + '15',
                      borderRadius: borderRadius.full,
                    }}
                  >
                    <CheckCircle size={12} color={colors.semantic.success} />
                    <Text
                      style={{
                        fontSize: typography.size.xs,
                        color: colors.semantic.success,
                        fontFamily: typography.family.medium,
                        fontWeight: typography.weight.medium,
                      }}
                    >
                      Invited
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      paddingHorizontal: spacing.md,
                      paddingVertical: 6,
                      backgroundColor: colors.text.primary,
                      borderRadius: borderRadius.full,
                    }}
                  >
                    <Plus size={12} color={colors.background} />
                    <Text
                      style={{
                        fontSize: typography.size.xs,
                        color: colors.background,
                        fontFamily: typography.family.semibold,
                        fontWeight: typography.weight.semibold,
                      }}
                    >
                      Invite
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Guests List */}
      <FlatList
        data={filteredInvitations}
        keyExtractor={item => item.invitationId || item.attendeeId || item.email}
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.md,
        }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing['4xl'],
            }}
          >
            <Users size={48} color={colors.text.tertiary} />
            <Text
              style={{
                fontSize: typography.size.lg,
                fontWeight: typography.weight.semibold,
                color: colors.text.secondary,
                marginTop: spacing.md,
              }}
            >
              No guests yet
            </Text>
            <Text
              style={{
                fontSize: typography.size.sm,
                color: colors.text.tertiary,
                marginTop: spacing.xs,
                textAlign: 'center',
              }}
            >
              Start inviting people to your event
            </Text>
          </View>
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          const nextPage = page + 1;
          if (nextPage < totalPages && !loadingMore) {
            loadInvitations(nextPage, true);
          }
        }}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={{ marginVertical: spacing.md }}
              size="small"
              color={brand.primary}
            />
          ) : null
        }
        renderItem={({ item: invitation }) => (
          <AttendeeCard
            invitation={invitation}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getInitials={getInitials}
          />
        )}
      />

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          inviteEmail={inviteEmail}
          inviteName={inviteName}
          onEmailChange={setInviteEmail}
          onNameChange={setInviteName}
          onInvite={handleInviteByEmail}
          onClose={() => {
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteName('');
          }}
        />
      )}
    </SafeAreaView>
  );
}

function AttendeeCard({
  invitation,
  getStatusColor,
  getStatusIcon,
  getInitials,
}: {
  invitation: InvitationResponse;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getInitials: (fullName: string) => string;
}) {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const displayName = invitation.name || invitation.email;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.cardElevated,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
      }}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: colors.surface,
        }}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: brand.primary + '10',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: typography.size.base,
              fontFamily: typography.family.bold,
              fontWeight: typography.weight.bold,
              color: colors.text.primary,
            }}
          >
            {getInitials(displayName)}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontSize: typography.size.base,
            fontFamily: typography.family.semibold,
            fontWeight: typography.weight.semibold,
            color: colors.text.primary,
          }}
        >
          {displayName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Mail size={12} color={colors.text.tertiary} />
          <Text
            style={{
              fontSize: typography.size.xs,
              fontFamily: typography.family.medium,
              color: colors.text.tertiary,
            }}
            numberOfLines={1}
          >
            {invitation.email}
          </Text>
        </View>
      </View>

      {/* Status */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.full,
        }}
      >
        {getStatusIcon(invitation.status)}
        <Text
          style={{
            fontSize: typography.size.xs,
            fontFamily: typography.family.bold,
            fontWeight: typography.weight.bold,
            color: getStatusColor(invitation.status),
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {invitation.status.toLowerCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function InviteModal({
  inviteEmail,
  inviteName,
  onEmailChange,
  onNameChange,
  onInvite,
  onClose,
}: {
  inviteEmail: string;
  inviteName: string;
  onEmailChange: (email: string) => void;
  onNameChange: (name: string) => void;
  onInvite: () => void;
  onClose: () => void;
}) {
  const { colors, spacing, typography, borderRadius, brand } =
    useTheme();

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
      }}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: borderRadius['2xl'],
          borderTopRightRadius: borderRadius['2xl'],
          padding: spacing.xl,
          paddingBottom: spacing['3xl'],
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.xl,
          }}
        >
          <Text
            style={{
              fontSize: typography.size.xl,
              fontFamily: typography.family.bold,
              fontWeight: typography.weight.bold,
              color: colors.text.primary,
              letterSpacing: -0.3,
            }}
          >
            Invite Guest
          </Text>
          <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.cardElevated, alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ gap: spacing.lg }}>
          <View>
            <Text
              style={{
                fontSize: typography.size.xs,
                fontFamily: typography.family.bold,
                fontWeight: typography.weight.bold,
                color: colors.text.tertiary,
                marginBottom: spacing.xs,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Name (Optional)
            </Text>
            <TextInput
              placeholder="Enter guest name"
              value={inviteName}
              onChangeText={onNameChange}
              style={{
                backgroundColor: colors.cardElevated,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                fontSize: typography.size.base,
                fontFamily: typography.family.regular,
                color: colors.text.primary,
                height: 52,
              }}
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: typography.size.xs,
                fontFamily: typography.family.bold,
                fontWeight: typography.weight.bold,
                color: colors.text.tertiary,
                marginBottom: spacing.xs,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Email Address
            </Text>
            <TextInput
              placeholder="Enter email address"
              value={inviteEmail}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: colors.cardElevated,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                fontSize: typography.size.base,
                fontFamily: typography.family.regular,
                color: colors.text.primary,
                height: 52,
              }}
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <TouchableOpacity
            onPress={onInvite}
            disabled={!inviteEmail.trim()}
            activeOpacity={0.7}
            style={{
              backgroundColor: inviteEmail.trim() ? colors.text.primary : colors.cardElevated,
              borderRadius: borderRadius.full,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: spacing.md,
            }}
          >
            <Text
              style={{
                color: inviteEmail.trim() ? colors.background : colors.text.tertiary,
                fontFamily: typography.family.bold,
                fontWeight: typography.weight.bold,
                fontSize: typography.size.base,
              }}
            >
              Send Invitation
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
