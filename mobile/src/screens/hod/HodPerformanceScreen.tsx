import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { HodApi } from '../../api/hod.api';

interface TopperItem {
  rank: number;
  name: string;
  roll_number: string;
  division: string;
  sgpa: number;
  percentage: number;
}

export const HodPerformanceScreen: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPerformance = async () => {
    try {
      const response = await HodApi.getResults();
      if (response && response.data) {
        setData(response.data);
      }
    } catch {
      // Offline fallback
      setData({
        department_name: 'Computer Science & Engineering',
        pass_percentage: 100.0,
        average_sgpa: 8.98,
        total_students_evaluated: 5,
        distribution: {
          distinction: 3,
          firstClass: 1,
          secondClass: 1,
          reappear: 0,
        },
        toppers: [
          { rank: 1, name: 'Emma Watson', roll_number: 'ENR-2023-1002', division: 'Division A', sgpa: 9.85, percentage: 95.83 },
          { rank: 2, name: 'Priya Deshmukh', roll_number: 'ENR-2023-1003', division: 'Division A', sgpa: 9.55, percentage: 92.5 },
          { rank: 3, name: 'Alex Johnson', roll_number: 'ENR-2023-1001', division: 'Division A', sgpa: 9.4, percentage: 90.0 },
          { rank: 4, name: 'Ananya Roy', roll_number: 'ENR-2023-1005', division: 'Division B', sgpa: 8.8, percentage: 85.0 },
          { rank: 5, name: 'Aryan Mehta', roll_number: 'ENR-2023-1004', division: 'Division B', sgpa: 7.3, percentage: 71.67 },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPerformance();
  };

  const dist = data?.distribution || { distinction: 3, firstClass: 1, secondClass: 1, reappear: 0 };
  const totalEvaluated = data?.total_students_evaluated || 5;

  return (
    <View style={styles.container}>
      <Header
        title="Exam Performance"
        subtitle="Department Academic Results & Statistics"
        onRightPress={onRefresh}
        rightIconLabel="Refresh"
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading department academic analytics...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {/* Top KPIs Row */}
          <View style={styles.kpiRow}>
            <Card style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Pass Rate</Text>
              <Text style={[styles.kpiValue, { color: Colors.success }]}>
                {data?.pass_percentage}%
              </Text>
              <Text style={styles.kpiSub}>End-Semester Exams</Text>
            </Card>
            <Card style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Department SGPA</Text>
              <Text style={[styles.kpiValue, { color: Colors.primary }]}>
                {data?.average_sgpa}
              </Text>
              <Text style={styles.kpiSub}>Average Cohort GPA</Text>
            </Card>
          </View>

          {/* SGPA Grade Distribution */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📊 Cohort SGPA Distribution</Text>

            <View style={styles.barItem}>
              <View style={styles.barMeta}>
                <Text style={styles.barLabel}>Distinction (SGPA ≥ 9.0)</Text>
                <Text style={styles.barCount}>{dist.distinction} Students</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(dist.distinction / Math.max(1, totalEvaluated)) * 100}%`,
                      backgroundColor: Colors.success,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.barItem}>
              <View style={styles.barMeta}>
                <Text style={styles.barLabel}>First Class (7.5 - 8.9)</Text>
                <Text style={styles.barCount}>{dist.firstClass} Students</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(dist.firstClass / Math.max(1, totalEvaluated)) * 100}%`,
                      backgroundColor: Colors.primary,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.barItem}>
              <View style={styles.barMeta}>
                <Text style={styles.barLabel}>Second Class (6.0 - 7.4)</Text>
                <Text style={styles.barCount}>{dist.secondClass} Students</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(dist.secondClass / Math.max(1, totalEvaluated)) * 100}%`,
                      backgroundColor: Colors.warning,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.barItem}>
              <View style={styles.barMeta}>
                <Text style={styles.barLabel}>Backlog / KT (&lt; 6.0)</Text>
                <Text style={styles.barCount}>{dist.reappear} Students</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(dist.reappear / Math.max(1, totalEvaluated)) * 100}%`,
                      backgroundColor: Colors.danger,
                    },
                  ]}
                />
              </View>
            </View>
          </Card>

          {/* Department Toppers */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🏆 Department Merit Rankers</Text>
            {data?.toppers?.map((topper: TopperItem) => (
              <View key={topper.rank} style={styles.topperItem}>
                <View
                  style={[
                    styles.rankBadge,
                    topper.rank === 1
                      ? styles.goldBadge
                      : topper.rank === 2
                      ? styles.silverBadge
                      : topper.rank === 3
                      ? styles.bronzeBadge
                      : styles.normalBadge,
                  ]}
                >
                  <Text style={styles.rankText}>#{topper.rank}</Text>
                </View>

                <View style={styles.topperInfo}>
                  <Text style={styles.topperName}>{topper.name}</Text>
                  <Text style={styles.topperMeta}>
                    {topper.roll_number} • {topper.division}
                  </Text>
                </View>

                <View style={styles.topperScore}>
                  <Text style={styles.topperSgpa}>{topper.sgpa} SGPA</Text>
                  <Text style={styles.topperPct}>{topper.percentage}%</Text>
                </View>
              </View>
            ))}
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  kpiCard: { flex: 1, padding: 16, alignItems: 'center' },
  kpiTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  kpiValue: { fontSize: 28, fontWeight: '900', marginVertical: 4 },
  kpiSub: { fontSize: 11, color: Colors.textSecondary },
  sectionCard: { marginBottom: 14, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  barItem: { marginBottom: 12 },
  barMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: 12, color: Colors.text, fontWeight: '600' },
  barCount: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  barTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  topperItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldBadge: { backgroundColor: '#FEF3C7' },
  silverBadge: { backgroundColor: '#F1F5F9' },
  bronzeBadge: { backgroundColor: '#FFEDD5' },
  normalBadge: { backgroundColor: '#F8FAFC' },
  rankText: { fontSize: 12, fontWeight: '800', color: Colors.text },
  topperInfo: { flex: 1, marginLeft: 12 },
  topperName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  topperMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  topperScore: { alignItems: 'flex-end' },
  topperSgpa: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  topperPct: { fontSize: 11, color: Colors.textSecondary },
});
