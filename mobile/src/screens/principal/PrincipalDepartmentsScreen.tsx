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
  Modal,
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

  // Department Drilldown Modal State
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);
  const [deptDetails, setDeptDetails] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTab, setModalTab] = useState<'FACULTY' | 'STUDENTS'>('FACULTY');

  const fetchDepartments = async () => {
    try {
      const response = await PrincipalApi.getDepartments();
      if (response && response.data) {
        setDepartments(response.data);
      }
    } catch (err) {
      console.warn('Failed to fetch departments from MySQL', err);
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

  const handleOpenDepartment = async (dept: DepartmentItem) => {
    setSelectedDept(dept);
    setModalLoading(true);
    setModalTab('FACULTY');
    try {
      const response = await PrincipalApi.getDepartmentDetails(dept.id);
      if (response && response.data) {
        setDeptDetails(response.data);
      }
    } catch {
      setDeptDetails(null);
    } finally {
      setModalLoading(false);
    }
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
          <Text style={styles.loadingText}>Loading departments from database...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          <View style={styles.summaryBar}>
            <Text style={styles.summaryText}>
              Showing <Text style={styles.summaryBold}>{filteredDepts.length}</Text> academic departments (Tap card to view faculty & students)
            </Text>
          </View>

          {filteredDepts.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => handleOpenDepartment(item)}
            >
              <Card style={styles.deptCard}>
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
                  <Text style={styles.viewDetailsText}>View Faculty & Students →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Department Detail Modal (Real MySQL Drilldown) */}
      <Modal
        visible={!!selectedDept}
        animationType="slide"
        onRequestClose={() => setSelectedDept(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{selectedDept?.name}</Text>
              <Text style={styles.modalSubtitle}>Department Code: {selectedDept?.code} • HOD: {selectedDept?.hod_name}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedDept(null)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Tabs */}
          <View style={styles.modalTabRow}>
            <TouchableOpacity
              style={[styles.modalTabItem, modalTab === 'FACULTY' && styles.modalTabItemActive]}
              onPress={() => setModalTab('FACULTY')}
            >
              <Text style={[styles.modalTabText, modalTab === 'FACULTY' && styles.modalTabTextActive]}>
                👨‍🏫 Faculty Members ({deptDetails?.total_faculty || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalTabItem, modalTab === 'STUDENTS' && styles.modalTabItemActive]}
              onPress={() => setModalTab('STUDENTS')}
            >
              <Text style={[styles.modalTabText, modalTab === 'STUDENTS' && styles.modalTabTextActive]}>
                🎓 Enrolled Students ({deptDetails?.total_students || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {modalLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading department roster from database...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {modalTab === 'FACULTY' && (
                <View>
                  {deptDetails?.faculty?.length === 0 ? (
                    <Text style={styles.emptyText}>No faculty members found in this department.</Text>
                  ) : (
                    deptDetails?.faculty?.map((fac: any) => (
                      <Card key={fac.id} style={styles.rosterCard}>
                        <View style={styles.rosterHeader}>
                          <Text style={styles.rosterName}>{fac.first_name} {fac.last_name}</Text>
                          <Badge label={fac.designation || 'Faculty'} type="primary" />
                        </View>
                        <Text style={styles.rosterSub}>Emp ID: {fac.employee_id} • {fac.qualification}</Text>
                        <View style={styles.rosterContactRow}>
                          <Text style={styles.rosterContact}>✉ {fac.email}</Text>
                          <Text style={styles.rosterContact}>📞 {fac.mobile}</Text>
                        </View>
                      </Card>
                    ))
                  )}
                </View>
              )}

              {modalTab === 'STUDENTS' && (
                <View>
                  {deptDetails?.students?.length === 0 ? (
                    <Text style={styles.emptyText}>No students registered in this department yet.</Text>
                  ) : (
                    deptDetails?.students?.map((stu: any) => (
                      <Card key={stu.id} style={styles.rosterCard}>
                        <View style={styles.rosterHeader}>
                          <Text style={styles.rosterName}>{stu.first_name} {stu.last_name}</Text>
                          <Badge label={stu.gender} type="info" />
                        </View>
                        <Text style={styles.rosterSub}>PRN: {stu.PRN} • Roll: {stu.enrollment_number}</Text>
                        <View style={styles.rosterContactRow}>
                          <Text style={styles.rosterContact}>✉ {stu.email}</Text>
                          <Text style={styles.rosterContact}>📞 {stu.mobile}</Text>
                        </View>
                      </Card>
                    ))
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
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
    padding: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalTabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  modalTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modalScroll: {
    padding: 12,
    paddingBottom: 40,
  },
  rosterCard: {
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 4,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rosterName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rosterSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  rosterContactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rosterContact: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
