import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#fff' },
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
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
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
  recommendedText: { color: '#6B7280', fontSize: 14, marginLeft: 6 },

  // Divider
  orWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  hr: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: {
    marginHorizontal: 12,
    color: '#6B7280',
    fontSize: 14,
  },

  // Form
  formWrap: {},
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  leadingIconSvg: { marginRight: 8 },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    paddingVertical: 0,
    marginHorizontal: 8,
  },
  trailingIconWrap: { paddingLeft: 6, paddingVertical: 6 },

  signInBtn: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    marginTop: 8,
  },
  signInBtnDisabled: { backgroundColor: '#9CA3AF' },
  signInText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupMuted: { color: '#6B7280', fontSize: 15 },
  signupLink: { color: '#1DB954', fontSize: 15, fontWeight: '600' },

  // Footer
  footerWrap: { marginTop: 24, alignItems: 'center' },
  footerHr: {
    height: 1,
    backgroundColor: '#E5E7EB',
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  footerText: { color: '#6B7280', fontSize: 12, textAlign: 'center' },
  footerLink: { color: '#111827', fontWeight: '600' },
});
