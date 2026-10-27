import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { HodApi } from '../../api/hod.api';

interface TimetableSlot {
  id: string;
  day: string;
  time: string;
  start_time: string;
  end_time: string;
  subject_code: string;
  subject_name: string;
  faculty_name: string;
  classroom: string;
  building: string;
  division: string;
  division_id: string;
  type: 'THEORY' | 'PRACTICAL';
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DIVISIONS = ['ALL', 'Division A', 'Division B'];

export const HodTimetableScreen: React.FC = () => {
  const [schedule, setSchedule] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTimetable = async () => {
    try {
      const response = await HodApi.getTimetable(selectedDay, selectedDivision);
      if (response && response.data) {
        setSchedule(response.data);
      }
    } catch {
      // Offline fallback
      setSchedule([
        {
          id: 'tt-001',
          day: selectedDay,
          time: '09:00 - 10:00',
          start_time: '09:00',
          end_time: '10:00',
          subject_code: 'CS501',
          subject_name: 'Database Management Systems',
          faculty_name: 'Dr. Grace Hopper',
          classroom: 'LH-101',
          building: 'Main Academic Block',
          division: 'Division A',
          division_id: 'div-001',
          type: 'THEORY',
        },
        {
          id: 'tt-002',
          day: selectedDay,
          time: '10:00 - 11:00',
          start_time: '10:00',
          end_time: '11:00',
          subject_code: 'CS502',
          subject_name: 'Web Application Engineering',
          faculty_name: 'Prof. John Smith',
          classroom: 'LH-101',
          building: 'Main Academic Block',
          division: 'Division A',
          division_id: 'div-001',
          type: 'THEORY',
        },
        {
          id: 'tt-003',
          day: selectedDay,
          time: '11:15 - 12:15',
          start_time: '11:15',
          end_time: '12:15',
          subject_code: 'CS505',
          subject_name: 'Operating Systems & Kernel Design',
          faculty_name: 'Prof. Alan Turing',
          classroom: 'LH-101',
          building: 'Main Academic Block',
          division: 'Division A',
          division_id: 'div-001',
          type: 'THEORY',
        },
        {
          id: 'tt-005',
          day: selectedDay,
          time: '14:00 - 16:00',
          start_time: '14:00',
          end_time: '16:00',
          subject_code: 'CS503',
          subject_name: 'DBMS & Full-Stack Laboratory',
          faculty_name: 'Dr. Grace Hopper',
          classroom: 'LAB-201',
          building: 'IT Block',
          division: 'Division A',
          division_id: 'div-001',
          type: 'PRACTICAL',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedDay, selectedDivision]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimetable();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Department Timetable"
        subtitle="Computer Science & Engineering • Schedule"
        onRightPress={onRefresh}
        rightIconLabel="Refresh"
      />

      {/* Day Selector */}
      <View style={styles.dayTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabsScroll}>
          {DAYS.map((d) => {
            const isSelected = selectedDay === d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.dayTabBtn, isSelected && styles.activeDayTabBtn]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[styles.dayTabText, isSelected && styles.activeDayTabText]}>
                  {d.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Division Selector */}
      <View style={styles.divTabsRow}>
        {DIVISIONS.map((div) => (
          <TouchableOpacity
            key={div}
            style={[styles.divBtn, selectedDivision === div && styles.activeDivBtn]}
            onPress={() => setSelectedDivision(div)}
          >
            <Text style={[styles.divBtnText, selectedDivision === div && styles.activeDivBtnText]}>
              {div}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading timetable schedule...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {schedule.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No lectures scheduled for {selectedDay}.</Text>
            </Card>
          ) : (
            schedule.map((slot) => (
              <Card key={slot.id} style={styles.slotCard}>
                <View style={styles.slotHeader}>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeText}>🕒 {slot.time}</Text>
                  </View>
                  <Badge
                    label={slot.type === 'PRACTICAL' ? 'LAB SESSION' : 'THEORY'}
                    type={slot.type === 'PRACTICAL' ? 'info' : 'primary'}
                  />
                </View>

                <View style={styles.subjectInfoSection}>
                  <Text style={styles.subjectCode}>{slot.subject_code}</Text>
                  <Text style={styles.subjectName}>{slot.subject_name}</Text>
                </View>

                <View style={styles.metaInfoRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Faculty:</Text>
                    <Text style={styles.metaValue}>👨‍🏫 {slot.faculty_name}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Classroom / Lab:</Text>
                    <Text style={styles.metaValue}>📍 {slot.classroom} ({slot.building})</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Target Division:</Text>
                    <Text style={styles.metaValue}>👥 {slot.division}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  dayTabsWrapper: { backgroundColor: '#FFFFFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dayTabsScroll: { paddingHorizontal: 16 },
  dayTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeDayTabBtn: { backgroundColor: Colors.primary },
  dayTabText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  activeDayTabText: { color: '#FFFFFF' },
  divTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
  },
  divBtn: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 6 },
  activeDivBtn: { backgroundColor: '#FFFFFF', elevation: 1 },
  divBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  activeDivBtnText: { color: Colors.primary, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, padding: 20 },
  slotCard: { marginBottom: 12, padding: 14 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  timeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  subjectInfoSection: { marginTop: 10 },
  subjectCode: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  subjectName: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 1 },
  metaInfoRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaLabel: { fontSize: 12, color: Colors.textSecondary, width: 110, fontWeight: '500' },
  metaValue: { fontSize: 12, color: Colors.text, fontWeight: '600', flex: 1 },
});
