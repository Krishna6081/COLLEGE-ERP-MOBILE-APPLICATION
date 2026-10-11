import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { SuperAdminApi } from '../../api/superadmin.api';

type ReportTab = 'SUMMARY' | 'ADMISSIONS' | 'FEES' | 'ATTENDANCE' | 'PERFORMANCE';

export const ReportsScreen: React.FC = () => {
  const [tab, setTab] = useState<ReportTab>('SUMMARY');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const loadReport = async (selected: ReportTab) => {
    setLoading(true);
    try {
      let res;
      if (selected === 'SUMMARY') res = await SuperAdminApi.getSummaryReport();
      else if (selected === 'ADMISSIONS') res = await SuperAdminApi.getAdmissionReport();
      else if (selected === 'FEES') res = await SuperAdminApi.getFeeReport();
      else if (selected === 'ATTENDANCE') res = await SuperAdminApi.getAttendanceReport();
      else if (selected === 'PERFORMANCE') res = await SuperAdminApi.getPerformanceReport();

      if (res?.success && res.data) {
        setData(res.data);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(tab);
  }, [tab]);

  const tabs: Array<{ key: ReportTab; label: string }> = [
    { key: 'SUMMARY', label: 'Summary' },
    { key: 'ADMISSIONS', label: 'Admissions' },
    { key: 'FEES', label: 'Finances' },
    { key: 'ATTENDANCE', label: 'Attendance' },
    { key: 'PERFORMANCE', label: 'Academics' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Executive Reports" subtitle="System-Wide Multi-Institution Analytics" />

      {/* Tabs */}
      <View style={styles.tabScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : !data ? (
          <Text style={styles.emptyTxt}>No report data available.</Text>
        ) : (
          <View>
            {/* 1. SUMMARY TAB */}
            {tab === 'SUMMARY' && (
              <View>
                <View style={styles.statsRow}>
                  <StatCard title="Active Colleges" value={data.kpis?.totalColleges?.toString() || '3'} color={Colors.primary} />
                  <StatCard title="Total Students" value={data.kpis?.totalStudents?.toLocaleString() || '4,370'} color={Colors.secondary} />
                </View>
                <View style={styles.statsRow}>
                  <StatCard title="Fee Collection" value={data.kpis?.totalFeeCollected || '₹14.85 Cr'} color={Colors.accent} />
                  <StatCard title="Avg Attendance" value={data.kpis?.avgAttendanceRate || '86.4%'} color="#D97706" />
                </View>

                <Text style={styles.sectionTitle}>COLLEGE PERFORMANCE SUMMARY</Text>
                {data.collegeBreakdown?.map((c: any, i: number) => (
                  <Card key={i} style={styles.reportCard}>
                    <Text style={styles.colName}>{c.name}</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Students Enrolled:</Text>
                      <Text style={styles.infoVal}>{c.students}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Faculty Count:</Text>
                      <Text style={styles.infoVal}>{c.faculty}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Fee Collected:</Text>
                      <Text style={styles.infoVal}>{c.feeCollection}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Compliance Score:</Text>
                      <Badge text={c.compliance} variant="success" />
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* 2. ADMISSIONS TAB */}
            {tab === 'ADMISSIONS' && (
              <View>
                <Card style={{ padding: 16, marginBottom: 14 }}>
                  <Text style={styles.cardHeaderTitle}>Total Admissions YTD</Text>
                  <Text style={styles.bigStat}>{data.totalAdmissionsYTD || 2450}</Text>
                </Card>

                <Text style={styles.sectionTitle}>QUOTA DISTRIBUTION</Text>
                {data.quotaBreakdown?.map((q: any, i: number) => (
                  <Card key={i} style={{ padding: 14, marginBottom: 8 }}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{q.quota}</Text>
                      <Text style={styles.infoVal}>{q.count} ({q.percentage}%)</Text>
                    </View>
                  </Card>
                ))}

                <Text style={styles.sectionTitle}>DEPARTMENT SEAT OCCUPANCY</Text>
                {data.departmentWise?.map((d: any, i: number) => (
                  <Card key={i} style={{ padding: 14, marginBottom: 8 }}>
                    <Text style={styles.colName}>{d.department}</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Seats Filled:</Text>
                      <Text style={styles.infoVal}>{d.filled} / {d.intake}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Occupancy Rate:</Text>
                      <Badge text={d.occupancy} variant="info" />
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* 3. FEES TAB */}
            {tab === 'FEES' && (
              <View>
                <View style={styles.statsRow}>
                  <StatCard title="Total Payable" value={data.totalPayable} color={Colors.primary} />
                  <StatCard title="Collected YTD" value={data.totalCollected} color={Colors.accent} />
                </View>
                <Card style={{ padding: 16, marginHorizontal: 0, marginVertical: 10 }}>
                  <Text style={styles.infoLabel}>Total Pending Dues Across Colleges</Text>
                  <Text style={[styles.bigStat, { color: Colors.danger }]}>{data.pendingDues}</Text>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                    Collection Efficiency Rate: <Text style={{ fontWeight: '800', color: Colors.accent }}>{data.collectionRatio}</Text>
                  </Text>
                </Card>

                <Text style={styles.sectionTitle}>COLLECTION MODES</Text>
                {data.paymentModeStats?.map((m: any, i: number) => (
                  <Card key={i} style={{ padding: 14, marginBottom: 8 }}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{m.mode}</Text>
                      <Text style={styles.infoVal}>{m.amount} ({m.percentage})</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* 4. ATTENDANCE TAB */}
            {tab === 'ATTENDANCE' && (
              <View>
                <Card style={{ padding: 16, marginBottom: 14 }}>
                  <Text style={styles.cardHeaderTitle}>System-Wide Average Attendance</Text>
                  <Text style={[styles.bigStat, { color: Colors.accent }]}>{data.averageAttendance}</Text>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                    Short Attendance Warning (&lt;75%): <Text style={{ color: Colors.danger, fontWeight: '800' }}>{data.shortAttendanceStudents} Students</Text>
                  </Text>
                </Card>

                <Text style={styles.sectionTitle}>DEPARTMENT AVERAGE ATTENDANCE</Text>
                {data.departmentAverages?.map((d: any, i: number) => (
                  <Card key={i} style={{ padding: 14, marginBottom: 8 }}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{d.dept}</Text>
                      <Badge text={d.rate} variant="info" />
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* 5. PERFORMANCE TAB */}
            {tab === 'PERFORMANCE' && (
              <View>
                <View style={styles.statsRow}>
                  <StatCard title="Overall Pass" value={data.overallPassPercentage} color={Colors.accent} />
                  <StatCard title="Average CGPA" value={data.averageCgpa} color={Colors.primary} />
                </View>

                <Text style={styles.sectionTitle}>TOP RANKERS</Text>
                {data.toppers?.map((top: any, i: number) => (
                  <Card key={i} style={{ padding: 14, marginBottom: 8 }}>
                    <View style={styles.infoRow}>
                      <View>
                        <Text style={styles.colName}>#{top.rank} {top.name}</Text>
                        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Branch: {top.branch}</Text>
                      </View>
                      <Badge text={`CGPA ${top.cgpa}`} variant="success" />
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabScrollWrap: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  tabTextActive: { color: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 30 },
  statsRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, marginTop: 14, marginBottom: 8, letterSpacing: 0.8 },
  reportCard: { padding: 16, marginBottom: 10 },
  colName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 3 },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  infoVal: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700' },
  bigStat: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, marginTop: 4 },
  cardHeaderTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  emptyTxt: { textAlign: 'center', marginTop: 40, color: Colors.textSecondary },
});
