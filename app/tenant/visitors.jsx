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
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles, { COLORS } from '../../src/constants/visitorsstyles';
import DrawerMenu from '../../src/components/DrawerMenu';
import DatePickerModal from '../../src/components/DatePickerModal';
import TimePickerInput from '../../src/components/TimePickerInput';
import * as ImagePicker from 'expo-image-picker';

const defaultPhoto = require('../../assets/def_icon.png');

const MOCK_VISITORS = [
    {
        id: '1',
        name: 'Marie Ling || Tenant Visit',
        date: 'Feb 19, 2026 - 4:30 PM',
        status: 'Approved',
    },
];

const ID_TYPES = ['Government ID', 'Passport', "Driver's License", 'SSS / GSIS', 'PhilHealth', 'School ID'];

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

// ── Visitor Card ──────────────────────────────────────────────────────────────
const VisitorCard = ({ item }) => (
    <View style={styles.visitorCard}>
        <View style={styles.visitorCardTop}>
            <View style={styles.approvedBadge}>
                <Text style={styles.approvedBadgeText}>{item.status}</Text>
            </View>
            <TouchableOpacity style={styles.eyeBtn}>
                <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
        <Text style={styles.visitorName}>{item.name}</Text>
        <View style={styles.visitorDateRow}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
            <Text style={styles.visitorDate}>{item.date}</Text>
        </View>
    </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function VisitorsScreen() {
    const router = useRouter();
    const drawerRef = useRef(null);

    const [visitors, setVisitors] = useState(MOCK_VISITORS);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [purpose, setPurpose] = useState('');
    const [purposeOpen, setPurposeOpen] = useState(false);
    const [idType, setIdType] = useState('');
    const [idTypeOpen, setIdTypeOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [dateOfVisit, setDateOfVisit] = useState('03/17/2026');
    const [timeOfVisit, setTimeOfVisit] = useState('13:00 PM');
    const [dateModalVisible, setDateModalVisible] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // TODO: const res = await client.get('/visitors');
            // setVisitors(res.data);
        } catch (err) {
            console.error('refresh failed:', err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleSubmit = () => {
        console.log({ fullName, contactNo, purpose, idType, dateOfVisit, timeOfVisit });
    };

    const handleUpload = async () => {
        try {
            // Request gallery permission
            const permissionResult =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                alert('Permission to access gallery is required!');
                return;
            }

            // Open gallery only
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                const selectedImage = result.assets[0];

                setUploadedFile(selectedImage.uri);
            }
        } catch (error) {
            console.log('Image upload error:', error);
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

                {/* ── Top Row ──────────────────────────────────────────────── */}
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
                            <Image source={defaultPhoto} style={styles.avatar} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Header ───────────────────────────────────────────────── */}
                <View style={styles.headerSection}>
                    <Text style={styles.headerTitle}>Visitor Registration 👥</Text>
                    <Text style={styles.headerSub}>Stay updated on important updates</Text>
                </View>

                {/* ── Content ──────────────────────────────────────────────── */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
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
                                <Text style={styles.statLabel}>Visitors Today</Text>
                                <Text style={styles.statValue}>{visitors.length}</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Active Passes</Text>
                                <Text style={styles.statValue}>
                                    {visitors.filter((v) => v.status === 'Approved').length}
                                </Text>
                            </View>
                        </View>

                        {/* Registered Visitors */}
                        <Text style={styles.sectionTitle}>Registered Visitors</Text>
                        {visitors.length === 0 ? (
                            <Text style={styles.emptyText}>No registered visitors yet.</Text>
                        ) : (
                            visitors.map((item) => <VisitorCard key={item.id} item={item} />)
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

                            {/* Purpose of Visit */}
                            <TouchableOpacity
                                style={styles.pickerWrapper}
                                activeOpacity={0.8}
                                onPress={() => setPurposeOpen(!purposeOpen)}
                            >
                                <Text style={[styles.pickerText, purpose && styles.pickerTextSelected]}>
                                    {purpose || 'Purpose of Visit'}
                                </Text>

                                <MaterialIcons
                                    name={purposeOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={20}
                                    color={COLORS.muted}
                                />
                            </TouchableOpacity>

                            {purposeOpen && (
                                <View style={styles.dropdownList}>
                                    <ScrollView
                                        nestedScrollEnabled
                                        showsVerticalScrollIndicator={false}
                                    >

                                        {PURPOSE_OPTIONS.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.dropdownListItem,
                                                    purpose === item && styles.dropdownListItemActive,
                                                ]}
                                                onPress={() => {
                                                    setPurpose(item);
                                                    setPurposeOpen(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownListItemText,
                                                        purpose === item && styles.dropdownListItemTextActive,
                                                    ]}
                                                >
                                                    {item}
                                                </Text>

                                                {purpose === item && (
                                                    <MaterialIcons
                                                        name="check"
                                                        size={16}
                                                        color={COLORS.primary}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* ID Type */}
                            <TouchableOpacity
                                style={styles.pickerWrapper}
                                activeOpacity={0.8}
                                onPress={() => setIdTypeOpen(!idTypeOpen)}
                            >
                                <Text style={[styles.pickerText, idType && styles.pickerTextSelected]}>
                                    {idType || 'ID Type'}
                                </Text>
                                <MaterialIcons
                                    name={idTypeOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={20}
                                    color={COLORS.muted}
                                />
                            </TouchableOpacity>

                            {idTypeOpen && (
                                <View style={styles.dropdownList}>
                                    <ScrollView
                                        nestedScrollEnabled
                                        showsVerticalScrollIndicator={false}
                                    >

                                        {ID_TYPES.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.dropdownListItem,
                                                    idType === item && styles.dropdownListItemActive,
                                                ]}
                                                onPress={() => { setIdType(item); setIdTypeOpen(false); }}
                                            >
                                                <Text style={[
                                                    styles.dropdownListItemText,
                                                    idType === item && styles.dropdownListItemTextActive,
                                                ]}>
                                                    {item}
                                                </Text>
                                                {idType === item && (
                                                    <MaterialIcons name="check" size={16} color={COLORS.primary} />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* Upload ID */}
                            <View style={styles.uploadBox}>
                                <Text style={styles.uploadHint}>10 MB Maximum file size (.png)</Text>
                                <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
                                    <MaterialIcons name="upload" size={16} color={COLORS.dark} />
                                    <Text
                                        style={styles.uploadBtnText}
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                    >
                                        {uploadedFile
                                            ? uploadedFile.split('/').pop()
                                            : 'Upload ID'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Date & Time */}
                            <View style={styles.dateTimeRow}>
                                <View style={styles.dateTimeField}>
                                    <Text style={styles.dateTimeLabel}>Date of Visit</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeInput}
                                        onPress={() => setDateModalVisible(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.dateTimeText}>{dateOfVisit}</Text>
                                        <MaterialIcons name="calendar-today" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Time of Visit - Inline */}
                            <TimePickerInput
                                value={timeOfVisit}
                                onChangeTime={setTimeOfVisit}
                                label="Time of Visit"
                            />
                        </View>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>

            {/* ── Bottom Nav ───────────────────────────────────────────── */}
            <View style={styles.bottomNav}>
                <NavItem iconName="home" label="Home" isActive={false} onPress={() => router.push('/tenant/dashboard')} />
                <NavItem iconName="person-outline" label="Visitor" isActive={true} onPress={() => router.push('/tenant/visitors')} />
                <NavItem iconName="warning" label="Emergency" isCenter onPress={() => router.push('/tenant/emergency')} />
                <NavItem iconName="water-drop" label="Water Bill" isActive={false} onPress={() => router.push('/tenant/water-bill')} />
                <NavItem iconName="account-circle" label="Profile" isActive={false} onPress={() => router.push('/tenant/profile')} />
            </View>

            {/* ── Drawer — always last so it renders on top ─────────────── */}
            <DrawerMenu ref={drawerRef} />

            {/* ── Date Picker Modal ──────────────────────────────────── */}
            <DatePickerModal
                visible={dateModalVisible}
                onClose={() => setDateModalVisible(false)}
                onDateSelect={setDateOfVisit}
                currentDate={dateOfVisit}
            />
        </SafeAreaView>
    );
}