import React, { useCallback, useEffect, useState } from 'react';
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
import styles, { COLORS } from '../../src/constants/announcementsstyles';
import { useUser } from '../../src/context/UserContext';
import client from '../../api/client';
import { addNotificationReceivedListener } from '../../src/services/pushNotifications';

const defaultPhoto = require('../../assets/def_icon.png');

const TYPE_META = {
    announcement: {
        label: 'Announcement',
        icon: 'campaign',
        color: '#FF9800',
        route: '/tenant/announcements',
    },
    document: {
        label: 'Document',
        icon: 'description',
        color: COLORS.primary,
        route: '/tenant/records',
    },
    bill: {
        label: 'Water Bill',
        icon: 'water-drop',
        color: '#2196F3',
        route: '/tenant/water-bill',
    },
    payment: {
        label: 'Payment',
        icon: 'payments',
        color: '#4CAF50',
        route: '/tenant/water-bill',
    },
    maintenance: {
        label: 'Maintenance',
        icon: 'build',
        color: '#795548',
        route: '/tenant/maintenancehistory',
    },
    emergency: {
        label: 'Emergency',
        icon: 'warning',
        color: '#FF6B6B',
        route: '/tenant/emergency',
    },
    visitor: {
        label: 'Visitor',
        icon: 'person-add',
        color: '#7E57C2',
        route: '/tenant/visitors',
    },
};

const getTypeMeta = (type) => TYPE_META[type] ?? {
    label: 'Notification',
    icon: 'notifications',
    color: COLORS.primary,
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

const mapNotification = (notification) => {
    const type = notification.type ?? 'notification';
    const meta = getTypeMeta(type);

    return {
        id: notification.notif_id,
        type,
        title: meta.label,
        description: notification.message ?? '',
        timestamp: formatDateTime(notification.created_at),
        read: Boolean(notification.is_read),
        refId: notification.ref_id,
        route: meta.route,
        icon: meta.icon,
        color: meta.color,
    };
};

const NotificationItem = ({ item, onPress }) => (
    <TouchableOpacity
        style={[
            styles.notificationItem,
            !item.read && { backgroundColor: '#FFF5F8' },
        ]}
        onPress={onPress}
        activeOpacity={0.82}
    >
        <View style={[styles.notifAvatar, { backgroundColor: item.color }]}>
            <MaterialIcons name={item.icon} size={24} color={COLORS.white} />
        </View>
        <View style={styles.notifContent}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            {!!item.description && (
                <Text style={styles.notifDescription}>{item.description}</Text>
            )}
            <Text style={styles.notifTime}>{item.timestamp}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
);

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

export default function NotificationsScreen() {
    const router = useRouter();
    const { avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('notifications');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    const unreadCount = notifications.filter((notification) => !notification.read).length;

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

    useEffect(() => {
        const subscription = addNotificationReceivedListener(() => {
            fetchNotifications();
        });

        return () => subscription.remove();
    }, [fetchNotifications]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, [fetchNotifications]);

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
            console.error('mark notification read error:', err.response?.data ?? err.message);
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
            console.error('mark all notifications read error:', err.response?.data ?? err.message);
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

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <View style={styles.topRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.topRowRight}>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => router.push('/tenant/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
                        {unreadCount > 0 && <View style={styles.notifDot} />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                        <Image
                            source={avatarUri ? { uri: avatarUri } : defaultPhoto}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.headerSection}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <Text style={styles.headerSub}>
                    Stay updated on important updates
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 24) }}
                >
                    <View style={styles.tabRow}>
                        <Text style={styles.tabText}>
                            {unreadCount ? `${unreadCount} unread` : 'Recents'}
                        </Text>
                        <TouchableOpacity
                            style={{ marginLeft: 'auto' }}
                            onPress={markAllRead}
                            disabled={!unreadCount || markingAll}
                        >
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: unreadCount ? COLORS.primary : COLORS.muted,
                                    fontWeight: '500',
                                }}
                            >
                                {markingAll ? 'Marking...' : 'Mark all as read'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {notifications.length ? (
                        notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                item={notification}
                                onPress={() => handleNotificationPress(notification)}
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No notifications yet.</Text>
                    )}
                </ScrollView>
            )}

            <View style={[
                styles.bottomNav,
                { paddingBottom: Math.max(insets.bottom, 24) },
            ]}>
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
