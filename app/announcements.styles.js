import { StyleSheet } from 'react-native';

export const COLORS = {
  primary:      '#CA5D86',
  primaryLight: '#FFB0CE',
  bg:           '#FFF0F3',
  card:         '#FFFFFF',
  dark:         '#2D1B2E',
  muted:        '#B5B7C0',
  border:       '#E5ECF6',
  white:        '#FFFFFF',
};

export default StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
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

  // header
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // filter row
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  filterBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  weekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  weekBtnText: {
    color: COLORS.dark,
    fontSize: 13,
    fontWeight: '500',
  },

  // tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    marginRight: 24,
    paddingBottom: 10,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.dark,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  // loading / empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 40,
  },

  // list
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 12,
  },

  // card — compact, no extra space
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityBadge: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dotsBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
    lineHeight: 21,
  },
  cardPreview: {
    fontSize: 13,
    color: COLORS.dark,
    lineHeight: 19,
    marginBottom: 10,
  },

  // image — only renders when admin attaches one
  cardImageWrapper: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardImageCaption: {
    fontSize: 12,
    color: COLORS.muted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.bg,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 11,
    color: COLORS.muted,
  },
  filesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filesText: {
    fontSize: 11,
    color: COLORS.muted,
  },

  // bottom nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    paddingBottom: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  navCenter: {
    alignItems: 'center',
  },
  navCenterCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '500',
  },

  // dropdown modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 180,
    paddingLeft: 100,
  },
  dropdownBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.bg,
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

});