import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

export const LibrarianDashboardScreen: React.FC = () => {
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
  if (!data) return <DashboardUnavailable title="Library Dashboard" message={errorMessage} onRetry={() => { setLoading(true); fetchData(); }} />;

  const circulationPct = data?.total_books > 0
    ? Math.round(((data.total_books - data.available_books) / data.total_books) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <Header
        title="Library Operations"
        subtitle={`Librarian: ${user?.first_name || ''} ${user?.last_name || ''}`}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Overdue Alert */}
        {data?.overdue_books > 0 && (
          <Card style={styles.alertCard}>
            <Text style={styles.alertText}>📕  {data.overdue_books} overdue book(s) • ₹{data.fines_pending} fines pending</Text>
          </Card>
        )}

        {/* Stats */}
        <View style={styles.row}>
          <StatCard title="Total Books" value={Number(data?.total_books || 0).toLocaleString()} color={Colors.primary} />
          <StatCard title="Available" value={Number(data?.available_books || 0).toLocaleString()} color={Colors.success} />
        </View>
        <View style={styles.row}>
          <StatCard title="Issued Today" value={data?.issued_today || 0} color={Colors.info} />
          <StatCard title="Returned Today" value={data?.returned_today || 0} color={Colors.secondary} />
        </View>

        {/* Circulation Rate */}
        <Text style={styles.sectionTitle}>CIRCULATION RATE</Text>
        <Card>
          <View style={styles.progRow}>
            <Text style={styles.progLabel}>Books Currently Issued</Text>
            <Text style={styles.progPct}>{circulationPct}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${circulationPct}%` }]} />
          </View>
          <Text style={styles.progHint}>
            {(data?.total_books || 0) - (data?.available_books || 0)} books out of {Number(data?.total_books || 0).toLocaleString()} total
          </Text>
        </Card>

        {/* Today's Summary */}
        <Text style={styles.sectionTitle}>TODAY'S DESK SUMMARY</Text>
        <Card>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Books Issued</Text>
            <Text style={styles.summaryValue}>{data?.issued_today || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Books Returned</Text>
            <Text style={styles.summaryValue}>{data?.returned_today || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Overdue Books</Text>
            <Text style={[styles.summaryValue, { color: data?.overdue_books > 0 ? Colors.danger : Colors.success }]}>
              {data?.overdue_books || 0}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fines Pending</Text>
            <Text style={[styles.summaryValue, { color: Colors.warning }]}>₹{data?.fines_pending || 0}</Text>
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
  alertCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#F8D7DA', borderLeftWidth: 4, borderLeftColor: Colors.danger },
  alertText: { fontSize: 13, color: '#721c24', fontWeight: '600' },
  progRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progLabel: { fontSize: 14, color: Colors.textSecondary },
  progPct: { fontSize: 22, fontWeight: '900', color: Colors.primary },
  progressBg: { height: 8, backgroundColor: Colors.border, borderRadius: 4, marginTop: 8 },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  progHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
