import { StyleSheet, Platform, StatusBar } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/scale';

export const COLORS = {
    primary: '#D63375',
    primaryLight: '#FFB0CE',
    background: '#FFF0F3',
    bg: '#FFF0F3',
    white: '#FFFFFF',
    card: '#FFFFFF',
    darkText: '#1C1C1C',
    dark: '#2D1B2E',
    grayText: '#9E9E9E',
    muted: '#B5B7C0',
    lightPink: '#FDE8F0',
    border: '#E5ECF6',
};

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
        backBtn: { padding: 4 },
        topRowRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        iconBtn: { position: 'relative' },
        notifDot: {
            position: 'absolute', top: 0, right: 0,
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: COLORS.primary,
        },
        avatar: { width: 36, height: 36, borderRadius: 18 },
    
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

    // ── scroll ────────────────────────────────────────────────────────────────
    scrollContent: {
        paddingBottom: verticalScale(100),
        paddingHorizontal: 20,
    },

    // ── loading / empty ───────────────────────────────────────────────────────
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        gap: 10,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.dark,
    },
    emptySubText: {
        fontSize: 13,
        color: COLORS.muted,
        textAlign: 'center',
    },

    // ── stats row ─────────────────────────────────────────────────────────────
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.muted,
        fontWeight: '500',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.dark,
    },

    // ── filter row ────────────────────────────────────────────────────────────
    filterRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 18,
        alignItems: 'center',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    filterBtnText: {
        fontSize: 13,
        color: COLORS.white,
        fontWeight: '600',
    },
    yearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    yearBtnText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // ── request card ──────────────────────────────────────────────────────────
    requestCard: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        // left accent bar via borderLeftWidth
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },

    // badges row at top of card
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    badge: {
        borderRadius: 20,
        paddingVertical: 3,
        paddingHorizontal: 10,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // title row
    cardTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 2,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.dark,
        flex: 1,
        marginRight: 8,
    },
    collapseBtn: {
        padding: 2,
    },
    cardCategory: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '500',
        marginBottom: 10,
    },

    // admin notes section
    notesLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.muted,
        marginBottom: 6,
    },
    noteItem: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 5,
    },
    noteTimestamp: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '600',
        flexShrink: 0,
    },
    noteText: {
        fontSize: 12,
        color: COLORS.dark,
        lineHeight: 17,
        flex: 1,
    },
    noteBold: {
        fontWeight: '700',
    },

    // card footer
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    reqId: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '600',
    },
    footerDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerDate: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '500',
    },

    // ── filter modal ──────────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    filterModal: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    filterModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterModalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.dark,
    },
    filterSectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.muted,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    filterChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 18,
    },
    filterChip: {
        borderRadius: 20,
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    filterChipActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.lightPink,
    },
    filterChipText: {
        fontSize: 13,
        color: COLORS.grayText,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    applyBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 4,
    },
    applyBtnText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // ── year dropdown ─────────────────────────────────────────────────────────
    yearDropdown: {
        position: 'absolute',
        top: 42,
        left: 0,
        backgroundColor: COLORS.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        zIndex: 100,
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
    },
    yearDropdownItem: {
        paddingVertical: 11,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    yearDropdownItemActive: {
        backgroundColor: COLORS.lightPink,
    },
    yearDropdownText: {
        fontSize: 13,
        color: COLORS.dark,
        fontWeight: '500',
    },
    yearDropdownTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    // ── bottom nav ────────────────────────────────────────────────────────────
        bottomNav: {
            flexDirection: 'row',
            backgroundColor: COLORS.white,
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
            color: COLORS.grayText,
            marginTop: 2,
        },
        navCenter: { marginTop: -22 },
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
