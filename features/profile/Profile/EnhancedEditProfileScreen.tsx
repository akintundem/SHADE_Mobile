import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ArrowLeft, User, Mail, Phone, Calendar, Camera, Globe, Bell, Shield } from 'lucide-react-native';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { useFormValidation } from '../../../shared/utils/formValidation';
import { UserResponse, UserType } from '../../../shared/types';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import ErrorModal from '../../../shared/components/common/ErrorModal';
import { Section, FieldLabel, Input, SelectInput, ToggleRow } from '../../../shared/components/common/FormComponents';

type Props = { 
  user: UserResponse;
  onBack: () => void; 
  onSave?: (user: UserResponse) => void;
};

export default function EnhancedEditProfileScreen({ user, onBack, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<'basic' | 'professional' | 'privacy' | 'preferences'>('basic');
  
  // Basic Information
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
  const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl || '');
  const [userType, setUserType] = useState<UserType>(user.userType || 'INDIVIDUAL');

  // Professional Information
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');

  // Privacy Settings
  const [emailVerified, setEmailVerified] = useState(user.emailVerified || false);
  const [marketingOptIn, setMarketingOptIn] = useState(user.marketingOptIn || false);
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'friends'>('public');
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);

  // Preferences
  const [preferences, setPreferences] = useState(user.preferences || '');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  const [isLoading, setIsLoading] = useState(false);
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { error, handleError, hideError } = useErrorHandler();

  // Form validation
  const { errors, validateField, setFieldTouched, getFieldError, validateForm } = useFormValidation(profileValidator);

  // Memoized form data for validation
  const formData = useMemo(() => ({
    name,
    email,
    phoneNumber,
    dateOfBirth,
  }), [name, email, phoneNumber, dateOfBirth]);

  // Validation result
  const validationResult = useMemo(() => validateForm(formData), [formData, validateForm]);
  const canSave = validationResult.isValid && !isLoading;

  const handleSave = async () => {
    if (!canSave) return;

    setIsLoading(true);
    
    try {
      const updatedUser: UserResponse = {
        ...user,
        name,
        email,
        phoneNumber,
        dateOfBirth,
        profileImageUrl,
        userType,
        marketingOptIn,
        preferences: JSON.stringify({
          notifications,
          language,
          timezone,
          theme,
          profileVisibility,
          showEmail,
          showPhone,
          allowMessages,
          professional: {
            company,
            jobTitle,
            industry,
            experience,
            skills,
            bio,
            website,
            linkedin,
            twitter
          }
        })
      };

      // Here you would call the API to update the user
      // const response = await authService.updateProfile(updatedUser);
      
      onSave?.(updatedUser);
    } catch (err) {
      handleError(err, 'Saving profile');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { key: 'basic', label: 'Basic', icon: <User size={16} color={colors.text.tertiary} /> },
    { key: 'professional', label: 'Professional', icon: <Globe size={16} color={colors.text.tertiary} /> },
    { key: 'privacy', label: 'Privacy', icon: <Shield size={16} color={colors.text.tertiary} /> },
    { key: 'preferences', label: 'Preferences', icon: <Bell size={16} color={colors.text.tertiary} /> },
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
            Edit Profile
          </Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={!canSave}
            style={{ 
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: canSave ? brand.primary : colors.text.disabled,
              borderRadius: borderRadius.md
            }}
          >
            <Text style={{ 
              color: canSave ? colors.text.inverse : colors.text.tertiary,
              fontWeight: '600'
            }}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
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

        <ScrollView 
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <View style={{ padding: spacing.lg, gap: spacing.lg }}>
              {/* Profile Picture */}
              <Section title="Profile Picture">
                <View style={{ alignItems: 'center', gap: spacing.md }}>
                  <View style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: colors.surface,
                    borderWidth: 2,
                    borderColor: colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {profileImageUrl ? (
                      <Image 
                        source={{ uri: profileImageUrl }} 
                        style={{ width: 100, height: 100 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <User size={40} color={colors.text.tertiary} />
                    )}
                  </View>
                  <TouchableOpacity style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}>
                    <Camera size={16} color={colors.text.primary} />
                    <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                      Change Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              </Section>

              <Section title="Basic Information">
                <FieldLabel icon={<User size={16} color={colors.text.secondary} />} label="Full Name" />
                <Input 
                  placeholder="Enter your full name" 
                  value={name} 
                  onChangeText={(text) => {
                    setName(text);
                    validateField('name', text);
                  }}
                  onBlur={() => setFieldTouched('name')}
                  error={getFieldError('name')}
                />

                <FieldLabel icon={<Mail size={16} color={colors.text.secondary} />} label="Email Address" />
                <Input 
                  placeholder="Enter your email" 
                  value={email} 
                  onChangeText={(text) => {
                    setEmail(text);
                    validateField('email', text);
                  }}
                  onBlur={() => setFieldTouched('email')}
                  error={getFieldError('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <FieldLabel icon={<Phone size={16} color={colors.text.secondary} />} label="Phone Number" />
                <Input 
                  placeholder="Enter your phone number" 
                  value={phoneNumber} 
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    validateField('phoneNumber', text);
                  }}
                  onBlur={() => setFieldTouched('phoneNumber')}
                  error={getFieldError('phoneNumber')}
                  keyboardType="phone-pad"
                />

                <FieldLabel icon={<Calendar size={16} color={colors.text.secondary} />} label="Date of Birth" />
                <Input 
                  placeholder="YYYY-MM-DD" 
                  value={dateOfBirth} 
                  onChangeText={(text) => {
                    setDateOfBirth(text);
                    validateField('dateOfBirth', text);
                  }}
                  onBlur={() => setFieldTouched('dateOfBirth')}
                  error={getFieldError('dateOfBirth')}
                />

                <FieldLabel icon={<User size={16} color={colors.text.secondary} />} label="User Type" />
                <SelectInput
                  value={userType}
                  onValueChange={setUserType}
                  options={[
                    { label: 'Individual', value: 'INDIVIDUAL' },
                    { label: 'Organization', value: 'ORGANIZATION' },
                    { label: 'Business', value: 'BUSINESS' },
                  ]}
                />
              </Section>
            </View>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <View style={{ padding: spacing.lg, gap: spacing.lg }}>
              <Section title="Professional Information">
                <FieldLabel icon={<Globe size={16} color={colors.text.secondary} />} label="Company" />
                <Input 
                  placeholder="Your company name" 
                  value={company} 
                  onChangeText={setCompany}
                />

                <FieldLabel icon={<User size={16} color={colors.text.secondary} />} label="Job Title" />
                <Input 
                  placeholder="Your job title" 
                  value={jobTitle} 
                  onChangeText={setJobTitle}
                />

                <FieldLabel icon={<Globe size={16} color={colors.text.secondary} />} label="Industry" />
                <Input 
                  placeholder="Your industry" 
                  value={industry} 
                  onChangeText={setIndustry}
                />

                <FieldLabel icon={<Calendar size={16} color={colors.text.secondary} />} label="Experience" />
                <Input 
                  placeholder="Years of experience" 
                  value={experience} 
                  onChangeText={setExperience}
                  keyboardType="numeric"
                />

                <FieldLabel icon={<User size={16} color={colors.text.secondary} />} label="Bio" />
                <Input 
                  placeholder="Tell us about yourself" 
                  multiline 
                  numberOfLines={4} 
                  value={bio} 
                  onChangeText={setBio}
                />
              </Section>

              <Section title="Social Links">
                <FieldLabel icon={<Globe size={16} color={colors.text.secondary} />} label="Website" />
                <Input 
                  placeholder="https://yourwebsite.com" 
                  value={website} 
                  onChangeText={setWebsite}
                />

                <FieldLabel icon={<Globe size={16} color={colors.text.secondary} />} label="LinkedIn" />
                <Input 
                  placeholder="https://linkedin.com/in/yourprofile" 
                  value={linkedin} 
                  onChangeText={setLinkedin}
                />

                <FieldLabel icon={<Globe size={16} color={colors.text.secondary} />} label="Twitter" />
                <Input 
                  placeholder="https://twitter.com/yourhandle" 
                  value={twitter} 
                  onChangeText={setTwitter}
                />
              </Section>
            </View>
          )}

          {/* Privacy Settings Tab */}
          {activeTab === 'privacy' && (
            <View style={{ padding: spacing.lg, gap: spacing.lg }}>
              <Section title="Profile Visibility">
                <FieldLabel icon={<Eye size={16} color={colors.text.secondary} />} label="Profile Visibility" />
                <SelectInput
                  value={profileVisibility}
                  onValueChange={setProfileVisibility}
                  options={[
                    { label: 'Public', value: 'public' },
                    { label: 'Private', value: 'private' },
                    { label: 'Friends Only', value: 'friends' },
                  ]}
                />

                <View style={{ gap: spacing.md }}>
                  <ToggleRow 
                    label="Show Email" 
                    value={showEmail} 
                    onValueChange={setShowEmail}
                    icon={<Mail size={16} color={colors.text.secondary} />}
                    description="Allow others to see your email"
                  />
                  <ToggleRow 
                    label="Show Phone" 
                    value={showPhone} 
                    onValueChange={setShowPhone}
                    icon={<Phone size={16} color={colors.text.secondary} />}
                    description="Allow others to see your phone number"
                  />
                  <ToggleRow 
                    label="Allow Messages" 
                    value={allowMessages} 
                    onValueChange={setAllowMessages}
                    icon={<Bell size={16} color={colors.text.secondary} />}
                    description="Allow others to send you messages"
                  />
                </View>
              </Section>

              <Section title="Marketing Preferences">
                <View style={{ gap: spacing.md }}>
                  <ToggleRow 
                    label="Marketing Opt-in" 
                    value={marketingOptIn} 
                    onValueChange={setMarketingOptIn}
                    icon={<Bell size={16} color={colors.text.secondary} />}
                    description="Receive marketing emails and updates"
                  />
                </View>
              </Section>
            </View>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <View style={{ padding: spacing.lg, gap: spacing.lg }}>
              <Section title="Notification Preferences">
                <View style={{ gap: spacing.md }}>
                  <ToggleRow 
                    label="Email Notifications" 
                    value={notifications.email} 
                    onValueChange={(value) => setNotifications(prev => ({ ...prev, email: value }))}
                    icon={<Mail size={16} color={colors.text.secondary} />}
                    description="Receive notifications via email"
                  />
                  <ToggleRow 
                    label="Push Notifications" 
                    value={notifications.push} 
                    onValueChange={(value) => setNotifications(prev => ({ ...prev, push: value }))}
                    icon={<Bell size={16} color={colors.text.secondary} />}
                    description="Receive push notifications"
                  />
                  <ToggleRow 
                    label="SMS Notifications" 
                    value={notifications.sms} 
                    onValueChange={(value) => setNotifications(prev => ({ ...prev, sms: value }))}
                    icon={<Phone size={16} color={colors.text.secondary} />}
                    description="Receive SMS notifications"
                  />
                  <ToggleRow 
                    label="Marketing Notifications" 
                    value={notifications.marketing} 
                    onValueChange={(value) => setNotifications(prev => ({ ...prev, marketing: value }))}
                    icon={<Bell size={16} color={colors.text.secondary} />}
                    description="Receive marketing notifications"
                  />
                </View>
              </Section>

              <Section title="App Preferences">
                <FieldLabel icon={<Globe size={16} color={colors.text.secondary} />} label="Language" />
                <SelectInput
                  value={language}
                  onValueChange={setLanguage}
                  options={[
                    { label: 'English', value: 'en' },
                    { label: 'Spanish', value: 'es' },
                    { label: 'French', value: 'fr' },
                    { label: 'German', value: 'de' },
                  ]}
                />

                <FieldLabel icon={<Globe size={16} color={colors.text.secondary} />} label="Timezone" />
                <SelectInput
                  value={timezone}
                  onValueChange={setTimezone}
                  options={[
                    { label: 'UTC', value: 'UTC' },
                    { label: 'EST', value: 'EST' },
                    { label: 'PST', value: 'PST' },
                    { label: 'GMT', value: 'GMT' },
                  ]}
                />

                <FieldLabel icon={<User size={16} color={colors.text.secondary} />} label="Theme" />
                <SelectInput
                  value={theme}
                  onValueChange={setTheme}
                  options={[
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                    { label: 'Auto', value: 'auto' },
                  ]}
                />
              </Section>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

