import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Animated,
    Alert,
    Linking,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import styles, { COLORS } from '../../src/constants/settingsstyles';
import { useUser } from '../../src/context/UserContext';
import LoadingOverlay from '../../src/components/LoadingOverlay';

// ── Animated Toggle ───────────────────────────────────────────────────────────
const Toggle = ({ value, onToggle }) => {
    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

    // Keep animation in sync if value changes externally (e.g. on mount after permission check)
    useEffect(() => {
        Animated.spring(anim, {
            toValue: value ? 1 : 0,
            useNativeDriver: false,
            speed: 20,
            bounciness: 6,
        }).start();
    }, [value]);

    const handlePress = () => {
        onToggle(!value);
    };

    const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 22] });
    const trackColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#E0D6DA', COLORS.primary],
    });

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
            <Animated.View style={[styles.toggleTrack, { backgroundColor: trackColor }]}>
                <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]}>
                    {value && (
                        <MaterialIcons name="check" size={14} color={COLORS.primary} />
                    )}
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
};

// ── Row: toggle item ──────────────────────────────────────────────────────────
const ToggleRow = ({ icon, label, sublabel, linkLabel, onLinkPress, value, onToggle, divider }) => (
    <View style={[styles.row, divider && styles.rowDivider]}>
        <View style={styles.iconWrap}>
            {icon}
        </View>
        <View style={styles.rowBody}>
            <Text style={styles.rowLabel}>{label}</Text>
            {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
            {linkLabel ? (
                <TouchableOpacity onPress={onLinkPress} activeOpacity={0.7}>
                    <Text style={styles.rowSublabelLink}>{linkLabel} ›</Text>
                </TouchableOpacity>
            ) : null}
        </View>
        <Toggle value={value} onToggle={onToggle} />
    </View>
);

// ── Row: nav item (chevron) ───────────────────────────────────────────────────
const NavRow = ({ icon, label, valueLabel, onPress, divider }) => (
    <TouchableOpacity
        style={[styles.row, divider && styles.rowDivider]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.iconWrap}>
            {icon}
        </View>
        <View style={styles.rowBody}>
            <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <View style={styles.rowRight}>
            {valueLabel ? <Text style={styles.rowValue}>{valueLabel}</Text> : null}
            <MaterialIcons name="chevron-right" size={20} color={COLORS.muted} />
        </View>
    </TouchableOpacity>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function SettingsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    // ── notification toggles
    const [pushEnabled, setPushEnabled] = useState(false);

    // ── Check real push permission status on mount
    useEffect(() => {
        const checkPushPermission = async () => {
            try {
                const { status } = await Notifications.getPermissionsAsync();
                setPushEnabled(status === 'granted');
            } catch (err) {
                console.warn(err);
            } finally {
                setLoading(false);
            }
        };
        checkPushPermission();
    }, []);

    // ── Handle push toggle
    const handlePushToggle = async (next) => {
        if (next) {
            // User wants to ENABLE — request permission
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                setPushEnabled(true);
            } else {
                // Permission denied or previously denied — direct to device settings
                setPushEnabled(false);
                Alert.alert(
                    'Notifications Blocked',
                    'Please enable notifications for this app in your device settings.',
                    [
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        { text: 'Cancel', style: 'cancel' },
                    ]
                );
            }
        } else {
            // User wants to DISABLE — OS doesn't allow programmatic revoke, send to settings
            Alert.alert(
                'Turn Off Notifications',
                'To disable notifications, please turn them off in your device settings.',
                [
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
            // Revert toggle — we can't disable it programmatically
            setPushEnabled(true);
        }
    };

    // ── logout
    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: () => router.replace('/auth/login'),
                },
            ]
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F0F2" />

            {/* ── Top Bar ── */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="chevron-left" size={22} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Settings</Text>
            </View>

            {/* ── Content ── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >

                {/* ── Notifications group ── */}
                <Text style={styles.sectionLabel}>
                    Receive new messages and promotions from your building management
                </Text>

                <View style={styles.groupCard}>
                    <ToggleRow
                        icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.primary} />}
                        label="By Push Notification"
                        value={pushEnabled}
                        onToggle={handlePushToggle}
                    />
                </View>

                {/* ── System group ── */}
                <View style={styles.groupCard}>
                    <NavRow
                        icon={<MaterialIcons name="privacy-tip" size={18} color={COLORS.primary} />}
                        label="System Permission Management"
                        onPress={() => Linking.openSettings()}
                    />
                </View>

                {/* ── Legal Info group ── */}
                <View style={styles.groupCard}>
                    <NavRow
                        icon={<MaterialIcons name="info-outline" size={18} color={COLORS.primary} />}
                        label="Legal Info"
                        onPress={() => router.push('/tenant/legal')}
                    />
                </View>

                {/* ── App info group ── */}
                <View style={styles.groupCard}>
                    <NavRow
                        icon={<Ionicons name="refresh-circle-outline" size={18} color={COLORS.primary} />}
                        label="Version Update"
                        valueLabel="Version 1.0.0"
                        onPress={() => Alert.alert('Version Update', 'You are on the latest version.')}
                    />
                </View>

            </ScrollView>

            {/* ── Log Out button ── */}
            <View style={[styles.logoutWrap, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.85}
                >
                    <Text style={styles.logoutBtnText}>Log out</Text>
                </TouchableOpacity>
            </View>
            <LoadingOverlay visible={loading} />
        </SafeAreaView>
    );
}