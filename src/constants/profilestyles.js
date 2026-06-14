import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/scale';

const { width } = Dimensions.get('window');

export const COLORS = {
  primary:   '#D63375',
  bg:        '#FDE8F0',
  white:     '#FFFFFF',
  dark:      '#2D1B2E',
  muted:     '#B5B7C0',
  grayText:  '#6B6B6B',
  border:    '#ECECEC',
  inputBg:   '#F4F4F4',
  danger:    '#E74C3C',
  success:   '#27AE60',
  cardBg:    '#FFFFFF',
};

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },

  // ── Top Row — increased paddingTop to match dashboard ────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconBtn: {
    position: 'relative',
    padding: 4,
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
  },

  // ── Hero / Avatar Section ────────────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.border,
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 13,
    color: COLORS.grayText,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Temp Password Banner ─────────────────────────────────────────────────────
  tempBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#D4A017',
  },
  tempBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#7D5A00',
    fontWeight: '500',
  },

  // ── Section ──────────────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },

  // ── Info Card ────────────────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 20,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FBF0F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },

  // ── Password Card ────────────────────────────────────────────────────────────
  pwCard: {
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.grayText,
    marginBottom: 6,
    marginTop: 12,
  },
  inputLabel_first: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.grayText,
    marginBottom: 6,
    marginTop: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 46,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FBF0F4',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    height: 46,
  },
  eyeBtn: {
    padding: 4,
  },

  // ── Save Button ──────────────────────────────────────────────────────────────
  saveBtn: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // ── Toast ────────────────────────────────────────────────────────────────────
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  toastSuccess: {
    backgroundColor: '#E8F8EF',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  toastError: {
    backgroundColor: '#FDECEA',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  toastTextSuccess: { color: '#1A6E3C' },
  toastTextError:   { color: '#922B21' },

  // ── Bottom Nav — matches visitorsstyles exactly ──────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: verticalScale(10),
    paddingHorizontal: scale(10),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    marginTop: -22,             // ← lifts the center emergency button up
  },
  navCenterCircle: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  navLabel: {
    fontSize: 10,
    color: '#9E9E9E',           // ← matches visitors inactive label color
    marginTop: 2,
  },

  // ── Password inline error box ─────────────────────────────────────────────────
  pwErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F5C6C2',
  },
  pwErrorText: {
    flex: 1,
    fontSize: 13,
    color: '#922B21',
    fontWeight: '500',
    lineHeight: 18,
  },

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  skeletonBox: {
    backgroundColor: COLORS.border,
    borderRadius: 8,
  },
  checklist: {
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
  checkTextDone: {
    color: COLORS.dark,
  },
});

export default styles;