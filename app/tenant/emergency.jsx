import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    TextInput,
    Alert,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    onError,
    onFinalResult,
    onPartialResult,
    onResult,
    start,
    stop,
} from 'react-native-vosk';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import DrawerMenu from '../../src/components/DrawerMenu';
import styles, { COLORS, CATEGORY_COLORS } from '../../src/constants/emergencystyles';
import { ensureVoskModelLoaded } from '../../src/utils/voskModelCache';

const defaultPhoto = require('../../assets/def_icon.png');

const SPEECH_LANGUAGE_OPTIONS = [
    { key: 'tl', label: 'Tagalog', model: 'model-tl-ph' },
    { key: 'en', label: 'English', model: 'model-en-us' },
];

// emergency categories
const CATEGORIES = [
    { key: 'Medical', label: 'Medical', icon: 'medical-bag', lib: 'community' },
    { key: 'Fire/Smoke', label: 'Fire/Smoke', icon: 'fire', lib: 'community' },
    { key: 'Electrical Hazard', label: 'Electrical Hazard', icon: 'lightning-bolt', lib: 'community' },
    { key: 'Security', label: 'Security', icon: 'shield-account', lib: 'community' },
    { key: 'Flood/Water Leak', label: 'Flood/Water Leak', icon: 'pipe-leak', lib: 'community' },
    { key: 'Other', label: 'Other', icon: 'dots-horizontal-circle', lib: 'community' },
];

// number of waveform bars
const BAR_COUNT = 28;

// format seconds → HH:MM:SS
const fmtTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
};

const EMERGENCY_KEYWORDS = [
    { category: 'Medical', words: ['medical', 'injury', 'injured', 'hurt', 'bleeding', 'fainted', 'unconscious', 'sick', 'ambulance', 'heart', 'chest pain', 'nahilo', 'himatay', 'sugat', 'nasugatan', 'dugo', 'may sakit', 'masakit', 'ambulansya'] },
    { category: 'Fire/Smoke', words: ['fire', 'smoke', 'burning', 'burn', 'flame', 'sunog', 'usok', 'nasusunog', 'apoy'] },
    { category: 'Electrical Hazard', words: ['electric', 'electrical', 'spark', 'wire', 'outlet', 'power', 'shock', 'kuryente', 'saksakan', 'kurente', 'grounded', 'kumukuryente', 'pumutok'] },
    { category: 'Security', words: ['security', 'intruder', 'break in', 'break-in', 'stolen', 'theft', 'fight', 'threat', 'stranger', 'magnanakaw', 'nanakaw', 'nakawan', 'away', 'gulo', 'banta', 'estranghero'] },
    { category: 'Flood/Water Leak', words: ['flood', 'flooding', 'water leak', 'leak', 'pipe burst', 'overflow', 'baha', 'binabaha', 'tagas', 'tumutulo', 'pumutok na tubo', 'umaapaw'] },
];

const detectEmergencyTypeFromTranscript = (text) => {
    const normalized = String(text ?? '').toLowerCase();
    return EMERGENCY_KEYWORDS.find(({ words }) =>
        words.some((word) => normalized.includes(word))
    )?.category ?? '';
};

const formatTenantRoomLocation = (roomNumber) => {
    const room = String(roomNumber ?? '').trim();
    if (!room) return '';
    return room.toLowerCase().startsWith('room ') ? room : `Room ${room}`;
};

const detectLocationFromTranscript = (text, tenantRoomNumber) => {
    const normalized = String(text ?? '').trim();
    const tenantRoomLocation = formatTenantRoomLocation(tenantRoomNumber);
    const mentionsRoom = /\b(?:room|rm|kwarto|kuwarto)\b/i.test(normalized);
    if (mentionsRoom && tenantRoomLocation) return tenantRoomLocation;

    const roomMatch = normalized.match(/\b(?:room|rm|kwarto|kuwarto)\s*([a-z0-9-]+)/i);
    if (roomMatch) return `Room ${roomMatch[1].toUpperCase()}`;

    const knownLocation = normalized.match(/\b(?:lobby|hallway|kitchen|bathroom|stairs|stairwell|elevator|parking|laundry|banyo|kusina|hagdan|pasilyo)\b/i);
    return knownLocation?.[0] ?? '';
};

