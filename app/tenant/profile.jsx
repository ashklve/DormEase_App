import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import styles, { COLORS } from '../../src/constants/profilestyles';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import PremiumPullToRefresh from '../../src/components/PremiumPullToRefresh';

const buildAvatarUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${client.defaults.baseURL.replace('/api', '')}/storage/${path}`;
};

const fmt = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v) => /^[0-9]{11}$/.test(v.trim());

const statusColors = {
  active:   { bg: '#E8F8EF', text: '#1A6E3C' },
  pending:  { bg: '#FFF3CD', text: '#7D5A00' },
  move_out: { bg: '#FDECEA', text: '#922B21' },
  inactive: { bg: '#F1EFE8', text: '#5F5E5A' },
};

const statusLabels = {
  active:   'Active',
  pending:  'Pending',
  move_out: 'Move Out',
  inactive: 'Inactive',
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ visible, type, message }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2800),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;
  const ok = type === 'success';

  return (
    <Animated.View style={[styles.toast, ok ? styles.toastSuccess : styles.toastError, { opacity }]}>
      <Ionicons name={ok ? 'checkmark-circle' : 'alert-circle'} size={18} color={ok ? COLORS.success : COLORS.danger} />
      <Text style={[styles.toastText, ok ? styles.toastTextSuccess : styles.toastTextError]}>{message}</Text>
    </Animated.View>
  );
};

// ── Password Input ────────────────────────────────────────────────────────────
const PwInput = ({ label, value, onChangeText, first = false, matchStatus = null }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor =
    matchStatus === 'match'    ? COLORS.success :
    matchStatus === 'mismatch' ? COLORS.danger  :
    focused                    ? COLORS.primary :
                                 COLORS.border;

  const bgColor =
    matchStatus === 'match'    ? '#F0FBF4' :
    matchStatus === 'mismatch' ? '#FEF2F2' :
    focused                    ? '#FBF0F4' :
                                 COLORS.inputBg;

  return (
    <View>
      <Text style={first ? styles.inputLabel_first : styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor, backgroundColor: bgColor }]}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          autoCapitalize="none"
          placeholderTextColor={COLORS.muted}
          placeholder="••••••••"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {matchStatus === 'match' && (
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} style={{ marginRight: 6 }} />
        )}
        {matchStatus === 'mismatch' && (
          <Ionicons name="close-circle" size={18} color={COLORS.danger} style={{ marginRight: 6 }} />
        )}
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShow((p) => !p)}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.muted} />
        </TouchableOpacity>
      </View>
      {matchStatus === 'match' && (
        <Text style={{ fontSize: 11, color: COLORS.success, marginTop: 3, marginLeft: 2 }}>✓ Passwords match</Text>
      )}
      {matchStatus === 'mismatch' && (
        <Text style={{ fontSize: 11, color: COLORS.danger, marginTop: 3, marginLeft: 2 }}>Passwords do not match</Text>
      )}
    </View>
  );
};

// ── Read-only Info Row ────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, last = false }) => (
  <View style={[styles.infoRow, last && styles.infoRowLast]}>
    <View style={styles.infoIconWrapper}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

// ── Editable Info Row ─────────────────────────────────────────────────────────
const EditableInfoRow = ({ icon, label, value, onChangeText, keyboardType = 'default', error = null, last = false }) => {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={[styles.infoRow, last && styles.infoRowLast, { flexDirection: 'column', alignItems: 'stretch', paddingBottom: hasError ? 6 : 14 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={styles.infoIconWrapper}>
          <Ionicons name={icon} size={18} color={hasError ? COLORS.danger : COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoLabel, hasError && { color: COLORS.danger }]}>{label}</Text>
          <TextInput
            style={[styles.infoValue, { borderBottomWidth: 1, borderBottomColor: hasError ? COLORS.danger : focused ? COLORS.primary : COLORS.border, paddingBottom: 2 }]}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoCapitalize="none"
            placeholderTextColor={COLORS.muted}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
        <Ionicons name={hasError ? 'alert-circle-outline' : 'pencil-outline'} size={15} color={hasError ? COLORS.danger : COLORS.muted} />
      </View>
      {hasError && (
        <Text style={{ fontSize: 11, color: COLORS.danger, marginTop: 4, marginLeft: 48 }}>{error}</Text>
      )}
    </View>
  );
};

// ── Bottom Nav ────────────────────────────────────────────────────────────────
const NavItem = ({ iconName, label, isActive, isCenter, onPress }) => (
  <TouchableOpacity style={[styles.navItem, isCenter && styles.navCenter]} onPress={onPress}>
    {isCenter ? (
      <View style={styles.navCenterCircle}>
        <MaterialIcons name={iconName} size={26} color="#FFFFFF" />
      </View>
    ) : (
      <>
        <MaterialIcons name={iconName} size={24} color={isActive ? COLORS.primary : '#9E9E9E'} />
        <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState(null);
  const { setUser: setGlobalUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const pullToRefreshRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [isOnVacation, setIsOnVacation] = useState(false);
  const [vacationNote, setVacationNote] = useState('');
  const [vacationSaving, setVacationSaving] = useState(false);
  const [vacationErrors, setVacationErrors] = useState([]);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimer = useRef(null);

  useEffect(() => {
    fetchProfile();
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  const fetchProfile = async ({ isRefresh = false } = {}) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await client.get('/user');
      setUser(res.data);
      setGlobalUser(res.data);
      setEmail(res.data.email || '');
      setContactNumber(res.data.contact_number || '');
      setIsOnVacation(res.data.is_on_vacation || false);
      setVacationNote(res.data.vacation_note || '');
      setVacationErrors([]);
    } catch (err) {
      console.error('profile fetch error:', err.message);
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = () => fetchProfile({ isRefresh: true });

  const handleEmailChange = (v) => {
    setEmail(v);
    if (!v) { setEmailError('Email cannot be empty.'); return; }
    setEmailError(isValidEmail(v) ? '' : 'Enter a valid email address (must include @).');
  };

  const handlePhoneChange = (v) => {
    const digits = v.replace(/[^0-9]/g, '');
    setContactNumber(digits);
    if (!digits) { setPhoneError('Contact number cannot be empty.'); return; }
    setPhoneError(digits.length === 11 ? '' : 'Contact number must be exactly 11 digits.');
  };

  const handleUpdateContact = async () => {
    const eErr = !email ? 'Email cannot be empty.' : !isValidEmail(email) ? 'Enter a valid email address (must include @).' : '';
    const pErr = !contactNumber ? 'Contact number cannot be empty.' : contactNumber.length !== 11 ? 'Contact number must be exactly 11 digits.' : '';
    setEmailError(eErr);
    setPhoneError(pErr);
    if (eErr || pErr) return;
    try {
      setSaving(true);
      await client.post('/profile/update', { email, contact_number: contactNumber });
      showToast('success', 'Contact info updated successfully!');
      await fetchProfile({ isRefresh: false });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update contact info.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVacationStatus = async () => {
    setVacationSaving(true);
    setVacationErrors([]);
    try {
      await client.patch('/vacation-status', {
        is_on_vacation: isOnVacation,
        vacation_note: isOnVacation ? vacationNote : '',
      });
      showToast('success', 'Vacation status updated successfully!');
      await fetchProfile({ isRefresh: false });
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setVacationErrors(err.response.data.errors);
        showToast('error', 'Cannot update vacation status.');
      } else {
        showToast('error', err.response?.data?.message || 'Failed to update vacation status.');
      }
      setIsOnVacation(user?.is_on_vacation || false);
      setVacationNote(user?.vacation_note || '');
    } finally {
      setVacationSaving(false);
    }
  };

  const pwMatchStatus =
    confirmPw.length === 0 ? null :
    confirmPw === newPw    ? 'match' : 'mismatch';

  const handleChangePassword = async () => {
    setPwError('');
    if (!currentPw || !newPw || !confirmPw) { setPwError('Please fill in all password fields.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(newPw)) { setPwError('New password must contain at least one uppercase letter (A-Z).'); return; }
    if (!/[a-z]/.test(newPw)) { setPwError('New password must contain at least one lowercase letter (a-z).'); return; }
    if (!/[0-9]/.test(newPw)) { setPwError('New password must contain at least one number (0-9).'); return; }
    if (!/[^A-Za-z0-9]/.test(newPw)) { setPwError('New password must contain at least one special character.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match. Please check and try again.'); return; }
    if (newPw === currentPw) { setPwError('New password must be different from current password.'); return; }
    try {
      setSavingPw(true);
      await client.post('/change-password', {
        current_password: currentPw,
        new_password: newPw,
        new_password_confirmation: confirmPw,
      });
      setPwError('');
      showToast('success', 'Password changed successfully! 🎉');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      await fetchProfile({ isRefresh: false });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPw(false);
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showToast('error', 'Permission to access camera roll is required.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('profile_photo', { uri: asset.uri, name: 'profile.jpg', type: 'image/jpeg' });
    try {
      setSaving(true);
      const res = await client.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
        transformRequest: (data) => data,
      });
      setUser((prev) => ({ ...prev, profile_photo: res.data.profile_photo }));
      setGlobalUser((prev) => ({ ...prev, profile_photo: res.data.profile_photo }));
      showToast('success', 'Profile photo updated!');
    } catch {
      showToast('error', 'Failed to upload photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.post('/logout');
            } catch (err) {
              console.error('Logout error:', err.message);
            } finally {
              router.replace('/auth/login');
            }
          },
        },
      ],
    );
  };

  const avatarUri = user?.profile_photo ? buildAvatarUrl(user.profile_photo) : null;
  const statusKey = user?.status || 'inactive';
  const sc = statusColors[statusKey] || statusColors.inactive;
  const isTemp = user?.is_temp_password === 1 || user?.is_temp_password === true;
  const contactDirty = email !== (user?.email || '') || contactNumber !== (user?.contact_number || '');
  const vacationDirty =
    isOnVacation !== (user?.is_on_vacation || false) ||
    (isOnVacation && vacationNote !== (user?.vacation_note || ''));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDE8F0" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <PremiumPullToRefresh
          ref={pullToRefreshRef}
          refreshing={refreshing}
          onRefresh={onRefresh}
          iconName="person"
          headerHeight={56}
          onScrollEnabledChange={setScrollEnabled}
          header={
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.push('/tenant/dashboard')}
                activeOpacity={0.7}
              >
                <MaterialIcons name="chevron-left" size={22} color={COLORS.dark} />
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>Profile</Text>
            </View>
          }
        >
          <ScrollView
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + Math.max(insets.bottom, 24) }]}
            keyboardShouldPersistTaps="handled"
            onScroll={(e) => pullToRefreshRef.current?.handleScroll(e)}
            scrollEventThrottle={16}
            overScrollMode="never"
          >
            {/* ── Hero / Avatar ── */}
            <View style={styles.heroSection}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={avatarUri ? { uri: avatarUri } : require('../../assets/def_icon.png')}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.avatarEditBtn} onPress={handlePickPhoto}>
                  <Ionicons name="camera" size={14} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Text style={styles.heroName}>{user?.first_name} {user?.last_name}</Text>
              <Text style={styles.heroEmail}>{user?.email}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.statusText, { color: sc.text }]}>{statusLabels[statusKey]}</Text>
              </View>
              {user?.is_on_vacation && (
                <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B', marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                  <Text style={[styles.statusText, { color: '#B45309', fontWeight: 'bold' }]}>On Vacation</Text>
                </View>
              )}
            </View>

            {/* ── Temp password banner ── */}
            {isTemp && (
              <View style={styles.tempBanner}>
                <Ionicons name="warning-outline" size={20} color="#D4A017" />
                <Text style={styles.tempBannerText}>
                  You're using a temporary password. Please change it now to secure your account.
                </Text>
              </View>
            )}

            {/* ── Toast ── */}
            <Toast visible={toast.visible} type={toast.type} message={toast.message} />

            {/* ── Residence Info ── */}
            <Text style={styles.sectionLabel}>Residence</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="bed-outline" label="Room number" value={user?.room_number} />
              <InfoRow icon="business-outline" label="Floor" value={user?.floor != null ? `Floor ${user.floor}` : null} />
              <InfoRow icon="home-outline" label="Stay type" value={user?.stay_type} />
              <InfoRow icon="calendar-outline" label="Move-in date" value={fmt(user?.move_in_date)} />
              <InfoRow icon="calendar-clear-outline" label="Move-out date" value={fmt(user?.move_out_date)} last />
            </View>

            {/* ── Vacation Status ── */}
            <Text style={styles.sectionLabel}>Vacation / Break Status</Text>
            <View style={styles.infoCard}>
              <View style={[styles.infoRow, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={styles.infoIconWrapper}>
                    <Ionicons name="boat-outline" size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Vacation Mode</Text>
                    <Text style={styles.infoValue}>I'm on vacation / break</Text>
                  </View>
                </View>
                <Switch
                  value={isOnVacation}
                  onValueChange={(val) => { setIsOnVacation(val); setVacationErrors([]); }}
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                  thumbColor="#f4f3f4"
                />
              </View>
              {isOnVacation && (
                <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'stretch', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, paddingBottom: 12, paddingRight: 12 }]}>
                  <Text style={styles.infoLabel}>Vacation Note (Optional)</Text>
                  <TextInput
                    style={[styles.infoValue, { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 2, marginTop: 4 }]}
                    value={vacationNote}
                    onChangeText={setVacationNote}
                    placeholder="e.g., Summer break, Family vacation"
                    placeholderTextColor={COLORS.muted}
                    maxLength={150}
                  />
                </View>
              )}
              {vacationErrors.length > 0 && (
                <View style={{ padding: 12, backgroundColor: '#FEF2F2', borderRadius: 8, margin: 12, gap: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.danger }}>Preconditions not met:</Text>
                  {vacationErrors.map((err, idx) => (
                    <Text key={idx} style={{ fontSize: 11, color: COLORS.danger }}>• {err}</Text>
                  ))}
                </View>
              )}
            </View>

            {vacationDirty && (
              <TouchableOpacity
                style={[styles.saveBtn, vacationSaving && styles.saveBtnDisabled, { marginBottom: 16 }]}
                onPress={handleUpdateVacationStatus}
                disabled={vacationSaving}
                activeOpacity={0.85}
              >
                {vacationSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="save-outline" size={18} color={COLORS.white} />
                    <Text style={styles.saveBtnText}>Save Vacation Status</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* ── Contact Info ── */}
            <Text style={styles.sectionLabel}>Contact</Text>
            <View style={styles.infoCard}>
              <EditableInfoRow icon="call-outline" label="Contact number" value={contactNumber} onChangeText={handlePhoneChange} keyboardType="phone-pad" error={phoneError} />
              <EditableInfoRow icon="mail-outline" label="Email" value={email} onChangeText={handleEmailChange} keyboardType="email-address" error={emailError} last />
            </View>

            {contactDirty && (
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleUpdateContact}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="save-outline" size={18} color={COLORS.white} />
                    <Text style={styles.saveBtnText}>Save Contact Info</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* ── Change Password ── */}
            {pwError ? (
              <View style={styles.pwErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#922B21" />
                <Text style={styles.pwErrorText}>{pwError}</Text>
              </View>
            ) : null}
            <Text style={styles.sectionLabel}>Change Password</Text>
            <View style={styles.pwCard}>
              <PwInput label="Current password" value={currentPw} onChangeText={setCurrentPw} first />
              <PwInput label="New password" value={newPw} onChangeText={setNewPw} />
              {newPw.length > 0 && (
                <View style={styles.checklist}>
                  {[
                    [newPw.length >= 8,          'At least 8 characters'],
                    [/[A-Z]/.test(newPw),        'At least one uppercase letter (A-Z)'],
                    [/[a-z]/.test(newPw),        'At least one lowercase letter (a-z)'],
                    [/[0-9]/.test(newPw),        'At least one number (0-9)'],
                    [/[^A-Za-z0-9]/.test(newPw), 'At least one special character (e.g. !@#$)'],
                  ].map(([met, label], i) => (
                    <View key={i} style={styles.checkItem}>
                      <Ionicons name={met ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={met ? COLORS.success : COLORS.muted} />
                      <Text style={[styles.checkText, met && styles.checkTextDone]}>{label}</Text>
                    </View>
                  ))}
                </View>
              )}
              <PwInput label="Confirm new password" value={confirmPw} onChangeText={setConfirmPw} matchStatus={pwMatchStatus} />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, (savingPw || pwMatchStatus === 'mismatch') && styles.saveBtnDisabled]}
              onPress={handleChangePassword}
              disabled={savingPw || pwMatchStatus === 'mismatch'}
              activeOpacity={0.85}
            >
              {savingPw ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.white} />
                  <Text style={styles.saveBtnText}>Update Password</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ── Logout ── */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                <Text style={styles.logoutBtnText}>Logout</Text>
              </View>
            </TouchableOpacity>

          </ScrollView>
        </PremiumPullToRefresh>
      </KeyboardAvoidingView>

      {/* ── Bottom Nav ── */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <NavItem iconName="home" label="Home" isActive={false} onPress={() => router.push('/tenant/dashboard')} />
        <NavItem iconName="person-outline" label="Visitor" isActive={false} onPress={() => router.push('/tenant/visitors')} />
        <NavItem iconName="warning" label="Emergency" isCenter onPress={() => router.push('/tenant/emergency')} />
        <NavItem iconName="water-drop" label="Water Bill" isActive={false} onPress={() => router.push('/tenant/water-bill')} />
        <NavItem iconName="account-circle" label="Profile" isActive onPress={() => router.push('/tenant/profile')} />
      </View>
    </SafeAreaView>
  );
}