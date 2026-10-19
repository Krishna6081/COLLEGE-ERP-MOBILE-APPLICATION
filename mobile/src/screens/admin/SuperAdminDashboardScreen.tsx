import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Colors } from '../../constants/colors';
import { SuperAdminApi } from '../../api/superadmin.api';

interface Props {
  navigation: any;
}

export const SuperAdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState<any>(null);

  const loadData = async () => {
    setErrorMessage('');
    try {
      const res = await SuperAdminApi.getSummaryReport();
      if (!res.success || !res.data) {
        setSummary(null);
        setErrorMessage(res.message || 'Live system reports are unavailable.');
        return;
      }
      setSummary(res.data);
    } catch (error: any) {
      setSummary(null);
      setErrorMessage(error?.message || 'Could not load system reports. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const retryLoad = () => {
    setLoading(true);
    void loadData();
  };

  const modules = [
    { title: 'Colleges', icon: '🏛️', desc: 'Add & manage campus colleges', screen: 'CollegesManagement' },
    { title: 'Administrators', icon: '🛡️', desc: 'Assign & manage college admins', screen: 'Administrators' },
    { title: 'Roles', icon: '🔑', desc: 'Custom roles & authority setup', screen: 'RolesPermissions' },
    { title: 'Permissions', icon: '📜', desc: 'Module permission matrix', screen: 'RolesPermissions' },
    { title: 'System Settings', icon: '⚙️', desc: 'Global ERP configuration', screen: 'SystemSettings' },
    { title: 'All Reports', icon: '📊', desc: 'Admissions, fees & academics', screen: 'SuperAdminReports' },
    { title: 'Audit Logs', icon: '🕵️', desc: 'Trace system actions & logins', screen: 'AuditLogs' },
    { title: 'Academic Config', icon: '🎓', desc: 'Years, semesters, departments', screen: 'AcademicConfig' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Super Admin Portal" subtitle="System-Wide Authority & Operations" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator style={styles.reportState} color={Colors.primary} size="large" />
        ) : summary ? (
          <>
            <View style={styles.statsRow}>
              <StatCard
                title="Institutions"
                value={summary.kpis?.totalColleges?.toString() ?? '—'}
                subtitle="Active Colleges"
                color={Colors.primary}
              />
              <StatCard
                title="Students"
                value={summary.kpis?.totalStudents?.toLocaleString() ?? '—'}
                subtitle="System Total"
                color={Colors.secondary}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Faculty Members"
                value={summary.kpis?.totalFaculty?.toString() ?? '—'}
                subtitle="Teaching Staff"
                color={Colors.accent}
              />
              <StatCard
                title="Total Fees"
                value={summary.kpis?.totalFeeCollected != null ? String(summary.kpis.totalFeeCollected) : '—'}
                subtitle="Reported total"
                color="#D97706"
              />
            </View>
          </>
        ) : (
          <Card style={styles.reportErrorCard}>
            <Text style={styles.reportErrorTitle}>System reports unavailable</Text>
            <Text style={styles.reportErrorMessage}>{errorMessage || 'Try again when the report service is available.'}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={retryLoad} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* 8 Responsibilities Grid */}
        <Text style={styles.sectionHeader}>SUPER ADMINISTRATOR RESPONSIBILITIES</Text>
        <View style={styles.grid}>
          {modules.map((m, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridCard}
              onPress={() => navigation.navigate(m.screen)}
              activeOpacity={0.8}
            >
              <Text style={styles.gridIcon}>{m.icon}</Text>
              <Text style={styles.gridTitle}>{m.title}</Text>
              <Text style={styles.gridDesc}>{m.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 30 },
  reportState: { marginTop: 32, marginBottom: 24 },
  reportErrorCard: { marginHorizontal: 16, marginTop: 16 },
  reportErrorTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  reportErrorMessage: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 6 },
  retryButton: { alignSelf: 'flex-start', backgroundColor: Colors.primary, borderRadius: 8, marginTop: 14, paddingHorizontal: 16, paddingVertical: 9 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  gridCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: '1.5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridIcon: { fontSize: 28, marginBottom: 8 },
  gridTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  gridDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 16 },
});
