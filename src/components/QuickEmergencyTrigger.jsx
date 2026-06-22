import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';
import { useUser } from '../context/UserContext';
import client from '../../api/client';

export default function QuickEmergencyTrigger() {
    const { user } = useUser();
    const lastClickTimeRef = useRef(0);
    const clickCountRef = useRef(0);
    const isAlertOpenRef = useRef(false);

    useEffect(() => {
        if (!user) return;

        // Hide native iOS and Android volume HUD to keep the trigger stealthy/clean
        VolumeManager.showNativeVolumeUI({ enabled: false });

        const subscription = VolumeManager.addVolumeListener(async (result) => {
            const currentTime = Date.now();
            const lastClickTime = lastClickTimeRef.current;

            // Track rapid consecutive button presses (within 2 seconds)
            if (currentTime - lastClickTime < 2000) {
                clickCountRef.current += 1;
            } else {
                clickCountRef.current = 1;
            }
            lastClickTimeRef.current = currentTime;

            // Reset volume level slightly off the limits (0 or 1) so future presses continue to fire events
            if (result.volume >= 1.0) {
                await VolumeManager.setVolume(0.95, { showUI: false });
            } else if (result.volume <= 0.0) {
                await VolumeManager.setVolume(0.05, { showUI: false });
            }

            if (clickCountRef.current >= 3) {
                clickCountRef.current = 0; // reset click count

                // Avoid triggering multiple alert dialogs simultaneously if they keep pressing
                if (isAlertOpenRef.current) return;
                isAlertOpenRef.current = true;

                Alert.alert(
                    'Send Panic Alert?',
                    'This will immediately alert staff with your room details.',
                    [
                        { 
                            text: 'Cancel', 
                            style: 'cancel',
                            onPress: () => { isAlertOpenRef.current = false; }
                        },
                        {
                            text: 'Send Now',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await client.post('/emergency', {
                                        type: 'Panic Alert',
                                        description: 'Panic alert sent from app.',
                                    });
                                    Alert.alert('Alert Sent!', 'Staff have been notified immediately.');
                                } catch (err) {
                                    Alert.alert('Error', 'Failed to send panic alert. Please try again.');
                                } finally {
                                    isAlertOpenRef.current = false;
                                }
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
        });

        return () => {
            subscription.remove();
            VolumeManager.showNativeVolumeUI({ enabled: true });
        };
    }, [user]);

    return null;
}
