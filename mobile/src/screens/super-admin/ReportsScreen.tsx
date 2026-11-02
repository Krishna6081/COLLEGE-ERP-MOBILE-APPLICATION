
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getReportsOverview,
  ReportsOverview,
} from '../../api/reports.api';

const PRIMARY = '#0c2466';
const BACKGROUND = '#F5F7FB';

// ================= STATISTICS CARD =================

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>
      {value.toLocaleString('en-IN')}
    </Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </View>
);

// ================= BAR GRAPH =================

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  maxValue,
  color,
}) => {
  const percentage =
    maxValue > 0
      ? Math.min((value / maxValue) * 100, 100)
      : 0;

  return (
    <View style={styles.barItem}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>
          {value.toLocaleString('en-IN')}
        </Text>
      </View>

      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

// ================= MAIN REPORTS SCREEN =================

const ReportsScreen: React.FC = () => {
  const [reports, setReports] = useState<ReportsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Fetch Reports Data
  const loadReports = useCallback(async () => {
    try {
      setError('');

      const data = await getReportsOverview();
      setReports(data);
    } catch (err: any) {
      console.error('Reports API Error:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to load reports. Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Pull to Refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  // Loading Screen
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error Screen
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Text style={styles.retryText}>
              {refreshing ? 'Loading...' : 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No Data Screen
  if (!reports) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No reports data available.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main UI
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY]}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.heading}>
            Reports & Analytics
          </Text>

          <Text style={styles.description}>
            View overall college system statistics and reports.
          </Text>
        </View>

        {/* OVERVIEW */}

        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.grid}>
          <StatCard
            title="Total Colleges"
            value={reports.colleges.total}
            subtitle={`${reports.colleges.active} Active`}
          />

          <StatCard
            title="Total Students"
            value={reports.students.total}
            subtitle={`${reports.students.active} Active`}
          />

          <StatCard
            title="Total Faculty"
            value={reports.faculty.total}
            subtitle={`${reports.faculty.active} Active`}
          />

          <StatCard
            title="Total Users"
            value={reports.users.total}
            subtitle={`${reports.users.active} Active`}
          />
        </View>

        {/* STUDENT STATISTICS */}

        <Text style={styles.sectionTitle}>
          Student Statistics
        </Text>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Active Students
            </Text>
            <Text style={styles.detailValue}>
              {reports.students.active.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Inactive Students
            </Text>
            <Text style={styles.detailValue}>
              {reports.students.inactive.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.lastRow]}>
            <Text style={styles.detailLabel}>
              Passed Out Students
            </Text>
            <Text style={styles.detailValue}>
              {reports.students.passedOut.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* STUDENT ANALYTICS GRAPH */}

        <Text style={styles.sectionTitle}>
          Student Analytics
        </Text>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            Student Status Overview
          </Text>

          <StatBar
            label="Active Students"
            value={reports.students.active}
            maxValue={reports.students.total}
            color="#16A34A"
          />

          <StatBar
            label="Inactive Students"
            value={reports.students.inactive}
            maxValue={reports.students.total}
            color="#F59E0B"
          />

          <StatBar
            label="Passed Out Students"
            value={reports.students.passedOut}
            maxValue={reports.students.total}
            color="#3B82F6"
          />
        </View>

        {/* FACULTY STATISTICS */}

        <Text style={styles.sectionTitle}>
          Faculty Statistics
        </Text>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Active Faculty
            </Text>
            <Text style={styles.detailValue}>
              {reports.faculty.active.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Inactive Faculty
            </Text>
            <Text style={styles.detailValue}>
              {reports.faculty.inactive.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.lastRow]}>
            <Text style={styles.detailLabel}>
              Faculty On Leave
            </Text>
            <Text style={styles.detailValue}>
              {reports.faculty.onLeave.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* FACULTY ANALYTICS GRAPH */}

        <Text style={styles.sectionTitle}>
          Faculty Analytics
        </Text>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            Faculty Status Overview
          </Text>

          <StatBar
            label="Active Faculty"
            value={reports.faculty.active}
            maxValue={reports.faculty.total}
            color="#16A34A"
          />

          <StatBar
            label="Inactive Faculty"
            value={reports.faculty.inactive}
            maxValue={reports.faculty.total}
            color="#F59E0B"
          />

          <StatBar
            label="Faculty On Leave"
            value={reports.faculty.onLeave}
            maxValue={reports.faculty.total}
            color="#EF4444"
          />
        </View>

        {/* USER STATISTICS */}

        <Text style={styles.sectionTitle}>
          User Statistics
        </Text>

        <View style={styles.detailCard}>
          <View style={[styles.detailRow, styles.lastRow]}>
            <Text style={styles.detailLabel}>
              Active Users
            </Text>
            <Text style={styles.detailValue}>
              {reports.users.active.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportsScreen;

// ================= STYLES =================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 35,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: '#555',
    fontSize: 14,
  },

  header: {
    marginBottom: 22,
  },

  heading: {
    fontSize: 23,
    fontWeight: '700',
    color: PRIMARY,
  },

  description: {
    fontSize: 13,
    color: '#777',
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 12,
    marginTop: 10,
  },

  // Overview Cards

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  cardValue: {
    fontSize: 26,
    fontWeight: '700',
    color: PRIMARY,
    marginTop: 10,
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#16834A',
    marginTop: 5,
  },

  // Detail Cards

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 15,
    elevation: 2,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  detailLabel: {
    fontSize: 14,
    color: '#555',
  },

  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },

  // Graph Cards

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
  },

  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 20,
  },

  barItem: {
    marginBottom: 18,
  },

  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  barLabel: {
    fontSize: 13,
    color: '#555',
  },

  barValue: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },

  barBackground: {
    height: 10,
    backgroundColor: '#E8ECF4',
    borderRadius: 10,
    overflow: 'hidden',
  },

  barFill: {
    height: 10,
    borderRadius: 10,
  },

  // Error

  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },

  emptyText: {
    color: '#555',
    fontSize: 15,
  },

  retryButton: {
    marginTop: 12,
    backgroundColor: PRIMARY,
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
