
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { apiClient } from '../../api/client';

interface TimetableSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code?: string;
  room?: string;
  faculty_name?: string;
}

export const TimetableScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [schedule, setSchedule] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const days = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ];

  const fetchTimetable = async () => {
    try {
      setLoading(true);

      const response: any = await apiClient.get('/timetable/my-timetable');

      const records = Array.isArray(response?.data)
        ? response.data
        : response?.data?.timetable || [];

      setSchedule(records);
    } catch (error: any) {
      console.error('Timetable API Error:', error);
      Alert.alert(
        'Error',
        error?.message || 'Unable to load timetable.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const selectedSchedule = schedule.filter(
    (item) => item.day?.toUpperCase() === selectedDay
  );

  return (
    <View style={styles.container}>
      <Header
        title="Weekly Timetable"
        subtitle="Your Class Schedule"
      />

      <View style={styles.tabRow}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.tab,
              selectedDay === day && styles.activeTab,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.tabTxt,
                selectedDay === day && styles.activeTabTxt,
              ]}
            >
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>Loading timetable...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {selectedSchedule.length === 0 ? (
            <Text style={styles.emptyText}>
              No timetable available for {selectedDay}.
            </Text>
          ) : (
            selectedSchedule.map((slot, idx) => (
              <Card key={slot.id || String(idx)} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.time}>
                    {slot.start_time} - {slot.end_time}
                  </Text>

                  <Badge
                    label={slot.room || 'Room N/A'}
                    type="info"
                  />
                </View>

                <Text style={styles.title}>
                  {slot.subject_name}
                  {slot.subject_code
                    ? ` (${slot.subject_code})`
                    : ''}
                </Text>

                <Text style={styles.faculty}>
                  Faculty: {slot.faculty_name || 'Not Assigned'}
                </Text>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  activeTabTxt: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  faculty: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 20,
  },
});
