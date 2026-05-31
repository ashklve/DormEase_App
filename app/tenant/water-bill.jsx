import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import styles from '../../src/constants/water-billstyles';
import { COLORS } from '../../src/constants/colors';
import DrawerMenu from '../../src/components/DrawerMenu';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';

const defaultPhoto = require('../../assets/def_icon.png');

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

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    paid: { dot: '#28A745', text: '#28A745' },
    unpaid: { dot: '#DC3545', text: '#DC3545' },
    overdue: { dot: '#DC3545', text: '#DC3545' },
    pending: { dot: '#D4A017', text: '#D4A017' },
    partial: { dot: '#D4A017', text: '#D4A017' },
};

const StatusBadge = ({ status }) => {
    const key = status?.toLowerCase() ?? 'unpaid';
    const colors = STATUS_COLORS[key] ?? STATUS_COLORS.unpaid;

    return (
        <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: colors.dot }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>{status ?? 'Unpaid'}</Text>
        </View>
    );
};

// ── Breakdown Row ─────────────────────────────────────────────────────────────
const BreakdownRow = ({ label, value, accent, isLast }) => (
    <View style={[styles.breakdownRow, isLast && styles.breakdownRowLast]}>
        <Text style={styles.breakdownLabel}>{label}</Text>
        <Text style={accent ? styles.breakdownValueAccent : styles.breakdownValue}>
            {value}
        </Text>
    </View>
);

// ── History Row ───────────────────────────────────────────────────────────────
const HistoryRow = ({ month, amount, status, isLast }) => {
    const key = status?.toLowerCase() ?? 'unpaid';
    const colors = STATUS_COLORS[key] ?? STATUS_COLORS.unpaid;
    return (
        <View style={[styles.historyRow, isLast && styles.historyRowLast]}>
            <Text style={styles.historyMonth}>{month}</Text>
            <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>{amount}</Text>
                <View style={styles.historyBadge}>
                    <View style={[styles.historyBadgeDot, { backgroundColor: colors.dot }]} />
                    <Text style={[styles.historyBadgeText, { color: colors.text }]}>
                        {status}
                    </Text>
                </View>
            </View>
        </View>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function WaterBillScreen() {
    const router = useRouter();
    const { user, avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const drawerRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Billing data state
    const [billing, setBilling] = useState(null);
    const [breakdown, setBreakdown] = useState(null);
    const [history, setHistory] = useState([]);

    // ── Fetch water bill data ─────────────────────────────────────────────────
    const fetchWaterBill = async () => {
        try {
            const res = await client.get('/water-bill');
            setBilling(res.data.current_billing ?? null);
            setBreakdown(res.data.breakdown ?? null);
            setHistory(res.data.payment_history ?? []);
        } catch (err) {
            const status = err.response?.status;
            if (status === 404) {
                setBilling(null);
                setBreakdown(null);
                setHistory([]);
            } else {
                console.error('fetch water bill error:', err.message);
                Alert.alert('Error', 'Failed to load water billing data.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchWaterBill();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchWaterBill();
    }, []);

    // ── Pay Bill — navigate to bills-payment screen ──────────────────────────
    const handlePayBill = () => {
        if (!billing || !isUnpaid) return;
        router.push({
            pathname: '/tenant/bills-payment',
            params: {
                billing: JSON.stringify(billing),
                breakdown: JSON.stringify(breakdown),
            },
        });
    };

    // API returns capitalized status e.g. 'Unpaid', 'Paid', 'Overdue'
    const isUnpaid = ['unpaid', 'overdue'].includes(billing?.status?.toLowerCase());

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            {/* ── Top Row ── */}
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

            {/* ── Header ── */}
            <View style={styles.headerSection}>
                <View style={styles.headerTitleRow}>
                    <View style={styles.headerIconBadge}>
                        <Ionicons name="receipt-outline" size={20} color={COLORS.white} />
                    </View>
                    <Text style={styles.headerTitle}>Water Billing</Text>
                </View>
                <Text style={styles.headerSub}>View your current share and payment status</Text>
            </View>

            {/* ── Content ── */}
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {/* ── Current Billing Card ── */}
                    {billing ? (
                        <View style={styles.billingCard}>
                            {/* Card header */}
                            <View style={styles.billingCardHeader}>
                                <Text style={styles.billingCardLabel}>
                                    Current Billing
                                </Text>
                                {billing.as_of ? (
                                    <Text style={styles.billingCardDate}>
                                        as of {billing.as_of}
                                    </Text>
                                ) : null}
                            </View>

                            {/* Amount Due */}
                            <View style={styles.billingRow}>
                                <Text style={styles.billingRowLabel}>Amount Due:</Text>
                                <Text style={styles.billingAmountDue}>
                                    ₱{billing.amount_due ?? '0.00'}
                                </Text>
                            </View>

                            {/* Due Date */}
                            <View style={styles.billingRow}>
                                <Text style={styles.billingRowLabel}>Due Date:</Text>
                                <Text style={styles.billingRowValue}>
                                    {billing.due_date ?? '—'}
                                </Text>
                            </View>

                            <View style={styles.billingDivider} />

                            {/* Status */}
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Status:</Text>
                                <StatusBadge status={billing.status ?? 'Unpaid'} />
                            </View>

                            {/* Note */}
                            <Text style={styles.billingNote}>
                                Based on floor consumption and shared usage.
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No current billing available.</Text>
                    )}

                    {/* ── Billing Breakdown ── */}
                    {breakdown ? (
                        <>
                            <Text style={styles.sectionTitle}>Billing Breakdown</Text>
                            <View style={styles.breakdownCard}>
                                <BreakdownRow
                                    label="Floor Consumption"
                                    value={`${breakdown.floor_consumption ?? '0'} m³`}
                                />
                                <BreakdownRow
                                    label="Water Rate"
                                    value={`₱${breakdown.water_rate ?? '0'} per m³`}
                                />
                                <BreakdownRow
                                    label="Total Floor Bill"
                                    value={`₱${breakdown.total_floor_bill ?? '0.00'}`}
                                />
                                <BreakdownRow
                                    label="Rooms Sharing"
                                    value={`${breakdown.rooms_sharing ?? '0'}`}
                                />
                                <BreakdownRow
                                    label="Your Room Share"
                                    value={`₱${breakdown.room_share ?? '0.00'}`}
                                    accent
                                />
                                <BreakdownRow
                                    label="Occupants in Room"
                                    value={`${breakdown.occupants ?? '0'}`}
                                    isLast
                                />
                            </View>
                        </>
                    ) : null}

                    {/* ── Payment History ── */}
                    {history.length > 0 ? (
                        <>
                            <Text style={styles.sectionTitle}>Payment History</Text>
                            <View style={styles.historyCard}>
                                {history.map((item, index) => (
                                    <HistoryRow
                                        key={item.id ?? index}
                                        month={item.month}
                                        amount={`₱${item.amount}`}
                                        status={item.status}
                                        isLast={index === history.length - 1}
                                    />
                                ))}
                            </View>
                        </>
                    ) : null}

                    {/* ── Pay Bill Button ── */}
                    {billing ? (
                        <View style={styles.payBtnWrapper}>
                            <TouchableOpacity
                                style={[
                                    styles.payBtn,
                                    !isUnpaid && styles.payBtnDisabled,
                                    { alignSelf: 'center', width: '70%' },
                                ]}
                                onPress={handlePayBill}
                                disabled={!isUnpaid}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.payBtnText}>
                                    {isUnpaid ? 'Pay Bill' : 'Already Paid'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                </ScrollView>
            )}

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
