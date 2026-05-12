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
  Platform,
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
  const dt = new Date(d);
  return dt.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
};

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
  const isSuccess = type === 'success';

  return (
    <Animated.View style={[styles.toast, isSuccess ? styles.toastSuccess : styles.toastError, { opacity }]}>
      <Ionicons
        name={isSuccess ? 'checkmark-circle' : 'alert-circle'}
        size={18}
        color={isSuccess ? COLORS.success : COLORS.danger}
      />
      <Text style={[styles.toastText, isSuccess ? styles.toastTextSuccess : styles.toastTextError]}>
        {message}
      </Text>
    </Animated.View>
  );
};

// ── Password Input ────────────────────────────────────────────────────────────
const PwInput = ({ label, value, onChangeText, first = false }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text style={first ? styles.inputLabel_first : styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
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
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShow((p) => !p)}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Info Row ──────────────────────────────────────────────────────────────────
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
const EditableInfoRow = ({ icon, label, value, onChangeText, keyboardType = 'default', last = false }) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <View style={styles.infoIconWrapper}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <TextInput
          style={[
            styles.infoValue,
            focused && { borderBottomWidth: 1, borderBottomColor: COLORS.primary },
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
      <Ionicons name="pencil-outline" size={15} color={COLORS.muted} />
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
        <MaterialIcons name={iconName} size={26} color={COLORS.white} />
      </View>
    ) : (
      <>
        <MaterialIcons
          name={iconName}
          size={24}
          color={isActive ? COLORS.primary : COLORS.muted}
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

  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

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
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

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

  const handleUpdateContact = async () => {
    if (!email) {
      showToast('error', 'Email cannot be empty.');
      return;
    }
    try {
      setSaving(true);
      await client.post('/profile/update', {
        email,
        contact_number: contactNumber,
      });
      setUser((prev) => ({ ...prev, email, contact_number: contactNumber }));
      showToast('success', 'Contact info updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update contact info.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

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
      showToast('error', 'New passwords do not match.');
      return;
    }
    try {
      setSaving(true);
      await client.post('/change-password', {
        current_password: currentPw,
        new_password: newPw,
        new_password_confirmation: confirmPw,
      });
      showToast('success', 'Password updated successfully!');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

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
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        transformRequest: (data) => data,
      });
      setUser((prev) => ({ ...prev, profile_photo: res.data.profile_photo }));
      showToast('success', 'Profile photo updated!');
    } catch (err) {
      showToast('error', 'Failed to upload photo.');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
          <Text style={styles.heroEmail}>{email}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>
              {statusLabels[statusKey]}
            </Text>
          </View>
        </View>

        {/* ── Temp password warning banner ── */}
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

        {/* ── Contact Info ── */}
        <Text style={styles.sectionLabel}>Contact</Text>
        <View style={styles.infoCard}>
          <EditableInfoRow
            icon="call-outline"
            label="Contact number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />
          <EditableInfoRow
            icon="mail-outline"
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            last
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleUpdateContact}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Contact Info</Text>
          )}
        </TouchableOpacity>

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
          <PwInput
            label="Confirm new password"
            value={confirmPw}
            onChangeText={setConfirmPw}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleChangePassword}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={styles.bottomNav}>
        <NavItem iconName="home" label="Home" isActive={false} onPress={() => router.push('/tenant/dashboard')} />
        <NavItem iconName="person-outline" label="Visitor" isActive={false} onPress={() => router.push('/tenant/visitors')} />
        <NavItem iconName="warning" label="Emergency" isCenter onPress={() => router.push('/tenant/emergency')} />
        <NavItem iconName="water-drop" label="Water Bill" isActive={false} onPress={() => router.push('/tenant/water-bill')} />
        <NavItem iconName="account-circle" label="Profile" isActive={true} onPress={() => router.push('/tenant/profile')} />
      </View>
    </SafeAreaView>
  );
}