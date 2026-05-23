import { StyleSheet, Platform, StatusBar } from 'react-native';
import { scale, verticalScale } from '../utils/scale';

export const COLORS = {
    primary:      '#D63375',
    primaryLight: '#FCE4EE',
    bg:           '#FFF5F8',
    card:         '#FFFFFF',
    dark:         '#1A1A2E',
    muted:        '#9E9E9E',
    grayText:     '#6B7280',
    border:       '#F0D6E0',
    white:        '#FFFFFF',
    success:      '#10B981',
    successLight: '#D1FAE5',
    warning:      '#F59E0B',
    warningLight: '#FEF3C7',
    info:         '#3B82F6',
    infoLight:    '#DBEAFE',
    denied:       '#EF4444',
    deniedLight:  '#FEE2E2',
    ready:        '#8B5CF6',
    readyLight:   '#EDE9FE',
};

export default StyleSheet.create({

    // container
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

    // page header
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 10,
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
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: 0,
        flexShrink: 1,
    },
    headerSub: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
    },

    // scroll content
    scrollContent: {
        paddingBottom: 100,
        paddingHorizontal: 20,
        paddingTop: 4,
    },

    // stats row
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 1,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.muted,
        flexShrink: 1,
    },

    // filter chips
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1.5,
        marginRight: 8,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
        flexShrink: 1,
    },

    // record card
    recordCard: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    accentBar: {
        height: 3,
    },
    cardBody: {
        padding: 14,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 10,
    },
    cardHeaderLeft: {
        flex: 1,
        minWidth: 0,
    },
    reqId: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 2,
    },
    docType: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.dark,
        lineHeight: 20,
    },

    // status badge
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },

    // meta row
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
        flexShrink: 1,
    },
    metaText: {
        fontSize: 11,
        color: COLORS.muted,
        flexShrink: 1,
    },
    metaGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 4,
    },

    // admin remarks
    remarksBox: {
        backgroundColor: '#FFF8F0',
        borderLeftWidth: 3,
        borderLeftColor: '#F59E0B',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        marginTop: 4,
    },
    remarksHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 3,
    },
    remarksLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#F59E0B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    remarksText: {
        fontSize: 12,
        color: '#92400E',
        lineHeight: 18,
    },

    // divider
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 12,
    },

    // file action buttons
    fileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
    },
    fileBtnTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    fileBtnIcon: {
        width: 34,
        height: 34,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileBtnTitle: {
        fontSize: 12,
        fontWeight: '700',
    },
    fileBtnSub: {
        fontSize: 11,
        marginTop: 1,
        flexShrink: 1,
    },

    // empty state
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 13,
        color: COLORS.muted,
        textAlign: 'center',
        lineHeight: 20,
    },

    // bottom nav — exact match of documentstyles
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
        color: COLORS.muted,
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
