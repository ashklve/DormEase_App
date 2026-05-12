import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    SafeAreaView,
    StyleSheet,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { scale, verticalScale, moderateScale } from '../utils/scale';

const DatePickerModal = ({ visible, onClose, onDateSelect, currentDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const handleDayPress = (day) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const formattedDate = `${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${String(selectedDate.getDate()).padStart(2, '0')}/${selectedDate.getFullYear()}`;
        onDateSelect(formattedDate);
        onClose();
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Selected Date Display */}
                    <View style={styles.dateDisplay}>
                        <Text style={styles.dateDisplayText}>
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getDate()}, {currentMonth.getFullYear()}
                        </Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <MaterialIcons name="close" size={18} color={COLORS.dark} />
                        </TouchableOpacity>
                    </View>

                    {/* Month Navigation */}
                    <View style={styles.monthNav}>
                        <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
                            <MaterialIcons name="keyboard-arrow-left" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                        <View style={styles.monthYearContainer}>
                            <Text style={styles.monthYear}>
                                {monthNames[currentMonth.getMonth()]}
                            </Text>
                            <Text style={styles.yearText}>
                                {currentMonth.getFullYear()}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
                            <MaterialIcons name="keyboard-arrow-right" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Day Headers */}
                    <View style={styles.dayHeaderRow}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <Text key={day} style={styles.dayHeader}>
                                {day}
                            </Text>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {days.map((day, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dayCell,
                                    day === null && styles.emptyCellFiller,
                                    day && styles.validDay,
                                ]}
                                onPress={() => day !== null && handleDayPress(day)}
                                disabled={day === null}
                            >
                                {day !== null && (
                                    <View style={[
                                        styles.dayCellContent,
                                        day === currentMonth.getDate() && styles.dayCellContentActive,
                                    ]}>
                                        <Text style={[
                                            styles.dayText,
                                            day === currentMonth.getDate() && styles.dayTextActive,
                                        ]}>
                                            {day}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(12),
        width: scale(280),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    dateDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(10),
        paddingBottom: verticalScale(8),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    dateDisplayText: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: COLORS.dark,
    },
    closeBtn: {
        padding: 4,
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    monthYearContainer: {
        alignItems: 'center',
        gap: 2,
    },
    navBtn: {
        padding: 6,
    },
    monthYear: {
        fontSize: moderateScale(12),
        fontWeight: '700',
        color: COLORS.dark,
    },
    yearText: {
        fontSize: moderateScale(11),
        fontWeight: '600',
        color: COLORS.muted,
    },
    dayHeaderRow: {
        flexDirection: 'row',
        marginBottom: verticalScale(6),
    },
    dayHeader: {
        flex: 1,
        textAlign: 'center',
        fontSize: moderateScale(10),
        fontWeight: '600',
        color: COLORS.muted,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    emptyCellFiller: {
        backgroundColor: 'transparent',
    },
    validDay: {
        backgroundColor: 'transparent',
    },
    dayCellContent: {
        width: '90%',
        height: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        backgroundColor: COLORS.bg,
    },
    dayCellContentActive: {
        backgroundColor: COLORS.primary,
    },
    dayText: {
        fontSize: moderateScale(12),
        fontWeight: '500',
        color: COLORS.dark,
    },
    dayTextActive: {
        fontSize: moderateScale(12),
        fontWeight: '700',
        color: COLORS.white,
    },
});

export default DatePickerModal;
