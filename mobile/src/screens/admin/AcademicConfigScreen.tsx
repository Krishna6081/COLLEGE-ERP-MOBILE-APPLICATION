import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { SuperAdminApi, AcademicYear, Department } from '../../api/superadmin.api';
import { CollegeSelector } from '../../components/CollegeSelector';

export const AcademicConfigScreen: React.FC = () => {
  const [tab, setTab] = useState<'YEARS' | 'DEPTS'>('YEARS');
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const currentCollegeId = useRef(collegeId);

  // Add Year Modal
  const [yearModal, setYearModal] = useState(false);
  const [yearName, setYearName] = useState('');
  const [startDate, setStartDate] = useState('2027-07-01');
  const [endDate, setEndDate] = useState('2028-06-30');
  const [savingYear, setSavingYear] = useState(false);

  // Add Dept Modal
  const [deptModal, setDeptModal] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [savingDept, setSavingDept] = useState(false);

  const fetchData = async () => {
    const requestedCollegeId = collegeId;
    if (!collegeId) {
      setYears([]);
      setDepartments([]);
      setErrorMessage('Select a college to view its academic configuration.');
      return;
    }
    setLoading(true);
    try {
      const [yRes, dRes] = await Promise.all([
        SuperAdminApi.getAcademicYears(requestedCollegeId),
        SuperAdminApi.getDepartments(requestedCollegeId),
      ]);
      if (currentCollegeId.current !== requestedCollegeId) return;
      if (yRes.success && yRes.data) setYears(yRes.data);
      if (dRes.success && dRes.data) setDepartments(dRes.data);
      setErrorMessage('');
    } catch (e: any) {
      if (currentCollegeId.current !== requestedCollegeId) return;
      setErrorMessage(e?.message || 'Could not load academic configuration. Check your connection and try again.');
    } finally {
      if (currentCollegeId.current === requestedCollegeId) setLoading(false);
    }
  };

  useEffect(() => {
    currentCollegeId.current = collegeId;
    fetchData();
  }, [collegeId]);

  const handleCreateYear = async () => {
    if (!yearName) {
      Alert.alert('Required', 'Academic session name is required (e.g. 2027-2028).');
      return;
    }
    setSavingYear(true);
    try {
      const res = await SuperAdminApi.createAcademicYear({ college_id: collegeId, name: yearName, start_date: startDate, end_date: endDate });
      if (res.success) {
        Alert.alert('Success', 'Academic year created successfully.');
        setYearModal(false);
        setYearName('');
        fetchData();
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create academic session.');
    } finally {
      setSavingYear(false);
    }
  };

  const handleSetCurrentYear = async (id: string, name: string) => {
    Alert.alert('Set Current Session', `Set ${name} as the active current academic year?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await SuperAdminApi.setCurrentAcademicYear(id, collegeId);
            fetchData();
          } catch (e: any) {
            Alert.alert('Could not update academic year', e?.message || 'Check your connection and try again.');
          }
        },
      },
    ]);
  };

  const handleCreateDept = async () => {
    if (!deptCode || !deptName) {
      Alert.alert('Required', 'Department code and name are required.');
      return;
    }
    setSavingDept(true);
    try {
      const res = await SuperAdminApi.createDepartment({ college_id: collegeId, code: deptCode, name: deptName, description: deptDesc });
      if (res.success) {
        Alert.alert('Success', 'Department created successfully.');
        setDeptModal(false);
        setDeptCode('');
        setDeptName('');
        setDeptDesc('');
        fetchData();
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create department.');
    } finally {
      setSavingDept(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Academic Configuration" subtitle="Sessions, Semesters & Department Structure" />
      <CollegeSelector value={collegeId} onChange={setCollegeId} />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'YEARS' && styles.tabBtnActive]}
          onPress={() => setTab('YEARS')}
        >
          <Text style={[styles.tabText, tab === 'YEARS' && styles.tabTextActive]}>
            📅 Academic Years ({years.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'DEPTS' && styles.tabBtnActive]}
          onPress={() => setTab('DEPTS')}
        >
          <Text style={[styles.tabText, tab === 'DEPTS' && styles.tabTextActive]}>
            🏛️ Departments ({departments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : errorMessage ? (
          <Text style={styles.emptyText}>{errorMessage}</Text>
        ) : tab === 'YEARS' ? (
          <View>
            <Button
              title="+ NEW ACADEMIC YEAR"
              onPress={() => setYearModal(true)}
              style={{ marginBottom: 14 }}
            />
            {years.map((y) => (
              <Card key={y.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.titleText}>Session {y.name}</Text>
                  <Badge
                    text={y.is_current ? 'CURRENT ACTIVE' : 'ARCHIVED'}
                    variant={y.is_current ? 'success' : 'neutral'}
                  />
                </View>
                <Text style={styles.dateText}>
                  🗓️ Period: {y.start_date} to {y.end_date}
                </Text>

                {!y.is_current && (
                  <TouchableOpacity
                    style={styles.setCurrentBtn}
                    onPress={() => handleSetCurrentYear(y.id, y.name)}
                  >
                    <Text style={styles.setCurrentText}>★ Set as Current Active Session</Text>
                  </TouchableOpacity>
                )}
              </Card>
            ))}
          </View>
        ) : (
          <View>
            <Button
              title="+ NEW DEPARTMENT"
              onPress={() => setDeptModal(true)}
              style={{ marginBottom: 14 }}
            />
            {departments.map((d) => (
              <Card key={d.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.titleText}>{d.name}</Text>
                    <Text style={styles.subText}>Code: {d.code}</Text>
                  </View>
                  <Badge text={d.status} variant="success" />
                </View>
                {d.description && <Text style={styles.descText}>{d.description}</Text>}
                <View style={styles.footerRow}>
                  <Text style={styles.statLabel}>👥 {d.students_count || 0} Students</Text>
                  <Text style={styles.statLabel}>👨‍🏫 {d.faculty_count || 0} Faculty</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Year Modal */}
      <Modal visible={yearModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Academic Session</Text>
              <TouchableOpacity onPress={() => setYearModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Academic Year (e.g. 2027-2028)</Text>
            <TextInput
              style={styles.input}
              value={yearName}
              onChangeText={setYearName}
              placeholder="e.g. 2027-2028"
            />

            <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />

            <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} />

            <Button
              title="CREATE ACADEMIC YEAR"
              onPress={handleCreateYear}
              loading={savingYear}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>

      {/* Add Dept Modal */}
      <Modal visible={deptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Department</Text>
              <TouchableOpacity onPress={() => setDeptModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Department Code</Text>
            <TextInput
              style={styles.input}
              value={deptCode}
              onChangeText={setDeptCode}
              placeholder="e.g. AI_DS"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Department Name</Text>
            <TextInput
              style={styles.input}
              value={deptName}
              onChangeText={setDeptName}
              placeholder="e.g. Artificial Intelligence & Data Science"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
              value={deptDesc}
              onChangeText={setDeptDesc}
              placeholder="Department overview"
            />

            <Button
              title="CREATE DEPARTMENT"
              onPress={handleCreateDept}
              loading={savingDept}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 6, margin: 16, borderRadius: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  tabTextActive: { color: '#FFFFFF' },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 24 },
  card: { padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  titleText: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  subText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', marginTop: 2 },
  descText: { fontSize: 13, color: Colors.textSecondary, marginVertical: 6 },
  dateText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  setCurrentBtn: { marginTop: 12, backgroundColor: '#EFF6FF', paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  setCurrentText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  footerRow: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  statLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  modalClose: { fontSize: 18, fontWeight: '800', color: Colors.textSecondary, padding: 4 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginTop: 10, marginBottom: 4 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: '#F8FAFC',
  },
});
