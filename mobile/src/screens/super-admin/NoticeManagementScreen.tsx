
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ErpApi, type NoticePayload } from '../../api/erp.api';

type Notice = {
  id: string;
  title: string;
  description: string;
  audience: string;
  status: 'Draft' | 'Published' | 'Expired';
};

const AUDIENCES = ['All', 'Students', 'Faculty', 'Parents'];

const AUDIENCE_TO_API: Record<string, string> = {
  All: 'ALL',
  Students: 'STUDENTS',
  Faculty: 'FACULTY',
  Parents: 'PARENTS',
};

const AUDIENCE_FROM_API: Record<string, string> = {
  ALL: 'All',
  STUDENTS: 'Students',
  FACULTY: 'Faculty',
  PARENTS: 'Parents',
  DEPARTMENT: 'Department',
};

const STATUS_FROM_API: Record<string, 'Draft' | 'Published' | 'Expired'> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  EXPIRED: 'Expired',
};

const getLocalDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function NoticeManagementScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('All');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAudience('All');
    setEditingId(null);
  };

  const loadNotices = async () => {
    try {
      setLoading(true);

      const response: any = await ErpApi.getNotices();
      const body = response?.data ?? response;

      let data: any[] = [];

      if (Array.isArray(body)) {
        data = body;
      } else if (Array.isArray(body?.data)) {
        data = body.data;
      } else if (Array.isArray(body?.notices)) {
        data = body.notices;
      }

      setNotices(
        data.map((item: any) => ({
          id: String(item.id),
          title: item.title ?? '',
          description: item.content ?? item.description ?? '',
          audience:
            AUDIENCE_FROM_API[
              String(item.target_audience ?? item.audience ?? 'ALL').toUpperCase()
            ] ?? item.target_audience ?? item.audience ?? 'All',
          status:
            STATUS_FROM_API[String(item.status ?? 'DRAFT').toUpperCase()] ??
            'Draft',
        }))
      );
    } catch (error: any) {
      console.log('Load notices error:', error?.response?.data || error?.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Notices load karta ale nahit.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const saveNotice = async () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription) {
      Alert.alert('Validation', 'Please enter both notice title and description.');
      return;
    }

    try {
      setSaving(true);

      const payload: NoticePayload = {
        title: cleanTitle,
        content: cleanDescription,
        target_audience:
          AUDIENCE_TO_API[audience] as NoticePayload['target_audience'],
        priority: 'NORMAL',
        publish_date: getLocalDate(),
        status: 'DRAFT',
      };

      if (editingId) {
        await ErpApi.updateNotice(editingId, payload);
      } else {
        await ErpApi.createNotice(payload);
      }

      const wasEditing = Boolean(editingId);
      resetForm();
      await loadNotices();

      Alert.alert(
        'Success',
        wasEditing
          ? 'Notice updated successfully.'
          : 'Notice added successfully.'
      );
    } catch (error: any) {
      console.log('Save notice error:', error?.response?.data || error?.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Notice save karta ala nahi.'
      );
    } finally {
      setSaving(false);
    }
  };

  const editNotice = (notice: Notice) => {
    setTitle(notice.title);
    setDescription(notice.description);
    setAudience(notice.audience);
    setEditingId(notice.id);
  };

  const deleteNotice = (id: string) => {
    Alert.alert('Delete Notice', 'Are you sure you want to delete this notice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ErpApi.deleteNotice(id);

            if (editingId === id) resetForm();

            await loadNotices();
            Alert.alert('Success', 'Notice deleted successfully.');
          } catch (error: any) {
            console.log('Delete error:', error?.response?.data || error?.message);
            Alert.alert(
              'Error',
              error?.response?.data?.message || 'Notice delete karta ala nahi.'
            );
          }
        },
      },
    ]);
  };

  const publishNotice = (id: string) => {
    Alert.alert('Publish Notice', 'Do you want to publish this notice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Publish',
        onPress: async () => {
          try {
            await ErpApi.publishNotice(id);
            await loadNotices();
            Alert.alert('Success', 'Notice published successfully.');
          } catch (error: any) {
            console.log('Publish error:', error?.response?.data || error?.message);
            Alert.alert(
              'Error',
              error?.response?.data?.message || 'Notice publish karta ala nahi.'
            );
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Notice }) => (
    <View style={styles.noticeCard}>
      <View style={styles.noticeHeader}>
        <Text style={styles.noticeTitle}>{item.title}</Text>

        <View
          style={[
            styles.statusBadge,
            item.status === 'Published'
              ? styles.publishedBadge
              : item.status === 'Expired'
              ? styles.expiredBadge
              : styles.draftBadge,
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.noticeDescription}>{item.description}</Text>

      <View style={styles.metaContainer}>
        <Text style={styles.meta}>Audience: {item.audience}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => editNotice(item)}
          style={[styles.actionButton, styles.editButton]}
          activeOpacity={0.8}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteNotice(item.id)}
          style={[styles.actionButton, styles.deleteButton]}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>

        {item.status === 'Draft' && (
          <TouchableOpacity
            onPress={() => publishNotice(item.id)}
            style={[styles.actionButton, styles.publishButton]}
            activeOpacity={0.8}
          >
            <Text style={styles.publishText}>Publish</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.pageHeader}>
              <Text style={styles.heading}>Notice Management</Text>
              <Text style={styles.headerSubtitle}>
                Create and manage college announcements
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formHeading}>
                {editingId ? 'Edit Notice' : 'Create New Notice'}
              </Text>

              <Text style={styles.label}>Notice Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter notice title"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
                maxLength={255}
                editable={!saving}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Enter notice description"
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={3000}
                editable={!saving}
              />

              <Text style={styles.label}>Select Audience</Text>

              <View style={styles.audienceRow}>
                {AUDIENCES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.audienceButton,
                      audience === item && styles.selectedAudience,
                    ]}
                    onPress={() => setAudience(item)}
                    disabled={saving}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.audienceText,
                        audience === item && styles.selectedText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={saveNotice}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingId ? 'Update Notice' : '+ Add Notice'}
                  </Text>
                )}
              </TouchableOpacity>

              {editingId && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetForm}
                  disabled={saving}
                >
                  <Text style={styles.cancelText}>Cancel Editing</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.subheadingRow}>
              <View>
                <Text style={styles.subheading}>All Notices</Text>
                <Text style={styles.countText}>
                  {notices.length} notices available
                </Text>
              </View>

              <TouchableOpacity
                onPress={loadNotices}
                disabled={loading}
                style={styles.refreshButton}
              >
                <Text style={styles.refreshText}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#1D4ED8"
                style={styles.loader}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Notices Found</Text>
              <Text style={styles.emptyText}>
                Create your first notice using the form above.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5FF',
  },

  listContent: {
    padding: 16,
    paddingBottom: 35,
  },

  pageHeader: {
    backgroundColor: '#0c2466',
    padding: 20,
    borderRadius: 14,
    marginBottom: 18,
  },

  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#DBEAFE',
    marginTop: 6,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 22,
    elevation: 2,
  },

  formHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
    color: '#1E3A8A',
  },

  input: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 9,
    padding: 12,
    marginBottom: 16,
    color: '#0F172A',
    fontSize: 14,
  },

  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  audienceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },

  audienceButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  selectedAudience: {
    backgroundColor: '#0c2466',
    borderColor: '#0c2466',
  },

  audienceText: {
    color: '#0c2466',
    fontSize: 13,
    fontWeight: '600',
  },

  selectedText: {
    color: '#FFFFFF',
  },

  saveButton: {
    backgroundColor: '#0c2466',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    minHeight: 49,
    justifyContent: 'center',
    elevation: 2,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  cancelButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 5,
  },

  cancelText: {
    color: '#64748B',
    fontWeight: '700',
  },

  subheadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  subheading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1E3A8A',
  },

  countText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },

  refreshButton: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
  },

  refreshText: {
    color: '#0a256e',
    fontWeight: '700',
  },

  loader: {
    marginVertical: 20,
  },

  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A8A',
  },

  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 7,
    fontSize: 13,
  },

  noticeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    elevation: 2,
  },

  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },

  noticeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A8A',
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  draftBadge: {
    backgroundColor: '#FEF3C7',
  },

  publishedBadge: {
    backgroundColor: '#DCFCE7',
  },

  expiredBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },

  noticeDescription: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },

  metaContainer: {
    backgroundColor: '#EFF6FF',
    padding: 9,
    borderRadius: 7,
  },

  meta: {
    fontSize: 12,
    color: '#07184e',
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14,
  },

  actionButton: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 7,
  },

  editButton: {
    backgroundColor: '#DBEAFE',
  },

  editText: {
    color: '#0c2770',
    fontWeight: '800',
  },

  deleteButton: {
    backgroundColor: '#FEE2E2',
  },

  deleteText: {
    color: '#DC2626',
    fontWeight: '800',
  },

  publishButton: {
    backgroundColor: '#DCFCE7',
  },

  publishText: {
    color: '#15803D',
    fontWeight: '800',
  },
});
