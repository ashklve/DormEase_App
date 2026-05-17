import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import styles, { COLORS } from '../../src/constants/documentstyles';
import DrawerMenu from '../../src/components/DrawerMenu';
import { useUser } from '../../src/context/UserContext';

const defaultPhoto = require('../../assets/def_icon.png');

// ── Request type options ──────────────────────────────────────────────────────
const REQUEST_TYPES = [
    'Room Transfer Request',
    'Lease Contract Copy',
    'Certificate of Residency',
    'Official Receipt Copy',
    'Clearance Certificate',
    'Good Conduct Certificate',
    'Others',
];

// ── Notice content per request type ──────────────────────────────────────────
const NOTICE_CONTENT = {
    'Room Transfer Request': {
        title: 'Room Transfer Request – Required Documents',
        items: [
            'Room Transfer - Request Form – Form with reason for transfer, current room, and preferred room number.',
            'Endorsement from Current Roommates – Signed acknowledgement from roommates of the preferred room (if applicable).',
            'Room Inspection Clearance (Current Room) – Clearance confirming no damage or violations in your current room.',
        ],
    },
    'Lease Contract Copy': {
        title: 'Lease Contract Copy – Required Documents',
        items: [
            'Valid government-issued ID for identity verification.',
            'Proof of current tenancy (room number and move-in date).',
        ],
    },
    'Certificate of Residency': {
        title: 'Certificate of Residency – Requirements',
        items: [
            'Valid ID for identity verification.',
            'Purpose of the certificate (employment, school, etc.).',
            'Processing fee may apply – see admin office.',
        ],
    },
    default: {
        title: 'Document Request – General Requirements',
        items: [
            'Valid government-issued ID for identity verification.',
            'Complete and accurate request form submission.',
            'Processing may take 3–5 business days.',
        ],
    },
};

// ── Date helpers ──────────────────────────────────────────────────────────────
const formatDisplayDate = (d) =>
    d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

const formatSQLDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
                    color={isActive ? COLORS.primary : COLORS.muted}
                />
                <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>
                    {label}
                </Text>
            </>
        )}
    </TouchableOpacity>
);

