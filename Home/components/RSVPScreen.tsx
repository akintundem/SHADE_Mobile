import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, Mail, Phone, Calendar, Filter, TrendingUp, Sparkles, Users } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { dateUtils } from '../../utils/helpers';
import { DATE_FORMATS } from '../../utils/constants';

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
  const { colors, spacing, typography, borderRadius, brand, shadows } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'declined' | 'pending' | 'maybe'>('all');

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
    let filtered = responses.filter(response =>
      response.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(response => response.responseStatus === filterStatus.toUpperCase());
    }

    return filtered.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
  }, [responses, searchQuery, filterStatus]);

  const statusCounts = useMemo(() => {
    return {
      total: responses.length,
      confirmed: responses.filter(r => r.responseStatus === 'CONFIRMED').length,
      declined: responses.filter(r => r.responseStatus === 'DECLINED').length,
      pending: responses.filter(r => r.responseStatus === 'PENDING').length,
      maybe: responses.filter(r => r.responseStatus === 'MAYBE').length
    };
  }, [responses]);

  const confirmationRate = useMemo(() => {
    if (responses.length === 0) return 0;
    return Math.round((statusCounts.confirmed / responses.length) * 100);
  }, [responses.length, statusCounts.confirmed]);

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
            RSVP Responses
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Enhanced Stats Overview */}
      <View style={{
        padding: spacing.xl,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderColor: colors.border,
        gap: spacing.lg
      }}>
        {/* Premium Confirmation Rate Card */}
        <View style={{
          backgroundColor: colors.background,
          borderRadius: borderRadius['2xl'],
          padding: spacing['2xl'],
          borderWidth: 1.5,
          borderColor: colors.border,
          ...shadows.lg,
          overflow: 'hidden'
        }}>
          <View style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 180,
            height: 180,
            borderRadius: borderRadius.full,
            backgroundColor: brand.primary,
            opacity: 0.05
          }} />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                marginBottom: spacing.sm
              }}>
                Confirmation Rate
              </Text>
              <Text style={{
                color: colors.text.primary,
                fontSize: 48,
                fontWeight: typography.weight.bold,
                letterSpacing: -2,
                lineHeight: 56
              }}>
                {confirmationRate}%
              </Text>
            </View>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: borderRadius.xl,
              backgroundColor: brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              ...shadows.lg
            }}>
              <TrendingUp size={36} color={colors.text.inverse} strokeWidth={2.5} />
            </View>
          </View>
        </View>

        {/* Enhanced Status Counts Grid */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatCard label="Total" value={statusCounts.total.toString()} color={colors.text.primary} icon={Users} />
          <StatCard label="Confirmed" value={statusCounts.confirmed.toString()} color={colors.semantic.success} icon={CheckCircle} />
          <StatCard label="Pending" value={statusCounts.pending.toString()} color={colors.semantic.warning} icon={Clock} />
          <StatCard label="Declined" value={statusCounts.declined.toString()} color={colors.semantic.error} icon={XCircle} />
          <StatCard label="Maybe" value={statusCounts.maybe.toString()} color={colors.text.secondary} icon={Clock} />
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
            placeholder="Search responses by name or email..."
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
            { key: 'all', label: 'All Responses' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'pending', label: 'Pending' },
            { key: 'declined', label: 'Declined' },
            { key: 'maybe', label: 'Maybe' }
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

      {/* Responses List */}
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {filteredResponses.map(response => (
          <RSVPCard key={response.id} response={response} />
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

function RSVPCard({ response }: { response: RSVPResponse }) {
  const { colors, typography, spacing, borderRadius, shadows, brand } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return colors.semantic.success;
      case 'DECLINED':
        return colors.semantic.error;
      case 'PENDING':
        return colors.semantic.warning;
      case 'MAYBE':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle size={18} color={colors.semantic.success} strokeWidth={2.5} />;
      case 'DECLINED':
        return <XCircle size={18} color={colors.semantic.error} strokeWidth={2.5} />;
      case 'PENDING':
        return <Clock size={18} color={colors.semantic.warning} strokeWidth={2.5} />;
      case 'MAYBE':
        return <Clock size={18} color={colors.text.secondary} strokeWidth={2.5} />;
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
        backgroundColor: getStatusColor(response.responseStatus)
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
                {response.firstName[0]}{response.lastName[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.size.xl,
                  fontWeight: typography.weight.bold,
                  letterSpacing: -0.5
                }}>
                  {response.firstName} {response.lastName}
                </Text>
                {response.plusOne && (
                  <View style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 2,
                    backgroundColor: colors.semantic.success + '20',
                    borderRadius: borderRadius.sm,
                    borderWidth: 1,
                    borderColor: colors.semantic.success
                  }}>
                    <Text style={{
                      color: colors.semantic.success,
                      fontSize: typography.size.xs,
                      fontWeight: typography.weight.bold
                    }}>
                      +1
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
                <Mail size={14} color={colors.text.secondary} strokeWidth={2} />
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.medium
                }}>
                  {response.email}
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
          backgroundColor: getStatusColor(response.responseStatus) + '20',
          borderRadius: borderRadius.full,
          borderWidth: 1.5,
          borderColor: getStatusColor(response.responseStatus) + '40'
        }}>
          {getStatusIcon(response.responseStatus)}
          <Text style={{
            color: getStatusColor(response.responseStatus),
            fontWeight: typography.weight.bold,
            fontSize: typography.size.xs,
            textTransform: 'uppercase',
            letterSpacing: 0.8
          }}>
            {response.responseStatus}
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      {response.phoneNumber && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.md,
          backgroundColor: colors.background,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border
        }}>
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
          <Text style={{ 
            color: colors.text.secondary, 
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium
          }}>
            {response.phoneNumber}
          </Text>
        </View>
      )}

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border
      }}>
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
        <Text style={{ 
          color: colors.text.secondary, 
          fontSize: typography.size.sm,
          fontWeight: typography.weight.medium
        }}>
          Responded: {dateUtils.formatDate(response.responseDate, DATE_FORMATS.SHORT_DATE)}
        </Text>
      </View>

      {/* Additional Info */}
      {(response.dietaryRestrictions || response.notes) && (
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
          {response.dietaryRestrictions && (
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
                {response.dietaryRestrictions}
              </Text>
            </View>
          )}
          {response.notes && (
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
                {response.notes}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
