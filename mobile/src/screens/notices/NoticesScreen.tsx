import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  Modal, ScrollView, RefreshControl, TextInput, Linking,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { NoticeApi } from '../../api/student.api';

interface Notice {
  id: string;
  title: string;
  content: string;
  target_audience: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  publish_date: string;
  expiry_date?: string;
  attachment_url?: string;
  status: string;
}

const priorityBadge = (p: string): 'success' | 'warning' | 'danger' | 'info' => {
  if (p === 'URGENT') return 'danger';
  if (p === 'HIGH') return 'warning';
  if (p === 'NORMAL') return 'info';
  return 'success';
};

const priorityBorderColor = (p: string): string => {
  if (p === 'URGENT') return Colors.danger;
  if (p === 'HIGH') return Colors.warning;
  return Colors.border;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const NoticesScreen: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Notice | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  
const load = useCallback(async (isRefresh = false) => {
  if (isRefresh) setRefreshing(true);
  else setLoading(true);

  try {
    const response: any = await NoticeApi.getNotices();

    console.log(
      'NOTICE API RESPONSE:',
      JSON.stringify(response, null, 2)
    );

    // Handle different API response structures
    const payload = response?.data ?? response;

    const noticeData = Array.isArray(payload)
      ? payload
      : payload?.data;

    if (Array.isArray(noticeData)) {
      setNotices(noticeData);
    } else {
      console.log('Invalid notice data:', payload);
      setNotices([]);
    }

  } catch (error: any) {
    console.log('Notice loading error:', error);
    Alert.alert(
      'Error',
      error?.response?.data?.message ||
      error?.message ||
      'Failed to load notices'
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);


  useEffect(() => { load(); }, [load]);

  const filtered = notices.filter(
    (n) =>
      n.status === 'PUBLISHED' &&
      (n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAttachment = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot Open', 'Unable to open the attachment.');
    } catch {
      Alert.alert('Error', 'Failed to open the attachment.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading notices..." />;

  return (
    <View style={styles.container}>
      <Header
        title="Notice Board"
        subtitle="Official Announcements & Circulars"
        onRightPress={() => load(true)}
        rightIconLabel="Refresh"
      />

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Search notices..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <EmptyState title="No Notices" message={search ? 'No notices match your search.' : 'No published notices at the moment.'} />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => { setSelected(item); setDetailVisible(true); }}
            activeOpacity={0.8}
          >
            <Card style={[styles.noticeCard, { borderLeftColor: priorityBorderColor(item.priority), borderLeftWidth: 4 }]}>
              <View style={styles.row}>
                <Text style={styles.date}>{fmtDate(item.publish_date)}</Text>
                <Badge label={item.priority} type={priorityBadge(item.priority)} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
              <View style={styles.footer}>
                <Text style={styles.audience}>For: {item.target_audience}</Text>
                {item.attachment_url && <Text style={styles.attachIcon}>📎 Attachment</Text>}
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={detailVisible} animationType="slide" transparent onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalBox} showsVerticalScrollIndicator={false}>
            {selected && (
              <>
                <View style={styles.row}>
                  <Badge label={selected.priority} type={priorityBadge(selected.priority)} />
                  <Text style={styles.modalDate}>{fmtDate(selected.publish_date)}</Text>
                </View>
                <Text style={styles.modalTitle}>{selected.title}</Text>
                <Text style={styles.modalAudience}>Audience: {selected.target_audience}</Text>
                <View style={styles.divider} />
                <Text style={styles.modalContent}>{selected.content}</Text>

                {selected.expiry_date && (
                  <Text style={styles.expiry}>Expires: {fmtDate(selected.expiry_date)}</Text>
                )}

                {selected.attachment_url && (
                  <TouchableOpacity
                    style={styles.attachBtn}
                    onPress={() => handleAttachment(selected.attachment_url!)}
                  >
                    <Text style={styles.attachBtnTxt}>📎 View / Download Attachment</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailVisible(false)}>
                  <Text style={styles.closeBtnTxt}>Close</Text>
                </TouchableOpacity>
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
  searchWrap: { marginHorizontal: 16, marginVertical: 10 },
  searchInput: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: Colors.textPrimary,
  },
  noticeCard: { marginVertical: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  date: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  content: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  audience: { fontSize: 11, color: Colors.textSecondary },
  attachIcon: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalDate: { fontSize: 12, color: Colors.textSecondary },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginVertical: 10 },
  modalAudience: { fontSize: 12, color: Colors.textSecondary, marginBottom: 10 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  modalContent: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24 },
  expiry: { fontSize: 12, color: Colors.warning, marginTop: 12 },
  attachBtn: {
    marginTop: 16, backgroundColor: Colors.primary,
    paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  attachBtnTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  closeBtn: {
    marginTop: 10, borderWidth: 1.5, borderColor: Colors.border,
    paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  closeBtnTxt: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
});
