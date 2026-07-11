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
    Clipboard,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library/legacy';
import styles from '../../src/constants/payment-detailstyles';
import { scale, verticalScale, moderateScale } from '../../src/utils/scale';
import { COLORS } from '../../src/constants/colors';
import DrawerMenu from '../../src/components/DrawerMenu';
import BottomNavigation from '../../src/components/BottomNavigation';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';
import * as WebBrowser from 'expo-web-browser';

const defaultPhoto = require('../../assets/def_icon.png');

// ── QR images — GCash only ────────────────────────────────────────────────────
const QR_IMAGES = {
    gcash: require('../../assets/qr_gcash.jpg'),
};
const QR_FILE_NAMES = {
    gcash: 'dormease-gcash-qr.jpg',
};

const QR_HINTS = {
    gcash: 'Open GCash → Scan QR → Enter Exact Amount → Confirm Payment',
};

// ── Bank account details — update with your actual bank info ─────────────────
const BANK_DETAILS = {
    bankName: 'BDO Unibank',
    accountName: 'DormEase Properties Inc.',
    accountNumber: '1234 5678 9012',
    accountType: 'Savings Account',
};



// ── Bank Detail Row ───────────────────────────────────────────────────────────
const BankDetailRow = ({ label, value, copyable }) => {
    const handleCopy = () => {
        Clipboard.setString(value);
        Alert.alert('Copied', `${label} copied to clipboard.`);
    };

    return (
        <View style={styles.bankDetailRow}>
            <View style={styles.bankDetailLeft}>
                <Text style={styles.bankDetailLabel}>{label}</Text>
                <Text style={styles.bankDetailValue}>{value}</Text>
            </View>
            {copyable && (
                <TouchableOpacity style={styles.bankCopyBtn} onPress={handleCopy} activeOpacity={0.7}>
                    <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

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
    const isBank = paymentMethod === 'bank';
    const methodLabel = {
        gcash: 'QR Ph (GCash, Maya, Banks, etc.)',
        bank: 'Bank Transfer',
        cash: 'Cash (Admin Office)',
    }[paymentMethod] ?? 'QR Ph (GCash, Maya, Banks, etc.)';

    // ── Form state
    const [proofUri, setProofUri] = useState(null);
    const [refNumber, setRefNumber] = useState('');
    const [refFocused, setRefFocused] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [downloadingQr, setDownloadingQr] = useState(false);
    const [launchingPaymongo, setLaunchingPaymongo] = useState(false);

    const baseAmount = parseFloat(billing?.amount_due || billing?.amount_paid || 0);
    const totalAmount = parseFloat((baseAmount / 0.984992).toFixed(2));
    const surchargeAmount = parseFloat((totalAmount - baseAmount).toFixed(2));

    const handlePayOnline = async () => {
        setLaunchingPaymongo(true);
        global.paymentRedirected = false;
        try {
            const res = await client.post('/water-bill/checkout', {
                billing_id: billing?.id ?? billing?.billing_id,
            });
            
            if (res.data && res.data.checkout_url) {
                await WebBrowser.openBrowserAsync(res.data.checkout_url);
                
                // Wait briefly to check if a deep link success/cancelled screen has handled this.
                // If not, redirect directly to the water bill screen.
                setTimeout(() => {
                    if (!global.paymentRedirected) {
                        router.replace('/tenant/water-bill');
                    }
                }, 150);
            } else {
                Alert.alert('Error', 'Invalid response from payment gateway.');
            }
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Failed to connect to payment gateway. Please try again.';
            Alert.alert('Gateway Error', msg);
        } finally {
            setLaunchingPaymongo(false);
        }
    };

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
            if (!result.canceled) {
                const asset = result.assets[0];
                const uri = asset.uri;
                const extension = uri.split('.').pop().toLowerCase();
                if (extension !== 'jpg' && extension !== 'jpeg' && extension !== 'png') {
                    Alert.alert('Invalid File Type', 'Only JPG and PNG images are allowed.');
                    return;
                }
                if (asset.fileSize && asset.fileSize > 4 * 1024 * 1024) {
                    Alert.alert('File Too Large', 'The payment proof image must be smaller than 4 MB.');
                    return;
                }
                setProofUri(uri);
            }
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
            const errors = err.response?.data?.errors;
            const msg = errors
                ? Object.values(errors).flat().join('\n')
                : (err.response?.data?.message ?? 'Failed to submit payment. Please try again.');
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
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="chevron-left" size={22} color={COLORS.dark} />
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
                                <Text style={styles.summaryLabel}>Total Amount Due:</Text>
                                <Text style={styles.summaryAmountDue}>₱{billing.amount_due}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Billing Month:</Text>
                                <Text style={styles.summaryValue}>{billing.billing_period}</Text>
                            </View>
                            {parseFloat(billing.past_due_amount || 0) > 0 && (
                                <>
                                    <View style={styles.summaryDivider} />
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Current Month:</Text>
                                        <Text style={styles.summaryValue}>₱{billing.current_charges ?? '0.00'}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Past Due Balance:</Text>
                                        <Text style={styles.summaryValueAccent}>₱{billing.past_due_amount ?? '0.00'}</Text>
                                    </View>
                                </>
                            )}
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

                    ) : isBank ? (
                        <>
                            {/* ── BANK: Step 1 — Account Details ── */}
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Step 1: Transfer to Bank Account</Text>
                                <View style={styles.bankCard}>
                                    <View style={styles.bankCardHeader}>
                                        <View style={styles.bankIconCircle}>
                                            <MaterialIcons name="account-balance" size={18} color={COLORS.white} />
                                        </View>
                                        <View>
                                            <Text style={styles.bankCardTitle}>{BANK_DETAILS.bankName}</Text>
                                            <Text style={styles.bankCardSubtitle}>{BANK_DETAILS.accountType}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.bankDivider} />

                                    <BankDetailRow
                                        label="Account Name"
                                        value={BANK_DETAILS.accountName}
                                        copyable={false}
                                    />
                                    <BankDetailRow
                                        label="Account Number"
                                        value={BANK_DETAILS.accountNumber}
                                        copyable={true}
                                    />

                                    <View style={styles.bankAmountNotice}>
                                        <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                                        <Text style={styles.bankAmountNoticeText}>
                                            Transfer the{' '}
                                            <Text style={{ fontWeight: '700', color: COLORS.primary }}>
                                                exact amount due
                                            </Text>
                                            {' '}to avoid payment discrepancies.
                                        </Text>
                                    </View>
                                </View>

                                {/* How-to steps */}
                                <View style={styles.bankStepsCard}>
                                    <Text style={styles.bankStepsTitle}>How to transfer</Text>
                                    {[
                                        'Open your banking app (BDO, BPI, UnionBank, etc.)',
                                        'Go to Transfer → Other Bank or Inter-bank Transfer',
                                        'Enter the account number above and the exact amount due',
                                        'Confirm the transfer and save the receipt',
                                    ].map((step, i) => (
                                        <View key={i} style={styles.bankStepRow}>
                                            <View style={styles.bankStepBullet}>
                                                <Text style={styles.bankStepBulletText}>{i + 1}</Text>
                                            </View>
                                            <Text style={styles.bankStepText}>{step}</Text>
                                        </View>
                                    ))}
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
                                                Upload a screenshot or photo of your bank transfer confirmation
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
                                <Text style={styles.stepTitle}>Step 3: Enter Reference / Trace Number</Text>
                                <TextInput
                                    style={[styles.refInput, refFocused && styles.refInputFocused]}
                                    placeholder="Bank Transfer Reference / Trace Number"
                                    placeholderTextColor={COLORS.muted}
                                    value={refNumber}
                                    onChangeText={setRefNumber}
                                    onFocus={() => setRefFocused(true)}
                                    onBlur={() => setRefFocused(false)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </>

                    ) : (
                        <>
                            {/* ── ONLINE PAYMENT BREAKDOWN ── */}
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Payment Method: Unified QR Ph</Text>
                                <View style={styles.bankCard}>
                                    <View style={styles.bankCardHeader}>
                                        <View style={styles.bankIconCircle}>
                                            <Ionicons name="qr-code-outline" size={18} color={COLORS.white} />
                                        </View>
                                        <View>
                                            <Text style={styles.bankCardTitle}>Scan to Pay via QR Ph</Text>
                                            <Text style={styles.bankCardSubtitle}>Supports GCash, Maya, & Bank Apps</Text>
                                        </View>
                                    </View>

                                    <View style={styles.bankDivider} />

                                    <View style={{ paddingVertical: 4 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
                                            <Text style={{ color: COLORS.muted, fontSize: 13 }}>Water Bill Amount</Text>
                                            <Text style={{ color: COLORS.dark, fontSize: 13, fontWeight: '500' }}>₱{baseAmount.toFixed(2)}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
                                            <Text style={{ color: COLORS.muted, fontSize: 13 }}>Convenience Fee (1.34% Surcharge)</Text>
                                            <Text style={{ color: COLORS.dark, fontSize: 13, fontWeight: '500' }}>₱{surchargeAmount.toFixed(2)}</Text>
                                        </View>
                                        <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 8 }} />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
                                            <Text style={{ color: COLORS.dark, fontSize: 14, fontWeight: '600' }}>Total Amount Due</Text>
                                            <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: '700' }}>₱{totalAmount.toFixed(2)}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.bankAmountNotice}>
                                        <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                                        <Text style={styles.bankAmountNoticeText}>
                                            The convenience fee is charged by the secure digital payment gateway to process the transaction.
                                        </Text>
                                    </View>
                                </View>

                                {/* Instructions */}
                                <View style={styles.bankStepsCard}>
                                    <Text style={styles.bankStepsTitle}>How to pay:</Text>
                                    {[
                                         'Click the "Proceed to Online Payment" button below.',
                                         'A secure window will open displaying your unified QR Ph code.',
                                         'Scan the QR code on screen or upload a saved screenshot to GCash, Maya, or your bank app.',
                                         'Complete the payment. The system will mark the bill PAID instantly.'
                                    ].map((step, i) => (
                                        <View key={i} style={styles.bankStepRow}>
                                            <View style={styles.bankStepBullet}>
                                                <Text style={styles.bankStepBulletText}>{i + 1}</Text>
                                            </View>
                                            <Text style={styles.bankStepText}>{step}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}

                    {/* ── Submit / Checkout Button ── */}
                    <View style={styles.submitBtnWrapper}>
                        {!isCash && !isBank ? (
                            <TouchableOpacity
                                style={[
                                    styles.submitBtn,
                                    { alignSelf: 'center', width: '70%', backgroundColor: COLORS.primary },
                                    launchingPaymongo && styles.submitBtnDisabled,
                                ]}
                                onPress={handlePayOnline}
                                disabled={launchingPaymongo}
                                activeOpacity={0.85}
                            >
                                {launchingPaymongo ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <Text style={styles.submitBtnText}>Proceed to Online Payment</Text>
                                )}
                            </TouchableOpacity>
                        ) : (
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
                        )}
                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

            <BottomNavigation activeTab="billing" />

            <DrawerMenu ref={drawerRef} />

        </SafeAreaView>
    );
}