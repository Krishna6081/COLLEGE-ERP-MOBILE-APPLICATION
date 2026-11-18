import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Clock,
  BookOpen,
  Wallet,
  CalendarDays,
  FileText,
  Award,
  MessageSquareWarning,
  Calendar,
} from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { PageContent } from '../../components/PageContent';
import { ProgressRing } from '../../components/ProgressRing';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';
import { Colors } from '../../constants/colors';
import { Layout, Shadows, webInteractive } from '../../constants/theme';
import { DashboardApi } from '../../api/dashboard.api';
import { useAuthStore } from '../../store/useAuthStore';

export const StudentDashboardScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isWide = width >= Layout.tabletBreakpoint;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setRefreshing(true);
    try {
      const res = await DashboardApi.getDashboardData();
      if (res.data) {
        setData(res.data);
        setErrorMessage('');
      } else {
        setData(null);
        setErrorMessage('The server returned no dashboard data. Try again.');
      }
    } catch (error: any) {
      setData(null);
      setErrorMessage(error?.message || 'Could not load your dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) return <LoadingSpinner message="Loading student portal..." />;
  if (!data) {
    return (
      <DashboardUnavailable
        title="Student Dashboard"
        message={errorMessage}
        onRetry={() => { setLoading(true); loadData(); }}
      />
    );
  }

  const attendancePct = Number(data?.attendance_percentage ?? 0);
  const quickLinks = [
    { label: 'Timetable',   screen: 'Timetable',   color: Colors.primary,   bg: Colors.primaryLight,   icon: <CalendarDays size={19} color={Colors.primary} /> },
    { label: 'Library',     screen: 'Library',     color: Colors.secondary, bg: Colors.secondaryLight, icon: <BookOpen size={19} color={Colors.secondary} /> },
    { label: 'Fee Dues',    screen: 'Fees',        color: Colors.accentDark,bg: Colors.accentLight,    icon: <Wallet size={19} color={Colors.accentDark} /> },
    { label: 'Assignments', screen: 'Assignments', color: Colors.info,      bg: Colors.infoLight,      icon: <FileText size={19} color={Colors.info} /> },
    { label: 'Results',     screen: 'Results',     color: Colors.warning,   bg: Colors.warningLight,   icon: <Award size={19} color={Colors.warning} /> },
    { label: 'Helpdesk',    screen: 'Complaints',  color: Colors.danger,    bg: Colors.dangerLight,    icon: <MessageSquareWarning size={19} color={Colors.danger} /> },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={`Welcome, ${user?.first_name || 'Student'}!`}
        subtitle={data?.program && data?.semester ? `${data.program} • ${data.semester}` : 'Academic Overview'}
        onRightPress={loadData}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[Colors.primary]} />}
      >
        <PageContent>
          {/* KPI Grid */}
          <View style={isWide ? styles.kpiGridWide : undefined}>
            <View style={styles.statsRow}>
              <StatCard
                title="Attendance"
                value={`${attendancePct}%`}
                subtitle={`${data?.attended_lectures ?? 0}/${data?.total_lectures ?? 0} Lectures`}
                color={attendancePct >= 75 ? Colors.accent : Colors.danger}
              />
              <StatCard
                title="Current SGPA"
                value={data?.current_sgpa ?? '—'}
                subtitle={data?.sgpa_semester || 'Latest result'}
                color={Colors.primary}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Fee Paid"
                value={`₹${Number(data?.fee_status?.paid ?? 0).toLocaleString()}`}
                subtitle={`of ₹${Number(data?.fee_status?.total ?? 0).toLocaleString()}`}
                color={Colors.secondary}
              />
              <StatCard
                title="Pending Dues"
                value={`₹${Number(data?.fee_status?.due ?? 0).toLocaleString()}`}
                color={Number(data?.fee_status?.due ?? 0) > 0 ? Colors.danger : Colors.accent}
              />
            </View>
          </View>

          {/* Quick Campus Modules */}
          <Text style={styles.sectionTitle}>QUICK ACCESS</Text>
          <View style={styles.quickGrid}>
            {quickLinks.map((q) => (
              <TouchableOpacity
                key={q.screen}
                style={[styles.quickCard, webInteractive]}
                onPress={() => navigation.navigate(q.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconBox, { backgroundColor: q.bg }]}>{q.icon}</View>
                <Text style={styles.quickLabel} numberOfLines={1}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Attendance Ring Highlight */}
          <Text style={styles.sectionTitle}>ATTENDANCE STANDING</Text>
          <Card>
            <View style={styles.ringRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeading}>Overall Attendance</Text>
                <Text style={styles.cardSub}>
                  {data?.attended_lectures ?? 0} lectures attended out of {data?.total_lectures ?? 0} conducted
                </Text>
                <View style={{ marginTop: 10 }}>
                  <Badge
                    label={attendancePct >= 75 ? 'Eligible for Exams' : 'Below 75% Requirement'}
                    type={attendancePct >= 75 ? 'success' : 'danger'}
                  />
                </View>
              </View>
              <ProgressRing
                percentage={attendancePct}
                color={attendancePct >= 75 ? Colors.accent : Colors.danger}
                label="Avg"
              />
            </View>
          </Card>

          {/* Today's Timetable */}
          <Text style={styles.sectionTitle}>TODAY'S SCHEDULE</Text>
          {(data?.todays_timetable || []).length === 0 ? (
            <Card>
              <EmptyState
                title="No classes scheduled today"
                message="Check the full Weekly Timetable tab for upcoming lectures."
                icon={<Calendar size={22} color={Colors.primary} />}
              />
            </Card>
          ) : (
            (data?.todays_timetable || []).map((item: any, idx: number) => (
              <Card key={idx} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.timeRow}>
                    <Clock size={14} color={Colors.primary} strokeWidth={2.2} />
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                  {item.room ? <Badge label={item.room} type="info" /> : null}
                </View>
                <Text style={styles.subjectText}>{item.subject}</Text>
                <Text style={styles.facultyText}>{item.faculty}</Text>
              </Card>
            ))
          )}

          {/* Upcoming Exams */}
          {(data?.upcoming_exams || []).length > 0 && (
            <>
              <Text style={styles.sectionTitle}>UPCOMING EXAMINATIONS</Text>
              {data.upcoming_exams.map((exam: any, idx: number) => (
                <Card key={idx}>
                  <View style={styles.examRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.examTitle}>{exam.exam_name || exam.subject_name || exam.title || 'Exam'}</Text>
                      <Text style={styles.examDate}>{exam.exam_date || exam.date} • {exam.start_time || exam.time}</Text>
                    </View>
                    <Badge label="SCHEDULED" type="warning" />
                  </View>
                </Card>
              ))}
            </>
          )}
        </PageContent>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingVertical: 10, paddingBottom: 32 },
  kpiGridWide: { flexDirection: 'row', paddingHorizontal: 10 },
  statsRow: { flex: 1, flexDirection: 'row', paddingHorizontal: 6, marginTop: 4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.9,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  quickCard: {
    flexGrow: 1,
    flexBasis: 100,
    minWidth: 100,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  quickIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },

  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardHeading: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  cardSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },

  scheduleCard: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 12.5, fontWeight: '700', color: Colors.primary },
  subjectText: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  facultyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },

  examRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  examTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  examDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
});
