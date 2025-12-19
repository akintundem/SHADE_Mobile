import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { User } from '../../auth/types/auth';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  user: User;
  onBack?: () => void;
  onSave?: (data: { name: string; username: string; bio?: string; website?: string; location?: string }) => void;
};

export default function EditProfileScreen({ user, onBack, onSave }: Props) {
  const { t } = useI18n();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [tab, setTab] = useState<'basic' | 'professional' | 'privacy'>('basic');
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState((user.name || user.email).toLowerCase().split('@')[0].replace(/\s+/g, '-'));
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: spacing.xl, 
          paddingVertical: spacing.lg,
          borderBottomWidth: 1, 
          borderColor: colors.divider 
        }}>
          <TouchableOpacity onPress={onBack} style={{ padding: spacing.xs }}>
            <ArrowLeft size={24} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size.lg }}>
            {t('EditProfile')}
          </Text>
          <TouchableOpacity
            onPress={() => onSave?.({ name, username, bio, website, location })}
            style={{ 
              backgroundColor: colors.text.primary, 
              borderRadius: borderRadius.full, 
              paddingHorizontal: spacing.lg, 
              paddingVertical: spacing.sm 
            }}
          >
            <Text style={{ color: colors.text.inverse, fontWeight: typography.weight.bold, fontSize: typography.size.sm }}>
              {t('Save')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wealthsimple-style Flat Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: spacing.xl, borderBottomWidth: 1, borderColor: colors.divider }}>
          {[
            { key: 'basic', label: t('Basic') },
            { key: 'professional', label: t('Professional') },
            { key: 'privacy', label: t('Privacy') },
          ].map(tabOption => (
            <TouchableOpacity
              key={tabOption.key}
              onPress={() => setTab(tabOption.key as any)}
              style={{ 
                paddingVertical: spacing.lg, 
                marginRight: spacing.xl,
                borderBottomWidth: tab === tabOption.key ? 2 : 0,
                borderBottomColor: colors.text.primary
              }}
            >
              <Text style={{ 
                color: tab === tabOption.key ? colors.text.primary : colors.text.tertiary, 
                fontWeight: tab === tabOption.key ? typography.weight.bold : typography.weight.medium,
                fontSize: typography.size.base
              }}>
                {tabOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView 
          contentContainerStyle={{ paddingBottom: spacing['4xl'], paddingTop: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {tab === 'basic' ? (
            <View style={{ paddingHorizontal: spacing.xl, gap: spacing.xl }}>
              <LabeledInput label={t('FullName')} value={name} onChangeText={setName} />
              <LabeledInput label={t('Username')} value={username} onChangeText={setUsername} prefix="@" />
              <LabeledTextArea label={t('Bio')} value={bio} onChangeText={setBio} maxLength={150} />
              <LabeledInput label={t('Website')} value={website} onChangeText={setWebsite} placeholder="yourwebsite.com" />
              <LabeledInput label={t('Location')} value={location} onChangeText={setLocation} placeholder={t('CityCountry')} />
            </View>
          ) : null}

          {tab === 'professional' ? (
            <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, alignItems: 'center' }}>
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.base }}>
                {t('ProfessionalSettingsComingSoon')}
              </Text>
            </View>
          ) : null}

          {tab === 'privacy' ? (
            <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, alignItems: 'center' }}>
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.base }}>
                {t('PrivacyControlsWillLiveHere')}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LabeledInput({ label, prefix, ...rest }: any) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ borderBottomWidth: 1, borderColor: colors.divider, paddingBottom: spacing.sm }}>
      <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {prefix ? <Text style={{ color: colors.text.secondary, marginRight: spacing.xs, fontSize: typography.size.base }}>{prefix}</Text> : null}
        <TextInput 
          {...rest} 
          style={{ 
            flex: 1, 
            color: colors.text.primary, 
            fontSize: typography.size.base,
            paddingVertical: spacing.xs,
          }} 
          placeholderTextColor={colors.text.disabled} 
        />
      </View>
    </View>
  );
}

function LabeledTextArea({ label, maxLength = 150, value, onChangeText }: any) {
  const { t } = useI18n();
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ borderBottomWidth: 1, borderColor: colors.divider, paddingBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.bold, textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </Text>
        <Text style={{ color: colors.text.disabled, fontSize: typography.size.xs }}>
          {(value?.length || 0)}/{maxLength}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={4}
        maxLength={maxLength}
        style={{ 
          color: colors.text.primary, 
          fontSize: typography.size.base,
          minHeight: 80,
          paddingVertical: spacing.xs,
        }}
        placeholder={t('TellPeopleAboutYourself')}
        placeholderTextColor={colors.text.disabled}
      />
    </View>
  );
}

