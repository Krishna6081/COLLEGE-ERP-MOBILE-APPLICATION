import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

export const NonTeachingStaffDashboardScreen: React.FC = () => {
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
  if (!data) return <DashboardUnavailable title="Staff Dashboard" message={errorMessage} onRetry={() => { setLoading(true); fetchData(); }} />;

  const getLeaveCount = (status: string) =>
    data?.my_leave_summary?.find((l: any) => l.status === status)?.count || 0;

  return (
    <View style={styles.container}>
      <Header
        title={`Hello, ${user?.first_name || 'Staff'}!`}
        subtitle="Non-Teaching Staff Portal"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Welcome banner */}
        <Card style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>🏫 {data?.message || 'Welcome to College ERP'}</Text>
          {data?.unread_notifications > 0 && (
            <Text style={styles.notifText}>🔔 You have {data.unread_notifications} unread notification(s)</Text>
          )}
        </Card>

        {/* Leave Summary */}
        <Text style={styles.sectionTitle}>MY LEAVE SUMMARY</Text>
        <Card>
          <View style={styles.leaveRow}>
            <View style={styles.leaveItem}>
              <Text style={styles.leaveCount}>{getLeaveCount('APPROVED')}</Text>
              <Text style={styles.leaveLabel}>Approved</Text>
            </View>
            <View style={styles.leaveDivider} />
            <View style={styles.leaveItem}>
              <Text style={[styles.leaveCount, { color: Colors.warning }]}>{getLeaveCount('PENDING')}</Text>
              <Text style={styles.leaveLabel}>Pending</Text>
            </View>
            <View style={styles.leaveDivider} />
            <View style={styles.leaveItem}>
              <Text style={[styles.leaveCount, { color: Colors.danger }]}>{getLeaveCount('REJECTED')}</Text>
              <Text style={styles.leaveLabel}>Rejected</Text>
            </View>
          </View>
        </Card>

        {/* Recent Notices */}
        <Text style={styles.sectionTitle}>NOTICES & ANNOUNCEMENTS</Text>
        {(data?.recent_notices || []).length === 0 ? (
          <Card><Text style={styles.empty}>No recent notices</Text></Card>
        ) : (
          data.recent_notices.map((notice: any, i: number) => (
            <Card key={i}>
              <View style={styles.rowBetween}>
                <Text style={styles.noticeTitle} numberOfLines={2}>{notice.title}</Text>
                <Badge
                  label={notice.priority}
                  type={notice.priority === 'URGENT' ? 'danger' : notice.priority === 'HIGH' ? 'warning' : 'info'}
                />
              </View>
              <Text style={styles.noticeDate}>{notice.publish_date}</Text>
            </Card>
          ))
        )}

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <Card>
          <Text style={styles.quickLink}>📝  Apply for Leave</Text>
          <Text style={styles.quickLink}>📣  View All Notices</Text>
          <Text style={styles.quickLink}>🔔  My Notifications</Text>
          <Text style={styles.quickLink}>👤  My Profile</Text>
        </Card>
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
  welcomeCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.primary },
  welcomeText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  notifText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  leaveRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  leaveItem: { alignItems: 'center', flex: 1 },
  leaveCount: { fontSize: 28, fontWeight: '900', color: Colors.success },
  leaveLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  leaveDivider: { width: 1, backgroundColor: Colors.border, height: '80%', alignSelf: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noticeTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  noticeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 8 },
  quickLink: { fontSize: 15, color: Colors.primary, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
});
