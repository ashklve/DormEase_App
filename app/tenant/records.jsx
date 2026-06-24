import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Alert,
    Animated,
    PanResponder,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';
import DrawerMenu from '../../src/components/DrawerMenu';
import PremiumPullToRefresh from '../../src/components/PremiumPullToRefresh';
import styles, { COLORS } from '../../src/constants/recordsstyles';
import LoadingOverlay from '../../src/components/LoadingOverlay';
import client from '../../api/client';

const defaultPhoto = require('../../assets/def_icon.png');

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: COLORS.warning, bg: COLORS.warningLight, icon: 'schedule' },
    processing: { label: 'Processing', color: COLORS.info, bg: COLORS.infoLight, icon: 'autorenew' },
    approved: { label: 'Approved', color: COLORS.success, bg: COLORS.successLight, icon: 'check-circle' },
    ready: { label: 'Ready', color: COLORS.ready, bg: COLORS.readyLight, icon: 'inventory' },
    denied: { label: 'Denied', color: COLORS.denied, bg: COLORS.deniedLight, icon: 'cancel' },
    resubmission: { label: 'Resubmit', color: COLORS.denied, bg: COLORS.deniedLight, icon: 'upload-file' },
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'approved', label: 'Approved' },
    { key: 'ready', label: 'Ready' },
    { key: 'denied', label: 'Denied' },
    { key: 'resubmission', label: 'Resubmit' },
];

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// nav item
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
                <MaterialIcons name={iconName} size={24} color={isActive ? COLORS.primary : COLORS.muted} />
                <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>{label}</Text>
            </>
        )}
    </TouchableOpacity>
);

// status badge
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <MaterialIcons name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
    );
};

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

