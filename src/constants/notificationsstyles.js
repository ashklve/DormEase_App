import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NOTIF_COLORS = {
    // Core — sourced from colors.js
    primary: '#D63375',
    primaryLight: '#FFB0CE',
    bg: '#FFF0F3',
    white: '#FFFFFF',
    card: '#FFFFFF',
    dark: '#2D1B2E',
    darkText: '#1C1C1C',
    muted: '#B5B7C0',
    grayText: '#9E9E9E',
    lightPink: '#FDE8F0',
    border: '#E5ECF6',

    // Derived from the palette
    cardUnread: '#FDE8F0',       // lightPink — soft pink tint for unread rows
    cardUnreadBorder: '#FFB0CE', // primaryLight — gentle pink border
    cardBorder: '#E5ECF6',       // border
    hint: '#B5B7C0',             // muted — timestamps, section labels
    divider: '#E5ECF6',          // border

    // Avatar backgrounds — harmonised with the pink palette
    avatarOrange: '#FFF0E6',
    avatarBlue: '#E6F0FF',
    avatarGreen: '#E6F7EF',
    avatarPurple: '#F0EAFF',
    avatarBrown: '#F2EAE0',
    avatarRed: '#FFE9E9',

    // Icon colors per notification type
    iconAnnouncement: '#F07A30',
    iconDocument: '#3A7FD5',
    iconBill: '#3A7FD5',
    iconPayment: '#2E9E6A',
    iconMaintenance: '#7D52C4',
    iconEmergency: '#E03E3E',
    iconVisitor: '#3A7FD5',
    iconDefault: '#D63375',      // primary
};

export default StyleSheet.create({

    /* ─── Screen wrapper ─── */
    container: {
        flex: 1,
        backgroundColor: NOTIF_COLORS.bg,
    },

    /* ─── Header section ─── */
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 12,
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
        backgroundColor: NOTIF_COLORS.primary,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: NOTIF_COLORS.dark,
        letterSpacing: -0.5,
        flexShrink: 1,
    },
    headerSub: {
        fontSize: 13,
        fontWeight: '600',
        color: NOTIF_COLORS.primary,
    },

    /* ─── Top row (back button, icons, avatar) ─── */
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 0) + 8,
        paddingBottom: 8,
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
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },

    /* ─── Unread badge on bell icon ─── */
    badgeWrap: {
        position: 'absolute',
        top: -7,
        right: -8,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 4,
        backgroundColor: '#E8175D',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        lineHeight: 12,
    },

    /* ─── Filter pills (icon-only circles) ─── */
    filterScroller: {
        flexGrow: 0,
        flexShrink: 0,
    },
    filterRow: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingRight: 24,
        alignItems: 'center',
        gap: 8,
    },
    filterPill: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderWidth: 1.5,
        borderColor: NOTIF_COLORS.border,
        backgroundColor: NOTIF_COLORS.white,
    },
    filterPillActive: {
        backgroundColor: NOTIF_COLORS.primary,
        borderColor: NOTIF_COLORS.primary,
    },

    /* ─── Tab / count row ─── */
    filterUnreadDot: {
        position: 'absolute',
        top: 7,
        right: 7,
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: NOTIF_COLORS.primary,
        borderWidth: 1.5,
        borderColor: NOTIF_COLORS.white,
    },

    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: NOTIF_COLORS.divider,
        marginBottom: 4,
    },
    tabCountText: {
        fontSize: 13,
        fontWeight: '600',
        color: NOTIF_COLORS.dark,
    },
    markAllBtn: {
        marginLeft: 'auto',
    },
    markAllText: {
        fontSize: 12,
        color: NOTIF_COLORS.primary,
        fontWeight: '600',
    },
    markAllTextDisabled: {
        fontSize: 12,
        color: NOTIF_COLORS.hint,
        fontWeight: '500',
    },

    /* ─── Date section label ─── */
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: NOTIF_COLORS.hint,
        letterSpacing: 1,
        textTransform: 'uppercase',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },

    /* ─── Thin divider between date groups ─── */
    groupDivider: {
        height: 1,
        backgroundColor: NOTIF_COLORS.divider,
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 4,
    },

    /* ─── Notification card ─── */
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: NOTIF_COLORS.card,
        marginHorizontal: 12,
        marginBottom: 8,
        borderRadius: 16,
        padding: 14,
        gap: 13,
        borderWidth: 1,
        borderColor: NOTIF_COLORS.cardBorder,
    },
    notificationItemUnread: {
        backgroundColor: NOTIF_COLORS.cardUnread,
        borderColor: NOTIF_COLORS.cardUnreadBorder,
    },

    /* ─── Avatar circle inside card ─── */
    notifAvatar: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },

    /* ─── Text content ─── */
    notifContent: {
        flex: 1,
        minWidth: 0,
    },
    notifTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: NOTIF_COLORS.dark,
        lineHeight: 18,
    },
    notifDescription: {
        fontSize: 12,
        color: NOTIF_COLORS.darkText,
        marginTop: 3,
        lineHeight: 18,
    },
    notifTime: {
        fontSize: 11,
        color: NOTIF_COLORS.darkText,
        marginTop: 6,
        fontWeight: '500',
    },

    /* ─── Unread indicator dot ─── */
    unreadDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: NOTIF_COLORS.primary,
        flexShrink: 0,
        marginTop: 5,
    },

    /* ─── Loading / empty states ─── */
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: NOTIF_COLORS.lightPink,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: NOTIF_COLORS.dark,
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 13,
        color: NOTIF_COLORS.muted,
        textAlign: 'center',
        lineHeight: 20,
    },

    /* ─── Bottom navigation ─── */
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: NOTIF_COLORS.white,
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
        backgroundColor: NOTIF_COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: NOTIF_COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
});
