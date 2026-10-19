import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

type AttendanceSummary = {
  total_lectures: number;
  present: number;
  absent: number;
  percentage: number;
  shortage_alert: boolean;
};

export const StudentAttendanceScreen: React.FC = () => {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await ErpApi.getAttendanceSummary();
      const data = (response as any)?.data ?? response;
      setSummary(data && typeof data === 'object' ? data : null);
      setError('');
    } catch (requestError: any) {
      setError(requestError?.message || 'Could not load attendance. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  if (loading && !summary) {
    return <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="My Attendance Record"
        subtitle="Attendance summary"
        onRightPress={() => loadSummary()}
        rightIconLabel="Refresh"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSummary(true)} />}
      >
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadSummary()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {summary && (
          <>
            <Card style={styles.overallCard}>
              <Text style={styles.overallVal}>{Number(summary.percentage || 0)}%</Text>
              <Text style={styles.overallLbl}>OVERALL ATTENDANCE</Text>
              <Badge
                label={summary.shortage_alert ? 'Below attendance requirement' : 'Attendance threshold met'}
                type={summary.shortage_alert ? 'danger' : 'success'}
              />
            </Card>

            <Text style={styles.sectionTitle}>ATTENDANCE TOTALS</Text>
            <Card>
              <View style={styles.countRow}>
                <View style={styles.countItem}>
                  <Text style={styles.countValue}>{Number(summary.present || 0)}</Text>
                  <Text style={styles.countLabel}>Present</Text>
                </View>
                <View style={styles.countItem}>
                  <Text style={styles.countValue}>{Number(summary.absent || 0)}</Text>
                  <Text style={styles.countLabel}>Absent</Text>
                </View>
                <View style={styles.countItem}>
                  <Text style={styles.countValue}>{Number(summary.total_lectures || 0)}</Text>
                  <Text style={styles.countLabel}>Total lectures</Text>
                </View>
              </View>
            </Card>
          </>
        )}

        {!error && !loading && !summary && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No attendance summary is available yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 20 },
  overallCard: { alignItems: 'center', paddingVertical: 20, backgroundColor: Colors.primaryDark },
  overallVal: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
  overallLbl: { fontSize: 12, color: '#93C5FD', fontWeight: '700', marginVertical: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, marginHorizontal: 20, marginTop: 20, marginBottom: 6 },
  countRow: { flexDirection: 'row', justifyContent: 'space-around' },
  countItem: { alignItems: 'center', paddingHorizontal: 8 },
  countValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  countLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  empty: { alignItems: 'center', padding: 28 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center' },
  errorBox: { margin: 12, padding: 16, borderRadius: 10, backgroundColor: '#FEE2E2' },
  errorText: { color: '#991B1B', fontSize: 14 },
  retryText: { color: Colors.primaryDark, fontWeight: '700', marginTop: 10 },
});
