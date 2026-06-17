import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, StatusBar, ScrollView, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import client from '../../api/client';
import { loadSession, saveSession } from '../../api/auth';

const PINK = '#D63375';
const PINK_FORM = '#FFF0F3';
const TEXT_DARK = '#2D1B2E';
const TEXT_MUTED = '#B5B7C0';

// ── password strength checker ─────────────────────────────────────────────────
const getStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 8) return { label: 'Too short', color: '#DF0404', width: '25%' };
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSpec = /[^A-Za-z0-9]/.test(pwd);
    const score = [hasUpper, hasLower, hasNum, hasSpec].filter(Boolean).length;
    if (score === 0 || score === 1) return { label: 'Weak', color: '#FF6B35', width: '40%' };
    if (score === 2) return { label: 'Fair', color: '#F0C040', width: '65%' };
    if (score === 3) return { label: 'Strong', color: '#4CAF50', width: '85%' };
    return { label: 'Very Strong', color: '#2E7D32', width: '100%' };
};

export default function ChangePasswordScreen() {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const strength = getStrength(newPassword);
    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
    const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

    const handleChange = async () => {
        setError('');

        if (!currentPassword) return setError('Please enter your current password');
        if (!newPassword) return setError('Please enter a new password');
        if (newPassword.length < 8) return setError('New password must be at least 8 characters');
        if (!/[A-Z]/.test(newPassword)) return setError('New password must contain at least one uppercase letter (A-Z)');
        if (!/[a-z]/.test(newPassword)) return setError('New password must contain at least one lowercase letter (a-z)');
        if (!/[0-9]/.test(newPassword)) return setError('New password must contain at least one number (0-9)');
        if (!/[^A-Za-z0-9]/.test(newPassword)) return setError('New password must contain at least one special character (e.g. !@#$)');
        if (newPassword !== confirmPassword) return setError('Passwords do not match');
        if (newPassword === currentPassword) return setError('New password must be different from current password');

        setLoading(true);
        try {
            await client.post('/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });

            // update saved session so is_temp_password is now false
            const session = await loadSession();
            if (session) {
                await saveSession(session.token, {
                    ...session.user,
                    is_temp_password: false,
                });
            }

            Alert.alert(
                '✅ Password Changed',
                'Your password has been updated. Please log in with your new password.',
                [{ text: 'Log In', onPress: () => router.replace('/auth/login') }]
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor={PINK} />

            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* top section */}
                <View style={styles.topSection}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.replace('/auth/login')}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.iconCircle}>
                        <MaterialIcons name="lock-reset" size={36} color="#fff" />
                    </View>
                    <Text style={styles.topTitle}>Change Password</Text>
                    <Text style={styles.topSub}>
                        You're using a temporary password.{'\n'}
                        Please set a new password to continue.
                    </Text>
                </View>

                {/* form card */}
                <View style={styles.card}>

                    {/* error message */}
                    {error ? (
                        <View style={styles.errorBox}>
                            <MaterialIcons name="error-outline" size={16} color="#DF0404" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* current password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.inputRow}>
                            <MaterialIcons name="lock-outline" size={18} color={TEXT_MUTED} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter current password"
                                placeholderTextColor={TEXT_MUTED}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrent}
                                autoCorrect={false}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                <MaterialIcons
                                    name={showCurrent ? 'visibility' : 'visibility-off'}
                                    size={18}
                                    color={TEXT_MUTED}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* new password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputRow}>
                            <MaterialIcons name="lock" size={18} color={TEXT_MUTED} />
                            <TextInput
                                style={styles.input}
                                placeholder="At least 8 characters"
                                placeholderTextColor={TEXT_MUTED}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNew}
                                autoCorrect={false}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                <MaterialIcons
                                    name={showNew ? 'visibility' : 'visibility-off'}
                                    size={18}
                                    color={TEXT_MUTED}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* strength indicator */}
                        {strength && (
                            <View style={{ marginTop: 8 }}>
                                <View style={styles.strengthTrack}>
                                    <View style={[styles.strengthFill, {
                                        width: strength.width,
                                        backgroundColor: strength.color,
                                    }]} />
                                </View>
                                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                                    {strength.label}
                                </Text>
                            </View>
                        )}

                        {/* password requirements checklist */}
                        {newPassword.length > 0 && (
                            <View style={styles.checklist}>
                                <View style={styles.checkItem}>
                                    <MaterialIcons
                                        name={newPassword.length >= 8 ? "check-circle" : "radio-button-unchecked"}
                                        size={14}
                                        color={newPassword.length >= 8 ? "#4CAF50" : TEXT_MUTED}
                                    />
                                    <Text style={[styles.checkText, newPassword.length >= 8 && styles.checkTextDone]}>
                                        At least 8 characters
                                    </Text>
                                </View>
                                <View style={styles.checkItem}>
                                    <MaterialIcons
                                        name={/[A-Z]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
                                        size={14}
                                        color={/[A-Z]/.test(newPassword) ? "#4CAF50" : TEXT_MUTED}
                                    />
                                    <Text style={[styles.checkText, /[A-Z]/.test(newPassword) && styles.checkTextDone]}>
                                        At least one uppercase letter (A-Z)
                                    </Text>
                                </View>
                                <View style={styles.checkItem}>
                                    <MaterialIcons
                                        name={/[a-z]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
                                        size={14}
                                        color={/[a-z]/.test(newPassword) ? "#4CAF50" : TEXT_MUTED}
                                    />
                                    <Text style={[styles.checkText, /[a-z]/.test(newPassword) && styles.checkTextDone]}>
                                        At least one lowercase letter (a-z)
                                    </Text>
                                </View>
                                <View style={styles.checkItem}>
                                    <MaterialIcons
                                        name={/[0-9]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
                                        size={14}
                                        color={/[0-9]/.test(newPassword) ? "#4CAF50" : TEXT_MUTED}
                                    />
                                    <Text style={[styles.checkText, /[0-9]/.test(newPassword) && styles.checkTextDone]}>
                                        At least one number (0-9)
                                    </Text>
                                </View>
                                <View style={styles.checkItem}>
                                    <MaterialIcons
                                        name={/[^A-Za-z0-9]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
                                        size={14}
                                        color={/[^A-Za-z0-9]/.test(newPassword) ? "#4CAF50" : TEXT_MUTED}
                                    />
                                    <Text style={[styles.checkText, /[^A-Za-z0-9]/.test(newPassword) && styles.checkTextDone]}>
                                        At least one special character (e.g. !@#$)
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* confirm new password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View style={[
                            styles.inputRow,
                            passwordsMatch && { borderColor: '#4CAF50' },
                            passwordsMismatch && { borderColor: '#DF0404' },
                        ]}>
                            <MaterialIcons name="lock" size={18} color={TEXT_MUTED} />
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter new password"
                                placeholderTextColor={TEXT_MUTED}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirm}
                                autoCorrect={false}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <MaterialIcons
                                    name={showConfirm ? 'visibility' : 'visibility-off'}
                                    size={18}
                                    color={TEXT_MUTED}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* match indicator */}
                        {passwordsMatch && (
                            <View style={styles.matchRow}>
                                <MaterialIcons name="check-circle" size={14} color="#4CAF50" />
                                <Text style={[styles.matchText, { color: '#4CAF50' }]}>
                                    Passwords match
                                </Text>
                            </View>
                        )}
                        {passwordsMismatch && (
                            <View style={styles.matchRow}>
                                <MaterialIcons name="cancel" size={14} color="#DF0404" />
                                <Text style={[styles.matchText, { color: '#DF0404' }]}>
                                    Passwords do not match
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* submit button */}
                    <TouchableOpacity
                        style={[styles.btn, loading && { opacity: 0.7 }]}
                        onPress={handleChange}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.btnText}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PINK,
    },
    scroll: {
        flexGrow: 1,
    },
    topSection: {
        alignItems: 'center',
        paddingTop: 70,
        paddingBottom: 30,
        paddingHorizontal: 24,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    topTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    topSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 21,
    },
    card: {
        backgroundColor: PINK_FORM,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 48,
        flex: 1,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        fontSize: 13,
        color: '#DF0404',
        fontWeight: '500',
        flex: 1,
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
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: '#E5ECF6',
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: TEXT_DARK,
    },
    strengthTrack: {
        height: 4,
        backgroundColor: '#E5ECF6',
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthFill: {
        height: 4,
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
    },
    matchText: {
        fontSize: 12,
        fontWeight: '500',
    },
    btn: {
        backgroundColor: PINK,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
        elevation: 6,
        shadowColor: PINK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    btnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        marginBottom: 20,
    },
    backText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    checklist: {
        marginTop: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5ECF6',
        gap: 8,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkText: {
        fontSize: 12,
        color: '#B5B7C0',
        fontWeight: '500',
    },
    checkTextDone: {
        color: '#2D1B2E',
        textDecorationLine: 'none',
    },
});