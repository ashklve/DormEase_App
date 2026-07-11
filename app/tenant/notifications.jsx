import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import styles, { NOTIF_COLORS } from '../../src/constants/notificationsstyles';
import { useUser } from '../../src/context/UserContext';
import client from '../../api/client';
import PremiumPullToRefresh from '../../src/components/PremiumPullToRefresh';
import BottomNavigation from '../../src/components/BottomNavigation';
import { addNotificationReceivedListener, setBadgeCount } from '../../src/services/pushNotifications';
import LoadingOverlay from '../../src/components/LoadingOverlay';
import NotificationBell from '../../src/components/NotificationBell';

const defaultPhoto = require('../../assets/def_icon.png');

// Maps each notification type to its display metadata
const TYPE_META = {
    announcement: {
        label: 'Announcement',
        icon: 'campaign',
        avatarBg: NOTIF_COLORS.avatarOrange,
        iconColor: NOTIF_COLORS.iconAnnouncement,
        route: '/tenant/announcements',
    },
    document: {
        label: 'Document',
        icon: 'description',
        avatarBg: NOTIF_COLORS.avatarBlue,
        iconColor: NOTIF_COLORS.iconDocument,
        route: '/tenant/records',
    },
    bill: {
        label: 'Water Bill',
        icon: 'water-drop',
        avatarBg: NOTIF_COLORS.avatarBlue,
        iconColor: NOTIF_COLORS.iconBill,
        route: '/tenant/water-bill',
    },
    payment: {
        label: 'Payment',
        icon: 'payments',
        avatarBg: NOTIF_COLORS.avatarGreen,
        iconColor: NOTIF_COLORS.iconPayment,
        route: '/tenant/water-bill',
    },
    maintenance: {
        label: 'Maintenance',
        icon: 'build',
        avatarBg: NOTIF_COLORS.avatarPurple,
        iconColor: NOTIF_COLORS.iconMaintenance,
        route: '/tenant/maintenancehistory',
    },
    emergency: {
        label: 'Emergency',
        icon: 'warning',
        avatarBg: NOTIF_COLORS.avatarRed,
        iconColor: NOTIF_COLORS.iconEmergency,
        route: '/tenant/emergencyhistory',
    },
    visitor: {
        label: 'Visitor',
        icon: 'person-add',
        avatarBg: NOTIF_COLORS.avatarBlue,
        iconColor: NOTIF_COLORS.iconVisitor,
        route: '/tenant/visitors',
    },
};

const FILTER_PILLS = [
    { key: 'all', label: 'All', icon: 'notifications' },
    { key: 'announcement', label: 'Announcement', icon: 'campaign' },
    { key: 'maintenance', label: 'Maintenance', icon: 'build' },
    { key: 'document', label: 'Document', icon: 'description' },
    { key: 'bill', label: 'Billing', icon: 'water-drop' },
    { key: 'payment', label: 'Payment', icon: 'payments' },
    { key: 'emergency', label: 'Emergency', icon: 'warning' },
    { key: 'visitor', label: 'Visitor', icon: 'person-add' },
];

const getTypeMeta = (type) =>
    TYPE_META[type] ?? {
        label: 'Notification',
        icon: 'notifications',
        avatarBg: NOTIF_COLORS.avatarPurple,
        iconColor: NOTIF_COLORS.iconDefault,
        route: null,
    };

const formatDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const now = new Date();
    const sameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    return date.toLocaleString('en-US', {
        month: sameDay ? undefined : 'short',
        day: sameDay ? undefined : 'numeric',
        year: sameDay ? undefined : 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

// Groups a flat notifications array into { today: [], yesterday: [], older: [] }
const groupByDate = (notifications) => {
    const now = new Date();

    // Use local midnight boundaries but construct them explicitly
    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const groups = { today: [], yesterday: [], older: [] };

    notifications.forEach((n) => {
        const d = new Date(n._rawDate ?? n.timestamp);

        if (isNaN(d.getTime())) {
            groups.older.push(n);
            return;
        }

        // Compare using timestamps (milliseconds) to avoid timezone issues
        const dTime = d.getTime();
        const todayTime = startOfToday.getTime();
        const yesterdayTime = startOfYesterday.getTime();

        if (dTime >= todayTime) groups.today.push(n);
        else if (dTime >= yesterdayTime) groups.yesterday.push(n);
        else groups.older.push(n);
    });
    return groups;
};

const getNotificationDateValue = (notification) =>
    notification.created_at ??
    notification.createdAt ??
    notification.timestamp ??
    notification.date ??
    null;

const getNotificationRows = (data) => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.notifications)) return data.notifications;
    if (Array.isArray(data)) return data;
    return [];
};

const getNextPage = (data) => {
    const currentPage = Number(data?.current_page ?? data?.meta?.current_page);
    const lastPage = Number(data?.last_page ?? data?.meta?.last_page);
    const nextPageUrl = data?.next_page_url ?? data?.links?.next;

    if (Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage < lastPage) {
        return currentPage + 1;
    }

    if (typeof nextPageUrl === 'string') {
        const match = nextPageUrl.match(/[?&]page=(\d+)/);
        if (match) return Number(match[1]);
    }

    return null;
};

const mapNotification = (notification) => {
    const type = notification.type ?? 'notification';
    const meta = getTypeMeta(type);
    const dateValue = getNotificationDateValue(notification);

    return {
        id: notification.notif_id ?? notification.notification_id ?? notification.id,
        type,
        title: meta.label,
        description: notification.message ?? '',
        timestamp: formatDateTime(dateValue),
        _rawDate: dateValue,
        read: Boolean(notification.is_read),
        refId: notification.ref_id,
        route: meta.route,
        icon: meta.icon,
        avatarBg: meta.avatarBg,
        iconColor: meta.iconColor,
    };
};

/* ─── Single notification row ─── */
const NotificationItem = ({ item, isExpanded, onToggleExpand, onActionPress }) => (
    <TouchableOpacity
        style={[
            styles.notificationItem,
            !item.read && styles.notificationItemUnread,
        ]}
        onPress={onToggleExpand}
        activeOpacity={0.8}
    >
        {/* Colored avatar with icon */}
        <View style={[styles.notifAvatar, { backgroundColor: item.avatarBg }]}>
            <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
        </View>

        {/* Text content */}
        <View style={styles.notifContent}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            {!!item.description && (
                <Text 
                    style={styles.notifDescription} 
                    numberOfLines={isExpanded ? undefined : 2}
                >
                    {item.description}
                </Text>
            )}
            
            {isExpanded && item.route && (
                <TouchableOpacity
                    style={styles.notifActionButton}
                    onPress={onActionPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.notifActionText}>Go to {item.title}</Text>
                    <MaterialIcons name="arrow-forward" size={14} color={NOTIF_COLORS.primary} />
                </TouchableOpacity>
            )}
            
            <Text style={styles.notifTime}>{item.timestamp}</Text>
        </View>

        {/* Right side indicators */}
        <View style={styles.rightContainer}>
            {!item.read && <View style={styles.unreadDot} />}
            <MaterialIcons 
                name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={20} 
                color={NOTIF_COLORS.grayText} 
            />
        </View>
    </TouchableOpacity>
);

/* ─── Date group block ─── */
const NotificationGroup = ({ label, items, expandedNotifIds, onToggleExpand, onActionPress, showDivider }) => {
    if (!items?.length) return null;
    return (
        <>
            {showDivider && <View style={styles.groupDivider} />}
            <Text style={styles.sectionLabel}>{label}</Text>
            {items.map((item) => (
                <NotificationItem 
                    key={item.id} 
                    item={item} 
                    isExpanded={!!expandedNotifIds[item.id]}
                    onToggleExpand={() => onToggleExpand(item)}
                    onActionPress={() => onActionPress(item)}
                />
            ))}
        </>
    );
};

