import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

export const AdminDashboardScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();
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
  if (!data) return <DashboardUnavailable title="Admin Dashboard" message={errorMessage} onRetry={() => { setLoading(true); fetchData(); }} />;

  const formatCurrency = (val: number) => '₹' + (val / 100000).toFixed(1) + 'L';

  const quickActions = [
    { label: '👥 Students',    onPress: () => navigation.navigate('StudentList') },
    { label: '👨‍🏫 Faculty',     onPress: () => navigation.navigate('FacultyList') },
    { label: '📋 Complaints',  onPress: () => navigation.navigate('Complaints') },
    { label: '📜 Certificates', onPress: () => navigation.navigate('Certificates') },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="College Admin Portal"
        subtitle={`Admin: ${user?.first_name || ''} ${user?.last_name || ''}`}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Action Alerts */}
        {(data?.pending_leave_approvals > 0 || data?.complaints_open > 0) && (
          <Card style={styles.alertCard}>
            <Text style={styles.alertTitle}>⏳ Requires Attention</Text>
            {data?.pending_leave_approvals > 0 && (
              <Text style={styles.alertItem}>• {data.pending_leave_approvals} pending leave approval(s)</Text>
            )}
            {data?.complaints_open > 0 && (
              <Text style={styles.alertItem}>• {data.complaints_open} open complaint(s)</Text>
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

        {/* Fee Summary */}
        <Card style={styles.feeCard}>
          <View style={styles.feeRow}>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Fee Collected</Text>
              <Text style={[styles.feeValue, { color: Colors.success }]}>
                {formatCurrency(data?.total_fee_collected || 0)}
              </Text>
            </View>
            <View style={styles.feeDivider} />
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Pending Dues</Text>
              <Text style={[styles.feeValue, { color: Colors.danger }]}>
                {formatCurrency(data?.pending_fee_amount || 0)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionBtn} onPress={a.onPress}>
              <Text style={styles.actionText}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Department Overview */}
        <Text style={styles.sectionTitle}>DEPARTMENT OVERVIEW</Text>
        {(data?.department_statistics || []).map((dept: any, i: number) => (
          <Card key={i} style={{ paddingVertical: 10 }}>
            <View style={styles.deptRow}>
              <Text style={styles.deptName} numberOfLines={1}>{dept.label}</Text>
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
                <Badge label={n.priority} type={n.priority === 'HIGH' ? 'warning' : 'info'} />
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
  alertCard: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: '#FFF3CD', borderLeftWidth: 4, borderLeftColor: Colors.warning,
  },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#856404', marginBottom: 6 },
  alertItem: { fontSize: 13, color: '#856404', marginBottom: 2 },
  feeCard: { marginHorizontal: 16, marginTop: 16 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  feeItem: { alignItems: 'center', flex: 1 },
  feeLabel: { fontSize: 12, color: Colors.textSecondary },
  feeValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  feeDivider: { width: 1, backgroundColor: Colors.border, height: '80%', alignSelf: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  actionBtn: {
    backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
    width: '47%', alignItems: 'center',
  },
  actionText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  deptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deptName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  deptStrength: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginTop: 8 },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  noticeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noticeTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  noticeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 10 },
});
