import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { PageContent } from '../../components/PageContent';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';
import { useAuthStore } from '../../store/useAuthStore';

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'ASSIGNED', 'RESOLVED'];
const MANAGE_STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const CATEGORIES = ['GENERAL', 'ACADEMIC', 'INFRASTRUCTURE', 'IT_LAB', 'LIBRARY', 'FEES', 'TRANSPORT', 'FACILITIES'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const getStatusBadge = (status: string): 'warning' | 'info' | 'success' | 'danger' | 'neutral' => {
  if (status === 'OPEN') return 'warning';
  if (status === 'IN_PROGRESS' || status === 'ASSIGNED') return 'info';
  if (status === 'RESOLVED' || status === 'CLOSED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'neutral';
};

const getPriorityBadge = (priority: string): 'danger' | 'warning' | 'neutral' => {
  if (priority === 'HIGH') return 'danger';
  if (priority === 'MEDIUM') return 'warning';
  return 'neutral';
};

export const ComplaintsScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canManageComplaints =
    user?.user_type === 'SUPER_ADMIN' ||
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.permissions?.includes('complaints.manage') ||
    ['PRINCIPAL', 'VICE_PRINCIPAL', 'COLLEGE_ADMIN', 'HOD'].includes(user?.user_type || '');

  const canCreateComplaint =
    user?.user_type === 'SUPER_ADMIN' ||
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.permissions?.includes('complaints.create') ||
    ['STUDENT', 'PARENT', 'FACULTY'].includes(user?.user_type || '');

  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Manage / update status modal state
  const [editingTicket, setEditingTicket] = useState<any | null>(null);
  const [nextStatus, setNextStatus] = useState('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const loadTickets = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await ErpApi.getComplaints();
      const items = (res as any)?.data ?? [];
      setTickets(Array.isArray(items) ? items : []);
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Alert.alert('Could not load complaints', error?.message || 'Check your connection and try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'ALL') return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: tickets.length };
    for (const t of tickets) {
      map[t.status] = (map[t.status] || 0) + 1;
    }
    return map;
  }, [tickets]);

  const handleCreate = async () => {
    if (!subject.trim() || !description.trim()) {
      setFormError('Please enter both a subject and description.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await ErpApi.createComplaint({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });
      setSubject('');
      setDescription('');
      setCategory('GENERAL');
      setPriority('MEDIUM');
      setShowCreateModal(false);
      await loadTickets(true);
      if (Platform.OS === 'web') {
        window.alert('Grievance ticket submitted successfully.');
      } else {
        Alert.alert('Ticket Submitted', 'Your grievance ticket has been raised.');
      }
    } catch (error: any) {
      setFormError(error?.message || 'Could not submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openManageModal = (ticket: any) => {
    setEditingTicket(ticket);
    setNextStatus(ticket.status || 'IN_PROGRESS');
    setResolutionNotes(ticket.resolution_notes || '');
    setUpdateError('');
  };

  const handleUpdateStatus = async () => {
    if (!editingTicket) return;
    setUpdating(true);
    setUpdateError('');
    try {
      await ErpApi.updateComplaintStatus(editingTicket.id, {
        status: nextStatus,
        resolution_notes: resolutionNotes.trim() || null,
      });
      setEditingTicket(null);
      await loadTickets(true);
    } catch (error: any) {
      setUpdateError(error?.message || 'Could not update complaint status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Grievances & Support"
        subtitle={canManageComplaints ? 'Campus Helpdesk & Resolution Desk' : 'Campus Helpdesk Tickets'}
        onRightPress={canCreateComplaint ? () => { setFormError(''); setShowCreateModal(true); } : () => loadTickets(true)}
        rightIconLabel={canCreateComplaint ? '+ New Ticket' : 'Refresh'}
      />

      {/* Status Filter Pills */}
      <View style={{ backgroundColor: Colors.cardBg, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <PageContent style={[styles.filterRow, { borderBottomWidth: 0 }]}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setStatusFilter(f)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {f.replace('_', ' ')} ({counts[f] || 0})
                </Text>
              </TouchableOpacity>
            );
          })}
        </PageContent>
      </View>

      <PageContent style={{ flex: 1 }}>
        {loading ? (
          <LoadingSpinner message="Loading grievances..." />
        ) : (
          <FlatList
            data={filteredTickets}
            keyExtractor={(item) => String(item.id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTickets(true)} colors={[Colors.primary]} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState title="No complaints found" message="There are no helpdesk tickets matching this filter." />
            }
          renderItem={({ item }) => (
            <Card style={item.priority === 'HIGH' ? { ...styles.card, ...styles.highCard } : styles.card}>
              <View style={styles.row}>
                <Text style={styles.ticketTitle}>{item.subject}</Text>
                <Badge label={String(item.status || 'OPEN').replace('_', ' ')} type={getStatusBadge(item.status)} />
              </View>

              <View style={styles.metaRow}>
                {item.category ? <Text style={styles.categoryTag}>📂 {item.category}</Text> : null}
                {item.priority ? <Badge label={item.priority} type={getPriorityBadge(item.priority)} /> : null}
              </View>

              {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
              ) : null}

              <View style={styles.footerRow}>
                <Text style={styles.metaText}>
                  👤 {item.filed_by || 'Campus Member'}{item.filer_role ? ` (${item.filer_role})` : ''}
                </Text>
                <Text style={styles.metaText}>🗓️ {String(item.created_at || item.date || '—').slice(0, 10)}</Text>
              </View>

              {item.resolution_notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Resolution / Action Notes:</Text>
                  <Text style={styles.notesText}>{item.resolution_notes}</Text>
                </View>
              ) : null}

              {canManageComplaints && (
                <TouchableOpacity style={styles.manageBtn} onPress={() => openManageModal(item)}>
                  <Text style={styles.manageBtnText}>⚙️ Update Status / Add Action Note</Text>
                </TouchableOpacity>
              )}
            </Card>
          )}
        />
      )}
      </PageContent>

      {/* Raise New Complaint Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Raise New Complaint</Text>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.pillWrap}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.modePill, category === c && styles.modePillActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.modeText, category === c && styles.modeTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.pillWrap}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.modePill, priority === p && styles.modePillActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.modeText, priority === p && styles.modeTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Subject / Issue Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief summary of the issue"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Describe your issue in detail..."
              multiline
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={Colors.textSecondary}
            />

            {!!formError && <Text style={styles.errorTxt}>{formError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCreateModal(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Button title={submitting ? 'SUBMITTING...' : 'SUBMIT TICKET'} onPress={handleCreate} loading={submitting} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Status Modal (Principal / Admin / HOD) */}
      <Modal
        visible={!!editingTicket}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingTicket(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Grievance Ticket</Text>
            {editingTicket && (
              <Text style={styles.modalSub} numberOfLines={2}>{editingTicket.subject}</Text>
            )}

            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.pillWrap}>
              {MANAGE_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.modePill, nextStatus === s && styles.modePillActive]}
                  onPress={() => setNextStatus(s)}
                >
                  <Text style={[styles.modeText, nextStatus === s && styles.modeTextActive]}>
                    {s.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Resolution / Action Notes</Text>
            <TextInput
              style={[styles.input, { height: 85, textAlignVertical: 'top' }]}
              placeholder="Enter action taken or resolution details..."
              multiline
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              placeholderTextColor={Colors.textSecondary}
            />

            {!!updateError && <Text style={styles.errorTxt}>{updateError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingTicket(null)}
                disabled={updating}
              >
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Button title={updating ? 'SAVING...' : 'SAVE UPDATE'} onPress={handleUpdateStatus} loading={updating} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  filterTextActive: { color: '#FFFFFF' },

  listContent: { paddingBottom: 24 },
  card: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  highCard: { borderLeftColor: Colors.danger },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  ticketTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  categoryTag: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  description: { fontSize: 13, color: Colors.textPrimary, marginTop: 8, lineHeight: 19 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  notesBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notesLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  notesText: { fontSize: 12, color: Colors.textPrimary, lineHeight: 17 },

  manageBtn: {
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  manageBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  emptyWrap: { alignItems: 'center', paddingVertical: 48 },
  empty: { color: Colors.textSecondary, fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  modalSub: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginTop: 10, marginBottom: 5 },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  modePillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  modeTextActive: { color: '#FFFFFF' },
  errorTxt: { color: Colors.danger, fontSize: 12, fontWeight: '600', marginTop: 10 },
  modalActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelTxt: { color: Colors.textSecondary, fontWeight: '700', fontSize: 13 },
});
