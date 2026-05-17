import { StyleSheet, Platform, StatusBar } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/scale';

export const COLORS = {
    primary: '#D63375',
    bg: '#FFF5F8',
    card: '#FFFFFF',
    dark: '#1A1A2E',
    muted: '#9E9E9E',
    grayText: '#6B7280',
    border: '#F0D6E0',
    white: '#FFFFFF',
};

export default StyleSheet.create({

    // ── container ─────────────────────────────────────────────────────────────
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

    // ── header ────────────────────────────────────────────────────────────────
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 10,
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

    // ── scroll content ────────────────────────────────────────────────────────
    scrollContent: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },

    // ── section card (notice / tenant info / request details) ─────────────────
    sectionCard: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    noticeCard: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // ── section header row (icon + title) ─────────────────────────────────────
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.dark,
    },

    // ── notice card internals ─────────────────────────────────────────────────
    noticeTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 8,
    },
    noticeItemRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    noticeBullet: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: COLORS.primary,
        marginTop: 4,
        flexShrink: 0,
    },
    noticeItemText: {
        fontSize: 11.5,
        color: COLORS.grayText,
        flex: 1,
        lineHeight: 17,
    },

    // ── text inputs ───────────────────────────────────────────────────────────
    input: {
        backgroundColor: COLORS.bg,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 14,
        fontSize: 13,
        color: COLORS.dark,
        marginBottom: 10,
    },

    // ── contact + room row ────────────────────────────────────────────────────
    inlineRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 0,
    },
    contactWrapper: {
        flex: 1,
        position: 'relative',
    },
    contactIcon: {
        position: 'absolute',
        right: 12,
        top: 13,
    },

    // ── dropdown trigger ──────────────────────────────────────────────────────
    pickerWrapper: {
        backgroundColor: COLORS.bg,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    pickerText: {
        fontSize: 13,
        color: COLORS.muted,
    },
    pickerTextSelected: {
        color: COLORS.dark,
    },

    // ── dropdown list ─────────────────────────────────────────────────────────
    dropdownList: {
        backgroundColor: COLORS.bg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
        maxHeight: 200,
    },
    dropdownListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 14,
    },
    dropdownListItemActive: {
        backgroundColor: COLORS.card,
    },
    dropdownListItemText: {
        fontSize: 13,
        color: COLORS.dark,
        fontWeight: '500',
    },
    dropdownListItemTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    // ── upload box ────────────────────────────────────────────────────────────
    uploadBox: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: COLORS.bg,
    },
    uploadHint: {
        fontSize: 11,
        color: COLORS.muted,
        marginBottom: 8,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        width: '90%',
        gap: 8,
    },
    uploadBtnText: {
        fontSize: 13,
        color: COLORS.dark,
        fontWeight: '500',
        flex: 1,
    },

    // ── date picker trigger ───────────────────────────────────────────────────
    datePickerBtn: {
        backgroundColor: COLORS.bg,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    datePickerText: {
        fontSize: 13,
        color: COLORS.dark,
    },

    // ── radio button row ──────────────────────────────────────────────────────
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    radioRowLast: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: COLORS.primary,
    },
    radioLabel: {
        fontSize: 13,
        color: COLORS.dark,
        fontWeight: '500',
    },

    // ── submit button ─────────────────────────────────────────────────────────
    submitBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        width: '70%',
        alignSelf: 'center',
        marginTop: 4,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // ── bottom nav ────────────────────────────────────────────────────────────
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

    // ── iOS picker modal ──────────────────────────────────────────────────────
    iosModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    iosModalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    iosModalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    iosModalDoneText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 16,
    },

});