// ── iOS Date Picker Modal ─────────────────────────────────────────────────────
const IOSPickerModal = ({ visible, value, onChange, onDone }) => (
    <Modal transparent animationType="slide" visible={visible}>
        <View style={styles.iosModalOverlay}>
            <View style={styles.iosModalSheet}>
                <View style={styles.iosModalHeader}>
                    <TouchableOpacity onPress={onDone}>
                        <Text style={styles.iosModalDoneText}>Done</Text>
                    </TouchableOpacity>
                </View>
                <DateTimePicker
                    value={value}
                    mode="date"
                    display="spinner"
                    onChange={onChange}
                    style={{ height: 200 }}
                    textColor="#000"
                />
            </View>
        </View>
    </Modal>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DocumentsScreen() {
    const router = useRouter();
    const { avatarUri } = useUser();
    const drawerRef = useRef(null);

    // ── Form state
    const [fullName, setFullName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [roomNo, setRoomNo] = useState('');
    const [requestType, setRequestType] = useState('');
    const [requestTypeOpen, setRequestTypeOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [purpose, setPurpose] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('digital');
    const [submitting, setSubmitting] = useState(false);

    // ── Date needed
    const [dateNeeded, setDateNeeded] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    // ── Dynamic notice based on selected request type
    const notice = requestType
        ? (NOTICE_CONTENT[requestType] ?? NOTICE_CONTENT.default)
        : NOTICE_CONTENT['Room Transfer Request'];

    // ── Android date change
    const onAndroidDateChange = (event, date) => {
        setShowDatePicker(false);
        if (event.type === 'dismissed' || !date) return;
        setDateNeeded(date);
    };

    // ── iOS date
    const onIOSChange = (event, date) => { if (date) setTempDate(date); };
    const confirmIOSDate = () => {
        setDateNeeded(tempDate);
        setShowDatePicker(false);
    };

    // ── Image picker
    const handleUpload = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
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

    // ── Submit
    const handleSubmit = async () => {
        if (!fullName.trim()) {
            Alert.alert('Validation', 'Full name is required.');
            return;
        }
        if (!requestType) {
            Alert.alert('Validation', 'Please select a request type.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('full_name', fullName.trim());
            formData.append('contact_no', contactNo.trim());
            formData.append('room_no', roomNo.trim());
            formData.append('request_type', requestType);
            formData.append('purpose', purpose.trim());
            formData.append('date_needed', formatSQLDate(dateNeeded));
            formData.append('delivery_method', deliveryMethod);

            if (uploadedFile) {
                const filename = uploadedFile.split('/').pop();
                const ext = filename.split('.').pop().toLowerCase();
                const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('attachment', { uri: uploadedFile, name: filename, type: mimeType });
            }

            // await client.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            // Reset form
            setFullName('');
            setContactNo('');
            setRoomNo('');
            setRequestType('');
            setUploadedFile(null);
            setPurpose('');
            setDeliveryMethod('digital');
            setDateNeeded(new Date());

            Alert.alert('Success', 'Document request submitted successfully.');
        } catch (err) {
            console.error('submit error:', err.response?.data ?? err.message);
            const errors = err.response?.data?.errors;
            const msg = errors
                ? Object.values(errors).flat().join('\n')
                : (err.response?.data?.message ?? 'Failed to submit request.');
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={20}
            >
                {/* ── Top Row ── */}
                <View style={styles.topRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => drawerRef.current?.open()}>
                        <MaterialIcons name="menu" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <View style={styles.topRowRight}>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => router.push('/tenant/notifications')}
                        >
                            <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
                            <View style={styles.notifDot} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                            <Image
                                source={avatarUri ? { uri: avatarUri } : defaultPhoto}
                                style={styles.avatar}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Header ── */}
                <View style={styles.headerSection}>
                    <Text style={styles.headerTitle}>Document Request 📋</Text>
                    <Text style={styles.headerSub}>Submit a request for permits or official copies</Text>
                </View>

                {/* ── Scrollable Content ── */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    automaticallyAdjustKeyboardInsets={true}
                >

                    {/* ── Additional Document Notice Card ── */}
                    <View style={styles.noticeCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="document-text-outline" size={15} color={COLORS.primary} />
                            <Text style={styles.sectionHeaderText}>Additional Document Notice</Text>
                        </View>

                        <Text style={styles.noticeTitle}>{notice.title}</Text>

                        {notice.items.map((item, index) => (
                            <View key={index} style={styles.noticeItemRow}>
                                <View style={styles.noticeBullet} />
                                <Text style={styles.noticeItemText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* ── Tenant Info Section ── */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="person-outline" size={15} color={COLORS.primary} />
                            <Text style={styles.sectionHeaderText}>Tenant Info</Text>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={COLORS.muted}
                            value={fullName}
                            onChangeText={setFullName}
                        />

                        <View style={styles.inlineRow}>
                            <View style={styles.contactWrapper}>
                                <TextInput
                                    style={[styles.input, { marginBottom: 0, paddingRight: 36 }]}
                                    placeholder="Contact No."
                                    placeholderTextColor={COLORS.muted}
                                    value={contactNo}
                                    onChangeText={setContactNo}
                                    keyboardType="phone-pad"
                                />
                                <Ionicons
                                    name="call-outline"
                                    size={16}
                                    color={COLORS.primary}
                                    style={styles.contactIcon}
                                />
                            </View>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Room No."
                                placeholderTextColor={COLORS.muted}
                                value={roomNo}
                                onChangeText={setRoomNo}
                            />
                        </View>
                    </View>

                    {/* ── Request Details Section ── */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="document-attach-outline" size={15} color={COLORS.primary} />
                            <Text style={styles.sectionHeaderText}>Request Details</Text>
                        </View>

                        {/* Request Type Dropdown */}
                        <TouchableOpacity
                            style={styles.pickerWrapper}
                            activeOpacity={0.8}
                            onPress={() => setRequestTypeOpen(!requestTypeOpen)}
                        >
                            <Text style={[styles.pickerText, requestType && styles.pickerTextSelected]}>
                                {requestType || 'Room Transfer Request'}
                            </Text>
                            <MaterialIcons
                                name={requestTypeOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={20}
                                color={COLORS.muted}
                            />
                        </TouchableOpacity>

                        {requestTypeOpen && (
                            <View style={styles.dropdownList}>
                                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                    {REQUEST_TYPES.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            style={[
                                                styles.dropdownListItem,
                                                requestType === item && styles.dropdownListItemActive,
                                            ]}
                                            onPress={() => {
                                                setRequestType(item);
                                                setRequestTypeOpen(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.dropdownListItemText,
                                                requestType === item && styles.dropdownListItemTextActive,
                                            ]}>
                                                {item}
                                            </Text>
                                            {requestType === item && (
                                                <MaterialIcons name="check" size={16} color={COLORS.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Upload */}
                        <View style={styles.uploadBox}>
                            <Text style={styles.uploadHint}>10 MB Maximum file size (.png)</Text>
                            <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
                                <MaterialIcons name="upload" size={16} color={COLORS.dark} />
                                <Text
                                    style={styles.uploadBtnText}
                                    numberOfLines={1}
                                    ellipsizeMode="middle"
                                >
                                    {uploadedFile ? uploadedFile.split('/').pop() : 'Upload'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Purpose */}
                        <TextInput
                            style={styles.input}
                            placeholder="Purpose / Reason for Request"
                            placeholderTextColor={COLORS.muted}
                            value={purpose}
                            onChangeText={setPurpose}
                            multiline
                            numberOfLines={2}
                        />

                        {/* Date Needed */}
                        <TouchableOpacity
                            style={styles.datePickerBtn}
                            activeOpacity={0.7}
                            onPress={() => {
                                setTempDate(new Date(dateNeeded));
                                setShowDatePicker(true);
                            }}
                        >
                            <Text style={styles.datePickerText}>
                                {formatDisplayDate(dateNeeded)}
                            </Text>
                            <MaterialIcons name="calendar-today" size={16} color={COLORS.primary} />
                        </TouchableOpacity>

                        {/* Android inline date picker */}
                        {Platform.OS === 'android' && showDatePicker && (
                            <DateTimePicker
                                value={dateNeeded}
                                mode="date"
                                display="default"
                                minimumDate={new Date()}
                                onChange={onAndroidDateChange}
                            />
                        )}

                        {/* Delivery method radios */}
                        <TouchableOpacity
                            style={styles.radioRow}
                            onPress={() => setDeliveryMethod('digital')}
                        >
                            <View style={styles.radioOuter}>
                                {deliveryMethod === 'digital' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Digital Copy (PDF)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioRowLast}
                            onPress={() => setDeliveryMethod('printed')}
                        >
                            <View style={styles.radioOuter}>
                                {deliveryMethod === 'printed' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Printed Copy (Pick up at admin office)</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Submit Button ── */}
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

                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Bottom Nav ── */}
            <View style={styles.bottomNav}>
                <NavItem iconName="home" label="Home" isActive={false} onPress={() => router.push('/tenant/dashboard')} />
                <NavItem iconName="person-outline" label="Visitor" isActive={false} onPress={() => router.push('/tenant/visitors')} />
                <NavItem iconName="warning" label="Emergency" isCenter onPress={() => router.push('/tenant/emergency')} />
                <NavItem iconName="water-drop" label="Water Bill" isActive={false} onPress={() => router.push('/tenant/water-bill')} />
                <NavItem iconName="account-circle" label="Profile" isActive={false} onPress={() => router.push('/tenant/profile')} />
            </View>

            {/* ── Drawer ── */}
            <DrawerMenu ref={drawerRef} />

            {/* ── iOS Date Modal ── */}
            {Platform.OS === 'ios' && (
                <IOSPickerModal
                    visible={showDatePicker}
                    value={tempDate}
                    onChange={onIOSChange}
                    onDone={confirmIOSDate}
                />
            )}

        </SafeAreaView>
    );
}