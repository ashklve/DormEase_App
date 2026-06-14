import React, { useEffect, useRef } from 'react';
import {
    View, Image, Animated, StyleSheet,
    Dimensions, Modal,
} from 'react-native';

const { width } = Dimensions.get('window');
const PINK_PRIMARY = '#D63375';

export default function LoadingOverlay({ visible = false, onLoadComplete }) {
    const spinAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const spinLoop = useRef(null);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 60,
                    friction: 10,
                    useNativeDriver: true,
                }),
            ]).start();

            spinLoop.current = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            );
            spinLoop.current.start();
        } else {
            if (spinLoop.current) spinLoop.current.stop();
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                spinAnim.setValue(0);
                scaleAnim.setValue(0.85);
                if (onLoadComplete) onLoadComplete();
            });
        }
    }, [visible]);

    const rotate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.centerBox, { transform: [{ scale: scaleAnim }] }]}>
                    {/* spinning ring */}
                    <Animated.View style={[styles.spinnerRing, { transform: [{ rotate }] }]} />
                    {/* logo in center */}
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 240, 243, 0.97)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerBox: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinnerRing: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3.5,
        borderColor: 'transparent',
        borderTopColor: PINK_PRIMARY,
        borderRightColor: PINK_PRIMARY,
    },
    logo: {
        width: 72,
        height: 72,
    },
});