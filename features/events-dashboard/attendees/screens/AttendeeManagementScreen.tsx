import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { ArrowLeft, Search, UserPlus, Phone, Calendar, CheckCircle, XCircle, Clock, Filter } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { AttendeeDTO } from '../../../core/events/types';
import { StatCard } from '../../../../common/components/common/FormComponents';
import { useI18n } from '../../../../common/i18n/I18nProvider';

type Props = { 
  eventId: string;
  onBack: () => void; 
  onInviteAttendees?: () => void;
};

export default function AttendeeManagementScreen({ eventId, onBack, onInviteAttendees }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [sortBy] = useState<'name' | 'date' | 'status'>('name');
  
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { t } = useI18n();

  // Sample attendees data
  const attendees: AttendeeDTO[] = [
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
      emergencyContact: 'Bob Smith - +1-555-0321',
      notes: ''
    }
  ];

  const filteredAttendees = useMemo(() => {
    let filtered = attendees.filter(attendee => 
      attendee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(attendee => attendee.status === filterStatus.toUpperCase());
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      }
    });
  }, [searchQuery, filterStatus, sortBy]);

  const statusCounts = useMemo(() => {
    return {
      total: attendees.length,
      confirmed: attendees.filter(a => a.status === 'CONFIRMED').length,
      pending: attendees.filter(a => a.status === 'PENDING').length,
      cancelled: attendees.filter(a => a.status === 'CANCELLED').length,
    };
  }, [attendees]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: spacing.lg, 
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
          <ArrowLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ 
          color: colors.text.primary, 
          fontWeight: '700',
          fontSize: typography.size.lg
        }}>
          {t('Attendees')}
        </Text>
        <TouchableOpacity 
          onPress={onInviteAttendees}
          style={{ 
            padding: spacing.sm,
            backgroundColor: brand.primary,
            borderRadius: borderRadius.md
          }}
        >
          <UserPlus size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={{ 
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <StatCard label={t('Total')} value={statusCounts.total} color={colors.text.primary} />
          <StatCard label={t('Confirmed')} value={statusCounts.confirmed} color={colors.semantic.success} />
          <StatCard label={t('Pending')} value={statusCounts.pending} color={colors.semantic.warning} />
          <StatCard label={t('Cancelled')} value={statusCounts.cancelled} color={colors.semantic.error} />
        </View>
      </View>

      {/* Search and Filters */}
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing.md,
          height: 48
        }}>
          <Search size={20} color={colors.text.tertiary} />
          <TextInput
            placeholder={t('SearchAttendees')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: spacing.sm,
              color: colors.text.primary,
              fontSize: 16
            }}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        {/* Filter and Sort */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {/* Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {[
                { key: 'all', label: t('All') },
                { key: 'confirmed', label: t('Confirmed') },
                { key: 'pending', label: t('Pending') },
                { key: 'cancelled', label: t('Cancelled') },
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setFilterStatus(option.key as any)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: filterStatus === option.key ? brand.primary : colors.surface,
                    borderRadius: borderRadius.full,
                    borderWidth: 1,
                    borderColor: filterStatus === option.key ? brand.primary : colors.border
                  }}
                >
                  <Text style={{
                    color: filterStatus === option.key ? colors.text.inverse : colors.text.primary,
                    fontWeight: '600',
                    fontSize: 14
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Sort Options */}
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <Filter size={16} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 14 }}>
              {t('Sort')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Attendees List */}
      <ScrollView 
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {filteredAttendees.map(attendee => (
          <AttendeeCard 
            key={attendee.id} 
            attendee={attendee}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}


function AttendeeCard({ attendee }: { attendee: AttendeeDTO }) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return colors.semantic.success;
      case 'PENDING':
        return colors.semantic.warning;
      case 'CANCELLED':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle size={16} color={colors.semantic.success} />;
      case 'PENDING':
        return <Clock size={16} color={colors.semantic.warning} />;
      case 'CANCELLED':
        return <XCircle size={16} color={colors.semantic.error} />;
      default:
        return <Clock size={16} color={colors.text.secondary} />;
    }
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.sm
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: '700'
          }}>
            {attendee.firstName} {attendee.lastName}
          </Text>
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: 14
          }}>
            {attendee.email}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {getStatusIcon(attendee.status)}
          <Text style={{ 
            color: getStatusColor(attendee.status),
            fontWeight: '600',
            fontSize: 14
          }}>
            {attendee.status}
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Phone size={16} color={colors.text.secondary} />
          <Text style={{ color: colors.text.secondary }}>
            {attendee.phoneNumber}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Calendar size={16} color={colors.text.secondary} />
          <Text style={{ color: colors.text.secondary }}>
            {t('Registered')} {new Date(attendee.registrationDate).toLocaleDateString()}
          </Text>
        </View>
        {attendee.checkInTime && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <CheckCircle size={16} color={colors.semantic.success} />
            <Text style={{ color: colors.semantic.success }}>
              {t('CheckedIn')} {new Date(attendee.checkInTime).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Additional Info */}
      {(attendee.dietaryRestrictions || attendee.emergencyContact || attendee.notes) && (
        <View style={{ 
          padding: spacing.md,
          backgroundColor: colors.background,
          borderRadius: borderRadius.lg,
          gap: spacing.xs
        }}>
          {attendee.dietaryRestrictions && (
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
              <Text style={{ fontWeight: '600' }}>{t('Dietary')}</Text> {attendee.dietaryRestrictions}
            </Text>
          )}
          {attendee.emergencyContact && (
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
              <Text style={{ fontWeight: '600' }}>{t('Emergency')}</Text> {attendee.emergencyContact}
            </Text>
          )}
          {attendee.notes && (
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
              <Text style={{ fontWeight: '600' }}>{t('Notes')}</Text> {attendee.notes}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
