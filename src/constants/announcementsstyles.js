import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
import { COLORS } from './colors';

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
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingtop: 6,
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
    paddingTop: 0,
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
  backgroundColor: '#FFFFFF',
  paddingBottom: 34,
  paddingTop: 10,
  paddingHorizontal: 10,
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
  width: 56,
  height: 56,
  borderRadius: 28,
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
    gap: 14,
  },
  drawerItemText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
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

});

export { COLORS };