import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    ActivityIndicator,
    Animated,
    Alert,
    PanResponder,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import styles, { COLORS } from '../../src/constants/emergencyhistorystyles';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';
import PremiumPullToRefresh from '../../src/components/PremiumPullToRefresh';
import LoadingOverlay from '../../src/components/LoadingOverlay';

const defaultPhoto = require('../../assets/def_icon.png');

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['All', 'Active', 'Resolved', 'Closed'];
const URGENCY_OPTIONS = ['All Urgency', 'Moderate', 'Urgent', 'Critical'];

const STATUS_STYLE = {
    active: { bg: '#FEE2E2', text: '#B91C1C' },
    resolved: { bg: '#DCFCE7', text: '#15803D' },
    closed: { bg: '#F3F4F6', text: '#4B5563' },
};

const URGENCY_STYLE = {
    critical: { bg: '#FEE2E2', text: '#991B1B' },
    urgent: { bg: '#FFEDD5', text: '#C2410C' },
    moderate: { bg: '#FEF3C7', text: '#92400E' },
};

const STATUS_ACCENT = {
    active: '#DC2626',
    resolved: '#16A34A',
    closed: '#9CA3AF',
};

const CATEGORY_ICON = {
    'Medical': 'medical-bag',
    'Fire/Smoke': 'fire',
    'Electrical Hazard': 'lightning-bolt',
    'Security': 'shield-account',
    'Flood/Water Leak': 'pipe-leak',
    'Other': 'dots-horizontal-circle',
    'Panic Alert': 'alert',
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
};

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const mapEmergencyReport = (report) => ({
    id: report.id,
    req_id: `EMG-${String(report.id ?? '').padStart(3, '0')}`,
    title: report.is_panic_alert ? 'Panic Alert' : (report.emergency_type || 'Emergency Report'),
    category: report.is_panic_alert ? 'Panic Alert' : (report.emergency_type || 'Other'),
    status: report.status || 'active',
    urgency: report.urgency_level || 'moderate',
    date_submitted: formatDate(report.reported_at),
    reported_at: report.reported_at,
    resolved_at: report.resolved_at,
    description: report.description,
    location: report.location,
    admin_notes: report.admin_notes || null,
});

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

// ── Swipeable Wrapper ────────────────────────────────────────────────────────
const SwipeableWrapper = ({ children, onAction, actionIconName }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [isOpen, setIsOpen] = useState(false);
    const actionWidth = 80;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 5 && Math.abs(gestureState.dy) < 8;
            },
            onPanResponderGrant: () => {
                translateX.setOffset(isOpen ? -actionWidth : 0);
                translateX.setValue(0);
            },
            onPanResponderMove: (_, gestureState) => {
                let currentPos = (isOpen ? -actionWidth : 0) + gestureState.dx;
                if (currentPos > 0) {
                    currentPos = 0;
                } else if (currentPos < -actionWidth - 20) {
                    currentPos = -actionWidth - 20 + (currentPos + actionWidth + 20) * 0.2;
                }
                translateX.setValue(currentPos - (isOpen ? -actionWidth : 0));
            },
            onPanResponderRelease: (_, gestureState) => {
                translateX.flattenOffset();
                const currentPos = translateX._value;
                let toValue = 0;
                let nextOpen = false;

                if (!isOpen && currentPos < -10) {
                    toValue = -actionWidth;
                    nextOpen = true;
                } else if (isOpen && currentPos > -actionWidth + 10) {
                    toValue = 0;
                    nextOpen = false;
                } else if (isOpen) {
                    toValue = -actionWidth;
                    nextOpen = true;
                }

                setIsOpen(nextOpen);
                Animated.spring(translateX, {
                    toValue,
                    useNativeDriver: true,
                    damping: 18,
                    stiffness: 150,
                    mass: 0.9,
                }).start();
            },
            onPanResponderTerminate: () => {
                Animated.spring(translateX, {
                    toValue: isOpen ? -actionWidth : 0,
                    useNativeDriver: true,
                    damping: 18,
                    stiffness: 150,
                    mass: 0.9,
                }).start();
            }
        })
    ).current;

    const handleActionPress = () => {
        setIsOpen(false);
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 150,
            mass: 0.9,
        }).start();
        onAction();
    };

    return (
        <View style={styles.swipeContainer}>
            <View style={styles.swipeActionContainer}>
                <TouchableOpacity
                    style={styles.swipeActionButton}
                    onPress={handleActionPress}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name={actionIconName} size={24} color="#D63375" />
                </TouchableOpacity>
            </View>

            <Animated.View
                style={{ transform: [{ translateX }] }}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        </View>
    );
};

