import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, Animated,
    Dimensions, StatusBar, Image, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { loginTenant, saveSession } from '../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../../src/services/pushNotifications';
import { useUser } from '../../src/context/UserContext';
import { clearDashboardCache } from '../../src/cache/dashboardCache';

const { width } = Dimensions.get('window');
const PINK_PRIMARY = '#D63375';
const PINK_DARK = '#D63375';
const PINK_FORM = '#FFF0F3';
const TEXT_DARK = '#2D1B2E';
const TEXT_MUTED = '#B5B7C0';
const ID_PREFIX = 'TNT-';

export default function LoginScreen() {
    const router = useRouter();
    const { fetchUser } = useUser();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [identifierFocused, setIdentifierFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const toggleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleToggle = () => {
        const newVal = !rememberMe;
        setRememberMe(newVal);
        Animated.spring(toggleAnim, {
            toValue: newVal ? 1 : 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const thumbTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22],
    });

    const handleForgotPassword = () => {
        Alert.alert(
            'Reset Password',
            'To reset your password, please contact the admin.',
            [{ text: 'OK' }]
        );
    };

    const handleLogin = async () => {
        setError('');

        if (!identifier.trim()) return setError('Please enter your Account ID');
        if (!/^\d{4}-\d{3}$/.test(identifier.trim())) return setError('Account ID must be in format XXXX-YYY (e.g. 2026-001)');

        if (!password) return setError('Please enter your password');
        if (password.length < 6) return setError('Password must be at least 6 characters');

        // Build the full identifier to send to the API
        const fullIdentifier = `${ID_PREFIX}${identifier.trim()}`;
        setLoading(true);
        try {
            const res = await loginTenant(fullIdentifier, password);

            await AsyncStorage.setItem('auth_token', res.token);
            await clearDashboardCache();

            if (res.user.role === 'tenant') {
                registerForPushNotificationsAsync();
            }

            if (rememberMe) {
                await saveSession(res.token, res.user);
                await AsyncStorage.setItem('keep_logged_in', 'true');
            } else {
                await AsyncStorage.setItem('keep_logged_in', 'false');
            }

            // Fetch the user data so it's populated in UserContext immediately!
            await fetchUser();

            // redirect to change password first if temp
            if (res.user.is_temp_password) {
                router.replace('/auth/change-password');
            } else if (res.user.role === 'tenant') {
                router.replace('/tenant/dashboard');
            } else if (res.user.role === 'admin') {
                router.replace('/admin/dashboard');
            } else if (res.user.role === 'staff') {
                router.replace('/staff/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* girl illustration */}
                <View style={styles.girlWrapper}>
                    <Image
                        source={require('../../assets/girl.png')}
                        style={styles.girlImage}
                        resizeMode="contain"
                    />
                </View>

                {/* form card */}
                <Animated.View style={[styles.formCard, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }]}>

                    <Text style={styles.title}>Log-In</Text>
                    <Text style={styles.subtitle}>
                        Welcome! Please enter your information below and get started.
                    </Text>

                    {/* error message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <MaterialIcons name="error-outline" size={18} color="#DF0404" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* identifier input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account ID</Text>
                        <View style={[styles.inputContainer, identifierFocused && styles.inputFocused]}>
                            <MaterialIcons
                                name="badge"
                                size={20}
                                color={identifierFocused ? PINK_PRIMARY : TEXT_MUTED}
                            />
                            {/* static prefix */}
                            <Text style={styles.idPrefix}>{ID_PREFIX}</Text>
                            {/* only 4 digits, a dash, and 3 digits allowed */}
                            <TextInput
                                style={[styles.input, { marginLeft: 0, paddingLeft: 0, paddingHorizontal: 0 }]}
                                placeholder="2026-001"
                                placeholderTextColor={TEXT_MUTED}
                                value={identifier}
                                onChangeText={(val) => {
                                    // strip anything that isn't a digit, cap at 7 digits
                                    const digits = val.replace(/\D/g, '').slice(0, 7);
                                    if (digits.length <= 4) {
                                        setIdentifier(digits);
                                    } else {
                                        setIdentifier(`${digits.slice(0, 4)}-${digits.slice(4)}`);
                                    }
                                }}
                                onFocus={() => setIdentifierFocused(true)}
                                onBlur={() => setIdentifierFocused(false)}
                                keyboardType="number-pad"
                                maxLength={8}
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* password input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
                            <MaterialIcons
                                name="lock-outline"
                                size={20}
                                color={passwordFocused ? PINK_PRIMARY : TEXT_MUTED}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor={TEXT_MUTED}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                secureTextEntry={!showPassword}
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                <MaterialIcons
                                    name={showPassword ? 'visibility' : 'visibility-off'}
                                    size={20}
                                    color={TEXT_MUTED}
                                />
                            </TouchableOpacity>
                        </View>
                        {/* forgot password link */}
                        <TouchableOpacity
                            style={styles.forgotBtn}
                            onPress={handleForgotPassword}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* remember me toggle */}
                    <View style={styles.toggleRow}>
                        <Text style={styles.checkboxLabel}>Keep me logged in</Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleToggle}
                            style={[styles.toggleTrack, rememberMe && styles.toggleTrackActive]}
                        >
                            <Animated.View style={[
                                styles.toggleThumb,
                                { transform: [{ translateX: thumbTranslate }] }
                            ]} />
                        </TouchableOpacity>
                    </View>

                    {/* login button */}
                    <TouchableOpacity
                        style={[styles.loginBtn, loading && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        <Text style={styles.loginBtnText}>
                            {loading ? 'Logging in...' : 'Log-In'}
                        </Text>
                    </TouchableOpacity>

                    {/* admin note */}
                    <View style={styles.adminRow}>
                        <Text style={styles.adminText}>
                            New here? Kindly ask the{' '}
                            <Text style={styles.adminHighlight}>admin</Text>
                            {' '}to set up your account.
                        </Text>
                    </View>

                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PINK_DARK,
    },
    scrollContent: {
        flexGrow: 1,
    },
    girlWrapper: {
        backgroundColor: PINK_DARK,
        alignItems: 'flex-end',
        paddingTop: StatusBar.currentHeight || 44,
        height: 260,
        overflow: 'hidden',
    },
    girlImage: {
        width: width * 0.65,
        height: 280,
    },
    formCard: {
        backgroundColor: PINK_FORM,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 48,
        flex: 1,
        marginTop: -30,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: TEXT_DARK,
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: TEXT_MUTED,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 13,
        color: '#DF0404',
        marginLeft: 8,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: TEXT_DARK,
        marginBottom: 7,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: '#E5ECF6',
    },
    inputFocused: {
        borderColor: PINK_PRIMARY,
        backgroundColor: '#FFF9FC',
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: TEXT_DARK,
        marginLeft: 10,
    },
    idPrefix: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT_DARK,
        marginLeft: 10,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: '600',
        color: PINK_PRIMARY,
    },
    eyeBtn: {
        padding: 6,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 22,
        marginTop: 4,
    },
    checkboxLabel: {
        fontSize: 13,
        color: TEXT_DARK,
    },
    toggleTrack: {
        width: 44,
        height: 24,
        borderRadius: 99,
        backgroundColor: '#E5ECF6',
        justifyContent: 'center',
    },
    toggleTrackActive: {
        backgroundColor: PINK_PRIMARY,
    },
    toggleThumb: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 2,
        elevation: 2,
    },
    loginBtn: {
        backgroundColor: PINK_PRIMARY,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        elevation: 6,
        shadowColor: PINK_PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    loginBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    adminRow: {
        marginTop: 22,
        alignItems: 'center',
    },
    adminText: {
        fontSize: 13,
        color: TEXT_MUTED,
        textAlign: 'center',
        lineHeight: 20,
    },
    adminHighlight: {
        fontWeight: '700',
        color: PINK_PRIMARY,
    },
});