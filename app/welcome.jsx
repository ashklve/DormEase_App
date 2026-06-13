import React, { useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Animated, StatusBar, Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const PINK_PRIMARY = '#D63375';

export default function WelcomeScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

            {/* decorative background circles */}
            <View style={[styles.circle, { width: 320, height: 320, top: -120, right: -120 }]} />
            <View style={[styles.circle, { width: 220, height: 220, top: 120, left: -100 }]} />
            <View style={[styles.circle, { width: 180, height: 180, bottom: 180, right: -60 }]} />
            <View style={[styles.circle, { width: 120, height: 120, bottom: 80, left: 20 }]} />

            <Animated.View style={[styles.content, {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
            }]}>

                <Image
                    source={require('../assets/logov2.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.appName}>DormEase</Text>
                <Text style={styles.tagline}>Daily Dorm Living{'\n'}Made Simple</Text>
                <Text style={styles.desc}>
                    Access services, stay informed, and handle daily dorm needs with ease and convenience.
                </Text>

                <TouchableOpacity
                    style={styles.btn}
                    onPress={() => router.push('/auth/login')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.btnText}>Get Started</Text>
                </TouchableOpacity>

            </Animated.View>

            <Text style={styles.copyright}>Copyright © 2026 DormEase. All rights reserved.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PINK_PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: StatusBar.currentHeight || 44,
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: '#fff',
        opacity: 0.1,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 8,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 24,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 30,
    },
    desc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    btn: {
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 30,
        paddingVertical: 13,
        paddingHorizontal: 48,
    },
    btnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    copyright: {
        position: 'absolute',
        bottom: 20,
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
    },
});