import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';

export const AssignmentsScreen: React.FC = () => {
  const assignments = [
    {
      id: 'ass-001',
      title: 'ER Diagram & Relational Schema Design',
      subject: 'Database Management Systems (CS501)',
      deadline: 'Oct 15, 2026',
      total_marks: 100,
      status: 'PENDING',
    },
    {
      id: 'ass-002',
      title: 'React Native State Management with Zustand',
      subject: 'Web Application Engineering (CS502)',
      deadline: 'Oct 18, 2026',
      total_marks: 50,
      status: 'SUBMITTED',
      marks_obtained: '48 / 50',
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Course Assignments" subtitle="Deadlines & Submissions" />
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.sub}>{item.subject}</Text>
              <Badge
                label={item.status}
                type={item.status === 'SUBMITTED' ? 'success' : 'warning'}
              />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.deadline}>Deadline: {item.deadline} | Marks: {item.total_marks}</Text>
            {item.status === 'PENDING' ? (
              <TouchableOpacity style={styles.uploadBtn} onPress={() => Alert.alert('Upload', 'Document picker opened. Selected assignment PDF.')}>
                <Text style={styles.uploadTxt}>UPLOAD SUBMISSION PDF</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.gradedTxt}>Graded: {item.marks_obtained}</Text>
            )}
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sub: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  deadline: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  uploadBtn: { marginTop: 12, backgroundColor: Colors.primary, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  uploadTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  gradedTxt: { color: Colors.accent, fontSize: 13, fontWeight: '700', marginTop: 8 },
});
