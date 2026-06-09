import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import client from '../../api/client';
import { addNotificationReceivedListener } from '../services/pushNotifications';

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
            setUnreadCount(Number(res.data?.count ?? 0));
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

    return (
        <TouchableOpacity
            style={style}
            onPress={() => router.push('/tenant/notifications')}
            activeOpacity={0.8}
        >
            <Ionicons name="notifications-outline" size={iconSize} color={iconColor} />
            {unreadCount > 0 && (
                <View
                    style={[
                        componentStyles.badge,
                        badgeText.length > 1 && componentStyles.badgeWide,
                    ]}
                >
                    <Text style={componentStyles.badgeText}>{badgeText}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const componentStyles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -7,
        right: -8,
        minWidth: 19,
        height: 19,
        borderRadius: 10,
        paddingHorizontal: 5,
        backgroundColor: '#E8175D',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeWide: {
        minWidth: 24,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        lineHeight: 13,
        includeFontPadding: false,
        textAlign: 'center',
    },
});
