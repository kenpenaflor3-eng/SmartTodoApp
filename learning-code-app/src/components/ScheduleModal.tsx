import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (isoString: string) => void;
  initialDate?: string;
}

export default function ScheduleModal({ visible, onClose, onSave, initialDate }: ScheduleModalProps) {
  const [scheduleDate, setScheduleDate] = useState(initialDate?.slice(0, 10) || '');
  const [scheduleHour, setScheduleHour] = useState('');
  const [scheduleMinute, setScheduleMinute] = useState('');
  const [scheduleAmPm, setScheduleAmPm] = useState<'AM' | 'PM'>('AM');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  useEffect(() => {
    if (!initialDate) {
      setScheduleHour('09');
      setScheduleMinute('00');
      setScheduleAmPm('AM');
      setScheduleDate('');
      return;
    }
    const parsed = new Date(initialDate);
    if (!isNaN(parsed.getTime())) {
      const isoDate = initialDate.slice(0, 10);
      let hour = parsed.getHours();
      const minute = String(parsed.getMinutes()).padStart(2, '0');
      const amPm = hour >= 12 ? 'PM' : 'AM';
      if (hour === 0) {
        hour = 12;
      } else if (hour > 12) {
        hour -= 12;
      }
      setScheduleDate(isoDate);
      setScheduleHour(String(hour));
      setScheduleMinute(minute);
      setScheduleAmPm(amPm);
    }
  }, [initialDate]);

  const handleSave = () => {
    if (!scheduleDate) {
      Alert.alert('Missing Date', 'Please select a date for your scheduled task.');
      return;
    }
    if (!scheduleHour || !scheduleMinute) {
      Alert.alert('Missing Time', 'Please enter both hour and minute for your scheduled task.');
      return;
    }
    const hour = parseInt(scheduleHour, 10);
    const minute = parseInt(scheduleMinute, 10);
    if (isNaN(hour) || hour < 1 || hour > 12 || isNaN(minute) || minute < 0 || minute > 59) {
      Alert.alert('Invalid Time', 'Please enter a valid time (1-12 for hours, 0-59 for minutes).');
      return;
    }
    let hh = hour;
    if (scheduleAmPm === 'PM' && hh < 12) hh += 12;
    if (scheduleAmPm === 'AM' && hh === 12) hh = 0;
    const iso = new Date(
      `${scheduleDate}T${String(hh).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
    ).toISOString();
    onSave(iso);
    onClose();
  };

  const handleClose = () => {
    setScheduleDate('');
    setScheduleHour('');
    setScheduleMinute('');
    setScheduleAmPm('AM');
    onClose();
  };

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const blanks = Array.from({ length: firstDay });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule Step</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Pick a Date</Text>
          <View style={styles.calendarContainer}>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Text style={styles.navBtnText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {calendarMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Text style={styles.navBtnText}>▶</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {days.map((d) => (
                <Text key={d} style={styles.weekDayText}>{d}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {blanks.map((_, i) => (
                <View key={`b${i}`} style={styles.dayCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const selected = scheduleDate === iso;
                const isToday = iso === todayStr;
                return (
                  <TouchableOpacity
                    key={iso}
                    style={styles.dayCell}
                    onPress={() => setScheduleDate(iso)}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        selected ? styles.daySelected : null,
                        isToday && !selected ? styles.dayToday : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selected ? styles.dayTextSelected : null,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={styles.sectionLabel}>Pick a Time</Text>
          <View style={styles.timeRow}>
            <TextInput
              value={scheduleHour}
              onChangeText={setScheduleHour}
              placeholder="HH"
              placeholderTextColor={colors.text.muted}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.timeInput}
            />
            <Text style={styles.timeSeparator}>:</Text>
            <TextInput
              value={scheduleMinute}
              onChangeText={setScheduleMinute}
              placeholder="MM"
              placeholderTextColor={colors.text.muted}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.timeInput}
            />
            <TouchableOpacity
              style={styles.ampmBtn}
              onPress={() => setScheduleAmPm(scheduleAmPm === 'AM' ? 'PM' : 'AM')}
            >
              <Text style={styles.ampmText}>{scheduleAmPm}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xxl,
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.h3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: colors.text.muted,
    fontWeight: '600',
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  calendarContainer: {
    marginBottom: spacing.xl,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  monthTitle: {
    ...typography.h3,
    fontSize: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    paddingVertical: 4,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    padding: 3,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  dayTextSelected: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  timeInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    width: 70,
    textAlign: 'center',
    color: colors.text.primary,
  },
  timeSeparator: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginHorizontal: spacing.sm,
  },
  ampmBtn: {
    marginLeft: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
  },
  ampmText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadows.sm,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});
