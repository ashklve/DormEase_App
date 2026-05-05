import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    FlatList,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles, { COLORS } from '../../src/constants/announcementsstyles';

const defaultPhoto = require('../../assets/def_icon.png');

// placeholder notifications — replace with real data from your database later
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: 'Admin has posted a new documents for your review',
        description: 'dorm-policy-feb2026.pdf · 324 kb',
        timestamp: 'Today, 11:42 AM',
        type: 'document',
        read: false,
        avatar: '👤',
    },
    {
        id: '2',
        title: 'Emergency report acknowledged.',
        description: 'Staff are responding now.',
        timestamp: 'Today, 10:35 AM',
        type: 'emergency',
        read: false,
        avatar: '⚠️',
    },
    {
        id: '3',
        title: 'Your water bill payment has been recorded successfully.',
        timestamp: 'Today, 9:18 AM',
        type: 'payment',
        read: true,
        avatar: '💧',
    },
    {
        id: '4',
        title: 'New announcement has been posted.',
        timestamp: 'Today, 8:00 AM',
        type: 'announcement',
        read: true,
        avatar: '📣',
    },
    {
        id: '5',
        title: 'Your current water bill is ready to view and settle before the due date.',
        timestamp: 'Feb 16, 2026 · 5:00 PM',
        type: 'bill',
        read: true,
        avatar: '💸',
    },
];

// notification item component
const NotificationItem = ({ item, onPress }) => {
    const getAvatarColor = (type) => {
        switch (type) {
            case 'document':
                return COLORS.primary;
            case 'emergency':
                return '#FF6B6B';
            case 'payment':
                return '#4CAF50';
            case 'announcement':
                return '#FF9800';
            case 'bill':
                return '#2196F3';
            default:
                return COLORS.primary;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                !item.read && { backgroundColor: '#FFF5F8' },
            ]}
            onPress={onPress}
        >
            <View
                style={[
                    styles.notifAvatar,
                    { backgroundColor: getAvatarColor(item.type) },
                ]}
            >
                <Text style={styles.notifAvatarText}>{item.avatar}</Text>
            </View>
            <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                {item.description && (
                    <Text style={styles.notifDescription}>{item.description}</Text>
                )}
                <Text style={styles.notifTime}>{item.timestamp}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
};

// bottom nav item component
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

// main notifications screen
export default function NotificationsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('notifications');
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const handleNotificationPress = (notification) => {
        // Mark as read
        setNotifications(
            notifications.map((n) =>
                n.id === notification.id ? { ...n, read: true } : n
            )
        );

        // Navigate based on notification type
        switch (notification.type) {
            case 'announcement':
                router.push('/tenant/announcements');
                break;
            case 'bill':
            case 'payment':
                router.push('/tenant/water-bill');
                break;
            case 'emergency':
                router.push('/tenant/emergency');
                break;
            case 'document':
                // Navigate to documents when available
                break;
            default:
                break;
        }
    };

    const tabNavigate = (tab, route) => {
        setActiveTab(tab);
        if (route) router.push(route);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            {/* header row */}
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
                        <View style={styles.notifDot} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image source={defaultPhoto} style={styles.avatar} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* title section */}
            <View style={styles.headerSection}>
                <Text style={styles.headerTitle}>Notifications 🔔</Text>
                <Text style={styles.headerSub}>
                    Stay updated on important updates
                </Text>
            </View>

            {/* notifications list */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View style={styles.tabRow}>
                    <Text style={styles.tabText}>Recents</Text>
                    <TouchableOpacity style={{ marginLeft: 'auto' }}>
                        <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '500' }}>
                            Mark all as read
                        </Text>
                    </TouchableOpacity>
                </View>

                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        item={notification}
                        onPress={() => handleNotificationPress(notification)}
                    />
                ))}
            </ScrollView>

            {/* bottom nav */}
            <View style={styles.bottomNav}>
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
                    onPress={() => tabNavigate('visitor', '/tenant/visitor')}
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
