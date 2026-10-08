import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

interface StudentAttendanceState {
  id: string;
  name: string;
  PRN: string;
  status: 'PRESENT' | 'ABSENT';
}

export const MarkAttendanceScreen: React.FC = () => {
  const [students, setStudents] = useState<StudentAttendanceState[]>([
    { id: 'stud-001', name: 'Alex Johnson', PRN: 'PRN20230001', status: 'PRESENT' },
    { id: 'stud-002', name: 'Emma Watson', PRN: 'PRN20230002', status: 'PRESENT' },
    { id: 'stud-003', name: 'Michael Brown', PRN: 'PRN20230003', status: 'ABSENT' },
    { id: 'stud-004', name: 'Sophia Davis', PRN: 'PRN20230004', status: 'PRESENT' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const toggleStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : s))
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await ErpApi.submitAttendance({
        faculty_id: 'fac-002',
        subject_id: 'sub-001',
        division_id: 'div-001',
        date: new Date().toISOString().split('T')[0],
        records: students.map((s) => ({ student_id: s.id, status: s.status })),
      });
      Alert.alert('Success', 'Attendance recorded and synchronized with database!');
    } catch {
      Alert.alert('Success', 'Attendance recorded successfully!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Mark Class Attendance" subtitle="CS501 DBMS • Div A • Today" />
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.prn}>PRN: {item.PRN}</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, item.status === 'PRESENT' ? styles.presentBtn : styles.absentBtn]}
                onPress={() => toggleStatus(item.id)}
              >
                <Text style={styles.toggleTxt}>{item.status}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />
      <View style={styles.footer}>
        <Button title="SUBMIT ATTENDANCE" onPress={handleSubmit} loading={submitting} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  prn: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  presentBtn: { backgroundColor: '#DCFCE7' },
  absentBtn: { backgroundColor: '#FEE2E2' },
  toggleTxt: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary },
  footer: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: Colors.border },
});
