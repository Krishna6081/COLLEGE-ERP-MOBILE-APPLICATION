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

export const PrincipalDashboardScreen: React.FC = () => {
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
  if (!data) return <DashboardUnavailable title="Principal Dashboard" message={errorMessage} onRetry={() => { setLoading(true); fetchData(); }} />;

  const formatCurrency = (val: number) => '₹' + (val / 100000).toFixed(1) + 'L';

  return (
    <View style={styles.container}>
      <Header
        title={`Dr. ${user?.last_name || 'Principal'}`}
        subtitle="Office of the Principal"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Action Alerts */}
        {(data?.pending_leave_approvals > 0 || data?.complaints_open > 0) && (
          <Card style={styles.actionCard}>
            <Text style={styles.actionTitle}>⏳ Requires Your Attention</Text>
            {data?.pending_leave_approvals > 0 && (
              <Text style={styles.actionItem}>• {data.pending_leave_approvals} leave request(s) awaiting approval</Text>
            )}
            {data?.complaints_open > 0 && (
              <Text style={styles.actionItem}>• {data.complaints_open} complaint(s) open</Text>
            )}
          </Card>
        )}

        {/* Institution Stats */}
        <View style={styles.row}>
          <StatCard title="Total Students" value={Number(data?.total_students || 0).toLocaleString()} color={Colors.primary} />
          <StatCard title="Total Faculty" value={data?.total_faculty || 0} color={Colors.info} />
        </View>
        <View style={styles.row}>
          <StatCard title="Attendance" value={`${data?.overall_attendance || 0}%`} color={Colors.success} />
          <StatCard title="Departments" value={data?.total_departments || 0} color={Colors.secondary} />
        </View>

        {/* Fee Banner */}
        <Card style={styles.feeBanner}>
          <View style={styles.feeRow}>
            <View>
              <Text style={styles.feeLabel}>Fee Collected</Text>
              <Text style={styles.feeValue}>{formatCurrency(data?.total_fee_collected || 0)}</Text>
            </View>
            <View style={styles.feeDivider} />
            <View>
              <Text style={styles.feeLabel}>Outstanding</Text>
              <Text style={[styles.feeValue, { color: Colors.warning }]}>
                {formatCurrency(data?.pending_fee_amount || 0)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Department Overview */}
        <Text style={styles.sectionTitle}>DEPARTMENT STRENGTH</Text>
        {(data?.department_statistics || []).map((dept: any, i: number) => (
          <Card key={i} style={{ paddingVertical: 10 }}>
            <View style={styles.deptRow}>
              <Text style={styles.deptName}>{dept.label}</Text>
              <Text style={styles.deptStrength}>{dept.strength}</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, {
                width: `${Math.min((dept.strength / (data?.total_students || 1)) * 100, 100)}%`,
              }]} />
            </View>
          </Card>
        ))}

        {/* Recent Notices */}
        <Text style={styles.sectionTitle}>RECENT NOTICES</Text>
        {(data?.recent_notices || []).length === 0 ? (
          <Card><Text style={styles.empty}>No recent notices</Text></Card>
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
  actionCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#FFF3CD', borderLeftWidth: 4, borderLeftColor: Colors.warning },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#856404', marginBottom: 6 },
  actionItem: { fontSize: 13, color: '#856404', marginBottom: 2 },
  feeBanner: { marginHorizontal: 16, marginTop: 16 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  feeLabel: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  feeValue: { fontSize: 22, fontWeight: '900', color: Colors.success, textAlign: 'center', marginTop: 4 },
  feeDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  deptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deptName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  deptStrength: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginTop: 8 },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  noticeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noticeTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  noticeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 8 },
});