// ── Request Card ──────────────────────────────────────────────────────────────
const RequestCard = ({ item, onDelete }) => {
    const statusKey = item.status?.toLowerCase();
    const urgencyKey = item.urgency?.toLowerCase();
    const isCritical = urgencyKey === 'critical' || urgencyKey === 'urgent';

    // Resolved/Closed cards start collapsed; Active starts expanded
    const isClosedStatus = statusKey === 'resolved' || statusKey === 'closed';
    const [expanded, setExpanded] = useState(!isClosedStatus);
    const rotateAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

    const toggle = () => {
        const toValue = expanded ? 0 : 1;
        Animated.timing(rotateAnim, {
            toValue,
            duration: 220,
            useNativeDriver: true,
        }).start();
        setExpanded(!expanded);
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const ss = STATUS_STYLE[statusKey] ?? STATUS_STYLE.active;
    const us = URGENCY_STYLE[urgencyKey] ?? URGENCY_STYLE.moderate;
    const accentColor = STATUS_ACCENT[statusKey] ?? COLORS.primary;

    const statusLabel = item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
        : 'Active';
    const urgencyLabel = item.urgency
        ? item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)
        : 'Moderate';

    const categoryIcon = CATEGORY_ICON[item.category] ?? 'dots-horizontal-circle';

    const handleDelete = () => {
        Alert.alert(
            'Remove from History',
            'Are you sure you want to remove this resolved emergency report from your history?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => onDelete(item.id),
                },
            ]
        );
    };

    const cardContent = (
        <View style={[styles.requestCard, { borderLeftColor: accentColor }]}>
            {/* ── Card Header ── */}
            <View style={styles.cardHeader}>
                {/* Category chip + req id row */}
                <View style={styles.chipIdRow}>
                    <View style={styles.categoryChip}>
                        <MaterialCommunityIcons name={categoryIcon} size={12} color={COLORS.primary} />
                        <Text style={styles.categoryChipText}>{item.category}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {isCritical && (
                            <View style={styles.criticalBadge}>
                                <Text style={styles.criticalText}>CRITICAL</Text>
                            </View>
                        )}
                        <View style={styles.reqIdPill}>
                            <MaterialIcons name="tag" size={11} color={COLORS.muted} />
                            <Text style={styles.reqIdPillText}>{item.req_id}</Text>
                        </View>
                    </View>
                </View>

                {/* Title + collapse button */}
                <View style={styles.cardTitleRow}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {isCritical && (
                            <View style={styles.pulseDot} />
                        )}
                        <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>
                    <TouchableOpacity style={styles.collapseBtn} onPress={toggle}>
                        <Animated.View style={{ transform: [{ rotate }] }}>
                            <MaterialIcons name="expand-less" size={20} color={COLORS.primary} />
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                {/* Status + Urgency badges */}
                <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                        <View style={styles.badgeInner}>
                            <View style={[styles.badgeDot, { backgroundColor: ss.text }]} />
                            <Text style={[styles.badgeText, { color: ss.text }]}>{statusLabel}</Text>
                        </View>
                    </View>
                    <View style={[styles.badge, { backgroundColor: us.bg }]}>
                        <Text style={[styles.badgeText, { color: us.text }]}>{urgencyLabel} Urgency</Text>
                    </View>
                </View>
            </View>

            {/* ── Divider (only when expanded) ── */}
            {expanded && <View style={styles.cardDivider} />}

            {/* ── Expandable Body ── */}
            {expanded && (
                <View style={styles.cardBody}>
                    <View style={styles.bodyDetailCard}>
                        <View style={styles.bodyDetailHeader}>
                            <MaterialIcons name="location-on" size={14} color={COLORS.primary} />
                            <Text style={styles.bodyDetailLabel}>Location</Text>
                        </View>
                        <Text style={styles.bodyDetailValue}>{item.location || 'Not specified'}</Text>
                    </View>

                    <View style={styles.bodyDetailCard}>
                        <View style={styles.bodyDetailHeader}>
                            <MaterialIcons name="chat-bubble-outline" size={13} color={COLORS.primary} />
                            <Text style={styles.bodyDetailLabel}>Description</Text>
                        </View>
                        <Text style={styles.bodyDetailValue}>{item.description || 'No description provided.'}</Text>
                    </View>

                    {item.resolved_at && (
                        <View style={styles.bodyDetailCard}>
                            <View style={styles.bodyDetailHeader}>
                                <MaterialIcons name="check-circle" size={13} color="#15803D" />
                                <Text style={[styles.bodyDetailLabel, { color: '#15803D' }]}>Resolved Date</Text>
                            </View>
                            <Text style={styles.bodyDetailValue}>{formatDateTime(item.resolved_at)}</Text>
                        </View>
                    )}

                    {/* Admin response notes section */}
                    <View style={styles.adminResponseCard}>
                        <View style={styles.adminResponseHeader}>
                            <MaterialIcons name="support-agent" size={16} color={COLORS.primary} />
                            <Text style={styles.adminResponseTitle}>Staff Response Notes</Text>
                        </View>
                        {item.admin_notes ? (
                            <Text style={styles.adminResponseText}>{item.admin_notes}</Text>
                        ) : (
                            <Text style={[styles.adminResponseText, { color: COLORS.muted, fontStyle: 'italic' }]}>
                                No response notes from staff yet.
                            </Text>
                        )}
                    </View>
                </View>
            )}

            {/* Divider (only when expanded) */}
            {expanded && <View style={styles.cardDivider} />}

            {/* Card Footer */}
            <View style={styles.cardFooter}>
                <View style={styles.footerDateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#4B5563" />
                    <Text style={styles.footerDate}>Reported {item.date_submitted}</Text>
                </View>
                <TouchableOpacity onPress={toggle}>
                    <Text style={styles.footerToggleText}>
                        {expanded ? 'Hide details' : 'View details'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (statusKey === 'active') {
        return cardContent;
    }

    return (
        <SwipeableWrapper onAction={handleDelete} actionIconName="delete-outline">
            {cardContent}
        </SwipeableWrapper>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function EmergencyHistoryScreen() {
    const router = useRouter();
    const { user, avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const pullToRefreshRef = useRef(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Filter states
    const [activeStatus, setActiveStatus] = useState('All');
    const [activeUrgency, setActiveUrgency] = useState('All Urgency');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showUrgencyDropdown, setShowUrgencyDropdown] = useState(false);

    // Derived statistics
    const totalCount = reports.length;
    const activeCount = reports.filter(r => r.status?.toLowerCase() === 'active').length;
    const resolvedCount = reports.filter(r => r.status?.toLowerCase() === 'resolved').length;
    const closedCount = reports.filter(r => r.status?.toLowerCase() === 'closed').length;

    // Filtered list
    const filteredReports = reports.filter((r) => {
        const statusMatch = activeStatus === 'All' || r.status?.toLowerCase() === activeStatus.toLowerCase();
        const urgencyMatch = activeUrgency === 'All Urgency' || r.urgency?.toLowerCase() === activeUrgency.toLowerCase();
        return statusMatch && urgencyMatch;
    });

    const fetchReports = useCallback(async () => {
        try {
            const res = await client.get('/emergency', { timeout: 15000 });
            const apiReports = Array.isArray(res.data?.reports) ? res.data.reports : [];
            setReports(apiReports.map(mapEmergencyReport));
        } catch (err) {
            console.error('fetch emergency logs error:', err.response?.data ?? err.message);
            setReports([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchReports();
        }, [fetchReports])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReports();
    }, [fetchReports]);

    const handleDeleteReport = useCallback(async (reportId) => {
        try {
            await client.delete(`/emergency/${reportId}`);
            Alert.alert('Success', 'Emergency report removed from history.');
            fetchReports();
        } catch (err) {
            console.error('delete emergency report error:', err.response?.data ?? err.message);
            const message = err.response?.data?.message ?? 'Failed to delete report. Please try again.';
            Alert.alert('Error', message);
        }
    }, [fetchReports]);

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <PremiumPullToRefresh
                ref={pullToRefreshRef}
                refreshing={refreshing}
                onRefresh={onRefresh}
                iconName="warning"
                headerHeight={56}
                onScrollEnabledChange={setScrollEnabled}
                header={
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
                }
            >
                <ScrollView
                    scrollEnabled={scrollEnabled}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                    ]}
                    onScroll={(e) => pullToRefreshRef.current?.handleScroll(e)}
                    scrollEventThrottle={16}
                    overScrollMode="never"
                >
                        {/* ── Header ── */}
                        <View style={styles.headerSection}>
                            <View style={styles.headerTitleRow}>
                                <View style={styles.headerIconBadge}>
                                    <MaterialIcons name="history" size={20} color={COLORS.white} />
                                </View>
                                <Text style={styles.headerTitle}>Emergency Logs</Text>
                            </View>
                            <Text style={styles.headerSub}>History of your submitted emergency reports.</Text>
                        </View>
                        {/* ── Statistics Row ── */}
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, styles.statCardActive]}>
                                <View style={styles.statIconWrap}>
                                    <MaterialIcons name="error-outline" size={16} color="#DC2626" />
                                </View>
                                <Text style={styles.statLabel}>Active</Text>
                                <Text style={styles.statValue}>{activeCount}</Text>
                                <Text style={styles.statSub}>Needs attention</Text>
                            </View>

                            <View style={[styles.statCard, styles.statCardResolved]}>
                                <View style={[styles.statIconWrap, styles.statIconResolved]}>
                                    <MaterialIcons name="check-circle-outline" size={16} color="#16A34A" />
                                </View>
                                <Text style={styles.statLabel}>Resolved</Text>
                                <Text style={styles.statValue}>{resolvedCount}</Text>
                                <Text style={styles.statSub}>Resolved by staff</Text>
                            </View>

                            <View style={[styles.statCard, styles.statCardClosed]}>
                                <View style={[styles.statIconWrap, styles.statIconClosed]}>
                                    <MaterialIcons name="highlight-off" size={16} color="#4B5563" />
                                </View>
                                <Text style={styles.statLabel}>Closed</Text>
                                <Text style={styles.statValue}>{closedCount}</Text>
                                <Text style={styles.statSub}>Archived logs</Text>
                            </View>
                        </View>

                        {/* ── Filter Controls ── */}
                        <View style={styles.filterRow}>
                            {/* Status dropdown */}
                            <View style={styles.dropdownWrapper}>
                                <TouchableOpacity
                                    style={styles.filterBtn}
                                    onPress={() => {
                                        setShowStatusDropdown(!showStatusDropdown);
                                        setShowUrgencyDropdown(false);
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.filterBtnText}>{activeStatus}</Text>
                                    <MaterialIcons
                                        name={showStatusDropdown ? 'expand-less' : 'expand-more'}
                                        size={16}
                                        color={COLORS.white}
                                    />
                                </TouchableOpacity>

                                {showStatusDropdown && (
                                    <View style={styles.filterDropdown}>
                                        {STATUS_OPTIONS.map((opt) => (
                                            <TouchableOpacity
                                                key={opt}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setActiveStatus(opt);
                                                    setShowStatusDropdown(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownItemText,
                                                        activeStatus === opt && styles.dropdownItemTextActive,
                                                    ]}
                                                >
                                                    {opt}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Urgency level dropdown */}
                            <View style={styles.dropdownWrapper}>
                                <TouchableOpacity
                                    style={styles.filterBtn}
                                    onPress={() => {
                                        setShowUrgencyDropdown(!showUrgencyDropdown);
                                        setShowStatusDropdown(false);
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.filterBtnText}>{activeUrgency}</Text>
                                    <MaterialIcons
                                        name={showUrgencyDropdown ? 'expand-less' : 'expand-more'}
                                        size={16}
                                        color={COLORS.white}
                                    />
                                </TouchableOpacity>

                                {showUrgencyDropdown && (
                                    <View style={styles.filterDropdown}>
                                        {URGENCY_OPTIONS.map((opt) => (
                                            <TouchableOpacity
                                                key={opt}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setActiveUrgency(opt);
                                                    setShowUrgencyDropdown(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownItemText,
                                                        activeUrgency === opt && styles.dropdownItemTextActive,
                                                    ]}
                                                >
                                                    {opt}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* List of Cards */}
                        {filteredReports.length > 0 ? (
                            filteredReports.map((report) => (
                                <RequestCard
                                    key={report.id}
                                    item={report}
                                    onDelete={handleDeleteReport}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconWrap}>
                                    <MaterialIcons name="history" size={32} color={COLORS.primary} />
                                </View>
                                <Text style={styles.emptyText}>No emergency reports found</Text>
                                <Text style={styles.emptySubText}>
                                    There are no emergency reports filed matching the selected filters.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
            </PremiumPullToRefresh>

            {/* Bottom Nav Bar */}
            <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <NavItem iconName="home" label="Home" onPress={() => router.push('/tenant/dashboard')} />
                <NavItem iconName="person-outline" label="Visitor" onPress={() => router.push('/tenant/visitors')} />
                <NavItem iconName="warning" label="Emergency" isCenter isActive onPress={() => router.push('/tenant/emergency')} />
                <NavItem iconName="water-drop" label="Water Bill" onPress={() => router.push('/tenant/water-bill')} />
                <NavItem iconName="account-circle" label="Profile" onPress={() => router.push('/tenant/profile')} />
            </View>
            <LoadingOverlay visible={loading && !refreshing} />
        </SafeAreaView>
    );
}
