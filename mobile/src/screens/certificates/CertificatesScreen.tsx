import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

type CertificateRequest = {
  id: string;
  certificate_type: string;
  reason: string;
  status: string;
  file_url?: string | null;
  remarks?: string | null;
};

export const CertificatesScreen: React.FC = () => {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [certificateType, setCertificateType] = useState('BONAFIDE');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage('');
    try {
      const response = await ErpApi.getCertificates();
      if (!response.success) throw new Error(response.message || 'Could not load certificate requests.');
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      setRequests([]);
      setErrorMessage(error?.message || 'Could not load certificate requests. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const submitRequest = async () => {
    const type = certificateType.trim();
    const requestReason = reason.trim();
    if (!type || !requestReason) {
      Alert.alert('Required fields', 'Enter the certificate type and reason for your request.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await ErpApi.requestCertificate({ certificate_type: type, reason: requestReason });
      if (!response.success) throw new Error(response.message || 'Could not submit the certificate request.');
      setRequestModalVisible(false);
      setReason('');
      Alert.alert('Request submitted', response.message || 'Your certificate request was submitted.');
      await loadRequests(true);
    } catch (error: any) {
      Alert.alert('Request failed', error?.message || 'Could not submit the certificate request.');
    } finally {
      setSubmitting(false);
    }
  };

  const openCertificate = async (fileUrl?: string | null) => {
    if (!fileUrl) {
      Alert.alert('File unavailable', 'A signed certificate has not been attached to this request.');
      return;
    }
    try {
      await Linking.openURL(fileUrl);
    } catch {
      Alert.alert('Unable to open file', 'The certificate link could not be opened on this device.');
    }
  };

  const renderRequest = ({ item }: { item: CertificateRequest }) => {
    const statusType = item.status === 'ISSUED' || item.status === 'APPROVED'
      ? 'success'
      : item.status === 'REJECTED'
        ? 'danger'
        : item.status === 'PENDING'
          ? 'warning'
          : 'neutral';
    return (
      <Card>
        <View style={styles.row}>
          <Text style={styles.type}>{item.certificate_type}</Text>
          <Badge label={item.status} type={statusType} />
        </View>
        <Text style={styles.reason}>Reason: {item.reason}</Text>
        {!!item.remarks && <Text style={styles.remarks}>Remarks: {item.remarks}</Text>}
        {!!item.file_url && (
          <TouchableOpacity style={styles.downloadBtn} onPress={() => openCertificate(item.file_url)}>
            <Text style={styles.downloadTxt}>OPEN SIGNED CERTIFICATE</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Certificates Portal" subtitle="Apply for certificates and view request status" />
      <Card style={styles.requestCard}>
        <TouchableOpacity style={styles.requestBtn} onPress={() => setRequestModalVisible(true)}>
          <Text style={styles.requestTxt}>+ REQUEST A CERTIFICATE</Text>
        </TouchableOpacity>
      </Card>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : errorMessage ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button title="RETRY" onPress={() => loadRequests()} style={styles.retryBtn} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
          contentContainerStyle={requests.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRequests(true)} />}
          ListEmptyComponent={<Text style={styles.stateText}>No certificate requests yet.</Text>}
        />
      )}

      <Modal visible={requestModalVisible} transparent animationType="slide" onRequestClose={() => setRequestModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request a certificate</Text>
            <Text style={styles.label}>Certificate type</Text>
            <TextInput
              style={styles.input}
              value={certificateType}
              onChangeText={setCertificateType}
              placeholder="e.g. BONAFIDE"
              autoCapitalize="characters"
            />
            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={[styles.input, styles.reasonInput]}
              value={reason}
              onChangeText={setReason}
              placeholder="Explain why you need this certificate"
              multiline
              textAlignVertical="top"
            />
            <Button title="SUBMIT REQUEST" onPress={submitRequest} loading={submitting} style={styles.submitBtn} />
            <TouchableOpacity onPress={() => setRequestModalVisible(false)} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  requestCard: { padding: 14, marginBottom: 4 },
  requestBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  requestTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  type: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  reason: { fontSize: 13, color: Colors.textSecondary, marginTop: 6 },
  remarks: { fontSize: 13, color: Colors.textSecondary, marginTop: 6 },
  downloadBtn: { marginTop: 10, borderWidth: 1, borderColor: Colors.primary, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  downloadTxt: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  loader: { marginTop: 36 },
  stateBox: { alignItems: 'center', padding: 22 },
  stateText: { color: Colors.textSecondary, textAlign: 'center', marginTop: 20 },
  retryBtn: { marginTop: 14 },
  list: { padding: 16, paddingTop: 4 },
  emptyList: { flexGrow: 1, padding: 16, justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 },
  modalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  label: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, color: Colors.textPrimary },
  reasonInput: { minHeight: 90 },
  submitBtn: { marginTop: 18 },
  cancelText: { textAlign: 'center', color: Colors.textSecondary, fontWeight: '700', marginTop: 14 },
});
