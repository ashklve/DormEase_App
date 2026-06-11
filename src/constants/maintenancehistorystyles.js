import { StyleSheet, Platform, StatusBar } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/scale';

export const COLORS = {
    primary:      '#D63375',
    primaryLight: '#FFB0CE',
    background:   '#FFF0F3',
    bg:           '#FFF0F3',
    white:        '#FFFFFF',
    card:         '#FFFFFF',
    darkText:     '#1C1C1C',
    dark:         '#2D1B2E',
    grayText:     '#9E9E9E',
    muted:        '#B5B7C0',
    lightPink:    '#FDE8F0',
    border:       '#F0D6E2',
};

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    // ── top row ───────────────────────────────────────────────────────────────
    topRow: {
        flexDirection:    'row',
        justifyContent:   'space-between',
        alignItems:       'center',
        paddingHorizontal: scale(16),
        paddingTop: Platform.OS === 'ios'
            ? verticalScale(54)
            : StatusBar.currentHeight + verticalScale(8),
        paddingBottom: verticalScale(8),
    },
    backBtn:     { padding: 4 },
    topRowRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBtn:     { position: 'relative' },
    avatar:      { width: 36, height: 36, borderRadius: 18 },

    // ── header ────────────────────────────────────────────────────────────────
    headerSection: {
        paddingHorizontal: scale(20),
        paddingTop:        verticalScale(4),
        paddingBottom:     verticalScale(10),
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           10,
        marginBottom:  4,
    },
    headerIconBadge: {
        width:           34,
        height:          34,
        borderRadius:    10,
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: COLORS.primary,
    },
    headerTitle: {
        fontSize:   moderateScale(24),
        fontWeight: '700',
        color:      COLORS.dark,
    },
    headerSub: {
        fontSize:   moderateScale(13),
        fontWeight: '600',
        color:      COLORS.primary,
    },

    // ── scroll ────────────────────────────────────────────────────────────────
    scrollContent: {
        paddingBottom:     verticalScale(100),
        paddingHorizontal: 16,
    },

    // ── loading / empty ───────────────────────────────────────────────────────
    loadingContainer: {
        flex:           1,
        justifyContent: 'center',
        alignItems:     'center',
    },
    emptyContainer: {
        alignItems:        'center',
        marginTop:          60,
        gap:                12,
        paddingHorizontal: 32,
    },
    emptyIconWrap: {
        width:           68,
        height:          68,
        borderRadius:    34,
        backgroundColor: COLORS.lightPink,
        alignItems:      'center',
        justifyContent:  'center',
        marginBottom:    4,
    },
    emptyText: {
        fontSize:   15,
        fontWeight: '700',
        color:      COLORS.dark,
    },
    emptySubText: {
        fontSize:   13,
        color:      COLORS.muted,
        textAlign:  'center',
        lineHeight: 19,
    },

    // ── stats row ─────────────────────────────────────────────────────────────
    statsRow: {
        flexDirection: 'row',
        gap:           10,
        marginBottom:  16,
    },
    statCard: {
        flex:              1,
        backgroundColor:   COLORS.card,
        borderRadius:      14,
        paddingVertical:   12,
        paddingHorizontal: 12,
        borderWidth:       1,
        borderColor:       COLORS.border,
        alignItems:        'flex-start',
    },
    statCardPending:  { borderTopWidth: 3, borderTopColor: '#D97706' },
    statCardProgress: { borderTopWidth: 3, borderTopColor: '#2563EB' },
    statCardResolved: { borderTopWidth: 3, borderTopColor: '#16A34A' },
    statIconWrap: {
        width:           28,
        height:          28,
        borderRadius:    8,
        backgroundColor: '#FEF3C7',
        alignItems:      'center',
        justifyContent:  'center',
        marginBottom:    8,
    },
    statIconProgress: { backgroundColor: '#DBEAFE' },
    statIconResolved: { backgroundColor: '#DCFCE7' },
    statLabel: {
        fontSize:      10,
        color:         COLORS.muted,
        fontWeight:    '600',
        marginBottom:  2,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    statValue: {
        fontSize:   22,
        fontWeight: '700',
        color:      COLORS.dark,
        lineHeight: 26,
    },
    statSub: {
        fontSize:  10,
        color:     COLORS.muted,
        fontWeight:'400',
        marginTop: 2,
    },

    // ── filter row ────────────────────────────────────────────────────────────
    filterRow: {
        flexDirection: 'row',
        gap:           10,
        marginBottom:  14,
        alignItems:    'center',
        zIndex:        20,
    },
    dropdownWrapper: {
        position:   'relative',
        flexShrink: 0,
    },
    filterBtn: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               6,
        backgroundColor:   COLORS.primary,
        borderRadius:      20,
        paddingVertical:   8,
        paddingHorizontal: 14,
    },
    filterBtnText: {
        fontSize:   13,
        color:      COLORS.white,
        fontWeight: '600',
    },
    priorityBtn: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               6,
        backgroundColor:   COLORS.white,
        borderRadius:      20,
        paddingVertical:   8,
        paddingHorizontal: 14,
        borderWidth:       1.5,
        borderColor:       COLORS.primary,
    },
    priorityBtnText: {
        fontSize:   13,
        color:      COLORS.primary,
        fontWeight: '600',
    },
    resultCount: {
        marginLeft: 'auto',
        fontSize:   12,
        color:      COLORS.muted,
        fontWeight: '500',
    },

    // ── request card ──────────────────────────────────────────────────────────
    requestCard: {
        backgroundColor: COLORS.card,
        borderRadius:    16,
        marginBottom:    12,
        borderWidth:     1,
        borderColor:     COLORS.border,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        overflow:        'hidden',
    },

    // ── card header ───────────────────────────────────────────────────────────
    cardHeader: {
        padding: 14,
        gap:     8,
    },

    // chip + req id top row
    chipIdRow: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
    },
    categoryChip: {
        flexDirection:     'row',
        alignItems:        'center',
        alignSelf:         'flex-start',
        gap:               4,
        backgroundColor:   COLORS.lightPink,
        borderRadius:      20,
        paddingVertical:   3,
        paddingHorizontal: 10,
    },
    categoryChipText: {
        fontSize:   11,
        color:      COLORS.primary,
        fontWeight: '600',
    },
    reqIdPill: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           3,
    },
    reqIdPillText: {
        fontSize:   11,
        color:      COLORS.muted,
        fontWeight: '600',
    },

    // title row
    cardTitleRow: {
        flexDirection:  'row',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
    },
    cardTitle: {
        fontSize:   14,
        fontWeight: '700',
        color:      COLORS.dark,
        flex:       1,
        marginRight: 8,
        lineHeight:  20,
    },
    collapseBtn: {
        padding:         4,
        borderRadius:    8,
        backgroundColor: COLORS.lightPink,
    },
    deleteBtn: {
        padding:         4,
        borderRadius:    8,
        backgroundColor: COLORS.lightPink,
    },

    // badges row
    badgeRow: {
        flexDirection: 'row',
        gap:           6,
        flexWrap:      'wrap',
    },
    badge: {
        borderRadius:      20,
        paddingVertical:    3,
        paddingHorizontal: 10,
    },
    badgeText: {
        fontSize:   11,
        fontWeight: '600',
    },

    // resubmission indicator badge (shown in collapsed state)
    resubmitIndicatorBadge: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               4,
        backgroundColor:   '#FEF3C7',
        borderRadius:      20,
        paddingVertical:    3,
        paddingHorizontal: 10,
        borderWidth:       1,
        borderColor:       '#FDE68A',
    },
    resubmitIndicatorText: {
        fontSize:   11,
        color:      '#92400E',
        fontWeight: '600',
    },

    // ── card divider ──────────────────────────────────────────────────────────
    cardDivider: {
        height:          1,
        backgroundColor: COLORS.border,
        marginHorizontal: 14,
    },

    // ── card body ─────────────────────────────────────────────────────────────
    cardBody: {
        padding: 14,
        gap:     10,
    },

    // ── attached photo ────────────────────────────────────────────────────────
    photoBlock: {
        borderRadius: 12,
        overflow:     'hidden',
        borderWidth:  1,
        borderColor:  COLORS.border,
    },
    photoBlockHeader: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               5,
        paddingHorizontal: 10,
        paddingVertical:   7,
        backgroundColor:   COLORS.lightPink,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    photoBlockLabel: {
        fontSize:   11,
        fontWeight: '700',
        color:      COLORS.primary,
    },
    photoImage: {
        width:  '100%',
        height: 160,
    },
    photoPlaceholder: {
        height:         80,
        alignItems:     'center',
        justifyContent: 'center',
        gap:            5,
        backgroundColor: COLORS.bg,
    },
    photoPlaceholderText: {
        fontSize:  11,
        color:     COLORS.muted,
        fontStyle: 'italic',
    },

    // ── resubmission banner (amber tone) ──────────────────────────────────────
    resubmitBanner: {
        borderRadius:    12,
        overflow:        'hidden',
        borderWidth:     1,
        borderColor:     '#FDE68A',
    },
    resubmitBannerHeader: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               6,
        paddingHorizontal: 12,
        paddingVertical:   9,
        backgroundColor:   '#FEF3C7',
        borderBottomWidth: 1,
        borderBottomColor: '#FDE68A',
    },
    resubmitBannerTitle: {
        fontSize:      11,
        fontWeight:    '800',
        color:         '#92400E',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    resubmitBannerBody: {
        padding:         12,
        gap:             10,
        backgroundColor: COLORS.white,
    },
    resubmitReasonBox: {
        backgroundColor: COLORS.bg,
        borderRadius:    8,
        padding:         10,
        borderWidth:     1,
        borderColor:     COLORS.border,
    },
    resubmitReason: {
        fontSize:   12,
        color:      COLORS.dark,
        lineHeight: 18,
    },
    resubmitReasonBold: {
        fontWeight: '700',
        color:      '#92400E',
    },
    resubmitBtn: {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'center',
        gap:               8,
        backgroundColor:   COLORS.primary,
        borderRadius:      10,
        paddingVertical:   11,
        paddingHorizontal: 16,
    },
    resubmitBtnText: {
        fontSize:   13,
        fontWeight: '700',
        color:      COLORS.white,
    },

    // ── admin notes block ─────────────────────────────────────────────────────
    notesBlock: {
        backgroundColor: COLORS.bg,
        borderRadius:    10,
        padding:         10,
        gap:             6,
        borderWidth:     1,
        borderColor:     COLORS.border,
    },
    notesBlockHeader: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           5,
        marginBottom:  2,
    },
    notesLabel: {
        fontSize:      11,
        fontWeight:    '700',
        color:         COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noteItem: {
        gap: 3,
    },
    noteTimestamp: {
        fontSize:   11,
        color:      COLORS.primary,
        fontWeight: '600',
    },
    noteText: {
        fontSize:   12,
        color:      COLORS.dark,
        lineHeight: 17,
    },
    noteBold: {
        fontWeight: '700',
    },
    noNotesText: {
        fontSize:  12,
        color:     COLORS.muted,
        fontStyle: 'italic',
    },

    // ── card footer ───────────────────────────────────────────────────────────
    cardFooter: {
        flexDirection:   'row',
        justifyContent:  'space-between',
        alignItems:      'center',
        paddingVertical:   10,
        paddingHorizontal: 14,
        borderTopWidth:  1,
        borderTopColor:  COLORS.border,
    },
    footerDateRow: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           4,
    },
    footerDate: {
        fontSize:   12,
        color:      COLORS.muted,
        fontWeight: '500',
    },
    footerToggle: {
        paddingVertical:   3,
        paddingHorizontal: 10,
        borderRadius:      20,
        borderWidth:       1,
        borderColor:       COLORS.border,
    },
    footerToggleText: {
        fontSize:   11,
        color:      COLORS.primary,
        fontWeight: '600',
    },

    // ── dropdown filters ──────────────────────────────────────────────────────
    filterDropdown: {
        position:        'absolute',
        top:             42,
        left:            0,
        backgroundColor: COLORS.card,
        borderRadius:    10,
        borderWidth:     1,
        borderColor:     COLORS.border,
        zIndex:          100,
        minWidth:        140,
        shadowColor:     '#000',
        shadowOffset:    { width: 0, height: 4 },
        shadowOpacity:   0.08,
        shadowRadius:    8,
        elevation:       6,
    },
    filterDropdownItem: {
        paddingVertical:   11,
        paddingHorizontal: 16,
        flexDirection:     'row',
        justifyContent:    'space-between',
        alignItems:        'center',
    },
    filterDropdownItemActive: {
        backgroundColor: COLORS.lightPink,
    },
    filterDropdownText: {
        fontSize:   13,
        color:      COLORS.dark,
        fontWeight: '500',
    },
    filterDropdownTextActive: {
        color:      COLORS.primary,
        fontWeight: '700',
    },

    // ── bottom nav ────────────────────────────────────────────────────────────
    bottomNav: {
        flexDirection:     'row',
        backgroundColor:   COLORS.white,
        paddingBottom:     Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
        paddingTop:        verticalScale(10),
        paddingHorizontal: scale(10),
        borderTopWidth:    1,
        borderTopColor:    '#F0F0F0',
        position:          'absolute',
        bottom:            0,
        left:              0,
        right:             0,
    },
    navItem: {
        flex:           1,
        alignItems:     'center',
        justifyContent: 'center',
    },
    navLabel: {
        fontSize:  10,
        color:     COLORS.grayText,
        marginTop: 2,
    },
    navCenter:       { marginTop: -22 },
    navCenterCircle: {
        width:           scale(56),
        height:          scale(56),
        borderRadius:    scale(28),
        backgroundColor: COLORS.primary,
        justifyContent:  'center',
        alignItems:      'center',
        elevation:       6,
        shadowColor:     COLORS.primary,
        shadowOffset:    { width: 0, height: 4 },
        shadowOpacity:   0.4,
        shadowRadius:    8,
    },
});