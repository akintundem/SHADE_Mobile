import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, UserPlus, Phone, Mail, Calendar, CheckCircle, Clock, XCircle, Filter, Users, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AttendeeDTO } from '../../types/attendees';
import { dateUtils } from '../../utils/helpers';
import { DATE_FORMATS } from '../../utils/constants';

type Props = {
  eventId: string;
  onBack: () => void;
};

export default function GuestListScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius, brand, shadows } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

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
    let filtered = attendees.filter(attendee =>
      attendee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(attendee => attendee.status === filterStatus.toUpperCase());
    }

    return filtered.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
  }, [attendees, searchQuery, filterStatus]);

  const statusCounts = useMemo(() => {
    return {
      total: attendees.length,
      confirmed: attendees.filter(a => a.status === 'CONFIRMED').length,
      pending: attendees.filter(a => a.status === 'PENDING').length,
      cancelled: attendees.filter(a => a.status === 'CANCELLED').length
    };
  }, [attendees]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {/* Premium Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...shadows.md
      }}>
        <TouchableOpacity 
          onPress={onBack} 
          style={{ 
            width: 44,
            height: 44,
            borderRadius: borderRadius.full,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.sm
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.text.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size['2xl'],
            letterSpacing: -1,
            marginLeft: -44
          }}>
            Guest List
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: borderRadius.full,
            backgroundColor: brand.primary,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.lg
          }}
          activeOpacity={0.8}
        >
          <UserPlus size={24} color={colors.text.inverse} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Enhanced Stats Grid */}
      <View style={{
        padding: spacing.xl,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatCard label="Total" value={statusCounts.total.toString()} color={colors.text.primary} icon={Users} />
          <StatCard label="Confirmed" value={statusCounts.confirmed.toString()} color={colors.semantic.success} icon={CheckCircle} />
          <StatCard label="Pending" value={statusCounts.pending.toString()} color={colors.semantic.warning} icon={Clock} />
          <StatCard label="Cancelled" value={statusCounts.cancelled.toString()} color={colors.semantic.error} icon={XCircle} />
        </View>
      </View>

      {/* Enhanced Search and Filters */}
      <View style={{ padding: spacing.xl, gap: spacing.lg, backgroundColor: colors.background }}>
        {/* Premium Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          borderWidth: 1.5,
          borderColor: colors.border,
          paddingHorizontal: spacing.lg,
          height: 56,
          ...shadows.sm
        }}>
          <Search size={20} color={colors.text.tertiary} strokeWidth={2.5} />
          <TextInput
            placeholder="Search attendees by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: spacing.md,
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium
            }}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        {/* Enhanced Status Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {[
            { key: 'all', label: 'All Guests' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'pending', label: 'Pending' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map(option => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setFilterStatus(option.key as any)}
              style={{
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                backgroundColor: filterStatus === option.key ? brand.primary : colors.surface,
                borderRadius: borderRadius.full,
                borderWidth: filterStatus === option.key ? 0 : 1.5,
                borderColor: colors.border,
                ...(filterStatus === option.key ? shadows.lg : shadows.sm),
                minWidth: 100,
                alignItems: 'center'
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: filterStatus === option.key ? colors.text.inverse : colors.text.primary,
                fontWeight: typography.weight.bold,
                fontSize: typography.size.sm,
                letterSpacing: 0.5
              }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Attendees List */}
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {filteredAttendees.map(attendee => (
          <AttendeeCard key={attendee.id} attendee={attendee} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: any }) {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      ...shadows.md
    }}>
      <View style={{
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: color + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm
      }}>
        <Icon size={20} color={color} strokeWidth={2.5} />
      </View>
      <Text style={{
        color: color,
        fontSize: typography.size['2xl'],
        fontWeight: typography.weight.bold,
        letterSpacing: -0.8,
        marginBottom: spacing.xs
      }}>
        {value}
      </Text>
      <Text style={{
        color: colors.text.secondary,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.8
      }}>
        {label}
      </Text>
    </View>
  );
}

function AttendeeCard({ attendee }: { attendee: AttendeeDTO }) {
  const { colors, typography, spacing, borderRadius, shadows, brand } = useTheme();

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
        return <CheckCircle size={18} color={colors.semantic.success} strokeWidth={2.5} />;
      case 'PENDING':
        return <Clock size={18} color={colors.semantic.warning} strokeWidth={2.5} />;
      case 'CANCELLED':
        return <XCircle size={18} color={colors.semantic.error} strokeWidth={2.5} />;
      default:
        return <Clock size={18} color={colors.text.secondary} strokeWidth={2.5} />;
    }
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: borderRadius['2xl'],
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: spacing.xl,
      gap: spacing.md,
      ...shadows.lg,
      overflow: 'hidden'
    }}>
      {/* Gradient Accent */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: getStatusColor(attendee.status)
      }} />

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: spacing.xs }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: borderRadius.full,
              backgroundColor: brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              ...shadows.md
            }}>
              <Text style={{
                color: colors.text.inverse,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.bold,
                letterSpacing: -0.5
              }}>
                {attendee.firstName[0]}{attendee.lastName[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.text.primary,
                fontSize: typography.size.xl,
                fontWeight: typography.weight.bold,
                letterSpacing: -0.5,
                marginBottom: spacing.xs
              }}>
                {attendee.firstName} {attendee.lastName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Mail size={14} color={colors.text.secondary} strokeWidth={2} />
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.medium
                }}>
                  {attendee.email}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: getStatusColor(attendee.status) + '20',
          borderRadius: borderRadius.full,
          borderWidth: 1.5,
          borderColor: getStatusColor(attendee.status) + '40'
        }}>
          {getStatusIcon(attendee.status)}
          <Text style={{
            color: getStatusColor(attendee.status),
            fontWeight: typography.weight.bold,
            fontSize: typography.size.xs,
            textTransform: 'uppercase',
            letterSpacing: 0.8
          }}>
            {attendee.status}
          </Text>
        </View>
      </View>

      {/* Contact Info Grid */}
      <View style={{
        padding: spacing.lg,
        backgroundColor: colors.background,
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{
            width: 36,
            height: 36,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Phone size={16} color={colors.text.secondary} strokeWidth={2} />
          </View>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
            {attendee.phoneNumber}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{
            width: 36,
            height: 36,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={16} color={colors.text.secondary} strokeWidth={2} />
          </View>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
            Registered: {dateUtils.formatDate(attendee.registrationDate, DATE_FORMATS.SHORT_DATE)}
          </Text>
        </View>
        {attendee.checkInTime && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: spacing.md,
            padding: spacing.sm,
            backgroundColor: colors.semantic.success + '15',
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.semantic.success + '30'
          }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: borderRadius.md,
              backgroundColor: colors.semantic.success,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={16} color={colors.text.inverse} strokeWidth={2.5} />
            </View>
            <Text style={{ 
              color: colors.semantic.success, 
              fontSize: typography.size.sm, 
              fontWeight: typography.weight.bold 
            }}>
              Checked in: {dateUtils.formatDate(attendee.checkInTime, DATE_FORMATS.DISPLAY_DATETIME)}
            </Text>
          </View>
        )}
      </View>

      {/* Additional Info */}
      {(attendee.dietaryRestrictions || attendee.emergencyContact || attendee.notes) && (
        <View style={{
          padding: spacing.lg,
          backgroundColor: colors.background,
          borderRadius: borderRadius.xl,
          gap: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
          borderLeftWidth: 3,
          borderLeftColor: brand.primary
        }}>
          {attendee.dietaryRestrictions && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <Text style={{ 
                color: colors.text.secondary, 
                fontSize: typography.size.sm,
                fontWeight: typography.weight.bold,
                minWidth: 80
              }}>
                Dietary:
              </Text>
              <Text style={{ 
                color: colors.text.secondary, 
                fontSize: typography.size.sm,
                flex: 1
              }}>
                {attendee.dietaryRestrictions}
              </Text>
            </View>
          )}
          {attendee.emergencyContact && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <Text style={{ 
                color: colors.text.secondary, 
                fontSize: typography.size.sm,
                fontWeight: typography.weight.bold,
                minWidth: 80
              }}>
                Emergency:
              </Text>
              <Text style={{ 
                color: colors.text.secondary, 
                fontSize: typography.size.sm,
                flex: 1
              }}>
                {attendee.emergencyContact}
              </Text>
            </View>
          )}
          {attendee.notes && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <Text style={{ 
                color: colors.text.secondary, 
                fontSize: typography.size.sm,
                fontWeight: typography.weight.bold,
                minWidth: 80
              }}>
                Notes:
              </Text>
              <Text style={{ 
                color: colors.text.secondary, 
                fontSize: typography.size.sm,
                fontStyle: 'italic',
                flex: 1
              }}>
                {attendee.notes}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
