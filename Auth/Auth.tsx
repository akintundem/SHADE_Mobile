import React from 'react';
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
import { AuthForm } from './components/AuthForm';
import { Footer } from './components/Footer';

export default function Auth() {
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
          <AuthButtons />
          <OrDivider />
          <AuthForm />
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
