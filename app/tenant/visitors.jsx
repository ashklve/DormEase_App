import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    Animated,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import styles, { COLORS } from '../../src/constants/visitorsstyles';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import { clearSession } from '../../api/auth';
import { dashboardCache } from '../../src/cache/dashboardCache.js';
import NotificationBell from '../../src/components/NotificationBell';
import DrawerMenu from '../../src/components/DrawerMenu';

const defaultPhoto = require('../../assets/def_icon.png');

const ID_TYPES = [
    'Government ID',
    'Passport',
    "Driver's License",
    'SSS / GSIS',
    'PhilHealth',
    'School ID',
];

const PURPOSE_OPTIONS = [
    'Family Visit',
    'Friend Visit',
    'Tenant Assistance',
    'Delivery',
    'Maintenance',
    'Business Meeting',
    'Study Group',
    'Overnight Stay',
    'Others',
];

const STATUS_STYLE = {
    approved: { bg: '#D4EDDA', text: '#1A6B32' },
    pending: { bg: '#FFF3CD', text: '#8A6200' },
    inside: { bg: '#CCE5FF', text: '#003E80' },
    rejected: { bg: '#F8D7DA', text: '#721C24' },
    completed: { bg: '#E2E3E5', text: '#3C3F42' },
    cancelled: { bg: '#F8D7DA', text: '#721C24' },
};

const formatDisplayDate = (d) =>
    d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
const formatSQLDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const formatDisplayTime = (d) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
const formatSQLTime = (d) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;

const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatVisitorTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours = '0', minutes = '0'] = String(timeStr).split(':');
    const d = new Date();
    d.setHours(Number(hours), Number(minutes), 0, 0);
    return formatDisplayTime(d);
};

// ── Bottom Nav Item ───────────────────────────────────────────────────────────
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
                    color={isActive ? COLORS.primary : COLORS.grayText}
                />
                <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>
                    {label}
                </Text>
            </>
        )}
    </TouchableOpacity>
);

const getInitials = (name = '') =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

const VisitorDetail = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <View style={styles.visitorDetailItem}>
            <MaterialIcons name={icon} size={15} color={COLORS.primary} />
            <View style={styles.visitorDetailTextWrap}>
                <Text style={styles.visitorDetailLabel}>{label}</Text>
                <Text style={styles.visitorDetailValue}>{value}</Text>
            </View>
        </View>
    );
};

