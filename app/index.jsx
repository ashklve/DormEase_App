import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  Dimensions, StatusBar, Image,
} from 'react-native';

const { width } = Dimensions.get('window');

import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const PINK_PRIMARY = '#CA5D86';
const PINK_DARK = '#CA5D86';
const PINK_LIGHT = '#FFB0CE';
const PINK_FORM = '#FFF0F3';
const TEXT_DARK = '#2D1B2E';
const TEXT_MUTED = '#B5B7C0';

// welcome screen
function WelcomeScreen({ onGetStarted }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={welcome.container}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      {/* decorative background circles */}
      <View style={[welcome.circle, { width: 320, height: 320, top: -120, right: -120 }]} />
      <View style={[welcome.circle, { width: 220, height: 220, top: 120, left: -100 }]} />
      <View style={[welcome.circle, { width: 180, height: 180, bottom: 180, right: -60 }]} />
      <View style={[welcome.circle, { width: 120, height: 120, bottom: 80, left: 20 }]} />

      <Animated.View style={[welcome.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* logo — no circle wrapper */}
        <Image source={require('../assets/logov2.png')} style={welcome.logo} resizeMode="contain" />

        <Text style={welcome.appName}>DormEase</Text>
        <Text style={welcome.tagline}>Daily Dorm Living{'\n'}Made Simple</Text>
        <Text style={welcome.desc}>
          Access services, stay informed, and handle daily dorm needs with ease and convenience.
        </Text>

        <TouchableOpacity style={welcome.btn} onPress={onGetStarted} activeOpacity={0.85}>
          <Text style={welcome.btnText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={welcome.copyright}>Copyright © 2026 DormEase. All rights reserved.</Text>
    </View>
  );
}

// login screen
function LoginForm({ router }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const handleLogin = () => {
    setError('');
    if (!email.trim()) return setError('Please enter your email');
    if (!validateEmail(email)) return setError('Please enter a valid email');
    if (!password) return setError('Please enter your password');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    router.replace('/tenant/dashboard');
  };

  return (
    <KeyboardAvoidingView style={login.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      <ScrollView contentContainerStyle={login.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* girl illustration on dark pink background */}
        <View style={login.girlWrapper}>
          <Image source={require('../assets/girl.png')} style={login.girlImage} resizeMode="contain" />
        </View>

        {/* form card on light pink */}
        <Animated.View style={[login.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          <Text style={login.title}>Log-In</Text>
          <Text style={login.subtitle}>
            Welcome! Please enter your information below and get started.
          </Text>

          {/* error message */}
          {error ? (
            <View style={login.errorContainer}>
              <MaterialIcons name="error-outline" size={18} color="#DF0404" />
              <Text style={login.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* email input */}
          <View style={login.inputGroup}>
            <Text style={login.label}>Your email</Text>
            <View style={[login.inputContainer, emailFocused && login.inputFocused]}>
              <MaterialIcons name="mail-outline" size={20} color={emailFocused ? PINK_PRIMARY : TEXT_MUTED} />
              <TextInput
                style={login.input}
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

          {/* password input */}
          <View style={login.inputGroup}>
            <Text style={login.label}>Password</Text>
            <View style={[login.inputContainer, passwordFocused && login.inputFocused]}>
              <MaterialIcons name="lock-outline" size={20} color={passwordFocused ? PINK_PRIMARY : TEXT_MUTED} />
              <TextInput
                style={login.input}
                placeholder="Enter your password"
                placeholderTextColor={TEXT_MUTED}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={login.eyeBtn}>
                <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            </View>
          </View>

          {/* remember me */}
          <View style={login.checkboxRow}>
            <Checkbox value={rememberMe} onValueChange={setRememberMe} color={rememberMe ? PINK_PRIMARY : undefined} />
            <Text style={login.checkboxLabel}>Keep me logged in</Text>
          </View>

          {/* login button */}
          <TouchableOpacity style={login.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={login.loginBtnText}>Log-In</Text>
          </TouchableOpacity>

          {/* admin note */}
          <View style={login.adminRow}>
            <Text style={login.adminText}>
              New here? Kindly ask the <Text style={login.adminHighlight}>admin</Text> to set up your account.
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// root — controls which screen shows
export default function App() {
  const router = useRouter();
  const [screen, setScreen] = useState('welcome');

  if (screen === 'welcome') {
    return <WelcomeScreen onGetStarted={() => setScreen('login')} />;
  }
  return <LoginForm router={router} />;
}

// welcome styles
const welcome = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PINK_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight || 44,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#fff',
    opacity: 0.1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  desc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  btn: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 30,
    paddingVertical: 13,
    paddingHorizontal: 48,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  copyright: {
    position: 'absolute',
    bottom: 20,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
});

// login styles
const login = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PINK_DARK,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // girl section — dark pink background
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

  // form card — light pink background
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