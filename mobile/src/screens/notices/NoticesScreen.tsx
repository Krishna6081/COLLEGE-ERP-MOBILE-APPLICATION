import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Search, Calendar, Paperclip, Bell } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PageContent } from '../../components/PageContent';
import { Colors } from '../../constants/colors';
import { webInteractive } from '../../constants/theme';
import { ErpApi } from '../../api/erp.api';

export const NoticesScreen: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const loadNotices = async () => {
    try {
      const res = await ErpApi.getNotices();
      const items = (res as any)?.data?.notices || (res as any)?.data || [];
      setNotices(Array.isArray(items) ? items : []);
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Alert.alert('Could not load notices', error?.message || 'Check your connection and try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadNotices(); }, []);

  const filters = ['ALL', 'URGENT', 'HIGH', 'NORMAL'];

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: notices.length };
    for (const n of notices) {
      map[n.priority] = (map[n.priority] || 0) + 1;
    }
    return map;
  }, [notices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notices.filter((n) => {
      const matchesFilter = filter === 'ALL' || n.priority === filter;
      const matchesSearch = !q
        || String(n.title || '').toLowerCase().includes(q)
        || String(n.content || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [notices, filter, search]);

  const getPriorityColor = (p: string) => {
    if (p === 'URGENT') return Colors.danger;
    if (p === 'HIGH') return Colors.warning;
    return Colors.accent;
  };

  if (loading) return <LoadingSpinner message="Loading announcements..." />;

  return (
    <View style={styles.container}>
      <Header
        title="Notice Board"
        subtitle="Official Announcements & Campus Circulars"
        onRightPress={() => { setRefreshing(true); loadNotices(); }}
      />

      <PageContent style={{ flex: 1 }}>
        {/* Search & Filter Bar */}
        <View style={styles.controlsWrap}>
          <View style={styles.searchField}>
            <Search size={16} color={Colors.textMuted} strokeWidth={2.2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search announcements..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.filterRow}>
            {filters.map((f) => {
              const active = filter === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, active && styles.chipActive, webInteractive]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {f} ({counts[f] || 0})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadNotices(); }}
              colors={[Colors.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: 28, paddingTop: 4 }}
          ListEmptyComponent={
            <EmptyState
              title="No notices found"
              message={search ? 'No announcements match your search query.' : 'There are no announcements published yet.'}
              icon={<Bell size={26} color={Colors.primary} strokeWidth={1.8} />}
            />
          }
          renderItem={({ item }) => (
            <Card style={{ borderLeftWidth: 4, borderLeftColor: getPriorityColor(item.priority) }}>
              <View style={styles.noticeHeader}>
                <View style={styles.datePill}>
                  <Calendar size={13} color={Colors.primary} strokeWidth={2.2} />
                  <Text style={styles.date}>{String(item.publish_date || '').slice(0, 10)}</Text>
                </View>
                <Badge
                  label={item.priority || 'NORMAL'}
                  type={item.priority === 'URGENT' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'info'}
                />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.content}>{item.content}</Text>
              {item.attachment_url ? (
                <View style={styles.attachmentRow}>
                  <Paperclip size={13} color={Colors.accentDark} strokeWidth={2.2} />
                  <Text style={styles.attachment}>Attachment available</Text>
                </View>
              ) : null}
            </Card>
          )}
        />
      </PageContent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  controlsWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 10,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  title: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  content: { fontSize: 13.5, color: Colors.textSecondary, marginTop: 6, lineHeight: 21 },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  attachment: { fontSize: 12, color: Colors.accentDark, fontWeight: '700' },
});