// ── Compact Visitor Row ───────────────────────────────────────────────────────
const VisitorRow = ({ item, isLast, onCancel, onDelete }) => {
    const s = STATUS_STYLE[item.status?.toLowerCase()] ?? STATUS_STYLE.pending;
    const statusLabel = item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
        : 'Pending';
    const visitDate = formatShortDate(item.date_of_visit);
    const visitTime = formatVisitorTime(item.time_of_visit);

    const isCompleted = item.status?.toLowerCase() === 'completed';
    const isCancelled = item.status?.toLowerCase() === 'cancelled';
    const isInside = item.status?.toLowerCase() === 'inside';
    const isRejected = item.status?.toLowerCase() === 'rejected';

    const canCancel = !item.arrival_time && !isCancelled && !isInside && !isCompleted && !isRejected;
    const canDelete = isCompleted;

    return (
        <View style={[styles.visitorRow, !isLast && styles.visitorRowBorder]}>
            <View style={styles.visitorRowHeader}>
                <View style={styles.visitorAvatar}>
                    <Text style={styles.visitorAvatarText}>
                        {getInitials(item.visitor_name)}
                    </Text>
                </View>
                <View style={styles.visitorRowTitleWrap}>
                    <Text style={styles.visitorRowName}>
                        {item.visitor_name || 'Unnamed Visitor'}
                    </Text>
                    {!!item.contact_no && (
                        <View style={styles.visitorContactRow}>
                            <MaterialIcons name="phone" size={14} color={COLORS.muted} />
                            <Text style={styles.visitorContactText}>{item.contact_no}</Text>
                        </View>
                    )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.visitorRowBadge, { backgroundColor: s.bg }]}>
                        <Text style={[styles.visitorRowBadgeText, { color: s.text }]}>
                            {statusLabel}
                        </Text>
                    </View>
                    {canCancel && (
                        <TouchableOpacity 
                            style={styles.cancelBtnHeader}
                            onPress={() => onCancel(item.id)}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="close" size={12} color="#D32F2F" style={{ marginRight: 2 }} />
                            <Text style={styles.cancelBtnHeaderText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                    {canDelete && (
                        <TouchableOpacity 
                            style={styles.deleteBtnHeader}
                            onPress={() => onDelete(item.id)}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="delete-outline" size={15} color="#D63375" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <View style={styles.visitorDetailsGrid}>
                <VisitorDetail icon="event" label="Date" value={visitDate} />
                <VisitorDetail icon="schedule" label="Time" value={visitTime} />
                <VisitorDetail icon="flag" label="Purpose" value={item.purpose} />
                <VisitorDetail icon="badge" label="ID Type" value={item.id_type} />
            </View>
        </View>
    );
};

// ── Collapsible Visitor List ──────────────────────────────────────────────────
const CollapsibleVisitorList = ({ visitors, onCancel, onDelete }) => {
    const [open, setOpen] = useState(true);
    const animHeight = useRef(new Animated.Value(1)).current;
    const animOpacity = useRef(new Animated.Value(1)).current;
    const chevronAnim = useRef(new Animated.Value(1)).current;

    const toggle = () => {
        const toOpen = !open;
        setOpen(toOpen);
        Animated.parallel([
            Animated.timing(animHeight, { toValue: toOpen ? 1 : 0, duration: 280, useNativeDriver: false }),
            Animated.timing(animOpacity, { toValue: toOpen ? 1 : 0, duration: 220, useNativeDriver: false }),
            Animated.timing(chevronAnim, { toValue: toOpen ? 1 : 0, duration: 260, useNativeDriver: true }),
        ]).start();
    };

    const chevronRotate = chevronAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '0deg'],
    });

    return (
        <View style={styles.collapseContainer}>
            <TouchableOpacity style={styles.collapseHeader} onPress={toggle} activeOpacity={0.7}>
                <View style={styles.collapseHeaderLeft}>
                    <View style={styles.collapseCountBadge}>
                        <Text style={styles.collapseCountText}>
                            {visitors.length} {visitors.length === 1 ? 'visitor' : 'visitors'}
                        </Text>
                    </View>
                    <Text style={styles.collapseHeaderLabel}>All entries</Text>
                </View>
                <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                    <MaterialIcons name="keyboard-arrow-up" size={20} color={COLORS.muted} />
                </Animated.View>
            </TouchableOpacity>
            <Animated.View style={{
                opacity: animOpacity,
                maxHeight: animHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 9999] }),
                overflow: 'hidden',
            }}>
                <View style={styles.collapseListDivider} />
                {visitors.map((item, index) => (
                    <VisitorRow 
                        key={item.id} 
                        item={item} 
                        isLast={index === visitors.length - 1} 
                        onCancel={onCancel}
                        onDelete={onDelete}
                    />
                ))}
            </Animated.View>
        </View>
    );
};