// nav item
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

// animated waveform
const Waveform = ({ isRecording }) => {
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
                    Animated.delay(i * 30),
                    Animated.timing(b, { toValue: 0.3 + Math.random() * 0.7, duration: 200 + Math.random() * 200, useNativeDriver: true }),
                    Animated.timing(b, { toValue: 0.2 + Math.random() * 0.3, duration: 200 + Math.random() * 200, useNativeDriver: true }),
                ])
            )
        );
        anims.forEach(a => a.start());
        return () => anims.forEach(a => a.stop());
    }, [isRecording]);

    return (
        <View style={styles.waveformRow}>
            {bars.map((anim, i) => (
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

export default function EmergencyScreen() {
    const router = useRouter();
    const { avatarUri, user } = useUser();
    const insets = useSafeAreaInsets();
    const drawerRef = useRef(null);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [speechLanguage, setSpeechLanguage] = useState('tl');
    const [isRecording, setIsRecording] = useState(false);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [modelLoading, setModelLoading] = useState(true);
    const [recordSecs, setRecordSecs] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [manualText, setManualText] = useState('');
    const [detectedType, setDetectedType] = useState('');
    const [detectedLocation, setDetectedLocation] = useState('');
    const [hasRecording, setHasRecording] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const timerRef = useRef(null);
    const lastTimerTickRef = useRef(null);
    const transcribedRef = useRef('');
    const confirmedTranscriptRef = useRef('');
    const listenerRefs = useRef([]);
    const hasContent = transcript.trim() || manualText.trim();
    const showDetected = (detectedType || detectedLocation) && hasContent;

    const selectedSpeechLanguage = SPEECH_LANGUAGE_OPTIONS.find((option) => option.key === speechLanguage)
        ?? SPEECH_LANGUAGE_OPTIONS[0];

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

    const applyEmergencyDetection = useCallback((text) => {
        const detectedCategory = detectEmergencyTypeFromTranscript(text);
        if (detectedCategory) {
            setSelectedCategory(detectedCategory);
            setDetectedType(detectedCategory);
        }

        const detectedRoom = detectLocationFromTranscript(text, user?.room_number);
        if (detectedRoom) setDetectedLocation(detectedRoom);
    }, [user?.room_number]);

    const updateTranscript = useCallback((text) => {
        const nextText = String(text ?? '').trim();
        if (!nextText) return;

        transcribedRef.current = nextText;
        setTranscript(nextText);
        applyEmergencyDetection(nextText);
    }, [applyEmergencyDetection]);

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

    const handleSpeechLanguageChange = (nextLanguage) => {
        if (isRecording || modelLoading || nextLanguage === speechLanguage) return;

        setSpeechLanguage(nextLanguage);
        setTranscript('');
        setHasRecording(false);
        setRecordSecs(0);
        setDetectedType('');
        setDetectedLocation('');
        transcribedRef.current = '';
        confirmedTranscriptRef.current = '';
    };

    useEffect(() => {
        let mounted = true;

        setModelLoaded(false);
        setModelLoading(true);

        ensureVoskModelLoaded(selectedSpeechLanguage.model)
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
        };
    }, [clearVoskListeners, selectedSpeechLanguage.label, selectedSpeechLanguage.model, stopRecordingTimer]);

    const startRecording = async () => {
        if (!modelLoaded) {
            Alert.alert('Voice Input Loading', 'Speech recognition is still loading. Please try again in a moment.');
            return;
        }

        clearVoskListeners();
        transcribedRef.current = '';
        confirmedTranscriptRef.current = '';
        setTranscript('');
        setDetectedType('');
        setDetectedLocation('');
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
    // panic alert — sends immediately with room info, no description required
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
                                status: 'pending',
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

    // submit full emergency report
    const handleSubmit = async () => {
        const description = transcript.trim() || manualText.trim();
        if (!description && !selectedCategory) {
            Alert.alert('Missing Info', 'Please describe the emergency or select a category.');
            return;
        }

        setSubmitting(true);
        try {
            await client.post('/emergency', {
                type: detectedType || selectedCategory || 'Other',
                description: description,
                location: detectedLocation,
                status: 'pending',
                input_type: hasRecording ? 'voice' : 'text',
                language: speechLanguage,
            });

            Alert.alert('Submitted!', 'Your emergency report has been sent to staff.');
            // reset form
            setSelectedCategory(null);
            setIsRecording(false);
            setRecordSecs(0);
            setTranscript('');
            setManualText('');
            setDetectedType('');
            setDetectedLocation('');
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

            {/* top row */}
            <View style={styles.topRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => drawerRef.current?.open()}>
                    <MaterialIcons name="menu" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.topRowRight}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/tenant/notifications')}>
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
            >
                {/* panic alert button */}
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
                                <MaterialCommunityIcons
                                    name={cat.icon}
                                    size={18}
                                    color={colors.icon}
                                />
                                <Text style={[styles.categoryChipText, { color: active ? colors.label : COLORS.dark }]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* voice recorder */}
                <View style={styles.formCard}>
                    <Text style={styles.sectionLabel}>Describe the emergency</Text>
                    <Text style={styles.sectionSub}>Speak or type the situation</Text>

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

                    {/* transcript output */}
                    {!!transcript && (
                        <View style={styles.transcriptBox}>
                            <Text style={styles.transcriptText}>{transcript}</Text>
                        </View>
                    )}

                    {/* or divider */}
                    <View style={styles.orRow}>
                        <View style={styles.orLine} />
                        <Text style={styles.orText}>or</Text>
                        <View style={styles.orLine} />
                    </View>

                    {/* manual text input */}
                    <TextInput
                        style={styles.textInput}
                        placeholder="Describe the emergency here"
                        placeholderTextColor={COLORS.muted}
                        value={manualText}
                        onChangeText={(text) => {
                            setManualText(text);
                            applyEmergencyDetection(text);
                        }}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* AI-detected info card — shown after transcription */}
                {showDetected && (
                    <View style={styles.detectedCard}>
                        <View style={styles.detectedRow}>
                            <Text style={styles.detectedLabel}>Detected Type:</Text>
                            <Text style={styles.detectedValue}>{detectedType}</Text>
                            <TouchableOpacity onPress={() => Alert.prompt?.('Edit Type', '', setDetectedType, 'plain-text', detectedType)}>
                                <MaterialIcons name="edit" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.detectedRow}>
                            <Text style={styles.detectedLabel}>Location:</Text>
                            <Text style={styles.detectedValue}>{detectedLocation}</Text>
                            <TouchableOpacity onPress={() => Alert.prompt?.('Edit Location', '', setDetectedLocation, 'plain-text', detectedLocation)}>
                                <MaterialIcons name="edit" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

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

            {/* bottom nav */}
            <View style={[
                styles.bottomNav,
                { paddingBottom: Math.max(insets.bottom, 24) },
            ]}>
                <NavItem iconName="home" label="Home" onPress={() => router.push('/tenant/dashboard')} />
                <NavItem iconName="person-outline" label="Visitor" onPress={() => router.push('/tenant/visitors')} />
                <NavItem iconName="warning" label="Emergency" isCenter isActive onPress={() => { }} />
                <NavItem iconName="water-drop" label="Water Bill" onPress={() => router.push('/tenant/water-bill')} />
                <NavItem iconName="account-circle" label="Profile" onPress={() => router.push('/tenant/profile')} />
            </View>

            <DrawerMenu ref={drawerRef} />
        </SafeAreaView>
    );
}
