import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  TextInput,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { HodApi } from '../../api/hod.api';

interface FacultyWorkload {
  faculty_id: string;
  name: string;
  designation: string;
  qualification: string;
  employee_id: string;
  email: string;
  mobile: string;
  weekly_hours: number;
  theory_hours: number;
  lab_hours: number;
  subjects_count: number;
  subjects: { code: string; name: string; type: string }[];
  workload_percentage: number;
  status: 'OPTIMAL' | 'FULL' | 'LIGHT';
}

export const HodFacultyWorkloadScreen: React.FC = () => {
  const [workloads, setWorkloads] = useState<FacultyWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchWorkloads = async () => {
    try {
      const response = await HodApi.getFacultyWorkload();
      if (response && response.data) {
        setWorkloads(response.data);
      }
    } catch {
      // Fallback baseline for demo / disconnected state
      setWorkloads([
        {
          faculty_id: 'fac-001',
          name: 'Prof. Alan Turing',
          designation: 'Head of Department & Professor',
          qualification: 'Ph.D. Computer Science',
          employee_id: 'EMP-CSE-001',
          email: 'hod.cse@mit-eng.edu',
          mobile: '+919900000005',
          weekly_hours: 14,
          theory_hours: 10,
          lab_hours: 4,
          subjects_count: 2,
          subjects: [
            { code: 'CS505', name: 'Operating Systems & Kernel Design', type: 'THEORY' },
            { code: 'CS507', name: 'AI & Machine Learning Lab', type: 'PRACTICAL' },
          ],
          workload_percentage: 78,
          status: 'OPTIMAL',
        },
        {
          faculty_id: 'fac-004',
          name: 'Dr. Grace Hopper',
          designation: 'Associate Professor',
          qualification: 'Ph.D. in Computer Systems',
          employee_id: 'EMP-CSE-004',
          email: 'grace.hopper@mit-eng.edu',
          mobile: '+919900000015',
          weekly_hours: 16,
          theory_hours: 12,
          lab_hours: 4,
          subjects_count: 2,
          subjects: [
            { code: 'CS501', name: 'Database Management Systems', type: 'THEORY' },
            { code: 'CS503', name: 'DBMS & Full-Stack Laboratory', type: 'PRACTICAL' },
          ],
          workload_percentage: 89,
          status: 'OPTIMAL',
        },
        {
          faculty_id: 'fac-002',
          name: 'Prof. John Smith',
          designation: 'Associate Professor',
          qualification: 'M.Tech, Ph.D.',
          employee_id: 'EMP-CSE-002',
          email: 'john.smith@mit-eng.edu',
          mobile: '+919900000002',
          weekly_hours: 14,
          theory_hours: 14,
          lab_hours: 0,
          subjects_count: 1,
          subjects: [
            { code: 'CS502', name: 'Web Application Engineering', type: 'THEORY' },
          ],
          workload_percentage: 78,
          status: 'OPTIMAL',
        },
        {
          faculty_id: 'fac-003',
          name: 'Prof. Sarah Connor',
          designation: 'Assistant Professor',
          qualification: 'M.Tech CSE',
          employee_id: 'EMP-CSE-003',
          email: 'sarah.connor@mit-eng.edu',
          mobile: '+919900000003',
          weekly_hours: 18,
          theory_hours: 18,
          lab_hours: 0,
          subjects_count: 2,
          subjects: [
            { code: 'CS504', name: 'Computer Networks & Protocols', type: 'THEORY' },
            { code: 'CS506', name: 'Software Engineering & DevOps', type: 'THEORY' },
          ],
          workload_percentage: 100,
          status: 'FULL',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkloads();
  };

  const filtered = workloads.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.designation.toLowerCase().includes(search.toLowerCase()) ||
      w.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  const totalWeeklyHours = workloads.reduce((sum, w) => sum + w.weekly_hours, 0);
  const avgHours = workloads.length > 0 ? (totalWeeklyHours / workloads.length).toFixed(1) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULL':
        return <Badge label="Full Load (18h+)" type="warning" />;
      case 'OPTIMAL':
        return <Badge label="Optimal Load" type="success" />;
      default:
        return <Badge label="Light Load" type="info" />;
    }
  };

  const getProgressBarColor = (pct: number) => {
    if (pct >= 95) return Colors.warning;
    if (pct >= 65) return Colors.success;
    return Colors.info;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Faculty & Workload"
        subtitle="Department of Computer Science & Engineering"
        onRightPress={onRefresh}
        rightIconLabel="Refresh"
      />

      {/* Workload Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{workloads.length}</Text>
          <Text style={styles.summaryLabel}>Faculty Staff</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalWeeklyHours} hrs</Text>
          <Text style={styles.summaryLabel}>Total Weekly</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{avgHours} hrs</Text>
          <Text style={styles.summaryLabel}>Avg Per Staff</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by faculty name, designation, or ID..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading faculty workload data...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {filtered.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No faculty members found matching your search.</Text>
            </Card>
          ) : (
            filtered.map((faculty) => (
              <Card key={faculty.faculty_id} style={styles.facultyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {faculty.name
                        .replace('Prof.', '')
                        .replace('Dr.', '')
                        .trim()
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.facultyHeaderInfo}>
                    <Text style={styles.facultyName}>{faculty.name}</Text>
                    <Text style={styles.designationText}>{faculty.designation}</Text>
                    <Text style={styles.qualificationText}>
                      {faculty.qualification} • {faculty.employee_id}
                    </Text>
                  </View>
                  <View style={styles.badgeWrapper}>{getStatusBadge(faculty.status)}</View>
                </View>

                {/* Workload Progress Bar */}
                <View style={styles.workloadSection}>
                  <View style={styles.workloadMetaRow}>
                    <Text style={styles.workloadMetaTitle}>Weekly Teaching Hours</Text>
                    <Text style={styles.workloadMetaValue}>
                      <Text style={{ fontWeight: '800', color: Colors.text }}>{faculty.weekly_hours} hrs</Text> / 18 hrs
                      norm
                    </Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(100, faculty.workload_percentage)}%`,
                          backgroundColor: getProgressBarColor(faculty.workload_percentage),
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.splitHoursRow}>
                    <Text style={styles.splitHoursText}>📖 Theory: {faculty.theory_hours} hrs</Text>
                    <Text style={styles.splitHoursText}>🔬 Lab / Practical: {faculty.lab_hours} hrs</Text>
                  </View>
                </View>

                {/* Assigned Subjects */}
                <View style={styles.subjectsContainer}>
                  <Text style={styles.subjectsSectionTitle}>Allocated Subjects ({faculty.subjects.length}):</Text>
                  <View style={styles.chipsRow}>
                    {faculty.subjects.map((sub, sIdx) => (
                      <View key={sIdx} style={styles.subjectChip}>
                        <Text style={styles.subjectChipCode}>{sub.code}</Text>
                        <Text style={styles.subjectChipName} numberOfLines={1}>
                          {sub.name}
                        </Text>
                        <Text style={styles.subjectChipType}>{sub.type === 'PRACTICAL' ? 'LAB' : 'TH'}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Contact Actions */}
                <View style={styles.contactActionsRow}>
                  {faculty.email ? (
                    <TouchableOpacity
                      style={styles.contactBtn}
                      onPress={() => Linking.openURL(`mailto:${faculty.email}`)}
                    >
                      <Text style={styles.contactBtnText}>✉️ {faculty.email}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {faculty.mobile ? (
                    <TouchableOpacity
                      style={styles.contactBtn}
                      onPress={() => Linking.openURL(`tel:${faculty.mobile}`)}
                    >
                      <Text style={styles.contactBtnText}>📞 Call</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  summaryDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  searchContainer: { marginHorizontal: 16, marginTop: 14 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, padding: 20 },
  facultyCard: { marginBottom: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  facultyHeaderInfo: { flex: 1, marginLeft: 12 },
  facultyName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  designationText: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 1 },
  qualificationText: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  badgeWrapper: { alignSelf: 'flex-start' },
  workloadSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  workloadMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workloadMetaTitle: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  workloadMetaValue: { fontSize: 12, color: Colors.textSecondary },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  splitHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  splitHoursText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  subjectsContainer: { marginTop: 12 },
  subjectsSectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  subjectChipCode: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginRight: 4 },
  subjectChipName: { fontSize: 11, color: Colors.text, maxWidth: 160 },
  subjectChipType: {
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#E0E7FF',
    color: Colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  contactActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  contactBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
});
