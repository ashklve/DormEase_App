import React, { useState, useRef, useEffect } from 'react';
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
    Linking,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import styles, { COLORS } from '../../src/constants/documentstyles';
import DrawerMenu from '../../src/components/DrawerMenu';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';
import client from '../../api/client';

const defaultPhoto = require('../../assets/def_icon.png');
const FILE_BASE_URL = client.defaults.baseURL.replace(/\/api\/?$/, '');

const CATEGORY = { FORM: 'form', CERTIFICATE: 'certificate' };

// ── NavItem ───────────────────────────────────────────────────────────────────
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

// ── Screen ────────────────────────────────────────────────────────────────────
export default function DocumentsScreen() {
    const router        = useRouter();
    const { avatarUri } = useUser();
    const insets        = useSafeAreaInsets();
    const drawerRef     = useRef(null);

    // UI state
    const [formsExpanded,     setFormsExpanded]     = useState(true);
    const [adminDocsExpanded, setAdminDocsExpanded] = useState(true);
    const [selectedOption,    setSelectedOption]    = useState(null);
    const [dropdownOpen,      setDropdownOpen]      = useState(false);

    // Form fields
    const [fullName,       setFullName]       = useState('');
    const [contactNo,      setContactNo]      = useState('');
    const [roomNo,         setRoomNo]         = useState('');
    const [purpose,        setPurpose]        = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('digital');
    const [uploadedFile,   setUploadedFile]   = useState(null);
    const [submitting,     setSubmitting]     = useState(false);
    const [userInfo,       setUserInfo]       = useState(null);

    // Data state
    const [downloadableForms, setDownloadableForms] = useState([]);
    const [adminDocuments,    setAdminDocuments]    = useState([]); // visibility: specific
    const [allTenantDocs,     setAllTenantDocs]     = useState([]); // visibility: all
    const [docsLoading,       setDocsLoading]       = useState(true);

    // ── dropdownSections is computed from state, so it lives inside the component
    const dropdownSections = [
        {
            sectionLabel: 'Upload a Filled Form',
            items: downloadableForms.map(f => ({
                id:       String(f.id),
                label:    f.label,
                url:      f.url,
                icon:     'insert-drive-file',
                category: CATEGORY.FORM,
            })),
        },
        {
            sectionLabel: 'Request a Certificate / Document',
            items: [
                { id: 'cert_residency', label: 'Certificate of Residency', category: CATEGORY.CERTIFICATE },
                { id: 'receipt_copy',   label: 'Official Receipt Copy',     category: CATEGORY.CERTIFICATE },
                { id: 'lease_copy',     label: 'Lease Contract Copy',       category: CATEGORY.CERTIFICATE },
                { id: 'clearance',      label: 'Clearance Certificate',     category: CATEGORY.CERTIFICATE },
                { id: 'good_conduct',   label: 'Good Conduct Certificate',  category: CATEGORY.CERTIFICATE },
            ],
        },
    ];

    // ── Pre-fill from logged-in tenant profile ────────────────────────────────
    useEffect(() => {
        client.get('/user').then((res) => {
            const u = res.data;
            setUserInfo(u);
            setFullName(`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim());
            setContactNo(u.contact_number ?? '');
            setRoomNo(u.room_number ?? '');
        }).catch(() => {});
    }, []);

    // ── Fetch forms + documents ───────────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setDocsLoading(true);

                const [formsRes, docsRes] = await Promise.all([
                    client.get('/tenant/forms'),
                    client.get('/tenant/documents'),
                ]);

                // Downloadable forms from DB (replaces hardcoded list)
                setDownloadableForms(formsRes.data ?? []);

                // Split admin-uploaded docs by visibility
                const docs = docsRes.data?.data ?? docsRes.data ?? [];
                setAllTenantDocs(docs.filter(d => d.visibility === 'all'));
                setAdminDocuments(docs.filter(d => d.visibility === 'specific'));

            } catch {
                // silently fail — sections show empty state
            } finally {
                setDocsLoading(false);
            }
        };
        fetchAll();
    }, []);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const isCertificate = selectedOption?.category === CATEGORY.CERTIFICATE;
    const isForm        = selectedOption?.category === CATEGORY.FORM;

    const handleDownload = (url, label) => {
        Linking.openURL(url).catch(() =>
            Alert.alert('Download Failed', `Could not open "${label}". Please try again.`)
        );
    };

    const handleOpenDoc = (filePath) => {
        const url = `${FILE_BASE_URL}/storage/${filePath}`;
        Linking.openURL(url).catch(() =>
            Alert.alert('Error', 'Could not open the document. Please try again.')
        );
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets?.length > 0) {
                setUploadedFile(result.assets[0]);
            }
        } catch {
            Alert.alert('Error', 'Failed to open file picker. Please try again.');
        }
    };

    const handleSelectOption = (item) => {
        setSelectedOption(item);
        setDropdownOpen(false);
        setUploadedFile(null);
        setPurpose('');
        setDeliveryMethod('digital');
    };

    const handleSubmit = async () => {
        if (!fullName.trim()) {
            Alert.alert('Missing Field', 'Please enter your full name.');
            return;
        }
        if (!selectedOption) {
            Alert.alert('Missing Field', 'Please select a request type.');
            return;
        }
        if (isForm && !uploadedFile) {
            Alert.alert('Missing File', 'Please upload your completed form before submitting.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('full_name',     fullName.trim());
            formData.append('contact_no',    contactNo.trim());
            formData.append('room_no',       roomNo.trim());
            formData.append('request_type',  selectedOption.id);
            formData.append('request_label', selectedOption.label);
            formData.append('document_type', selectedOption.label);
            formData.append('category',      selectedOption.category);

            if (isCertificate) {
                formData.append('purpose',         purpose.trim());
                formData.append('delivery_method', deliveryMethod);
            }

            if (isForm && uploadedFile) {
                formData.append('attachment', {
                    uri:  uploadedFile.uri,
                    name: uploadedFile.name,
                    type: uploadedFile.mimeType ?? 'application/pdf',
                });
            }

            await client.post('/document-requests', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Reset form but restore user info fields
            setFullName(userInfo ? `${userInfo.first_name ?? ''} ${userInfo.last_name ?? ''}`.trim() : '');
            setContactNo(userInfo?.contact_number ?? '');
            setRoomNo(userInfo?.room_number ?? '');
            setSelectedOption(null);
            setUploadedFile(null);
            setPurpose('');
            setDeliveryMethod('digital');

            Alert.alert('Submitted!', 'Your request has been sent successfully.');
        } catch (err) {
            const message = err.response?.data?.message
                ?? err.response?.data?.error
                ?? err.message
                ?? 'Failed to submit. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={20}
            >
                {/* top row */}
                <View style={styles.topRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => drawerRef.current?.open()}
                    >
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

                {/* page header */}
                <View style={styles.headerSection}>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.headerIconBadge}>
                            <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
                        </View>
                        <Text style={styles.headerTitle}>Document Request</Text>
                    </View>
                    <Text style={styles.headerSub}>
                        Download forms or request official documents
                    </Text>
                </View>

                {/* body */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    automaticallyAdjustKeyboardInsets
                >

                    {/* ── SECTION 1: Downloadable Forms ── */}
                    <View style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.sectionHeaderRow}
                            activeOpacity={0.7}
                            onPress={() => setFormsExpanded((v) => !v)}
                        >
                            <View style={styles.sectionHeaderLeft}>
                                <View style={styles.sectionIconBadge}>
                                    <MaterialIcons name="download" size={14} color={COLORS.white} />
                                </View>
                                <View>
                                    <Text style={styles.sectionHeaderText}>Downloadable Forms</Text>
                                    <Text style={styles.sectionHeaderCount}>
                                        {docsLoading
                                            ? 'Loading…'
                                            : `${downloadableForms.length} form${downloadableForms.length !== 1 ? 's' : ''} available`}
                                    </Text>
                                </View>
                            </View>
                            <MaterialIcons
                                name={formsExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={22}
                                color={COLORS.muted}
                            />
                        </TouchableOpacity>

                        {formsExpanded && (
                            <>
                                <View style={styles.hintBox}>
                                    <MaterialIcons name="info-outline" size={13} color={COLORS.primary} />
                                    <Text style={styles.hintBoxText}>
                                        Download a blank form, fill it out, then submit it in the section below.
                                    </Text>
                                </View>

                                {docsLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={COLORS.primary}
                                        style={{ marginVertical: 20 }}
                                    />
                                ) : downloadableForms.length === 0 && allTenantDocs.length === 0 ? (
                                    <View style={styles.hintBox}>
                                        <MaterialIcons name="info-outline" size={13} color={COLORS.primary} />
                                        <Text style={styles.hintBoxText}>No forms available yet.</Text>
                                    </View>
                                ) : (
                                    <>
                                        {/* Admin-managed downloadable forms from DB */}
                                        {downloadableForms.map((form, index) => (
                                            <View
                                                key={String(form.id)}
                                                style={[
                                                    styles.formRow,
                                                    index < downloadableForms.length - 1 && styles.formRowBorder,
                                                ]}
                                            >
                                                <View style={styles.formRowLeft}>
                                                    <View style={styles.formIconCircle}>
                                                        <MaterialIcons name="insert-drive-file" size={15} color={COLORS.primary} />
                                                    </View>
                                                    <Text style={styles.formLabel} numberOfLines={2}>
                                                        {form.label}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.downloadBtn}
                                                    activeOpacity={0.75}
                                                    onPress={() => handleDownload(form.url, form.label)}
                                                >
                                                    <MaterialIcons name="download" size={13} color={COLORS.primary} />
                                                    <Text style={styles.downloadBtnText}>Download</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}

                                        {/* Admin-uploaded docs with visibility: all */}
                                        {allTenantDocs.length > 0 && (
                                            <>
                                                <Text style={[styles.dropdownSectionLabel, { marginTop: 12 }]}>
                                                    From Admin
                                                </Text>
                                                {allTenantDocs.map((doc, index) => (
                                                    <View
                                                        key={doc.document_id ?? index}
                                                        style={[
                                                            styles.formRow,
                                                            index < allTenantDocs.length - 1 && styles.formRowBorder,
                                                        ]}
                                                    >
                                                        <View style={[styles.formRowLeft, { flex: 1, marginRight: 8 }]}>
                                                            <View style={styles.formIconCircle}>
                                                                <MaterialIcons name="insert-drive-file" size={15} color={COLORS.primary} />
                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={styles.formLabel} numberOfLines={2}>
                                                                    {doc.title}
                                                                </Text>
                                                                <Text style={[styles.uploadBoxSub, { marginTop: 2, fontSize: 11 }]}>
                                                                    {doc.document_type}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        {doc.file_path ? (
                                                            <TouchableOpacity
                                                                style={styles.downloadBtn}
                                                                activeOpacity={0.75}
                                                                onPress={() => handleOpenDoc(doc.file_path)}
                                                            >
                                                                <MaterialIcons name="open-in-new" size={13} color={COLORS.primary} />
                                                                <Text style={styles.downloadBtnText}>Open</Text>
                                                            </TouchableOpacity>
                                                        ) : (
                                                            <Text style={[styles.uploadBoxSub, { fontSize: 11 }]}>No file</Text>
                                                        )}
                                                    </View>
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </View>

                    {/* ── SECTION 2: Documents for You (visibility: specific) ── */}
                    <View style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.sectionHeaderRow}
                            activeOpacity={0.7}
                            onPress={() => setAdminDocsExpanded((v) => !v)}
                        >
                            <View style={styles.sectionHeaderLeft}>
                                <View style={styles.sectionIconBadge}>
                                    <MaterialIcons name="folder-shared" size={14} color={COLORS.white} />
                                </View>
                                <View>
                                    <Text style={styles.sectionHeaderText}>Documents for You</Text>
                                    <Text style={styles.sectionHeaderCount}>
                                        {docsLoading
                                            ? 'Loading…'
                                            : `${adminDocuments.length} document${adminDocuments.length !== 1 ? 's' : ''} from admin`}
                                    </Text>
                                </View>
                            </View>
                            <MaterialIcons
                                name={adminDocsExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={22}
                                color={COLORS.muted}
                            />
                        </TouchableOpacity>

                        {adminDocsExpanded && (
                            <>
                                {docsLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={COLORS.primary}
                                        style={{ marginVertical: 20 }}
                                    />
                                ) : adminDocuments.length === 0 ? (
                                    <View style={styles.hintBox}>
                                        <MaterialIcons name="info-outline" size={13} color={COLORS.primary} />
                                        <Text style={styles.hintBoxText}>
                                            No documents posted for you yet. Check back later.
                                        </Text>
                                    </View>
                                ) : (
                                    adminDocuments.map((doc, index) => (
                                        <View
                                            key={doc.document_id ?? index}
                                            style={[
                                                styles.formRow,
                                                index < adminDocuments.length - 1 && styles.formRowBorder,
                                            ]}
                                        >
                                            <View style={[styles.formRowLeft, { flex: 1, marginRight: 8 }]}>
                                                <View style={styles.formIconCircle}>
                                                    <MaterialIcons name="insert-drive-file" size={15} color={COLORS.primary} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.formLabel} numberOfLines={2}>
                                                        {doc.title}
                                                    </Text>
                                                    <Text style={[styles.uploadBoxSub, { marginTop: 2, fontSize: 11 }]}>
                                                        {doc.document_type}
                                                    </Text>
                                                </View>
                                            </View>
                                            {doc.file_path ? (
                                                <TouchableOpacity
                                                    style={styles.downloadBtn}
                                                    activeOpacity={0.75}
                                                    onPress={() => handleOpenDoc(doc.file_path)}
                                                >
                                                    <MaterialIcons name="open-in-new" size={13} color={COLORS.primary} />
                                                    <Text style={styles.downloadBtnText}>Open</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <Text style={[styles.uploadBoxSub, { fontSize: 11 }]}>
                                                    No file
                                                </Text>
                                            )}
                                        </View>
                                    ))
                                )}
                            </>
                        )}
                    </View>

                    {/* ── SECTION 3: Submit a Request ── */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionHeaderLeft}>
                                <View style={styles.sectionIconBadge}>
                                    <MaterialIcons name="send" size={14} color={COLORS.white} />
                                </View>
                                <View>
                                    <Text style={styles.sectionHeaderText}>Submit a Request</Text>
                                    <Text style={styles.sectionHeaderCount}>Fill in your details below</Text>
                                </View>
                            </View>
                        </View>

                        {/* Tenant info fields */}
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

                        <View style={styles.divider} />

                        {/* Request type dropdown */}
                        <Text style={styles.fieldLabel}>What would you like to submit?</Text>

                        <TouchableOpacity
                            style={styles.pickerWrapper}
                            activeOpacity={0.8}
                            onPress={() => setDropdownOpen((v) => !v)}
                        >
                            <Text
                                style={[
                                    styles.pickerText,
                                    selectedOption && styles.pickerTextSelected,
                                ]}
                                numberOfLines={1}
                            >
                                {selectedOption?.label ?? 'Select a request type...'}
                            </Text>
                            <MaterialIcons
                                name={dropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={20}
                                color={COLORS.muted}
                            />
                        </TouchableOpacity>

                        {dropdownOpen && (
                            <View style={styles.dropdownList}>
                                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                    {dropdownSections.map((section) => (
                                        <View key={section.sectionLabel}>
                                            <Text style={styles.dropdownSectionLabel}>
                                                {section.sectionLabel}
                                            </Text>
                                            {section.items.map((item) => {
                                                const active = selectedOption?.id === item.id;
                                                return (
                                                    <TouchableOpacity
                                                        key={item.id}
                                                        style={[
                                                            styles.dropdownListItem,
                                                            active && styles.dropdownListItemActive,
                                                        ]}
                                                        onPress={() => handleSelectOption(item)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.dropdownListItemText,
                                                                active && styles.dropdownListItemTextActive,
                                                            ]}
                                                        >
                                                            {item.label}
                                                        </Text>
                                                        {active && (
                                                            <MaterialIcons
                                                                name="check"
                                                                size={16}
                                                                color={COLORS.primary}
                                                            />
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Form upload flow */}
                        {isForm && (
                            <>
                                <Text style={styles.fieldHint}>
                                    Download the form above, fill it out, then upload it here as PDF.
                                </Text>
                                <TouchableOpacity
                                    style={[styles.uploadBox, uploadedFile && styles.uploadBoxFilled]}
                                    activeOpacity={0.75}
                                    onPress={handlePickDocument}
                                >
                                    <MaterialIcons
                                        name={uploadedFile ? 'insert-drive-file' : 'upload-file'}
                                        size={32}
                                        color={uploadedFile ? COLORS.primary : COLORS.muted}
                                    />
                                    <Text
                                        style={[styles.uploadBoxText, uploadedFile && styles.uploadBoxTextFilled]}
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                    >
                                        {uploadedFile ? uploadedFile.name : 'Tap to upload PDF'}
                                    </Text>
                                    <Text style={styles.uploadBoxSub}>
                                        {uploadedFile && uploadedFile.size
                                            ? `${(uploadedFile.size / 1024).toFixed(1)} KB  ·  tap to change`
                                            : 'Max 10 MB  ·  PDF only'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Certificate request flow */}
                        {isCertificate && (
                            <>
                                <TextInput
                                    style={[styles.input, { marginTop: 4, textAlignVertical: 'top' }]}
                                    placeholder="Purpose / Reason for Request"
                                    placeholderTextColor={COLORS.muted}
                                    value={purpose}
                                    onChangeText={setPurpose}
                                    multiline
                                    numberOfLines={3}
                                />

                                <Text style={styles.fieldLabel}>Preferred delivery method</Text>

                                <TouchableOpacity
                                    style={styles.radioRow}
                                    onPress={() => setDeliveryMethod('digital')}
                                >
                                    <View style={styles.radioOuter}>
                                        {deliveryMethod === 'digital' && <View style={styles.radioInner} />}
                                    </View>
                                    <View>
                                        <Text style={styles.radioLabel}>Digital Copy (PDF)</Text>
                                        <Text style={styles.radioSub}>Sent to your tenant records</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.radioRowLast}
                                    onPress={() => setDeliveryMethod('printed')}
                                >
                                    <View style={styles.radioOuter}>
                                        {deliveryMethod === 'printed' && <View style={styles.radioInner} />}
                                    </View>
                                    <View>
                                        <Text style={styles.radioLabel}>Printed Copy</Text>
                                        <Text style={styles.radioSub}>Pick up at the admin office</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}

                        {selectedOption && (
                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                activeOpacity={0.85}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Submit Request</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* bottom nav */}
            <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 24) }]}>
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
                    isActive={false}
                    onPress={() => router.push('/tenant/profile')}
                />
            </View>

            {/* side drawer */}
            <DrawerMenu ref={drawerRef} />
        </SafeAreaView>
    );
}