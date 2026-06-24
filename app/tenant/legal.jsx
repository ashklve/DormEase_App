import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import styles, { COLORS } from '../../src/constants/settingsstyles';

const NavRow = ({ icon, label, valueLabel, onPress, divider }) => (
    <TouchableOpacity
        style={[styles.row, divider && styles.rowDivider]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.iconWrap}>
            {icon}
        </View>
        <View style={styles.rowBody}>
            <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <View style={styles.rowRight}>
            {valueLabel ? <Text style={styles.rowValue}>{valueLabel}</Text> : null}
            <MaterialIcons name="chevron-right" size={20} color={COLORS.muted} />
        </View>
    </TouchableOpacity>
);

export default function LegalScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleOpenPrivacy = async () => {
        try {
            await WebBrowser.openBrowserAsync('https://srbdormease.com/privacy-policy');
        } catch (error) {
            console.error('Failed to open privacy policy:', error);
            Alert.alert('Error', 'Unable to open Privacy Policy at this moment.');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F0F2" />

            {/* ── Top Bar ── */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="chevron-left" size={22} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Legal Info</Text>
            </View>

            {/* ── Content ── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.sectionLabel}>
                    Review our terms and legal documents
                </Text>

                <View style={styles.groupCard}>
                    <NavRow
                        icon={<MaterialIcons name="privacy-tip" size={18} color={COLORS.primary} />}
                        label="Privacy Policy"
                        onPress={handleOpenPrivacy}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
