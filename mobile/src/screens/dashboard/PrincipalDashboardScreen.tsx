import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { Clock, Bell } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { PageContent } from '../../components/PageContent';
import { Colors } from '../../constants/colors';
import { Layout, webGradient } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

export const PrincipalDashboardScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
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
      setErrorMessage(error?.message || 'Could not load this dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner message="Loading executive overview..." />;
  if (!data) {
    return (
      <DashboardUnavailable
        title="Principal Dashboard"
        message={errorMessage}
        onRetry={() => { setLoading(true); fetchData(); }}
      />
    );
  }

  const formatCompact = (val: number) => {
    const n = Number(val || 0);
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    return `₹${n.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Dr. ${user?.last_name || 'Principal'}`}
        subtitle="Office of the Principal — Executive Overview"
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
          {/* Action Alerts */}
          {(data?.pending_leave_approvals > 0 || data?.complaints_open > 0) && (
            <Card style={styles.actionCard}>
              <View style={styles.actionHeader}>
                <Clock size={17} color={Colors.warning} strokeWidth={2.3} />
                <Text style={styles.actionTitle}>Requires Your Attention</Text>
              </View>
              {data?.pending_leave_approvals > 0 && (
                <Text style={styles.actionItem}>• {data.pending_leave_approvals} leave request(s) awaiting approval</Text>
              )}
              {data?.complaints_open > 0 && (
                <Text style={styles.actionItem}>• {data.complaints_open} campus complaint(s) currently open</Text>
              )}
            </Card>
          )}

          {/* Institution KPIs */}
          <View style={isWide ? styles.kpiGridWide : undefined}>
            <View style={styles.row}>
              <StatCard title="Total Students" value={Number(data?.total_students || 0).toLocaleString()} color={Colors.primary} />
              <StatCard title="Total Faculty" value={data?.total_faculty || 0} color={Colors.secondary} />
            </View>
            <View style={styles.row}>
              <StatCard title="Attendance" value={`${data?.overall_attendance || 0}%`} color={Colors.accent} />
              <StatCard title="Departments" value={data?.total_departments || 0} color={Colors.info} />
            </View>
          </View>

          {/* Fee Summary Banner */}
          <Card style={[styles.feeBanner, webGradient(Colors.primary, Colors.secondary, 135)]}>
            <View style={styles.feeRow}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.feeLabel}>Total Fees Collected</Text>
                <Text style={styles.feeValue}>{formatCompact(data?.total_fee_collected || 0)}</Text>
              </View>
              <View style={styles.feeDivider} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.feeLabel}>Outstanding Balance</Text>
                <Text style={[styles.feeValue, { color: '#FDE68A' }]}>
                  {formatCompact(data?.pending_fee_amount || 0)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Department Overview */}
          <Text style={styles.sectionTitle}>DEPARTMENT STRENGTH</Text>
          {(data?.department_statistics || []).map((dept: any, i: number) => (
            <Card key={i} style={{ paddingVertical: 14 }}>
              <View style={styles.deptRow}>
                <Text style={styles.deptName}>{dept.label}</Text>
                <Badge label={`${dept.strength} Students`} type="primary" />
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((dept.strength / Math.max(data?.total_students || 1, 1)) * 100, 100)}%` },
                  ]}
                />
              </View>
            </Card>
          ))}

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
  scroll: { paddingVertical: 10, paddingBottom: 32 },
  kpiGridWide: { flexDirection: 'row', paddingHorizontal: 10 },
  row: { flex: 1, flexDirection: 'row', paddingHorizontal: 6, marginTop: 4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.9,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 6,
  },
  actionCard: {
    backgroundColor: Colors.warningLight,
    borderColor: '#FDE68A',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  actionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  actionTitle: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  actionItem: { fontSize: 13, color: '#92400E', marginTop: 3, fontWeight: '500' },

  feeBanner: { borderWidth: 0, paddingVertical: 20 },
  feeRow: { flexDirection: 'row', alignItems: 'center' },
  feeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.82)', fontWeight: '600' },
  feeValue: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginTop: 4, letterSpacing: -0.4 },
  feeDivider: { width: 1, height: 42, backgroundColor: 'rgba(255,255,255,0.22)' },

  deptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  deptName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  progressBg: { height: 8, backgroundColor: Colors.surface, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 999 },

  noticeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  noticeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 5 },
});
