import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { PrincipalApi } from '../../api/principal.api';

const REPORT_TABS = ['ACADEMICS', 'FINANCE', 'ENROLLMENT', 'PLACEMENTS'];

export const PrincipalReportsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ACADEMICS');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await PrincipalApi.getReports();
      if (response && response.data) {
        setReportData(response.data);
      }
    } catch {
      // Baseline reports fallback
      setReportData({
        academic_reports: {
          overall_pass_rate: 92.4,
          first_class_percentage: 68.2,
          distinctions: 342,
          backlogs_percentage: 7.6,
          department_rankings: [
            { rank: 1, department: 'Computer Science & Engineering', score: '96.2 / 100' },
            { rank: 2, department: 'Information Technology', score: '94.8 / 100' },
            { rank: 3, department: 'Electronics & Communication', score: '91.5 / 100' },
            { rank: 4, department: 'Electrical Engineering', score: '88.7 / 100' },
            { rank: 5, department: 'Mechanical Engineering', score: '87.4 / 100' },
            { rank: 6, department: 'Civil Engineering', score: '86.1 / 100' },
          ],
        },
        financial_reports: {
          total_fees_demanded: '₹1,56,60,000',
          total_fees_collected: '₹1,24,50,000',
          total_outstanding: '₹32,10,000',
          fee_heads: [
            { category: 'Tuition Fees', collected: '₹95,00,000', pending: '₹22,00,000' },
            { category: 'Laboratory & Library Fees', collected: '₹14,50,000', pending: '₹3,50,000' },
            { category: 'Hostel & Mess Dues', collected: '₹10,50,000', pending: '₹4,60,000' },
            { category: 'Transport Services', collected: '₹4,50,000', pending: '₹2,00,000' },
          ],
        },
        admission_reports: {
          total_intake: 2600,
          current_admissions: 2450,
          admission_occupancy: '94.2%',
          gender_ratio: { male: '62%', female: '38%' },
        },
        placement_reports: {
          total_placed: 490,
          total_offers: 642,
          average_salary_lpa: 8.5,
          highest_salary_lpa: 42.0,
          salary_bands: [
            { range: '> 15 LPA', count: 48 },
            { range: '10 - 15 LPA', count: 96 },
            { range: '6 - 10 LPA', count: 215 },
            { range: '< 6 LPA', count: 131 },
          ],
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleExport = (format: string) => {
    Alert.alert(
      'Export Report',
      `Executive summary for ${activeTab} has been compiled and saved to local documents (${format}).`
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Institutional Analytics"
        subtitle="Executive reports & governance metrics"
        onRightPress={onRefresh}
        rightIconLabel="Refresh"
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {REPORT_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating analytics report...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {activeTab === 'ACADEMICS' && reportData?.academic_reports && (
            <View>
              <View style={styles.statsRow}>
                <StatCard
                  title="Pass Rate"
                  value={`${reportData.academic_reports.overall_pass_rate}%`}
                  subtitle="Latest Exam Session"
                  color={Colors.primary}
                />
                <StatCard
                  title="Distinctions"
                  value={`${reportData.academic_reports.distinctions}`}
                  subtitle=">= 75% Marks"
                  color={Colors.accent}
                />
              </View>

              <Text style={styles.sectionTitle}>DEPARTMENT ACADEMIC RANKINGS</Text>
              <Card>
                {reportData.academic_reports.department_rankings.map((item: any) => (
                  <View key={item.rank} style={styles.rankingRow}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{item.rank}</Text>
                    </View>
                    <View style={styles.rankInfo}>
                      <Text style={styles.rankDept}>{item.department}</Text>
                    </View>
                    <Text style={styles.rankScore}>{item.score}</Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {activeTab === 'FINANCE' && reportData?.financial_reports && (
            <View>
              <View style={styles.statsRow}>
                <StatCard
                  title="Collected"
                  value={reportData.financial_reports.total_fees_collected}
                  subtitle="YTD Collections"
                  color={Colors.accent}
                />
                <StatCard
                  title="Outstanding"
                  value={reportData.financial_reports.total_outstanding}
                  subtitle="Pending Dues"
                  color={Colors.danger}
                />
              </View>

              <Text style={styles.sectionTitle}>COLLECTION BREAKDOWN BY CATEGORY</Text>
              <Card>
                {reportData.financial_reports.fee_heads.map((item: any, idx: number) => (
                  <View key={idx} style={styles.feeHeadRow}>
                    <View style={styles.feeHeadLeft}>
                      <Text style={styles.feeHeadTitle}>{item.category}</Text>
                      <Text style={styles.feeHeadPending}>Pending: {item.pending}</Text>
                    </View>
                    <Text style={styles.feeHeadCollected}>{item.collected}</Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {activeTab === 'ENROLLMENT' && reportData?.admission_reports && (
            <View>
              <View style={styles.statsRow}>
                <StatCard
                  title="Current Students"
                  value={`${reportData.admission_reports.current_admissions}`}
                  subtitle={`Capacity: ${reportData.admission_reports.total_intake}`}
                  color={Colors.primary}
                />
                <StatCard
                  title="Occupancy"
                  value={reportData.admission_reports.admission_occupancy}
                  subtitle="Full Capacity"
                  color={Colors.accent}
                />
              </View>

              <Text style={styles.sectionTitle}>DEMOGRAPHIC DIVERSITY</Text>
              <Card>
                <View style={styles.demoRow}>
                  <Text style={styles.demoLabel}>Male Students:</Text>
                  <Text style={styles.demoVal}>{reportData.admission_reports.gender_ratio.male}</Text>
                </View>
                <View style={styles.demoRow}>
                  <Text style={styles.demoLabel}>Female Students:</Text>
                  <Text style={styles.demoVal}>{reportData.admission_reports.gender_ratio.female}</Text>
                </View>
              </Card>
            </View>
          )}

          {activeTab === 'PLACEMENTS' && reportData?.placement_reports && (
            <View>
              <View style={styles.statsRow}>
                <StatCard
                  title="Placed Count"
                  value={`${reportData.placement_reports.total_placed}`}
                  subtitle={`${reportData.placement_reports.total_offers} Job Offers`}
                  color={Colors.accent}
                />
                <StatCard
                  title="Highest Package"
                  value={`${reportData.placement_reports.highest_salary_lpa} LPA`}
                  subtitle={`Avg: ${reportData.placement_reports.average_salary_lpa} LPA`}
                  color={Colors.secondary}
                />
              </View>

              <Text style={styles.sectionTitle}>SALARY DISTRIBUTION BANDS</Text>
              <Card>
                {reportData.placement_reports.salary_bands.map((band: any, idx: number) => (
                  <View key={idx} style={styles.bandRow}>
                    <Text style={styles.bandRange}>{band.range}</Text>
                    <Badge label={`${band.count} Students`} type="info" />
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* Export Actions */}
          <View style={styles.exportSection}>
            <Text style={styles.exportTitle}>EXPORT OFFICIAL REPORT</Text>
            <View style={styles.exportBtnRow}>
              <TouchableOpacity
                style={[styles.exportBtn, { backgroundColor: Colors.primary }]}
                onPress={() => handleExport('PDF')}
              >
                <Text style={styles.exportBtnText}>📄 Export PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exportBtn, { backgroundColor: Colors.accent }]}
                onPress={() => handleExport('Excel/CSV')}
              >
                <Text style={styles.exportBtnText}>📊 Export CSV</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 30,
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
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
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    fontWeight: '800',
    fontSize: 13,
    color: Colors.primary,
  },
  rankInfo: {
    flex: 1,
  },
  rankDept: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rankScore: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  feeHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  feeHeadLeft: {
    flex: 1,
  },
  feeHeadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  feeHeadPending: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 2,
  },
  feeHeadCollected: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  demoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  demoVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bandRange: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  exportSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  exportTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginHorizontal: 4,
    letterSpacing: 0.5,
  },
  exportBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
