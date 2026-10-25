import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { PrincipalApi } from '../../api/principal.api';

interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  hod_name: string;
  hod_email: string;
  students_count: number;
  faculty_count: number;
  attendance_percentage: number;
  pass_percentage: number;
  placement_percentage: number;
  student_faculty_ratio: string;
}

export const PrincipalDepartmentsScreen: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDepartments = async () => {
    try {
      const response = await PrincipalApi.getDepartments();
      if (response && response.data) {
        setDepartments(response.data);
      }
    } catch {
      // Offline fallback data
      setDepartments([
        {
          id: 'dept-001',
          code: 'CSE',
          name: 'Computer Science & Engineering',
          hod_name: 'Prof. Alan Turing',
          hod_email: 'hod.cse@mit-eng.edu',
          students_count: 520,
          faculty_count: 26,
          attendance_percentage: 91.2,
          pass_percentage: 95.4,
          placement_percentage: 97.8,
          student_faculty_ratio: '20:1',
        },
        {
          id: 'dept-002',
          code: 'ECE',
          name: 'Electronics & Communication',
          hod_name: 'Dr. Katherine Johnson',
          hod_email: 'hod.ece@mit-eng.edu',
          students_count: 440,
          faculty_count: 22,
          attendance_percentage: 86.8,
          pass_percentage: 92.1,
          placement_percentage: 93.5,
          student_faculty_ratio: '20:1',
        },
        {
          id: 'dept-003',
          code: 'MECH',
          name: 'Mechanical Engineering',
          hod_name: 'Dr. Nikola Tesla',
          hod_email: 'hod.mech@mit-eng.edu',
          students_count: 380,
          faculty_count: 20,
          attendance_percentage: 84.5,
          pass_percentage: 89.2,
          placement_percentage: 88.0,
          student_faculty_ratio: '19:1',
        },
        {
          id: 'dept-004',
          code: 'CIVIL',
          name: 'Civil Engineering',
          hod_name: 'Dr. Arthur Casagrande',
          hod_email: 'hod.civil@mit-eng.edu',
          students_count: 320,
          faculty_count: 18,
          attendance_percentage: 85.0,
          pass_percentage: 88.6,
          placement_percentage: 86.4,
          student_faculty_ratio: '18:1',
        },
        {
          id: 'dept-005',
          code: 'IT',
          name: 'Information Technology',
          hod_name: 'Dr. Grace Hopper',
          hod_email: 'hod.it@mit-eng.edu',
          students_count: 460,
          faculty_count: 23,
          attendance_percentage: 89.5,
          pass_percentage: 94.0,
          placement_percentage: 96.2,
          student_faculty_ratio: '20:1',
        },
        {
          id: 'dept-006',
          code: 'EE',
          name: 'Electrical Engineering',
          hod_name: 'Dr. Michael Faraday',
          hod_email: 'hod.ee@mit-eng.edu',
          students_count: 330,
          faculty_count: 17,
          attendance_percentage: 86.2,
          pass_percentage: 90.3,
          placement_percentage: 89.1,
          student_faculty_ratio: '19:1',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDepartments();
  };

  const filteredDepts = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.hod_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header
        title="Department Oversight"
        subtitle="Academic performance & faculty staffing"
        onRightPress={onRefresh}
        rightIconLabel="Refresh"
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by department or HOD..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading departments data...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          <View style={styles.summaryBar}>
            <Text style={styles.summaryText}>
              Showing <Text style={styles.summaryBold}>{filteredDepts.length}</Text> active academic departments
            </Text>
          </View>

          {filteredDepts.map((item) => (
            <Card key={item.id} style={styles.deptCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleArea}>
                  <Text style={styles.deptName}>{item.name}</Text>
                  <Text style={styles.hodName}>HOD: {item.hod_name}</Text>
                </View>
                <Badge label={item.code} type="primary" />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Students</Text>
                  <Text style={styles.statValue}>{item.students_count}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Faculty</Text>
                  <Text style={styles.statValue}>{item.faculty_count}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>S:F Ratio</Text>
                  <Text style={styles.statValue}>{item.student_faculty_ratio}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Placement</Text>
                  <Text style={[styles.statValue, { color: Colors.accent }]}>{item.placement_percentage}%</Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <View style={styles.metricHeader}>
                    <Text style={styles.metricTitle}>Attendance Rate</Text>
                    <Text style={styles.metricPercent}>{item.attendance_percentage}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(item.attendance_percentage, 100)}%`,
                          backgroundColor: item.attendance_percentage >= 85 ? Colors.accent : Colors.warning,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={[styles.metricItem, { marginTop: 10 }]}>
                  <View style={styles.metricHeader}>
                    <Text style={styles.metricTitle}>Semester Pass Rate</Text>
                    <Text style={styles.metricPercent}>{item.pass_percentage}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(item.pass_percentage, 100)}%`,
                          backgroundColor: item.pass_percentage >= 90 ? Colors.primary : Colors.warning,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.emailText}>✉ {item.hod_email}</Text>
              </View>
            </Card>
          ))}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
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
  summaryBar: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryBold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  deptCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  deptName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hodName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metricRow: {
    marginVertical: 4,
  },
  metricItem: {
    width: '100%',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metricPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
