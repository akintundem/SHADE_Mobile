import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { ArrowLeft, Mail, Bell, MessageSquare, Plus } from 'lucide-react-native';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { CommunicationDTO, NotificationDTO } from '../../../shared/types';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import ErrorModal from '../../../shared/components/common/ErrorModal';

type Props = { 
  eventId: string;
  onBack: () => void; 
  onSendMessage?: () => void;
};

export default function CommunicationScreen({ eventId, onBack, onSendMessage }: Props) {
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications' | 'templates'>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'draft' | 'scheduled'>('all');
  
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { error, handleError, hideError } = useErrorHandler();

  // Sample communications data
  const communications: CommunicationDTO[] = [
    {
      id: '1',
      eventId,
      type: 'EMAIL',
      subject: 'Welcome to Our Event!',
      content: 'Thank you for registering for our event. We look forward to seeing you there!',
      recipients: ['john@example.com', 'jane@example.com'],
      status: 'SENT',
      scheduledAt: '2024-01-15T10:00:00Z',
      sentAt: '2024-01-15T10:00:00Z',
      templateId: 'welcome_template',
      metadata: { priority: 'normal' }
    },
    {
      id: '2',
      eventId,
      type: 'SMS',
      subject: 'Event Reminder',
      content: 'Don\'t forget! Our event is tomorrow at 2 PM.',
      recipients: ['+1-555-0123', '+1-555-0456'],
      status: 'SCHEDULED',
      scheduledAt: '2024-01-20T09:00:00Z',
      templateId: 'reminder_template',
      metadata: { priority: 'high' }
    }
  ];

  // Sample notifications data
  const notifications: NotificationDTO[] = [
    {
      id: '1',
      eventId,
      type: 'EVENT_REMINDER',
      title: 'Event Reminder',
      message: 'Your event starts in 2 hours',
      recipientId: 'user1',
      status: 'SENT',
      sentAt: '2024-01-15T10:00:00Z',
      metadata: { eventName: 'Annual Conference' }
    },
    {
      id: '2',
      eventId,
      type: 'REGISTRATION_CONFIRMATION',
      title: 'Registration Confirmed',
      message: 'You have successfully registered for the event',
      recipientId: 'user2',
      status: 'PENDING',
      metadata: { eventName: 'Annual Conference' }
    }
  ];

  const filteredCommunications = useMemo(() => {
    let filtered = communications;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(comm => comm.status === filterStatus.toUpperCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(comm => 
        comm.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comm.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [filterStatus, searchQuery]);

  const tabs = [
    { key: 'messages', label: 'Messages', icon: <Mail size={16} color={colors.text.tertiary} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={16} color={colors.text.tertiary} /> },
    { key: 'templates', label: 'Templates', icon: <MessageSquare size={16} color={colors.text.tertiary} /> },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return colors.semantic.success;
      case 'PENDING':
        return colors.semantic.warning;
      case 'SCHEDULED':
        return colors.semantic.info;
      case 'FAILED':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail size={16} color={colors.text.secondary} />;
      case 'SMS':
        return <MessageSquare size={16} color={colors.text.secondary} />;
      case 'PUSH':
        return <Bell size={16} color={colors.text.secondary} />;
      default:
        return <MessageSquare size={16} color={colors.text.secondary} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorModal
        visible={!!error}
        error={error}
        onClose={hideError}
      />
      
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
          Communications
        </Text>
        <TouchableOpacity 
          onPress={onSendMessage}
          style={{ 
            padding: spacing.sm,
            backgroundColor: brand.primary,
            borderRadius: borderRadius.md
          }}
        >
          <Plus size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ 
        flexDirection: 'row', 
        gap: spacing.sm, 
        padding: spacing.md,
        borderBottomWidth: 1,
        borderColor: colors.border
      }}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={{ 
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.full,
              backgroundColor: activeTab === tab.key ? brand.primary : colors.surface
            }}
          >
            {React.cloneElement(tab.icon, { 
              color: activeTab === tab.key ? colors.text.inverse : colors.text.tertiary 
            })}
            <Text style={{ 
              color: activeTab === tab.key ? colors.text.inverse : colors.text.primary,
              fontWeight: '600',
              fontSize: typography.size.sm
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search and Filters */}
      {activeTab === 'messages' && (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
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
            <Text style={{ color: colors.text.tertiary }}>🔍</Text>
            <TextInput
              placeholder="Search messages..."
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

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'sent', label: 'Sent' },
              { key: 'draft', label: 'Draft' },
              { key: 'scheduled', label: 'Scheduled' },
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
        </View>
      )}

      <ScrollView 
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <>
            {filteredCommunications.map(communication => (
              <CommunicationCard key={communication.id} communication={communication} />
            ))}
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            {notifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <View style={{
            padding: spacing.xl,
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <MessageSquare size={40} color={colors.text.tertiary} />
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: '600',
              marginTop: spacing.md
            }}>
              Message Templates
            </Text>
            <Text style={{ 
              color: colors.text.secondary,
              textAlign: 'center',
              marginTop: spacing.sm
            }}>
              Create and manage email and SMS templates for your event communications
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CommunicationCard({ communication }: { communication: CommunicationDTO }) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return colors.semantic.success;
      case 'PENDING':
        return colors.semantic.warning;
      case 'SCHEDULED':
        return colors.semantic.info;
      case 'FAILED':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail size={16} color={colors.text.secondary} />;
      case 'SMS':
        return <MessageSquare size={16} color={colors.text.secondary} />;
      default:
        return <MessageSquare size={16} color={colors.text.secondary} />;
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: '700'
          }}>
            {communication.subject}
          </Text>
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: 14,
            marginTop: spacing.xs
          }}>
            {communication.content}
          </Text>
        </View>
        <View style={{
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          backgroundColor: getStatusColor(communication.status) + '20',
          borderRadius: borderRadius.sm
        }}>
          <Text style={{ 
            color: getStatusColor(communication.status),
            fontSize: 12,
            fontWeight: '600'
          }}>
            {communication.status}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {getTypeIcon(communication.type)}
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          {communication.type}
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          •
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          {communication.recipients.length} recipients
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          •
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          {new Date(communication.scheduledAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

function NotificationCard({ notification }: { notification: NotificationDTO }) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return colors.semantic.success;
      case 'PENDING':
        return colors.semantic.warning;
      case 'FAILED':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: '700'
          }}>
            {notification.title}
          </Text>
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: 14,
            marginTop: spacing.xs
          }}>
            {notification.message}
          </Text>
        </View>
        <View style={{
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          backgroundColor: getStatusColor(notification.status) + '20',
          borderRadius: borderRadius.sm
        }}>
          <Text style={{ 
            color: getStatusColor(notification.status),
            fontSize: 12,
            fontWeight: '600'
          }}>
            {notification.status}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Bell size={16} color={colors.text.secondary} />
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          {notification.type.replace('_', ' ')}
        </Text>
        {notification.sentAt && (
          <>
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
              •
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
              {new Date(notification.sentAt).toLocaleDateString()}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
