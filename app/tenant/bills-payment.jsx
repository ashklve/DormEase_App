import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from '../../src/constants/bills-paymentstyles';
import { COLORS } from '../../src/constants/colors';
import DrawerMenu from '../../src/components/DrawerMenu';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';

const defaultPhoto = require('../../assets/def_icon.png');

// ── Payment methods ───────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
    { id: 'gcash', label: 'GCash' },
    { id: 'bank', label: 'Bank Transfer' },
    { id: 'cash', label: 'Cash (Admin Office)' },
];

// ── Status colors ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    paid: { dot: '#28A745', text: '#28A745' },
    unpaid: { dot: '#DC3545', text: '#DC3545' },
    overdue: { dot: '#DC3545', text: '#DC3545' },
    pending: { dot: '#D4A017', text: '#D4A017' },
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

// ── Breakdown Row ─────────────────────────────────────────────────────────────
const BreakdownRow = ({ label, value, accent }) => (
    <View style={styles.breakdownRow}>
        <Text style={styles.breakdownLabel}>{label}</Text>
        <Text style={accent ? styles.breakdownValueAccent : styles.breakdownValue}>
            {value}
        </Text>
    </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function BillsPaymentScreen() {
    const router = useRouter();
    const { avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const drawerRef = useRef(null);

    // Params passed from water-bill screen via router.push
    const params = useLocalSearchParams();

    // Billing data from params
    const billing = params.billing ? JSON.parse(params.billing) : null;
    const breakdown = params.breakdown ? JSON.parse(params.breakdown) : null;

    const [selectedMethod, setSelectedMethod] = useState('gcash');

    // ── Status badge ──────────────────────────────────────────────────────────
    const statusKey = billing?.status?.toLowerCase() ?? 'unpaid';
    const statusColors = STATUS_COLORS[statusKey] ?? STATUS_COLORS.unpaid;

    // ── Handle proceed — navigate to payment detail screen ──────────────────
    const handleProceed = () => {
        if (!billing) return;
        router.push({
            pathname: '/tenant/payment-detail',
            params: {
                billing: JSON.stringify(billing),
                breakdown: JSON.stringify(breakdown),
                method: selectedMethod,
            },
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

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
                <Text style={styles.headerSub}>Choose to pay via QR code or settle in person</Text>
            </View>

            {/* ── Content ── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                ]}
            >
                {/* ── Billing Summary Card ── */}
                {billing ? (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryCardLabel}>Billing Summary</Text>

                        {/* Amount Due */}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Amount Due:</Text>
                            <Text style={styles.summaryAmountDue}>₱{billing.amount_due}</Text>
                        </View>

                        {/* Due Date */}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Due Date:</Text>
                            <Text style={styles.summaryValue}>{billing.due_date ?? '—'}</Text>
                        </View>

                        {parseFloat(billing.past_due_amount || 0) > 0 && (
                            <>
                                <View style={styles.summaryDivider} />
                                <BreakdownRow
                                    label="Current Month Charges"
                                    value={`₱${billing.current_charges ?? '0.00'}`}
                                />
                                <BreakdownRow
                                    label="Past Due Balance"
                                    value={`₱${billing.past_due_amount ?? '0.00'}`}
                                    accent
                                />
                            </>
                        )}

                        <View style={styles.summaryDivider} />

                        {/* Status */}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Status:</Text>
                            <View style={styles.statusBadge}>
                                <View style={[styles.statusDot, { backgroundColor: statusColors.dot }]} />
                                <Text style={[styles.statusText, { color: statusColors.text }]}>
                                    {billing.status}
                                </Text>
                            </View>
                        </View>

                        {/* Breakdown divider */}
                        {breakdown ? (
                            <>
                                <View style={styles.summaryDivider} />
                                <BreakdownRow
                                    label="Floor Consumption"
                                    value={`${breakdown.floor_consumption} m³`}
                                />
                                <BreakdownRow
                                    label="Water Rate"
                                    value={`₱${breakdown.water_rate} per m³`}
                                />
                                <BreakdownRow
                                    label="Total Floor Bill"
                                    value={`₱${breakdown.total_floor_bill}`}
                                />
                                <BreakdownRow
                                    label="Rooms Sharing"
                                    value={`${breakdown.rooms_sharing}`}
                                />
                                <BreakdownRow
                                    label="Your Room Share"
                                    value={`₱${breakdown.room_share}`}
                                    accent
                                />
                                <BreakdownRow
                                    label="Occupants in Room"
                                    value={`${breakdown.occupants}`}
                                />
                            </>
                        ) : null}
                    </View>
                ) : (
                    <Text style={{ textAlign: 'center', color: COLORS.muted, marginTop: 40 }}>
                        No billing data available.
                    </Text>
                )}

                {/* ── Payment Method ── */}
                <Text style={styles.sectionTitle}>Choose Payment Method</Text>
                <View style={styles.paymentMethodCard}>
                    {PAYMENT_METHODS.map((method, index) => {
                        const isSelected = selectedMethod === method.id;
                        const isLast = index === PAYMENT_METHODS.length - 1;
                        return (
                            <React.Fragment key={method.id}>
                                <TouchableOpacity
                                    style={[
                                        styles.paymentOption,
                                        isSelected && styles.paymentOptionSelected,
                                    ]}
                                    onPress={() => setSelectedMethod(method.id)}
                                    activeOpacity={0.7}
                                >
                                    {/* Radio button */}
                                    <View style={[
                                        styles.radioOuter,
                                        isSelected && styles.radioOuterSelected,
                                    ]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                    <Text style={[
                                        styles.paymentOptionText,
                                        isSelected && styles.paymentOptionTextSelected,
                                    ]}>
                                        {method.label}
                                    </Text>
                                </TouchableOpacity>
                                {!isLast && <View style={styles.paymentOptionDivider} />}
                            </React.Fragment>
                        );
                    })}
                </View>

                {/* ── Proceed Button ── */}
                <View style={styles.proceedBtnWrapper}>
                    <TouchableOpacity
                        style={[
                            styles.proceedBtn,
                            { alignSelf: 'center', width: '70%' },
                            !billing && styles.proceedBtnDisabled,
                        ]}
                        onPress={handleProceed}
                        disabled={!billing}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.proceedBtnText}>Proceed</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

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

            {/* ── Drawer ── */}
            <DrawerMenu ref={drawerRef} />

        </SafeAreaView>
    );
}