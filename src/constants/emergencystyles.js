import { StyleSheet, Platform, StatusBar } from 'react-native';
import { scale, verticalScale } from '../utils/scale';

export const COLORS = {
    primary:      '#D63375',
    primaryLight: '#FCE4EE',
    bg:           '#FFF5F8',
    card:         '#FFFFFF',
    dark:         '#1A1A2E',
    muted:        '#9E9E9E',
    border:       '#F0D6E0',
    white:        '#FFFFFF',
    panic:        '#E8175D',
    panicDark:    '#9B1239',
    submitDark:   '#7D1035',
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
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.dark,
    },
    headerSub: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: 2,
    },

    // scroll
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        paddingTop: 4,
    },

    // panic button
    panicBtn: {
        backgroundColor: COLORS.panic,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 6,
        shadowColor: COLORS.panic,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    panicBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    panicSub: {
        fontSize: 11,
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 18,
    },

    // section label
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: 12,
    },
    sectionSub: {
        fontSize: 11.5,
        color: COLORS.muted,
        marginBottom: 10,
        marginTop: -8,
    },

    // category grid
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // voice recorder box
    recorderBox: {
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        marginBottom: 8,
        minHeight: 130,
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
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.dark,
        letterSpacing: 2,
        marginTop: 8,
    },
    tapToSpeak: {
        fontSize: 12,
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 12,
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
        gap: 10,
        marginVertical: 14,
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    orText: {
        fontSize: 11,
        color: COLORS.muted,
    },

    // transcribed text display
    transcriptText: {
        fontSize: 13,
        color: COLORS.dark,
        lineHeight: 20,
        marginBottom: 12,
        paddingHorizontal: 2,
    },

    // text input
    textInput: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 10,
        padding: 14,
        fontSize: 13,
        color: COLORS.dark,
        backgroundColor: COLORS.white,
        minHeight: 90,
        textAlignVertical: 'top',
        marginBottom: 14,
    },

    // detected info card
    detectedCard: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
        marginBottom: 20,
    },
    detectedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    detectedLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.dark,
        width: 110,
    },
    detectedValue: {
        fontSize: 12,
        color: COLORS.dark,
        flex: 1,
    },

    // submit button
    submitBtn: {
        backgroundColor: COLORS.submitDark,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        width: '55%',
        alignSelf: 'center',
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
});