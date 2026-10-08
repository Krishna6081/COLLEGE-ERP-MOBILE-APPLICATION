import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

export const FacultyDashboardScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData({
      todays_lectures: [
        { time: '09:00 - 10:00 AM', subject: 'Database Management Systems', division: 'Div A (Sem 5)', room: 'LH-101' },
        { time: '11:30 - 01:30 PM', subject: 'DBMS Laboratory', division: 'Batch A1', room: 'LAB-201' },
      ],
      assigned_subjects: 3,
      pending_attendance: 1,
      pending_grading: 14,
    });
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title={`Hello, Prof. ${user?.last_name || 'Smith'}!`}
        subtitle="Department of Computer Science"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <StatCard title="Assigned Subjects" value={data?.assigned_subjects || 3} color={Colors.primary} />
          <StatCard title="Pending Grading" value={data?.pending_grading || 14} color={Colors.warning} />
        </View>

        <Text style={styles.sectionTitle}>TODAY'S LECTURE SCHEDULE</Text>
        {data?.todays_lectures?.map((lec: any, idx: number) => (
          <Card key={idx}>
            <View style={styles.header}>
              <Text style={styles.time}>{lec.time}</Text>
              <Badge label={lec.room} type="info" />
            </View>
            <Text style={styles.title}>{lec.subject}</Text>
            <Text style={styles.sub}>{lec.division}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, marginHorizontal: 20, marginTop: 20, marginBottom: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  time: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
