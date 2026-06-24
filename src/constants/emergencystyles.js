import { StyleSheet, Platform, StatusBar } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/scale';

export const COLORS = {
    primary:      '#D63375',
    primaryLight: '#FFB0CE',
    bg:           '#FFF0F3',
    card:         '#FFFFFF',
    dark:         '#2D1B2E',
    darkText:     '#1C1C1C',
    muted:        '#B5B7C0',
    grayText:     '#9E9E9E',
    lightPink:    '#FDE8F0',
    border:       '#E5ECF6',
    white:        '#FFFFFF',
    panic:        '#B02060',
    panicLight:   '#FBE1EB',
};

export const CATEGORY_COLORS = {
    Medical:           { bg: '#E8F5E9', icon: '#43A047', label: '#2E7D32' },
    'Fire/Smoke':      { bg: '#FBE9E7', icon: '#E64A19', label: '#BF360C' },
    'Electrical Hazard':{ bg: '#FFFDE7', icon: '#F9A825', label: '#F57F17' },
    Security:          { bg: '#EDE7F6', icon: '#7B1FA2', label: '#6A1B9A' },
    'Flood/Water Leak':{ bg: '#E0F7FA', icon: '#00838F', label: '#006064' },
    Other:             { bg: '#F9FBE7', icon: '#827717', label: '#827717' },
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

    // scroll
    scrollContent: {
        paddingBottom: verticalScale(120),
        paddingTop: verticalScale(4),
    },

    // panic button
    panicBtn: {
        backgroundColor: COLORS.panic,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 8,
        shadowColor: COLORS.panic,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 4,
    },
    panicBtnText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    panicSub: {
        fontSize: 11,
        color: COLORS.muted,
        textAlign: 'center',
        marginHorizontal: 24,
        marginBottom: 14,
    },

    formCard: {
        backgroundColor: COLORS.card,
        marginHorizontal: 20,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
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

    // section label
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: 4,
    },
    standaloneSectionLabel: {
        marginHorizontal: 20,
        marginBottom: 12,
    },
    sectionSub: {
        fontSize: 11,
        color: COLORS.muted,
        marginBottom: 12,
    },

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

    // category grid
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // voice recorder box
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
    tapToSpeak: {
        fontSize: 12,
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 2,
        fontWeight: '500',
    },

    // waveform bars
    waveformRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        marginBottom: 10,
        height: 40,
    },

    // divider with "or"
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 10,
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

    // transcribed text display
    transcriptBox: {
        backgroundColor: COLORS.lightPink,
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        marginBottom: 2,
    },
    transcriptText: {
        fontSize: 13,
        color: COLORS.dark,
        lineHeight: 20,
    },

    // text input
    textInput: {
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        fontSize: 13,
        color: COLORS.dark,
        backgroundColor: COLORS.bg,
        minHeight: 90,
        textAlignVertical: 'top',
    },

    // detected info card
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
        textAlign: 'right',
    },

    // submit button
    submitBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        width: '50%',
        alignSelf: 'center',
        marginTop: 4,
        marginBottom: 20,
    },
    submitBtnText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // bottom nav — exact match
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
