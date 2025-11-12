import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { CalendarClock, MapPin, Users, ChevronRight, Eye, BarChart3, Play, Square, Copy, QrCode } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { EventStatus } from '../../types';
import { eventService } from '../../services/eventService';
import { ErrorHandler } from '../../utils/errorHandler';

type Props = {
  eventId: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  progress?: number; // 0 - 100
  collaborators?: number;
  status?: EventStatus;
  capacity?: { current: number; total: number };
  analytics?: { views: number; registrations: number };
  onOpen?: () => void;
  onInvite?: () => void;
  onRefresh?: () => void;
};

export const ManageEventCard = ({ 
  eventId, 
  title, 
  date, 
  location, 
  imageUrl, 
  progress = 35, 
  collaborators = 0, 
  status,
  capacity,
  analytics,
  onOpen, 
  onInvite,
  onRefresh
}: Props) => {
  const { colors, spacing, borderRadius, typography, brand, shadows, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const [isActioning, setIsActioning] = useState(false);

  const clamped = Math.max(0, Math.min(100, progress));

  const getStatusColor = (eventStatus?: EventStatus) => {
    switch (eventStatus) {
      case EventStatus.PUBLISHED:
      case EventStatus.REGISTRATION_OPEN:
      case EventStatus.IN_PROGRESS:
        return '#10B981'; // Green
      case EventStatus.DRAFT:
      case EventStatus.PLANNING:
        return '#6B7280'; // Gray
      case EventStatus.CANCELLED:
        return '#EF4444'; // Red
      case EventStatus.COMPLETED:
        return '#8B5CF6'; // Purple
      default:
        return '#F59E0B'; // Orange
    }
  };

  const getStatusLabel = (eventStatus?: EventStatus) => {
    switch (eventStatus) {
      case EventStatus.PUBLISHED:
        return 'Published';
      case EventStatus.REGISTRATION_OPEN:
        return 'Registration Open';
      case EventStatus.IN_PROGRESS:
        return 'Live';
      case EventStatus.DRAFT:
        return 'Draft';
      case EventStatus.PLANNING:
        return 'Planning';
      case EventStatus.CANCELLED:
        return 'Cancelled';
      case EventStatus.COMPLETED:
        return 'Completed';
      case EventStatus.REGISTRATION_CLOSED:
        return 'Registration Closed';
      default:
        return 'Unknown';
    }
  };

  const handleQuickAction = async (action: 'publish' | 'cancel' | 'duplicate' | 'qr') => {
    if (isActioning) return;
    
    setIsActioning(true);
    try {
      switch (action) {
        case 'publish':
          if (status === EventStatus.DRAFT || status === EventStatus.PLANNING) {
            await eventService.publishEvent(eventId);
            Alert.alert('Success', 'Event published successfully!');
            onRefresh?.();
          }
          break;
        case 'cancel':
          Alert.alert(
            'Cancel Event',
            'Are you sure you want to cancel this event?',
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes, Cancel',
                style: 'destructive',
                onPress: async () => {
                  await eventService.cancelEvent(eventId);
                  Alert.alert('Success', 'Event cancelled successfully!');
                  onRefresh?.();
                }
              }
            ]
          );
          break;
        case 'duplicate':
          await eventService.duplicateEvent(eventId, {
            newEventName: `Copy of ${title}`,
            copyAttendees: false,
            copyMedia: true,
            copySettings: true,
          });
          Alert.alert('Success', 'Event duplicated successfully!');
          onRefresh?.();
          break;
        case 'qr':
          try {
            const qrData = await eventService.getEventQRCode(eventId);
            Alert.alert('QR Code', `QR Code: ${qrData.qrCode}`);
          } catch {
            await eventService.generateEventQRCode(eventId);
            Alert.alert('Success', 'QR Code generated successfully!');
          }
          break;
      }
    } catch (error) {
      ErrorHandler.handle(error, `handleQuickAction_${action}`);
      Alert.alert('Error', 'Action failed. Please try again.');
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => navigation.navigate('EventManage', { id: eventId, title, date, location, imageUrl })}
      style={[
        styles.container,
        {
          borderRadius: borderRadius['2xl'],
          backgroundColor: colors.card,
          borderColor: colors.border,
          ...shadows.sm,
        }
      ]}
    >
      {/* Image with gradient overlay */}
      <View style={styles.imageContainer}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.image}
          imageStyle={{ borderTopLeftRadius: borderRadius['2xl'], borderTopRightRadius: borderRadius['2xl'] }}
          resizeMode="cover"
        >
          {/* Gradient overlay using View */}
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.25)',
            justifyContent: 'flex-end',
            padding: 12,
          }}>
            {/* Status and Progress badges */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View style={[styles.progressBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <View style={[styles.progressDot, { backgroundColor: clamped >= 70 ? '#10B981' : clamped >= 40 ? '#F59E0B' : '#6B7280' }]} />
                <Text style={[styles.progressText, { color: '#FFFFFF' }]}>
                  {clamped}% Complete
                </Text>
              </View>
              
              {status && (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                  <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
                    {getStatusLabel(status)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Content */}
      <View style={{ padding: spacing.lg }}>
        {/* Title */}
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size.xl,
            marginBottom: spacing.sm,
            lineHeight: typography.size.xl * 1.3,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>

        {/* Info rows */}
        <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surfaceElevated : colors.surface }]}>
              <CalendarClock size={14} color={colors.text.secondary} strokeWidth={2.5} />
            </View>
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, flex: 1 }} numberOfLines={1}>
              {date}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surfaceElevated : colors.surface }]}>
              <MapPin size={14} color={colors.text.secondary} strokeWidth={2.5} />
            </View>
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, flex: 1 }} numberOfLines={1}>
              {location}
            </Text>
          </View>

          {collaborators > 0 && (
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surfaceElevated : colors.surface }]}>
                <Users size={14} color={colors.text.secondary} strokeWidth={2.5} />
              </View>
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                {collaborators} {collaborators === 1 ? 'collaborator' : 'collaborators'}
              </Text>
            </View>
          )}

          {/* Capacity Info */}
          {capacity && (
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surfaceElevated : colors.surface }]}>
                <BarChart3 size={14} color={colors.text.secondary} strokeWidth={2.5} />
              </View>
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                {capacity.current}/{capacity.total} attending
              </Text>
            </View>
          )}

          {/* Analytics Info */}
          {analytics && (
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surfaceElevated : colors.surface }]}>
                <Eye size={14} color={colors.text.secondary} strokeWidth={2.5} />
              </View>
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                {analytics.views} views • {analytics.registrations} registered
              </Text>
            </View>
          )}
        </View>

        {/* Progress bar */}
        <View style={{ marginBottom: spacing.md }}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? colors.surfaceElevated : colors.surface }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${clamped}%`,
                  backgroundColor: clamped >= 70 ? '#10B981' : clamped >= 40 ? '#F59E0B' : brand.primary,
                }
              ]}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EventManage', { id: eventId, title, date, location, imageUrl })}
            activeOpacity={0.8}
            style={[
              styles.primaryButton,
              {
                backgroundColor: brand.primary,
                borderRadius: borderRadius.lg,
              }
            ]}
          >
            <Text style={{ color: colors.background, fontWeight: typography.weight.semibold, fontSize: typography.size.base }}>
              Manage
            </Text>
            <ChevronRight size={18} color={colors.background} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {(status === EventStatus.DRAFT || status === EventStatus.PLANNING) && (
              <TouchableOpacity
                onPress={() => handleQuickAction('publish')}
                disabled={isActioning}
                style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
              >
                <Play size={16} color="white" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => handleQuickAction('duplicate')}
              disabled={isActioning}
              style={[styles.quickActionButton, { backgroundColor: colors.text.tertiary }]}
            >
              <Copy size={16} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickAction('qr')}
              disabled={isActioning}
              style={[styles.quickActionButton, { backgroundColor: brand.primary }]}
            >
              <QrCode size={16} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    height: 180,
    width: '100%',
  },
  image: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  progressBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButton: {
    paddingHorizontal: 20,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


