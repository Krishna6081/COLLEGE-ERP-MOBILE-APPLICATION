import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GraduationCap, CalendarDays, CalendarRange, Clock, ChevronRight, Bell } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { PageContent } from '../../components/PageContent';
import { ProgressRing } from '../../components/ProgressRing';
import { Colors } from '../../constants/colors';
import { Shadows, webGradient, webInteractive } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { ErpApi } from '../../api/erp.api';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const getTodayDay = () => DAYS[(new Date().getDay() + 6) % 7];

const formatTime = (value?: string) => {
  if (!value) return '';
  const [hStr, mStr] = String(value).slice(0, 5).split(':');
  const h = Number(hStr);
  if (!Number.isFinite(h) || !mStr) return String(value);
  return `${h % 12 || 12}:${mStr} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const ParentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<any>(null);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      const todayDay = getTodayDay();
      const [res, ttRes, calRes]: any[] = await Promise.all([
        apiClient.get('/dashboard'),
        ErpApi.getTimetable({ day_of_week: todayDay }).catch(() => ({ data: [] })),
        ErpApi.getCalendarEvents().catch(() => ({ data: [] })),
      ]);
      setData(res?.data || res);
      const ttRows = ttRes?.data ?? ttRes;
      setTodayClasses(Array.isArray(ttRows) ? ttRows : []);

      const calRows = calRes?.data ?? calRes;
      const todayKey = new Date().toISOString().slice(0, 10);
      const upcoming = (Array.isArray(calRows) ? calRows : [])
        .filter((ev: any) => String(ev.end_date || ev.start_date || '').slice(0, 10) >= todayKey)
        .slice(0, 3);
      setUpcomingEvents(upcoming);
      setErrorMessage('');
    } catch (error: any) {
      setData(null);
      setErrorMessage(error?.message || 'Could not load this dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner message="Loading parent portal..." />;
  if (!data) {
    return (
      <DashboardUnavailable
        title="Parent Dashboard"
        message={errorMessage}
        onRetry={() => { setLoading(true); fetchData(); }}
      />
    );
  }

  const students = data?.linked_students || [];
  const formatCurrency = (val: number) => '₹' + Number(val || 0).toLocaleString();

  return (
    <View style={styles.container}>
      <Header
        title={`Hello, ${user?.first_name || 'Parent'}!`}
        subtitle="Parent Portal — Ward Progress & Schedule"
        onRightPress={() => { setRefreshing(true); fetchData(); }}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            colors={[Colors.primary]}
          />
        }
      >
        <PageContent>
          {students.length === 0 ? (
            <Card>
              <EmptyState
                title="No students linked to your account"
                message="Please contact administration to link your ward to this parent account."
                icon={<GraduationCap size={26} color={Colors.primary} />}
              />
            </Card>
          ) : (
            students.map((s: any, i: number) => (
              <View key={i}>
                {/* Student Hero Banner */}
                <Card style={[styles.studentBanner, webGradient(Colors.primary, Colors.secondary, 135)]}>
                  <View style={styles.bannerRow}>
                    <View style={styles.bannerIcon}>
                      <GraduationCap size={24} color="#FFFFFF" strokeWidth={2.2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{s.student_name}</Text>
                      <Text style={styles.studentInfo}>{s.department}  •  {s.semester}</Text>
                    </View>
                  </View>
                </Card>

                {/* Quick Actions: Timetable & Academic Calendar */}
                <View style={styles.quickRow}>
                  <TouchableOpacity
                    style={[styles.quickBtn, webInteractive]}
                    onPress={() => navigation.navigate('Timetable', { initialTab: 'timetable' })}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.quickIconBox, { backgroundColor: Colors.primaryLight }]}>
                      <CalendarDays size={20} color={Colors.primary} strokeWidth={2.2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quickTitle}>Weekly Timetable</Text>
                      <Text style={styles.quickSub}>{todayClasses.length} classes today</Text>
                    </View>
                    <ChevronRight size={16} color={Colors.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickBtn, webInteractive]}
                    onPress={() => navigation.navigate('Timetable', { initialTab: 'calendar' })}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.quickIconBox, { backgroundColor: Colors.secondaryLight }]}>
                      <CalendarRange size={20} color={Colors.secondary} strokeWidth={2.2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quickTitle}>Academic Calendar</Text>
                      <Text style={styles.quickSub}>{upcomingEvents.length} upcoming</Text>
                    </View>
                    <ChevronRight size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Attendance Ring Card */}
                <Text style={styles.sectionTitle}>ATTENDANCE</Text>
                <Card>
                  <View style={styles.ringRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attLabel}>Overall Attendance</Text>
                      <Text style={styles.attDetail}>
                        {s.attended_lectures} attended out of {s.total_lectures} lectures
                      </Text>
                      <View style={styles.progressBg}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(s.attendance_percentage, 100)}%`,
                              backgroundColor: s.attendance_percentage >= 75 ? Colors.accent : Colors.danger,
                            },
                          ]}
                        />
                      </View>
                      {s.attendance_percentage < 75 && (
                        <Text style={styles.attWarning}>Below 75% — attendance shortage risk</Text>
                      )}
                    </View>
                    <ProgressRing
                      percentage={s.attendance_percentage}
                      color={s.attendance_percentage >= 75 ? Colors.accent : Colors.danger}
                      label="Rate"
                    />
                  </View>
                </Card>

                {/* Fee Status */}
                <Text style={styles.sectionTitle}>FEE STATUS</Text>
                <Card>
                  <View style={styles.feeRow}>
                    <View style={styles.feeItem}>
                      <Text style={styles.feeLabel}>Total Fee</Text>
                      <Text style={styles.feeValue}>{formatCurrency(s.fee_total)}</Text>
                    </View>
                    <View style={styles.feeDivider} />
                    <View style={styles.feeItem}>
                      <Text style={styles.feeLabel}>Paid</Text>
                      <Text style={[styles.feeValue, { color: Colors.accentDark }]}>
                        {formatCurrency(s.fee_paid)}
                      </Text>
                    </View>
                    <View style={styles.feeDivider} />
                    <View style={styles.feeItem}>
                      <Text style={styles.feeLabel}>Due</Text>
                      <Text style={[styles.feeValue, { color: s.fee_due > 0 ? Colors.danger : Colors.accentDark }]}>
                        {formatCurrency(s.fee_due)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>
            ))
          )}

          {/* Today's Class Schedule Preview */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleInline}>TODAY'S CLASSES ({getTodayDay()})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Timetable', { initialTab: 'timetable' })}>
              <Text style={styles.viewAllText}>View Full →</Text>
            </TouchableOpacity>
          </View>
          {todayClasses.length === 0 ? (
            <Card><Text style={styles.emptyText}>No classes scheduled for today</Text></Card>
          ) : (
            todayClasses.slice(0, 4).map((cls: any) => (
              <Card key={cls.id} style={styles.scheduleCard}>
                <View style={styles.noticeRow}>
                  <View style={styles.timeRow}>
                    <Clock size={13} color={Colors.primary} strokeWidth={2.2} />
                    <Text style={styles.scheduleTime}>
                      {formatTime(cls.start_time)} – {formatTime(cls.end_time)}
                    </Text>
                  </View>
                  {cls.room_number ? <Badge label={cls.room_number} type="info" /> : null}
                </View>
                <Text style={styles.classTitle}>
                  {cls.subject_name}{cls.subject_code ? ` (${cls.subject_code})` : ''}
                </Text>
                <Text style={styles.noticeDate}>
                  {cls.faculty_first_name} {cls.faculty_last_name || ''}
                </Text>
              </Card>
            ))
          )}

          {/* Upcoming Calendar Events */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleInline}>UPCOMING CALENDAR EVENTS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Timetable', { initialTab: 'calendar' })}>
              <Text style={styles.viewAllText}>Open Calendar →</Text>
            </TouchableOpacity>
          </View>
          {upcomingEvents.length === 0 ? (
            <Card><Text style={styles.emptyText}>No upcoming calendar events</Text></Card>
          ) : (
            upcomingEvents.map((ev: any) => (
              <Card key={ev.id}>
                <View style={styles.noticeRow}>
                  <Text style={styles.noticeTitle} numberOfLines={2}>{ev.title}</Text>
                  <Badge
                    label={ev.event_type}
                    type={
                      ev.event_type === 'EXAM' ? 'danger'
                      : ev.event_type === 'DEADLINE' ? 'warning'
                      : ev.event_type === 'HOLIDAY' ? 'success'
                      : 'primary'
                    }
                  />
                </View>
                <Text style={styles.noticeDate}>{String(ev.start_date || '').slice(0, 10)}</Text>
              </Card>
            ))
          )}

          {/* Recent Notices */}
          <Text style={styles.sectionTitle}>NOTICES FOR PARENTS</Text>
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
  scroll: { paddingVertical: 10, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.9,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 6,
  },
  sectionTitleInline: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.9 },
  viewAllText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  studentBanner: { borderWidth: 0, paddingVertical: 20 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: { fontSize: 19, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  studentInfo: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 3, fontWeight: '500' },

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginHorizontal: 16, marginTop: 8 },
  quickBtn: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  quickIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  quickSub: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },

  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  attLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  attDetail: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  progressBg: { height: 10, backgroundColor: Colors.surface, borderRadius: 999, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 10, borderRadius: 999 },
  attWarning: { fontSize: 12, color: Colors.danger, fontWeight: '700', marginTop: 6 },

  feeRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6 },
  feeItem: { alignItems: 'center', flex: 1 },
  feeLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  feeValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  feeDivider: { width: 1, backgroundColor: Colors.border, height: '80%', alignSelf: 'center' },

  scheduleCard: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scheduleTime: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  classTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 6 },
  noticeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  noticeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', fontSize: 13, paddingVertical: 6 },
});
