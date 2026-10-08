import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';

export const StudentAttendanceScreen: React.FC = () => {
  const subjects = [
    { code: 'CS501', name: 'Database Management Systems', present: 28, total: 32, percentage: 87.5 },
    { code: 'CS502', name: 'Web Application Engineering', present: 24, total: 30, percentage: 80.0 },
    { code: 'CS503', name: 'DBMS Laboratory', present: 16, total: 16, percentage: 100.0 },
  ];

  return (
    <View style={styles.container}>
      <Header title="My Attendance Record" subtitle="Semester 5 Subject-wise Attendance" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.overallCard}>
          <Text style={styles.overallVal}>86.5%</Text>
          <Text style={styles.overallLbl}>OVERALL ATTENDANCE</Text>
          <Badge label="Requirement Met (Min 75%)" type="success" />
        </Card>

        <Text style={styles.sectionTitle}>SUBJECT WISE BREAKDOWN</Text>
        {subjects.map((sub, idx) => (
          <Card key={idx}>
            <View style={styles.subHeader}>
              <Text style={styles.subCode}>{sub.code}</Text>
              <Text style={styles.subPerc}>{sub.percentage}%</Text>
            </View>
            <Text style={styles.subName}>{sub.name}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${sub.percentage}%` }]} />
            </View>
            <Text style={styles.counts}>{sub.present} Attended of {sub.total} Total Lectures</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },
  overallCard: { alignItems: 'center', paddingVertical: 20, backgroundColor: Colors.primaryDark },
  overallVal: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
  overallLbl: { fontSize: 12, color: '#93C5FD', fontWeight: '700', marginVertical: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, marginHorizontal: 20, marginTop: 20, marginBottom: 6 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  subCode: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  subPerc: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  subName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  progressBarBg: { height: 8, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, backgroundColor: Colors.accent, borderRadius: 4 },
  counts: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
});
