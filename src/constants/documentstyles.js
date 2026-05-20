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
};

export default StyleSheet.create({

    // ── Container ─────────────────────────────────────────────────────────────
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    // ── Top Row ───────────────────────────────────────────────────────────────
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

    // ── Page Header ───────────────────────────────────────────────────────────
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

    // ── Scroll Content ────────────────────────────────────────────────────────
    scrollContent: {
        paddingBottom: 100,
        paddingHorizontal: 20,
        paddingTop: 4,
    },

    // ── Section Card ──────────────────────────────────────────────────────────
    sectionCard: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // ── Section Header Row ────────────────────────────────────────────────────
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionIconBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.dark,
    },
    sectionHeaderCount: {
        fontSize: 10.5,
        color: COLORS.muted,
        marginTop: 1,
    },

    // ── Hint Box (info strip inside downloadable forms) ───────────────────────
    hintBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 12,
        marginTop: -4,
    },
    hintBoxText: {
        fontSize: 11.5,
        color: COLORS.primary,
        flex: 1,
        lineHeight: 16,
        fontWeight: '500',
    },

    // ── Downloadable Form Row ─────────────────────────────────────────────────
    formRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 11,
    },
    formRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    formRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        marginRight: 10,
    },
    formIconCircle: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    formLabel: {
        fontSize: 12.5,
        color: COLORS.dark,
        fontWeight: '500',
        flex: 1,
        lineHeight: 17,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 10,
        flexShrink: 0,
    },
    downloadBtnText: {
        fontSize: 11.5,
        color: COLORS.primary,
        fontWeight: '700',
    },

    // ── Divider ───────────────────────────────────────────────────────────────
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 14,
    },

    // ── Field Label / Hint ────────────────────────────────────────────────────
    fieldLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    fieldHint: {
        fontSize: 11.5,
        color: COLORS.muted,
        marginBottom: 10,
        marginTop: 4,
        lineHeight: 16,
    },

    // ── Text Inputs ───────────────────────────────────────────────────────────
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

    // ── Contact No + Room No row ──────────────────────────────────────────────
    inlineRow: {
        flexDirection: 'row',
        gap: 10,
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

    // ── Dropdown Trigger ──────────────────────────────────────────────────────
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
        flex: 1,
        marginRight: 8,
    },
    pickerTextSelected: {
        color: COLORS.dark,
        fontWeight: '500',
    },

    // ── Dropdown List ─────────────────────────────────────────────────────────
    dropdownList: {
        backgroundColor: COLORS.bg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
        maxHeight: 300,
    },
    dropdownSectionLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.primary,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 4,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
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
        flex: 1,
    },
    dropdownListItemTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },

    // ── Upload Box (FORM flow) ────────────────────────────────────────────────
    uploadBox: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: COLORS.muted,
        borderRadius: 12,
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        backgroundColor: COLORS.bg,
        gap: 6,
    },
    // State when a file has been picked
    uploadBoxFilled: {
        borderColor: COLORS.primary,
        borderStyle: 'solid',
        backgroundColor: COLORS.primaryLight,
    },
    uploadBoxText: {
        fontSize: 13,
        color: COLORS.muted,
        fontWeight: '500',
        textAlign: 'center',
        maxWidth: '88%',
    },
    uploadBoxTextFilled: {
        color: COLORS.dark,
    },
    uploadBoxSub: {
        fontSize: 11,
        color: COLORS.muted,
        textAlign: 'center',
    },

    // ── Radio Buttons (CERTIFICATE flow) ─────────────────────────────────────
    radioRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 14,
    },
    radioRowLast: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        marginTop: 2,
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
    radioSub: {
        fontSize: 11,
        color: COLORS.muted,
        marginTop: 1,
    },

    // ── Submit Button ─────────────────────────────────────────────────────────
    submitBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        width: '70%',
        alignSelf: 'center',
        marginTop: 18,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // ── Bottom Nav ────────────────────────────────────────────────────────────
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