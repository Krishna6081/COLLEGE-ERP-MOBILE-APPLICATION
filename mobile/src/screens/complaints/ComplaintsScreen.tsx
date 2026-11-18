import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Modal, ScrollView, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { ComplaintApi } from '../../api/student.api';

const CATEGORIES = ['ACADEMIC', 'HOSTEL', 'INFRASTRUCTURE', 'ADMINISTRATION', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const statusBadge = (status: string): 'warning' | 'info' | 'success' | 'danger' => {
  switch (status) {
    case 'OPEN': return 'warning';
    case 'IN_PROGRESS': return 'info';
    case 'RESOLVED': return 'success';
    case 'REJECTED': return 'danger';
    default: return 'info';
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const ComplaintsScreen: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('ACADEMIC');
  const [priority, setPriority] = useState('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Detail modal
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadComplaints = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await ComplaintApi.getComplaints();
      setComplaints(res.data || []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadComplaints(); }, []);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Validation Error', 'Subject and description are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await ComplaintApi.createComplaint({
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        ...(attachmentUrl.trim() ? { attachment_url: attachmentUrl.trim() } : {}),
      });
      const ticket = res.data;
      Alert.alert(
        'Ticket Raised',
        `Your complaint has been submitted.\nTicket ID: ${ticket?.ticket_id || ticket?.id || 'N/A'}`,
      );
      setShowForm(false);
      setSubject('');
      setDescription('');
      setAttachmentUrl('');
      setCategory('ACADEMIC');
      setPriority('MEDIUM');
      loadComplaints();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (item: any) => {
    setSelectedComplaint(item);
    setDetailLoading(true);
    try {
      const res = await ComplaintApi.getComplaintById(String(item.id));
      setSelectedComplaint(res.data || item);
    } catch {
      // keep item as fallback
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Header
        title="Grievances & Support"
        subtitle="Campus Helpdesk"
        onRightPress={() => setShowForm(true)}
      />

      <FlatList
        data={complaints}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadComplaints(true)} colors={[Colors.primary]} />
        }
        ListHeaderComponent={
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.newBtnText}>+ Raise New Complaint</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <EmptyState title="No Complaints" message="You have not raised any complaints yet." />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openDetail(item)}>
            <Card>
              <View style={styles.row}>
                <Text style={styles.ticketId}>#{item.ticket_id || item.id}</Text>
                <Badge label={item.status || 'OPEN'} type={statusBadge(item.status || 'OPEN')} />
              </View>
              <Text style={styles.subject}>{item.subject}</Text>
              <View style={styles.metaRow}>
                <Badge label={item.category} type="info" />
                <Text style={styles.meta}>{formatDate(item.created_at)}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* New Complaint Form Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Raise New Complaint</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.chipRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, priority === p && styles.chipActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter issue title"
              value={subject}
              onChangeText={setSubject}
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue in detail..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Attachment URL (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              value={attachmentUrl}
              onChangeText={setAttachmentUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Button
              title={submitting ? 'Submitting...' : 'SUBMIT TICKET'}
              onPress={handleSubmit}
              variant="primary"
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={!!selectedComplaint} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Complaint Detail</Text>
            <TouchableOpacity onPress={() => setSelectedComplaint(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          {detailLoading ? (
            <LoadingSpinner />
          ) : selectedComplaint ? (
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ticket ID</Text>
                <Text style={styles.detailValue}>#{selectedComplaint.ticket_id || selectedComplaint.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Badge label={selectedComplaint.status || 'OPEN'} type={statusBadge(selectedComplaint.status)} />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{selectedComplaint.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Priority</Text>
                <Text style={styles.detailValue}>{selectedComplaint.priority}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Submitted</Text>
                <Text style={styles.detailValue}>{formatDate(selectedComplaint.created_at)}</Text>
              </View>
              <Text style={styles.label}>Subject</Text>
              <Card><Text style={styles.detailValue}>{selectedComplaint.subject}</Text></Card>
              <Text style={styles.label}>Description</Text>
              <Card><Text style={styles.detailValue}>{selectedComplaint.description}</Text></Card>
              {selectedComplaint.resolution_notes ? (
                <>
                  <Text style={styles.label}>Resolution Notes</Text>
                  <Card style={styles.resolutionCard}>
                    <Text style={styles.resolutionText}>{selectedComplaint.resolution_notes}</Text>
                  </Card>
                </>
              ) : null}
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 30 },
  newBtn: {
    margin: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  ticketId: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700' },
  subject: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  meta: { fontSize: 12, color: Colors.textSecondary },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  closeBtn: { fontSize: 20, color: Colors.textSecondary, padding: 4 },
  modalBody: { padding: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 4, fontSize: 14,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  detailLabel: { fontSize: 13, color: Colors.textSecondary },
  detailValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600', flexShrink: 1 },
  resolutionCard: { borderLeftWidth: 4, borderLeftColor: Colors.accent },
  resolutionText: { fontSize: 14, color: Colors.textPrimary },
});
