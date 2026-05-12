import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { scale, verticalScale, moderateScale } from '../utils/scale';

const TimePickerInput = ({ value, onChangeTime, label = 'Time of Visit' }) => {
    const [timeInput, setTimeInput] = useState(value?.split(' ')[0] || '13:00');
    const [period, setPeriod] = useState(value?.split(' ')[1] || 'PM');
    const [showPeriodScroll, setShowPeriodScroll] = useState(false);
    const periodScrollRef = useRef(null);

    const periodsArray = ['AM', 'PM'];
    const ITEM_HEIGHT = verticalScale(40);
    const VISIBLE_ITEMS = 3;

    const handleTimeChange = (text) => {
        // Only allow numbers and colon
        const filtered = text.replace(/[^0-9:]/g, '');

        // Auto-format as HH:MM
        if (filtered.length <= 2) {
            setTimeInput(filtered);
        } else if (filtered.length === 3 && !filtered.includes(':')) {
            setTimeInput(filtered.slice(0, 2) + ':' + filtered.slice(2));
        } else if (filtered.length <= 5) {
            const colonPos = filtered.indexOf(':');
            if (colonPos === -1) {
                if (filtered.length > 2) {
                    setTimeInput(filtered.slice(0, 2) + ':' + filtered.slice(2, 4));
                } else {
                    setTimeInput(filtered);
                }
            } else {
                setTimeInput(filtered);
            }
        }

        // Update parent
        if (onChangeTime) {
            onChangeTime(`${filtered || '00:00'} ${period}`);
        }
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        if (onChangeTime) {
            onChangeTime(`${timeInput} ${newPeriod}`);
        }
        setShowPeriodScroll(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.inputContainer}>
                {/* Time Input */}
                <TextInput
                    style={styles.timeInput}
                    placeholder="HH:MM"
                    placeholderTextColor={COLORS.muted}
                    value={timeInput}
                    onChangeText={handleTimeChange}
                    maxLength={5}
                    keyboardType="decimal-pad"
                />

                {/* AM/PM Scrollable Selector */}
                <TouchableOpacity
                    style={styles.periodButton}
                    onPress={() => setShowPeriodScroll(!showPeriodScroll)}
                >
                    <Text style={styles.periodText}>{period}</Text>
                    <MaterialIcons
                        name={showPeriodScroll ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={18}
                        color={COLORS.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* Period Scroll - Small Dropdown */}
            {showPeriodScroll && (
                <View style={styles.periodDropdown}>
                    {periodsArray.map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.periodDropdownItem,
                                period === p && styles.periodDropdownItemActive,
                            ]}
                            onPress={() => handlePeriodChange(p)}
                        >
                            <Text
                                style={[
                                    styles.periodDropdownText,
                                    period === p && styles.periodDropdownTextActive,
                                ]}
                            >
                                {p}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: verticalScale(10),
    },
    label: {
        fontSize: moderateScale(11),
        color: COLORS.muted,
        marginBottom: verticalScale(4),
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        overflow: 'hidden',
    },
    timeInput: {
        flex: 1,
        paddingVertical: verticalScale(11),
        paddingHorizontal: scale(12),
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: COLORS.primary,
    },
    periodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(11),
        borderLeftWidth: 1,
        borderLeftColor: COLORS.border,
        gap: 4,
    },
    periodText: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: COLORS.primary,
    },
    periodDropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: verticalScale(4),
        backgroundColor: COLORS.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        minWidth: scale(70),
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    periodDropdownItem: {
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        alignItems: 'center',
    },
    periodDropdownItemActive: {
        backgroundColor: 'rgba(214, 51, 117, 0.1)',
    },
    periodDropdownText: {
        fontSize: moderateScale(12),
        fontWeight: '500',
        color: COLORS.muted,
    },
    periodDropdownTextActive: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: COLORS.primary,
    },
});

export default TimePickerInput;
