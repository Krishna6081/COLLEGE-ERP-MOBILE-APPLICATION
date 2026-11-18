import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { AlertTriangle, Receipt } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { PageContent } from '../../components/PageContent';
import { ProgressRing } from '../../components/ProgressRing';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

export const AccountantDashboardScreen: React.FC = () => {
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

  if (loading) return <LoadingSpinner message="Loading financial overview..." />;
  if (!data) {
    return (
      <DashboardUnavailable
        title="Accounts Dashboard"
        message={errorMessage}
        onRetry={() => { setLoading(true); fetchData(); }}
      />
    );
  }

  const collectionPct = data?.total_demanded > 0
    ? Math.round((data.total_collected / data.total_demanded) * 100)
    : 0;

  const formatCompact = (val: number) => {
    const n = Number(val || 0);
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    return `₹${n.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Accounts & Finance"
        subtitle={`Officer: ${user?.first_name || ''} ${user?.last_name || ''}`}
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
          {/* Overdue Alert */}
          {data?.overdue_count > 0 && (
            <Card style={styles.alertCard}>
              <View style={styles.alertRow}>
                <AlertTriangle size={18} color={Colors.danger} strokeWidth={2.2} />
                <Text style={styles.alertText}>
                  {data.overdue_count} student(s) currently have overdue fee dues requiring follow-up.
                </Text>
              </View>
            </Card>
          )}

          {/* KPI Grid */}
          <View style={isWide ? styles.kpiGridWide : undefined}>
            <View style={styles.row}>
              <StatCard
                title="Total Demanded"
                value={formatCompact(data?.total_demanded || 0)}
                color={Colors.primary}
              />
              <StatCard
                title="Collected"
                value={formatCompact(data?.total_collected || 0)}
                color={Colors.accent}
              />
            </View>
            <View style={styles.row}>
              <StatCard
                title="Pending Dues"
                value={formatCompact(data?.total_pending || 0)}
                color={Colors.danger}
              />
              <StatCard
                title="Defaulters"
                value={data?.pending_students || 0}
                color={Colors.warning}
              />
            </View>
          </View>

          {/* Collection Progress with SVG Ring */}
          <Text style={styles.sectionTitle}>COLLECTION PROGRESS</Text>
          <Card>
            <View style={styles.ringRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.progLabel}>Collected vs Demanded</Text>
                <Text style={styles.progHint}>
                  {formatCompact(data?.total_collected || 0)} collected out of {formatCompact(data?.total_demanded || 0)}
                </Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${Math.min(collectionPct, 100)}%` }]} />
                </View>
              </View>
              <ProgressRing percentage={collectionPct} color={Colors.accent} label="Paid" />
            </View>
          </Card>

          {/* Recent Payments */}
          <Text style={styles.sectionTitle}>RECENT PAYMENTS</Text>
          {(data?.recent_payments || []).length === 0 ? (
            <Card>
              <EmptyState
                title="No recent payments"
                message="Recorded fee receipts will appear here automatically."
                icon={<Receipt size={24} color={Colors.primary} />}
              />
            </Card>
          ) : (
            data.recent_payments.map((pay: any, i: number) => (
              <Card key={i}>
                <View style={styles.payRow}>
                  <View style={styles.receiptIcon}>
                    <Receipt size={18} color={Colors.primary} strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payName}>{pay.student_name}</Text>
                    {pay.fee_head ? <Text style={styles.payHead}>{pay.fee_head}</Text> : null}
                    <Text style={styles.payMeta}>
                      {pay.receipt_number}  •  {String(pay.payment_date || '').slice(0, 10)}
                    </Text>
                  </View>
                  <View style={styles.payRight}>
                    <Text style={styles.payAmount}>₹{Number(pay.amount).toLocaleString()}</Text>
                    <Badge label={pay.payment_mode} type="info" />
                  </View>
                </View>
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
  alertCard: {
    backgroundColor: Colors.dangerLight,
    borderColor: '#FECACA',
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertText: { flex: 1, fontSize: 13, color: '#991B1B', fontWeight: '600' },

  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  progLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  progHint: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  progressBg: { height: 10, backgroundColor: Colors.surface, borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 10, backgroundColor: Colors.accent, borderRadius: 999 },

  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  receiptIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  payHead: { fontSize: 12.5, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  payMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  payRight: { alignItems: 'flex-end', gap: 5 },
  payAmount: { fontSize: 16, fontWeight: '800', color: Colors.accentDark },
});
