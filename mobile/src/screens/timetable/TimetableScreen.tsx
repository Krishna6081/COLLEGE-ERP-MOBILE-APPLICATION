import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const currentDay = () => {
  const day = new Date().getDay();
  return DAYS[(day + 6) % 7];
};

const formatTime = (value?: string) => {
  if (!value) return '';
  const [hourText, minuteText] = String(value).slice(0, 5).split(':');
  const hour = Number(hourText);
  if (!Number.isFinite(hour) || !minuteText) return String(value);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minuteText} ${suffix}`;
};

export const TimetableScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadSchedule = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await ErpApi.getTimetable();
      const rows = (response as any)?.data ?? response;
      setSchedule(Array.isArray(rows) ? rows : []);
      setError('');
    } catch (requestError: any) {
      setError(requestError?.message || 'Could not load the timetable. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const daySchedule = useMemo(
    () => schedule.filter((item) => item.day_of_week === selectedDay),
    [schedule, selectedDay],
  );

  if (loading && schedule.length === 0) {
    return <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Weekly Timetable"
        subtitle="Your scheduled classes"
        onRightPress={() => loadSchedule()}
        rightIconLabel="Refresh"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayTab, selectedDay === day && styles.activeDayTab]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayText, selectedDay === day && styles.activeDayText]}>{day.slice(0, 3)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSchedule(true)} />}
      >
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadSchedule()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && !loading && daySchedule.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No classes scheduled</Text>
            <Text style={styles.emptyText}>There are no timetable entries for {selectedDay.toLowerCase()}.</Text>
          </View>
        )}

        {daySchedule.map((lecture) => (
          <Card key={lecture.id} style={styles.card}>
            <View style={styles.lectureHeading}>
              <Text style={styles.time}>
                {formatTime(lecture.start_time)} - {formatTime(lecture.end_time)}
              </Text>
              {lecture.room_number ? (
                <Badge label={`${lecture.building_name ? `${lecture.building_name} · ` : ''}${lecture.room_number}`} type="info" />
              ) : null}
            </View>
            <Text style={styles.subject}>
              {lecture.subject_name || 'Subject'}{lecture.subject_code ? ` (${lecture.subject_code})` : ''}
            </Text>
            <Text style={styles.detail}>
              {lecture.faculty_first_name
                ? `${lecture.faculty_first_name} ${lecture.faculty_last_name || ''}`.trim()
                : 'Faculty not assigned'}
            </Text>
            {lecture.division_name ? <Text style={styles.detail}>Division {lecture.division_name}</Text> : null}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1 },
  dayRow: { paddingHorizontal: 8, paddingVertical: 8, backgroundColor: Colors.cardBg },
  dayTab: { minWidth: 48, marginHorizontal: 3, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  activeDayTab: { backgroundColor: Colors.primary },
  dayText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  activeDayText: { color: '#FFFFFF' },
  content: { flexGrow: 1, padding: 12, paddingBottom: 24 },
  card: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  lectureHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  time: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  subject: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  detail: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, textAlign: 'center', color: Colors.textSecondary, marginTop: 6 },
  errorBox: { padding: 16, borderRadius: 10, backgroundColor: '#FEE2E2' },
  errorText: { color: '#991B1B', fontSize: 14 },
  retryText: { color: Colors.primaryDark, fontWeight: '700', marginTop: 10 },
});
