import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function BottomNavigation({ activeTab }) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const tabs = [
        { id: 'home', icon: 'home', label: 'Home', route: '/tenant/dashboard' },
        { id: 'visitor', icon: 'person-outline', label: 'Visitor', route: '/tenant/visitors' },
        { id: 'emergency', icon: 'warning', label: 'Emergency', route: '/tenant/emergency', isCenter: true },
        { id: 'billing', icon: 'water-drop', label: 'Water Bill', route: '/tenant/water-bill' },
        { id: 'profile', icon: 'account-circle', label: 'Profile', route: '/tenant/profile' }
    ];

    const handlePress = (tab) => {
        if (tab.route) {
            router.push(tab.route);
        }
    };

    return (
        <View style={[
            styles.container,
            { bottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }
        ]}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                if (tab.isCenter) {
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={styles.centerItem}
                            onPress={() => handlePress(tab)}
                            activeOpacity={0.85}
                            accessibilityLabel={tab.label}
                            accessibilityRole="button"
                        >
                            <View style={[
                                styles.centerCircle,
                                isActive && styles.activeCenterCircle
                            ]}>
                                <MaterialIcons name={tab.icon} size={32} color={COLORS.white} />
                            </View>
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={tab.id}
                        style={styles.navItem}
                        onPress={() => handlePress(tab)}
                        activeOpacity={0.7}
                        accessibilityLabel={tab.label}
                        accessibilityRole="button"
                    >
                        <MaterialIcons
                            name={tab.icon}
                            size={25}
                            color={isActive ? COLORS.primary : COLORS.dark}
                            style={isActive ? styles.activeIcon : styles.inactiveIcon}
                        />
                        {isActive && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'absolute',
        left: 16,
        right: 16,
        backgroundColor: 'rgba(255, 228, 240, 0.98)',
        borderWidth: 1.5,
        borderColor: COLORS.primaryLight,
        borderRadius: 999,
        height: 64,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        shadowColor: '#2D1B2E',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
        zIndex: 99,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    activeIcon: {
        transform: [{ translateY: -1 }],
    },
    inactiveIcon: {
        opacity: 0.6,
    },
    activeDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: COLORS.primary,
        marginTop: 4,
        position: 'absolute',
        bottom: 10,
    },
    centerItem: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: 68,
    },
    centerCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -26,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    activeCenterCircle: {
        backgroundColor: '#C51F5F',
        borderWidth: 1.5,
        borderColor: COLORS.white,
    }
});
