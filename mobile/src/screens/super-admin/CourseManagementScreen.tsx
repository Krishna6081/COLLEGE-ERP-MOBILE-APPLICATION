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
  Course,
  CreateCourseData,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
} from '../../api/academic.api';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

const COURSE_TYPES = ['UG', 'PG', 'Diploma', 'PhD'];

const CourseManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCourseType, setFormCourseType] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formTotalSemesters, setFormTotalSemesters] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormName('');
    setFormCode('');
    setFormCourseType('');
    setFormDuration('');
    setFormTotalSemesters('');
    setFormDescription('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item: Course) => {
    setEditItem(item);
    setFormName(item.name);
    setFormCode(item.code);
    setFormCourseType(item.course_type);
    setFormDuration(String(item.duration_years));
    setFormTotalSemesters(String(item.total_semesters));
    setFormDescription(item.description || '');
    setShowEditModal(true);
  };

  const validateForm = (): boolean => {
    if (!formName.trim()) {
      Alert.alert('Validation', 'Course name is required.');
      return false;
    }
    if (!formCode.trim()) {
      Alert.alert('Validation', 'Course code is required.');
      return false;
    }
    if (!formCourseType) {
      Alert.alert('Validation', 'Please select a course type.');
      return false;
    }
    const dur = parseInt(formDuration, 10);
    if (!formDuration.trim() || isNaN(dur) || dur <= 0) {
      Alert.alert('Validation', 'Duration must be a positive number.');
      return false;
    }
    const sems = parseInt(formTotalSemesters, 10);
    if (!formTotalSemesters.trim() || isNaN(sems) || sems <= 0) {
      Alert.alert('Validation', 'Total semesters must be a positive number.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload: CreateCourseData = {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        course_type: formCourseType,
        duration_years: parseInt(formDuration, 10),
        total_semesters: parseInt(formTotalSemesters, 10),
        description: formDescription.trim() || undefined,
      };
      await createCourse(payload);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Course created successfully.');
      loadCourses();
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload: Partial<CreateCourseData> = {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        course_type: formCourseType,
        duration_years: parseInt(formDuration, 10),
        total_semesters: parseInt(formTotalSemesters, 10),
        description: formDescription.trim() || undefined,
      };
      await updateCourse(editItem.id, payload);
      setShowEditModal(false);
      setEditItem(null);
      resetForm();
      Alert.alert('Success', 'Course updated successfully.');
      loadCourses();
    } catch (err: any) {
      Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to update course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Course) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCourse(item.id);
              Alert.alert('Success', 'Course deleted successfully.');
              loadCourses();
            } catch (err: any) {
              Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to delete course. It may have associated data.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = (item: Course) => {
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
              await toggleCourseStatus(item.id);
              Alert.alert('Success', `Status updated to ${newStatus}.`);
              loadCourses();
            } catch (err: any) {
              Alert.alert('Error', err?.message || err?.response?.data?.message || 'Failed to toggle status.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Course }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.courseName}>{item.name}</Text>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{item.code}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{item.course_type}</Text>
            </View>
            <Text style={styles.metaText}>{item.duration_years} yr{item.duration_years !== 1 ? 's' : ''}</Text>
            <Text style={styles.metaText}>·</Text>
            <Text style={styles.metaText}>{item.total_semesters} sem{item.total_semesters !== 1 ? 's' : ''}</Text>
          </View>
          {item.department_name ? (
            <Text style={styles.deptText}>{item.department_name}</Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, item.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
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

  const renderCourseTypeSelector = () => (
    <View>
      <Text style={styles.label}>Course Type *</Text>
      <View style={styles.typeRow}>
        {COURSE_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.typeOption, formCourseType === type && styles.typeOptionSelected]}
            onPress={() => setFormCourseType(type)}
          >
            <Text style={[styles.typeOptionText, formCourseType === type && styles.typeOptionTextSelected]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
            <Text style={styles.modalTitle}>{isEdit ? 'Edit Course' : 'Add Course'}</Text>
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
            <Text style={styles.label}>Course Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bachelor of Computer Science"
              value={formName}
              onChangeText={setFormName}
            />
            <Text style={styles.label}>Course Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. BCS"
              value={formCode}
              onChangeText={text => setFormCode(text.toUpperCase())}
              autoCapitalize="characters"
            />
            {renderCourseTypeSelector()}
            <Text style={styles.label}>Duration (Years) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3"
              value={formDuration}
              onChangeText={setFormDuration}
              keyboardType="number-pad"
            />
            <Text style={styles.label}>Total Semesters *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 6"
              value={formTotalSemesters}
              onChangeText={setFormTotalSemesters}
              keyboardType="number-pad"
            />
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Brief description of the course..."
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
      <Header title="Course / Programs" subtitle="Manage course programs" />
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
          data={filteredCourses}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No courses found.</Text>
          }
        />
      )}
      {renderModal(false)}
      {renderModal(true)}
    </View>
  );
};

export default CourseManagementScreen;

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
    marginBottom: 6,
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
    marginBottom: 6,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  deptText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
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
    marginTop: 8,
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
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeOption: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeOptionTextSelected: {
    color: '#fff',
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
