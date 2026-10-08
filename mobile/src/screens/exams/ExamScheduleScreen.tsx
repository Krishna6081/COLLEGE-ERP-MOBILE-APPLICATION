import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';

export const ExamScheduleScreen: React.FC = () => {
  const exams = [
    { id: '1', subject: 'Database Management Systems (CS501)', date: 'Oct 14, 2026', time: '10:00 AM - 01:00 PM', hall: 'LH-101' },
    { id: '2', subject: 'Web Application Engineering (CS502)', date: 'Oct 16, 2026', time: '10:00 AM - 01:00 PM', hall: 'LH-101' },
    { id: '3', subject: 'Operating Systems (CS504)', date: 'Oct 19, 2026', time: '10:00 AM - 01:00 PM', hall: 'LH-102' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Examination Schedule" subtitle="Semester 5 Mid-Term Exams" />
      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.date}>{item.date}</Text>
              <Badge label={item.hall} type="info" />
            </View>
            <Text style={styles.sub}>{item.subject}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  sub: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  time: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
