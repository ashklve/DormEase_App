import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    Animated,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    loadModel,
    onError,
    onFinalResult,
    onPartialResult,
    onResult,
    start,
    stop,
    unload,
} from 'react-native-vosk';
import client from '../../api/client';
import styles, { COLORS } from '../../src/constants/maintenancestyles';
import DrawerMenu from '../../src/components/DrawerMenu';
import { useUser } from '../../src/context/UserContext';


// ── Mock user / avatar ────────────────────────────────────────────────────────
const defaultPhoto = require('../../assets/def_icon.png');

const SPEECH_LANGUAGE_OPTIONS = [
    { key: 'en', label: 'English', model: 'model-en-us' },
    { key: 'tl', label: 'Tagalog', model: 'model-tl-ph' },
];

// ── Dropdown options ──────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
    'Plumbing',
    'Electrical',
    'HVAC / Air Conditioning',
    'Appliance Repair',
    'Carpentry / Furniture',
    'Pest Control',
    'Cleaning',
    'Internet / Cable',
    'Others',
];

const PRIORITY_MAP = {
    Plumbing: 'Moderate',
    Electrical: 'High',
    'HVAC / Air Conditioning': 'Moderate',
    'Appliance Repair': 'Low',
    'Carpentry / Furniture': 'Low',
    'Pest Control': 'High',
    Cleaning: 'Low',
    'Internet / Cable': 'Moderate',
    Others: 'Low',
    plumbing: 'moderate',
    electrical: 'urgent',
    hvac: 'moderate',
    appliance: 'low',
    carpentry: 'low',
    pest: 'urgent',
    cleaning: 'low',
    internet: 'moderate',
    other: 'low',
};

const PRIORITY_STYLE = {
    High: { bg: '#F8D7DA', text: '#721C24' },
    Moderate: { bg: '#FFF3CD', text: '#856404' },
    Low: { bg: '#D4EDDA', text: '#155724' },
    urgent: { bg: '#F8D7DA', text: '#721C24' },
    moderate: { bg: '#FFF3CD', text: '#856404' },
    low: { bg: '#D4EDDA', text: '#155724' },
};

const ISSUE_KEYWORDS = [
    { category: 'Plumbing', words: ['leak', 'water', 'faucet', 'sink', 'toilet', 'pipe', 'drain', 'shower', 'tulo', 'tumutulo', 'tagas', 'gripo', 'lababo', 'inidoro', 'kubeta', 'tubo', 'barado', 'bara', 'banyo', 'cr'] },
    { category: 'Electrical', words: ['electric', 'electrical', 'light', 'lights', 'outlet', 'power', 'spark', 'wire', 'kuryente', 'saksakan', 'ilaw', 'bumbilya', 'kurap', 'kumukurap', 'pumutok', 'brownout'] },
    { category: 'HVAC / Air Conditioning', words: ['aircon', 'air conditioning', 'ac', 'cooling', 'hvac', 'fan', 'mainit', 'lumalamig', 'lamig', 'bentilador'] },
    { category: 'Appliance Repair', words: ['appliance', 'fridge', 'refrigerator', 'stove', 'washer', 'microwave', 'ref', 'kalan'] },
    { category: 'Carpentry / Furniture', words: ['door', 'cabinet', 'chair', 'table', 'bed', 'lock', 'furniture', 'pinto', 'upuan', 'mesa', 'kama', 'bintana', 'susi'] },
    { category: 'Pest Control', words: ['pest', 'insect', 'cockroach', 'roach', 'ant', 'rats', 'mouse', 'ipis', 'langgam', 'daga', 'lamok', 'anay', 'insekto'] },
    { category: 'Cleaning', words: ['clean', 'dirty', 'trash', 'garbage', 'smell', 'stain', 'linis', 'marumi', 'basura', 'mabaho', 'amoy', 'mantsa'] },
    { category: 'Internet / Cable', words: ['internet', 'wifi', 'wi-fi', 'cable', 'connection', 'router', 'signal', 'network', 'mahina ang wifi', 'walang internet'] },
];

const detectCategoryFromTranscript = (text) => {
    const normalized = text.toLowerCase();
    return ISSUE_KEYWORDS.find(({ words }) =>
        words.some((word) => normalized.includes(word))
    )?.category ?? '';
};

