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
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Plus,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { AttendeeDTO } from '../../attendees/types/attendees';
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
  email: string;
  profileImageUrl?: string | null;
  isAttendee: boolean;
};

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=';

export default function GuestListScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius, brand, shadows } =
    useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [attendees, setAttendees] = useState<AttendeeDTO[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load attendees
  useEffect(() => {
    loadAttendees();
  }, [eventId]);

  // Search for users when query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      searchUsers(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const loadAttendees = async () => {
    try {
      setLoading(true);
      const response = await attendeeService.getEventAttendees(eventId);
      setAttendees(response.attendees || []);
    } catch (err) {
      ErrorHandler.handle(err, 'loadAttendees');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      setSearching(true);
      const response = await authService.searchUsers(query, { size: 10 });
      const results: SearchUser[] = (response.users || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        isAttendee: attendees.some(a => a.email === user.email),
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

  const handleInviteUser = async (user: SearchUser) => {
    try {
      await attendeeService.registerForEvent(eventId, {
        userId: user.id,
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email,
      });
      await loadAttendees();
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      ErrorHandler.handle(err, 'inviteUser');
    }
  };

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) return;

    try {
      const nameParts = inviteName.trim().split(' ') || ['', ''];
      await attendeeService.registerForEvent(eventId, {
        userId: `email_${inviteEmail}`,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: inviteEmail.trim(),
      });
      await loadAttendees();
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
    } catch (err) {
      ErrorHandler.handle(err, 'inviteByEmail');
    }
  };

  const filteredAttendees = useMemo(() => {
    if (!searchQuery.trim()) {
      return attendees.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
    }
    return attendees
      .filter(
        attendee =>
          attendee.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          attendee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
  }, [attendees, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#22c55e';
      case 'PENDING':
        return '#f59e0b';
      case 'CANCELLED':
        return '#ef4444';
      case 'ATTENDED':
        return '#3b82f6';
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle size={14} color="#22c55e" />;
      case 'PENDING':
        return <Clock size={14} color="#f59e0b" />;
      case 'CANCELLED':
        return <XCircle size={14} color="#ef4444" />;
      default:
        return null;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading guest list..." />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
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
          borderBottomWidth: 1,
          borderColor: colors.border,
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
                fontWeight: typography.weight.bold,
                color: colors.text.primary,
              }}
            >
              Guest List
            </Text>
            <Text
              style={{
                fontSize: typography.size.sm,
                color: colors.text.secondary,
                marginTop: 2,
              }}
            >
              {attendees.length} {attendees.length === 1 ? 'guest' : 'guests'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowInviteModal(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            backgroundColor: brand.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.full,
            ...shadows.sm,
          }}
        >
          <UserPlus size={18} color="#FFFFFF" />
          <Text
            style={{
              color: '#FFFFFF',
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
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
            height: 52,
            borderWidth: 1,
            borderColor: searchQuery ? brand.primary : colors.border,
            ...shadows.sm,
          }}
        >
          <Search
            size={20}
            color={searchQuery ? brand.primary : colors.text.tertiary}
          />
          <TextInput
            placeholder="Search guests or invite people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              color: colors.text.primary,
              fontSize: typography.size.base,
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
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              color: colors.text.secondary,
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
                onPress={() => !user.isAttendee && handleInviteUser(user)}
                disabled={user.isAttendee}
                style={{
                  width: 140,
                  backgroundColor: user.isAttendee
                    ? colors.surface
                    : colors.background,
                  borderRadius: borderRadius.xl,
                  padding: spacing.md,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: user.isAttendee
                    ? colors.border
                    : brand.primary,
                  opacity: user.isAttendee ? 0.6 : 1,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    overflow: 'hidden',
                    marginBottom: spacing.sm,
                    borderWidth: 2,
                    borderColor: user.isAttendee
                      ? colors.border
                      : brand.primary,
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
                        backgroundColor: brand.primary + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: typography.size.lg,
                          fontWeight: typography.weight.bold,
                          color: brand.primary,
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
                    color: colors.text.tertiary,
                    textAlign: 'center',
                    marginBottom: spacing.xs,
                  }}
                  numberOfLines={1}
                >
                  {user.email}
                </Text>
                {user.isAttendee ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4,
                      backgroundColor: '#22c55e20',
                      borderRadius: borderRadius.sm,
                    }}
                  >
                    <CheckCircle size={12} color="#22c55e" />
                    <Text
                      style={{
                        fontSize: typography.size.xs,
                        color: '#22c55e',
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
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4,
                      backgroundColor: brand.primary,
                      borderRadius: borderRadius.sm,
                    }}
                  >
                    <Plus size={12} color="#FFFFFF" />
                    <Text
                      style={{
                        fontSize: typography.size.xs,
                        color: '#FFFFFF',
                        fontWeight: typography.weight.medium,
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
        data={filteredAttendees}
        keyExtractor={item => item.id}
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
        renderItem={({ item: attendee }) => (
          <AttendeeCard
            attendee={attendee}
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
  attendee,
  getStatusColor,
  getStatusIcon,
  getInitials,
}: {
  attendee: AttendeeDTO;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getInitials: (firstName: string, lastName: string) => string;
}) {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
      }}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          overflow: 'hidden',
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.border,
        }}
      >
        {/* TODO: Add profileImageUrl to AttendeeDTO type and use it here */}
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: brand.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold,
              color: brand.primary,
            }}
          >
            {getInitials(attendee.firstName, attendee.lastName)}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text
          style={{
            fontSize: typography.size.base,
            fontWeight: typography.weight.semibold,
            color: colors.text.primary,
          }}
        >
          {attendee.firstName} {attendee.lastName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Mail size={12} color={colors.text.tertiary} />
          <Text
            style={{
              fontSize: typography.size.sm,
              color: colors.text.secondary,
            }}
            numberOfLines={1}
          >
            {attendee.email}
          </Text>
        </View>
        {attendee.phoneNumber && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Phone size={12} color={colors.text.tertiary} />
            <Text
              style={{
                fontSize: typography.size.sm,
                color: colors.text.secondary,
              }}
            >
              {attendee.phoneNumber}
            </Text>
          </View>
        )}
      </View>

      {/* Status */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          backgroundColor: getStatusColor(attendee.status) + '20',
          borderRadius: borderRadius.full,
          borderWidth: 1,
          borderColor: getStatusColor(attendee.status),
        }}
      >
        {getStatusIcon(attendee.status)}
        <Text
          style={{
            fontSize: typography.size.xs,
            fontWeight: typography.weight.medium,
            color: getStatusColor(attendee.status),
            textTransform: 'capitalize',
          }}
        >
          {attendee.status.toLowerCase()}
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
  const { colors, spacing, typography, borderRadius, brand, shadows } =
    useTheme();

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
          paddingBottom: spacing['2xl'],
          ...shadows.xl,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold,
              color: colors.text.primary,
            }}
          >
            Invite Guest
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={{ gap: spacing.md }}>
          <View>
            <Text
              style={{
                fontSize: typography.size.sm,
                fontWeight: typography.weight.medium,
                color: colors.text.secondary,
                marginBottom: spacing.sm,
              }}
            >
              Name (Optional)
            </Text>
            <TextInput
              placeholder="Enter name"
              value={inviteName}
              onChangeText={onNameChange}
              style={{
                backgroundColor: colors.background,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                fontSize: typography.size.base,
                color: colors.text.primary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: typography.size.sm,
                fontWeight: typography.weight.medium,
                color: colors.text.secondary,
                marginBottom: spacing.sm,
              }}
            >
              Email Address *
            </Text>
            <TextInput
              placeholder="Enter email address"
              value={inviteEmail}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: colors.background,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                fontSize: typography.size.base,
                color: colors.text.primary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <TouchableOpacity
            onPress={onInvite}
            disabled={!inviteEmail.trim()}
            style={{
              backgroundColor: inviteEmail.trim() ? brand.primary : colors.border,
              borderRadius: borderRadius.xl,
              paddingVertical: spacing.md,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: spacing.md,
              ...shadows.sm,
            }}
          >
            <Text
              style={{
                color: inviteEmail.trim() ? '#FFFFFF' : colors.text.tertiary,
                fontWeight: typography.weight.semibold,
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
