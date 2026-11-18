import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, RefreshControl, Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { ExamApi } from '../../api/student.api';

type ExamStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PUBLISHED';

interface ExamSchedule {
  id: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  passing_marks: number;
  subject_code: string;
  subject_name: string;
  exam_name: string;
  exam_type: string;
  exam_status: ExamStatus;
  room_number?: string;
  building_name?: string;
}

const getExamBadgeType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  switch (status) {
    case 'COMPLETED':
    case 'PUBLISHED':
      return 'success';
    case 'IN_PROGRESS':
      return 'warning';
    case 'SCHEDULED':
      return 'info';
    default:
      return 'info';
  }
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatTime = (timeStr: string) => {
  if (!timeStr) return 'N/A';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

const isUpcoming = (dateStr: string) => new Date(dateStr) >= new Date(new Date().toDateString());

export const ExamScheduleScreen: React.FC = () => {
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected, setSelected] = useState<ExamSchedule | null>(null);

  const loadExams = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await ExamApi.getExamSchedule();
      if (res.data) setExams(res.data as ExamSchedule[]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load exam schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadExams(); }, [loadExams]);

  const filtered = exams.filter((e) =>
    tab === 'upcoming' ? isUpcoming(e.exam_date) : !isUpcoming(e.exam_date)
  );

  if (loading) return <LoadingSpinner message="Loading exam schedule..." />;

  return (
    <View style={styles.container}>
      <Header
        title="Examination Schedule"
        subtitle="Exam Timetable & Hall Details"
        onRightPress={() => loadExams(true)}
        rightIconLabel="Refresh"
      />

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'upcoming' && styles.tabActive]}
          onPress={() => setTab('upcoming')}
        >
          <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'completed' && styles.tabActive]}
          onPress={() => setTab('completed')}
        >
          <Text style={[styles.tabText, tab === 'completed' && styles.tabTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadExams(true)} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            title={tab === 'upcoming' ? 'No Upcoming Exams' : 'No Completed Exams'}
            message={tab === 'upcoming' ? 'No upcoming exams scheduled.' : 'No completed exams found.'}
          />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setSelected(item); setDetailVisible(true); }} activeOpacity={0.8}>
            <Card style={[styles.card, { borderLeftColor: Colors.primary, borderLeftWidth: 4 }]}>
              <View style={styles.row}>
                <Text style={styles.examDate}>{formatDate(item.exam_date)}</Text>
                <Badge label={item.exam_type} type="info" />
              </View>
              <Text style={styles.subjectName}>{item.subject_name}</Text>
              <Text style={styles.subjectCode}>{item.subject_code}</Text>
              <View style={styles.row} >
                <Text style={styles.meta}>
                  🕐 {formatTime(item.start_time)} – {formatTime(item.end_time)}
                </Text>
                {item.room_number ? (
                  <Badge label={`${item.building_name ? item.building_name + ' ' : ''}${item.room_number}`} type="success" />
                ) : null}
              </View>
              <Text style={styles.meta}>Exam: {item.exam_name}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={detailVisible} animationType="slide" transparent onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalBox}>
            <Text style={styles.modalTitle}>Exam Details</Text>
            {selected && (
              <>
                <Badge label={selected.exam_status} type={getExamBadgeType(selected.exam_status)} />
                <Text style={styles.detailSubject}>{selected.subject_name}</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Subject Code</Text>
                  <Text style={styles.infoValue}>{selected.subject_code}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Exam Name</Text>
                  <Text style={styles.infoValue}>{selected.exam_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Exam Type</Text>
                  <Text style={styles.infoValue}>{selected.exam_type}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{formatDate(selected.exam_date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Time</Text>
                  <Text style={styles.infoValue}>{formatTime(selected.start_time)} – {formatTime(selected.end_time)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Room</Text>
                  <Text style={styles.infoValue}>
                    {selected.room_number
                      ? `${selected.building_name || ''} Room ${selected.room_number}`
                      : 'To be announced'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Max Marks</Text>
                  <Text style={styles.infoValue}>{selected.max_marks}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Passing Marks</Text>
                  <Text style={styles.infoValue}>{selected.passing_marks}</Text>
                </View>
                <Button title="Close" onPress={() => setDetailVisible(false)} style={{ marginTop: 16 }} />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 20 },
  card: { marginVertical: 6 },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 12, backgroundColor: Colors.surface, borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#FFFFFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  examDate: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  subjectName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginVertical: 2 },
  subjectCode: { fontSize: 11, color: Colors.primary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  meta: { fontSize: 12, color: Colors.textSecondary },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
  detailSubject: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginVertical: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, flex: 1, textAlign: 'right' },
});
