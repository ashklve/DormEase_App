import React, { useCallback, useState } from 'react';
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
import { addNotificationReceivedListener } from '../../src/services/pushNotifications';

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
        route: '/tenant/emergency',
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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const groups = { today: [], yesterday: [], older: [] };

    notifications.forEach((n) => {
        const d = new Date(n._rawDate ?? n.timestamp);
        if (d >= startOfToday) groups.today.push(n);
        else if (d >= startOfYesterday) groups.yesterday.push(n);
        else groups.older.push(n);
    });

    return groups;
};

const mapNotification = (notification) => {
    const type = notification.type ?? 'notification';
    const meta = getTypeMeta(type);

    return {
        id: notification.notif_id,
        type,
        title: meta.label,
        description: notification.message ?? '',
        timestamp: formatDateTime(notification.created_at),
        _rawDate: notification.created_at,
        read: Boolean(notification.is_read),
        refId: notification.ref_id,
        route: meta.route,
        icon: meta.icon,
        avatarBg: meta.avatarBg,
        iconColor: meta.iconColor,
    };
};

/* ─── Single notification row ─── */
const NotificationItem = ({ item, onPress }) => (
    <TouchableOpacity
        style={[
            styles.notificationItem,
            !item.read && styles.notificationItemUnread,
        ]}
        onPress={onPress}
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
                <Text style={styles.notifDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            )}
            <Text style={styles.notifTime}>{item.timestamp}</Text>
        </View>

        {/* Unread indicator */}
        {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
);

/* ─── Date group block ─── */
const NotificationGroup = ({ label, items, onPress, showDivider }) => {
    if (!items?.length) return null;
    return (
        <>
            {showDivider && <View style={styles.groupDivider} />}
            <Text style={styles.sectionLabel}>{label}</Text>
            {items.map((item) => (
                <NotificationItem key={item.id} item={item} onPress={() => onPress(item)} />
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
const NavItem = ({ iconName, label, isActive, isCenter, onPress }) => (
    <TouchableOpacity
        style={[styles.navItem, isCenter && styles.navCenter]}
        onPress={onPress}
    >
        {isCenter ? (
            <View style={styles.navCenterCircle}>
                <MaterialIcons name={iconName} size={26} color={NOTIF_COLORS.white} />
            </View>
        ) : (
            <>
                <MaterialIcons
                    name={iconName}
                    size={24}
                    color={isActive ? NOTIF_COLORS.primary : '#9E9E9E'}
                />
                <Text
                    style={[
                        styles.navLabel,
                        isActive && { color: NOTIF_COLORS.primary },
                    ]}
                >
                    {label}
                </Text>
            </>
        )}
    </TouchableOpacity>
);

/* ═══════════════════════════════════════════ */
/*                 Main screen                */
/* ═══════════════════════════════════════════ */

export default function NotificationsScreen() {
    const router = useRouter();
    const { avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('notifications');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    const unreadCount = notifications.filter((n) => !n.read).length;

    /* ─── Fetch ─── */
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await client.get('/notifications', { timeout: 15000 });
            const rows = Array.isArray(res.data?.data)
                ? res.data.data
                : Array.isArray(res.data)
                    ? res.data
                    : [];
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

    const handleNotificationPress = async (notification) => {
        await markNotificationRead(notification);
        if (notification.route) router.push(notification.route);
    };

    const tabNavigate = (tab, route) => {
        setActiveTab(tab);
        if (route) router.push(route);
    };

    const filteredNotifications = activeFilter === 'all'
        ? notifications
        : notifications.filter((n) => n.type === activeFilter);
    const groups = groupByDate(filteredNotifications);
    const hasAny = filteredNotifications.length > 0;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={NOTIF_COLORS.bg} />

            {/* ─── Top row ─── */}
            <View style={styles.topRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={NOTIF_COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.topRowRight}>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => router.push('/tenant/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={22} color={NOTIF_COLORS.dark} />
                        {unreadCount > 0 && (
                            <View style={styles.badgeWrap}>
                                <Text style={styles.badgeText}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                        <Image
                            source={avatarUri ? { uri: avatarUri } : defaultPhoto}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>
            </View>

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
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroller}
                contentContainerStyle={styles.filterRow}
            >
                {FILTER_PILLS.map((pill) => {
                    const isActive = activeFilter === pill.key;
                    const hasUnread = pill.key === 'all'
                        ? unreadCount > 0
                        : notifications.some((n) => n.type === pill.key && !n.read);
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
                            {hasUnread && <View style={styles.filterUnreadDot} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* ─── Loading ─── */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={NOTIF_COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[NOTIF_COLORS.primary]}
                            tintColor={NOTIF_COLORS.primary}
                        />
                    }
                    contentContainerStyle={{
                        paddingBottom: 120 + Math.max(insets.bottom, 24),
                    }}
                >
                    {/* ─── Count + mark all ─── */}
                    <View style={styles.tabRow}>
                        <Text style={styles.tabCountText}>
                            {unreadCount ? `${unreadCount} unread` : 'Recents'}
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
                                onPress={handleNotificationPress}
                                showDivider={false}
                            />
                            <NotificationGroup
                                label="Yesterday"
                                items={groups.yesterday}
                                onPress={handleNotificationPress}
                                showDivider={groups.today.length > 0}
                            />
                            <NotificationGroup
                                label="Older"
                                items={groups.older}
                                onPress={handleNotificationPress}
                                showDivider={
                                    groups.today.length > 0 || groups.yesterday.length > 0
                                }
                            />
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </ScrollView>
            )}

            {/* ─── Bottom nav ─── */}
            <View
                style={[
                    styles.bottomNav,
                    { paddingBottom: Math.max(insets.bottom, 24) },
                ]}
            >
                <NavItem
                    iconName="home"
                    label="Home"
                    isActive={activeTab === 'home'}
                    onPress={() => tabNavigate('home', '/tenant/dashboard')}
                />
                <NavItem
                    iconName="person-outline"
                    label="Visitor"
                    isActive={activeTab === 'visitor'}
                    onPress={() => tabNavigate('visitor', '/tenant/visitors')}
                />
                <NavItem
                    iconName="warning"
                    label="Emergency"
                    isCenter
                    isActive={activeTab === 'emergency'}
                    onPress={() => tabNavigate('emergency', '/tenant/emergency')}
                />
                <NavItem
                    iconName="water-drop"
                    label="Water Bill"
                    isActive={activeTab === 'bill'}
                    onPress={() => tabNavigate('bill', '/tenant/water-bill')}
                />
                <NavItem
                    iconName="person"
                    label="Profile"
                    isActive={activeTab === 'profile'}
                    onPress={() => tabNavigate('profile', '/tenant/profile')}
                />
            </View>
        </SafeAreaView>
    );
}
