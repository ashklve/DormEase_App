import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

import Checkbox from 'expo-checkbox';

import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const PINK_PRIMARY = '#E84393';
const PINK_LIGHT = '#FFF0F3';
const PINK_MEDIUM = '#FFD6E4';
const TEXT_DARK = '#2D1B2E';
const TEXT_MUTED = '#9E7A88';

function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // TODO: Connect to backend for authentication
    console.log('Login attempt:', { email, password, rememberMe });
    // After successful login, navigate to dashboard
    router.replace('/dashboard');
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
        {/* Pink Header Section with Illustration */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Decorative top background */}
          <View style={styles.headerBackground} />

          {/* User Icon / Illustration placeholder */}
          <View style={styles.illustrationContainer}>
            <View style={styles.circleIcon}>
              <MaterialIcons name="person" size={60} color={PINK_PRIMARY} />
            </View>
          </View>
        </Animated.View>

        {/* Form Section */}
        <Animated.View
          style={[
            styles.formSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Title */}
          <Text style={styles.title}>Log-In</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Welcome! Please enter your information below and get started.
          </Text>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={18} color="#D32F2F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your email</Text>
            <View
              style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused,
                error && email === '' && styles.inputContainerError,
              ]}
            >
              <MaterialIcons
                name="mail-outline"
                size={20}
                color={emailFocused ? PINK_PRIMARY : TEXT_MUTED}
              />
              <TextInput
                style={styles.input}
                placeholder="student@school.edu.ph"
                placeholderTextColor={TEXT_MUTED}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                passwordFocused && styles.inputContainerFocused,
                error && password === '' && styles.inputContainerError,
              ]}
            >
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
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={TEXT_MUTED}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Keep me logged in checkbox */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? PINK_PRIMARY : undefined}
            />
            <Text style={styles.checkboxLabel}>Keep me logged in</Text>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>Log-In</Text>
          </TouchableOpacity>

          {/* Admin Sign Up Message */}
          <View style={styles.adminMessageContainer}>
            <Text style={styles.adminMessage}>
              New here? Kindly ask the{' '}
              <Text style={styles.adminHighlight}>admin</Text> to set up your account.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PINK_LIGHT,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header Section
  headerSection: {
    backgroundColor: PINK_PRIMARY,
    paddingTop: (StatusBar.currentHeight || 44) + 16,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    width: width,
    height: 250,
    backgroundColor: PINK_PRIMARY,
  },
  illustrationContainer: {
    zIndex: 10,
    alignItems: 'center',
  },
  circleIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PINK_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // Form Section
  formSection: {
    backgroundColor: PINK_LIGHT,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  // Error Message
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
    color: '#D32F2F',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Input Group
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E8E0E8',
  },
  inputContainerFocused: {
    borderColor: PINK_PRIMARY,
    backgroundColor: '#FFF9FC',
  },
  inputContainerError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
    marginLeft: 10,
  },
  eyeButton: {
    padding: 6,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    marginTop: 6,
  },
  checkboxLabel: {
    fontSize: 13,
    color: TEXT_DARK,
    marginLeft: 8,
  },

  // Login Button
  loginButton: {
    backgroundColor: PINK_PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PINK_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Admin Message
  adminMessageContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  adminMessage: {
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