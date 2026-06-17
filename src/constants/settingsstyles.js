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
    pageBg: '#F5F0F2',
};

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F5F0F2',
    },

    // ── top bar ───────────────────────────────────────────────────────────────
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(16),
        paddingTop: Platform.OS === 'ios' ? verticalScale(54) : (StatusBar.currentHeight ?? 24) + verticalScale(8),
        paddingBottom: verticalScale(12),
        backgroundColor: '#F5F0F2',
        position: 'relative',
    },
    backBtn: {
        position: 'absolute',
        left: scale(16),
        top: Platform.OS === 'ios' ? verticalScale(54) : (StatusBar.currentHeight ?? 24) + verticalScale(8),
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
    topBarTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: COLORS.dark,
    },

    // ── scroll ────────────────────────────────────────────────────────────────
    scrollContent: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(6),
        paddingBottom: verticalScale(120),
    },

    // ── section label (above a group) ─────────────────────────────────────────
    sectionLabel: {
        fontSize: moderateScale(13),
        color: COLORS.muted,
        fontWeight: '500',
        marginBottom: verticalScale(8),
        marginTop: verticalScale(4),
        paddingHorizontal: scale(2),
    },

    // ── grouped card ──────────────────────────────────────────────────────────
    groupCard: {
        backgroundColor: COLORS.white,
        borderRadius: scale(16),
        marginBottom: verticalScale(14),
        overflow: 'hidden',
    },

    // ── row inside a card ─────────────────────────────────────────────────────
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(16),
        paddingHorizontal: scale(16),
    },
    rowDivider: {
        borderTopWidth: 1,
        borderTopColor: '#F3ECF0',
    },

    // icon circle wrapper
    iconWrap: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: COLORS.lightPink,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },

    // text block
    rowBody: {
        flex: 1,
    },
    rowLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: COLORS.dark,
    },
    rowSublabel: {
        fontSize: moderateScale(12),
        color: COLORS.muted,
        marginTop: verticalScale(2),
    },
    rowSublabelLink: {
        fontSize: moderateScale(12),
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: verticalScale(2),
    },

    // right side
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
    },
    rowValue: {
        fontSize: moderateScale(13),
        color: COLORS.muted,
        fontWeight: '500',
    },

    // ── custom toggle ─────────────────────────────────────────────────────────
    toggleTrack: {
        width: scale(52),
        height: scale(30),
        borderRadius: scale(15),
        justifyContent: 'center',
        paddingHorizontal: scale(3),
    },
    toggleTrackOn: {
        backgroundColor: COLORS.primary,
    },
    toggleTrackOff: {
        backgroundColor: '#E0D6DA',
    },
    toggleThumb: {
        width: scale(24),
        height: scale(24),
        borderRadius: scale(12),
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },

    // ── logout button ─────────────────────────────────────────────────────────
    logoutWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: scale(20),
        paddingBottom: Platform.OS === 'ios' ? verticalScale(36) : verticalScale(24),
        paddingTop: verticalScale(12),
        backgroundColor: '#F5F0F2',
    },
    logoutBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: scale(30),
        paddingVertical: verticalScale(16),
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoutBtnText: {
        color: COLORS.white,
        fontSize: moderateScale(16),
        fontWeight: '700',
        letterSpacing: 0.3,
    },

});