/* ─── Empty state ─── */
const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
            <MaterialIcons name="notifications-none" size={32} color={NOTIF_COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptyText}>
            You have no notifications yet. We'll let you know when something arrives.
        </Text>
    </View>
);

/* ─── Bottom nav item ─── */


/* ═══════════════════════════════════════════ */
/*                 Main screen                */
/* ═══════════════════════════════════════════ */

export default function NotificationsScreen() {
    const router = useRouter();
    const { avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const pullToRefreshRef = useRef(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [expandedNotifIds, setExpandedNotifIds] = useState({});

    const unreadCount = notifications.filter((n) => !n.read).length;
    const activeFilterUnreadCount = activeFilter === 'all'
        ? unreadCount
        : notifications.filter((n) => n.type === activeFilter && !n.read).length;

    useEffect(() => {
        setBadgeCount(unreadCount);
    }, [unreadCount]);

    /* ─── Fetch ─── */
    const fetchNotifications = useCallback(async () => {
        try {
            const requestConfig = {
                timeout: 15000,
                params: { per_page: 100, limit: 100 },
            };
            const res = await client.get('/notifications', requestConfig);
            let rows = getNotificationRows(res.data);
            let nextPage = getNextPage(res.data);
            const loadedPages = new Set([1]);

            while (nextPage && !loadedPages.has(nextPage) && rows.length < 500) {
                loadedPages.add(nextPage);
                const pageRes = await client.get('/notifications', {
                    ...requestConfig,
                    params: { ...requestConfig.params, page: nextPage },
                });
                rows = rows.concat(getNotificationRows(pageRes.data));
                nextPage = getNextPage(pageRes.data);
            }

            setNotifications(rows.map(mapNotification));
        } catch (err) {
            console.error('fetch notifications error:', err.response?.data ?? err.message);
            setNotifications([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchNotifications();
        }, [fetchNotifications])
    );

    useFocusEffect(
        useCallback(() => {
            const subscription = addNotificationReceivedListener(() => {
                fetchNotifications();
            });
            return () => subscription.remove();
        }, [fetchNotifications])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, [fetchNotifications]);

    /* ─── Mark read ─── */
    const markNotificationRead = useCallback(async (notification) => {
        if (notification.read) return;
        setNotifications((current) =>
            current.map((item) =>
                item.id === notification.id ? { ...item, read: true } : item
            )
        );
        try {
            await client.patch(`/notifications/${notification.id}/read`);
        } catch (err) {
            console.error('mark read error:', err.response?.data ?? err.message);
        }
    }, []);

    const markAllRead = useCallback(async () => {
        if (!unreadCount || markingAll) return;
        setMarkingAll(true);
        const previous = notifications;
        setNotifications((current) => current.map((item) => ({ ...item, read: true })));
        try {
            await client.patch('/notifications/read-all');
        } catch (err) {
            console.error('mark all read error:', err.response?.data ?? err.message);
            setNotifications(previous);
        } finally {
            setMarkingAll(false);
        }
    }, [markingAll, notifications, unreadCount]);

    const handleToggleExpand = useCallback(async (notification) => {
        if (!notification.read) {
            await markNotificationRead(notification);
        }
        setExpandedNotifIds((prev) => ({
            ...prev,
            [notification.id]: !prev[notification.id],
        }));
    }, [markNotificationRead]);

    const handleActionPress = useCallback((notification) => {
        if (notification.route) {
            router.push(notification.route);
        }
    }, [router]);



    const filteredNotifications = activeFilter === 'all'
        ? notifications
        : notifications.filter((n) => n.type === activeFilter);
    const groups = groupByDate(filteredNotifications);
    const hasAny = filteredNotifications.length > 0;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={NOTIF_COLORS.bg} />

            <PremiumPullToRefresh
                ref={pullToRefreshRef}
                refreshing={refreshing}
                onRefresh={onRefresh}
                iconName="notifications"
                headerHeight={56}
                onScrollEnabledChange={setScrollEnabled}
                header={
                    <View style={styles.topRow}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="chevron-left" size={22} color={NOTIF_COLORS.dark} />
                        </TouchableOpacity>
                        <View style={styles.topRowRight}>
                            <NotificationBell style={styles.iconBtn} iconColor={NOTIF_COLORS.dark} />
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
                        contentContainerStyle={{
                            paddingBottom: 120 + Math.max(insets.bottom, 24),
                        }}
                        onScroll={(e) => pullToRefreshRef.current?.handleScroll(e)}
                        scrollEventThrottle={16}
                        overScrollMode="never"
                    >
                        {/* ─── Header ─── */}
                        <View style={styles.headerSection}>
                            <View style={styles.headerTitleRow}>
                                <View style={styles.headerIconBadge}>
                                    <MaterialIcons name="notifications" size={20} color={NOTIF_COLORS.white} />
                                </View>
                                <Text style={styles.headerTitle}>Notifications</Text>
                            </View>
                            <Text style={styles.headerSub}>Stay updated on important updates</Text>
                        </View>

                        {/* ─── Filter pills ─── */}
                        <ScrollView
                            horizontal
                            scrollEnabled={scrollEnabled}
                            showsHorizontalScrollIndicator={false}
                            style={styles.filterScroller}
                            contentContainerStyle={styles.filterRow}
                        >
                            {FILTER_PILLS.map((pill) => {
                                const isActive = activeFilter === pill.key;
                                const count = pill.key === 'all'
                                    ? unreadCount
                                    : notifications.filter((n) => n.type === pill.key && !n.read).length;
                                return (
                                    <TouchableOpacity
                                        key={pill.key}
                                        style={[styles.filterPill, isActive && styles.filterPillActive]}
                                        onPress={() => setActiveFilter(pill.key)}
                                        activeOpacity={0.75}
                                    >
                                        <MaterialIcons
                                            name={pill.icon}
                                            size={18}
                                            color={isActive ? NOTIF_COLORS.white : NOTIF_COLORS.primary}
                                        />
                                        {count > 0 && (
                                            <View style={styles.filterBadge}>
                                                <Text style={styles.filterBadgeText}>
                                                    {count > 99 ? '99+' : count}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    {/* ─── Count + mark all ─── */}
                    <View style={styles.tabRow}>
                        <Text style={styles.tabCountText}>
                            {activeFilterUnreadCount ? `${activeFilterUnreadCount} unread` : 'Recents'}
                        </Text>
                        <TouchableOpacity
                            style={styles.markAllBtn}
                            onPress={markAllRead}
                            disabled={!unreadCount || markingAll}
                        >
                            <Text
                                style={
                                    unreadCount
                                        ? styles.markAllText
                                        : styles.markAllTextDisabled
                                }
                            >
                                {markingAll ? 'Marking...' : 'Mark all as read'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ─── Grouped lists or empty state ─── */}
                    {hasAny ? (
                        <>
                            <NotificationGroup
                                label="Today"
                                items={groups.today}
                                expandedNotifIds={expandedNotifIds}
                                onToggleExpand={handleToggleExpand}
                                onActionPress={handleActionPress}
                                showDivider={false}
                            />
                            <NotificationGroup
                                label="Yesterday"
                                items={groups.yesterday}
                                expandedNotifIds={expandedNotifIds}
                                onToggleExpand={handleToggleExpand}
                                onActionPress={handleActionPress}
                                showDivider={groups.today.length > 0}
                            />
                            <NotificationGroup
                                label="Older"
                                items={groups.older}
                                expandedNotifIds={expandedNotifIds}
                                onToggleExpand={handleToggleExpand}
                                onActionPress={handleActionPress}
                                showDivider={
                                    groups.today.length > 0 || groups.yesterday.length > 0
                                }
                            />
                        </>
                    ) : (
                        <EmptyState />
                    )}
                    </ScrollView>
            </PremiumPullToRefresh>

            <BottomNavigation activeTab="none" />
            <LoadingOverlay visible={loading} />
        </SafeAreaView>
    );
}
