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
  Department,
  CreateDepartmentData,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
} from '../../api/academic.api';

const DepartmentManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDepartments();
    }, [loadDepartments])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormName('');
    setFormCode('');
    setFormDescription('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item: Department) => {
    setEditItem(item);
    setFormName(item.name);
    setFormCode(item.code);
    setFormDescription(item.description || '');
    setShowEditModal(true);
  };

  const validateForm = (): boolean => {
    if (!formName.trim()) {
      Alert.alert('Validation', 'Department name is required.');
      return false;
    }
    if (!formCode.trim()) {
      Alert.alert('Validation', 'Department code is required.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload: CreateDepartmentData = {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim() || undefined,
      };
      await createDepartment(payload);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Department created successfully.');
      loadDepartments();
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to create department.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload: Partial<CreateDepartmentData> = {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim() || undefined,
      };
      await updateDepartment(editItem.id, payload);
      setShowEditModal(false);
      setEditItem(null);
      resetForm();
      Alert.alert('Success', 'Department updated successfully.');
      loadDepartments();
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to update department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Department) => {
    Alert.alert(
      'Delete Department',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDepartment(item.id);
              Alert.alert('Success', 'Department deleted successfully.');
              loadDepartments();
            } catch (err: any) {
              Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to delete department. It may have associated data.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = (item: Department) => {
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
              await toggleDepartmentStatus(item.id);
              Alert.alert('Success', `Status updated to ${newStatus}.`);
              loadDepartments();
            } catch (err: any) {
              Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to toggle status.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Department }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.deptName}>{item.name}</Text>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{item.code}</Text>
            </View>
          </View>
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          {item.program_count !== undefined && (
            <Text style={styles.metaText}>Programs: {item.program_count}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, item.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
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
            <Text style={styles.modalTitle}>{isEdit ? 'Edit Department' : 'Add Department'}</Text>
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
            <Text style={styles.label}>Department Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Computer Science"
              value={formName}
              onChangeText={setFormName}
            />
            <Text style={styles.label}>Department Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. CS"
              value={formCode}
              onChangeText={text => setFormCode(text.toUpperCase())}
              autoCapitalize="characters"
            />
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Brief description of the department..."
              value={formDescription}
              onChangeText={setFormDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
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
      <Header title="Departments" subtitle="Manage college departments" />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or code..."
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
          data={filteredDepartments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No departments found.</Text>
          }
        />
      )}
      {renderModal(false)}
      {renderModal(true)}
    </View>
  );
};

export default DepartmentManagementScreen;

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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  deptName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  codeBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  codeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
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
  textArea: {
    height: 90,
    paddingTop: 12,
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
