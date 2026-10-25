import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { PrincipalApi } from '../../api/principal.api';
import { useAuthStore } from '../../store/useAuthStore';

export const PrincipalDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const response = await PrincipalApi.getDashboardData();
      if (response && response.data) {
        setData(response.data);
      }
    } catch {
      // Baseline fallback for offline / disconnected states
      setData({
        institution_name: 'MIT Institute of Technology & Engineering',
        academic_year: '2026-2027',
        kpis: {
          total_students: 2450,
          total_faculty: 120,
          total_departments: 6,
          overall_attendance: 87.4,
          total_fee_collected: '₹1,24,50,000',
          pending_fee_amount: '₹32,10,000',
          fee_collection_rate: 79.5,
          placements_percentage: 94.2,
          pending_approvals_count: 5,
          open_complaints_count: 4,
        },
        department_performance: [
          { code: 'CSE', name: 'Computer Science', students_count: 520, faculty_count: 26, attendance_percentage: 91.2, pass_percentage: 95.4 },
          { code: 'ECE', name: 'Electronics & Comm.', students_count: 440, faculty_count: 22, attendance_percentage: 86.8, pass_percentage: 92.1 },
          { code: 'IT', name: 'Information Tech.', students_count: 460, faculty_count: 23, attendance_percentage: 89.5, pass_percentage: 94.0 },
          { code: 'MECH', name: 'Mechanical Eng.', students_count: 380, faculty_count: 20, attendance_percentage: 84.5, pass_percentage: 89.2 },
        ],
        financial_summary: {
          total_target: '₹1,56,60,000',
          total_collected: '₹1,24,50,000',
          pending_dues: '₹32,10,000',
          collection_percentage: 79.5,
        },
        placement_summary: {
          placement_rate: 94.2,
          eligible_students: 520,
          placed_students: 490,
          highest_package: '42.0 LPA',
          average_package: '8.5 LPA',
          top_recruiters: ['Google', 'Microsoft', 'Cisco', 'TCS', 'Infosys'],
        },
        pending_approvals: [
          { id: 'appr-001', type: 'LEAVE', applicant_name: 'Dr. Sarah Connor', title: 'Medical Leave (4 Days)', priority: 'HIGH' },
          { id: 'appr-002', type: 'GRIEVANCE', applicant_name: 'Rohan Sharma', title: 'Library Hours Extension', priority: 'MEDIUM' },
          { id: 'appr-003', type: 'CERTIFICATE', applicant_name: 'Priya Deshmukh', title: 'Recommendation Letter', priority: 'HIGH' },
        ],
        recent_announcements: [
          { id: 'n-001', title: 'All-Faculty Academic Review Meeting with Principal', date: '2026-10-28', priority: 'URGENT' },
          { id: 'n-002', title: 'NAAC Accreditation Peer Team Visit Preparation', date: '2026-10-24', priority: 'HIGH' },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const principalName = user ? `${user.first_name} ${user.last_name}` : 'Dr. Richard Feynman';

  return (
    <View style={styles.container}>
      <Header
        title={`Welcome, ${principalName}`}
        subtitle="Principal • MIT Institute of Technology"
        onRightPress={onRefresh}
        rightIconLabel="Refresh"
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading executive dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {/* Quick Action Navigation Grid */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('PrincipalDepartments')}
            >
              <Text style={styles.actionIcon}>🏢</Text>
              <Text style={styles.actionLabel}>Departments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('PrincipalApprovals')}
            >
              <View style={styles.badgeWrapper}>
                <Text style={styles.actionIcon}>📝</Text>
                {data?.kpis?.pending_approvals_count > 0 && (
                  <View style={styles.badgeCircle}>
                    <Text style={styles.badgeCircleText}>{data.kpis.pending_approvals_count}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionLabel}>Approvals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('PrincipalReports')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate('PrincipalBroadcastNotice')}
            >
              <Text style={styles.actionIcon}>📢</Text>
              <Text style={styles.actionLabel}>Broadcast</Text>
            </TouchableOpacity>
          </View>

          {/* Primary Institutional KPIs */}
          <View style={styles.statsRow}>
            <StatCard
              title="Total Students"
              value={`${data?.kpis?.total_students || 2450}`}
              subtitle="Enrolled 2026-27"
              color={Colors.primary}
            />
            <StatCard
              title="Total Faculty"
              value={`${data?.kpis?.total_faculty || 120}`}
              subtitle="6 Departments"
              color={Colors.secondary}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="College Attendance"
              value={`${data?.kpis?.overall_attendance || 87.4}%`}
              subtitle="Daily Average"
              color={Colors.accent}
            />
            <StatCard
              title="Placement Rate"
              value={`${data?.kpis?.placements_percentage || 94.2}%`}
              subtitle="Highest: 42 LPA"
              color={Colors.info}
            />
          </View>

          {/* Financial Snapshot */}
          <Text style={styles.sectionTitle}>COLLEGE FINANCIAL SNAPSHOT</Text>
          <Card>
            <View style={styles.finHeaderRow}>
              <View>
                <Text style={styles.finLabel}>Total Fee Collected</Text>
                <Text style={styles.finAmount}>{data?.kpis?.total_fee_collected || '₹1,24,50,000'}</Text>
              </View>
              <Badge label={`Recovery ${data?.kpis?.fee_collection_rate || 79.5}%`} type="success" />
            </View>
            <View style={styles.finProgressBarBg}>
              <View
                style={[
                  styles.finProgressBarFill,
                  { width: `${Math.min(data?.kpis?.fee_collection_rate || 79.5, 100)}%` },
                ]}
              />
            </View>
            <View style={styles.finSubRow}>
              <Text style={styles.finSubText}>Target: {data?.financial_summary?.total_target || '₹1,56,60,000'}</Text>
              <Text style={[styles.finSubText, { color: Colors.danger }]}>
                Pending: {data?.kpis?.pending_fee_amount || '₹32,10,000'}
              </Text>
            </View>
          </Card>

          {/* Pending Approvals Widget */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleWithoutMargin}>WORKFLOW APPROVALS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PrincipalApprovals')}>
              <Text style={styles.seeAllText}>View All ({data?.kpis?.pending_approvals_count || 0}) →</Text>
            </TouchableOpacity>
          </View>
          <Card>
            {data?.pending_approvals?.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={styles.approvalItemRow}
                onPress={() => navigation.navigate('PrincipalApprovals')}
              >
                <View style={styles.approvalItemLeft}>
                  <Text style={styles.approvalItemTitle}>{item.title}</Text>
                  <Text style={styles.approvalItemSub}>{item.applicant_name}</Text>
                </View>
                <Badge label={item.type} type={item.type === 'LEAVE' ? 'warning' : 'info'} />
              </TouchableOpacity>
            ))}
          </Card>

          {/* Academic Department Performance */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleWithoutMargin}>DEPARTMENT PERFORMANCE</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PrincipalDepartments')}>
              <Text style={styles.seeAllText}>All Departments →</Text>
            </TouchableOpacity>
          </View>
          <Card>
            {data?.department_performance?.slice(0, 4).map((dept: any, index: number) => (
              <View
                key={dept.code}
                style={[styles.deptRow, index < 3 && styles.deptRowBorder]}
              >
                <View style={styles.deptLeft}>
                  <Text style={styles.deptCodeText}>{dept.code}</Text>
                  <Text style={styles.deptNameText}>{dept.name}</Text>
                </View>
                <View style={styles.deptRight}>
                  <Text style={styles.deptMetricValue}>{dept.attendance_percentage}% Attd.</Text>
                  <Text style={styles.deptSubMetric}>{dept.pass_percentage}% Pass</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Placement Highlights */}
          <Text style={styles.sectionTitle}>CAMPUS PLACEMENT HIGHLIGHTS</Text>
          <Card>
            <View style={styles.placementStats}>
              <View style={styles.placementBox}>
                <Text style={styles.placementVal}>{data?.placement_summary?.placed_students || 490}</Text>
                <Text style={styles.placementLabel}>Students Placed</Text>
              </View>
              <View style={styles.placementDivider} />
              <View style={styles.placementBox}>
                <Text style={styles.placementVal}>{data?.placement_summary?.average_package || '8.5 LPA'}</Text>
                <Text style={styles.placementLabel}>Avg. CTC</Text>
              </View>
              <View style={styles.placementDivider} />
              <View style={styles.placementBox}>
                <Text style={[styles.placementVal, { color: Colors.accent }]}>
                  {data?.placement_summary?.highest_package || '42.0 LPA'}
                </Text>
                <Text style={styles.placementLabel}>Highest CTC</Text>
              </View>
            </View>
            <Text style={styles.topRecruiters}>
              Top Partners: {data?.placement_summary?.top_recruiters?.join(', ')}
            </Text>
          </Card>

          {/* Institutional Announcements */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleWithoutMargin}>OFFICIAL CIRCULARS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PrincipalBroadcastNotice')}>
              <Text style={styles.seeAllText}>+ Post Notice</Text>
            </TouchableOpacity>
          </View>
          <Card>
            {data?.recent_announcements?.map((notice: any) => (
              <View key={notice.id} style={styles.noticeItem}>
                <View style={styles.noticeHeader}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Badge label={notice.priority} type={notice.priority === 'URGENT' ? 'danger' : 'warning'} />
                </View>
                <Text style={styles.noticeDate}>Published: {notice.date}</Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 35,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  actionTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeWrapper: {
    position: 'relative',
  },
  badgeCircle: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.danger,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCircleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
  },
  sectionTitleWithoutMargin: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  finHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  finLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  finAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  finProgressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  finProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  finSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  finSubText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  approvalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  approvalItemLeft: {
    flex: 1,
    marginRight: 8,
  },
  approvalItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  approvalItemSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  deptRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  deptLeft: {
    flex: 1,
  },
  deptCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  deptNameText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deptRight: {
    alignItems: 'flex-end',
  },
  deptMetricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  deptSubMetric: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  placementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  placementBox: {
    alignItems: 'center',
    flex: 1,
  },
  placementVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  placementLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  placementDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  topRecruiters: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    textAlign: 'center',
  },
  noticeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  noticeDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