// record card
const RecordCard = ({ item, index, onDelete, onResubmit, resubmitting }) => {
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(16)).current;
    const [sharingPath, setSharingPath] = useState(null);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }),
            Animated.timing(slide, { toValue: 0, duration: 300, delay: index * 60, useNativeDriver: true }),
        ]).start();
    }, []);

    const buildFileUrl = (path) =>
        `${client.defaults.baseURL.replace('/api', '')}/storage/${path}`;

    const openFile = async (path) => {
        try {
            await Linking.openURL(buildFileUrl(path));
        } catch {
            Alert.alert('Error', 'Could not open file. Please try again.');
        }
    };

    const handleShareFile = async (path, label) => {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('Not Supported', 'Sharing is not available on this device.');
                return;
            }

            setSharingPath(path);
            const fileName = path.split('/').pop();
            const localUri = `${FileSystem.cacheDirectory}${fileName}`;

            const { uri } = await FileSystem.downloadAsync(buildFileUrl(path), localUri);
            await Sharing.shareAsync(uri, { dialogTitle: label ?? 'Share Document' });
        } catch {
            Alert.alert('Error', 'Could not share file. Please try again.');
        } finally {
            setSharingPath(null);
        }
    };

    const handleDelete = () => {
        const isPending = item.status === 'pending';
        const title = isPending ? 'Cancel Request' : 'Remove from History';
        const message = isPending
            ? 'Are you sure you want to cancel this pending document request? This will cancel it on the admin side as well.'
            : 'Are you sure you want to remove this request from your history?';
        const buttonText = isPending ? 'Cancel Request' : 'Remove';

        Alert.alert(
            title,
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: buttonText,
                    style: 'destructive',
                    onPress: () => onDelete(item.doc_request_id, isPending),
                },
            ]
        );
    };

    const hasFulfilled = !!item.fulfilled_file;
    const hasAttachment = !!item.attachment;
    const isDownloadableForm = item.category === 'form';
    const needsResubmission = item.status === 'resubmission';
    const canDelete = ['pending', 'approved', 'ready', 'denied'].includes(item.status);

    const isPending = item.status === 'pending';
    const actionIconName = isPending ? 'close' : 'delete-outline';

    const cardContent = (
        <View style={styles.recordCard}>

            {/* accent bar — green if fulfilled, pink if not */}
            <View style={[styles.accentBar, { backgroundColor: hasFulfilled ? COLORS.success : COLORS.primary }]} />

            <View style={styles.cardBody}>

                {/* header */}
                <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderLeft}>
                        <View style={styles.reqIdRow}>
                            <Text style={styles.reqId}>
                                #DRQ-{String(item.doc_request_id).padStart(3, '0')}
                            </Text>
                            {isDownloadableForm && (
                                <View style={styles.categoryTag}>
                                    <MaterialIcons name="download" size={10} color={COLORS.info} />
                                    <Text style={styles.categoryTagText}>Form</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.docType} numberOfLines={2}>
                            {item.document_type}
                        </Text>
                    </View>
                    <View style={styles.cardHeaderRight}>
                        <StatusBadge status={item.status} />
                    </View>
                </View>

                {/* meta */}
                {!!item.purpose && (
                    <View style={styles.metaRow}>
                        <MaterialIcons name="notes" size={13} color={COLORS.muted} />
                        <Text style={[styles.metaText, styles.metaTextFlex]} numberOfLines={2}>
                            {item.purpose}
                        </Text>
                    </View>
                )}
                <View style={styles.metaGroup}>
                    <View style={styles.metaRow}>
                        <MaterialIcons name="event" size={12} color={COLORS.muted} />
                        <Text style={styles.metaText}>Submitted {fmtDate(item.submitted_at)}</Text>
                    </View>
                    {!!item.delivery_type && (
                        <View style={styles.metaRow}>
                            <MaterialIcons
                                name={item.delivery_type === 'digital' ? 'phone-android' : 'print'}
                                size={12}
                                color={COLORS.muted}
                            />
                            <Text style={[styles.metaText, styles.metaTextCapitalize]}>
                                {item.delivery_type}
                            </Text>
                        </View>
                    )}
                </View>

                {/* admin remarks */}
                {!!item.admin_remarks && (
                    <View style={styles.remarksBox}>
                        <View style={styles.remarksHeader}>
                            <MaterialIcons name="admin-panel-settings" size={11} color={COLORS.warning} />
                            <Text style={styles.remarksLabel}>Admin Remarks</Text>
                        </View>
                        <Text style={styles.remarksText}>{item.admin_remarks}</Text>
                    </View>
                )}

                <View style={styles.divider} />

                {/* resubmission needed — show resubmit button instead of awaiting placeholder */}
                {needsResubmission && (
                    <TouchableOpacity
                        style={[styles.fileBtn, styles.fileBtnAttachment]}
                        activeOpacity={0.75}
                        onPress={() => onResubmit(item.doc_request_id)}
                        disabled={resubmitting}
                    >
                        <View style={[styles.fileBtnIcon, styles.fileBtnIconAttachment]}>
                            {resubmitting ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <MaterialIcons name="upload-file" size={18} color={COLORS.white} />
                            )}
                        </View>
                        <View style={styles.fileBtnTextWrap}>
                            <Text style={[styles.fileBtnTitle, styles.fileBtnTitlePrimary]}>
                                {resubmitting ? 'Resubmitting...' : 'Resubmit File'}
                            </Text>
                            <Text style={[styles.fileBtnSub, styles.fileBtnSubAttachment]}>
                                Tap to upload a corrected file
                            </Text>
                        </View>
                        {!resubmitting && <MaterialIcons name="chevron-right" size={16} color={COLORS.primary} />}
                    </TouchableOpacity>
                )}

                {/* fulfilled document from admin */}
                {hasFulfilled ? (
                    <TouchableOpacity
                        style={[styles.fileBtn, styles.fileBtnFulfilled]}
                        activeOpacity={0.75}
                        onPress={() => openFile(item.fulfilled_file)}
                    >
                        <View style={[styles.fileBtnIcon, styles.fileBtnIconFulfilled]}>
                            <MaterialIcons name="description" size={18} color={COLORS.white} />
                        </View>
                        <View style={styles.fileBtnTextWrap}>
                            <Text style={[styles.fileBtnTitle, styles.fileBtnTitleFulfilled]}>Document Ready</Text>
                            <Text style={[styles.fileBtnSub, styles.fileBtnSubFulfilled]}>Tap to view fulfilled document</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleShareFile(item.fulfilled_file, item.document_type)}
                            disabled={sharingPath === item.fulfilled_file}
                            style={{ padding: 6 }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            {sharingPath === item.fulfilled_file ? (
                                <ActivityIndicator size="small" color={COLORS.success} />
                            ) : (
                                <MaterialIcons name="ios-share" size={16} color={COLORS.success} />
                            )}
                        </TouchableOpacity>
                    </TouchableOpacity>
                ) : !isDownloadableForm && !needsResubmission && (
                    /* only show "awaiting" placeholder for certificate requests, not downloadable forms, not when resubmission is needed */
                    <View style={[styles.fileBtn, styles.fileBtnAwaiting]}>
                        <View style={[styles.fileBtnIcon, styles.fileBtnIconAwaiting]}>
                            <MaterialIcons name="hourglass-empty" size={18} color={COLORS.muted} />
                        </View>
                        <View style={styles.fileBtnTextWrap}>
                            <Text style={[styles.fileBtnTitle, styles.fileBtnTitleMuted]}>Awaiting Document</Text>
                            <Text style={[styles.fileBtnSub, styles.fileBtnSubMuted]}>Admin hasn't sent a file yet</Text>
                        </View>
                    </View>
                )}

                {/* tenant's own uploaded attachment */}
                {hasAttachment && (
                    <TouchableOpacity
                        style={[styles.fileBtn, styles.fileBtnAttachment]}
                        activeOpacity={0.75}
                        onPress={() => openFile(item.attachment)}
                    >
                        <View style={[styles.fileBtnIcon, styles.fileBtnIconAttachment]}>
                            <MaterialIcons name="attach-file" size={18} color={COLORS.white} />
                        </View>
                        <View style={styles.fileBtnTextWrap}>
                            <Text style={[styles.fileBtnTitle, styles.fileBtnTitlePrimary]}>Your Submitted Form</Text>
                            <Text style={[styles.fileBtnSub, styles.fileBtnSubAttachment]}>Tap to view your uploaded file</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleShareFile(item.attachment, item.document_type)}
                            disabled={sharingPath === item.attachment}
                            style={{ padding: 6 }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            {sharingPath === item.attachment ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                                <MaterialIcons name="ios-share" size={16} color={COLORS.primary} />
                            )}
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}

            </View>
        </View>
    );

    return (
        <Animated.View style={[styles.cardAnimated, { opacity: fade, transform: [{ translateY: slide }] }]}>
            {canDelete ? (
                <SwipeableWrapper
                    actionIconName={actionIconName}
                    onAction={handleDelete}
                >
                    {cardContent}
                </SwipeableWrapper>
            ) : (
                cardContent
            )}
        </Animated.View>
    );
};