// ── History modal dummy data ──────────────────────────────────────────────────
const HISTORY_ITEMS = [
    { id: 1, category: 'Plumbing', description: 'Leaking faucet in bathroom', status: 'Resolved', date: '05/10/2026' },
    { id: 2, category: 'Electrical', description: 'Flickering lights in living room', status: 'In Progress', date: '05/14/2026' },
    { id: 3, category: 'Pest Control', description: 'Cockroach infestation in kitchen', status: 'Pending', date: '05/18/2026' },
];

const STATUS_STYLE = {
    Resolved: { bg: '#D4EDDA', text: '#28A745' },
    'In Progress': { bg: '#CCE5FF', text: '#004085' },
    Pending: { bg: '#FFF3CD', text: '#856404' },
};

// ── Waveform animation component ──────────────────────────────────────────────
const BAR_COUNT = 28;

const fmtTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

const Waveform = ({ isRecording }) => {
    const anims = useRef(
        Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.3))
    ).current;

    useEffect(() => {
        if (isRecording) {
            const animations = anims.map((anim, i) =>
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(i * 40),
                        Animated.timing(anim, {
                            toValue: Math.random() * 0.7 + 0.3,
                            duration: 200 + Math.random() * 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0.2 + Math.random() * 0.3,
                            duration: 200 + Math.random() * 200,
                            useNativeDriver: true,
                        }),
                    ])
                )
            );
            animations.forEach((a) => a.start());
            return () => animations.forEach((a) => a.stop());
        } else {
            anims.forEach((anim) =>
                Animated.timing(anim, {
                    toValue: 0.3,
                    duration: 200,
                    useNativeDriver: true,
                }).start()
            );
        }
    }, [isRecording]);

    return (
        <View style={styles.waveformRow}>
            {anims.map((anim, i) => (
                <Animated.View
                    key={i}
                    style={{
                        width: 3,
                        height: 36,
                        borderRadius: 2,
                        backgroundColor: COLORS.primary,
                        transform: [{ scaleY: anim }],
                    }}
                />
            ))}
        </View>
    );
};

// ── Bottom Nav Item ───────────────────────────────────────────────────────────
const NavItem = ({ iconName, label, isActive, isCenter, onPress }) => (
    <TouchableOpacity
        style={[styles.navItem, isCenter && styles.navCenter]}
        onPress={onPress}
    >
        {isCenter ? (
            <View style={styles.navCenterCircle}>
                <MaterialIcons name={iconName} size={26} color={COLORS.white} />
            </View>
        ) : (
            <>
                <MaterialIcons
                    name={iconName}
                    size={24}
                    color={isActive ? COLORS.primary : COLORS.grayText}
                />
                <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>
                    {label}
                </Text>
            </>
        )}
    </TouchableOpacity>
);

