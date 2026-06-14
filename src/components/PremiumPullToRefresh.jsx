import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Animated, PanResponder, Easing } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome, Octicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const PremiumPullToRefresh = forwardRef(({
    refreshing,
    onRefresh,
    iconName = 'refresh',
    iconType = 'material',
    iconColor = COLORS.primary,
    bgColor = COLORS.white,
    header,
    headerHeight = 0,
    onScrollEnabledChange,
    children,
}, ref) => {
    const pullAmount = useRef(new Animated.Value(0)).current;
    const currentPull = useRef(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const isAtTop = useRef(true);
    const startedAtTop = useRef(true);
    const captureDy = useRef(0);

    useEffect(() => {
        setIsRefreshing(refreshing);
        if (!refreshing) {
            Animated.spring(pullAmount, {
                toValue: 0,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            }).start();
            currentPull.current = 0;
        }
    }, [refreshing]);

    const handleScroll = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        // Use <= 2 to account for minor floating point rounding differences
        isAtTop.current = y <= 2;
    };

    // Expose handleScroll to parent via ref
    useImperativeHandle(ref, () => ({
        handleScroll,
    }));

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => {
                startedAtTop.current = isAtTop.current;
                if (startedAtTop.current && !isRefreshing) {
                    // Pre-emptively disable scroll on touch down to prevent native ScrollView from hijacking a fast drag on Android
                    onScrollEnabledChange?.(false);
                }
                return false;
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                const { dy, dx } = gestureState;
                if (startedAtTop.current && !isRefreshing) {
                    if (dy > 2 && dy > Math.abs(dx)) {
                        return true;
                    }
                    if (dy < -2) {
                        onScrollEnabledChange?.(true);
                    }
                }
                return false;
            },
            onMoveShouldSetPanResponder: () => false,
            onPanResponderGrant: (evt, gestureState) => {
                captureDy.current = gestureState.dy;
            },
            onPanResponderMove: (evt, gestureState) => {
                const relativeDy = gestureState.dy - captureDy.current;
                if (relativeDy <= 0) {
                    pullAmount.setValue(0);
                    currentPull.current = 0;
                    return;
                }
                // Elastic/damping resistance
                const limit = 150;
                const newPull = limit * (1 - Math.exp(-relativeDy / 300));
                pullAmount.setValue(newPull);
                currentPull.current = newPull;
            },
            onPanResponderRelease: (evt, gestureState) => {
                onScrollEnabledChange?.(true); // Re-enable scrolling
                if (currentPull.current >= 70) {
                    Animated.spring(pullAmount, {
                        toValue: 56,
                        tension: 50,
                        friction: 8,
                        useNativeDriver: true,
                    }).start();
                    currentPull.current = 56;
                    onRefresh();
                } else {
                    Animated.spring(pullAmount, {
                        toValue: 0,
                        tension: 40,
                        friction: 8,
                        useNativeDriver: true,
                    }).start();
                    currentPull.current = 0;
                }
            },
            onPanResponderTerminate: (evt, gestureState) => {
                onScrollEnabledChange?.(true);
                Animated.spring(pullAmount, {
                    toValue: refreshing ? 56 : 0,
                    tension: 40,
                    friction: 8,
                    useNativeDriver: true,
                }).start();
                currentPull.current = refreshing ? 56 : 0;
            },
            onResponderTerminationRequest: () => false,
        })
    ).current;

    const spinAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        let animation;
        if (isRefreshing) {
            spinAnim.setValue(0);
            animation = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            animation.start();
        } else {
            spinAnim.setValue(0);
        }
        return () => {
            if (animation) animation.stop();
        };
    }, [isRefreshing]);

    const rotatePull = pullAmount.interpolate({
        inputRange: [0, 80],
        outputRange: ['0deg', '360deg'],
        extrapolate: 'clamp',
    });

    const rotateSpin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const rotation = isRefreshing ? rotateSpin : rotatePull;

    const scale = pullAmount.interpolate({
        inputRange: [0, 56],
        outputRange: [0.3, 1],
        extrapolate: 'clamp',
    });

    const opacity = pullAmount.interpolate({
        inputRange: [0, 30],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // Animate from headerHeight - 10 (hidden behind header) down to headerHeight + 20
    const iconTranslateY = pullAmount.interpolate({
        inputRange: [0, 80],
        outputRange: [headerHeight - 10, headerHeight + 20],
        extrapolate: 'clamp',
    });

    let IconComponent;
    switch (iconType) {
        case 'ionicons':
            IconComponent = Ionicons;
            break;
        case 'fontawesome':
            IconComponent = FontAwesome;
            break;
        case 'octicons':
            IconComponent = Octicons;
            break;
        default:
            IconComponent = MaterialIcons;
    }

    return (
        <View
            style={styles.container}
            {...panResponder.panHandlers}
            onTouchEnd={() => {
                // Ensure scroll is re-enabled when the touch ends (e.g. after a tap or cancelled gesture)
                onScrollEnabledChange?.(true);
            }}
            onTouchCancel={() => {
                onScrollEnabledChange?.(true);
            }}
        >
            {header}

            <Animated.View
                style={[
                    styles.refreshIconContainer,
                    {
                        opacity,
                        transform: [
                            { translateY: iconTranslateY },
                            { scale },
                            { rotate: rotation },
                        ],
                        backgroundColor: bgColor,
                    },
                ]}
            >
                <IconComponent name={iconName} size={22} color={iconColor} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        transform: [{ translateY: pullAmount }],
                    },
                ]}
            >
                {children}
            </Animated.View>
        </View>
    );
});

PremiumPullToRefresh.displayName = 'PremiumPullToRefresh';

export default PremiumPullToRefresh;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: 'transparent',
    },
    refreshIconContainer: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 9999,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 6,
    },
    contentContainer: {
        flex: 1,
    },
});