// empty state
const EmptyState = () => (
    <View style={styles.emptyWrap}>
        <View style={styles.emptyIcon}>
            <MaterialIcons name="folder-open" size={34} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.emptyTitle}>No Records Yet</Text>
        <Text style={styles.emptyText}>
            Your document requests and received files will appear here once you submit a request.
        </Text>
    </View>
);

// main screen
export default function TenantRecordsScreen() {
    const router = useRouter();
    const { user, avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const pullToRefreshRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            if (user?.is_on_vacation) {
                Alert.alert(
                    "Access Restricted",
                    "You cannot access this feature while on vacation. Please turn off your vacation status in your profile.",
                    [
                        { text: "Cancel", onPress: () => router.replace('/tenant/dashboard'), style: "cancel" },
                        { text: "Go to Profile", onPress: () => router.replace('/tenant/profile') }
                    ]
                );
            }
        }, [user?.is_on_vacation])
    );
    const drawerRef = useRef(null);

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [resubmittingId, setResubmittingId] = useState(null);

    const fetchRecords = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await client.get('/document-requests');
            const data = res.data;
            setRecords(data.data ?? data);
        } catch {
            Alert.alert('Error', 'Could not load your records. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleDeleteRequest = useCallback(async (requestId, isPending) => {
        try {
            const res = await client.delete(`/document-requests/${requestId}`);
            const msg = isPending ? 'Request cancelled successfully.' : 'Request removed from history.';
            Alert.alert('Done', msg);
            fetchRecords();
        } catch (err) {
            console.error('delete request error:', err.response?.data ?? err.message);
            const message = err.response?.data?.message ?? 'Failed to delete request. Please try again.';
            Alert.alert('Error', message);
        }
    }, [fetchRecords]);

    const handleResubmit = useCallback(async (requestId) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            const formData = new FormData();
            formData.append('file', {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'application/octet-stream',
            });

            setResubmittingId(requestId);
            await client.post(`/document-requests/${requestId}/resubmit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
                transformRequest: (data) => data,
            });

            Alert.alert('Done', 'File resubmitted successfully.');
            fetchRecords();
        } catch (err) {
            console.error('resubmit error:', err.response?.data ?? err.message);
            const message = err.response?.data?.message ?? 'Failed to resubmit file. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setResubmittingId(null);
        }
    }, [fetchRecords]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const filtered = activeFilter === 'all'
        ? records
        : records.filter(r => r.status === activeFilter);

    const fulfilledCount = records.filter(r => r.fulfilled_file).length;
    const pendingCount = records.filter(r => r.status === 'pending').length;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <PremiumPullToRefresh
                ref={pullToRefreshRef}
                refreshing={refreshing}
                onRefresh={() => fetchRecords(true)}
                iconName="assignment"
                headerHeight={56}
                onScrollEnabledChange={setScrollEnabled}
                header={
                    <View style={styles.topRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => drawerRef.current?.open()}>
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
                }
            >
                    <ScrollView
                        scrollEnabled={scrollEnabled}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                            filtered.length === 0 && { flex: 1 },
                        ]}
                        onScroll={(e) => pullToRefreshRef.current?.handleScroll(e)}
                        scrollEventThrottle={16}
                        overScrollMode="never"
                    >
                        {/* page header */}
                        <View style={styles.headerSection}>
                            <View style={styles.headerTitleRow}>
                                <View style={styles.headerIconBadge}>
                                    <Ionicons name="folder-open-outline" size={20} color={COLORS.white} />
                                </View>
                                <Text style={styles.headerTitle}>My Records</Text>
                            </View>
                            <Text style={styles.headerSub}>Your document request history & received files</Text>
                        </View>

                        {/* stats */}
                        {records.length > 0 && (
                            <View style={styles.statsRow}>
                                {[
                                    { label: 'Total Requests', value: records.length, color: COLORS.primary },
                                    { label: 'Docs Received', value: fulfilledCount, color: COLORS.success },
                                    { label: 'Pending', value: pendingCount, color: COLORS.warning },
                                ].map(s => (
                                    <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
                                        <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                                        <Text style={styles.statLabel}>{s.label}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* filter chips with counts */}
                        {records.length > 0 && (
                            <View style={styles.filterChipRow}>
                                <ScrollView
                                    horizontal
                                    scrollEnabled={scrollEnabled}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.filterChipScrollContent}
                                >
                                    {FILTERS.map(f => {
                                        const count = f.key === 'all'
                                            ? records.length
                                            : records.filter(r => r.status === f.key).length;
                                        const isActive = activeFilter === f.key;
                                        return (
                                            <TouchableOpacity
                                                key={f.key}
                                                onPress={() => setActiveFilter(f.key)}
                                                activeOpacity={0.75}
                                                style={[
                                                    styles.filterChip,
                                                    {
                                                        backgroundColor: isActive ? COLORS.primary : COLORS.card,
                                                        borderColor: isActive ? COLORS.primary : COLORS.border,
                                                    },
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.filterChipText,
                                                    { color: isActive ? COLORS.white : COLORS.dark },
                                                ]}>
                                                    {f.label}
                                                </Text>
                                                {count > 0 && (
                                                    <View style={[
                                                        styles.filterChipCount,
                                                        {
                                                            backgroundColor: isActive
                                                                ? 'rgba(255,255,255,0.25)'
                                                                : COLORS.primaryLight,
                                                        },
                                                    ]}>
                                                        <Text style={[
                                                            styles.filterChipCountText,
                                                            { color: isActive ? COLORS.white : COLORS.primary },
                                                        ]}>
                                                            {count}
                                                        </Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}
                    {filtered.length === 0 ? (
                        <EmptyState />
                    ) : (
                        filtered.map((item, index) => (
                            <RecordCard
                                key={item.doc_request_id}
                                item={item}
                                index={index}
                                onDelete={handleDeleteRequest}
                                onResubmit={handleResubmit}
                                resubmitting={resubmittingId === item.doc_request_id}
                            />
                        ))
                    )}
                    </ScrollView>
            </PremiumPullToRefresh>

            {/* bottom nav */}
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

            <DrawerMenu ref={drawerRef} />
            <LoadingOverlay visible={loading} />
        </SafeAreaView>
    );
}