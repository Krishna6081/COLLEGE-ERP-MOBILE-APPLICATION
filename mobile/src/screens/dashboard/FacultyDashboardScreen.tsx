import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { useNavigation } from '@react-navigation/native';

export const FacultyDashboardScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      const res: any = await apiClient.get('/dashboard');
      setData(res?.data || res);
      setErrorMessage('');
    } catch (error: any) {
      setData(null);
      setErrorMessage(error?.message || 'Could not load your dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;

  if (!data) {
    return (
      <View style={styles.container}>
        <Header title="Faculty Dashboard" subtitle="Your schedule and teaching activity" />
        <Card style={styles.errorCard}>
          <Text style={styles.empty}>{errorMessage || 'Dashboard data is unavailable.'}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); fetchData(); }}>
            <Text style={styles.retry}>Retry</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`Hello, ${data?.faculty_name || `Prof. ${user?.last_name || 'Faculty'}`}!`}
        subtitle={data?.department || 'Faculty dashboard'}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Pending Actions */}
        {(data?.pending_grading > 0 || data?.pending_leave > 0) && (
          <Card style={styles.alertCard}>
            {data?.pending_grading > 0 && (
              <Text style={styles.alertItem}>📝 {data.pending_grading} assignment(s) awaiting grading</Text>
            )}
            {data?.pending_leave > 0 && (
              <Text style={styles.alertItem}>📋 {data.pending_leave} pending leave request(s)</Text>
            )}
          </Card>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard title="Subjects" value={data?.assigned_subjects || 0} color={Colors.primary} />
          <StatCard title="Grading" value={data?.pending_grading || 0} color={Colors.warning} />
        </View>
        <View style={styles.statsRow}>
          <StatCard title="Upcoming Exams" value={data?.upcoming_exams || 0} color={Colors.info} />
          <StatCard title="Lectures Today" value={(data?.todays_lectures || []).length} color={Colors.success} />
        </View>

        {/* Today's Lectures */}
        <Text style={styles.sectionTitle}>TODAY'S LECTURE SCHEDULE</Text>
        {(data?.todays_lectures || []).length === 0 ? (
          <Card><Text style={styles.empty}>No lectures scheduled for today 🎉</Text></Card>
        ) : (
          data.todays_lectures.map((lec: any, idx: number) => (
            <Card key={lec.timetable_id || idx}>
              <View style={styles.lecHeader}>
                <Text style={styles.time}>🕐 {lec.time}</Text>
                <Badge label={lec.room} type="info" />
              </View>
              <Text style={styles.lecTitle}>{lec.subject}</Text>
              <Text style={styles.lecDiv}>{lec.division}</Text>
              <TouchableOpacity
                disabled={!lec.timetable_id || !lec.division_id || !lec.subject_id}
                onPress={() => navigation.navigate('MarkAttendance', { lecture: lec })}
              >
                <Text style={styles.markAttendance}>Mark attendance</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!lec.division_id}
                onPress={() => navigation.navigate('StudentList', {
                  divisionId: lec.division_id,
                  batchId: lec.batch_id || undefined,
                })}
              >
                <Text style={styles.viewRoster}>View class roster</Text>
              </TouchableOpacity>
            </Card>
          ))
        )}

        {/* Recent Notices */}
        <Text style={styles.sectionTitle}>RECENT NOTICES</Text>
        {(data?.recent_notices || []).length === 0 ? (
          <Card><Text style={styles.empty}>No recent notices</Text></Card>
        ) : (
          data.recent_notices.map((n: any, i: number) => (
            <Card key={i}>
              <View style={styles.noticeRow}>
                <Text style={styles.noticeTitle} numberOfLines={2}>{n.title}</Text>
                <Badge label={n.priority} type={n.priority === 'HIGH' ? 'warning' : 'info'} />
              </View>
              <Text style={styles.noticeDate}>{n.publish_date}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 24 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, marginHorizontal: 20, marginTop: 20, marginBottom: 6, letterSpacing: 0.5 },
  alertCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#FFF3CD', borderLeftWidth: 4, borderLeftColor: Colors.warning },
  alertItem: { fontSize: 13, color: '#856404', fontWeight: '600', marginBottom: 3 },
  lecHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  time: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  lecTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  lecDiv: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  noticeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noticeTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  noticeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  viewRoster: { color: Colors.primary, fontWeight: '700', marginTop: 8 },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 10 },
  errorCard: { margin: 16 },
  retry: { color: Colors.primary, fontWeight: '700', textAlign: 'center', padding: 12 },
  markAttendance: { color: Colors.primary, fontWeight: '700', marginTop: 10 },
});
