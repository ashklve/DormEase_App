import React, { useState, useRef, useCallback, useEffect } from 'react';
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
    Alert,
    PanResponder,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import styles, { COLORS } from '../../src/constants/maintenancehistorystyles';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';
import PremiumPullToRefresh from '../../src/components/PremiumPullToRefresh';
import LoadingOverlay from '../../src/components/LoadingOverlay';

const defaultPhoto = require('../../assets/def_icon.png');

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['All Priority', 'Low', 'Moderate', 'Urgent'];

const STATUS_STYLE = {
    pending: { bg: '#FEF3C7', text: '#92400E' },
    'in progress': { bg: '#DBEAFE', text: '#1E40AF' },
    resolved: { bg: '#DCFCE7', text: '#15803D' },
    closed: { bg: '#F3F4F6', text: '#6B7280' },
};

const PRIORITY_STYLE = {
    urgent: { bg: '#FEE2E2', text: '#991B1B' },
    high: { bg: '#FEE2E2', text: '#991B1B' },
    moderate: { bg: '#FEF3C7', text: '#92400E' },
    low: { bg: '#DCFCE7', text: '#15803D' },
};

const STATUS_ACCENT = {
    pending: '#D97706',
    'in progress': '#2563EB',
    resolved: '#16A34A',
    closed: '#9CA3AF',
};

