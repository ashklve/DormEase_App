import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    Animated,
    Alert,
    Linking,
} from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles, { COLORS } from '../../src/constants/settingsstyles';
import { useUser } from '../../src/context/UserContext';

// ── Animated Toggle ───────────────────────────────────────────────────────────
const Toggle = ({ value, onToggle }) => {
    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

    const handlePress = () => {
        const next = !value;
        Animated.spring(anim, {
            toValue: next ? 1 : 0,
            useNativeDriver: false,
            speed: 20,
            bounciness: 6,
        }).start();
        onToggle(next);
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

    // ── notification toggles
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(true);

    const hasEmail = !!user?.email;

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
                        onToggle={setPushEnabled}
                    />
                    <ToggleRow
                        divider
                        icon={<MaterialIcons name="mail-outline" size={18} color={COLORS.primary} />}
                        label="By Email"
                        sublabel={!hasEmail ? 'Your account is not yet linked to an email' : undefined}
                        linkLabel={!hasEmail ? 'Bind Now' : undefined}
                        onLinkPress={() => router.push('/tenant/profile')}
                        value={emailEnabled}
                        onToggle={setEmailEnabled}
                    />
                    <ToggleRow
                        divider
                        icon={<MaterialIcons name="sms" size={18} color={COLORS.primary} />}
                        label="By SMS"
                        value={smsEnabled}
                        onToggle={setSmsEnabled}
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
            <View style={styles.logoutWrap}>
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.85}
                >
                    <Text style={styles.logoutBtnText}>Log out</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}