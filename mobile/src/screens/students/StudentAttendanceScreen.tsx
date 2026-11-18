import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { apiClient } from '../../api/client';

interface AttendanceRecord {
  id: string;
  subject_name?: string;
  date?: string;
  status?: string;
  attendance_percentage?: number;
}

export default function ViewAttendanceScreen() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response: any = await apiClient.get('/attendance/my-attendance');

      if (response.success) {
        const data = response.data;
        const attendance = Array.isArray(data)
          ? data
          : data?.records || data?.attendance || [];

        setRecords(attendance);
      } else {
        Alert.alert('Error', 'Unable to load attendance');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to fetch attendance'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0c2466" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>My Attendance</Text>

      {records.length === 0 ? (
        <Text style={styles.empty}>No attendance records found.</Text>
      ) : (
        records.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.subject}>
              {item.subject_name || 'Subject'}
            </Text>

            <Text style={styles.date}>
              Date: {item.date || 'Not Available'}
            </Text>

            <Text
              style={[
                styles.status,
                item.status?.toUpperCase() === 'PRESENT'
                  ? styles.present
                  : styles.absent,
              ]}
            >
              {item.status || 'Not Available'}
            </Text>

            {item.attendance_percentage !== undefined && (
              <Text style={styles.percentage}>
                Attendance: {item.attendance_percentage}%
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0c2466',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
  },
  subject: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0c2466',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  status: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  present: {
    color: 'green',
  },
  absent: {
    color: 'red',
  },
  percentage: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});