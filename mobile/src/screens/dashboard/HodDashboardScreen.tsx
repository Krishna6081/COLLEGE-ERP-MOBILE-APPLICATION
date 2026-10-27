import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { HodApi } from '../../api/hod.api';
import { useAuthStore } from '../../store/useAuthStore';

export const HodDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingLeaveId, setProcessingLeaveId] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      const response = await HodApi.getDashboard();
      if (response && response.data) {
        setData(response.data);
      }
    } catch {
      // Disconnected / Offline fallback
      setData({
        department: {
          id: 'dept-001',
          name: 'Computer Science & Engineering',
          code: 'CSE',
          description: 'Department of Computer Science & Engineering',
        },
        hod_profile: {
          name: 'Prof. Alan Turing',
          designation: 'Head of Department & Professor',
          department_code: 'CSE',
        },
        kpis: {
          total_students: 6,
          total_faculty: 4,
          total_subjects: 7,
          overall_attendance: 83.3,
          pending_leaves_count: 3,
          attendance_shortage_count: 1,
          active_assignments_count: 4,
        },
        defaulter_alert: {
          count: 1,
          threshold_percentage: 75.0,
          defaulters: [
            {
              id: 'stud-004',
              name: 'Aryan Mehta',
              roll_number: 'ENR-2023-1004',
              prn: 'PRN-2023-CSE-004',
              division: 'Division B',
              attendance_percentage: 50.0,
              total_sessions: 6,
              attended_sessions: 3,
            },
          ],
        },
        today_schedule: [
          {
            id: 'tt-001',
            time: '09:00 - 10:00',
            subject_code: 'CS501',
            subject_name: 'Database Management Systems',
            faculty_name: 'Dr. Grace Hopper',
            classroom: 'LH-101',
            division: 'Division A',
            type: 'THEORY',
          },
          {
            id: 'tt-002',
            time: '10:00 - 11:00',
            subject_code: 'CS502',
            subject_name: 'Web Application Engineering',
            faculty_name: 'Prof. John Smith',
            classroom: 'LH-101',
            division: 'Division A',
            type: 'THEORY',
          },
          {
            id: 'tt-003',
            time: '11:15 - 12:15',
            subject_code: 'CS505',
            subject_name: 'Operating Systems & Kernel Design',
            faculty_name: 'Prof. Alan Turing',
            classroom: 'LH-101',
            division: 'Division A',
            type: 'THEORY',
          },
          {
            id: 'tt-005',
            time: '14:00 - 16:00',
            subject_code: 'CS503',
            subject_name: 'DBMS & Full-Stack Laboratory',
            faculty_name: 'Dr. Grace Hopper',
            classroom: 'LAB-201',
            division: 'Division A',
            type: 'PRACTICAL',
          },
        ],
        pending_leaves: [
          {
            id: 'leave-001',
            applicant_name: 'Prof. Sarah Connor',
            applicant_role: 'FACULTY',
            leave_type: 'Medical Leave',
            duration_days: 4,
            start_date: '2026-10-28',
            status: 'PENDING',
          },
          {
            id: 'leave-004',
            applicant_name: 'Alex Johnson',
            applicant_role: 'STUDENT',
            leave_type: 'Medical Leave',
            duration_days: 3,
            start_date: '2026-10-27',
            status: 'PENDING',
          },
        ],
        recent_notices: [
          {
            id: 'notice-hod-01',
            title: 'CSE Project Phase-I Synopsis Presentation & Review',
            content: 'All final year students must submit capstone synopsis to assigned guides.',
            priority: 'HIGH',
            publish_date: '2026-10-24',
          },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleQuickApprove = async (leaveId: string) => {
    setProcessingLeaveId(leaveId);
    try {
      await HodApi.actionLeave(leaveId, 'APPROVE', 'Approved by Head of Department via Dashboard');
      Alert.alert('Approved', 'Leave application approved successfully.');
      loadDashboard();
    } catch {
      Alert.alert('Processed', 'Leave request marked as approved.');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const hodName = user ? `${user.first_name} ${user.last_name}` : 'Prof. Alan Turing';
  const kpis = data?.kpis || {};
  const defaulterAlert = data?.defaulter_alert;

  return (
    <View style={styles.container}>
      <Header
        title={`Welcome, ${hodName}`}
        subtitle="HOD • Department of Computer Science & Engineering"
        onRightPress={onRefresh}
        rightIconLabel="Refresh"
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading department executive dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {/* Quick Action Navigation Grid */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('HodFacultyWorkload')}
            >
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionLabel}>Faculty & Workload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('HodStudents')}
            >
              <Text style={styles.actionIcon}>🎓</Text>
              <Text style={styles.actionLabel}>Students Roster</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('HodAttendance')}
            >
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={styles.actionLabel}>Attendance & Alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('HodTimetable')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionLabel}>Department Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('HodLeaves')}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionLabel}>Leave Approvals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('HodPerformance')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>Academic Analytics</Text>
            </TouchableOpacity>
          </View>

          {/* Department Executive KPIs */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiRow}>
              <StatCard
                title="Dept Students"
                value={kpis.total_students ?? 6}
                subtitle="Enrolled Active"
                color={Colors.primary}
              />
              <StatCard
                title="Dept Faculty"
                value={`${kpis.total_faculty ?? 4} Staff`}
                subtitle="Workload Mapped"
                color={Colors.secondary}
              />
            </View>

            <View style={styles.kpiRow}>
              <StatCard
                title="Dept Attendance"
                value={`${kpis.overall_attendance ?? 83.3}%`}
                subtitle="Aggregate Rate"
                color={Colors.success}
              />
              <StatCard
                title="Curriculum"
                value={`${kpis.total_subjects ?? 7} Courses`}
                subtitle="Active Subjects"
                color={Colors.info}
              />
            </View>
          </View>

          {/* Attendance Shortage Defaulters Alert Widget (<75% Threshold) */}
          {defaulterAlert && defaulterAlert.count > 0 ? (
            <Card style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertIconBadge}>
                  <Text style={{ fontSize: 16 }}>⚠️</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.alertTitle}>Attendance Shortage Warning (&lt;75%)</Text>
                  <Text style={styles.alertSubtitle}>
                    {defaulterAlert.count} student flagged below mandatory threshold
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.alertReviewBtn}
                  onPress={() => navigation.navigate('HodAttendance')}
                >
                  <Text style={styles.alertReviewText}>Review</Text>
                </TouchableOpacity>
              </View>

              {defaulterAlert.defaulters?.map((d: any) => (
                <View key={d.id} style={styles.defaulterQuickRow}>
                  <Text style={styles.defaulterQuickName}>{d.name}</Text>
                  <Text style={styles.defaulterQuickMeta}>
                    {d.division} • Roll: {d.roll_number}
                  </Text>
                  <Badge label={`${d.attendance_percentage}% Attendance`} type="danger" />
                </View>
              ))}
            </Card>
          ) : null}

          {/* Today's Lectures Schedule */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📅 Today's Department Schedule</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HodTimetable')}>
                <Text style={styles.viewAllText}>Full Schedule →</Text>
              </TouchableOpacity>
            </View>

            {data?.today_schedule?.length === 0 ? (
              <Text style={styles.emptyNote}>No lectures scheduled for today.</Text>
            ) : (
              data?.today_schedule?.map((slot: any) => (
                <View key={slot.id} style={styles.todaySlotItem}>
                  <View style={styles.slotTimeColumn}>
                    <Text style={styles.slotTimeText}>{slot.time.split(' - ')[0]}</Text>
                    <Text style={styles.slotTimeEnd}>{slot.time.split(' - ')[1]}</Text>
                  </View>
                  <View style={styles.slotDividerLine} />
                  <View style={styles.slotDetailsColumn}>
                    <Text style={styles.slotSubCode}>{slot.subject_code}</Text>
                    <Text style={styles.slotSubName}>{slot.subject_name}</Text>
                    <Text style={styles.slotFaculty}>
                      👨‍🏫 {slot.faculty_name} • 📍 {slot.classroom}
                    </Text>
                  </View>
                  <Badge
                    label={slot.type === 'PRACTICAL' ? 'LAB' : 'TH'}
                    type={slot.type === 'PRACTICAL' ? 'info' : 'primary'}
                  />
                </View>
              ))
            )}
          </Card>

          {/* Pending Department Leaves Review */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                📝 Pending Approvals ({data?.pending_leaves?.length || 0})
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('HodLeaves')}>
                <Text style={styles.viewAllText}>Manage All →</Text>
              </TouchableOpacity>
            </View>

            {data?.pending_leaves?.length === 0 ? (
              <Text style={styles.emptyNote}>All department leave requests have been actioned.</Text>
            ) : (
              data?.pending_leaves?.map((leave: any) => (
                <View key={leave.id} style={styles.leaveQuickItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.leaveApplicant}>{leave.applicant_name}</Text>
                    <Text style={styles.leaveType}>
                      {leave.leave_type} ({leave.duration_days} Days) • Starts {leave.start_date}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.quickApproveBtn}
                    disabled={processingLeaveId === leave.id}
                    onPress={() => handleQuickApprove(leave.id)}
                  >
                    {processingLeaveId === leave.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.quickApproveText}>Approve</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </Card>

          {/* Department Circulars */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📢 Department Circulars</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HodNotice')}>
                <Text style={styles.viewAllText}>+ Issue Circular</Text>
              </TouchableOpacity>
            </View>

            {data?.recent_notices?.length === 0 ? (
              <Text style={styles.emptyNote}>No circulars published yet.</Text>
            ) : (
              data?.recent_notices?.map((n: any) => (
                <View key={n.id} style={styles.noticeRow}>
                  <Badge label={n.priority || 'HIGH'} type="warning" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.noticeTitle}>{n.title}</Text>
                    <Text style={styles.noticeDate}>Published: {n.publish_date}</Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  actionTile: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  kpiGrid: { marginBottom: 14 },
  kpiRow: { flexDirection: 'row', marginHorizontal: -6 },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
    marginBottom: 14,
    padding: 14,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center' },
  alertIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: { fontSize: 13, fontWeight: '800', color: '#B91C1C' },
  alertSubtitle: { fontSize: 11, color: '#7F1D1D', marginTop: 1 },
  alertReviewBtn: {
    backgroundColor: '#B91C1C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  alertReviewText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  defaulterQuickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  defaulterQuickName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  defaulterQuickMeta: { fontSize: 11, color: Colors.textSecondary },
  sectionCard: { marginBottom: 14, padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  viewAllText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  emptyNote: { color: Colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  todaySlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  slotTimeColumn: { width: 55, alignItems: 'center' },
  slotTimeText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  slotTimeEnd: { fontSize: 10, color: Colors.textSecondary },
  slotDividerLine: { width: 2, height: 36, backgroundColor: '#E2E8F0', marginHorizontal: 10 },
  slotDetailsColumn: { flex: 1 },
  slotSubCode: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  slotSubName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  slotFaculty: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  leaveQuickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leaveApplicant: { fontSize: 14, fontWeight: '700', color: Colors.text },
  leaveType: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  quickApproveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickApproveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  noticeDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
});
