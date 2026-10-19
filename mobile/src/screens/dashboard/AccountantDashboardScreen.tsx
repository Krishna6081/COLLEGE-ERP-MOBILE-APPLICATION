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

export const AccountantDashboardScreen: React.FC = () => {
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
  if (!data) return <DashboardUnavailable title="Accounts Dashboard" message={errorMessage} onRetry={() => { setLoading(true); fetchData(); }} />;

  const collectionPct = data?.total_demanded > 0
    ? Math.round((data.total_collected / data.total_demanded) * 100)
    : 0;

  const formatCurrency = (val: number) =>
    '₹' + (val / 100000).toFixed(1) + 'L';

  return (
    <View style={styles.container}>
      <Header
        title="Accounts & Finance"
        subtitle={`Officer: ${user?.first_name || ''} ${user?.last_name || ''}`}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Overdue Alert */}
        {data?.overdue_count > 0 && (
          <Card style={styles.alertCard}>
            <Text style={styles.alertText}>
              🔴  {data.overdue_count} students have overdue fees
            </Text>
          </Card>
        )}

        {/* Fee Stats */}
        <View style={styles.row}>
          <StatCard title="Total Demanded" value={formatCurrency(data?.total_demanded || 0)} color={Colors.primary} />
          <StatCard title="Collected" value={formatCurrency(data?.total_collected || 0)} color={Colors.success} />
        </View>
        <View style={styles.row}>
          <StatCard title="Pending" value={formatCurrency(data?.total_pending || 0)} color={Colors.danger} />
          <StatCard title="Defaulters" value={data?.pending_students || 0} color={Colors.warning} />
        </View>

        {/* Collection Progress */}
        <Text style={styles.sectionTitle}>COLLECTION PROGRESS</Text>
        <Card>
          <View style={styles.progRow}>
            <Text style={styles.progLabel}>Collected vs Demanded</Text>
            <Text style={styles.progPct}>{collectionPct}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${collectionPct}%` }]} />
          </View>
          <Text style={styles.progHint}>
            {formatCurrency(data?.total_collected || 0)} collected out of {formatCurrency(data?.total_demanded || 0)}
          </Text>
        </Card>

        {/* Recent Payments */}
        <Text style={styles.sectionTitle}>RECENT PAYMENTS</Text>
        {(data?.recent_payments || []).length === 0 ? (
          <Card><Text style={styles.empty}>No recent payments</Text></Card>
        ) : (
          data.recent_payments.map((pay: any, i: number) => (
            <Card key={i}>
              <View style={styles.payRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payName}>{pay.student_name}</Text>
                  <Text style={styles.payReceipt}>{pay.receipt_number}</Text>
                  <Text style={styles.payDate}>{pay.payment_date}</Text>
                </View>
                <View style={styles.payRight}>
                  <Text style={styles.payAmount}>₹{Number(pay.amount).toLocaleString()}</Text>
                  <Badge label={pay.payment_mode} type="info" />
                </View>
              </View>
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
  alertCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#F8D7DA', borderLeftWidth: 4, borderLeftColor: Colors.danger },
  alertText: { fontSize: 13, color: '#721c24', fontWeight: '600' },
  progRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progLabel: { fontSize: 14, color: Colors.textSecondary },
  progPct: { fontSize: 22, fontWeight: '900', color: Colors.success },
  progressBg: { height: 10, backgroundColor: Colors.border, borderRadius: 5, marginTop: 8 },
  progressFill: { height: 10, backgroundColor: Colors.success, borderRadius: 5 },
  progHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  payRow: { flexDirection: 'row', alignItems: 'center' },
  payName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  payReceipt: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  payDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  payRight: { alignItems: 'flex-end', gap: 4 },
  payAmount: { fontSize: 16, fontWeight: '900', color: Colors.success },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 8 },
});
