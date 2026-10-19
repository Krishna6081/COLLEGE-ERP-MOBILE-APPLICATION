import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

export const ExamCellDashboardScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
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
      setErrorMessage(error?.message || 'Could not load this dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
  if (!data) return <DashboardUnavailable title="Exam Cell Dashboard" message={errorMessage} onRetry={() => { setLoading(true); fetchData(); }} />;

  return (
    <View style={styles.container}>
      <Header
        title={`Hello, ${user?.first_name || 'Exam Cell'}!`}
        subtitle="Examination Cell — Controller"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Stats Row 1 */}
        <View style={styles.row}>
          <StatCard title="Total Exams" value={data?.total_exams || 0} color={Colors.primary} />
          <StatCard title="Scheduled" value={data?.scheduled_exams || 0} color={Colors.info} />
        </View>
        <View style={styles.row}>
          <StatCard title="Pending Marks" value={data?.pending_marks_entry || 0} color={Colors.warning} />
          <StatCard title="To Publish" value={data?.results_to_publish || 0} color={Colors.danger} />
        </View>

        {/* Alerts */}
        {data?.pending_marks_entry > 0 && (
          <Card style={styles.alertCard}>
            <Text style={styles.alertText}>⚠️  {data.pending_marks_entry} exam(s) awaiting marks entry</Text>
          </Card>
        )}
        {data?.results_to_publish > 0 && (
          <Card style={styles.alertCard}>
            <Text style={styles.alertText}>📋  {data.results_to_publish} result(s) ready to publish</Text>
          </Card>
        )}

        {/* Upcoming Exams */}
        <Text style={styles.sectionTitle}>UPCOMING EXAMINATIONS</Text>
        {(data?.upcoming_exams || []).length === 0 ? (
          <Card><Text style={styles.empty}>No upcoming exams scheduled</Text></Card>
        ) : (
          data.upcoming_exams.map((exam: any, i: number) => (
            <Card key={i}>
              <View style={styles.rowBetween}>
                <Text style={styles.examName}>{exam.name}</Text>
                <Badge label={exam.status} type={exam.status === 'SCHEDULED' ? 'info' : 'success'} />
              </View>
              <Text style={styles.examSub}>{exam.exam_type} • Starts: {exam.start_date}</Text>
            </Card>
          ))
        )}

        {/* Quick Stats Summary */}
        <Text style={styles.sectionTitle}>SUMMARY</Text>
        <Card>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Exams:</Text>
            <Text style={styles.summaryValue}>{data?.total_exams || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completed:</Text>
            <Text style={styles.summaryValue}>{data?.completed_exams || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Results Published:</Text>
            <Text style={styles.summaryValue}>{data?.published_results || 0}</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },
  row: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.textSecondary,
    marginHorizontal: 20, marginTop: 20, marginBottom: 6, letterSpacing: 0.5,
  },
  alertCard: { marginHorizontal: 16, marginTop: 8, backgroundColor: '#FFF3CD', borderLeftWidth: 4, borderLeftColor: Colors.warning },
  alertText: { fontSize: 13, color: '#856404', fontWeight: '600' },
  examName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  examSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
