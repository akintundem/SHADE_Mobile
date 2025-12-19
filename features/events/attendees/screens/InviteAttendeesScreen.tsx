import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { ArrowLeft, Mail, UserPlus, Plus, X, Upload } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useFormValidation } from '../../../../common/utils/formValidation';
import { invitationValidator } from '../../../../common/utils/validationSchemas';
import { InvitationDTO } from '../../types/events';
import { useErrorHandler } from '../../../../common/hooks/useErrorHandler';
import ErrorModal from '../../../../common/components/common/ErrorModal';
import { Section, FieldLabel, Input } from '../../../../common/components/common/FormComponents';

type Props = { 
  eventId: string;
  onBack: () => void; 
  onSendInvitations?: (invitations: InvitationDTO[]) => void;
};

export default function InviteAttendeesScreen({ eventId, onBack, onSendInvitations }: Props) {
  const [invitationMethod, setInvitationMethod] = useState<'email' | 'csv' | 'manual'>('email');
  const [emailList, setEmailList] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [invitations, setInvitations] = useState<InvitationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { error, handleError, hideError } = useErrorHandler();

  // Form validation
  const { errors, validateField, setFieldTouched, getFieldError, validateForm } = useFormValidation(invitationValidator);

  // Memoized form data for validation
  const formData = useMemo(() => ({
    emailList,
    customMessage,
  }), [emailList, customMessage]);

  // Validation result
  const validationResult = useMemo(() => validateForm(formData), [formData, validateForm]);
  const canSend = validationResult.isValid && !isLoading && invitations.length > 0;

  const handleSendInvitations = async () => {
    if (!canSend) return;

    setIsLoading(true);
    try {
      onSendInvitations?.(invitations);
    } catch (err) {
      handleError(err, 'Sending invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const parseEmailList = () => {
    const emails = emailList
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    const newInvitations: InvitationDTO[] = emails.map(email => ({
      id: `inv_${Date.now()}_${Math.random()}`,
      eventId,
      email,
      firstName: '',
      lastName: '',
      status: 'PENDING',
      sentAt: new Date().toISOString(),
      message: customMessage,
      reminderSent: false,
      reminderSentAt: null
    }));

    setInvitations(prev => [...prev, ...newInvitations]);
    setEmailList('');
  };

  const removeInvitation = (id: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
  };

  const methods = [
    { key: 'email', label: 'Email List', icon: <Mail size={16} color={colors.text.tertiary} /> },
    { key: 'csv', label: 'CSV Upload', icon: <Upload size={16} color={colors.text.tertiary} /> },
    { key: 'manual', label: 'Manual Entry', icon: <UserPlus size={16} color={colors.text.tertiary} /> },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorModal
        visible={!!error}
        error={error}
        onClose={hideError}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            Invite Attendees
          </Text>
          <TouchableOpacity 
            onPress={handleSendInvitations}
            disabled={!canSend}
            style={{ 
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: canSend ? brand.primary : colors.text.disabled,
              borderRadius: borderRadius.md
            }}
          >
            <Text style={{ 
              color: canSend ? colors.text.inverse : colors.text.tertiary,
              fontWeight: '600'
            }}>
              {isLoading ? 'Sending...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Method Selection */}
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Text style={{ 
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: '700'
          }}>
            Invitation Method
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {methods.map(method => (
              <TouchableOpacity
                key={method.key}
                onPress={() => setInvitationMethod(method.key as any)}
                style={{ 
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.full,
                  backgroundColor: invitationMethod === method.key ? brand.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: invitationMethod === method.key ? brand.primary : colors.border
                }}
              >
                {React.cloneElement(method.icon, { 
                  color: invitationMethod === method.key ? colors.text.inverse : colors.text.tertiary 
                })}
                <Text style={{ 
                  color: invitationMethod === method.key ? colors.text.inverse : colors.text.primary,
                  fontWeight: '600',
                  fontSize: typography.size.sm
                }}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          {/* Email List Method */}
          {invitationMethod === 'email' && (
            <View style={{ gap: spacing.md }}>
              <Section title="Email List">
                <FieldLabel icon={<Mail size={16} color={colors.text.secondary} />} label="Email Addresses" />
                <Input 
                  placeholder="Enter email addresses separated by commas or new lines&#10;example@email.com, another@email.com" 
                  multiline 
                  numberOfLines={4} 
                  style={{ height: 100, paddingTop: spacing.md }} 
                  value={emailList} 
                  onChangeText={(text) => {
                    setEmailList(text);
                    validateField('emailList', text);
                  }}
                  onBlur={() => setFieldTouched('emailList')}
                  error={getFieldError('emailList')}
                />
                
                <TouchableOpacity
                  onPress={parseEmailList}
                  disabled={!emailList.trim()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.xs,
                    paddingVertical: spacing.sm,
                    backgroundColor: emailList.trim() ? brand.primary : colors.text.disabled,
                    borderRadius: borderRadius.lg
                  }}
                >
                  <Plus size={16} color={colors.text.inverse} />
                  <Text style={{ 
                    color: colors.text.inverse,
                    fontWeight: '600'
                  }}>
                    Add to List
                  </Text>
                </TouchableOpacity>
              </Section>
            </View>
          )}

          {/* CSV Upload Method */}
          {invitationMethod === 'csv' && (
            <View style={{ gap: spacing.md }}>
              <Section title="CSV Upload">
                <View style={{
                  borderWidth: 2,
                  borderColor: colors.border,
                  borderStyle: 'dashed',
                  borderRadius: borderRadius.lg,
                  padding: spacing.xl,
                  alignItems: 'center',
                  gap: spacing.md
                }}>
                  <Upload size={40} color={colors.text.tertiary} />
                  <Text style={{ 
                    color: colors.text.primary,
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    Upload CSV File
                  </Text>
                  <Text style={{ 
                    color: colors.text.secondary,
                    textAlign: 'center',
                    fontSize: 14
                  }}>
                    Upload a CSV file with attendee information
                  </Text>
                  <TouchableOpacity style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: brand.primary,
                    borderRadius: borderRadius.lg
                  }}>
                    <Upload size={16} color={colors.text.inverse} />
                    <Text style={{ color: colors.text.inverse, fontWeight: '600' }}>
                      Choose File
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={{
                  padding: spacing.md,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  borderWidth: 1,
                  borderColor: colors.border
                }}>
                  <Text style={{ 
                    color: colors.text.primary,
                    fontWeight: '600',
                    marginBottom: spacing.sm
                  }}>
                    CSV Format:
                  </Text>
                  <Text style={{ 
                    color: colors.text.secondary,
                    fontSize: 14,
                    lineHeight: 20
                  }}>
                    email,firstName,lastName,phoneNumber{'\n'}
                    john@example.com,John,Doe,+1-555-0123{'\n'}
                    jane@example.com,Jane,Smith,+1-555-0456
                  </Text>
                </View>
              </Section>
            </View>
          )}

          {/* Manual Entry Method */}
          {invitationMethod === 'manual' && (
            <View style={{ gap: spacing.md }}>
              <Section title="Manual Entry">
                <TouchableOpacity style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.md,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  borderWidth: 1,
                  borderColor: colors.border
                }}>
                  <UserPlus size={20} color={colors.text.primary} />
                  <Text style={{ 
                    color: colors.text.primary,
                    fontWeight: '600'
                  }}>
                    Add Individual Attendee
                  </Text>
                </TouchableOpacity>
              </Section>
            </View>
          )}

          {/* Custom Message */}
          <Section title="Custom Message">
            <FieldLabel icon={<Mail size={16} color={colors.text.secondary} />} label="Personal Message" />
            <Input 
              placeholder="Add a personal message to your invitations..." 
              multiline 
              numberOfLines={3} 
              value={customMessage} 
              onChangeText={(text) => {
                setCustomMessage(text);
                validateField('customMessage', text);
              }}
              onBlur={() => setFieldTouched('customMessage')}
              error={getFieldError('customMessage')}
            />
          </Section>

          {/* Invitations List */}
          {invitations.length > 0 && (
            <Section title={`Invitations (${invitations.length})`}>
              <View style={{ gap: spacing.sm }}>
                {invitations.map(invitation => (
                  <View
                    key={invitation.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: spacing.md,
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: colors.text.primary,
                        fontWeight: '600'
                      }}>
                        {invitation.email}
                      </Text>
                      <Text style={{ 
                        color: colors.text.secondary,
                        fontSize: 14
                      }}>
                        {invitation.status}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeInvitation(invitation.id)}
                      style={{
                        padding: spacing.sm,
                        backgroundColor: colors.semantic.errorLight,
                        borderRadius: borderRadius.sm
                      }}
                    >
                      <X size={16} color={colors.semantic.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </Section>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
