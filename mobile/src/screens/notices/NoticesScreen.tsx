import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const NoticesScreen: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  const loadNotices = async () => {
    try {
      const res = await ErpApi.getNotices();
      const items = (res as any)?.data?.notices || (res as any)?.data || [];
      setNotices(Array.isArray(items) ? items : []);
    } catch (error: any) {
      Alert.alert('Could not load notices', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadNotices(); }, []);

  const filters = ['ALL', 'URGENT', 'HIGH', 'NORMAL'];

  const filtered = filter === 'ALL'
    ? notices
    : notices.filter((n) => n.priority === filter);

  const getPriorityColor = (p: string) => {
    if (p === 'URGENT') return Colors.danger;
    if (p === 'HIGH') return Colors.warning;
    return Colors.info;
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;

  return (
    <View style={styles.container}>
      <Header title="Notice Board" subtitle="Official Announcements & Circulars" />

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotices(); }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notices found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={item.priority === 'URGENT' || item.priority === 'HIGH'
            ? { borderLeftWidth: 4, borderLeftColor: getPriorityColor(item.priority) }
            : {}
          }>
            <View style={styles.noticeHeader}>
              <Text style={styles.date}>📅 {item.publish_date}</Text>
              <Badge
                label={item.priority}
                type={item.priority === 'URGENT' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'info'}
              />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
            {item.attachment_url && (
              <Text style={styles.attachment}>📎 Attachment available</Text>
            )}
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
    gap: 8, backgroundColor: Colors.cardBg,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  noticeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 6 },
  content: { fontSize: 13, color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },
  attachment: { fontSize: 12, color: Colors.info, marginTop: 8, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
