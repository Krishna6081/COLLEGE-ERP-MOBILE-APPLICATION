import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  Modal, ScrollView, TextInput, RefreshControl, Platform,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { LeaveApi } from '../../api/student.api';

interface LeaveType {
  id: string;
  name: string;
  code: string;
  max_days_allowed: number;
}

interface Leave {
  id: string;
  leave_type_name: string;
  leave_type_code: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver_comment?: string;
  approver_first_name?: string;
  approver_last_name?: string;
  created_at: string;
}

const statusBadge = (s: string): 'success' | 'warning' | 'danger' | 'info' => {
  if (s === 'APPROVED') return 'success';
  if (s === 'REJECTED') return 'danger';
  return 'warning';
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const LeaveApplicationScreen: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyVisible, setApplyVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected, setSelected] = useState<Leave | null>(null);

  // Form state
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [docUrl, setDocUrl] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [leavesRes, typesRes] = await Promise.all([
        LeaveApi.getMyLeaves(),
        LeaveApi.getLeaveTypes(),
      ]);
      if (leavesRes.data) setLeaves(leavesRes.data as Leave[]);
      if (typesRes.data) setLeaveTypes(typesRes.data as LeaveType[]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setSelectedTypeId('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setDocUrl('');
  };

  const validateAndSubmit = async () => {
    if (!selectedTypeId) { Alert.alert('Validation', 'Please select a leave type'); return; }
    if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Validation', 'Start date must be in YYYY-MM-DD format (e.g. 2026-11-20)');
      return;
    }
    if (!endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Validation', 'End date must be in YYYY-MM-DD format (e.g. 2026-11-22)');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      Alert.alert('Validation', 'End date cannot be before start date');
      return;
    }
    if (!reason.trim()) { Alert.alert('Validation', 'Please enter a reason for leave'); return; }

    setSubmitting(true);
    try {
      const res = await LeaveApi.applyLeave({
        leave_type_id: selectedTypeId,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
        document_url: docUrl.trim() || undefined,
      });
      Alert.alert('Success', res.message || 'Leave application submitted');
      setApplyVisible(false);
      resetForm();
      load(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading leave applications..." />;

  return (
    <View style={styles.container}>
      <Header
        title="Leave Applications"
        subtitle="Apply & Track Leave Requests"
        onRightPress={() => load(true)}
        rightIconLabel="Refresh"
      />

      {/* Apply Button */}
      <TouchableOpacity style={styles.applyTopBtn} onPress={() => setApplyVisible(true)}>
        <Text style={styles.applyTopBtnTxt}>+ APPLY FOR LEAVE</Text>
      </TouchableOpacity>

      <FlatList
        data={leaves}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <EmptyState title="No Leave Applications" message="You have not applied for any leave yet." />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setSelected(item); setDetailVisible(true); }} activeOpacity={0.8}>
            <Card>
              <View style={styles.row}>
                <Text style={styles.leaveType}>{item.leave_type_name}</Text>
                <Badge label={item.status} type={statusBadge(item.status)} />
              </View>
              <Text style={styles.dates}>
                📅 {fmtDate(item.start_date)} → {fmtDate(item.end_date)} ({item.total_days} day{item.total_days !== 1 ? 's' : ''})
              </Text>
              <Text style={styles.reason} numberOfLines={2}>{item.reason}</Text>
              <Text style={styles.appliedOn}>Applied: {fmtDate(item.created_at)}</Text>
              {item.status !== 'PENDING' && item.approver_comment && (
                <View style={styles.remarkBox}>
                  <Text style={styles.remarkLbl}>
                    {item.status === 'APPROVED' ? '✅' : '❌'} Approver Remark:
                  </Text>
                  <Text style={styles.remarkTxt}>{item.approver_comment}</Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Apply Modal */}
      <Modal visible={applyVisible} animationType="slide" transparent onRequestClose={() => { setApplyVisible(false); resetForm(); }}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalBox}>
            <Text style={styles.modalTitle}>Apply for Leave</Text>

            <Text style={styles.inputLabel}>Leave Type *</Text>
            <View style={styles.typeGrid}>
              {leaveTypes.map((lt) => (
                <TouchableOpacity
                  key={lt.id}
                  style={[styles.typeChip, selectedTypeId === lt.id && styles.typeChipActive]}
                  onPress={() => setSelectedTypeId(lt.id)}
                >
                  <Text style={[styles.typeChipTxt, selectedTypeId === lt.id && styles.typeChipTxtActive]}>
                    {lt.name}
                  </Text>
                </TouchableOpacity>
              ))}
              {leaveTypes.length === 0 && (
                <Text style={styles.noTypeTxt}>No leave types available. Contact admin.</Text>
              )}
            </View>

            <Text style={styles.inputLabel}>Start Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-11-20"
              value={startDate}
              onChangeText={setStartDate}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.inputLabel}>End Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-11-22"
              value={endDate}
              onChangeText={setEndDate}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.inputLabel}>Reason for Leave *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Explain the reason for your leave request..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Supporting Document URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://drive.google.com/..."
              value={docUrl}
              onChangeText={setDocUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => { setApplyVisible(false); resetForm(); }}
                style={styles.halfBtn}
              />
              <Button
                title="Submit"
                onPress={validateAndSubmit}
                loading={submitting}
                style={styles.halfBtn}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={detailVisible} animationType="slide" transparent onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalBox}>
            <Text style={styles.modalTitle}>Leave Details</Text>
            {selected && (
              <>
                <Badge label={selected.status} type={statusBadge(selected.status)} />
                <View style={styles.detailGrid}>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Leave Type</Text><Text style={styles.detailVal}>{selected.leave_type_name}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>From</Text><Text style={styles.detailVal}>{fmtDate(selected.start_date)}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>To</Text><Text style={styles.detailVal}>{fmtDate(selected.end_date)}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Total Days</Text><Text style={styles.detailVal}>{selected.total_days}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Applied On</Text><Text style={styles.detailVal}>{fmtDate(selected.created_at)}</Text></View>
                  {selected.approver_first_name && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reviewed By</Text>
                      <Text style={styles.detailVal}>{selected.approver_first_name} {selected.approver_last_name}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.inputLabel}>Reason</Text>
                <Text style={styles.descTxt}>{selected.reason}</Text>
                {selected.approver_comment && (
                  <>
                    <Text style={styles.inputLabel}>Approver Remark</Text>
                    <Text style={[styles.descTxt, { color: selected.status === 'APPROVED' ? Colors.accent : Colors.danger }]}>
                      {selected.approver_comment}
                    </Text>
                  </>
                )}
                <Button title="Close" onPress={() => setDetailVisible(false)} style={{ marginTop: 16 }} />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 24 },
  applyTopBtn: {
    backgroundColor: Colors.primary, marginHorizontal: 16, marginVertical: 12,
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  applyTopBtnTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaveType: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  dates: { fontSize: 13, color: Colors.primary, marginTop: 4, fontWeight: '600' },
  reason: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  appliedOn: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  remarkBox: { backgroundColor: Colors.surface, borderRadius: 8, padding: 8, marginTop: 8 },
  remarkLbl: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  remarkTxt: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 4, fontSize: 14,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipTxt: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  typeChipTxtActive: { color: '#FFFFFF' },
  noTypeTxt: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  halfBtn: { flex: 1 },
  detailGrid: { marginVertical: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel: { fontSize: 13, color: Colors.textSecondary },
  detailVal: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  descTxt: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20, marginBottom: 6 },
});
