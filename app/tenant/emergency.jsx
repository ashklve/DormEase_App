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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../src/context/UserContext';
import DrawerMenu from '../../src/components/DrawerMenu';
import styles, { COLORS, CATEGORY_COLORS } from '../../src/constants/emergencystyles';

const defaultPhoto = require('../../assets/def_icon.png');
const BASE_URL = 'https://strongman-studio-stoke.ngrok-free.dev';

// emergency categories
const CATEGORIES = [
    { key: 'Medical',            label: 'Medical',            icon: 'medical-bag',      lib: 'community' },
    { key: 'Fire/Smoke',         label: 'Fire/Smoke',         icon: 'fire',             lib: 'community' },
    { key: 'Electrical Hazard',  label: 'Electrical Hazard',  icon: 'lightning-bolt',   lib: 'community' },
    { key: 'Security',           label: 'Security',           icon: 'shield-account',   lib: 'community' },
    { key: 'Flood/Water Leak',   label: 'Flood/Water Leak',   icon: 'pipe-leak',        lib: 'community' },
    { key: 'Other',              label: 'Other',              icon: 'dots-horizontal-circle', lib: 'community' },
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
    const router        = useRouter();
    const { avatarUri } = useUser();
    const drawerRef     = useRef(null);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isRecording,      setIsRecording]      = useState(false);
    const [recordSecs,       setRecordSecs]        = useState(0);
    const [transcript,       setTranscript]        = useState('');
    const [manualText,       setManualText]        = useState('');
    const [detectedType,     setDetectedType]      = useState('');
    const [detectedLocation, setDetectedLocation]  = useState('');
    const [submitting,       setSubmitting]        = useState(false);

    const timerRef    = useRef(null);
    const hasContent  = transcript.trim() || manualText.trim();
    const showDetected = (detectedType || detectedLocation) && hasContent;

    // timer tick while recording
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    // toggle recording — wire up expo-av / speech-to-text here later
    const handleToggleRecord = () => {
        if (isRecording) {
            setIsRecording(false);
            // TODO: stop recording, get transcript from speech-to-text API
            // placeholder: simulate a transcript for now
            if (recordSecs > 0) {
                setTranscript('(Voice transcript will appear here after speech-to-text integration)');
                // TODO: send transcript to AI to detect type and location
                setDetectedType('Medical Emergency');
                setDetectedLocation('Room 202');
            }
        } else {
            setRecordSecs(0);
            setTranscript('');
            setIsRecording(true);
            // TODO: start expo-av recording here
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
                            const token = await AsyncStorage.getItem('auth_token');
                            // TODO: POST /api/emergency with type='Panic Alert'
                            await fetch(`${BASE_URL}/api/emergency`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type':  'application/json',
                                    'Accept':        'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    type:        'Panic Alert',
                                    description: 'Panic alert sent from app.',
                                    status:      'pending',
                                }),
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
            const token = await AsyncStorage.getItem('auth_token');
            // TODO: POST /api/emergency
            await fetch(`${BASE_URL}/api/emergency`, {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Accept':        'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type:        detectedType || selectedCategory || 'Other',
                    description: description,
                    location:    detectedLocation,
                    status:      'pending',
                }),
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
                <Text style={styles.headerTitle}>Emergency Report 🚨</Text>
                <Text style={styles.headerSub}>Describe the situation by speaking or typing.</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
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
                <Text style={styles.sectionLabel}>Whats your emergency?</Text>
                <View style={styles.categoryGrid}>
                    {CATEGORIES.map(cat => {
                        const active  = selectedCategory === cat.key;
                        const colors  = CATEGORY_COLORS[cat.key];
                        return (
                            <TouchableOpacity
                                key={cat.key}
                                style={[
                                    styles.categoryChip,
                                    {
                                        backgroundColor: active ? colors.bg : COLORS.white,
                                        borderColor:     active ? colors.icon : COLORS.border,
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
                <Text style={styles.sectionLabel}>Describe the emergency</Text>
                <Text style={styles.sectionSub}>Speak or type the situation</Text>

                <TouchableOpacity
                    style={styles.recorderBox}
                    activeOpacity={0.85}
                    onPress={handleToggleRecord}
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
                    {isRecording ? 'Tap to stop recording' : 'Tap to Speak'}
                </Text>

                {/* transcript output */}
                {!!transcript && (
                    <Text style={styles.transcriptText}>{transcript}</Text>
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
                    onChangeText={setManualText}
                    multiline
                    numberOfLines={4}
                />

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
            <View style={styles.bottomNav}>
                <NavItem iconName="home"           label="Home"      onPress={() => router.push('/tenant/dashboard')} />
                <NavItem iconName="person-outline" label="Visitor"   onPress={() => router.push('/tenant/visitors')} />
                <NavItem iconName="warning"        label="Emergency" isCenter isActive onPress={() => {}} />
                <NavItem iconName="water-drop"     label="Water Bill" onPress={() => router.push('/tenant/water-bill')} />
                <NavItem iconName="account-circle" label="Profile"   onPress={() => router.push('/tenant/profile')} />
            </View>

            <DrawerMenu ref={drawerRef} />
        </SafeAreaView>
    );
}