import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import client from '../../api/client';
import { addNotificationReceivedListener, setBadgeCount } from '../services/pushNotifications';

export default function NotificationBell({
    style,
    iconColor = '#2D1B2E',
    iconSize = 22,
}) {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await client.get('/notifications/unread-count', { timeout: 10000 });
            const count = Number(res.data?.count ?? 0);
            setUnreadCount(count);
            setBadgeCount(count);
        } catch (err) {
            console.warn('fetch unread notification count error:', err.response?.data ?? err.message);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUnreadCount();

            const subscription = addNotificationReceivedListener(() => {
                fetchUnreadCount();
            });

            return () => subscription.remove();
        }, [fetchUnreadCount])
    );

    const badgeText = unreadCount > 99 ? '99+' : String(unreadCount);
    const badgeSizeStyle = badgeText.length >= 3
        ? componentStyles.badgeLarge
        : badgeText.length === 2
            ? componentStyles.badgeMedium
            : null;

    return (
        <TouchableOpacity
            style={[componentStyles.button, style]}
            onPress={() => router.push('/tenant/notifications')}
            activeOpacity={0.8}
        >
            <Ionicons name="notifications-outline" size={iconSize} color={iconColor} />
            {unreadCount > 0 && (
                <View
                    style={[
                        componentStyles.badge,
                        badgeSizeStyle,
                    ]}
                >
                    <Text
                        style={componentStyles.badgeText}
                        numberOfLines={1}
                        allowFontScaling={false}
                    >
                        {badgeText}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const componentStyles = StyleSheet.create({
    button: {
        position: 'relative',
        overflow: 'visible',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E8175D',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeMedium: {
        width: 26,
        right: -13,
    },
    badgeLarge: {
        width: 32,
        right: -17,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        lineHeight: 12,
        includeFontPadding: false,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
});
