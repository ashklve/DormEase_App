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
    Animated,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import styles, { COLORS } from '../../src/constants/maintenancehistorystyles';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';

const defaultPhoto = require('../../assets/def_icon.png');

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['All Priority', 'Low', 'Moderate', 'Urgent'];

const STATUS_STYLE = {
    pending: { bg: '#FFF3CD', text: '#856404' },
    'in progress': { bg: '#CCE5FF', text: '#004085' },
    resolved: { bg: '#D4EDDA', text: '#28A745' },
    closed: { bg: '#F5F5F5', text: '#616161' },
};

const PRIORITY_STYLE = {
    urgent: { bg: '#F8D7DA', text: '#721C24' },
    high: { bg: '#F8D7DA', text: '#721C24' },
    moderate: { bg: '#FFF3CD', text: '#856404' },
    low: { bg: '#D4EDDA', text: '#155724' },
};


// ── Bottom Nav Item ───────────────────────────────────────────────────────────
const ISSUE_LABELS = {
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    hvac: 'HVAC / Air Conditioning',
    appliance: 'Appliance Repair',
    carpentry: 'Carpentry / Furniture',
    pest: 'Pest Control',
    cleaning: 'Cleaning',
    internet: 'Internet / Cable',
    other: 'Others',
};

const formatStatus = (status) => String(status ?? 'pending').replace(/-/g, ' ');

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

const summarizeDescription = (description) => {
    const clean = String(description ?? '').trim();
    if (!clean) return 'Maintenance Request';
    return clean.length > 48 ? `${clean.slice(0, 48)}...` : clean;
};

const mapMaintenanceRequest = (request) => ({
    id: request.id,
    req_id: `#REQ-${String(request.id ?? '').padStart(3, '0')}`,
    title: summarizeDescription(request.description),
    category: ISSUE_LABELS[request.issue_type] ?? request.issue_type ?? 'Others',
    status: formatStatus(request.status),
    priority: request.urgency_level ?? 'low',
    date_submitted: formatDate(request.submitted_at),
    submitted_at: request.submitted_at,
    admin_notes: request.admin_notes
        ? [{ timestamp: formatDateTime(request.admin_notes_at), text: request.admin_notes, bold: false }]
        : [],
});

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

