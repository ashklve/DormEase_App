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
    marginBottom: verticalScale(14),
  },

  // ── scroll content ────────────────────────────────────────────────────────
  scrollContent: {
    paddingBottom: verticalScale(90),
  },

  // ── stats row ─────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    gap: scale(12),
    marginBottom: verticalScale(16),
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: verticalScale(13),
    paddingHorizontal: scale(13),
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTrendBadge: {
    borderRadius: 100,
    paddingHorizontal: scale(8),
    paddingVertical: 3,
  },
  statTrendText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  statValue: {
    fontSize: moderateScale(26),
    fontWeight: '700',
    color: COLORS.dark,
    lineHeight: moderateScale(28),
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    fontWeight: '400',
    marginTop: verticalScale(2),
  },

  // ── section title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.dark,
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(10),
  },

  // ── collapsible container ─────────────────────────────────────────────────
  collapseContainer: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(14),
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  collapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(11),
  },
  collapseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapseCountBadge: {
    backgroundColor: '#FBEAF0',
    borderRadius: 100,
    paddingHorizontal: scale(10),
    paddingVertical: 3,
  },
  collapseCountText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#993556',
  },
  collapseHeaderLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.dark,
  },
  collapseListDivider: {
    height: 0.5,
    backgroundColor: COLORS.border,
  },

  // ── visitor row (inside collapsible) ─────────────────────────────────────
  visitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    gap: scale(10),
  },
  visitorRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  visitorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FBEAF0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  visitorAvatarText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#993556',
  },
  visitorRowLeft: {
    flex: 1,
    minWidth: 0,
  },
  visitorRowName: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: verticalScale(3),
  },
  visitorRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  visitorMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.border,
  },
  visitorRowMetaText: {
    fontSize: moderateScale(10),
    color: COLORS.muted,
  },
  visitorRowBadge: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: scale(8),
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  visitorRowBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
  },

  // ── register form section ─────────────────────────────────────────────────
  formSection: {
    marginHorizontal: scale(20),
    marginTop: verticalScale(4),
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    padding: scale(14),
    marginBottom: verticalScale(20),
  },
  formSectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: verticalScale(12),
  },

  // ── text inputs ───────────────────────────────────────────────────────────
  input: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(14),
    fontSize: moderateScale(13),
    color: COLORS.dark,
    marginBottom: verticalScale(10),
  },

  // ── dropdown trigger ──────────────────────────────────────────────────────
  pickerWrapper: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  pickerText: {
    fontSize: moderateScale(13),
    color: COLORS.muted,
  },
  pickerTextSelected: {
    color: COLORS.dark,
  },

  // ── dropdown list ─────────────────────────────────────────────────────────
  dropdownList: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: verticalScale(10),
    maxHeight: verticalScale(180),
  },
  dropdownListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(11),
    paddingHorizontal: scale(14),
  },
  dropdownListItemActive: {
    backgroundColor: COLORS.bg,
  },
  dropdownListItemText: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '500',
  },
  dropdownListItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ── upload id box ─────────────────────────────────────────────────────────
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginBottom: verticalScale(10),
    backgroundColor: COLORS.bg,
  },
  uploadHint: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    marginBottom: verticalScale(8),
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(14),
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '90%',
  },
  uploadBtnText: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },

  // ── date & time ───────────────────────────────────────────────────────────
  dateTimeRow: {
    flexDirection: 'row',
    gap: scale(10),
    marginBottom: verticalScale(10),
  },
  dateTimeField: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    marginBottom: verticalScale(4),
    fontWeight: '500',
  },
  dateTimeInput: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: verticalScale(11),
    paddingHorizontal: scale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── submit button ─────────────────────────────────────────────────────────
  submitBtn: {
    backgroundColor: '#D63375',
    borderRadius: 10,
    paddingVertical: verticalScale(13),
    alignItems: 'center',
    marginTop: verticalScale(4),
    width: '70%',
    alignSelf: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15),
    fontWeight: '700',
    letterSpacing: 0.5,
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

export { COLORS };