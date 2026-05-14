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
    padding: 4,
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
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 2,
  },
  headerSub: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── loading ───────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── scroll content ────────────────────────────────────────────────────────
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
    marginBottom: verticalScale(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  summaryLabel: {
    fontSize: moderateScale(13),
    color: COLORS.grayText,
    fontWeight: '500',
    flex: 1,
  },
  summaryAmountDue: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: COLORS.dark,
  },
  summaryValue: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '600',
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: verticalScale(10),
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: moderateScale(13),
    color: COLORS.grayText,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },

  // ── breakdown rows inside summary card ───────────────────────────────────
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(6),
  },
  breakdownLabel: {
    fontSize: moderateScale(13),
    color: COLORS.grayText,
    fontWeight: '500',
    flex: 1,
  },
  breakdownValue: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '600',
    textAlign: 'right',
  },
  breakdownValueAccent: {
    fontSize: moderateScale(13),
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'right',
  },

  // ── section title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.dark,
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(12),
  },

  // ── payment method section ────────────────────────────────────────────────
  paymentMethodCard: {
    marginHorizontal: scale(20),
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(8),
    marginBottom: verticalScale(24),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(13),
    paddingHorizontal: scale(12),
    borderRadius: 10,
    gap: scale(12),
  },
  paymentOptionSelected: {
    backgroundColor: COLORS.lightPink,
  },
  radioOuter: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 2,
    borderColor: COLORS.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: COLORS.primary,
  },
  paymentOptionText: {
    fontSize: moderateScale(14),
    color: COLORS.dark,
    fontWeight: '500',
  },
  paymentOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  paymentOptionDivider: {
    height: 1,
    backgroundColor: '#F5EEF3',
    marginHorizontal: scale(12),
  },

  // ── proceed button ────────────────────────────────────────────────────────
  proceedBtnWrapper: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(10),
    alignItems: 'center',
  },
  proceedBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: verticalScale(14),
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  proceedBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  proceedBtnDisabled: {
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

});