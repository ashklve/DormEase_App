import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/colors';

export default function PaymentCancelledScreen() {
    const router = useRouter();

    useEffect(() => {
        global.paymentRedirected = true;
        const timer = setTimeout(() => {
            router.replace('/tenant/water-bill');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Ionicons name="close-circle" size={80} color="#DC3545" />
                <Text style={styles.title}>Payment Cancelled</Text>
                <Text style={styles.subtitle}>You will be redirected shortly...</Text>
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCE8F1',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        width: '100%',
        maxWidth: 340,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginTop: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#7A5F6E',
        marginTop: 10,
        textAlign: 'center',
    },
});
