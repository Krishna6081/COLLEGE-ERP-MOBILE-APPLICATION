import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
  const [summary, setSummary] = useState<any>({
    kpis: {
      totalColleges: 3,
      totalStudents: 4370,
      totalFaculty: 250,
      totalFeeCollected: '₹ 14.85 Cr',
    },
  });

  const loadData = async () => {
    try {
      const res = await SuperAdminApi.getSummaryReport();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
        {/* KPI Counter Cards */}
        <View style={styles.statsRow}>
          <StatCard
            title="Institutions"
            value={summary.kpis?.totalColleges?.toString() || '3'}
            subtitle="Active Colleges"
            color={Colors.primary}
          />
          <StatCard
            title="Students"
            value={summary.kpis?.totalStudents?.toLocaleString() || '4,370'}
            subtitle="System Total"
            color={Colors.secondary}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Faculty Members"
            value={summary.kpis?.totalFaculty?.toString() || '250'}
            subtitle="Teaching Staff"
            color={Colors.accent}
          />
          <StatCard
            title="Total Fees"
            value={summary.kpis?.totalFeeCollected || '₹ 14.85 Cr'}
            subtitle="YTD Collection"
            color="#D97706"
          />
        </View>

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

        {/* System Overview Card */}
        <Text style={styles.sectionHeader}>SYSTEM STATUS</Text>
        <Card style={{ marginHorizontal: 16 }}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>• Architecture:</Text>
            <Text style={styles.statusValue}>Node.js + MySQL + RBAC</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>• Role Hierarchy:</Text>
            <Text style={styles.statusValue}>13 Roles Configured</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>• Audit Trail:</Text>
            <Text style={styles.statusValue}>Enabled & Encrypted</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 30 },
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
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  statusLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  statusValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700' },
});
