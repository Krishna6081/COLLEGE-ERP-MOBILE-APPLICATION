import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';
import { Header } from '../../components/Header';
import { ErpApi } from '../../api/erp.api';
import { Colors } from '../../constants/colors';

export const StudentDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  const studentId = route?.params?.id;
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadStudent = useCallback(async () => {
    if (!studentId) {
      setStudent(null);
      setErrorMessage('A student ID was not provided. Return to the directory and select a student.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response: any = await ErpApi.getStudentById(studentId);
      const record = response?.data?.student ?? response?.data;
      if (!record) throw new Error('The server returned no student profile.');
      setStudent(record);
      setErrorMessage('');
    } catch (error: any) {
      setStudent(null);
      setErrorMessage(error?.message || 'Could not load this profile. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
  if (!student) {
    return (
      <DashboardUnavailable
        title="Student profile unavailable"
        message={errorMessage}
        onRetry={loadStudent}
      />
    );
  }

  const initials = `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}` || 'S';
  const program = student.program_name || student.course_name || 'Program not assigned';
  const department = student.department_name || 'Department not assigned';

  return (
    <View style={styles.container}>
      <Header title="Student Profile" subtitle="Academic Record Details" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{student.first_name} {student.last_name}</Text>
          <Text style={styles.sub}>{program} · {department}</Text>
          <Badge label={student.status || 'Unknown'} type={student.status === 'ACTIVE' ? 'success' : 'warning'} />
        </Card>

        <Card>
          <Text style={styles.cardHeader}>Enrollment Identifiers</Text>
          <Text style={styles.detailRow}>Admission Number: {student.admission_number || 'Not provided'}</Text>
          <Text style={styles.detailRow}>Enrollment Number: {student.enrollment_number || 'Not provided'}</Text>
          <Text style={styles.detailRow}>PRN: {student.PRN || 'Not provided'}</Text>
        </Card>

        <Card>
          <Text style={styles.cardHeader}>Contact Information</Text>
          <Text style={styles.detailRow}>Email: {student.email || 'Not provided'}</Text>
          <Text style={styles.detailRow}>Mobile: {student.mobile || 'Not provided'}</Text>
          <Text style={styles.detailRow}>Address: {student.address || 'Not provided'}</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },
  headerCard: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarTxt: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary, marginVertical: 4, textAlign: 'center' },
  cardHeader: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  detailRow: { fontSize: 13, color: Colors.textSecondary, paddingVertical: 4 },
});
