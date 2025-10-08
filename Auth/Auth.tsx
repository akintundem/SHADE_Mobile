import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Header } from './components/Header';
import { AuthButtons } from './components/AuthButtons';
import { OrDivider } from './components/OrDivider';
import { SignInForm } from './components/SignInForm';
import { SignUpForm } from './components/SignUpForm';
import { CompleteProfile } from './components/CompleteProfile';
import { Footer } from './components/Footer';
import { userService } from '../services/userService';
import { setUser } from '../storage/authStorage';
import { User } from '../types';

type Props = { onLogin?: (user: User) => void };

export default function Auth({ onLogin }: Props) {
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'completeProfile'>('signIn');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Header />
          <AuthButtons
            onSpotifyPress={() =>
              onLogin?.({
                id: 'spotify-dev',
                email: 'dev+spotify@auree.app',
                name: 'Auree Tester',
                provider: 'spotify',
              })
            }
          />
          <OrDivider />
          {mode === 'signIn' ? (
            <SignInForm onLogin={onLogin} onSwitchToSignUp={() => setMode('signUp')} />
          ) : mode === 'signUp' ? (
            <SignUpForm
              onSignedUp={({ email, requiresProfile, user }) => {
                setPendingEmail(email);
                if (requiresProfile) setMode('completeProfile');
                else onLogin?.({ id: user.userId, email: user.email, name: user.username, provider: 'password' });
              }}
              onSwitchToSignIn={() => setMode('signIn')}
            />
          ) : (
            <CompleteProfile
              email={pendingEmail || ''}
              onBack={() => setMode('signUp')}
              onComplete={async ({ name, username, dateOfBirth, profilePictureUrl }) => {
                const updated = await userService.completeProfile({ fullName: name, username, dateOfBirth, profilePictureUrl });
                await setUser(updated);
                onLogin?.({ id: updated.userId, email: updated.email, name: updated.username || name, provider: 'password' });
              }}
            />
          )}
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
