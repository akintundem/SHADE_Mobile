import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, Mail, Phone, Calendar, Filter, TrendingUp, Sparkles, Users } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { dateUtils } from '../../../../shared/utils/helpers';
import { DATE_FORMATS } from '../../../../shared/utils/constants';

type Props = {
  eventId: string;
  onBack: () => void;
};

type RSVPResponse = {
  id: string;
  eventId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  responseStatus: 'CONFIRMED' | 'DECLINED' | 'PENDING' | 'MAYBE';
  responseDate: string;
  notes?: string;
  dietaryRestrictions?: string;
  plusOne?: boolean;
};

export default function RSVPScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample RSVP responses
  const responses: RSVPResponse[] = useMemo(() => [
    {
      id: '1',
      eventId,
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1-555-0123',
      responseStatus: 'CONFIRMED',
      responseDate: '2024-01-15T10:00:00Z',
      dietaryRestrictions: 'Vegetarian',
      plusOne: true
    },
    {
      id: '2',
      eventId,
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1-555-0789',
      responseStatus: 'CONFIRMED',
      responseDate: '2024-01-16T14:30:00Z'
    },
    {
      id: '3',
      eventId,
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      phoneNumber: '+1-555-0456',
      responseStatus: 'PENDING',
      responseDate: '2024-01-17T11:00:00Z'
    },
    {
      id: '4',
      eventId,
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Williams',
      phoneNumber: '+1-555-0987',
      responseStatus: 'DECLINED',
      responseDate: '2024-01-18T09:00:00Z',
      notes: 'Scheduling conflict'
    },
    {
      id: '5',
      eventId,
      email: 'charlie@example.com',
      firstName: 'Charlie',
      lastName: 'Brown',
      responseStatus: 'MAYBE',
      responseDate: '2024-01-19T15:00:00Z',
      notes: 'Will confirm by end of week'
    },
    {
      id: '6',
      eventId,
      email: 'diana@example.com',
      firstName: 'Diana',
      lastName: 'Prince',
      phoneNumber: '+1-555-0321',
      responseStatus: 'CONFIRMED',
      responseDate: '2024-01-20T08:00:00Z',
      dietaryRestrictions: 'Vegan'
    }
  ], [eventId]);

  const filteredResponses = useMemo(() => {
    return responses.filter(response =>
      response.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
  }, [responses, searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
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
          RSVP Responses
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
            placeholder="Search responses..."
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

      {/* Responses List */}
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {filteredResponses.map(response => (
          <RSVPCard key={response.id} response={response} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function RSVPCard({ response }: { response: RSVPResponse }) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#22c55e';
      case 'DECLINED':
        return '#ef4444';
      case 'PENDING':
        return '#f59e0b';
      case 'MAYBE':
        return '#6b7280';
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
      {/* Response Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
            <Text style={{
              fontSize: typography.size.lg,
              fontWeight: typography.weight.semibold,
              color: colors.text.primary
            }}>
              {response.firstName} {response.lastName}
            </Text>
            {response.plusOne && (
              <View style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                backgroundColor: '#22c55e20',
                borderRadius: borderRadius.sm,
                borderWidth: 1,
                borderColor: '#22c55e'
              }}>
                <Text style={{
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.bold,
                  color: '#22c55e'
                }}>
                  +1
                </Text>
              </View>
            )}
          </View>
          <Text style={{
            fontSize: typography.size.sm,
            color: colors.text.secondary
          }}>
            {response.email}
          </Text>
        </View>
        <View style={{
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          backgroundColor: getStatusColor(response.responseStatus) + '20',
          borderRadius: borderRadius.sm,
          borderWidth: 1,
          borderColor: getStatusColor(response.responseStatus)
        }}>
          <Text style={{
            fontSize: typography.size.xs,
            fontWeight: typography.weight.medium,
            color: getStatusColor(response.responseStatus)
          }}>
            {response.responseStatus}
          </Text>
        </View>
      </View>

      {/* Phone */}
      {response.phoneNumber && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Phone size={16} color={colors.text.tertiary} />
          <Text style={{
            fontSize: typography.size.sm,
            color: colors.text.secondary
          }}>
            {response.phoneNumber}
          </Text>
        </View>
      )}

      {/* Notes */}
      {response.notes && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Mail size={16} color={colors.text.tertiary} />
          <Text style={{
            fontSize: typography.size.sm,
            color: colors.text.secondary,
            fontStyle: 'italic'
          }}>
            {response.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
