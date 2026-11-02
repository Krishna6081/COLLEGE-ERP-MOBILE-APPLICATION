import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import {
  Semester,
  AcademicYear,
  CreateSemesterData,
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  toggleSemesterStatus,
  getAcademicYears,
} from '../../api/academic.api';

const SemesterScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterYearId, setFilterYearId] = useState<string | undefined>(undefined);
  const [filterYearName, setFilterYearName] = useState<string>('All Years');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<Semester | null>(null);
  const [saving, setSaving] = useState(false);

  const [formAcademicYearId, setFormAcademicYearId] = useState('');
  const [formAcademicYearName, setFormAcademicYearName] = useState('');
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const [showYearPickerModal, setShowYearPickerModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [semData, yearData] = await Promise.all([
        getSemesters(filterYearId),
        getAcademicYears(),
      ]);
      setSemesters(semData);
      setAcademicYears(yearData);
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to load semesters.');
    } finally {
      setLoading(false);
    }
  }, [filterYearId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [semData, yearData] = await Promise.all([
        getSemesters(filterYearId),
        getAcademicYears(),
      ]);
      setSemesters(semData);
      setAcademicYears(yearData);
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const resetForm = () => {
    setFormAcademicYearId('');
    setFormAcademicYearName('');
    setFormName('');
    setFormNumber('');
    setFormStartDate('');
    setFormEndDate('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item: Semester) => {
    setEditItem(item);
    setFormAcademicYearId(item.academic_year_id);
    setFormAcademicYearName(item.academic_year_name || '');
    setFormName(item.name);
    setFormNumber(String(item.semester_number));
    setFormStartDate(item.start_date);
    setFormEndDate(item.end_date);
    setShowEditModal(true);
  };

  const validateForm = (): boolean => {
    if (!formAcademicYearId.trim()) {
      Alert.alert('Validation', 'Please select an academic year.');
      return false;
    }
    if (!formName.trim()) {
      Alert.alert('Validation', 'Semester name is required.');
      return false;
    }
    const numVal = parseInt(formNumber, 10);
    if (!formNumber.trim() || isNaN(numVal) || numVal <= 0) {
      Alert.alert('Validation', 'Semester number must be a positive integer.');
      return false;
    }
    if (!formStartDate.trim()) {
      Alert.alert('Validation', 'Start date is required (YYYY-MM-DD).');
      return false;
    }
    if (!formEndDate.trim()) {
      Alert.alert('Validation', 'End date is required (YYYY-MM-DD).');
      return false;
    }
    if (formStartDate >= formEndDate) {
      Alert.alert('Validation', 'Start date must be before end date.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload: CreateSemesterData = {
        academic_year_id: formAcademicYearId.trim(),
        semester_name: formName.trim(),
        semester_number: parseInt(formNumber, 10),
        start_date: formStartDate.trim(),
        end_date: formEndDate.trim(),
      };
      await createSemester(payload);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Semester created successfully.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to create semester.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload: Partial<CreateSemesterData> = {
        academic_year_id: formAcademicYearId.trim(),
        semester_name: formName.trim(),
        semester_number: parseInt(formNumber, 10),
        start_date: formStartDate.trim(),
        end_date: formEndDate.trim(),
      };
      await updateSemester(editItem.id, payload);
      setShowEditModal(false);
      setEditItem(null);
      resetForm();
      Alert.alert('Success', 'Semester updated successfully.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to update semester.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Semester) => {
    Alert.alert(
      'Delete Semester',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSemester(item.id);
              Alert.alert('Success', 'Semester deleted successfully.');
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to delete semester.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = (item: Semester) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    Alert.alert(
      'Toggle Status',
      `Change "${item.name}" status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await toggleSemesterStatus(item.id);
              Alert.alert('Success', `Status updated to ${newStatus}.`);
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to toggle status.');
            }
          },
        },
      ]
    );
  };

  const selectFilterYear = (year: AcademicYear | null) => {
    if (year) {
      setFilterYearId(year.id);
      setFilterYearName(year.name);
    } else {
      setFilterYearId(undefined);
      setFilterYearName('All Years');
    }
    setShowFilterModal(false);
  };

  const selectFormYear = (year: AcademicYear) => {
    setFormAcademicYearId(year.id);
    setFormAcademicYearName(year.name);
    setShowYearPickerModal(false);
  };

  const renderItem = ({ item }: { item: Semester }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.semesterName}>{item.name}</Text>
          <Text style={styles.semesterMeta}>
            Semester #{item.semester_number}
            {item.academic_year_name ? `  ·  ${item.academic_year_name}` : ''}
          </Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.dateRange}>
        {item.start_date} → {item.end_date}
      </Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEditModal(item)}>
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
          <Text style={styles.actionBtnText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, item.status === 'ACTIVE' ? styles.toggleInactiveBtn : styles.toggleActiveBtn]}
          onPress={() => handleToggleStatus(item)}
        >
          <Text style={styles.actionBtnText}>{item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderYearPickerModal = (
    visible: boolean,
    onClose: () => void,
    onSelect: (year: AcademicYear) => void,
    includeAll?: boolean,
    onSelectAll?: () => void
  ) => (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Academic Year</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={academicYears}
            keyExtractor={y => y.id}
            ListHeaderComponent={
              includeAll && onSelectAll ? (
                <TouchableOpacity style={styles.yearPickerItem} onPress={onSelectAll}>
                  <Text style={styles.yearPickerItemText}>All Years</Text>
                </TouchableOpacity>
              ) : null
            }
            renderItem={({ item: y }) => (
              <TouchableOpacity style={styles.yearPickerItem} onPress={() => onSelect(y)}>
                <Text style={styles.yearPickerItemText}>{y.name}</Text>
                {y.is_current === 1 && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyPickerText}>No academic years available.</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );

  const renderFormModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (isEdit) { setShowEditModal(false); setEditItem(null); } else setShowAddModal(false);
        resetForm();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isEdit ? 'Edit Semester' : 'Add Semester'}</Text>
            <TouchableOpacity
              onPress={() => {
                if (isEdit) { setShowEditModal(false); setEditItem(null); } else setShowAddModal(false);
                resetForm();
              }}
            >
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Academic Year *</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowYearPickerModal(true)}>
              <Text style={[styles.pickerBtnText, !formAcademicYearName && styles.pickerBtnPlaceholder]}>
                {formAcademicYearName || 'Select Academic Year'}
              </Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Semester Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Semester 1"
              value={formName}
              onChangeText={setFormName}
            />
            <Text style={styles.label}>Semester Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1"
              value={formNumber}
              onChangeText={setFormNumber}
              keyboardType="number-pad"
            />
            <Text style={styles.label}>Start Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formStartDate}
              onChangeText={setFormStartDate}
              keyboardType="default"
            />
            <Text style={styles.label}>End Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formEndDate}
              onChangeText={setFormEndDate}
              keyboardType="default"
            />
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={isEdit ? handleEdit : handleAdd}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{isEdit ? 'Update' : 'Create'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
      {renderYearPickerModal(showYearPickerModal, () => setShowYearPickerModal(false), selectFormYear)}
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header title="Semesters" subtitle="Manage semesters" />
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterBtnText}>{filterYearName}</Text>
          <Text style={styles.pickerChevron}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={semesters}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No semesters found.</Text>
          }
        />
      )}
      {renderFormModal(false)}
      {renderFormModal(true)}
      {renderYearPickerModal(
        showFilterModal,
        () => setShowFilterModal(false),
        (y) => selectFilterYear(y),
        true,
        () => selectFilterYear(null)
      )}
    </View>
  );
};

export default SemesterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBtnText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loader: {
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 8,
  },
  semesterName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  semesterMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: Colors.success,
  },
  inactiveBadge: {
    backgroundColor: Colors.danger,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  dateRange: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: Colors.secondary,
  },
  deleteBtn: {
    backgroundColor: Colors.danger,
  },
  toggleInactiveBtn: {
    backgroundColor: Colors.danger,
  },
  toggleActiveBtn: {
    backgroundColor: Colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    fontSize: 20,
    color: Colors.textSecondary,
    padding: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  pickerBtn: {
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
  },
  pickerBtnText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  pickerBtnPlaceholder: {
    color: Colors.textSecondary,
  },
  pickerChevron: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  yearPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: 'space-between',
  },
  yearPickerItemText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  currentBadge: {
    backgroundColor: Colors.warning,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyPickerText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
