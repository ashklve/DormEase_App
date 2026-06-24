import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';
import DrawerMenu from '../../src/components/DrawerMenu';
import LoadingOverlay from '../../src/components/LoadingOverlay';
import styles, { COLORS, CATEGORY_COLORS } from '../../src/constants/emergencystyles';
import { isGibberish } from '../../src/utils/validation';

const defaultPhoto = require('../../assets/def_icon.png');

const SPEECH_LANGUAGE_OPTIONS = [
    { key: 'tl', label: 'Tagalog', langCode: 'fil-PH' },
    { key: 'en', label: 'English', langCode: 'en-US' },
];

const CATEGORIES = [
    { key: 'Medical', label: 'Medical', icon: 'medical-bag', lib: 'community' },
    { key: 'Fire/Smoke', label: 'Fire/Smoke', icon: 'fire', lib: 'community' },
    { key: 'Electrical Hazard', label: 'Electrical Hazard', icon: 'lightning-bolt', lib: 'community' },
    { key: 'Security', label: 'Security', icon: 'shield-account', lib: 'community' },
    { key: 'Flood/Water Leak', label: 'Flood/Water Leak', icon: 'pipe-leak', lib: 'community' },
    { key: 'Other', label: 'Other', icon: 'dots-horizontal-circle', lib: 'community' },
];

const BAR_COUNT = 28;

const fmtTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map(v => String(v).padStart(2, '00')).join(':');
};

const formatTenantRoomLocation = (roomNumber) => {
    const room = String(roomNumber ?? '').trim();
    if (!room) return '';
    return room.toLowerCase().startsWith('room ') ? room : `Room ${room}`;
};

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
                <MaterialIcons name={iconName} size={24} color={isActive ? COLORS.primary : COLORS.muted} />
                <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>{label}</Text>
            </>
        )}
    </TouchableOpacity>
);

const Waveform = ({ isRecording, volumeAnim }) => {
    const bars = useRef(
        Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.3))
    ).current;

    useEffect(() => {
        if (!isRecording) {
            bars.forEach(b => Animated.timing(b, { toValue: 0.3, duration: 200, useNativeDriver: true }).start());
            return;
        }
        const anims = bars.map((b, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 40),
                    Animated.timing(b, { toValue: 0.3 + Math.random() * 0.7, duration: 180 + Math.random() * 80, useNativeDriver: true }),
                    Animated.timing(b, { toValue: 0.2 + Math.random() * 0.2, duration: 180 + Math.random() * 80, useNativeDriver: true }),
                ])
            )
        );
        anims.forEach(a => a.start());
        return () => anims.forEach(a => a.stop());
    }, [isRecording]);

    return (
        <View style={styles.waveformRow}>
            {bars.map((anim, i) => {
                const combinedScale = Animated.multiply(anim, volumeAnim);
                return (
                    <Animated.View
                        key={i}
                        style={{
                            width: 3,
                            height: 36,
                            borderRadius: 2,
                            backgroundColor: COLORS.primary,
                            transform: [{ scaleY: combinedScale }],
                        }}
                    />
                );
            })}
        </View>
    );
};

// ── simple cache so overlay only shows once per session ───────────────────────
const emergencyScreenCache = { loaded: false };

