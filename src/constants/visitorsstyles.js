import { StyleSheet, Platform, StatusBar } from 'react-native';
import { COLORS } from './colors';
import { scale, verticalScale, moderateScale } from '../utils/scale';

export default StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── top row (matches announcements) ──────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: Platform.OS === 'ios' ? verticalScale(54) : StatusBar.currentHeight + verticalScale(8),
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

  // ── header ───────────────────────────────────────────────────────────────
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
    borderRadius: 12,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(14),
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    fontWeight: '500',
    marginBottom: verticalScale(4),
  },
  statValue: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.dark,
  },

  // ── section title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.dark,
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(10),
  },

  // ── registered visitor card ───────────────────────────────────────────────
  visitorCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: scale(20),
    borderRadius: 12,
    padding: scale(14),
    marginBottom: verticalScale(12),
  },
  visitorCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  approvedBadge: {
    backgroundColor: '#D4EDDA',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  approvedBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#28A745',
  },
  eyeBtn: {
    padding: 4,
  },
  visitorName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: verticalScale(4),
  },
  visitorDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visitorDate: {
    fontSize: moderateScale(12),
    color: COLORS.primary,
    fontWeight: '500',
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

  // ── inputs ────────────────────────────────────────────────────────────────
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

  // ── id type dropdown trigger ──────────────────────────────────────────────
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

  // ── id type dropdown list ─────────────────────────────────────────────────
  dropdownList: {
  backgroundColor: COLORS.card,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: COLORS.border,
  marginBottom: verticalScale(10),
  overflow: 'hidden',
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

  // ── date & time row ───────────────────────────────────────────────────────
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
    backgroundColor: '#8B1A4A',
    borderRadius: 10,
    paddingVertical: verticalScale(13),
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15),
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── bottom nav (identical to announcementsstyles) ─────────────────────────
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