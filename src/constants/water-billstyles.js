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

  // ── loading / empty ───────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: moderateScale(14),
    marginTop: verticalScale(40),
  },

  // ── scroll content ────────────────────────────────────────────────────────
  scrollContent: {
    paddingBottom: verticalScale(100),
    paddingTop: verticalScale(4),
  },

  // ── current billing card ──────────────────────────────────────────────────
  billingCard: {
    marginHorizontal: scale(20),
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
    padding: scale(16),
    marginBottom: verticalScale(20),
  },
  billingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  billingCardLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  billingCardDate: {
    fontSize: moderateScale(10),
    color: COLORS.muted,
    fontWeight: '500',
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  billingRowLabel: {
    fontSize: moderateScale(13),
    color: COLORS.grayText,
    fontWeight: '500',
  },
  billingAmountDue: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: COLORS.dark,
  },
  billingRowValue: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '600',
  },
  billingDivider: {
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
  billingNote: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    fontStyle: 'italic',
    marginTop: verticalScale(10),
  },

  // ── section title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.dark,
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(10),
  },

  // ── breakdown table ───────────────────────────────────────────────────────
  breakdownCard: {
    marginHorizontal: scale(20),
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: verticalScale(20),
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(11),
    paddingHorizontal: scale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F5EEF3',
  },
  breakdownRowLast: {
    borderBottomWidth: 0,
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
  superscript: {
    fontSize: moderateScale(9),
  },

  // ── payment history ───────────────────────────────────────────────────────
  historyCard: {
    marginHorizontal: scale(20),
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: verticalScale(20),
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F5EEF3',
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  historyMonth: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '600',
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyAmount: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '600',
  },
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  historyBadgeText: {
    fontSize: moderateScale(12),
    color: COLORS.success,
    fontWeight: '600',
  },

  // ── pay bill button ───────────────────────────────────────────────────────
  payBtnWrapper: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(10),
    alignItems: 'center',
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
  },
  payBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  payBtnDisabled: {
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
