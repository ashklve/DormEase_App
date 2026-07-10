import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Safely require NetInfo to prevent app crashes when native module is not yet linked/compiled
let NetInfo = null;
try {
    NetInfo = require('@react-native-community/netinfo');
} catch (error) {
    console.warn('Failed to import @react-native-community/netinfo:', error);
}

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const insets = useSafeAreaInsets();

    // Animation value for translateY
    // We want the banner to start offscreen (e.g. translateY: 150) and slide up to 0.
    const slideAnim = useRef(new Animated.Value(150)).current;
    const timerRef = useRef(null);

    useEffect(() => {
        const activeNetInfo = NetInfo?.default || NetInfo;
        if (!activeNetInfo || typeof activeNetInfo.addEventListener !== 'function') {
            console.warn(
                '[@react-native-community/netinfo] Native module is not available. ' +
                'Please rebuild the app using: npm run android (or npx expo run:android)'
            );
            return;
        }

        // Subscribe to net info updates
        const unsubscribe = activeNetInfo.addEventListener((state) => {
            // NetInfo returns isConnected. It might be null on initial state.
            const offline = state.isConnected === false;

            // Clear any active timer on state change
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            if (offline) {
                setIsOffline(true);
                setShowSuccess(false);
                // Slide up
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }).start();
            } else {
                // If it was previously offline, show the success banner first
                if (isOffline) {
                    setShowSuccess(true);
                    setIsOffline(false);
                    // Slide up to success view (which will be rendered in the next cycle)
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }).start();

                    timerRef.current = setTimeout(() => {
                        Animated.timing(slideAnim, {
                            toValue: 150,
                            duration: 350,
                            useNativeDriver: true,
                        }).start(() => {
                            setShowSuccess(false);
                        });
                        timerRef.current = null;
                    }, 3000);
                } else {
                    setShowSuccess(false);
                    setIsOffline(false);
                    slideAnim.setValue(150);
                }
            }
        });

        return () => {
            unsubscribe();
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isOffline]);

    if (!isOffline && !showSuccess) {
        return null;
    }

    const bannerStyles = showSuccess ? styles.successBanner : styles.offlineBanner;
    const titleText = showSuccess ? 'Connection Restored' : 'Offline Mode';
    const descText = showSuccess
        ? 'Your internet connection is back online.'
        : 'Displaying cached data. Check your connection.';
    const iconName = showSuccess ? 'wifi' : 'cloud-offline';
    const iconColor = showSuccess ? '#1E8E22' : '#DF0404';

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    bottom: insets.bottom > 0 ? insets.bottom + 10 : 20,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={[styles.bannerContent, bannerStyles]}>
                <Ionicons name={iconName} size={20} color={iconColor} />
                <View style={styles.textContainer}>
                    <Text style={[styles.title, showSuccess ? styles.successTitle : styles.offlineTitle]}>
                        {titleText}
                    </Text>
                    <Text style={styles.desc}>
                        {descText}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        elevation: 10,
    },
    bannerContent: {
        width: width - 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 5,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    offlineBanner: {
        backgroundColor: '#FFF0F0',
        borderColor: '#FFD3D3',
    },
    successBanner: {
        backgroundColor: '#F0FFF0',
        borderColor: '#D3FFD3',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 2,
    },
    offlineTitle: {
        color: '#DF0404',
    },
    successTitle: {
        color: '#1E8E22',
    },
    desc: {
        fontSize: 11.5,
        color: '#6e6e6e',
    },
});
