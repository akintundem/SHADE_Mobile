import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';

export function useAuthStyles() {
  const { colors } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
        safeArea: { flex: 1, backgroundColor: colors.bg },
        scrollContent: {
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 24,
        },

        // Header
        headerWrap: {
          alignItems: 'center',
          marginBottom: 24,
        },
        logoCircle: {
          height: 64,
          width: 64,
          borderRadius: 32,
          backgroundColor: colors.textPrimary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        },
        title: {
          fontSize: 28,
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: 6,
        },
        subtitle: {
          fontSize: 16,
          color: colors.textSecondary,
        },

        // Actions
        actionsWrap: {
          marginTop: 16,
          marginBottom: 8,
        },
        spotifyBtn: {
          backgroundColor: '#1DB954',
          height: 52,
          borderRadius: 999,
          paddingHorizontal: 18,
          shadowColor: '#1DB954',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          overflow: 'hidden',
        },
        spotifyBtnInner: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        },
        leftIcon: {
          position: 'absolute',
          left: 18,
        },
        spotifyTextCentered: {
          color: '#fff',
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
        },

        recommendedRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 12,
        },
        recommendedText: { color: colors.textSecondary, fontSize: 14, marginLeft: 6 },

        // Divider
        orWrap: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 16,
        },
        hr: { flex: 1, height: 1, backgroundColor: colors.border },
        orText: {
          marginHorizontal: 12,
          color: colors.textSecondary,
          fontSize: 14,
        },

        // Form
        formWrap: {},
        inputWrap: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderRadius: 12,
          height: 52,
          paddingHorizontal: 14,
          marginBottom: 12,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        leadingIconSvg: { marginRight: 8 },
        input: {
          flex: 1,
          fontSize: 16,
          paddingVertical: 0,
          marginHorizontal: 8,
          color: colors.textPrimary,
        },
        trailingIconWrap: { paddingLeft: 6, paddingVertical: 6 },

        signInBtn: {
          height: 56,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.textPrimary,
          marginTop: 8,
        },
        signInBtnDisabled: { backgroundColor: colors.textSecondary },
        signInText: { color: '#fff', fontSize: 16, fontWeight: '600' },

        // Inverted primary button (e.g., Create account in dark mode)
        primaryInvertedBtn: {
          height: 56,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
        primaryInvertedText: {
          color: colors.textPrimary,
          fontSize: 16,
          fontWeight: '600',
        },

        signupRow: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 16,
        },
        signupMuted: { color: colors.textSecondary, fontSize: 15 },
        signupLink: { color: '#1DB954', fontSize: 15, fontWeight: '600' },

        // Footer
        footerWrap: { marginTop: 24, alignItems: 'center' },
        footerHr: {
          height: 1,
          backgroundColor: colors.border,
          alignSelf: 'stretch',
          marginBottom: 16,
        },
        footerText: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
        footerLink: { color: colors.textPrimary, fontWeight: '600' },
      }),
    [colors]
  );
}
