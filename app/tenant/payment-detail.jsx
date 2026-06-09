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
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import styles from '../../src/constants/payment-detailstyles';
import { scale, verticalScale, moderateScale } from '../../src/utils/scale';
import { COLORS } from '../../src/constants/colors';
import DrawerMenu from '../../src/components/DrawerMenu';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';

const defaultPhoto = require('../../assets/def_icon.png');

// ── QR images — replace these with your client's actual QR assets ─────────────
// Place the QR images in assets/ and update the paths below
const QR_IMAGES = {
    gcash: require('../../assets/qr_gcash.jpg'),
    maya: require('../../assets/qr_maya.png'),
    bank: require('../../assets/qr_bank.png'),
};
const QR_FILE_NAMES = {
    gcash: 'dormease-gcash-qr.jpg',
    maya: 'dormease-maya-qr.png',
    bank: 'dormease-bank-qr.png',
};

const QR_HINTS = {
    gcash: 'Open GCash → Scan QR → Enter Exact Amount → Confirm Payment',
    maya: 'Open Maya → Scan QR → Enter Exact Amount → Confirm Payment',
    bank: 'Open your Banking App → Scan QR → Enter Exact Amount → Confirm Transfer',
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
export default function PaymentDetailScreen() {
    const router = useRouter();
    const { user, avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const drawerRef = useRef(null);

    // Params from bills-payment screen
    const params = useLocalSearchParams();
    const billing = params.billing ? JSON.parse(params.billing) : null;
    const breakdown = params.breakdown ? JSON.parse(params.breakdown) : null;
    const paymentMethod = params.method ?? 'gcash';
    const roomNumber = breakdown?.room_number ?? billing?.room_number ?? user?.room_number;

    const isCash = paymentMethod === 'cash';
    const methodLabel = {
        gcash: 'GCash',
        maya: 'Maya',
        bank: 'Bank Transfer',
        cash: 'Cash (Admin Office)',
    }[paymentMethod] ?? 'GCash';

    // ── Form state
    const [proofUri, setProofUri] = useState(null);
    const [refNumber, setRefNumber] = useState('');
    const [refFocused, setRefFocused] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [downloadingQr, setDownloadingQr] = useState(false);

    // ── Upload proof of payment ───────────────────────────────────────────────
    const handleUploadProof = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please allow access to your photo library.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.85,
            });
            if (!result.canceled) setProofUri(result.assets[0].uri);
        } catch (err) {
            console.error('upload proof error:', err);
        }
    };

    const handleDownloadQr = async () => {
        const qrImage = QR_IMAGES[paymentMethod];
        const fileName = QR_FILE_NAMES[paymentMethod] ?? `dormease-${paymentMethod}-qr.png`;

        if (!qrImage) {
            Alert.alert('QR Not Available', 'No QR code is available for this payment method.');
            return;
        }

        setDownloadingQr(true);
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow media access to save the QR code.');
                return;
            }

            const asset = Asset.fromModule(qrImage);
            await asset.downloadAsync();

            const sourceUri = asset.localUri ?? asset.uri;
            const sourceFile = new File(sourceUri);
            const targetFile = new File(Paths.cache, fileName);

            if (targetFile.exists) {
                targetFile.delete();
            }
            sourceFile.copy(targetFile);

            const savedAsset = await MediaLibrary.createAssetAsync(targetFile.uri);
            await MediaLibrary.createAlbumAsync('DormEase', savedAsset, false);

            Alert.alert('QR Downloaded', `${methodLabel} QR code was saved to your gallery.`);
        } catch (err) {
            console.error('download qr error:', err);
            Alert.alert('Download Failed', 'Unable to save the QR code. Please try again.');
        } finally {
            setDownloadingQr(false);
        }
    };

    // ── Submit payment ────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!isCash && !proofUri) {
            Alert.alert('Missing Proof', 'Please upload a screenshot of your payment confirmation.');
            return;
        }
        if (!isCash && !refNumber.trim()) {
            Alert.alert('Missing Reference', 'Please enter the reference number from your payment.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('billing_id', billing?.id);
            formData.append('payment_method', paymentMethod);
            formData.append('reference_code', refNumber.trim());

            if (proofUri) {
                const filename = proofUri.split('/').pop();
                const extension = filename.split('.').pop().toLowerCase();
                const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('proof_of_payment', {
                    uri: proofUri,
                    name: filename,
                    type: mimeType,
                });
            }

            await client.post('/water-bill/pay', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert(
                '✅ Payment Submitted',
                'Your payment has been submitted and is pending admin confirmation. You will be notified once it is approved.',
                [{
                    text: 'Done',
                    onPress: () => router.push('/tenant/water-bill'),
                }]
            );
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Failed to submit payment. Please try again.';
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
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
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

                {/* ── Header ── */}
                <View style={styles.headerSection}>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.headerIconBadge}>
                            <Ionicons name="card-outline" size={20} color={COLORS.white} />
                        </View>
                        <Text style={styles.headerTitle}>Bills Payment</Text>
                    </View>
                    <Text style={styles.headerSub}>
                        Choose to pay via QR code or settle in person
                    </Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    automaticallyAdjustKeyboardInsets={true}
                >
                    {/* ── Billing Summary ── */}
                    {billing && (
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryCardLabel}>Billing Summary</Text>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Amount Due:</Text>
                                <Text style={styles.summaryAmountDue}>₱{billing.amount_due}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Billing Month:</Text>
                                <Text style={styles.summaryValue}>{billing.billing_period}</Text>
                            </View>
                            {roomNumber ? (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Room:</Text>
                                    <Text style={styles.summaryValue}>{roomNumber}</Text>
                                </View>
                            ) : null}
                        </View>
                    )}

                    {/* ── CASH: instruction card ── */}
                    {isCash ? (
                        <View style={styles.stepSection}>
                            <View style={styles.cashCard}>
                                <View style={styles.cashIconRow}>
                                    <View style={styles.cashIconCircle}>
                                        <MaterialIcons name="store" size={20} color={COLORS.white} />
                                    </View>
                                    <Text style={styles.cashTitle}>Pay at Admin Office</Text>
                                </View>
                                <Text style={styles.cashInstruction}>
                                    Please visit the{' '}
                                    <Text style={styles.cashHighlight}>Admin Office on the 2nd Floor</Text>
                                    {' '}to settle your water bill in person. Bring a valid ID and present your billing details to the staff.
                                </Text>
                                <Text style={styles.cashInstruction}>
                                    Make sure to pay{' '}
                                    <Text style={styles.cashHighlight}>before the due date</Text>
                                    {' '}to avoid additional charges or penalties.
                                </Text>
                                {billing?.due_date ? (
                                    <View style={styles.cashDueDateBox}>
                                        <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                                        <Text style={styles.cashDueDateText}>
                                            Due Date: {billing.due_date}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    ) : (
                        <>
                            {/* ── Step 1: Scan QR ── */}
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Step 1: Scan QR Code</Text>
                                <View style={styles.qrCard}>
                                    {/* Download icon top-right */}
                                    <TouchableOpacity
                                        style={styles.qrDownloadBtn}
                                        onPress={handleDownloadQr}
                                        disabled={downloadingQr}
                                        activeOpacity={0.75}
                                    >
                                        {downloadingQr ? (
                                            <ActivityIndicator size="small" color={COLORS.primary} />
                                        ) : (
                                            <Ionicons name="download-outline" size={20} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                    <Image
                                        source={QR_IMAGES[paymentMethod]}
                                        style={styles.qrImage}
                                    />
                                    <Text style={styles.qrHint}>
                                        {QR_HINTS[paymentMethod]}
                                    </Text>
                                </View>
                            </View>

                            {/* ── Step 2: Upload Proof ── */}
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Step 2: Upload Proof of Payment</Text>
                                <TouchableOpacity
                                    style={[styles.uploadBox, proofUri && styles.uploadBoxWithImage]}
                                    onPress={handleUploadProof}
                                    activeOpacity={0.75}
                                >
                                    {proofUri ? (
                                        <Image
                                            source={{ uri: proofUri }}
                                            style={styles.uploadedImage}
                                        />
                                    ) : (
                                        <>
                                            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
                                            <Text style={styles.uploadText}>Upload Screenshot / Photo</Text>
                                            <Text style={styles.uploadHint}>
                                                Upload screenshot of GCash receipt / photo of payment confirmation
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                {proofUri ? (
                                    <TouchableOpacity
                                        onPress={handleUploadProof}
                                        style={{ marginTop: verticalScale(6), alignSelf: 'flex-end' }}
                                    >
                                        <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>
                                            Change Photo
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            {/* ── Step 3: Reference Number ── */}
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Step 3: Enter Reference Code</Text>
                                <TextInput
                                    style={[styles.refInput, refFocused && styles.refInputFocused]}
                                    placeholder="Reference Number"
                                    placeholderTextColor={COLORS.muted}
                                    value={refNumber}
                                    onChangeText={setRefNumber}
                                    onFocus={() => setRefFocused(true)}
                                    onBlur={() => setRefFocused(false)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </>
                    )}

                    {/* ── Submit Button ── */}
                    <View style={styles.submitBtnWrapper}>
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { alignSelf: 'center', width: '70%' },
                                submitting && styles.submitBtnDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={submitting}
                            activeOpacity={0.85}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitBtnText}>Submit</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

            {/* ── Bottom Nav ── */}
            <View style={[
                styles.bottomNav,
                { paddingBottom: Math.max(insets.bottom, 24) },
            ]}>
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
                    isActive={true}
                    onPress={() => router.push('/tenant/water-bill')}
                />
                <NavItem
                    iconName="account-circle"
                    label="Profile"
                    isActive={false}
                    onPress={() => router.push('/tenant/profile')}
                />
            </View>

            <DrawerMenu ref={drawerRef} />

        </SafeAreaView>
    );
}
