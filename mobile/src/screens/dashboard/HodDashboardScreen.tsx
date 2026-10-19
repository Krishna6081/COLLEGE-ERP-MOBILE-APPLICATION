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

export const HodDashboardScreen: React.FC = () => {
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
  if (!data) return <DashboardUnavailable title="HOD Dashboard" message={errorMessage} onRetry={() => { setLoading(true); fetchData(); }} />;

  return (
    <View style={styles.container}>
      <Header
        title={`HOD — ${data?.department_name || 'Department'}`}
        subtitle={`Prof. ${user?.last_name || 'HOD'} • Department Head`}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Pending approvals alert */}
        {data?.pending_leave_approvals > 0 && (
          <Card style={styles.alertCard}>
            <Text style={styles.alertText}>
              ⏳  {data.pending_leave_approvals} leave request(s) awaiting your approval
            </Text>
          </Card>
        )}

        {/* Stats */}
        <View style={styles.row}>
          <StatCard title="Dept Students" value={data?.total_students || 0} color={Colors.primary} />
          <StatCard title="Faculty Staff" value={data?.total_faculty || 0} color={Colors.info} />
        </View>
        <View style={styles.row}>
          <StatCard title="Attendance Avg" value={`${data?.department_attendance || 0}%`} color={Colors.success} />
          <StatCard title="Leave Pending" value={data?.pending_leave_approvals || 0} color={Colors.warning} />
        </View>

        {/* Attendance Indicator */}
        <Text style={styles.sectionTitle}>DEPARTMENT ATTENDANCE</Text>
        <Card>
          <View style={styles.attRow}>
            <Text style={styles.attLabel}>Department Average</Text>
            <Text style={[styles.attValue, { color: data?.department_attendance >= 75 ? Colors.success : Colors.danger }]}>
              {data?.department_attendance || 0}%
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, {
              width: `${Math.min(data?.department_attendance || 0, 100)}%`,
              backgroundColor: data?.department_attendance >= 75 ? Colors.success : Colors.danger,
            }]} />
          </View>
          <Text style={styles.attHint}>
            {data?.department_attendance >= 75 ? '✅ Within acceptable range' : '⚠️ Below 75% — action needed'}
          </Text>
        </Card>

        {/* Recent Notices */}
        <Text style={styles.sectionTitle}>RECENT NOTICES</Text>
        {(data?.recent_notices || []).length === 0 ? (
          <Card><Text style={styles.empty}>No recent notices</Text></Card>
        ) : (
          data.recent_notices.map((n: any, i: number) => (
            <Card key={i}>
              <View style={styles.noticRow}>
                <Text style={styles.noticTitle} numberOfLines={2}>{n.title}</Text>
                <Badge label={n.priority} type={n.priority === 'HIGH' ? 'warning' : 'info'} />
              </View>
              <Text style={styles.noticDate}>{n.publish_date}</Text>
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
  row: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.textSecondary,
    marginHorizontal: 20, marginTop: 20, marginBottom: 6,
  },
  alertCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#FFF3CD', borderLeftWidth: 4, borderLeftColor: Colors.warning },
  alertText: { fontSize: 13, color: '#856404', fontWeight: '600' },
  attRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attLabel: { fontSize: 14, color: Colors.textSecondary },
  attValue: { fontSize: 22, fontWeight: '900' },
  attHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  progressBg: { height: 8, backgroundColor: Colors.border, borderRadius: 4, marginTop: 8 },
  progressFill: { height: 8, borderRadius: 4 },
  noticRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noticTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  noticDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 8 },
});