const CATEGORY_ICON = {
    'Plumbing': 'water',
    'Electrical': 'electrical-services',
    'HVAC / Air Conditioning': 'ac-unit',
    'Appliance Repair': 'kitchen',
    'Carpentry / Furniture': 'weekend',
    'Pest Control': 'pest-control',
    'Cleaning': 'cleaning-services',
    'Internet / Cable': 'wifi',
    'Others': 'build',
};

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
    req_id: `REQ-${String(request.id ?? '').padStart(3, '0')}`,
    title: summarizeDescription(request.description),
    category: ISSUE_LABELS[request.issue_type] ?? request.issue_type ?? 'Others',
    status: formatStatus(request.status),
    priority: request.urgency_level ?? 'low',
    date_submitted: formatDate(request.submitted_at),
    submitted_at: request.submitted_at,
    photo_url: request.photo_url ?? null,
    resubmission_requested_at: request.resubmission_requested_at ?? null,
    resubmission_reason: request.resubmission_reason ?? null,
    admin_notes: request.admin_notes
        ? [{ timestamp: formatDateTime(request.admin_notes_at), text: request.admin_notes, bold: false }]
        : [],
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
const RequestCard = ({ item, onResubmitPhoto, onDelete }) => {
    const statusKey = item.status?.toLowerCase();
    const priorityKey = item.priority?.toLowerCase();

    // Resolved/Closed cards start collapsed; others start expanded
    const isClosedStatus = statusKey === 'resolved' || statusKey === 'closed';
    const [expanded, setExpanded] = useState(!isClosedStatus);
    const [submittingPhoto, setSubmittingPhoto] = useState(false);
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

    const ss = STATUS_STYLE[statusKey] ?? STATUS_STYLE.pending;
    const ps = PRIORITY_STYLE[priorityKey] ?? PRIORITY_STYLE.moderate;
    const accentColor = STATUS_ACCENT[statusKey] ?? COLORS.primary;

    const statusLabel = item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
        : 'Pending';
    const priorityLabel = item.priority
        ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1)
        : 'Moderate';

    const categoryIcon = CATEGORY_ICON[item.category] ?? 'build';
    const needsResubmission = !!item.resubmission_requested_at;

    const handleDelete = () => {
        const isPending = statusKey === 'pending';
        const title = isPending ? 'Cancel Request' : 'Remove from History';
        const message = isPending
            ? 'Are you sure you want to cancel this pending maintenance request? This will cancel it on the admin side as well.'
            : 'Are you sure you want to remove this resolved request from your history?';
        const buttonText = isPending ? 'Cancel Request' : 'Remove';

        Alert.alert(
            title,
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: buttonText,
                    style: 'destructive',
                    onPress: () => onDelete(item.id),
                },
            ]
        );
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsEditing: false,
        });

        if (!result.canceled && result.assets?.length > 0) {
            const asset = result.assets[0];
            const compressed = await ImageManipulator.manipulateAsync(
                asset.uri,
                [{ resize: { width: 1024 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            const photo = {
                uri: compressed.uri,
                fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            };
            setSubmittingPhoto(true);
            await onResubmitPhoto(item.id, photo);
            setSubmittingPhoto(false);
        }
    };

    const isPending = statusKey === 'pending';
    const actionIconName = isPending ? 'close' : 'delete-outline';

    const cardContent = (
        <View style={[styles.requestCard, { borderLeftColor: accentColor }]}>

            {/* ── Card Header ── */}
            <View style={styles.cardHeader}>

                {/* Category chip + req id row */}
                <View style={styles.chipIdRow}>
                    <View style={styles.categoryChip}>
                        <MaterialIcons name={categoryIcon} size={12} color={COLORS.primary} />
                        <Text style={styles.categoryChipText}>{item.category}</Text>
                    </View>
                    <View style={styles.reqIdPill}>
                        <MaterialIcons name="tag" size={11} color={COLORS.muted} />
                        <Text style={styles.reqIdPillText}>{item.req_id}</Text>
                    </View>
                </View>

                {/* Title + collapse button */}
                <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={styles.collapseBtn} onPress={toggle}>
                            <Animated.View style={{ transform: [{ rotate }] }}>
                                <MaterialIcons name="expand-less" size={20} color={COLORS.primary} />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status + Priority badges */}
                <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                        <Text style={[styles.badgeText, { color: ss.text }]}>{statusLabel}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: ps.bg }]}>
                        <Text style={[styles.badgeText, { color: ps.text }]}>{priorityLabel}</Text>
                    </View>

                    {/* Resubmission indicator badge in collapsed state */}
                    {needsResubmission && !expanded && (
                        <View style={styles.resubmitIndicatorBadge}>
                            <MaterialIcons name="camera-alt" size={10} color="#92400E" />
                            <Text style={styles.resubmitIndicatorText}>Photo needed</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ── Divider (only when expanded) ── */}
            {expanded && <View style={styles.cardDivider} />}

            {/* ── Expandable Body ── */}
            {expanded && (
                <View style={styles.cardBody}>

                    {/* ── Attached Photo (only shown when photo exists) ── */}
                    {item.photo_url ? (
                        <View style={styles.photoBlock}>
                            <View style={styles.photoBlockHeader}>
                                <MaterialIcons name="photo" size={12} color={COLORS.primary} />
                                <Text style={styles.photoBlockLabel}>Attached photo</Text>
                            </View>
                            <Image
                                source={{ uri: item.photo_url }}
                                style={styles.photoImage}
                                resizeMode="cover"
                            />
                        </View>
                    ) : null}

                    {/* ── Resubmission Banner (amber tone) ── */}
                    {needsResubmission && (
                        <View style={styles.resubmitBanner}>
                            <View style={styles.resubmitBannerHeader}>
                                <MaterialIcons name="camera-alt" size={14} color="#92400E" />
                                <Text style={styles.resubmitBannerTitle}>Photo resubmission requested</Text>
                            </View>
                            <View style={styles.resubmitBannerBody}>
                                {item.resubmission_reason ? (
                                    <View style={styles.resubmitReasonBox}>
                                        <Text style={styles.resubmitReason}>
                                            <Text style={styles.resubmitReasonBold}>Reason: </Text>
                                            {item.resubmission_reason}
                                        </Text>
                                    </View>
                                ) : null}
                                <TouchableOpacity
                                    style={[styles.resubmitBtn, submittingPhoto && { opacity: 0.7 }]}
                                    onPress={handleTakePhoto}
                                    disabled={submittingPhoto}
                                    activeOpacity={0.85}
                                >
                                    {submittingPhoto ? (
                                        <ActivityIndicator size="small" color={COLORS.white} />
                                    ) : (
                                        <>
                                            <MaterialIcons name="camera-alt" size={16} color={COLORS.white} />
                                            <Text style={styles.resubmitBtnText}>Take & submit new photo</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* ── Admin Notes ── */}
                    <View style={styles.notesBlock}>
                        <View style={styles.notesBlockHeader}>
                            <MaterialIcons name="sticky-note-2" size={12} color={COLORS.muted} />
                            <Text style={styles.notesLabel}>Admin notes</Text>
                        </View>
                        {item.admin_notes && item.admin_notes.length > 0 ? (
                            item.admin_notes.map((note, idx) => (
                                <View key={idx} style={styles.noteItem}>
                                    <Text style={styles.noteTimestamp}>{note.timestamp}</Text>
                                    <Text style={styles.noteText}>
                                        {note.bold
                                            ? <Text style={styles.noteBold}>{note.text}</Text>
                                            : note.text
                                        }
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noNotesText}>No admin notes yet.</Text>
                        )}
                    </View>
                </View>
            )}

            {/* ── Footer: date only (req id moved to top) ── */}
            <View style={styles.cardFooter}>
                <View style={styles.footerDateRow}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.muted} />
                    <Text style={styles.footerDate}>Submitted {item.date_submitted}</Text>
                </View>
                <TouchableOpacity onPress={toggle} style={styles.footerToggle}>
                    <Text style={styles.footerToggleText}>{expanded ? 'Hide details' : 'View details'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (statusKey === 'in progress') {
        return cardContent;
    }

    return (
        <SwipeableWrapper
            actionIconName={actionIconName}
            onAction={handleDelete}
        >
            {cardContent}
        </SwipeableWrapper>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MaintenanceHistoryScreen() {
    const router = useRouter();
    const { user, avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const pullToRefreshRef = useRef(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // ── Filter state
    const [activeStatus, setActiveStatus] = useState('All');
    const [activePriority, setActivePriority] = useState('All Priority');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

    // ── Derived stats
    const totalCount = requests.length;
    const pendingCount = requests.filter(r => r.status?.toLowerCase() === 'pending').length;
    const resolvedCount = requests.filter(r => r.status?.toLowerCase() === 'resolved').length;
    const progressCount = requests.filter(r => r.status?.toLowerCase() === 'in progress').length;

    // ── Filtered list
    const filtered = requests.filter((r) => {
        const statusMatch = activeStatus === 'All' || r.status?.toLowerCase() === activeStatus.toLowerCase();
        const priorityMatch = activePriority === 'All Priority' || r.priority?.toLowerCase() === activePriority.toLowerCase();
        return statusMatch && priorityMatch;
    });

    // ── Fetch
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

    // ── Resubmit photo handler
    const handleResubmitPhoto = useCallback(async (requestId, photo) => {
        try {
            const formData = new FormData();
            formData.append('photo', {
                uri: photo.uri,
                name: photo.fileName,
                type: photo.type,
            });

            await client.post(`/maintenance/${requestId}/resubmit-photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Photo submitted successfully. The admin will review it shortly.');
            fetchRequests();
        } catch (err) {
            console.error('resubmit photo error:', err.response?.data ?? err.message);
            const message = err.response?.data?.message ?? 'Failed to submit photo. Please try again.';
            Alert.alert('Error', message);
        }
    }, [fetchRequests]);

    // ── Delete request handler
    const handleDeleteRequest = useCallback(async (requestId) => {
        try {
            await client.delete(`/maintenance/${requestId}`);
            Alert.alert('Success', 'Maintenance request deleted successfully.');
            fetchRequests();
        } catch (err) {
            console.error('delete request error:', err.response?.data ?? err.message);
            const message = err.response?.data?.message ?? 'Failed to delete request. Please try again.';
            Alert.alert('Error', message);
        }
    }, [fetchRequests]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <PremiumPullToRefresh
                ref={pullToRefreshRef}
                refreshing={refreshing}
                onRefresh={onRefresh}
                iconName="build"
                headerHeight={56}
                onScrollEnabledChange={setScrollEnabled}
                header={
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
                }
            >
                    <ScrollView
                        scrollEnabled={scrollEnabled}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                        ]}
                        keyboardShouldPersistTaps="handled"
                        onScroll={(e) => pullToRefreshRef.current?.handleScroll(e)}
                        scrollEventThrottle={16}
                        overScrollMode="never"
                    >
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
                    {/* ── Stats Row ── */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, styles.statCardPending]}>
                            <View style={styles.statIconWrap}>
                                <MaterialIcons name="hourglass-empty" size={16} color="#92400E" />
                            </View>
                            <Text style={styles.statLabel}>Pending</Text>
                            <Text style={[styles.statValue, { color: '#92400E' }]}>{pendingCount}</Text>
                            <Text style={styles.statSub}>Awaiting action</Text>
                        </View>
                        <View style={[styles.statCard, styles.statCardProgress]}>
                            <View style={[styles.statIconWrap, styles.statIconProgress]}>
                                <MaterialIcons name="autorenew" size={16} color="#1E40AF" />
                            </View>
                            <Text style={styles.statLabel}>In Progress</Text>
                            <Text style={[styles.statValue, { color: '#1E40AF' }]}>{progressCount}</Text>
                            <Text style={styles.statSub}>Being handled</Text>
                        </View>
                        <View style={[styles.statCard, styles.statCardResolved]}>
                            <View style={[styles.statIconWrap, styles.statIconResolved]}>
                                <MaterialIcons name="check-circle-outline" size={16} color="#15803D" />
                            </View>
                            <Text style={styles.statLabel}>Resolved</Text>
                            <Text style={[styles.statValue, { color: '#15803D' }]}>{resolvedCount}</Text>
                            <Text style={styles.statSub}>All done</Text>
                        </View>
                    </View>

                    {/* ── Filter Row ── */}
                    <View style={styles.filterRow}>
                        {/* Status dropdown */}
                        <View style={styles.dropdownWrapper}>
                            <TouchableOpacity
                                style={styles.filterBtn}
                                onPress={() => {
                                    setShowStatusDropdown(!showStatusDropdown);
                                    setShowPriorityDropdown(false);
                                }}
                            >
                                <MaterialIcons name="filter-list" size={16} color={COLORS.white} />
                                <Text style={styles.filterBtnText}>{activeStatus}</Text>
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

                        {/* Priority dropdown */}
                        <View style={styles.dropdownWrapper}>
                            <TouchableOpacity
                                style={styles.priorityBtn}
                                onPress={() => {
                                    setShowPriorityDropdown(!showPriorityDropdown);
                                    setShowStatusDropdown(false);
                                }}
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
                                            onPress={() => {
                                                setActivePriority(priority);
                                                setShowPriorityDropdown(false);
                                            }}
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

                        {/* Result count */}
                        <Text style={styles.resultCount}>
                            {filtered.length} {filtered.length === 1 ? 'request' : 'requests'}
                        </Text>
                    </View>

                    {/* ── Request Cards ── */}
                    {filtered.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconWrap}>
                                <MaterialIcons name="history" size={32} color={COLORS.primary} />
                            </View>
                            <Text style={styles.emptyText}>No requests found</Text>
                            <Text style={styles.emptySubText}>
                                Try changing the filter or check back later.
                            </Text>
                        </View>
                    ) : (
                        filtered.map((item) => (
                            <RequestCard
                                key={item.id}
                                item={item}
                                onResubmitPhoto={handleResubmitPhoto}
                                onDelete={handleDeleteRequest}
                            />
                        ))
                    )}
                    </ScrollView>
            </PremiumPullToRefresh>

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
            <LoadingOverlay visible={loading} />
        </SafeAreaView>
    );
}