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



import {
  AcademicYear,
  CreateAcademicYearData,
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  setCurrentAcademicYear,
  toggleAcademicYearStatus,
} from '../../api/academic.api';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

const AcademicYearScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<AcademicYear | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const loadYears = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAcademicYears();
      setYears(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to load academic years.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadYears();
    }, [loadYears])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getAcademicYears();
      setYears(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredYears = years.filter(y =>
    y.name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormName('');
    setFormStartDate('');
    setFormEndDate('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item: AcademicYear) => {
    setEditItem(item);
    setFormName(item.name);
    setFormStartDate(item.start_date);
    setFormEndDate(item.end_date);
    setShowEditModal(true);
  };

  const validateForm = (): boolean => {
    if (!formName.trim()) {
      Alert.alert('Validation', 'Year name is required.');
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
      const payload: CreateAcademicYearData = {
        name: formName.trim(),
        start_date: formStartDate.trim(),
        end_date: formEndDate.trim(),
      };
      await createAcademicYear(payload);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Academic year created successfully.');
      loadYears();
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to create academic year.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload: Partial<CreateAcademicYearData> = {
        name: formName.trim(),
        start_date: formStartDate.trim(),
        end_date: formEndDate.trim(),
      };
      await updateAcademicYear(editItem.id, payload);
      setShowEditModal(false);
      setEditItem(null);
      resetForm();
      Alert.alert('Success', 'Academic year updated successfully.');
      loadYears();
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to update academic year.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetCurrent = (item: AcademicYear) => {
    Alert.alert(
      'Set Current',
      `Set "${item.name}" as the current academic year?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await setCurrentAcademicYear(item.id);
              Alert.alert('Success', `"${item.name}" is now the current academic year.`);
              loadYears();
            } catch (err: any) {
              Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to set current year.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = (item: AcademicYear) => {
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
              await toggleAcademicYearStatus(item.id);
              Alert.alert('Success', `Status updated to ${newStatus}.`);
              loadYears();
            } catch (err: any) {
              Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to toggle status.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: AcademicYear }) => (
    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.yearName}>{item.name}</Text>
        <View style={styles.badgeRow}>
          {item.is_current === 1 && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          )}
          <View style={[styles.statusBadge, item.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.dateRange}>
        {item.start_date} → {item.end_date}
      </Text>
      {item.semester_count !== undefined && (
        <Text style={styles.metaText}>Semesters: {item.semester_count}</Text>
      )}
      <View style={styles.actionRow}>
        {item.is_current !== 1 && (
          <TouchableOpacity style={[styles.actionBtn, styles.setCurrentBtn]} onPress={() => handleSetCurrent(item)}>
            <Text style={styles.actionBtnText}>Set Current</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEditModal(item)}>
          <Text style={styles.actionBtnText}>Edit</Text>
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

  const renderModal = (isEdit: boolean) => (
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
            <Text style={styles.modalTitle}>{isEdit ? 'Edit Academic Year' : 'Add Academic Year'}</Text>
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
            <Text style={styles.label}>Year Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2026-2027"
              value={formName}
              onChangeText={setFormName}
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
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header title="Academic Years" subtitle="Manage academic years" />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search academic years..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredYears}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No academic years found.</Text>
          }
        />
      )}
      {renderModal(false)}
      {renderModal(true)}
    </View>
  );
};

export default AcademicYearScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  yearName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
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
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
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
  metaText: {
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
  setCurrentBtn: {
    backgroundColor: Colors.warning,
  },
  editBtn: {
    backgroundColor: Colors.secondary,
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
});
