import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Linking,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { HodApi } from '../../api/hod.api';

interface StudentItem {
  id: string;
  name: string;
  roll_number: string;
  enrollment_number: string;
  prn: string;
  gender: string;
  email: string;
  mobile: string;
  division: string;
  semester: string;
  program: string;
  attendance_percentage: number;
  is_defaulter: boolean;
  status: string;
}

const DIVISIONS = ['ALL', 'Division A', 'Division B'];

export const HodStudentsScreen: React.FC = () => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');

  const fetchStudents = async () => {
    try {
      const response = await HodApi.getStudents(search, selectedDivision);
      if (response && response.data) {
        setStudents(response.data);
      }
    } catch {
      // Offline fallback
      setStudents([
        {
          id: 'stud-001',
          name: 'Alex Johnson',
          roll_number: 'ENR-2023-1001',
          enrollment_number: 'ENR-2023-1001',
          prn: 'PRN20230001',
          gender: 'MALE',
          email: 'alex.johnson@mit-eng.edu',
          mobile: '+919900000030',
          division: 'Division A',
          semester: 'Semester 5',
          program: 'B.Tech',
          attendance_percentage: 83.3,
          is_defaulter: false,
          status: 'ACTIVE',
        },
        {
          id: 'stud-002',
          name: 'Emma Watson',
          roll_number: 'ENR-2023-1002',
          enrollment_number: 'ENR-2023-1002',
          prn: 'PRN20230002',
          gender: 'FEMALE',
          email: 'emma.watson@mit-eng.edu',
          mobile: '+919900000031',
          division: 'Division A',
          semester: 'Semester 5',
          program: 'B.Tech',
          attendance_percentage: 100.0,
          is_defaulter: false,
          status: 'ACTIVE',
        },
        {
          id: 'stud-003',
          name: 'Priya Deshmukh',
          roll_number: 'ENR-2023-1003',
          enrollment_number: 'ENR-2023-1003',
          prn: 'PRN-2023-CSE-003',
          gender: 'FEMALE',
          email: 'priya.deshmukh@mit-eng.edu',
          mobile: '+919820011223',
          division: 'Division A',
          semester: 'Semester 5',
          program: 'B.Tech',
          attendance_percentage: 100.0,
          is_defaulter: false,
          status: 'ACTIVE',
        },
        {
          id: 'stud-004',
          name: 'Aryan Mehta',
          roll_number: 'ENR-2023-1004',
          enrollment_number: 'ENR-2023-1004',
          prn: 'PRN-2023-CSE-004',
          gender: 'MALE',
          email: 'aryan.mehta@mit-eng.edu',
          mobile: '+919820022334',
          division: 'Division B',
          semester: 'Semester 5',
          program: 'B.Tech',
          attendance_percentage: 50.0,
          is_defaulter: true,
          status: 'ACTIVE',
        },
        {
          id: 'stud-005',
          name: 'Ananya Roy',
          roll_number: 'ENR-2023-1005',
          enrollment_number: 'ENR-2023-1005',
          prn: 'PRN-2023-CSE-005',
          gender: 'FEMALE',
          email: 'ananya.roy@mit-eng.edu',
          mobile: '+919820033445',
          division: 'Division B',
          semester: 'Semester 5',
          program: 'B.Tech',
          attendance_percentage: 83.3,
          is_defaulter: false,
          status: 'ACTIVE',
        },
        {
          id: 'stud-006',
          name: 'Rohan Sharma',
          roll_number: 'ENR-2023-1006',
          enrollment_number: 'ENR-2023-1006',
          prn: 'PRN-2023-CSE-006',
          gender: 'MALE',
          email: 'rohan.sharma@mit-eng.edu',
          mobile: '+919820044556',
          division: 'Division A',
          semester: 'Semester 5',
          program: 'B.Tech',
          attendance_percentage: 100.0,
          is_defaulter: false,
          status: 'ACTIVE',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedDivision]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      s.prn.toLowerCase().includes(search.toLowerCase());

    const matchesDivision =
      selectedDivision === 'ALL' || s.division.toLowerCase() === selectedDivision.toLowerCase();

    return matchesSearch && matchesDivision;
  });

  const defaultersCount = students.filter((s) => s.is_defaulter).length;

  return (
    <View style={styles.container}>
      <Header
        title="Department Students"
        subtitle="Computer Science & Engineering • Roster"
        onRightPress={onRefresh}
        rightIconLabel="Refresh"
      />

      {/* KPI Overview Strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statDesc}>Enrolled</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: Colors.success }]}>
            {students.length - defaultersCount}
          </Text>
          <Text style={styles.statDesc}>Regular (≥75%)</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: Colors.danger }]}>{defaultersCount}</Text>
          <Text style={styles.statDesc}>Shortage (&lt;75%)</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by student name, roll number, PRN..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {/* Division Filter Tabs */}
      <View style={styles.tabsRow}>
        {DIVISIONS.map((div) => (
          <TouchableOpacity
            key={div}
            style={[styles.tabButton, selectedDivision === div && styles.activeTabButton]}
            onPress={() => setSelectedDivision(div)}
          >
            <Text style={[styles.tabText, selectedDivision === div && styles.activeTabText]}>
              {div}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading students roster...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {filtered.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No students found matching your criteria.</Text>
            </Card>
          ) : (
            filtered.map((student) => (
              <Card key={student.id} style={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {student.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.rollNumberText}>
                      Roll: {student.roll_number} • {student.prn}
                    </Text>
                    <Text style={styles.academicInfoText}>
                      {student.division} • {student.semester} ({student.program})
                    </Text>
                  </View>
                  <View style={styles.attendanceBadge}>
                    <Badge
                      label={`${student.attendance_percentage}%`}
                      type={student.is_defaulter ? 'danger' : 'success'}
                    />
                  </View>
                </View>

                {student.is_defaulter && (
                  <View style={styles.shortageNotice}>
                    <Text style={styles.shortageNoticeText}>
                      ⚠️ Attendance Shortage (&lt;75%) — Defaulter letter required
                    </Text>
                  </View>
                )}

                {/* Contact bar */}
                <View style={styles.contactBar}>
                  {student.email ? (
                    <TouchableOpacity
                      style={styles.contactButton}
                      onPress={() => Linking.openURL(`mailto:${student.email}`)}
                    >
                      <Text style={styles.contactButtonText}>✉️ {student.email}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {student.mobile ? (
                    <TouchableOpacity
                      style={styles.contactButton}
                      onPress={() => Linking.openURL(`tel:${student.mobile}`)}
                    >
                      <Text style={styles.contactButtonText}>📞 Call Student</Text>
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
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  statDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, height: 26, backgroundColor: Colors.border },
  searchSection: { marginHorizontal: 16, marginTop: 14 },
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
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
  },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTabButton: { backgroundColor: '#FFFFFF', elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  activeTabText: { color: Colors.primary, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, padding: 20 },
  studentCard: { marginBottom: 12, padding: 14 },
  studentHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  headerInfo: { flex: 1, marginLeft: 12 },
  studentName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  rollNumberText: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 1 },
  academicInfoText: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  attendanceBadge: { alignSelf: 'flex-start' },
  shortageNotice: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
  },
  shortageNoticeText: { fontSize: 11, color: '#B91C1C', fontWeight: '600' },
  contactBar: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactButtonText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
});
