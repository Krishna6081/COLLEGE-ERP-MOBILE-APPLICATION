import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';
import { DashboardApi } from '../../api/dashboard.api';
import { useAuthStore } from '../../store/useAuthStore';

export const StudentDashboardScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const res = await DashboardApi.getDashboardData();
      if (res.data) {
        setData(res.data);
      }
    } catch {
      // Fallback data
      setData({
        attendance_percentage: 86.5,
        total_lectures: 120,
        attended_lectures: 104,
        todays_timetable: [
          { time: '09:00 - 10:00 AM', subject: 'Database Management Systems', room: 'LH-101', faculty: 'Prof. John Smith' },
          { time: '10:00 - 11:00 AM', subject: 'Web Application Engineering', room: 'LH-101', faculty: 'Prof. Sarah Connor' },
          { time: '11:30 - 01:30 PM', subject: 'DBMS Laboratory', room: 'LAB-201', faculty: 'Prof. John Smith' },
        ],
        upcoming_exams: [
          { title: 'Mid-Sem CS501 DBMS', date: '2026-10-14', time: '10:00 AM' },
          { title: 'Mid-Sem CS502 Web App', date: '2026-10-16', time: '10:00 AM' },
        ],
        fee_status: { total: 50000, paid: 20000, due: 25000, status: 'PARTIAL' },
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title={`Welcome, ${user?.first_name || 'Alex'}!`}
        subtitle="B.Tech Computer Science • Sem 5"
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
            value={`${data?.attendance_percentage || 86.5}%`}
            subtitle="104/120 Lectures"
            color={Colors.accent}
          />
          <StatCard
            title="Current SGPA"
            value="9.15"
            subtitle="Sem 4 Result"
            color={Colors.primary}
          />
        </View>

        {/* Today's Timetable */}
        <Text style={styles.sectionTitle}>TODAY'S SCHEDULE</Text>
        {data?.todays_timetable?.map((item: any, idx: number) => (
          <Card key={idx} style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.timeText}>{item.time}</Text>
              <Badge label={item.room} type="info" />
            </View>
            <Text style={styles.subjectText}>{item.subject}</Text>
            <Text style={styles.facultyText}>{item.faculty}</Text>
          </Card>
        ))}

        {/* Fee Payment Summary */}
        <Text style={styles.sectionTitle}>FEE SUMMARY</Text>
        <Card>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Total Amount:</Text>
            <Text style={styles.feeVal}>₹{data?.fee_status?.total || 50000}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Paid Amount:</Text>
            <Text style={[styles.feeVal, { color: Colors.accent }]}>₹{data?.fee_status?.paid || 20000}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Pending Dues:</Text>
            <Text style={[styles.feeVal, { color: Colors.danger }]}>₹{data?.fee_status?.due || 25000}</Text>
          </View>
        </Card>

        {/* Upcoming Exams */}
        <Text style={styles.sectionTitle}>UPCOMING EXAMINATIONS</Text>
        {data?.upcoming_exams?.map((exam: any, idx: number) => (
          <Card key={idx}>
            <View style={styles.examRow}>
              <View>
                <Text style={styles.examTitle}>{exam.title}</Text>
                <Text style={styles.examDate}>{exam.date} • {exam.time}</Text>
              </View>
              <Badge label="Scheduled" type="warning" />
            </View>
          </Card>
        ))}
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
