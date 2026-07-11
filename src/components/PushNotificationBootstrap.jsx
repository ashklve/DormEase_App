import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
    addNotificationResponseListener,
    addNotificationReceivedListener,
    getLastNotificationRoute,
    registerForPushNotificationsAsync,
} from '../services/pushNotifications';
import { useUser } from '../context/UserContext';

let AudioModule;
try {
    AudioModule = require('expo-audio');
} catch (e) {
    console.warn("expo-audio module is not available. Sound will be disabled.");
}

const { width } = Dimensions.get('window');

export default function PushNotificationBootstrap() {
    const router = useRouter();
    const { user } = useUser();
    const [activeEmergency, setActiveEmergency] = useState(null);
    const soundRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(0.15)).current;

    useEffect(() => {
        const role = user?.role;
        const accountId = user?.account_id;
        const isTenant = role === 'tenant' || (accountId && String(accountId).startsWith('TNT'));

        if (isTenant) {
            registerForPushNotificationsAsync();
        }
    }, [user]);

    useEffect(() => {
        const subscription = addNotificationResponseListener((route) => {
            router.push(route);
        });

        return () => subscription.remove();
    }, [router]);

    useEffect(() => {
        const route = getLastNotificationRoute();
        if (route) router.push(route);
    }, [router]);

    // Foreground listener for emergency alerts
    useEffect(() => {
        const subscription = addNotificationReceivedListener((notification) => {
            const data = notification.request.content.data;
            if (data?.type === 'emergency') {
                setActiveEmergency({
                    title: notification.request.content.title || 'Emergency Alert',
                    body: notification.request.content.body || 'An emergency has been reported.',
                    location: data.location || 'Unknown Location',
                    emergencyType: data.emergency_type || 'General Alert',
                    route: data.route,
                });
            }
        });

        return () => subscription.remove();
    }, []);

    // Siren sound playback and looping controller
    useEffect(() => {
        if (activeEmergency) {
            if (AudioModule && AudioModule.AudioPlayer) {
                // Load and play the loop sound
                const playSiren = async () => {
                    try {
                        const player = new AudioModule.AudioPlayer(require('../../assets/siren.wav'));
                        player.loop = true;
                        player.play();
                        soundRef.current = player;
                    } catch (error) {
                        console.warn('Failed to load/play emergency sound:', error);
                    }
                };
                playSiren();
            } else {
                console.warn('Sound will be muted because AudioPlayer (expo-audio) is not available.');
            }

            // Start background red/orange flashing animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 0.85,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0.15,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            // Stop sound when emergency is cleared
            if (soundRef.current) {
                try {
                    soundRef.current.release();
                } catch (e) {
                    console.warn('Failed to release sound:', e);
                } finally {
                    soundRef.current = null;
                }
            }
            pulseAnim.setValue(0.15);
        }

        return () => {
            if (soundRef.current) {
                try {
                    soundRef.current.release();
                } catch (e) {}
            }
        };
    }, [activeEmergency]);

    const handleAcknowledge = async () => {
        // Halt the alarm sound instantly on button tap
        if (soundRef.current) {
            try {
                soundRef.current.release();
            } catch (e) {
                console.warn('Failed to release sound on acknowledge:', e);
            } finally {
                soundRef.current = null;
            }
        }

        const route = activeEmergency?.route || '/tenant/emergencyhistory';
        setActiveEmergency(null);
        router.push(route);
    };

    return (
        <Modal
            visible={!!activeEmergency}
            transparent={true}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Pulsing visual alert background */}
                <Animated.View style={[styles.pulseBackground, { opacity: pulseAnim }]} />
                
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="warning" size={48} color="#FF3B30" />
                    </View>
                    
                    <Text style={styles.alertTitle}>CRITICAL WARNING</Text>
                    <Text style={styles.emergencyType}>{activeEmergency?.emergencyType}</Text>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.infoRow}>
                        <MaterialIcons name="place" size={20} color="#666" />
                        <Text style={styles.infoLabel}>Location:</Text>
                        <Text style={styles.infoValue}>{activeEmergency?.location || 'Unspecified'}</Text>
                    </View>
                    
                    <Text style={styles.descriptionText}>
                        {activeEmergency?.body}
                    </Text>

                    <TouchableOpacity 
                        style={styles.btn} 
                        activeOpacity={0.8}
                        onPress={handleAcknowledge}
                    >
                        <Text style={styles.btnText}>ACKNOWLEDGE ALERT</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FF3B30',
    },
    card: {
        width: width * 0.88,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFEBEA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF3B30',
        letterSpacing: 2,
        marginBottom: 4,
    },
    emergencyType: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1C1C1E',
        marginBottom: 16,
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E5E5EA',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginLeft: 6,
        marginRight: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#1C1C1E',
        flex: 1,
    },
    descriptionText: {
        fontSize: 15,
        color: '#48484A',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    btn: {
        width: '100%',
        backgroundColor: '#FF3B30',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
