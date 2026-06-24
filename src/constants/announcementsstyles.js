import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { COLORS } from './colors';
import { scale, verticalScale, moderateScale, W, H } from '../utils/scale';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
    flexShrink: 0,
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
    flexShrink: 1,
  },
  headerSub: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.primary,
  },

  // filter row
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
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
    flexShrink: 1,
  },
  weekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
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
    flexShrink: 1,
  },

  // tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap: 'wrap',
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
    padding: scale(14),
    overflow: 'visible',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  cardPinnedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: COLORS.primary + '35',
  },
  priorityBadge: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  dotsBtn: {
    width: 40,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardUnreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  cardUnreadDotText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 12,
  },
  cardTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
    lineHeight: 21,
  },
  cardPreview: {
    fontSize: moderateScale(13),
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
    flexWrap: 'wrap',
    gap: 6,
  },
  cardDate: {
    fontSize: 11,
    color: COLORS.muted,
    flexShrink: 1,
  },
  filesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filesText: {
    fontSize: 11,
    color: COLORS.muted,
    flexShrink: 1,
  },

  // bottom nav
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

  // dropdown modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: H * 0.22,
    paddingLeft: scale(20),
    paddingRight: scale(20),
  },
  dropdownBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 180,
    maxWidth: '100%',
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

  // notification items
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
  },
  notifAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifAvatarText: {
    fontSize: 24,
  },
  notifContent: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: 18,
  },
  notifDescription: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 6,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },

  // dashboard styles
  greeting: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  greetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  greetSub: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 3,
  },

  // user card
  userCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRoom: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },

  // quick actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    width: '47%',
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 16,
  },

  // announcements
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  seeAll: {
    color: COLORS.muted,
    fontSize: 13,
  },
  announcementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  announceMegaphone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    flexShrink: 1,
  },
  announceDate: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  announceText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  viewBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexShrink: 0,
  },
  viewBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // drawer related styles for dashboard
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 10,
  },

  // drawer container — slides in from the left
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: COLORS.primary,
    zIndex: 20,
    paddingBottom: 30,
  },

  // drawer top section with user info
  drawerTop: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  drawerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  drawerUsername: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  drawerRoom: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },

  // close button on the top right of the drawer
  drawerCloseBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // divider line between sections in drawer
  drawerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
    marginBottom: 10,
  },

  // each nav item row in the drawer
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 14,
  },
  drawerItemText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },

  // sub items shown when documents is expanded
  drawerSubItem: {
    paddingLeft: 54,
    paddingVertical: 8,
  },
  drawerSubItemText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },

  // logout button at the bottom of the drawer
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 'auto',
  },
  drawerLogoutText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
  },

  // Modal Detail Styles
  modalRoot: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  modalScrollContent: {
    paddingBottom: verticalScale(40),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: 'transparent',
  },
  modalBackBtn: {
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
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  modalHeaderTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.dark,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalDetailBody: {
    margin: scale(16),
    padding: scale(18),
    borderRadius: 20,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  modalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    gap: 12,
  },
  modalAdminAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalAdminInfo: {
    flex: 1,
    minWidth: 0,
  },
  modalAdminNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  modalAdminName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.dark,
  },
  modalVerifiedIcon: {
    marginTop: 1,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalMetaText: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    fontWeight: '500',
  },
  modalMetaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D2DA',
    marginHorizontal: 2,
  },
  modalPriorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  modalPriorityText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modalTitleSection: {
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F5EEF3',
    marginBottom: verticalScale(12),
  },
  modalTitle: {
    fontSize: moderateScale(21),
    fontWeight: '800',
    color: COLORS.dark,
    lineHeight: 28,
  },
  modalReadTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: verticalScale(6),
  },
  modalReadTimeText: {
    fontSize: moderateScale(12),
    color: COLORS.muted,
    fontWeight: '500',
  },
  modalContentSection: {
    paddingBottom: verticalScale(14),
  },
  modalContent: {
    fontSize: moderateScale(14.5),
    color: '#495057',
    lineHeight: 25,
    fontWeight: '500',
  },
  modalImageWrapper: {
    marginTop: verticalScale(8),
    marginBottom: verticalScale(18),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    width: '100%',
  },
  modalImage: {
    width: '100%',
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: verticalScale(14),
  },
  modalAttachSection: {
    gap: 10,
    marginTop: verticalScale(4),
  },
  modalAttachTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: verticalScale(2),
  },
  modalAttachTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.dark,
  },
  modalAttachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: scale(10),
    borderWidth: 1,
    borderColor: '#EAEAEA',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  modalAttachTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  modalAttachIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAttachName: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '600',
  },
  modalAttachType: {
    fontSize: moderateScale(11),
    color: COLORS.muted,
    marginTop: 2,
  },
  modalAttachActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 2,
  },
  readMoreText: {
    fontSize: moderateScale(11),
    color: '#CA5D86',
    fontWeight: '500',
    flexShrink: 1,
  },

  // Search Bar Styles
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E5ECF6',
    // Premium Drop Shadow
    shadowColor: '#CA5D86',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF9FC',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    padding: 0,
  },
  searchResultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: -4,
  },
  searchResultsText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  searchClearBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  searchClearBadgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Offline Banner Styles
  offlineBanner: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFD3D3',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  offlineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DF0404',
  },
  offlineText: {
    fontSize: 12,
    color: COLORS.muted,
  },

  // Image Lightbox Styles
  lightboxContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(20),
    right: scale(20),
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  lightboxScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },

  // Carousel Styles
  carouselDotContainer: {
    position: 'absolute',
    bottom: verticalScale(12),
    flexDirection: 'row',
    alignSelf: 'center',
    gap: scale(6),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    borderRadius: scale(12),
  },
  carouselDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  carouselDotActive: {
    backgroundColor: COLORS.white,
    width: scale(14),
  },

});

export { COLORS };
