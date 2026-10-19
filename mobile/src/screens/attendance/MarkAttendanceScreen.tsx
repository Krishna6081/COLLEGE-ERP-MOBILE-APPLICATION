import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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

interface LectureContext {
  timetable_id: string;
  subject_id: string;
  division_id: string;
  batch_id?: string | null;
  subject: string;
  division: string;
  room?: string;
}

const getLocalDate = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
};

export const MarkAttendanceScreen: React.FC<any> = ({ route, navigation }) => {
  const lecture = route?.params?.lecture as LectureContext | undefined;
  const [students, setStudents] = useState<StudentAttendanceState[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRoster = async () => {
      if (!lecture?.division_id) {
        setLoadError('Open attendance from one of your scheduled lectures.');
        setLoading(false);
        return;
      }

      try {
        const response: any = await ErpApi.getClassRoster(lecture.division_id, lecture.batch_id || undefined);
        const rows = Array.isArray(response?.data) ? response.data : [];
        if (active) {
          setStudents(rows.map((student: any) => ({
            id: student.id,
            name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
            PRN: student.PRN || '',
            status: 'PRESENT' as const,
          })));
          setLoadError('');
        }
      } catch (error: any) {
        if (active) setLoadError(error?.message || 'Could not load this class roster. Check your connection and try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRoster();
    return () => { active = false; };
  }, [lecture?.division_id, lecture?.batch_id]);

  const toggleStatus = (id: string) => {
    setStudents((prev) => prev.map((student) => (
      student.id === id
        ? { ...student, status: student.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' }
        : student
    )));
  };

  const handleSubmit = async () => {
    if (!lecture?.timetable_id || !lecture.subject_id || !lecture.division_id || students.length === 0) return;

    setSubmitting(true);
    try {
      await ErpApi.submitAttendance({
        timetable_id: lecture.timetable_id,
        subject_id: lecture.subject_id,
        division_id: lecture.division_id,
        batch_id: lecture.batch_id || undefined,
        date: getLocalDate(),
        records: students.map((student) => ({ student_id: student.id, status: student.status })),
      });
      Alert.alert('Attendance saved', 'Attendance was saved successfully.', [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Could not save attendance', error?.message || 'Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const subtitle = lecture
    ? `${lecture.division}${lecture.batch_id ? ' • Batch' : ''}${lecture.room ? ` • ${lecture.room}` : ''}`
    : 'Select a scheduled lecture';

  return (
    <View style={styles.container}>
      <Header title={lecture?.subject || 'Mark Class Attendance'} subtitle={subtitle} />
      {loading ? (
        <ActivityIndicator style={styles.loading} color={Colors.primary} size="large" />
      ) : loadError ? (
        <Card><Text style={styles.message}>{loadError}</Text></Card>
      ) : students.length === 0 ? (
        <Card><Text style={styles.message}>No active students are assigned to this class.</Text></Card>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(student) => student.id}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}>
                <View style={styles.studentInfo}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.prn}>PRN: {item.PRN}</Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}: ${item.status}. Toggle attendance status`}
                  style={[styles.toggleBtn, item.status === 'PRESENT' ? styles.presentBtn : styles.absentBtn]}
                  onPress={() => toggleStatus(item.id)}
                >
                  <Text style={styles.toggleTxt}>{item.status}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      <View style={styles.footer}>
        <Button
          title="SUBMIT ATTENDANCE"
          onPress={handleSubmit}
          loading={submitting}
          disabled={loading || !!loadError || students.length === 0 || !lecture?.timetable_id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { marginTop: 32 },
  listContent: { paddingTop: 4, paddingBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentInfo: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  prn: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  presentBtn: { backgroundColor: '#DCFCE7' },
  absentBtn: { backgroundColor: '#FEE2E2' },
  toggleTxt: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary },
  message: { color: Colors.textSecondary, textAlign: 'center', padding: 10 },
  footer: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: Colors.border },
});