// ── iOS DateTime Modal ────────────────────────────────────────────────────────
const IOSPickerModal = ({ visible, mode, value, onChange, onDone }) => (
    <Modal transparent animationType="slide" visible={visible}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                    <TouchableOpacity onPress={onDone}>
                        <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 16 }}>Done</Text>
                    </TouchableOpacity>
                </View>
                <DateTimePicker value={value} mode={mode} display="spinner" onChange={onChange} style={{ height: 200 }} textColor="#000" />
            </View>
        </View>
    </Modal>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function VisitorsScreen() {
    const router = useRouter();
    const { user, avatarUri } = useUser();
    const insets = useSafeAreaInsets();

    // ── drawer ref ────────────────────────────────────────────────────────────
    const drawerRef = useRef(null);

    // derived user display values — same logic as dashboard
    const username = user
        ? '@' + `${user.first_name ?? ''}${user.last_name ?? ''}`.replace(/\s+/g, '').toLowerCase()
        : '';
    const roomCode = user?.room_number ? `R${user.room_number}-01` : '';
    const photoSource = avatarUri ? { uri: avatarUri } : defaultPhoto;

    // ── visitors state ────────────────────────────────────────────────────────
    const [visitors, setVisitors] = useState([]);
    const [visitorsToday, setVisitorsToday] = useState(0);
    const [activePasses, setActivePasses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [fullName, setFullName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [purpose, setPurpose] = useState('');
    const [purposeOpen, setPurposeOpen] = useState(false);
    const [idType, setIdType] = useState('');
    const [idTypeOpen, setIdTypeOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const [selectedDateTime, setSelectedDateTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDateTime, setTempDateTime] = useState(new Date());

    const fetchVisitors = async () => {
        try {
            const res = await client.get('/visitors');
            setVisitors(res.data.logs ?? []);
            setVisitorsToday(res.data.visitors_today ?? 0);
            setActivePasses(res.data.active_passes ?? 0);
        } catch (err) {
            console.error('fetch visitors error:', err.message);
            Alert.alert('Error', 'Failed to load visitor logs.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchVisitors();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchVisitors();
    }, []);

    const handleCancelVisitor = (visitorId) => {
        Alert.alert(
            'Cancel Registration',
            'Are you sure you want to cancel this visitor registration?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.patch(`/visitors/${visitorId}/cancel`);
                            Alert.alert('Success', 'Visitor registration cancelled successfully.');
                            fetchVisitors();
                        } catch (err) {
                            console.error('cancel visitor error:', err.message);
                            Alert.alert('Error', 'Failed to cancel visitor registration.');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteVisitor = (visitorId) => {
        Alert.alert(
            'Delete Log',
            'Are you sure you want to delete this visitor log from your history?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/visitors/${visitorId}`);
                            Alert.alert('Success', 'Visitor log deleted successfully.');
                            fetchVisitors();
                        } catch (err) {
                            console.error('delete visitor error:', err.message);
                            Alert.alert('Error', 'Failed to delete visitor log.');
                        }
                    }
                }
            ]
        );
    };

    const onAndroidDateChange = (event, date) => {
        setShowDatePicker(false);
        if (event.type === 'dismissed' || !date) return;
        setSelectedDateTime((prev) => {
            const next = new Date(prev);
            next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            return next;
        });
    };

    const onAndroidTimeChange = (event, date) => {
        setShowTimePicker(false);
        if (event.type === 'dismissed' || !date) return;
        setSelectedDateTime((prev) => {
            const next = new Date(prev);
            next.setHours(date.getHours(), date.getMinutes(), 0);
            return next;
        });
    };

    const onIOSChange = (event, date) => { if (date) setTempDateTime(date); };

    const openDatePicker = () => { setTempDateTime(new Date(selectedDateTime)); setShowDatePicker(true); };
    const openTimePicker = () => { setTempDateTime(new Date(selectedDateTime)); setShowTimePicker(true); };

    const confirmIOSDate = () => {
        setSelectedDateTime((prev) => {
            const next = new Date(prev);
            next.setFullYear(tempDateTime.getFullYear(), tempDateTime.getMonth(), tempDateTime.getDate());
            return next;
        });
        setShowDatePicker(false);
    };

    const confirmIOSTime = () => {
        setSelectedDateTime((prev) => {
            const next = new Date(prev);
            next.setHours(tempDateTime.getHours(), tempDateTime.getMinutes(), 0);
            return next;
        });
        setShowTimePicker(false);
    };

    const handleUpload = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Permission to access gallery is required!');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            if (!result.canceled) setUploadedFile(result.assets[0].uri);
        } catch (error) {
            console.error('Image upload error:', error);
        }
    };

    const handleSubmit = async () => {
        if (!fullName.trim()) {
            Alert.alert('Validation', 'Full name is required.');
            return;
        }
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('visitor_name', fullName.trim());
            formData.append('contact_no', contactNo.trim());
            formData.append('purpose', purpose);
            formData.append('id_type', idType);
            formData.append('date_of_visit', formatSQLDate(selectedDateTime));
            formData.append('time_of_visit', formatSQLTime(selectedDateTime));

            if (uploadedFile) {
                const filename = uploadedFile.split('/').pop();
                const extension = filename.split('.').pop().toLowerCase();
                const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('id_photo', { uri: uploadedFile, name: filename, type: mimeType });
            }

            const res = await client.post('/visitors', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setVisitors((prev) => [res.data.visitor, ...prev]);
            setVisitorsToday((prev) => prev + 1);

            setFullName('');
            setContactNo('');
            setPurpose('');
            setIdType('');
            setUploadedFile(null);
            setSelectedDateTime(new Date());

            Alert.alert('Success', 'Visitor registered successfully.');
        } catch (err) {
            console.error('submit error:', err.response?.data ?? err.message);
            const errors = err.response?.data?.errors;
            const msg = errors
                ? Object.values(errors).flat().join('\n')
                : (err.response?.data?.message ?? 'Failed to register visitor.');
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={20}
            >
                {/* Top Row */}
                <View style={styles.topRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => drawerRef.current?.open()}>
                        <MaterialIcons name="menu" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <View style={styles.topRowRight}>
                        <NotificationBell style={styles.iconBtn} iconColor={COLORS.dark} />
                        <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                            <Image
                                source={avatarUri ? { uri: avatarUri } : defaultPhoto}
                                style={styles.avatar}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Header */}
                <View style={styles.headerSection}>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.headerIconBadge}>
                            <Ionicons name="people-outline" size={20} color={COLORS.white} />
                        </View>
                        <Text style={styles.headerTitle}>Visitor Registration</Text>
                    </View>
                    <Text style={styles.headerSub}>Register and track your visitors</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                        ]}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                        automaticallyAdjustKeyboardInsets={true}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[COLORS.primary]}
                                tintColor={COLORS.primary}
                            />
                        }
                    >
                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <View style={styles.statCardTop}>
                                    <View style={[styles.statIconBadge, { backgroundColor: '#FBEAF0' }]}>
                                        <Ionicons name="people-outline" size={17} color={COLORS.primary} />
                                    </View>
                                    <View style={[styles.statTrendBadge, { backgroundColor: '#E1F5EE' }]}>
                                        <Text style={[styles.statTrendText, { color: '#0F6E56' }]}>today</Text>
                                    </View>
                                </View>
                                <Text style={styles.statValue}>{visitorsToday}</Text>
                                <Text style={styles.statLabel}>Visitors today</Text>
                            </View>
                            <View style={styles.statCard}>
                                <View style={styles.statCardTop}>
                                    <View style={[styles.statIconBadge, { backgroundColor: '#E1F5EE' }]}>
                                        <Ionicons name="card-outline" size={17} color="#0F6E56" />
                                    </View>
                                    <View style={[styles.statTrendBadge, { backgroundColor: '#F1EFE8' }]}>
                                        <Text style={[styles.statTrendText, { color: '#5F5E5A' }]}>active</Text>
                                    </View>
                                </View>
                                <Text style={styles.statValue}>{activePasses}</Text>
                                <Text style={styles.statLabel}>Active passes</Text>
                            </View>
                        </View>

                        {/* Registered Visitors */}
                        <Text style={styles.sectionTitle}>Registered Visitors</Text>
                        {visitors.length === 0 ? (
                            <Text style={styles.emptyText}>No registered visitors yet.</Text>
                        ) : (
                            <CollapsibleVisitorList 
                                visitors={visitors} 
                                onCancel={handleCancelVisitor} 
                                onDelete={handleDeleteVisitor} 
                            />
                        )}

                        {/* Register New Visitor Form */}
                        <View style={styles.formSection}>
                            <Text style={styles.formSectionTitle}>Register New Visitor</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor={COLORS.muted}
                                value={fullName}
                                onChangeText={setFullName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Contact No."
                                placeholderTextColor={COLORS.muted}
                                value={contactNo}
                                onChangeText={setContactNo}
                                keyboardType="phone-pad"
                            />

                            {/* Purpose */}
                            <TouchableOpacity
                                style={styles.pickerWrapper}
                                activeOpacity={0.8}
                                onPress={() => { setPurposeOpen(!purposeOpen); setIdTypeOpen(false); }}
                            >
                                <Text style={[styles.pickerText, purpose && styles.pickerTextSelected]}>
                                    {purpose || 'Purpose of Visit'}
                                </Text>
                                <MaterialIcons name={purposeOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color={COLORS.muted} />
                            </TouchableOpacity>
                            {purposeOpen && (
                                <View style={styles.dropdownList}>
                                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                        {PURPOSE_OPTIONS.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[styles.dropdownListItem, purpose === item && styles.dropdownListItemActive]}
                                                onPress={() => { setPurpose(item); setPurposeOpen(false); }}
                                            >
                                                <Text style={[styles.dropdownListItemText, purpose === item && styles.dropdownListItemTextActive]}>{item}</Text>
                                                {purpose === item && <MaterialIcons name="check" size={16} color={COLORS.primary} />}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* ID Type */}
                            <TouchableOpacity
                                style={styles.pickerWrapper}
                                activeOpacity={0.8}
                                onPress={() => { setIdTypeOpen(!idTypeOpen); setPurposeOpen(false); }}
                            >
                                <Text style={[styles.pickerText, idType && styles.pickerTextSelected]}>
                                    {idType || 'ID Type'}
                                </Text>
                                <MaterialIcons name={idTypeOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color={COLORS.muted} />
                            </TouchableOpacity>
                            {idTypeOpen && (
                                <View style={styles.dropdownList}>
                                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                        {ID_TYPES.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[styles.dropdownListItem, idType === item && styles.dropdownListItemActive]}
                                                onPress={() => { setIdType(item); setIdTypeOpen(false); }}
                                            >
                                                <Text style={[styles.dropdownListItemText, idType === item && styles.dropdownListItemTextActive]}>{item}</Text>
                                                {idType === item && <MaterialIcons name="check" size={16} color={COLORS.primary} />}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* Upload ID */}
                            <View style={styles.uploadBox}>
                                <Text style={styles.uploadHint}>10 MB Maximum file size (.png / .jpg)</Text>
                                <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
                                    <MaterialIcons name="upload" size={16} color={COLORS.dark} />
                                    <Text style={styles.uploadBtnText} numberOfLines={1} ellipsizeMode="middle">
                                        {uploadedFile ? uploadedFile.split('/').pop() : 'Upload ID'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Date & Time */}
                            <View style={styles.dateTimeRow}>
                                <View style={[styles.dateTimeField, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.dateTimeLabel}>Date of Visit</Text>
                                    <TouchableOpacity style={styles.dateTimeInput} onPress={openDatePicker} activeOpacity={0.7}>
                                        <Text style={styles.dateTimeText}>{formatDisplayDate(selectedDateTime)}</Text>
                                        <MaterialIcons name="calendar-today" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.dateTimeField, { flex: 1 }]}>
                                    <Text style={styles.dateTimeLabel}>Time of Visit</Text>
                                    <TouchableOpacity style={styles.dateTimeInput} onPress={openTimePicker} activeOpacity={0.7}>
                                        <Text style={styles.dateTimeText}>{formatDisplayTime(selectedDateTime)}</Text>
                                        <MaterialIcons name="access-time" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {Platform.OS === 'android' && showDatePicker && (
                                <DateTimePicker value={selectedDateTime} mode="date" display="default" minimumDate={new Date()} onChange={onAndroidDateChange} />
                            )}
                            {Platform.OS === 'android' && showTimePicker && (
                                <DateTimePicker value={selectedDateTime} mode="time" display="default" is24Hour={false} onChange={onAndroidTimeChange} />
                            )}

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                activeOpacity={0.85}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Text style={styles.submitBtnText}>Submit</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>

            {/* Bottom Nav */}
            <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <NavItem iconName="home" label="Home" isActive={false} onPress={() => router.push('/tenant/dashboard')} />
                <NavItem iconName="person-outline" label="Visitor" isActive={true} onPress={() => router.push('/tenant/visitors')} />
                <NavItem iconName="warning" label="Emergency" isCenter onPress={() => router.push('/tenant/emergency')} />
                <NavItem iconName="water-drop" label="Water Bill" isActive={false} onPress={() => router.push('/tenant/water-bill')} />
                <NavItem iconName="account-circle" label="Profile" isActive={false} onPress={() => router.push('/tenant/profile')} />
            </View>

            {/* Drawer */}
            <DrawerMenu ref={drawerRef} />

            {/* iOS pickers */}
            {Platform.OS === 'ios' && (
                <IOSPickerModal visible={showDatePicker} mode="date" value={tempDateTime} onChange={onIOSChange} onDone={confirmIOSDate} />
            )}
            {Platform.OS === 'ios' && (
                <IOSPickerModal visible={showTimePicker} mode="time" value={tempDateTime} onChange={onIOSChange} onDone={confirmIOSTime} />
            )}
        </SafeAreaView>
    );
}