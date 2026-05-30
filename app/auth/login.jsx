import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, Animated,
    Dimensions, StatusBar, Image,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { loginTenant, saveSession } from '../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../../src/services/pushNotifications';

const { width } = Dimensions.get('window');
const PINK_PRIMARY = '#CA5D86';
const PINK_DARK = '#CA5D86';
const PINK_FORM = '#FFF0F3';
const TEXT_DARK = '#2D1B2E';
const TEXT_MUTED = '#B5B7C0';

export default function LoginScreen() {
    const router = useRouter();

    const [accountId, setAccountId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [accountFocused, setAccountFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        setError('');
        if (!accountId.trim()) return setError('Please enter your Account ID');
        if (!password) return setError('Please enter your password');
        if (password.length < 6) return setError('Password must be at least 6 characters');

        setLoading(true);
        try {
            const res = await loginTenant(accountId, password);

            await AsyncStorage.setItem('auth_token', res.token);

            if (res.user.role === 'tenant') {
                registerForPushNotificationsAsync();
            }

            if (rememberMe) {
                await saveSession(res.token, res.user);
            }

            // ── redirect to change password first if temp ─────────────────────────
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

                    {/* account id input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account ID</Text>
                        <View style={[styles.inputContainer, accountFocused && styles.inputFocused]}>
                            <MaterialIcons
                                name="badge"
                                size={20}
                                color={accountFocused ? PINK_PRIMARY : TEXT_MUTED}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. TNT-2026-001"
                                placeholderTextColor={TEXT_MUTED}
                                value={accountId}
                                onChangeText={setAccountId}
                                onFocus={() => setAccountFocused(true)}
                                onBlur={() => setAccountFocused(false)}
                                autoCapitalize="characters"
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
                    </View>

                    {/* remember me */}
                    <View style={styles.checkboxRow}>
                        <Checkbox
                            value={rememberMe}
                            onValueChange={setRememberMe}
                            color={rememberMe ? PINK_PRIMARY : undefined}
                        />
                        <Text style={styles.checkboxLabel}>Keep me logged in</Text>
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
    eyeBtn: {
        padding: 6,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
        marginTop: 4,
    },
    checkboxLabel: {
        fontSize: 13,
        color: TEXT_DARK,
        marginLeft: 8,
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
