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

export const PlacementOfficerDashboardScreen: React.FC = () => {
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
  if (!data) return <DashboardUnavailable title="Placement Dashboard" message={errorMessage} onRetry={() => { setLoading(true); fetchData(); }} />;

  const placementRate = data?.total_applications > 0
    ? Math.round((data.selected_students / data.total_applications) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <Header
        title={`Hello, ${user?.first_name || 'Placement Officer'}!`}
        subtitle="Training & Placement Cell"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Key Stats */}
        <View style={styles.row}>
          <StatCard title="Total Drives" value={data?.total_drives || 0} color={Colors.primary} />
          <StatCard title="Active Drives" value={data?.active_drives || 0} color={Colors.success} />
        </View>
        <View style={styles.row}>
          <StatCard title="Students Placed" value={data?.selected_students || 0} color={Colors.success} />
          <StatCard title="Shortlisted" value={data?.shortlisted_students || 0} color={Colors.warning} />
        </View>

        {/* Placement Rate Banner */}
        <Card style={styles.rateBanner}>
          <Text style={styles.ratePct}>{placementRate}%</Text>
          <Text style={styles.rateLabel}>Overall Placement Rate</Text>
          <Text style={styles.rateSubLabel}>{data?.selected_students || 0} placed out of {data?.total_applications || 0} applicants</Text>
        </Card>

        {/* Active Drives */}
        <Text style={styles.sectionTitle}>ACTIVE PLACEMENT DRIVES</Text>
        {(data?.active_drives_detail || []).length === 0 ? (
          <Card><Text style={styles.empty}>No active drives at this time</Text></Card>
        ) : (
          data.active_drives_detail.map((drive: any, i: number) => (
            <Card key={i}>
              <View style={styles.rowBetween}>
                <Text style={styles.driveName} numberOfLines={1}>{drive.drive_name}</Text>
                <Badge label={`${drive.applications} apps`} type="info" />
              </View>
              <Text style={styles.company}>{drive.company_name}</Text>
              <View style={styles.driveDetails}>
                <Text style={styles.detailText}>💼 {drive.job_role}</Text>
                <Text style={styles.detailText}>💰 {drive.salary_package}</Text>
                <Text style={styles.detailText}>📅 {drive.drive_date}</Text>
              </View>
            </Card>
          ))
        )}

        {/* Completed Drives */}
        <Card style={{ marginTop: 10 }}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completed Drives</Text>
            <Text style={styles.summaryValue}>{data?.completed_drives || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Applications</Text>
            <Text style={styles.summaryValue}>{data?.total_applications || 0}</Text>
          </View>
        </Card>
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
  rateBanner: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: Colors.primary, alignItems: 'center', paddingVertical: 20,
  },
  ratePct: { fontSize: 48, fontWeight: '900', color: '#fff' },
  rateLabel: { fontSize: 16, color: '#fff', fontWeight: '700', marginTop: 4 },
  rateSubLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  driveName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  company: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  driveDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  detailText: { fontSize: 12, color: Colors.textSecondary },
  rowBetween: { flexDirection: 'row', alignItems: 'center' },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
