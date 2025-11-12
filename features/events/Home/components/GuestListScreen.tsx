import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, UserPlus, Phone, Mail, Calendar, CheckCircle, Clock, XCircle, Filter, Users, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { AttendeeDTO } from '../../../../shared/types/attendees';
import { dateUtils } from '../../../../shared/utils/helpers';
import { DATE_FORMATS } from '../../../../shared/utils/constants';

type Props = {
  eventId: string;
  onBack: () => void;
};

export default function GuestListScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample attendees data
  const attendees: AttendeeDTO[] = useMemo(() => [
    {
      id: '1',
      eventId,
      userId: 'user1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1-555-0123',
      registrationDate: '2024-01-15T10:00:00Z',
      status: 'CONFIRMED',
      checkInTime: '2024-01-20T09:30:00Z',
      dietaryRestrictions: 'Vegetarian',
      emergencyContact: 'Jane Doe - +1-555-0456',
      notes: 'VIP attendee'
    },
    {
      id: '2',
      eventId,
      userId: 'user2',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1-555-0789',
      registrationDate: '2024-01-16T14:30:00Z',
      status: 'PENDING',
      dietaryRestrictions: 'None',
      emergencyContact: 'Bob Smith - +1-555-0321'
    },
    {
      id: '3',
      eventId,
      userId: 'user3',
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      phoneNumber: '+1-555-0456',
      registrationDate: '2024-01-17T11:00:00Z',
      status: 'CONFIRMED'
    },
    {
      id: '4',
      eventId,
      userId: 'user4',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Williams',
      phoneNumber: '+1-555-0987',
      registrationDate: '2024-01-18T09:00:00Z',
      status: 'CANCELLED',
      notes: 'Cancelled due to scheduling conflict'
    }
  ], [eventId]);

  const filteredAttendees = useMemo(() => {
    return attendees.filter(attendee =>
      attendee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
  }, [attendees, searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Simplified Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.md
      }}>
        <TouchableOpacity onPress={onBack}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{
          fontSize: typography.size.xl,
          fontWeight: typography.weight.semibold,
          color: colors.text.primary
        }}>
          Guest List
        </Text>
      </View>

      {/* Simple Search */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          paddingHorizontal: spacing.md,
          gap: spacing.sm,
          height: 44
        }}>
          <Search size={20} color={colors.text.tertiary} />
          <TextInput
            placeholder="Search guests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              color: colors.text.primary,
              fontSize: typography.size.base
            }}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>
      </View>

      {/* Guests List */}
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {filteredAttendees.map(attendee => (
          <AttendeeCard key={attendee.id} attendee={attendee} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function AttendeeCard({ attendee }: { attendee: AttendeeDTO }) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#22c55e';
      case 'PENDING':
        return '#f59e0b';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return colors.text.secondary;
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        gap: spacing.md
      }}
      activeOpacity={0.7}
    >
      {/* Attendee Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: typography.size.lg,
            fontWeight: typography.weight.semibold,
            color: colors.text.primary,
            marginBottom: spacing.xs
          }}>
            {attendee.firstName} {attendee.lastName}
          </Text>
          <Text style={{
            fontSize: typography.size.sm,
            color: colors.text.secondary
          }}>
            {attendee.email}
          </Text>
        </View>
        <View style={{
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          backgroundColor: getStatusColor(attendee.status) + '20',
          borderRadius: borderRadius.sm,
          borderWidth: 1,
          borderColor: getStatusColor(attendee.status)
        }}>
          <Text style={{
            fontSize: typography.size.xs,
            fontWeight: typography.weight.medium,
            color: getStatusColor(attendee.status)
          }}>
            {attendee.status}
          </Text>
        </View>
      </View>

      {/* Phone */}
      {attendee.phoneNumber && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Phone size={16} color={colors.text.tertiary} />
          <Text style={{
            fontSize: typography.size.sm,
            color: colors.text.secondary
          }}>
            {attendee.phoneNumber}
          </Text>
        </View>
      )}

      {/* Check-in Status */}
      {attendee.checkInTime && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <CheckCircle size={16} color="#22c55e" />
          <Text style={{
            fontSize: typography.size.sm,
            color: colors.text.secondary
          }}>
            Checked in
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
