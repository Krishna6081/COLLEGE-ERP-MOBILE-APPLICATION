import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PageContent } from '../../components/PageContent';
import { ProgressRing } from '../../components/ProgressRing';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { DashboardUnavailable } from '../../components/DashboardUnavailable';

export const LibrarianDashboardScreen: React.FC = () => {
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

  if (loading) return <LoadingSpinner message="Loading library analytics..." />;
  if (!data) {
    return (
      <DashboardUnavailable
        title="Library Dashboard"
        message={errorMessage}
        onRetry={() => { setLoading(true); fetchData(); }}
      />
    );
  }

  const issuedCount = Math.max(0, (data?.total_books || 0) - (data?.available_books || 0));
  const circulationPct = data?.total_books > 0
    ? Math.round((issuedCount / data.total_books) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <Header
        title="Library Operations"
        subtitle={`Librarian: ${user?.first_name || ''} ${user?.last_name || ''}`}
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
          {data?.overdue_books > 0 && (
            <Card style={styles.alertCard}>
              <View style={styles.alertRow}>
                <AlertTriangle size={18} color={Colors.danger} strokeWidth={2.2} />
                <Text style={styles.alertText}>
                  {data.overdue_books} overdue book(s)  •  ₹{Number(data.fines_pending || 0).toLocaleString()} in pending fines
                </Text>
              </View>
            </Card>
          )}

          {/* KPI Grid */}
          <View style={isWide ? styles.kpiGridWide : undefined}>
            <View style={styles.row}>
              <StatCard title="Total Copies" value={Number(data?.total_books || 0).toLocaleString()} color={Colors.primary} />
              <StatCard title="Available" value={Number(data?.available_books || 0).toLocaleString()} color={Colors.accent} />
            </View>
            <View style={styles.row}>
              <StatCard title="Issued Today" value={data?.issued_today || 0} color={Colors.secondary} />
              <StatCard title="Returned Today" value={data?.returned_today || 0} color={Colors.info} />
            </View>
          </View>

          {/* Circulation Ring */}
          <Text style={styles.sectionTitle}>CIRCULATION OVERVIEW</Text>
          <Card>
            <View style={styles.ringRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.progLabel}>Books Currently in Circulation</Text>
                <Text style={styles.progHint}>
                  {issuedCount} book(s) currently issued out of {Number(data?.total_books || 0).toLocaleString()} total copies
                </Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${Math.min(circulationPct, 100)}%` }]} />
                </View>
              </View>
              <ProgressRing percentage={circulationPct} color={Colors.primary} label="Out" />
            </View>
          </Card>

          {/* Today's Desk Summary */}
          <Text style={styles.sectionTitle}>DESK SUMMARY</Text>
          <Card>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Books Issued Today</Text>
              <Text style={styles.summaryValue}>{data?.issued_today || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Books Returned Today</Text>
              <Text style={styles.summaryValue}>{data?.returned_today || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Overdue Books</Text>
              <Text style={[styles.summaryValue, { color: data?.overdue_books > 0 ? Colors.danger : Colors.accentDark }]}>
                {data?.overdue_books || 0}
              </Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryLabel}>Pending Fines</Text>
              <Text style={[styles.summaryValue, { color: data?.fines_pending > 0 ? Colors.warning : Colors.accentDark }]}>
                ₹{Number(data?.fines_pending || 0).toLocaleString()}
              </Text>
            </View>
          </Card>
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
  progressFill: { height: 10, backgroundColor: Colors.primary, borderRadius: 999 },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  summaryValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
});
