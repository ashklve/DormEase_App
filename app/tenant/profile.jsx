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
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import styles, { COLORS } from '../../src/constants/profilestyles';
import client from '../../api/client';

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  active: { bg: '#E8F8EF', text: '#1A6E3C' },
  pending: { bg: '#FFF3CD', text: '#7D5A00' },
  move_out: { bg: '#FDECEA', text: '#922B21' },
  inactive: { bg: '#F1EFE8', text: '#5F5E5A' },
};

const statusLabels = {
  active: 'Active',
  pending: 'Pending',
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
    <Animated.View
      style={[styles.toast, ok ? styles.toastSuccess : styles.toastError, { opacity }]}
    >
      <Ionicons
        name={ok ? 'checkmark-circle' : 'alert-circle'}
        size={18}
        color={ok ? COLORS.success : COLORS.danger}
      />
      <Text style={[styles.toastText, ok ? styles.toastTextSuccess : styles.toastTextError]}>
        {message}
      </Text>
    </Animated.View>
  );
};

// ── Password Input — real-time match indicator ────────────────────────────────
const PwInput = ({ label, value, onChangeText, first = false, matchStatus = null }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor =
    matchStatus === 'match' ? COLORS.success :
      matchStatus === 'mismatch' ? COLORS.danger :
        focused ? COLORS.primary :
          COLORS.border;

  const bgColor =
    matchStatus === 'match' ? '#F0FBF4' :
      matchStatus === 'mismatch' ? '#FEF2F2' :
        focused ? '#FBF0F4' :
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
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={COLORS.success}
            style={{ marginRight: 6 }}
          />
        )}
        {matchStatus === 'mismatch' && (
          <Ionicons
            name="close-circle"
            size={18}
            color={COLORS.danger}
            style={{ marginRight: 6 }}
          />
        )}
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShow((p) => !p)}>
          <Ionicons
            name={show ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={COLORS.muted}
          />
        </TouchableOpacity>
      </View>
      {matchStatus === 'match' && (
        <Text style={{ fontSize: 11, color: COLORS.success, marginTop: 3, marginLeft: 2 }}>
          ✓ Passwords match
        </Text>
      )}
      {matchStatus === 'mismatch' && (
        <Text style={{ fontSize: 11, color: COLORS.danger, marginTop: 3, marginLeft: 2 }}>
          Passwords do not match
        </Text>
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

// ── Editable Info Row — inline validation, NO auto-save on blur ───────────────
const EditableInfoRow = ({
  icon,
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  error = null,
  last = false,
}) => {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <View
      style={[
        styles.infoRow,
        last && styles.infoRowLast,
        { flexDirection: 'column', alignItems: 'stretch', paddingBottom: hasError ? 6 : 14 },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={styles.infoIconWrapper}>
          <Ionicons
            name={icon}
            size={18}
            color={hasError ? COLORS.danger : COLORS.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoLabel, hasError && { color: COLORS.danger }]}>
            {label}
          </Text>
          <TextInput
            style={[
              styles.infoValue,
              {
                borderBottomWidth: 1,
                borderBottomColor: hasError
                  ? COLORS.danger
                  : focused
                    ? COLORS.primary
                    : COLORS.border,
                paddingBottom: 2,
              },
            ]}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoCapitalize="none"
            placeholderTextColor={COLORS.muted}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
        <Ionicons
          name={hasError ? 'alert-circle-outline' : 'pencil-outline'}
          size={15}
          color={hasError ? COLORS.danger : COLORS.muted}
        />
      </View>
      {hasError && (
        <Text style={{ fontSize: 11, color: COLORS.danger, marginTop: 4, marginLeft: 48 }}>
          {error}
        </Text>
      )}
    </View>
  );
};

// ── Bottom Nav ────────────────────────────────────────────────────────────────
const NavItem = ({ iconName, label, isActive, isCenter, onPress }) => (
  <TouchableOpacity
    style={[styles.navItem, isCenter && styles.navCenter]}
    onPress={onPress}
  >
    {isCenter ? (
      <View style={styles.navCenterCircle}>
        <MaterialIcons name={iconName} size={26} color="#FFFFFF" />
      </View>
    ) : (
      <>
        <MaterialIcons
          name={iconName}
          size={24}
          color={isActive ? COLORS.primary : '#9E9E9E'}
        />
        <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>
          {label}
        </Text>
      </>
    )}
  </TouchableOpacity>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // ── Contact edit state
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // ── Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimer = useRef(null);

  useEffect(() => {
    fetchProfile();
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3500,
    );
  };

  // ── Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await client.get('/user');
      setUser(res.data);
      setEmail(res.data.email || '');
      setContactNumber(res.data.contact_number || '');
    } catch (err) {
      console.error('profile fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Live validation — contact fields
  const handleEmailChange = (v) => {
    setEmail(v);
    if (!v) {
      setEmailError('Email cannot be empty.');
      return;
    }
    setEmailError(
      isValidEmail(v) ? '' : 'Enter a valid email address (must include @).',
    );
  };

  const handlePhoneChange = (v) => {
    const digits = v.replace(/[^0-9]/g, ''); // digits only
    setContactNumber(digits);
    if (!digits) {
      setPhoneError('Contact number cannot be empty.');
      return;
    }
    setPhoneError(digits.length === 11 ? '' : 'Contact number must be exactly 11 digits.');
  };

  // ── Save contact info — only on explicit button press
  const handleUpdateContact = async () => {
    const eErr = !email
      ? 'Email cannot be empty.'
      : !isValidEmail(email)
        ? 'Enter a valid email address (must include @).'
        : '';
    const pErr = !contactNumber
      ? 'Contact number cannot be empty.'
      : contactNumber.length !== 11
        ? 'Contact number must be exactly 11 digits.'
        : '';

    setEmailError(eErr);
    setPhoneError(pErr);
    if (eErr || pErr) return;

    try {
      setSaving(true);
      await client.post('/profile/update', {
        email,
        contact_number: contactNumber,
      });
      setUser((prev) => ({ ...prev, email, contact_number: contactNumber }));
      showToast('success', 'Contact info updated successfully!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update contact info.');
    } finally {
      setSaving(false);
    }
  };

  // ── Password match indicator (only on confirm field)
  const pwMatchStatus =
    confirmPw.length === 0 ? null :
      confirmPw === newPw ? 'match' : 'mismatch';

  // ── Change password
  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      showToast('error', 'Please fill in all password fields.');
      return;
    }
    if (newPw.length < 8) {
      showToast('error', 'New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      showToast('error', 'Passwords do not match. Please check and try again.');
      return;
    }
    try {
      setSavingPw(true);
      await client.post('/change-password', {
        current_password: currentPw,
        new_password: newPw,
        new_password_confirmation: confirmPw,
      });
      showToast('success', 'Password changed successfully! 🎉');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPw(false);
    }
  };

  // ── Pick & upload profile photo
  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('error', 'Permission to access camera roll is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('profile_photo', {
      uri: asset.uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    try {
      setSaving(true);
      const res = await client.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
        transformRequest: (data) => data,
      });
      setUser((prev) => ({ ...prev, profile_photo: res.data.profile_photo }));
      showToast('success', 'Profile photo updated!');
    } catch {
      showToast('error', 'Failed to upload photo.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const avatarUri = user?.profile_photo ? buildAvatarUrl(user.profile_photo) : null;
  const statusKey = user?.status || 'inactive';
  const sc = statusColors[statusKey] || statusColors.inactive;
  const isTemp = user?.is_temp_password === 1 || user?.is_temp_password === true;
  const contactDirty =
    email !== (user?.email || '') ||
    contactNumber !== (user?.contact_number || '');

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Top Row ── */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <View style={styles.topRowRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/tenant/notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero / Avatar ── */}
        <View style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : require('../../assets/def_icon.png')
              }
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.avatarEditBtn} onPress={handlePickPhoto}>
              <Ionicons name="camera" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>
              {statusLabels[statusKey]}
            </Text>
          </View>
        </View>

        {/* ── Temporary password warning banner ── */}
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

        {/* ── Residence Info (read-only) ── */}
        <Text style={styles.sectionLabel}>Residence</Text>
        <View style={styles.infoCard}>
          <InfoRow
            icon="bed-outline"
            label="Room number"
            value={user?.room_number}
          />
          <InfoRow
            icon="business-outline"
            label="Floor"
            value={user?.floor != null ? `Floor ${user.floor}` : null}
          />
          <InfoRow
            icon="home-outline"
            label="Stay type"
            value={user?.stay_type}
          />
          <InfoRow
            icon="calendar-outline"
            label="Move-in date"
            value={fmt(user?.move_in_date)}
          />
          <InfoRow
            icon="calendar-clear-outline"
            label="Move-out date"
            value={fmt(user?.move_out_date)}
            last
          />
        </View>

        {/* ── Contact Info (editable — saved only when button pressed) ── */}
        <Text style={styles.sectionLabel}>Contact</Text>
        <View style={styles.infoCard}>
          <EditableInfoRow
            icon="call-outline"
            label="Contact number"
            value={contactNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            error={phoneError}
          />
          <EditableInfoRow
            icon="mail-outline"
            label="Email"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            error={emailError}
            last
          />
        </View>

        {/* Save Contact button — only visible when something changed */}
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
        <Text style={styles.sectionLabel}>Change password</Text>
        <View style={styles.pwCard}>
          <PwInput
            label="Current password"
            value={currentPw}
            onChangeText={setCurrentPw}
            first
          />
          <PwInput
            label="New password"
            value={newPw}
            onChangeText={setNewPw}
          />
          {/* Confirm field shows live match / mismatch indicator */}
          <PwInput
            label="Confirm new password"
            value={confirmPw}
            onChangeText={setConfirmPw}
            matchStatus={pwMatchStatus}
          />
        </View>

        {/* Update Password button — disabled while passwords mismatch */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (savingPw || pwMatchStatus === 'mismatch') && styles.saveBtnDisabled,
          ]}
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

      </ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={styles.bottomNav}>
        <NavItem
          iconName="home"
          label="Home"
          isActive={false}
          onPress={() => router.push('/tenant/dashboard')}
        />
        <NavItem
          iconName="person-outline"
          label="Visitor"
          isActive={false}
          onPress={() => router.push('/tenant/visitors')}
        />
        <NavItem
          iconName="warning"
          label="Emergency"
          isCenter
          onPress={() => router.push('/tenant/emergency')}
        />
        <NavItem
          iconName="water-drop"
          label="Water Bill"
          isActive={false}
          onPress={() => router.push('/tenant/water-bill')}
        />
        <NavItem
          iconName="account-circle"
          label="Profile"
          isActive
          onPress={() => router.push('/tenant/profile')}
        />
      </View>
    </SafeAreaView>
  );
}