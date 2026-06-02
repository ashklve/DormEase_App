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
    Animated,
    Dimensions,
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
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const firstAvailable = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const formatPaymentMethod = (method) => {
    const labels = {
        gcash: 'GCash',
        maya: 'Maya',
        bank: 'Bank Transfer',
        cash: 'Cash (Admin Office)',
    };
    const key = typeof method === 'string' ? method.toLowerCase() : method;
    return labels[key] ?? method;
};

// ── History Row (expandable) ──────────────────────────────────────────────────
const HistoryRow = ({
    month,
    amount,
    status,
    referenceNo,
    paymentDate,
    paymentMethod,
    isLast,
}) => {
    const [expanded, setExpanded] = useState(false);
    const detailAnim = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        setExpanded((current) => {
            const next = !current;

            Animated.timing(detailAnim, {
                toValue: next ? 1 : 0,
                duration: 260,
                useNativeDriver: false,
            }).start();

            return next;
        });
    };

    const key = status?.toLowerCase() ?? 'unpaid';
    const colors = STATUS_COLORS[key] ?? STATUS_COLORS.unpaid;
    const fallbackText = 'Not available';
    const dropdownMaxHeight = detailAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 260],
    });
    const dropdownOpacity = detailAnim.interpolate({
        inputRange: [0, 0.25, 1],
        outputRange: [0, 0, 1],
    });
    const dropdownTranslateY = detailAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-8, 0],
    });

    return (
        <View style={[styles.historyRowWrapper, isLast && styles.historyRowWrapperLast]}>
            {/* Main row */}
            <View style={styles.historyRow}>
                {/* Left: icon + month */}
                <View style={styles.historyRowLeft}>
                    <View style={styles.historyIconCircle}>
                        <MaterialIcons name="receipt-long" size={18} color={COLORS.white} />
                    </View>
                    <View>
                        <Text style={styles.historyMonth}>{month}</Text>
                        <View style={styles.historyBadge}>
                            <View style={[styles.historyBadgeDot, { backgroundColor: colors.dot }]} />
                            <Text style={[styles.historyBadgeText, { color: colors.text }]}>
                                {status}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Right: amount + arrow */}
                <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>{amount}</Text>
                    <TouchableOpacity
                        style={styles.historyArrowButton}
                        onPress={toggle}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={expanded ? 'Hide transaction details' : 'Show transaction details'}
                    >
                        <MaterialIcons
                            name={expanded ? 'keyboard-arrow-down' : 'chevron-right'}
                            size={24}
                            color={COLORS.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Dropdown details */}
            <Animated.View style={[styles.historyDropdown, { maxHeight: dropdownMaxHeight }]}>
                <Animated.View
                    style={[
                        styles.historyDropdownInner,
                        {
                            opacity: dropdownOpacity,
                            transform: [{ translateY: dropdownTranslateY }],
                        },
                    ]}
                >
                    <Text style={styles.transactionTitle}>Transaction Details</Text>

                    <View style={styles.historyDetailRowStrong}>
                        <Text style={styles.historyDetailLabelStrong}>Reference No.</Text>
                        <Text style={styles.historyDetailValueStrong}>
                            {referenceNo ?? fallbackText}
                        </Text>
                    </View>

                    <View style={styles.historyDetailRow}>
                        <Text style={styles.historyDetailLabel}>Payment Date</Text>
                        <Text style={styles.historyDetailValue}>{paymentDate ?? fallbackText}</Text>
                    </View>
                    <View style={styles.historyDetailRow}>
                        <Text style={styles.historyDetailLabel}>Payment Mode</Text>
                        <Text style={styles.historyDetailValue}>{paymentMethod ?? fallbackText}</Text>
                    </View>

                    <View style={styles.historyDetailDivider} />

                    <View style={styles.historyAmountPaidRow}>
                        <Text style={styles.historyAmountPaidLabel}>Amount Paid</Text>
                        <View style={styles.historyAmountPaidValueWrap}>
                            <Text style={styles.historyPesoSymbol}>₱</Text>
                            <Text style={styles.historyAmountPaidValue}>
                                {String(amount).replace('₱', '')}
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

