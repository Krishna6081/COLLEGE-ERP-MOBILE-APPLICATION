import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  Modal, ScrollView, RefreshControl, Linking, TextInput,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { CertificateApi } from '../../api/student.api';

interface CertRequest {
  id: string;
  certificate_type: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED';
  file_url?: string;
  remarks?: string;
  approved_by_name?: string;
  approved_by_last?: string;
  created_at: string;
  updated_at: string;
}

const CERT_TYPES = [
  'Bonafide Certificate',
  'Leaving Certificate',
  'Character Certificate',
  'Fee Certificate',
  'Migration Certificate',
  'Other',
];

const statusBadge = (s: string): 'success' | 'warning' | 'danger' | 'info' => {
  if (s === 'ISSUED') return 'success';
  if (s === 'APPROVED') return 'info';
  if (s === 'REJECTED') return 'danger';
  return 'warning';
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const CertificatesScreen: React.FC = () => {
  const [requests, setRequests] = useState<CertRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyVisible, setApplyVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected, setSelected] = useState<CertRequest | null>(null);
  const [certType, setCertType] = useState('');
  const [reason, setReason] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await CertificateApi.getRequests();
      if (res.data) setRequests(res.data as CertRequest[]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load certificate requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!certType) { Alert.alert('Validation', 'Please select a certificate type'); return; }
    if (!reason.trim() || reason.trim().length < 10) {
      Alert.alert('Validation', 'Please enter a detailed reason (at least 10 characters)');
      return;
    }
    setSubmitting(true);
    try {
      const res = await CertificateApi.requestCertificate({ certificate_type: certType, reason: reason.trim() });
      Alert.alert('Success', res.message || 'Certificate request submitted successfully');
      setApplyVisible(false);
      setCertType('');
      setReason('');
      load(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot Open', 'Unable to open the certificate URL.');
    } catch {
      Alert.alert('Error', 'Failed to open the certificate link.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading certificates..." />;

  return (
    <View style={styles.container}>
      <Header
        title="Certificates Portal"
        subtitle="Apply & Download Digital Certificates"
        onRightPress={() => load(true)}
        rightIconLabel="Refresh"
      />

      <TouchableOpacity style={styles.applyBtn} onPress={() => setApplyVisible(true)}>
        <Text style={styles.applyBtnTxt}>+ REQUEST NEW CERTIFICATE</Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
        ListEmptyComponent={<EmptyState title="No Certificate Requests" message="You have not applied for any certificates yet." />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setSelected(item); setDetailVisible(true); }} activeOpacity={0.8}>
            <Card>
              <View style={styles.row}>
                <Text style={styles.certType}>{item.certificate_type}</Text>
                <Badge label={item.status} type={statusBadge(item.status)} />
              </View>
              <Text style={styles.reason} numberOfLines={2}>Reason: {item.reason}</Text>
              <Text style={styles.meta}>Applied: {fmtDate(item.created_at)}</Text>
              {item.status === 'ISSUED' && item.file_url && (
                <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(item.file_url!)}>
                  <Text style={styles.downloadBtnTxt}>⬇️ DOWNLOAD CERTIFICATE</Text>
                </TouchableOpacity>
              )}
              {item.status === 'APPROVED' && (
                <View style={styles.approvedBox}>
                  <Text style={styles.approvedTxt}>✅ Approved – Certificate being prepared</Text>
                </View>
              )}
              {item.remarks && item.status === 'REJECTED' && (
                <View style={styles.rejectedBox}>
                  <Text style={styles.rejectedTxt}>❌ {item.remarks}</Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Apply Modal */}
      <Modal visible={applyVisible} animationType="slide" transparent onRequestClose={() => setApplyVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalBox} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Request Certificate</Text>
            <Text style={styles.inputLabel}>Certificate Type *</Text>
            {CERT_TYPES.map((ct) => (
              <TouchableOpacity
                key={ct}
                style={[styles.certOption, certType === ct && styles.certOptionActive]}
                onPress={() => setCertType(ct)}
              >
                <Text style={[styles.certOptionTxt, certType === ct && styles.certOptionTxtActive]}>{ct}</Text>
                {certType === ct && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
            <Text style={styles.inputLabel}>Reason / Purpose *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. Required for bank account opening, scholarship application..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.btnsRow}>
              <Button title="Cancel" variant="outline" onPress={() => { setApplyVisible(false); setCertType(''); setReason(''); }} style={styles.halfBtn} />
              <Button title="Submit" onPress={handleSubmit} loading={submitting} style={styles.halfBtn} />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={detailVisible} animationType="slide" transparent onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalBox} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Certificate Details</Text>
            {selected && (
              <>
                <Badge label={selected.status} type={statusBadge(selected.status)} />
                <Text style={styles.detailCertName}>{selected.certificate_type}</Text>
                <View style={styles.infoGrid}>
                  <InfoRow label="Applied On" value={fmtDate(selected.created_at)} />
                  <InfoRow label="Last Updated" value={fmtDate(selected.updated_at)} />
                  {selected.approved_by_name && (
                    <InfoRow label="Reviewed By" value={`${selected.approved_by_name} ${selected.approved_by_last || ''}`} />
                  )}
                </View>
                <Text style={styles.sectionLbl}>Reason</Text>
                <Text style={styles.descTxt}>{selected.reason}</Text>
                {selected.remarks && (
                  <>
                    <Text style={styles.sectionLbl}>Admin Remarks</Text>
                    <Text style={[styles.descTxt, { color: selected.status === 'REJECTED' ? Colors.danger : Colors.accent }]}>
                      {selected.remarks}
                    </Text>
                  </>
                )}
                {selected.status === 'ISSUED' && selected.file_url && (
                  <Button title="⬇️ Download Certificate" onPress={() => handleDownload(selected.file_url!)} style={{ marginTop: 12 }} />
                )}
                <Button title="Close" variant="outline" onPress={() => setDetailVisible(false)} style={{ marginTop: 8 }} />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={infoStyles.row}>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={infoStyles.value}>{value}</Text>
  </View>
);
const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: 13, color: Colors.textSecondary },
  value: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 24 },
  applyBtn: {
    backgroundColor: Colors.primary, marginHorizontal: 16, marginVertical: 12,
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  applyBtnTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  certType: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  reason: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  meta: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  downloadBtn: { marginTop: 10, backgroundColor: Colors.primary, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  downloadBtnTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  approvedBox: { backgroundColor: '#D1FAE5', borderRadius: 8, padding: 8, marginTop: 8 },
  approvedTxt: { fontSize: 12, color: '#065F46', fontWeight: '600' },
  rejectedBox: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 8, marginTop: 8 },
  rejectedTxt: { fontSize: 12, color: '#991B1B', fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 8 },
  certOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 6, backgroundColor: Colors.surface,
  },
  certOptionActive: { borderColor: Colors.primary, backgroundColor: '#EEF2FF' },
  certOptionTxt: { fontSize: 14, color: Colors.textSecondary },
  certOptionTxtActive: { color: Colors.primary, fontWeight: '700' },
  checkmark: { color: Colors.primary, fontWeight: '800', fontSize: 16 },
  textArea: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, height: 100, textAlignVertical: 'top', marginBottom: 12,
  },
  btnsRow: { flexDirection: 'row', gap: 10 },
  halfBtn: { flex: 1 },
  detailCertName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginVertical: 10 },
  infoGrid: { marginVertical: 8 },
  sectionLbl: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginTop: 10, marginBottom: 4 },
  descTxt: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
});
