import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { DashboardApi } from '../../api/dashboard.api';
import { useAuthStore } from '../../store/useAuthStore';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

export const StudentDashboardScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const res = await DashboardApi.getDashboardData();
      if (res.data) {
        setData(res.data);
        setErrorMessage('');
      } else {
        setData(null);
        setErrorMessage('The server returned no dashboard data. Try again.');
      }
    } catch (error: any) {
      setData(null);
      setErrorMessage(error?.message || 'Could not load your dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
  if (!data) {
    return (
      <DashboardUnavailable
        title="Student Dashboard"
        message={errorMessage}
        onRetry={loadData}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`Welcome, ${user?.first_name || 'Student'}!`}
        subtitle={data?.program && data?.semester ? `${data.program} • ${data.semester}` : 'Academic overview'}
        onRightPress={loadData}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[Colors.primary]} />}
      >
        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <StatCard
            title="Attendance"
            value={`${data?.attendance_percentage ?? 0}%`}
            subtitle={`${data?.attended_lectures ?? 0}/${data?.total_lectures ?? 0} Lectures`}
            color={Colors.accent}
          />
          <StatCard
            title="Current SGPA"
            value={data?.current_sgpa ?? '—'}
            subtitle={data?.sgpa_semester || 'Latest result'}
            color={Colors.primary}
          />
        </View>

        {/* Today's Timetable */}
        <Text style={styles.sectionTitle}>TODAY'S SCHEDULE</Text>
        {(data?.todays_timetable || []).map((item: any, idx: number) => (
          <Card key={idx} style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.timeText}>{item.time}</Text>
              <Badge label={item.room} type="info" />
            </View>
            <Text style={styles.subjectText}>{item.subject}</Text>
            <Text style={styles.facultyText}>{item.faculty}</Text>
          </Card>
        ))}
        {(data?.todays_timetable || []).length === 0 && <Card><Text style={styles.facultyText}>No classes scheduled for today.</Text></Card>}

        {/* Fee Payment Summary */}
        <Text style={styles.sectionTitle}>FEE SUMMARY</Text>
        <Card>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Total Amount:</Text>
            <Text style={styles.feeVal}>₹{data?.fee_status?.total ?? 0}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Paid Amount:</Text>
            <Text style={[styles.feeVal, { color: Colors.accent }]}>₹{data?.fee_status?.paid ?? 0}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Pending Dues:</Text>
            <Text style={[styles.feeVal, { color: Colors.danger }]}>₹{data?.fee_status?.due ?? 0}</Text>
          </View>
        </Card>

        {/* Upcoming Exams */}
        <Text style={styles.sectionTitle}>UPCOMING EXAMINATIONS</Text>
        {(data?.upcoming_exams || []).map((exam: any, idx: number) => (
          <Card key={idx}>
            <View style={styles.examRow}>
              <View>
                <Text style={styles.examTitle}>{exam.exam_name || exam.subject_name || exam.title || 'Exam'}</Text>
                <Text style={styles.examDate}>{exam.exam_date || exam.date} • {exam.start_time || exam.time}</Text>
              </View>
              <Badge label="Scheduled" type="warning" />
            </View>
          </Card>
        ))}
        {(data?.upcoming_exams || []).length === 0 && <Card><Text style={styles.facultyText}>No upcoming examinations.</Text></Card>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 30 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, marginHorizontal: 20, marginTop: 20, marginBottom: 6, letterSpacing: 0.8 },
  scheduleCard: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  subjectText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  facultyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  feeLabel: { fontSize: 14, color: Colors.textSecondary },
  feeVal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  examRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  examTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  examDate: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
