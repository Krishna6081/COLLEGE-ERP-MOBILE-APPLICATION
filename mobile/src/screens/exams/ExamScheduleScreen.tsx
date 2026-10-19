import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

const formatDate = (value?: string) => {
  if (!value) return 'Date not set';
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(value);
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString();
};

const formatTime = (value?: string) => {
  if (!value) return '';
  const [hourText, minuteText] = String(value).slice(0, 5).split(':');
  const hour = Number(hourText);
  if (!Number.isFinite(hour) || !minuteText) return String(value);
  return `${hour % 12 || 12}:${minuteText} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export const ExamScheduleScreen: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadSchedules = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await ErpApi.getExams({ limit: 100 });
      const payload = (response as any)?.data ?? response;
      const exams = payload?.exams ?? (Array.isArray(payload) ? payload : []);
      const grouped = await Promise.all(exams.map(async (exam: any) => {
        const scheduleResponse = await ErpApi.getExamSchedules(String(exam.id));
        const schedulePayload = (scheduleResponse as any)?.data ?? scheduleResponse;
        const rows = Array.isArray(schedulePayload) ? schedulePayload : [];
        return rows.map((row: any) => ({ ...row, exam_name: exam.name, exam_type: exam.exam_type }));
      }));
      setSchedules(grouped.flat().sort((a, b) => `${a.exam_date} ${a.start_time}`.localeCompare(`${b.exam_date} ${b.start_time}`)));
      setError('');
    } catch (requestError: any) {
      setError(requestError?.message || 'Could not load exam schedules. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  if (loading && schedules.length === 0) {
    return <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Examination Schedule"
        subtitle="Upcoming and published exam sessions"
        onRightPress={() => loadSchedules()}
        rightIconLabel="Refresh"
      />
      <FlatList
        data={schedules}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSchedules(true)} />}
        contentContainerStyle={schedules.length === 0 ? styles.emptyList : styles.list}
        ListHeaderComponent={error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadSchedules()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        ListEmptyComponent={!error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No exam sessions found</Text>
            <Text style={styles.emptyText}>Published exam schedules will appear here.</Text>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.date}>{formatDate(item.exam_date)}</Text>
              {item.room_number ? (
                <Badge label={`${item.building_name ? `${item.building_name} · ` : ''}${item.room_number}`} type="info" />
              ) : null}
            </View>
            <Text style={styles.examName}>{item.exam_name || 'Examination'}</Text>
            <Text style={styles.subject}>
              {item.subject_name || 'Subject'}{item.subject_code ? ` (${item.subject_code})` : ''}
            </Text>
            <Text style={styles.time}>{formatTime(item.start_time)} - {formatTime(item.end_time)}</Text>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1 },
  list: { paddingBottom: 20 },
  emptyList: { flexGrow: 1, padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  date: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  examName: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginTop: 8 },
  subject: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 3 },
  time: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, textAlign: 'center', color: Colors.textSecondary, marginTop: 6 },
  errorBox: { margin: 12, padding: 16, borderRadius: 10, backgroundColor: '#FEE2E2' },
  errorText: { color: '#991B1B', fontSize: 14 },
  retryText: { color: Colors.primaryDark, fontWeight: '700', marginTop: 10 },
});
