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
    },

    // ── form card ─────────────────────────────────────────────────────────────
    formCard: {
        backgroundColor: COLORS.card,
        marginHorizontal: 20,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // ── label row ─────────────────────────────────────────────────────────────
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: 4,
    },
    fieldHint: {
        fontSize: 11,
        color: COLORS.muted,
        marginBottom: 12,
    },
    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    historyBtnText: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // ── recorder box ──────────────────────────────────────────────────────────
    languageSelector: {
        flexDirection: 'row',
        backgroundColor: COLORS.bg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 3,
        marginBottom: 12,
    },
    languageOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
        paddingVertical: 8,
    },
    languageOptionActive: {
        backgroundColor: COLORS.primary,
    },
    languageOptionDisabled: {
        opacity: 0.7,
    },
    languageOptionText: {
        fontSize: 12,
        color: COLORS.grayText,
        fontWeight: '700',
    },
    languageOptionTextActive: {
        color: COLORS.white,
    },
    recorderBox: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.bg,
        marginBottom: 10,
        minHeight: 124,
    },
    recorderBoxActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#FFF5F8',
    },

    // ── waveform ──────────────────────────────────────────────────────────────
    waveformRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        marginBottom: 10,
        height: 40,
    },
    micCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    timerText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.dark,
        letterSpacing: 1,
        marginTop: 8,
    },

    // ── mic button ────────────────────────────────────────────────────────────
    tapToSpeak: {
        fontSize: 12,
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 2,
        fontWeight: '500',
    },

    // ── transcript ────────────────────────────────────────────────────────────
    transcriptBox: {
        backgroundColor: COLORS.lightPink,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    transcriptText: {
        fontSize: 13,
        color: COLORS.dark,
        lineHeight: 20,
    },

    // ── or divider ────────────────────────────────────────────────────────────
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        gap: 8,
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    orText: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '500',
    },

    // ── description textarea ──────────────────────────────────────────────────
    descInput: {
        backgroundColor: COLORS.bg,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 14,
        fontSize: 13,
        color: COLORS.dark,
        minHeight: 90,
    },

    // ── camera / photo section ────────────────────────────────────────────────
    cameraBox: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        borderStyle: 'dashed',
        paddingVertical: 24,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.bg,
        minHeight: 130,
    },
    cameraIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    cameraBoxLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    cameraBoxHint: {
        fontSize: 11,
        color: COLORS.muted,
    },
    photoPreviewWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 11,
        borderTopRightRadius: 11,
    },
    photoActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    photoActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        backgroundColor: COLORS.white,
    },
    photoActionBtnDestructive: {
        backgroundColor: COLORS.primary,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.border,
    },
    photoActionBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
    },
    photoActionBtnTextDestructive: {
        color: COLORS.white,
    },

    // ── detected issue card ───────────────────────────────────────────────────
    detectedCard: {
        backgroundColor: COLORS.card,
        marginHorizontal: 20,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    detectedTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: 10,
    },
    detectedTable: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        overflow: 'hidden',
    },
    detectedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    detectedKey: {
        fontSize: 13,
        color: COLORS.dark,
        fontWeight: '500',
        flex: 1,
    },
    detectedValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1.2,
        justifyContent: 'flex-end',
    },
    detectedValue: {
        fontSize: 13,
        color: COLORS.dark,
        fontWeight: '600',
    },
    priorityPill: {
        borderRadius: 6,
        paddingVertical: 2,
        paddingHorizontal: 10,
    },
    priorityPillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    locationInlineInput: {
        flex: 1,
        fontSize: 13,
        color: COLORS.dark,
        fontWeight: '600',
        textAlign: 'right',
        paddingVertical: 0,
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
        backgroundColor: COLORS.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 14,
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
        backgroundColor: COLORS.bg,
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

    // ── submit button ─────────────────────────────────────────────────────────
    submitBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 4,
        width: '50%',
        alignSelf: 'center',
        marginBottom: 20,
    },
    submitBtnText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
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

    // ── history modal ─────────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    historyModal: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    historyModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    historyModalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.dark,
    },
    historyCard: {
        backgroundColor: COLORS.bg,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    historyCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    historyCategory: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.dark,
    },
    historyBadge: {
        borderRadius: 6,
        paddingVertical: 2,
        paddingHorizontal: 8,
    },
    historyBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    historyDesc: {
        fontSize: 12,
        color: COLORS.grayText,
        marginBottom: 6,
    },
    historyDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    historyDate: {
        fontSize: 11,
        color: COLORS.muted,
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        marginTop: 14,
    },
    controlBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    pauseBtn: {
        backgroundColor: '#FF85A1',
    },
    resumeBtn: {
        backgroundColor: '#D63375',
    },
    stopBtn: {
        backgroundColor: '#8A0F44',
    },
});