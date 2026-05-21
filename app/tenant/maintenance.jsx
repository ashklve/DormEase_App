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
import { SafeAreaView } from 'react-native-safe-area-context';
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
import styles, { COLORS } from '../../src/constants/maintenancestyles';
import DrawerMenu from '../../src/components/DrawerMenu';
import { useUser } from '../../src/context/UserContext';


// ── Mock user / avatar ────────────────────────────────────────────────────────
const defaultPhoto = require('../../assets/def_icon.png');

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
};

const PRIORITY_STYLE = {
    High: { bg: '#F8D7DA', text: '#721C24' },
    Moderate: { bg: '#FFF3CD', text: '#856404' },
    Low: { bg: '#D4EDDA', text: '#155724' },
};

const ISSUE_KEYWORDS = [
    { category: 'Plumbing', words: ['leak', 'water', 'faucet', 'sink', 'toilet', 'pipe', 'drain', 'shower'] },
    { category: 'Electrical', words: ['electric', 'electrical', 'light', 'lights', 'outlet', 'power', 'spark', 'wire'] },
    { category: 'HVAC / Air Conditioning', words: ['aircon', 'air conditioning', 'ac', 'cooling', 'hvac', 'fan'] },
    { category: 'Appliance Repair', words: ['appliance', 'fridge', 'refrigerator', 'stove', 'washer', 'microwave'] },
    { category: 'Carpentry / Furniture', words: ['door', 'cabinet', 'chair', 'table', 'bed', 'lock', 'furniture'] },
    { category: 'Pest Control', words: ['pest', 'insect', 'cockroach', 'roach', 'ant', 'rats', 'mouse'] },
    { category: 'Cleaning', words: ['clean', 'dirty', 'trash', 'garbage', 'smell', 'stain'] },
    { category: 'Internet / Cable', words: ['internet', 'wifi', 'wi-fi', 'cable', 'connection', 'router'] },
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
const WaveformVisualizer = ({ isRecording, elapsed }) => {
    const bars = 28;
    const anims = useRef(
        Array.from({ length: bars }, () => new Animated.Value(0.3))
    ).current;

    useEffect(() => {
        if (isRecording) {
            const animations = anims.map((anim, i) =>
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(i * 40),
                        Animated.timing(anim, {
                            toValue: Math.random() * 0.7 + 0.3,
                            duration: 300 + Math.random() * 300,
                            useNativeDriver: false,
                        }),
                        Animated.timing(anim, {
                            toValue: 0.2 + Math.random() * 0.3,
                            duration: 300 + Math.random() * 300,
                            useNativeDriver: false,
                        }),
                    ])
                )
            );
            animations.forEach((a) => a.start());
            return () => animations.forEach((a) => a.stop());
        } else {
            // Flat line when not recording
            anims.forEach((anim) =>
                Animated.timing(anim, {
                    toValue: 0.25,
                    duration: 300,
                    useNativeDriver: false,
                }).start()
            );
        }
    }, [isRecording]);

    const formatTime = (secs) => {
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <View style={styles.waveformContainer}>
            <View style={styles.waveformBars}>
                {anims.map((anim, i) => (
                    <Animated.View
                        key={i}
                        style={[
                            styles.waveBar,
                            {
                                height: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [6, 40],
                                }),
                                opacity: isRecording ? anim : 0.4,
                            },
                        ]}
                    />
                ))}
            </View>
            <Text style={styles.waveTimer}>{formatTime(elapsed)}</Text>
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

    // ── Form state
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [location, setLocation] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ── Voice recorder state
    const [isRecording, setIsRecording] = useState(false);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [modelLoading, setModelLoading] = useState(true);
    const [elapsed, setElapsed] = useState(0);
    const [hasRecording, setHasRecording] = useState(false);
    const timerRef = useRef(null);
    const transcribedRef = useRef('');
    const confirmedTranscriptRef = useRef('');
    const listenerRefs = useRef([]);

    // ── History modal
    const [showHistory, setShowHistory] = useState(false);

    // ── Derived: detected issue
    const detectedType = category || null;
    const detectedPriority = category ? PRIORITY_MAP[category] : null;

    // ── Recording timer
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

    useEffect(() => {
        let mounted = true;

        loadModel('model-en-us')
            .then(() => {
                if (mounted) setModelLoaded(true);
            })
            .catch((error) => {
                console.error('failed to load Vosk model:', error);
                if (mounted) {
                    Alert.alert('Voice Input Unavailable', 'The speech recognition model could not be loaded.');
                }
            })
            .finally(() => {
                if (mounted) setModelLoading(false);
            });

        return () => {
            mounted = false;
            clearInterval(timerRef.current);
            clearVoskListeners();
            stop();
            unload();
        };
    }, [clearVoskListeners]);

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
        setElapsed(0);
        setHasRecording(false);

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
                clearInterval(timerRef.current);
                Alert.alert('Voice Input Error', String(error));
            }),
        ];

        try {
            await start();

            setIsRecording(true);
            timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
        } catch (error) {
            clearVoskListeners();
            Alert.alert('Voice Input Error', String(error));
        }
    };

    const stopRecording = async () => {
        clearInterval(timerRef.current);
        setIsRecording(false);

        try {
            await stop();
        } catch (error) {
            console.error('failed to stop Vosk recognizer:', error);
        }

        setHasRecording(Boolean(transcribedRef.current));
    };

    // ── Submit
    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Validation', 'Please describe the problem.');
            return;
        }
        if (!location.trim()) {
            Alert.alert('Validation', 'Please enter the location (e.g. Room number).');
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            Alert.alert('Success', 'Maintenance request submitted successfully.');
            setDescription('');
            setCategory('');
            setLocation('');
            setHasRecording(false);
            setElapsed(0);
        }, 1500);
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
                    <Text style={styles.headerTitle}>Maintenance Request 🔧</Text>
                    <Text style={styles.headerSub}>Describe the problem by speaking or typing.</Text>
                </View>

                {/* ── Content ── */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
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
                                onPress={() => setShowHistory(true)}
                            >
                                <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                                <Text style={styles.historyBtnText}>History</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.fieldHint}>Speak or type the details of the problem</Text>

                        {/* Waveform recorder box */}
                        <View style={[
                            styles.recorderBox,
                            isRecording && styles.recorderBoxActive,
                        ]}>
                            <WaveformVisualizer isRecording={isRecording} elapsed={elapsed} />

                            {/* Record / Stop button */}
                            <TouchableOpacity
                                style={[styles.micBtn, isRecording && styles.micBtnActive]}
                                onPress={isRecording ? stopRecording : startRecording}
                                activeOpacity={0.8}
                                disabled={modelLoading}
                            >
                                <MaterialIcons
                                    name={isRecording ? 'stop' : 'mic'}
                                    size={20}
                                    color={COLORS.white}
                                />
                                <Text style={styles.micBtnText}>
                                    {modelLoading ? 'Loading Voice Model...' : (isRecording ? 'Stop Recording' : (hasRecording ? 'Re-record' : 'Tap to Record'))}
                                </Text>
                            </TouchableOpacity>
                        </View>

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

                                {/* Location row */}
                                <View style={[styles.detectedRow, { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                                    <Text style={styles.detectedKey}>Location:</Text>
                                    <View style={[styles.detectedValueRow, { flex: 1 }]}>
                                        <TextInput
                                            style={styles.locationInlineInput}
                                            placeholder="e.g. Room 202"
                                            placeholderTextColor={COLORS.muted}
                                            value={location}
                                            onChangeText={setLocation}
                                        />
                                        <MaterialIcons name="edit" size={15} color={COLORS.primary} />
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

                            {/* Location input */}
                            <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Location</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Room 202, Kitchen, Bathroom"
                                placeholderTextColor={COLORS.muted}
                                value={location}
                                onChangeText={setLocation}
                            />
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
            <View style={styles.bottomNav}>
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