export default function EmergencyScreen() {
    const router = useRouter();
    const { avatarUri, user, fetchUser } = useUser();
    const insets = useSafeAreaInsets();
    const drawerRef = useRef(null);

    // only show overlay on very first load
    const [loading, setLoading] = useState(!emergencyScreenCache.loaded);

    // ── vacation guard ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (user?.is_on_vacation) {
            Alert.alert(
                'Access Restricted',
                'You cannot submit emergency reports while on vacation status. Please turn off vacation mode in your profile first.',
                [{ text: 'OK', onPress: () => router.replace('/tenant/dashboard') }]
            );
        }
    }, [user?.is_on_vacation]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [speechLanguage, setSpeechLanguage] = useState(Platform.OS === 'ios' ? 'en' : 'tl');
    const [supportedSpeechLanguages, setSupportedSpeechLanguages] = useState(Platform.OS === 'ios' ? ['en'] : ['tl', 'en']);
    const [recordingState, setRecordingState] = useState('idle'); // 'idle' | 'recording' | 'paused'
    const [modelLoaded, setModelLoaded] = useState(false);
    const [modelLoading, setModelLoading] = useState(true);
    const [recordSecs, setRecordSecs] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [manualText, setManualText] = useState('');
    const [hasRecording, setHasRecording] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const recordingStateRef = useRef('idle');
    const timerRef = useRef(null);
    const lastTimerTickRef = useRef(null);
    const transcribedRef = useRef('');
    const confirmedTranscriptRef = useRef('');
    const lastEventTimeRef = useRef(0);
    const currentSessionTranscriptRef = useRef('');
    const isSessionActiveRef = useRef(false);

    // session tracking to prevent race conditions without UI freezing
    const lastStartCallTimeRef = useRef(0);
    const lastStartEventTimeRef = useRef(0);

    useSpeechRecognitionEvent("start", () => {
        console.log("Speech recognition start event received.");
        isSessionActiveRef.current = true;
        lastStartEventTimeRef.current = Date.now();
    });

    useSpeechRecognitionEvent("result", (event) => {
        if (lastStartEventTimeRef.current < lastStartCallTimeRef.current) {
            console.log("Speech result ignored because it belongs to a stale session.");
            return;
        }
        if (!isSessionActiveRef.current) {
            console.log("Speech result event received but ignored because session is not active");
            return;
        }

        console.log("Speech recognition result event received:", JSON.stringify(event));
        const text = event.results[0]?.transcript || '';
        console.log("Extracted transcript:", text, "isFinal:", event.isFinal);
        
        const now = Date.now();
        const timeDiff = now - lastEventTimeRef.current;
        lastEventTimeRef.current = now;
        console.log("Time since last speech event:", timeDiff, "ms");

        // Detect if the engine started a new segment (e.g. after a pause)
        if (currentSessionTranscriptRef.current) {
            const prev = currentSessionTranscriptRef.current.trim().toLowerCase();
            const next = text.trim().toLowerCase();
            if (prev !== next) {
                const prevWords = prev.split(/\s+/);
                const nextWords = next.split(/\s+/);
                
                // It is a continuation if next starts with prev, or first word is same and length isn't shrinking
                const isContinuation = next.startsWith(prev) || (nextWords[0] === prevWords[0] && nextWords.length >= prevWords.length);
                
                if (!isContinuation) {
                    if (timeDiff > 800 || nextWords[0] !== prevWords[0]) {
                        console.log("Detecting new segment. Committing previous text:", currentSessionTranscriptRef.current);
                        const existing = confirmedTranscriptRef.current;
                        confirmedTranscriptRef.current = existing 
                            ? `${existing} ${currentSessionTranscriptRef.current}`.trim() 
                            : currentSessionTranscriptRef.current;
                        currentSessionTranscriptRef.current = '';
                    }
                }
            }
        }

        if (event.isFinal) {
            const existing = confirmedTranscriptRef.current;
            confirmedTranscriptRef.current = existing ? `${existing} ${text}`.trim() : text;
            currentSessionTranscriptRef.current = '';
            
            setTranscript(confirmedTranscriptRef.current);
            setManualText(confirmedTranscriptRef.current);
            transcribedRef.current = confirmedTranscriptRef.current;
        } else {
            currentSessionTranscriptRef.current = text;
            const existing = confirmedTranscriptRef.current;
            const merged = existing ? `${existing} ${text}` : text;
            setTranscript(merged);
            setManualText(merged);
            transcribedRef.current = merged;
        }
    });

    useSpeechRecognitionEvent("end", () => {
        console.log("Speech recognition end event received.");
        
        if (lastStartEventTimeRef.current < lastStartCallTimeRef.current) {
            console.log("Ignored end event for old session.");
            return;
        }

        isSessionActiveRef.current = false;
        
        if (currentSessionTranscriptRef.current) {
            const existing = confirmedTranscriptRef.current;
            confirmedTranscriptRef.current = existing 
                ? `${existing} ${currentSessionTranscriptRef.current}`.trim() 
                : currentSessionTranscriptRef.current;
            currentSessionTranscriptRef.current = '';
            
            setTranscript(confirmedTranscriptRef.current);
            setManualText(confirmedTranscriptRef.current);
            transcribedRef.current = confirmedTranscriptRef.current;
        }

        if (recordingStateRef.current === 'recording') {
            setRecordingState('idle');
            stopRecordingTimer();
        }
        setHasRecording(Boolean(transcribedRef.current));
    });

    useSpeechRecognitionEvent("error", (event) => {
        if (event.error === 'aborted') {
            return;
        }
        console.error('Speech recognition error event received:', event);
        if (lastStartEventTimeRef.current >= lastStartCallTimeRef.current) {
            isSessionActiveRef.current = false;
            if (recordingStateRef.current === 'recording') {
                setRecordingState('idle');
                stopRecordingTimer();
                Alert.alert('Voice Input Error', event.message || 'Speech recognition failed.');
            }
        }
    });

    const volumeAnim = useRef(new Animated.Value(1.0)).current;

    useSpeechRecognitionEvent("volumechange", (event) => {
        if (recordingStateRef.current !== 'recording') return;
        const rawVal = event.value;
        const zeroToOne = Math.max(0, Math.min(1, (rawVal + 2) / 12));
        const normalized = 0.2 + zeroToOne * 0.8;
        Animated.timing(volumeAnim, {
            toValue: normalized,
            duration: 80,
            useNativeDriver: true,
        }).start();
    });

    useEffect(() => {
        recordingStateRef.current = recordingState;
        if (recordingState !== 'recording') {
            Animated.timing(volumeAnim, {
                toValue: 1.0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [recordingState]);

    const isRecording = recordingState === 'recording';
    const isPaused = recordingState === 'paused';

    const selectedSpeechLanguage = SPEECH_LANGUAGE_OPTIONS.find((option) => option.key === speechLanguage)
        ?? SPEECH_LANGUAGE_OPTIONS.find((option) => option.key === 'en')
        ?? SPEECH_LANGUAGE_OPTIONS[0];

    // ── initial load — wait for user + speech recognition readiness, then hide overlay ──────────
    useEffect(() => {
        if (emergencyScreenCache.loaded) return;

        const init = async () => {
            try {
                await fetchUser();
            } finally {
                emergencyScreenCache.loaded = true;
                setLoading(false);
            }
        };
        init();
    }, []);

    const stopRecordingTimer = useCallback(() => {
        clearInterval(timerRef.current);
        timerRef.current = null;
        lastTimerTickRef.current = null;
    }, []);

    const startRecordingTimer = useCallback((isResume = false) => {
        stopRecordingTimer();
        if (!isResume) {
            setRecordSecs(0);
        }
        lastTimerTickRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const now = Date.now();
            if (lastTimerTickRef.current && now - lastTimerTickRef.current < 900) return;
            lastTimerTickRef.current = now;
            setRecordSecs((seconds) => seconds + 1);
        }, 1000);
    }, [stopRecordingTimer]);

    const handleSpeechLanguageChange = (nextLanguage) => {
        if (recordingState !== 'idle' || modelLoading || nextLanguage === speechLanguage) return;
        setSpeechLanguage(nextLanguage);
        setTranscript('');
        setManualText('');
        setHasRecording(false);
        setRecordSecs(0);
        transcribedRef.current = '';
        confirmedTranscriptRef.current = '';
    };

    useEffect(() => {
        console.log("Emergency component mounted. user vacation status:", user?.is_on_vacation);
        console.log("ExpoSpeechRecognitionModule object present:", !!ExpoSpeechRecognitionModule);
        if (user?.is_on_vacation) return;
        let mounted = true;

        setModelLoaded(false);
        setModelLoading(true);

        const initSpeechRecognition = async () => {
            console.log("initSpeechRecognition started...");
            try {
                if (!ExpoSpeechRecognitionModule) {
                    console.error("ExpoSpeechRecognitionModule is undefined! Make sure native code is compiled and installed.");
                    return;
                }

                // 1. Check permissions
                const permResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
                console.log("requestPermissionsAsync result:", permResult);
                if (mounted) {
                    if (permResult.granted) {
                        console.log("Permissions successfully granted. Setting modelLoaded to true.");
                        setModelLoaded(true);
                    } else {
                        console.warn('Speech recognition permission not granted:', permResult);
                    }
                }
            } catch (error) {
                console.error('failed to initialize speech recognition:', error);
            } finally {
                if (mounted) setModelLoading(false);
            }
        };

        initSpeechRecognition();

        return () => {
            mounted = false;
            stopRecordingTimer();
            if (ExpoSpeechRecognitionModule) {
                ExpoSpeechRecognitionModule.abort();
            }
        };
    }, [user?.is_on_vacation, stopRecordingTimer]);

    useEffect(() => {
        if (recordSecs >= 60 && recordingState === 'recording') {
            stopRecording();
            Alert.alert('Recording Limit Reached', 'Voice recording is limited to 1 minute.');
        }
    }, [recordSecs, recordingState]);

    const startRecording = async () => {
        console.log("startRecording called. modelLoaded:", modelLoaded, "modelLoading:", modelLoading);
        if (!modelLoaded) {
            Alert.alert('Voice Input Loading', 'Speech recognition is still loading. Please try again in a moment.');
            return;
        }

        try {
            console.log("Requesting permissions at start of recording...");
            const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            console.log("Recording permissions result:", perm);
            if (!perm.granted) {
                Alert.alert('Permission Required', 'Speech recognition and microphone permissions are required.');
                return;
            }
        } catch (err) {
            console.error("Error checking permissions before recording:", err);
        }

        lastStartCallTimeRef.current = Date.now();
        transcribedRef.current = '';
        confirmedTranscriptRef.current = '';
        currentSessionTranscriptRef.current = '';
        lastEventTimeRef.current = Date.now();
        isSessionActiveRef.current = true;
        setTranscript('');
        setManualText('');
        setHasRecording(false);
        setRecordingState('recording');
        startRecordingTimer(false);

        try {
            console.log("Calling ExpoSpeechRecognitionModule.start with language:", selectedSpeechLanguage.langCode);
            await ExpoSpeechRecognitionModule.start({
                lang: selectedSpeechLanguage.langCode,
                interimResults: true,
                continuous: true,
                volumeChangeEventOptions: {
                    enabled: true,
                    intervalMillis: 80,
                },
            });
            console.log("ExpoSpeechRecognitionModule.start completed successfully.");
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            setRecordingState('idle');
            stopRecordingTimer();
            Alert.alert('Voice Input Error', String(error));
        }
    };

    const pauseRecording = async () => {
        stopRecordingTimer();
        setRecordingState('paused');
        try {
            await ExpoSpeechRecognitionModule.abort();
        } catch (error) {
            console.error('failed to abort speech recognizer:', error);
        }
    };

    const resumeRecording = async () => {
        if (!modelLoaded) {
            Alert.alert('Voice Input Loading', 'Speech recognition is still loading. Please try again in a moment.');
            return;
        }

        lastStartCallTimeRef.current = Date.now();
        setRecordingState('recording');
        startRecordingTimer(true);
        lastEventTimeRef.current = Date.now();
        isSessionActiveRef.current = true;

        try {
            await ExpoSpeechRecognitionModule.start({
                lang: selectedSpeechLanguage.langCode,
                interimResults: true,
                continuous: true,
                volumeChangeEventOptions: {
                    enabled: true,
                    intervalMillis: 80,
                },
            });
        } catch (error) {
            console.error("Error resuming speech recognition:", error);
            setRecordingState('idle');
            stopRecordingTimer();
            Alert.alert('Voice Input Error', String(error));
        }
    };

    const stopRecording = async () => {
        stopRecordingTimer();
        setRecordingState('idle');
        try {
            await ExpoSpeechRecognitionModule.abort();
        } catch (error) {
            console.error('failed to abort speech recognizer:', error);
        }
    };

    const handlePanicAlert = async () => {
        Alert.alert(
            'Send Panic Alert?',
            'This will immediately alert staff with your room details.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Now',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.post('/emergency', {
                                type: 'Panic Alert',
                                description: 'Panic alert sent from app.',
                            });
                            Alert.alert('Alert Sent!', 'Staff have been notified immediately.');
                        } catch {
                            Alert.alert('Error', 'Failed to send panic alert. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleSubmit = async () => {
        const description = manualText.trim() || transcript.trim();
        if (!description && !selectedCategory) {
            Alert.alert('Missing Info', 'Please describe the emergency or select a category.');
            return;
        }

        if (description && isGibberish(description)) {
            Alert.alert('Invalid Input', 'Please enter a clear description of the situation. Gibberish text or random characters are not allowed.');
            return;
        }

        setSubmitting(true);
        try {
            await client.post('/emergency', {
                type: selectedCategory || undefined,
                description,
                location: formatTenantRoomLocation(user?.room_number),
                input_type: hasRecording ? 'voice' : 'text',
                language: speechLanguage,
            });

            Alert.alert('Submitted!', 'Your emergency report has been sent to staff.');
            setSelectedCategory(null);
            setRecordingState('idle');
            setRecordSecs(0);
            setTranscript('');
            setManualText('');
            setHasRecording(false);
            transcribedRef.current = '';
            confirmedTranscriptRef.current = '';
        } catch {
            Alert.alert('Error', 'Failed to submit report. Please try again.');
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
                {/* top row */}
                <View style={styles.topRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => drawerRef.current?.open()}>
                        <MaterialIcons name="menu" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <View style={styles.topRowRight}>
                        <NotificationBell style={styles.iconBtn} iconColor={COLORS.dark} />
                        <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                            <Image
                                source={avatarUri ? { uri: avatarUri } : defaultPhoto}
                                style={styles.avatar}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* page header */}
                <View style={styles.headerSection}>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.headerIconBadge}>
                            <MaterialIcons name="warning" size={20} color={COLORS.white} />
                        </View>
                        <Text style={styles.headerTitle}>Emergency Report</Text>
                    </View>
                    <Text style={styles.headerSub}>Describe the situation by speaking or typing.</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                >
                    {/* panic alert */}
                    <TouchableOpacity style={styles.panicBtn} activeOpacity={0.85} onPress={handlePanicAlert}>
                        <Text style={styles.panicBtnText}>SEND PANIC ALERT</Text>
                    </TouchableOpacity>
                    <Text style={styles.panicSub}>
                        Press to send an immediate alert with your room details to staff.
                    </Text>

                    {/* category selector */}
                    <Text style={[styles.sectionLabel, styles.standaloneSectionLabel]}>What's your emergency?</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map(cat => {
                            const active = selectedCategory === cat.key;
                            const colors = CATEGORY_COLORS[cat.key];
                            return (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={[
                                        styles.categoryChip,
                                        {
                                            backgroundColor: active ? colors.bg : COLORS.white,
                                            borderColor: active ? colors.icon : COLORS.border,
                                        },
                                    ]}
                                    activeOpacity={0.75}
                                    onPress={() => setSelectedCategory(active ? null : cat.key)}
                                >
                                    <MaterialCommunityIcons name={cat.icon} size={18} color={colors.icon} />
                                    <Text style={[styles.categoryChipText, { color: active ? colors.label : COLORS.dark }]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* voice recorder */}
                    <View style={styles.formCard}>
                        <View style={styles.labelRow}>
                            <Text style={styles.sectionLabel}>Describe the emergency</Text>
                            <TouchableOpacity
                                style={styles.historyBtn}
                                onPress={() => router.push('/tenant/emergencyhistory')}
                            >
                                <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                                <Text style={styles.historyBtnText}>History</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sectionSub}>Speak or type the situation</Text>

                        <View style={styles.languageSelector}>
                            {SPEECH_LANGUAGE_OPTIONS.filter(opt => supportedSpeechLanguages.includes(opt.key)).map((option) => {
                                const active = speechLanguage === option.key;
                                const isSpeechBusy = recordingState !== 'idle' || modelLoading;
                                return (
                                    <TouchableOpacity
                                        key={option.key}
                                        style={[
                                            styles.languageOption,
                                            active && styles.languageOptionActive,
                                            isSpeechBusy && styles.languageOptionDisabled,
                                        ]}
                                        onPress={() => handleSpeechLanguageChange(option.key)}
                                        disabled={isSpeechBusy}
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

                        <View style={[styles.recorderBox, (isRecording || isPaused) && styles.recorderBoxActive]}>
                            {recordingState === 'idle' ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.micCircle}
                                        activeOpacity={0.85}
                                        onPress={startRecording}
                                        disabled={modelLoading}
                                    >
                                        <MaterialIcons name="mic" size={28} color={COLORS.white} />
                                    </TouchableOpacity>
                                    <Text style={styles.timerText}>{fmtTimer(recordSecs)}</Text>
                                </>
                            ) : (
                                <>
                                    <Waveform isRecording={isRecording} volumeAnim={volumeAnim} />
                                    <Text style={styles.timerText}>{fmtTimer(recordSecs)}</Text>

                                    <View style={styles.controlRow}>
                                        {isRecording ? (
                                            <TouchableOpacity
                                                style={[styles.controlBtn, styles.pauseBtn]}
                                                activeOpacity={0.85}
                                                onPress={pauseRecording}
                                            >
                                                <MaterialIcons name="pause" size={24} color={COLORS.white} />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.controlBtn, styles.resumeBtn]}
                                                activeOpacity={0.85}
                                                onPress={resumeRecording}
                                            >
                                                <MaterialIcons name="play-arrow" size={24} color={COLORS.white} />
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            style={[styles.controlBtn, styles.stopBtn]}
                                            activeOpacity={0.85}
                                            onPress={stopRecording}
                                        >
                                            <MaterialIcons name="stop" size={24} color={COLORS.white} />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>

                        <Text style={styles.tapToSpeak}>
                            {modelLoading
                                ? `Loading ${selectedSpeechLanguage.label} Model...`
                                : recordingState === 'recording'
                                    ? 'Recording... Tap Pause or Stop'
                                    : recordingState === 'paused'
                                        ? 'Paused. Tap Resume or Stop'
                                        : hasRecording
                                            ? 'Tap to re-record'
                                            : 'Tap to Speak'}
                        </Text>

                        {!!transcript && (
                            <View style={styles.transcriptBox}>
                                <Text style={styles.transcriptText}>{transcript}</Text>
                            </View>
                        )}

                        <View style={styles.orRow}>
                            <View style={styles.orLine} />
                            <Text style={styles.orText}>or</Text>
                            <View style={styles.orLine} />
                        </View>

                        <TextInput
                            style={styles.textInput}
                            placeholder="Describe the emergency here"
                            placeholderTextColor={COLORS.muted}
                            value={manualText}
                            onChangeText={(text) => setManualText(text)}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                        activeOpacity={0.85}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting
                            ? <ActivityIndicator size="small" color={COLORS.white} />
                            : <Text style={styles.submitBtnText}>Submit</Text>
                        }
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* bottom nav */}
            <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <NavItem iconName="home" label="Home" onPress={() => router.push('/tenant/dashboard')} />
                <NavItem iconName="person-outline" label="Visitor" onPress={() => router.push('/tenant/visitors')} />
                <NavItem iconName="warning" label="Emergency" isCenter isActive onPress={() => { }} />
                <NavItem iconName="water-drop" label="Water Bill" onPress={() => router.push('/tenant/water-bill')} />
                <NavItem iconName="account-circle" label="Profile" onPress={() => router.push('/tenant/profile')} />
            </View>

            <DrawerMenu ref={drawerRef} />

            {/* loading overlay — only on first visit, skipped on return */}
            <LoadingOverlay visible={loading} />

        </SafeAreaView>
    );
}