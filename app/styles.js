import { StyleSheet, Dimensions } from 'react-native';

// used for the drawer width
const SCREEN_WIDTH = Dimensions.get('window').width;

export const COLORS = {
  primary: '#D63375',
  background: '#F5F3EE',
  white: '#FFFFFF',
  darkText: '#1C1C1C',
  grayText: '#9E9E9E',
  lightPink: '#FDE8F0',
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,       // removed extra top padding, safeareview handles it
    paddingBottom: 12,
    paddingTop: 12,
    backgroundColor: COLORS.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  // greeting
  greeting: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  greetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    color: COLORS.darkText,
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
    backgroundColor: COLORS.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 11,
    color: COLORS.grayText,
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
    color: COLORS.grayText,
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
    backgroundColor: COLORS.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  announceDate: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 2,
  },
  announceText: {
    fontSize: 12,
    color: COLORS.grayText,
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

  // bottom nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
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
    color: COLORS.grayText,
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

  // drawer overlay — dark background behind the drawer when its open
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

export default styles;