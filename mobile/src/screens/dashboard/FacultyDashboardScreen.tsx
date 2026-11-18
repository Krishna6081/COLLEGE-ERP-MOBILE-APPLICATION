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
import { Clock, CheckSquare, Users, Calendar, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { PageContent } from '../../components/PageContent';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';
import { Colors } from '../../constants/colors';
import { Layout, webInteractive } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';

export const FacultyDashboardScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isWide = width >= Layout.tabletBreakpoint;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      const res: any = await apiClient.get('/dashboard');
      setData(res?.data || res);
      setErrorMessage('');
    } catch (error: any) {
      setData(null);
      setErrorMessage(error?.message || 'Could not load your dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner message="Loading faculty workspace..." />;

  if (!data) {
    return (
      <DashboardUnavailable
        title="Faculty Dashboard"
        message={errorMessage}
        onRetry={() => { setLoading(true); fetchData(); }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`Hello, ${data?.faculty_name || `Prof. ${user?.last_name || 'Faculty'}`}!`}
        subtitle={data?.department || 'Faculty Workspace'}
        onRightPress={() => { setRefreshing(true); fetchData(); }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            colors={[Colors.primary]}
          />
        }
      >
        <PageContent>
          {/* Pending Actions */}
          {(data?.pending_grading > 0 || data?.pending_leave > 0) && (
            <Card style={styles.alertCard}>
              {data?.pending_grading > 0 && (
                <Text style={styles.alertItem}>• {data.pending_grading} assignment(s) awaiting grading</Text>
              )}
              {data?.pending_leave > 0 && (
                <Text style={styles.alertItem}>• {data.pending_leave} pending leave request(s)</Text>
              )}
            </Card>
          )}

          {/* KPI Grid */}
          <View style={isWide ? styles.kpiGridWide : undefined}>
            <View style={styles.statsRow}>
              <StatCard title="Assigned Subjects" value={data?.assigned_subjects || 0} color={Colors.primary} />
              <StatCard title="Pending Grading" value={data?.pending_grading || 0} color={Colors.warning} />
            </View>
            <View style={styles.statsRow}>
              <StatCard title="Upcoming Exams" value={data?.upcoming_exams || 0} color={Colors.secondary} />
              <StatCard title="Lectures Today" value={(data?.todays_lectures || []).length} color={Colors.accent} />
            </View>
          </View>

          {/* Today's Lectures */}
          <Text style={styles.sectionTitle}>TODAY'S LECTURE SCHEDULE</Text>
          {(data?.todays_lectures || []).length === 0 ? (
            <Card>
              <EmptyState
                title="No lectures today"
                message="You have no scheduled classes for today."
                icon={<Calendar size={24} color={Colors.primary} />}
              />
            </Card>
          ) : (
            data.todays_lectures.map((lec: any, idx: number) => (
              <Card key={lec.timetable_id || idx} style={styles.lecCard}>
                <View style={styles.lecHeader}>
                  <View style={styles.timeRow}>
                    <Clock size={14} color={Colors.primary} strokeWidth={2.2} />
                    <Text style={styles.time}>{lec.time}</Text>
                  </View>
                  <Badge label={lec.room} type="info" />
                </View>
                <Text style={styles.lecTitle}>{lec.subject}</Text>
                <Text style={styles.lecDiv}>{lec.division}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.primaryPillBtn, webInteractive]}
                    disabled={!lec.timetable_id || !lec.division_id || !lec.subject_id}
                    onPress={() => navigation.navigate('MarkAttendance', { lecture: lec })}
                  >
                    <CheckSquare size={14} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.primaryPillText}>Mark Attendance</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.outlinePillBtn, webInteractive]}
                    disabled={!lec.division_id}
                    onPress={() =>
                      navigation.navigate('StudentList', {
                        divisionId: lec.division_id,
                        batchId: lec.batch_id || undefined,
                      })
                    }
                  >
                    <Users size={14} color={Colors.primary} strokeWidth={2.2} />
                    <Text style={styles.outlinePillText}>Class Roster</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}

          {/* Recent Notices */}
          <Text style={styles.sectionTitle}>RECENT NOTICES</Text>
          {(data?.recent_notices || []).length === 0 ? (
            <Card>
              <EmptyState title="No recent notices" icon={<Bell size={22} color={Colors.primary} />} />
            </Card>
          ) : (
            data.recent_notices.map((n: any, i: number) => (
              <Card key={i}>
                <View style={styles.noticeRow}>
                  <Text style={styles.noticeTitle} numberOfLines={2}>{n.title}</Text>
                  <Badge
                    label={n.priority}
                    type={n.priority === 'URGENT' ? 'danger' : n.priority === 'HIGH' ? 'warning' : 'info'}
                  />
                </View>
                <Text style={styles.noticeDate}>{n.publish_date}</Text>
              </Card>
            ))
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
    marginBottom: 6,
  },
  alertCard: {
    backgroundColor: Colors.warningLight,
    borderColor: '#FDE68A',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alertItem: { fontSize: 13, color: '#92400E', fontWeight: '600', marginVertical: 2 },

  lecCard: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  lecHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  time: { fontSize: 12.5, fontWeight: '700', color: Colors.primary },
  lecTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  lecDiv: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, fontWeight: '500' },

  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  primaryPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  primaryPillText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' },
  outlinePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  outlinePillText: { color: Colors.primary, fontSize: 12.5, fontWeight: '700' },

  noticeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  noticeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 5 },
});
