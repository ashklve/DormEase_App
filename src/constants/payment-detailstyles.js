import { StyleSheet, Platform, StatusBar } from 'react-native';
import { COLORS } from './colors';
import { scale, verticalScale, moderateScale } from '../utils/scale';

export default StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── top row ───────────────────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: Platform.OS === 'ios'
      ? verticalScale(54)
      : StatusBar.currentHeight + verticalScale(8),
    paddingBottom: verticalScale(8),
  },
  backBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  // ── header ────────────────────────────────────────────────────────────────
  headerSection: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(10),
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  headerIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 0,
  },
  headerSub: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── scroll ────────────────────────────────────────────────────────────────
  scrollContent: {
    paddingBottom: verticalScale(100),
    paddingTop: verticalScale(4),
  },

  // ── billing summary card ──────────────────────────────────────────────────
  summaryCard: {
    marginHorizontal: scale(20),
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
    padding: scale(16),
    marginBottom: verticalScale(20),
  },
  summaryCardLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: verticalScale(10),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
  },
  summaryLabel: {
    fontSize: moderateScale(13),
    color: COLORS.grayText,
    fontWeight: '500',
    flex: 1,
  },
  summaryAmountDue: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.dark,
  },
  summaryValue: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '600',
  },

  // ── step section ──────────────────────────────────────────────────────────
  stepSection: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  stepTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: verticalScale(10),
  },

  // ── QR code card ──────────────────────────────────────────────────────────
  qrCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(20),
  },
  qrImage: {
    width: scale(180),
    height: scale(180),
    borderRadius: 8,
    resizeMode: 'contain',
  },
  qrDownloadBtn: {
    position: 'absolute',
    top: scale(12),
    right: scale(12),
    padding: 4,
  },
  qrHint: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: verticalScale(10),
    lineHeight: 16,
  },

  // ── cash instruction card ─────────────────────────────────────────────────
  cashCard: {
    backgroundColor: COLORS.lightPink,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    padding: scale(16),
  },
  cashIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: verticalScale(10),
  },
  cashIconCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.dark,
  },
  cashInstruction: {
    fontSize: moderateScale(13),
    color: COLORS.grayText,
    lineHeight: 20,
    marginBottom: verticalScale(8),
  },
  cashHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  cashDueDateBox: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: verticalScale(4),
  },
  cashDueDateText: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '600',
  },

  // ── bank transfer card ────────────────────────────────────────────────────
  bankCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(16),
    marginBottom: verticalScale(12),
  },
  bankCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: verticalScale(12),
  },
  bankIconCircle: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankCardTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.dark,
  },
  bankCardSubtitle: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    marginTop: 1,
  },
  bankDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: verticalScale(12),
  },
  bankDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bankDetailLeft: {
    flex: 1,
  },
  bankDetailLabel: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    fontWeight: '500',
    marginBottom: 2,
  },
  bankDetailValue: {
    fontSize: moderateScale(14),
    color: COLORS.dark,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bankCopyBtn: {
    padding: scale(8),
    borderRadius: 8,
    backgroundColor: COLORS.lightPink,
    marginLeft: scale(8),
  },
  bankAmountNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
    marginTop: verticalScale(14),
    backgroundColor: COLORS.lightPink,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: scale(12),
  },
  bankAmountNoticeText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: COLORS.grayText,
    lineHeight: 18,
  },

  // ── bank how-to steps ─────────────────────────────────────────────────────
  bankStepsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(16),
  },
  bankStepsTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: verticalScale(10),
  },
  bankStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(10),
    marginBottom: verticalScale(10),
  },
  bankStepBullet: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  bankStepBulletText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: COLORS.white,
  },
  bankStepText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: COLORS.grayText,
    lineHeight: 19,
  },

  // ── upload box ────────────────────────────────────────────────────────────
  uploadBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(6),
  },
  uploadBoxWithImage: {
    borderStyle: 'solid',
    borderColor: COLORS.primary,
    paddingVertical: verticalScale(8),
  },
  uploadedImage: {
    width: '100%',
    height: verticalScale(160),
    borderRadius: 10,
    resizeMode: 'cover',
  },
  uploadText: {
    fontSize: moderateScale(13),
    color: COLORS.primary,
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    textAlign: 'center',
  },

  // ── reference input ───────────────────────────────────────────────────────
  refInput: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(14),
    fontSize: moderateScale(13),
    color: COLORS.dark,
  },
  refInputFocused: {
    borderColor: COLORS.primary,
  },

  // ── submit button ─────────────────────────────────────────────────────────
  submitBtnWrapper: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(10),
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: verticalScale(14),
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },

  // ── bottom nav ────────────────────────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
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
  navLabel: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 2,
  },
  navCenter: {
    marginTop: -22,
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
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border || '#F0F0F0',
    marginVertical: verticalScale(8),
  },
  summaryValueAccent: {
    fontSize: moderateScale(13),
    color: COLORS.primary,
    fontWeight: '700',
  },

});