// ── Request Card ──────────────────────────────────────────────────────────────
const RequestCard = ({ item }) => {
    const [expanded, setExpanded] = useState(true);
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

    const statusKey = item.status?.toLowerCase();
    const priorityKey = item.priority?.toLowerCase();
    const ss = STATUS_STYLE[statusKey] ?? STATUS_STYLE.pending;
    const ps = PRIORITY_STYLE[priorityKey] ?? PRIORITY_STYLE.moderate;

    const statusLabel = item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
        : 'Pending';
    const priorityLabel = item.priority
        ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1)
        : 'Moderate';

    // accent bar color matches status
    const accentColor = ss.text;

    return (
        <View style={[styles.requestCard, { borderLeftColor: accentColor }]}>

            {/* ── Status + Priority badges ── */}
            <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                    <Text style={[styles.badgeText, { color: ss.text }]}>{statusLabel}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: ps.bg }]}>
                    <Text style={[styles.badgeText, { color: ps.text }]}>{priorityLabel}</Text>
                </View>
            </View>

            {/* ── Title row ── */}
            <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity style={styles.collapseBtn} onPress={toggle}>
                    <Animated.View style={{ transform: [{ rotate }] }}>
                        <MaterialIcons name="expand-less" size={22} color={COLORS.primary} />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* ── Category ── */}
            <Text style={styles.cardCategory}>{item.category}</Text>

            {/* ── Expandable body ── */}
            {expanded && (
                <>
                    {item.admin_notes && item.admin_notes.length > 0 ? (
                        <>
                            <Text style={styles.notesLabel}>Notes by Admin:</Text>
                            {item.admin_notes.map((note, idx) => (
                                <View key={idx} style={styles.noteItem}>
                                    <Text style={styles.noteTimestamp}>{note.timestamp}</Text>
                                    <Text style={styles.noteText}>
                                        {note.bold
                                            ? <Text style={styles.noteBold}>{note.text}</Text>
                                            : note.text
                                        }
                                    </Text>
                                </View>
                            ))}
                        </>
                    ) : (
                        <Text style={[styles.notesLabel, { fontStyle: 'italic' }]}>
                            No admin notes yet.
                        </Text>
                    )}
                </>
            )}

            {/* ── Footer: req ID + date ── */}
            <View style={styles.cardFooter}>
                <Text style={styles.reqId}>{item.req_id}</Text>
                <View style={styles.footerDateRow}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.muted} />
                    <Text style={styles.footerDate}>{item.date_submitted}</Text>
                </View>
            </View>
        </View>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MaintenanceHistoryScreen() {
    const router = useRouter();
    const { avatarUri } = useUser();
    const insets = useSafeAreaInsets();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // ── Filter state
    const [activeStatus, setActiveStatus] = useState('All');
    const [activePriority, setActivePriority] = useState('All Priority');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

    // ── Derived stats
    const pendingCount = requests.filter(r => r.status?.toLowerCase() === 'pending').length;
    const resolvedCount = requests.filter(r => r.status?.toLowerCase() === 'resolved').length;

    // ── Filtered list
    const filtered = requests.filter((r) => {
        const statusMatch = activeStatus === 'All' || r.status?.toLowerCase() === activeStatus.toLowerCase();
        const priorityMatch = activePriority === 'All Priority' || r.priority?.toLowerCase() === activePriority.toLowerCase();
        return statusMatch && priorityMatch;
    });

    // ── Fetch (replace mock with real API)
    const fetchRequests = useCallback(async () => {
        try {
            const res = await client.get('/maintenance', { timeout: 15000 });
            const apiRequests = Array.isArray(res.data?.requests) ? res.data.requests : [];
            setRequests(apiRequests.map(mapMaintenanceRequest));
        } catch (err) {
            console.error('fetch maintenance history error:', err.response?.data ?? err.message);
            setRequests([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchRequests();
        }, [fetchRequests])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRequests();
    }, [fetchRequests]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            {/* ── Top Row ── */}
            <View style={styles.topRow}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.push('/tenant/maintenance')}
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
                        <Ionicons name="time-outline" size={20} color={COLORS.white} />
                    </View>
                    <Text style={styles.headerTitle}>Maintenance History</Text>
                </View>
                <Text style={styles.headerSub}>Track your past maintenance requests</Text>
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
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {/* ── Stats ── */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Pending Requests</Text>
                            <Text style={styles.statValue}>{pendingCount}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Resolved Requests</Text>
                            <Text style={styles.statValue}>{resolvedCount}</Text>
                        </View>
                    </View>

                    {/* ── Filter Row ── */}
                    <View style={styles.filterRow}>
                        {/* Filter button */}
                        <View style={styles.dropdownWrapper}>
                            <TouchableOpacity
                                style={styles.filterBtn}
                                onPress={() => { setShowStatusDropdown(!showStatusDropdown); setShowPriorityDropdown(false); }}
                            >
                                <MaterialIcons name="filter-list" size={16} color={COLORS.white} />
                                <Text style={styles.filterBtnText}>
                                    {activeStatus}
                                </Text>
                                <MaterialIcons
                                    name={showStatusDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={16}
                                    color={COLORS.white}
                                />
                            </TouchableOpacity>

                            {showStatusDropdown && (
                                <View style={styles.filterDropdown}>
                                    {STATUS_OPTIONS.map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.filterDropdownItem,
                                                activeStatus === status && styles.filterDropdownItemActive,
                                            ]}
                                            onPress={() => {
                                                setActiveStatus(status);
                                                setShowStatusDropdown(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.filterDropdownText,
                                                activeStatus === status && styles.filterDropdownTextActive,
                                            ]}>
                                                {status}
                                            </Text>
                                            {activeStatus === status && (
                                                <MaterialIcons name="check" size={14} color={COLORS.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Priority selector */}
                        <View style={styles.dropdownWrapper}>
                            <TouchableOpacity
                                style={styles.priorityBtn}
                                onPress={() => { setShowPriorityDropdown(!showPriorityDropdown); setShowStatusDropdown(false); }}
                            >
                                <Ionicons name="flag-outline" size={14} color={COLORS.primary} />
                                <Text style={styles.priorityBtnText}>{activePriority}</Text>
                                <MaterialIcons
                                    name={showPriorityDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={16}
                                    color={COLORS.primary}
                                />
                            </TouchableOpacity>

                            {showPriorityDropdown && (
                                <View style={styles.filterDropdown}>
                                    {PRIORITY_OPTIONS.map((priority) => (
                                        <TouchableOpacity
                                            key={priority}
                                            style={[
                                                styles.filterDropdownItem,
                                                activePriority === priority && styles.filterDropdownItemActive,
                                            ]}
                                            onPress={() => { setActivePriority(priority); setShowPriorityDropdown(false); }}
                                        >
                                            <Text style={[
                                                styles.filterDropdownText,
                                                activePriority === priority && styles.filterDropdownTextActive,
                                            ]}>
                                                {priority}
                                            </Text>
                                            {activePriority === priority && (
                                                <MaterialIcons name="check" size={14} color={COLORS.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* ── Request Cards ── */}
                    {filtered.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="history" size={48} color={COLORS.primaryLight} />
                            <Text style={styles.emptyText}>No requests found</Text>
                            <Text style={styles.emptySubText}>
                                Try changing the filter or check back later.
                            </Text>
                        </View>
                    ) : (
                        filtered.map((item) => (
                            <RequestCard key={item.id} item={item} />
                        ))
                    )}
                </ScrollView>
            )}

            {/* ── Bottom Nav ── */}
            <View style={[
                styles.bottomNav,
                { paddingBottom: Math.max(insets.bottom, 24) },
            ]}>
                <NavItem iconName="home" label="Home" isActive={false} onPress={() => router.push('/tenant/dashboard')} />
                <NavItem iconName="person-outline" label="Visitor" isActive={false} onPress={() => router.push('/tenant/visitors')} />
                <NavItem iconName="warning" label="Emergency" isCenter onPress={() => router.push('/tenant/emergency')} />
                <NavItem iconName="water-drop" label="Water Bill" isActive={false} onPress={() => router.push('/tenant/water-bill')} />
                <NavItem iconName="account-circle" label="Profile" isActive={false} onPress={() => router.push('/tenant/profile')} />
            </View>

        </SafeAreaView>
    );
}
