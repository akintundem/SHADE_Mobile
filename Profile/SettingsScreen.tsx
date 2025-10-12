import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity, Switch } from 'react-native';
import { ChevronRight, Lock, Bell, Shield, User, Globe, HardDrive, Accessibility, HelpCircle, Info, FlagTriangleRight, LogOut, Download, XCircle, Trash2, Palette } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';

type RowProps = {
  icon: any;
  title: string;
  subtitle?: string;
  end?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
};

const Row = ({ icon: Icon, title, subtitle, end, onPress, danger }: RowProps) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress} style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FFFFFF' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
      <Icon size={18} color={danger ? '#ef4444' : '#111827'} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: danger ? '#ef4444' : '#111827', fontWeight: '600' }}>{title}</Text>
        {subtitle ? <Text style={{ color: '#6B7280', marginTop: 2 }} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
    </View>
    {end ? end : <ChevronRight size={16} color="#9CA3AF" />}
  </TouchableOpacity>
);

export default function SettingsScreen({ onClose, onLogout }: { onClose?: () => void; onLogout?: () => void }) {
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const { isDark, setDark } = useTheme();
  const { lang, setLang, t } = useI18n();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0B0F14' : '#F9FAFB' }}>
      <ScrollView>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: isDark ? '#111827' : '#FFFFFF', borderBottomWidth: 1, borderColor: isDark ? '#1F2937' : '#F3F4F6' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#F9FAFB' : '#111827' }}>{t('Settings')}</Text>
          <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 4 }}>@aure-guest</Text>
        </View>

        <Section title="Account" />
        <Row icon={User} title="Edit Profile" subtitle="Update your profile information" />
        <Row icon={Lock} title="Privacy and Safety" subtitle="Control who can see your content" />
        <Row icon={Bell} title="Notifications" subtitle="Manage your notification preferences" />
        <Row icon={Shield} title="Security" subtitle="Two-factor authentication and more" end={<Text style={{ color: '#111827' }}>Setup recommended</Text>} />

        <Section title="Quick Settings" />
        <Row icon={Lock} title="Private Account" subtitle="Only followers can see your posts" end={<Switch value={isPrivate} onValueChange={setIsPrivate} />} />
        <Row icon={Bell} title="Push Notifications" subtitle="Get notified about activity" end={<Switch value={pushEnabled} onValueChange={setPushEnabled} />} />
        <Row icon={Palette} title="Theme" subtitle={isDark ? 'Dark' : 'Light'} onPress={() => setDark(!isDark)} end={<Switch value={isDark} onValueChange={setDark} />} />

        <Section title="App Preferences" />
        <Row 
          icon={Globe} 
          title={t('Language')} 
          subtitle={lang === 'en' ? t('English') : t('French')} 
          end={(
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => setLang('en')} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: lang === 'en' ? '#111827' : '#F3F4F6' }}>
                <Text style={{ color: lang === 'en' ? '#FFFFFF' : '#111827' }}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLang('fr')} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: lang === 'fr' ? '#111827' : '#F3F4F6' }}>
                <Text style={{ color: lang === 'fr' ? '#FFFFFF' : '#111827' }}>FR</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <Row icon={HardDrive} title="Data and Storage" subtitle="Manage downloads and storage" />
        <Row icon={Accessibility} title="Accessibility" subtitle="Features to improve your experience" />

        <Section title="Support & About" />
        <Row icon={HelpCircle} title="Help Center" subtitle="Get support and find answers" />
        <Row icon={Info} title="About" subtitle="App version and legal information" />
        <Row icon={FlagTriangleRight} title="Report a Problem" subtitle="Let us know about any issues" />

        <Section title="Account Management" />
        <Row icon={LogOut} title="Log Out" subtitle="Sign out of your account" onPress={onLogout} />

        <Section title="Danger Zone" />
        <Row icon={Download} title="Download Your Data" subtitle="Request a copy of your information" />
        <Row icon={XCircle} title="Deactivate Account" subtitle="Temporarily disable your account" />
        <Row icon={Trash2} title="Delete Account" subtitle="Permanently delete your account and data" danger />

        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ color: '#6B7280' }}>Auree v1.0.0</Text>
          <Text style={{ color: '#9CA3AF', marginTop: 6 }}>Terms   Privacy   Cookies</Text>
          <Text style={{ color: '#9CA3AF', marginTop: 4 }}>© 2025 Auree. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Section = ({ title }: { title: string }) => (
  <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
    <Text style={{ color: '#6B7280', fontWeight: '600' }}>{title}</Text>
  </View>
);

