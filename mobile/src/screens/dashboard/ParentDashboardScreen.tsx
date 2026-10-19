import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

export const ParentDashboardScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
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
      setErrorMessage(error?.message || 'Could not load this dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
  if (!data) return <DashboardUnavailable title="Parent Dashboard" message={errorMessage} onRetry={() => { setLoading(true); fetchData(); }} />;

  const students = data?.linked_students || [];
  const formatCurrency = (val: number) => '₹' + Number(val || 0).toLocaleString();

  return (
    <View style={styles.container}>
      <Header
        title={`Hello, ${user?.first_name || 'Parent'}!`}
        subtitle="Parent Portal — Ward Progress"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {students.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No students linked to your account</Text>
            <Text style={styles.emptyHint}>Please contact administration to link your ward</Text>
          </Card>
        ) : (
          students.map((s: any, i: number) => (
            <View key={i}>
              {/* Student Card */}
              <Card style={styles.studentBanner}>
                <Text style={styles.studentName}>🎓 {s.student_name}</Text>
                <Text style={styles.studentInfo}>{s.department} • {s.semester}</Text>
              </Card>

              {/* Attendance */}
              <Text style={styles.sectionTitle}>ATTENDANCE</Text>
              <Card>
                <View style={styles.attRow}>
                  <Text style={styles.attLabel}>Overall Attendance</Text>
                  <Text style={[styles.attValue, {
                    color: s.attendance_percentage >= 75 ? Colors.success : Colors.danger
                  }]}>
                    {s.attendance_percentage}%
                  </Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, {
                    width: `${Math.min(s.attendance_percentage, 100)}%`,
                    backgroundColor: s.attendance_percentage >= 75 ? Colors.success : Colors.danger,
                  }]} />
                </View>
                <Text style={styles.attDetail}>
                  {s.attended_lectures} attended out of {s.total_lectures} lectures
                </Text>
                {s.attendance_percentage < 75 && (
                  <Text style={styles.attWarning}>⚠️ Below 75% — attendance shortage risk</Text>
                )}
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
                    <Text style={[styles.feeValue, { color: Colors.success }]}>
                      {formatCurrency(s.fee_paid)}
                    </Text>
                  </View>
                  <View style={styles.feeDivider} />
                  <View style={styles.feeItem}>
                    <Text style={styles.feeLabel}>Due</Text>
                    <Text style={[styles.feeValue, { color: s.fee_due > 0 ? Colors.danger : Colors.success }]}>
                      {formatCurrency(s.fee_due)}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          ))
        )}

        {/* Recent Notices */}
        <Text style={styles.sectionTitle}>NOTICES FOR PARENTS</Text>
        {(data?.recent_notices || []).length === 0 ? (
          <Card><Text style={styles.emptyText}>No recent notices</Text></Card>
        ) : (
          data.recent_notices.map((n: any, i: number) => (
            <Card key={i}>
              <View style={styles.noticeRow}>
                <Text style={styles.noticeTitle} numberOfLines={2}>{n.title}</Text>
                <Badge
                  label={n.priority}
                  type={n.priority === 'HIGH' ? 'warning' : 'info'}
                />
              </View>
              <Text style={styles.noticeDate}>{n.publish_date}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.textSecondary,
    marginHorizontal: 20, marginTop: 20, marginBottom: 6,
  },
  studentBanner: { marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.primary },
  studentName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  studentInfo: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  attRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attLabel: { fontSize: 14, color: Colors.textSecondary },
  attValue: { fontSize: 26, fontWeight: '900' },
  progressBg: { height: 10, backgroundColor: Colors.border, borderRadius: 5, marginTop: 8 },
  progressFill: { height: 10, borderRadius: 5 },
  attDetail: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  attWarning: { fontSize: 12, color: Colors.danger, fontWeight: '600', marginTop: 6 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  feeItem: { alignItems: 'center', flex: 1 },
  feeLabel: { fontSize: 12, color: Colors.textSecondary },
  feeValue: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary, marginTop: 4 },
  feeDivider: { width: 1, backgroundColor: Colors.border, height: '80%', alignSelf: 'center' },
  noticeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noticeTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  noticeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  emptyCard: { marginHorizontal: 16, marginTop: 20, alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', fontSize: 14 },
  emptyHint: { color: Colors.textSecondary, textAlign: 'center', fontSize: 12, marginTop: 6 },
});
