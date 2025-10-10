import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity, Switch } from 'react-native';
import { ChevronRight, Lock, Bell, Shield, User, Globe, HardDrive, Accessibility, HelpCircle, Info, FlagTriangleRight, LogOut, Download, XCircle, Trash2, Palette } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';

type RowProps = {
  icon: any;
  title: string;
  subtitle?: string;
  end?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
};

const Row = ({ icon: Icon, title, subtitle, end, onPress, danger }: RowProps) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <Icon size={18} color={danger ? '#ef4444' : colors.textPrimary} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: danger ? '#ef4444' : colors.textPrimary, fontWeight: '600' }}>{title}</Text>
          {subtitle ? <Text style={{ color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>
      {end ? end : <ChevronRight size={16} color={colors.textSecondary} />}
    </TouchableOpacity>
  );
};

export default function SettingsScreen({ onClose, onLogout }: { onClose?: () => void; onLogout?: () => void }) {
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const { isDark, setDark, colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <ScrollView>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>Settings</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>@aure-guest</Text>
        </View>

        <Section title="Account" />
        <Row icon={User} title="Edit Profile" subtitle="Update your profile information" />
        <Row icon={Lock} title="Privacy and Safety" subtitle="Control who can see your content" />
        <Row icon={Bell} title="Notifications" subtitle="Manage your notification preferences" />
        <Row icon={Shield} title="Security" subtitle="Two-factor authentication and more" end={<Text style={{ color: colors.textPrimary }}>Setup recommended</Text>} />

        <Section title="Quick Settings" />
        <Row icon={Lock} title="Private Account" subtitle="Only followers can see your posts" end={<Switch value={isPrivate} onValueChange={setIsPrivate} />} />
        <Row icon={Bell} title="Push Notifications" subtitle="Get notified about activity" end={<Switch value={pushEnabled} onValueChange={setPushEnabled} />} />
        <Row icon={Palette} title="Theme" subtitle={isDark ? 'Dark' : 'Light'} onPress={() => setDark(!isDark)} end={<Switch value={isDark} onValueChange={setDark} />} />

        <Section title="App Preferences" />
        <Row icon={Globe} title="Language" subtitle="English (US)" />
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
          <Text style={{ color: colors.textSecondary }}>Shade v1.0.0</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 6 }}>Terms   Privacy   Cookies</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>© 2025 Shade. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Section = ({ title }: { title: string }) => {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
      <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{title}</Text>
    </View>
  );
};