// ── Tab Bar ───────────────────────────────────────────────────────────────────
const TabBar = ({ activeTab, onTabChange, indicatorAnim }) => {
    const indicatorLeft = indicatorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%'],
    });

    return (
        <View style={styles.tabBar}>
            {/* Animated sliding indicator */}
            <Animated.View style={[styles.tabIndicator, { left: indicatorLeft }]} />

            <TouchableOpacity
                style={styles.tabItem}
                onPress={() => onTabChange(0)}
                activeOpacity={0.8}
            >
                <MaterialIcons
                    name="receipt"
                    size={16}
                    color={activeTab === 0 ? COLORS.primary : COLORS.muted}
                    style={styles.tabIcon}
                />
                <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>
                    Bills
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tabItem}
                onPress={() => onTabChange(1)}
                activeOpacity={0.8}
            >
                <MaterialIcons
                    name="history"
                    size={16}
                    color={activeTab === 1 ? COLORS.primary : COLORS.muted}
                    style={styles.tabIcon}
                />
                <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>
                    Payment History
                </Text>
            </TouchableOpacity>
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
    const [activeTab, setActiveTab] = useState(0);

    // Animated values for tab transitions
    const indicatorAnim = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(1)).current;
    const contentTranslateX = useRef(new Animated.Value(0)).current;

    // Billing data state
    const [billing, setBilling] = useState(null);
    const [breakdown, setBreakdown] = useState(null);
    const [history, setHistory] = useState([]);

    // ── Tab change handler ────────────────────────────────────────────────────
    const handleTabChange = (index) => {
        if (index === activeTab) return;

        const direction = index > activeTab ? 1 : -1;

        // Fade + slide out current content
        Animated.parallel([
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(contentTranslateX, {
                toValue: -direction * 24,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setActiveTab(index);

            // Reset position for incoming content
            contentTranslateX.setValue(direction * 24);

            // Slide indicator
            Animated.spring(indicatorAnim, {
                toValue: index,
                useNativeDriver: false,
                tension: 60,
                friction: 10,
            }).start();

            // Fade + slide in new content
            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(contentTranslateX, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

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

    const isUnpaid = ['unpaid', 'overdue'].includes(billing?.status?.toLowerCase());

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
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

            {/* ── Tab Bar ── */}
            <TabBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                indicatorAnim={indicatorAnim}
            />

            {/* ── Content ── */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <Animated.View
                    style={[
                        styles.tabContentWrapper,
                        {
                            opacity: contentOpacity,
                            transform: [{ translateX: contentTranslateX }],
                        },
                    ]}
                >
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
                        {/* ── TAB 0: Bills ── */}
                        {activeTab === 0 && (
                            <>
                                {/* Current Billing Card */}
                                {billing ? (
                                    <View style={styles.billingCard}>
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

                                        <View style={styles.billingRow}>
                                            <Text style={styles.billingRowLabel}>Amount Due:</Text>
                                            <Text style={styles.billingAmountDue}>
                                                ₱{billing.amount_due ?? '0.00'}
                                            </Text>
                                        </View>

                                        <View style={styles.billingRow}>
                                            <Text style={styles.billingRowLabel}>Due Date:</Text>
                                            <Text style={styles.billingRowValue}>
                                                {billing.due_date ?? '—'}
                                            </Text>
                                        </View>

                                        <View style={styles.billingDivider} />

                                        <View style={styles.statusRow}>
                                            <Text style={styles.statusLabel}>Status:</Text>
                                            <StatusBadge status={billing.status ?? 'Unpaid'} />
                                        </View>

                                        <Text style={styles.billingNote}>
                                            Based on floor consumption and shared usage.
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.emptyText}>No current billing available.</Text>
                                )}

                                {/* Billing Breakdown */}
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

                                {/* Pay Bill Button */}
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
                            </>
                        )}

                        {/* ── TAB 1: Payment History ── */}
                        {activeTab === 1 && (
                            <>
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
                                                    referenceNo={firstAvailable(
                                                        item.reference_no,
                                                        item.reference_number,
                                                        item.ref_no,
                                                        item.transaction_reference,
                                                        item.transaction_id,
                                                        item.payment?.reference_no,
                                                        item.payment?.reference_number
                                                    )}
                                                    paymentDate={firstAvailable(
                                                        item.payment_date,
                                                        item.date_paid,
                                                        item.paid_at,
                                                        item.transaction_date,
                                                        item.created_at,
                                                        item.payment?.payment_date,
                                                        item.payment?.paid_at
                                                    )}
                                                    paymentMethod={formatPaymentMethod(
                                                        firstAvailable(
                                                            item.payment_method,
                                                            item.method,
                                                            item.payment_mode,
                                                            item.payment_type,
                                                            item.payment?.payment_method,
                                                            item.payment?.method,
                                                            item.payment?.payment_mode
                                                        )
                                                    )}
                                                    isLast={index === history.length - 1}
                                                />
                                            ))}
                                        </View>
                                    </>
                                ) : (
                                    <Text style={styles.emptyText}>No payment history available.</Text>
                                )}
                            </>
                        )}
                    </ScrollView>
                </Animated.View>
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
