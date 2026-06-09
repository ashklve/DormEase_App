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
    Animated,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
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
import * as ImagePicker from 'expo-image-picker';
import client from '../../api/client';
import styles, { COLORS } from '../../src/constants/maintenancestyles';
import DrawerMenu from '../../src/components/DrawerMenu';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';
import { ensureVoskModelLoaded } from '../../src/utils/voskModelCache';

const defaultPhoto = require('../../assets/def_icon.png');

const SPEECH_LANGUAGE_OPTIONS = [
    { key: 'tl', label: 'Tagalog', model: 'model-tl-ph' },
    { key: 'en', label: 'English', model: 'model-en-us' },
];

const fmtTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

// ── Waveform animation component ─────────────────────────────────────────────
const BAR_COUNT = 28;

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

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MaintenanceScreen() {
    const router = useRouter();
    const drawerRef = useRef(null);
    const { avatarUri } = useUser();
    const insets = useSafeAreaInsets();

    // ── Form state
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState(null); // { uri, fileName, type }
    const [submitting, setSubmitting] = useState(false);

    // ── Voice recorder state
    const [speechLanguage, setSpeechLanguage] = useState('tl');
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

    const selectedSpeechLanguage = SPEECH_LANGUAGE_OPTIONS.find((o) => o.key === speechLanguage)
        ?? SPEECH_LANGUAGE_OPTIONS[0];

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
            if (lastTimerTickRef.current && now - lastTimerTickRef.current < 900) return;
            lastTimerTickRef.current = now;
            setRecordSecs((s) => s + 1);
        }, 1000);
    }, [stopRecordingTimer]);

    const clearVoskListeners = useCallback(() => {
        listenerRefs.current.forEach((l) => l?.remove?.());
        listenerRefs.current = [];
    }, []);

    const updateTranscript = useCallback((text) => {
        const next = String(text ?? '').trim();
        if (!next) return;
        transcribedRef.current = next;
        setDescription(next);
    }, []);

    const mergeTranscriptChunk = useCallback((text) => {
        const chunk = String(text ?? '').trim();
        if (!chunk) return;
        const existing = confirmedTranscriptRef.current;
        const next = existing ? `${existing} ${chunk}` : chunk;
        confirmedTranscriptRef.current = next;
        updateTranscript(next);
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
        setDescription('');
        setHasRecording(false);
        setRecordSecs(0);
        transcribedRef.current = '';
        confirmedTranscriptRef.current = '';
    };

    useEffect(() => {
        let mounted = true;
        setModelLoaded(false);
        setModelLoading(true);

        ensureVoskModelLoaded(selectedSpeechLanguage.model)
            .then(() => { if (mounted) setModelLoaded(true); })
            .catch((err) => {
                console.error('failed to load Vosk model:', err);
                if (mounted) {
                    Alert.alert('Voice Input Unavailable', `${selectedSpeechLanguage.label} speech recognition could not be loaded.`);
                }
            })
            .finally(() => { if (mounted) setModelLoading(false); });

        return () => {
            mounted = false;
            stopRecordingTimer();
            clearVoskListeners();
            stop();
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
        if (isRecording) stopRecording();
        else startRecording();
    };

    // ── Camera
    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: false,
        });

        if (!result.canceled && result.assets?.length > 0) {
            const asset = result.assets[0];
            setPhoto({
                uri: asset.uri,
                fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
                type: asset.mimeType ?? 'image/jpeg',
            });
        }
    };

    const handleRemovePhoto = () => setPhoto(null);

    // ── Submit
    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Validation', 'Please describe the problem.');
            return;
        }
        setSubmitting(true);
        try {
            if (photo) {
                const formData = new FormData();
                formData.append('description', description.trim());
                formData.append('input_type', hasRecording ? 'voice' : 'text');
                formData.append('language', speechLanguage);
                formData.append('photo', {
                    uri: photo.uri,
                    name: photo.fileName,
                    type: photo.type,
                });
                await client.post('/maintenance', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await client.post('/maintenance', {
                    description: description.trim(),
                    input_type: hasRecording ? 'voice' : 'text',
                    language: speechLanguage,
                });
            }

            Alert.alert('Success', 'Maintenance request submitted successfully.');
            setDescription('');
            setPhoto(null);
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
                        <NotificationBell style={styles.iconBtn} iconColor={COLORS.dark} />
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

                        {/* Language selector */}
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
                            {modelLoading
                                ? `Loading ${selectedSpeechLanguage.label} Model...`
                                : isRecording
                                    ? 'Tap to stop recording'
                                    : hasRecording
                                        ? 'Tap to re-record'
                                        : 'Tap to Speak'}
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

                    {/* ── Photo Section ── */}
                    <View style={styles.formCard}>
                        <Text style={styles.fieldLabel}>Attach a Photo</Text>
                        <Text style={styles.fieldHint}>Optional — take a photo of the problem</Text>

                        {photo ? (
                            <View style={styles.photoPreviewWrapper}>
                                <Image
                                    source={{ uri: photo.uri }}
                                    style={styles.photoPreview}
                                    resizeMode="cover"
                                />
                                {/* Retake + Remove actions */}
                                <View style={styles.photoActions}>
                                    <TouchableOpacity
                                        style={styles.photoActionBtn}
                                        activeOpacity={0.85}
                                        onPress={handleTakePhoto}
                                    >
                                        <MaterialIcons name="camera-alt" size={16} color={COLORS.primary} />
                                        <Text style={styles.photoActionBtnText}>Retake</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.photoActionBtn, styles.photoActionBtnDestructive]}
                                        activeOpacity={0.85}
                                        onPress={handleRemovePhoto}
                                    >
                                        <MaterialIcons name="delete-outline" size={16} color={COLORS.white} />
                                        <Text style={[styles.photoActionBtnText, styles.photoActionBtnTextDestructive]}>
                                            Remove
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.cameraBox}
                                activeOpacity={0.85}
                                onPress={handleTakePhoto}
                            >
                                <View style={styles.cameraIconCircle}>
                                    <MaterialIcons name="camera-alt" size={28} color={COLORS.white} />
                                </View>
                                <Text style={styles.cameraBoxLabel}>Tap to open camera</Text>
                                <Text style={styles.cameraBoxHint}>JPG · PNG · up to 5 MB</Text>
                            </TouchableOpacity>
                        )}
                    </View>

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
        </SafeAreaView>
    );
}