// ── History Modal ─────────────────────────────────────────────────────────────
const HistoryModal = ({ visible, onClose }) => (
    <Modal transparent animationType="slide" visible={visible}>
        <View style={styles.modalOverlay}>
            <View style={styles.historyModal}>
                <View style={styles.historyModalHeader}>
                    <Text style={styles.historyModalTitle}>Request History</Text>
                    <TouchableOpacity onPress={onClose}>
                        <MaterialIcons name="close" size={22} color={COLORS.dark} />
                    </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {HISTORY_ITEMS.map((item) => {
                        const s = STATUS_STYLE[item.status] ?? STATUS_STYLE.Pending;
                        return (
                            <View key={item.id} style={styles.historyCard}>
                                <View style={styles.historyCardTop}>
                                    <Text style={styles.historyCategory}>{item.category}</Text>
                                    <View style={[styles.historyBadge, { backgroundColor: s.bg }]}>
                                        <Text style={[styles.historyBadgeText, { color: s.text }]}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.historyDesc}>{item.description}</Text>
                                <View style={styles.historyDateRow}>
                                    <Ionicons name="calendar-outline" size={12} color={COLORS.muted} />
                                    <Text style={styles.historyDate}>{item.date}</Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    </Modal>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MaintenanceScreen() {
    const router = useRouter();
    const drawerRef = useRef(null);
    const { avatarUri } = useUser();
    const insets = useSafeAreaInsets();

    // ── Form state
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── Voice recorder state
    const [speechLanguage, setSpeechLanguage] = useState('en');
    const [isRecording, setIsRecording] = useState(false);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [modelLoading, setModelLoading] = useState(true);
    const [recordSecs, setRecordSecs] = useState(0);
    const [hasRecording, setHasRecording] = useState(false);
    const timerRef = useRef(null);
    const lastTimerTickRef = useRef(null);
    const transcribedRef = useRef('');
    const confirmedTranscriptRef = useRef('');
    const listenerRefs = useRef([]);

    // ── History modal
    const [showHistory, setShowHistory] = useState(false);

    // ── Derived: detected issue
    const detectedType = category || null;
    const detectedPriority = category ? PRIORITY_MAP[category] : null;

    // ── Recording timer
    const stopRecordingTimer = useCallback(() => {
        clearInterval(timerRef.current);
        timerRef.current = null;
        lastTimerTickRef.current = null;
    }, []);

    const startRecordingTimer = useCallback(() => {
        stopRecordingTimer();
        setRecordSecs(0);
        lastTimerTickRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const now = Date.now();
            if (lastTimerTickRef.current && now - lastTimerTickRef.current < 900) {
                return;
            }

            lastTimerTickRef.current = now;
            setRecordSecs((seconds) => seconds + 1);
        }, 1000);
    }, [stopRecordingTimer]);

    const clearVoskListeners = useCallback(() => {
        listenerRefs.current.forEach((listener) => listener?.remove?.());
        listenerRefs.current = [];
    }, []);

    const updateTranscript = useCallback((text) => {
        const nextText = String(text ?? '').trim();
        if (!nextText) return;

        transcribedRef.current = nextText;
        setDescription(nextText);

        const detectedCategory = detectCategoryFromTranscript(nextText);
        if (detectedCategory) setCategory(detectedCategory);
    }, []);

    const mergeTranscriptChunk = useCallback((text) => {
        const chunk = String(text ?? '').trim();
        if (!chunk) return;

        const existing = confirmedTranscriptRef.current;
        const nextText = existing ? `${existing} ${chunk}` : chunk;
        confirmedTranscriptRef.current = nextText;
        updateTranscript(nextText);
    }, [updateTranscript]);

    const applyPartialTranscript = useCallback((text) => {
        const partial = String(text ?? '').trim();
        if (!partial) return;

        const existing = confirmedTranscriptRef.current;
        updateTranscript(existing ? `${existing} ${partial}` : partial);
    }, [updateTranscript]);

    const selectedSpeechLanguage = SPEECH_LANGUAGE_OPTIONS.find((option) => option.key === speechLanguage)
        ?? SPEECH_LANGUAGE_OPTIONS[0];

    const handleSpeechLanguageChange = (nextLanguage) => {
        if (isRecording || modelLoading || nextLanguage === speechLanguage) return;

        setSpeechLanguage(nextLanguage);
        setDescription('');
        setCategory('');
        setHasRecording(false);
        setRecordSecs(0);
        transcribedRef.current = '';
        confirmedTranscriptRef.current = '';
    };

    useEffect(() => {
        let mounted = true;

        setModelLoaded(false);
        setModelLoading(true);
        unload();

        loadModel(selectedSpeechLanguage.model)
            .then(() => {
                if (mounted) setModelLoaded(true);
            })
            .catch((error) => {
                console.error('failed to load Vosk model:', error);
                if (mounted) {
                    Alert.alert('Voice Input Unavailable', `${selectedSpeechLanguage.label} speech recognition could not be loaded.`);
                }
            })
            .finally(() => {
                if (mounted) setModelLoading(false);
            });

        return () => {
            mounted = false;
            stopRecordingTimer();
            clearVoskListeners();
            stop();
            unload();
        };
    }, [clearVoskListeners, selectedSpeechLanguage.model, selectedSpeechLanguage.label, stopRecordingTimer]);

    const startRecording = async () => {
        if (!modelLoaded) {
            Alert.alert('Voice Input Loading', 'Speech recognition is still loading. Please try again in a moment.');
            return;
        }

        clearVoskListeners();
        transcribedRef.current = '';
        confirmedTranscriptRef.current = '';
        setDescription('');
        setCategory('');
        setHasRecording(false);
        setIsRecording(true);
        startRecordingTimer();

        listenerRefs.current = [
            onPartialResult((text) => applyPartialTranscript(text)),
            onResult((text) => mergeTranscriptChunk(text)),
            onFinalResult((text) => {
                mergeTranscriptChunk(text);
                setHasRecording(true);
            }),
            onError((error) => {
                console.error('Vosk recognition error:', error);
                setIsRecording(false);
                stopRecordingTimer();
                Alert.alert('Voice Input Error', String(error));
            }),
        ];

        try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            await start();
        } catch (error) {
            setIsRecording(false);
            stopRecordingTimer();
            clearVoskListeners();
            Alert.alert('Voice Input Error', String(error));
        }
    };

    const stopRecording = async () => {
        stopRecordingTimer();
        setIsRecording(false);

        try {
            await stop();
        } catch (error) {
            console.error('failed to stop Vosk recognizer:', error);
        }

        setHasRecording(Boolean(transcribedRef.current));
    };

    const handleToggleRecord = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // ── Submit
    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Validation', 'Please describe the problem.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await client.post('/maintenance', {
                description: description.trim(),
                input_type: hasRecording ? 'voice' : 'text',
                language: speechLanguage,
            });

            const savedRequest = res.data?.request;
            const issueType = savedRequest?.issue_type ?? 'other';
            const urgencyLevel = savedRequest?.urgency_level ?? 'low';

            setCategory(issueType);
            Alert.alert(
                'Success',
                `Maintenance request submitted successfully.\nIssue: ${issueType}\nPriority: ${urgencyLevel}`
            );

            setDescription('');
            setCategory('');
            setHasRecording(false);
            setRecordSecs(0);
        } catch (err) {
            console.error('maintenance submit error:', err.response?.data ?? err.message);
            const errors = err.response?.data?.errors;
            const message = errors
                ? Object.values(errors).flat().join('\n')
                : (err.response?.data?.message ?? 'Failed to submit maintenance request.');

            Alert.alert('Error', message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={20}
            >
                {/* ── Top Row ── */}
                <View style={styles.topRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => drawerRef.current?.open()}
                    >
                        <MaterialIcons name="menu" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <View style={styles.topRowRight}>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => router.push('/tenant/notifications')}
                        >
                            <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
                            <View style={styles.notifDot} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                            <Image
                                source={avatarUri ? { uri: avatarUri } : defaultPhoto}
                                style={styles.avatar}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Header ── */}
                <View style={styles.headerSection}>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.headerIconBadge}>
                            <Ionicons name="construct-outline" size={20} color={COLORS.white} />
                        </View>
                        <Text style={styles.headerTitle}>Maintenance Request</Text>
                    </View>
                    <Text style={styles.headerSub}>Describe the problem by speaking or typing.</Text>
                </View>

                {/* ── Content ── */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                >
                    {/* ── Voice / Description Section ── */}
                    <View style={styles.formCard}>
                        {/* Label + History */}
                        <View style={styles.labelRow}>
                            <Text style={styles.fieldLabel}>Describe the problem</Text>
                            <TouchableOpacity
                                style={styles.historyBtn}
                                onPress={() => router.push('/tenant/maintenancehistory')}
                            >
                                <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                                <Text style={styles.historyBtnText}>History</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.fieldHint}>Speak or type the details of the problem</Text>

                        <View style={styles.languageSelector}>
                            {SPEECH_LANGUAGE_OPTIONS.map((option) => {
                                const active = speechLanguage === option.key;
                                return (
                                    <TouchableOpacity
                                        key={option.key}
                                        style={[
                                            styles.languageOption,
                                            active && styles.languageOptionActive,
                                            (isRecording || modelLoading) && styles.languageOptionDisabled,
                                        ]}
                                        onPress={() => handleSpeechLanguageChange(option.key)}
                                        disabled={isRecording || modelLoading}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={[
                                            styles.languageOptionText,
                                            active && styles.languageOptionTextActive,
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Waveform recorder box */}
                        <TouchableOpacity
                            style={[styles.recorderBox, isRecording && styles.recorderBoxActive]}
                            activeOpacity={0.85}
                            onPress={handleToggleRecord}
                            disabled={modelLoading}
                        >
                            {isRecording ? (
                                <Waveform isRecording={isRecording} />
                            ) : (
                                <View style={styles.micCircle}>
                                    <MaterialIcons name="mic" size={28} color={COLORS.white} />
                                </View>
                            )}
                            <Text style={styles.timerText}>{fmtTimer(recordSecs)}</Text>
                        </TouchableOpacity>

                        <Text style={styles.tapToSpeak}>
                            {modelLoading ? `Loading ${selectedSpeechLanguage.label} Model...` : (isRecording ? 'Tap to stop recording' : (hasRecording ? 'Tap to re-record' : 'Tap to Speak'))}
                        </Text>

                        {/* Transcription result */}
                        {(isRecording || hasRecording) && description ? (
                            <View style={styles.transcriptBox}>
                                <Text style={styles.transcriptText}>{description}</Text>
                            </View>
                        ) : null}

                        {/* Divider */}
                        <View style={styles.orRow}>
                            <View style={styles.orLine} />
                            <Text style={styles.orText}>or</Text>
                            <View style={styles.orLine} />
                        </View>

                        {/* Manual text input */}
                        <TextInput
                            style={styles.descInput}
                            placeholder="Describe the problem here..."
                            placeholderTextColor={COLORS.muted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* ── Detected Issue card ── */}
                    {detectedType ? (
                        <View style={styles.detectedCard}>
                            <Text style={styles.detectedTitle}>Detected Issue</Text>
                            <View style={styles.detectedTable}>
                                {/* Type row */}
                                <View style={styles.detectedRow}>
                                    <Text style={styles.detectedKey}>Detected Type:</Text>
                                    <View style={styles.detectedValueRow}>
                                        <Text style={styles.detectedValue}>{detectedType}</Text>
                                        <TouchableOpacity
                                            onPress={() => setCategoryOpen(true)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <MaterialIcons name="edit" size={15} color={COLORS.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Priority row */}
                                <View style={[styles.detectedRow, { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                                    <Text style={styles.detectedKey}>Priority:</Text>
                                    <View style={styles.detectedValueRow}>
                                        {detectedPriority ? (
                                            <View style={[
                                                styles.priorityPill,
                                                { backgroundColor: PRIORITY_STYLE[detectedPriority]?.bg }
                                            ]}>
                                                <Text style={[
                                                    styles.priorityPillText,
                                                    { color: PRIORITY_STYLE[detectedPriority]?.text }
                                                ]}>
                                                    {detectedPriority}
                                                </Text>
                                            </View>
                                        ) : null}
                                        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                            <MaterialIcons name="edit" size={15} color={COLORS.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </View>
                        </View>
                    ) : (
                        /* Category picker shown when no auto-detection */
                        <View style={styles.formCard}>
                            <Text style={styles.fieldLabel}>Category</Text>
                            <TouchableOpacity
                                style={styles.pickerWrapper}
                                activeOpacity={0.8}
                                onPress={() => setCategoryOpen(!categoryOpen)}
                            >
                                <Text style={[styles.pickerText, category && styles.pickerTextSelected]}>
                                    {category || 'Select issue category'}
                                </Text>
                                <MaterialIcons
                                    name={categoryOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={20}
                                    color={COLORS.muted}
                                />
                            </TouchableOpacity>

                        </View>
                    )}

                    {/* ── Category Dropdown (edit mode) ── */}
                    {categoryOpen && (
                        <View style={[styles.dropdownList, { marginHorizontal: 20 }]}>
                            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                {CATEGORY_OPTIONS.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={[
                                            styles.dropdownListItem,
                                            category === item && styles.dropdownListItemActive,
                                        ]}
                                        onPress={() => { setCategory(item); setCategoryOpen(false); }}
                                    >
                                        <Text style={[
                                            styles.dropdownListItemText,
                                            category === item && styles.dropdownListItemTextActive,
                                        ]}>
                                            {item}
                                        </Text>
                                        {category === item && (
                                            <MaterialIcons name="check" size={16} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* ── Submit ── */}
                    <TouchableOpacity
                        style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                        activeOpacity={0.85}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={styles.submitBtnText}>Submit</Text>
                        }
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Bottom Nav ── */}
            <View style={[
                styles.bottomNav,
                { paddingBottom: Math.max(insets.bottom, 24) },
            ]}>
                <NavItem iconName="home" label="Home" isActive={false} onPress={() => router.push('/tenant/dashboard')} />
                <NavItem iconName="person-outline" label="Visitor" isActive={false} onPress={() => router.push('/tenant/visitors')} />
                <NavItem iconName="warning" label="Emergency" isCenter onPress={() => router.push('/tenant/emergency')} />
                <NavItem iconName="water-drop" label="Water Bill" isActive={false} onPress={() => router.push('/tenant/water-bill')} />
                <NavItem iconName="account-circle" label="Profile" isActive={false} onPress={() => router.push('/tenant/profile')} />
            </View>

            {/* ── Drawer ── */}
            <DrawerMenu ref={drawerRef} />

            {/* ── History Modal ── */}
            <HistoryModal visible={showHistory} onClose={() => setShowHistory(false)} />
        </SafeAreaView>
    );
}
