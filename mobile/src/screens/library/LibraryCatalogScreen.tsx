import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { BookOpen, History, Search, MapPin, Folder, User } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { PageContent } from '../../components/PageContent';
import { Colors } from '../../constants/colors';
import { webInteractive } from '../../constants/theme';
import { ErpApi } from '../../api/erp.api';
import { useAuthStore } from '../../store/useAuthStore';

export const LibraryCatalogScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isLibraryManager =
    user?.user_type === 'LIBRARIAN' ||
    user?.user_type === 'COLLEGE_ADMIN' ||
    user?.user_type === 'SUPER_ADMIN';

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');

  const loadBooks = async (q?: string) => {
    try {
      const res = await ErpApi.getLibraryBooks(q ? { search: q, limit: 50 } : { limit: 50 });
      const items = (res as any)?.data?.books ?? (res as any)?.data ?? [];
      setBooks(Array.isArray(items) ? items : []);
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Alert.alert('Could not load books', error?.message || 'Check your connection and try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = isLibraryManager
        ? await ErpApi.getIssuedBooks({ limit: 50 })
        : await ErpApi.getMyBorrowHistory();
      const items = (res as any)?.data?.issues ?? (res as any)?.data ?? [];
      setHistory(Array.isArray(items) ? items : []);
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Alert.alert('Could not load borrowing history', error?.message || 'Check your connection and try again.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBooks();
    loadHistory();
  }, [isLibraryManager]);

  const handleSearch = () => {
    setLoading(true);
    loadBooks(search);
  };

  const getStatusColor = (status: string): 'danger' | 'warning' | 'success' => {
    if (status === 'OVERDUE') return 'danger';
    if (status === 'ISSUED') return 'warning';
    return 'success';
  };

  if (loading && books.length === 0) return <LoadingSpinner message="Loading library catalog..." />;

  return (
    <View style={styles.container}>
      <Header
        title="Library Catalog"
        subtitle={isLibraryManager ? 'Book Inventory & Student Borrowing History' : 'Search Books & View Borrowing History'}
        onRightPress={() => { setRefreshing(true); loadBooks(search); loadHistory(); }}
      />

      {/* Tabs */}
      <View style={styles.tabBarWrap}>
        <PageContent style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'catalog' && styles.tabActive, webInteractive]}
            onPress={() => setActiveTab('catalog')}
          >
            <BookOpen size={16} color={activeTab === 'catalog' ? Colors.primary : Colors.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.tabText, activeTab === 'catalog' && styles.tabTextActive]}>
              Book Catalog ({books.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive, webInteractive]}
            onPress={() => setActiveTab('history')}
          >
            <History size={16} color={activeTab === 'history' ? Colors.primary : Colors.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              {isLibraryManager ? `Student History (${history.length})` : `My History (${history.length})`}
            </Text>
          </TouchableOpacity>
        </PageContent>
      </View>

      <PageContent style={{ flex: 1 }}>
        {activeTab === 'catalog' ? (
          <>
            {/* Search Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchField}>
                <Search size={17} color={Colors.textMuted} strokeWidth={2.2} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by title, author, or ISBN..."
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={handleSearch}
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="search"
                />
              </View>
              <TouchableOpacity style={[styles.searchBtn, webInteractive]} onPress={handleSearch}>
                <Search size={17} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={books}
              keyExtractor={(item) => String(item.id ?? item.book_id ?? item.ISBN)}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => { setRefreshing(true); loadBooks(search); }}
                  colors={[Colors.primary]}
                />
              }
              contentContainerStyle={{ paddingBottom: 28 }}
              ListEmptyComponent={
                <EmptyState
                  title="No books found"
                  message="Try searching with a different title, author, or ISBN."
                  icon={<BookOpen size={26} color={Colors.primary} />}
                />
              }
              renderItem={({ item }) => (
                <Card>
                  <View style={styles.bookRow}>
                    <View style={styles.bookIconTile}>
                      <BookOpen size={20} color={Colors.primary} strokeWidth={2.1} />
                    </View>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.bookAuthor}>{item.author}</Text>
                      <Text style={styles.bookMeta}>ISBN: {item.ISBN}{item.edition ? `  •  ${item.edition}` : ''}</Text>
                      <View style={styles.metaInlineRow}>
                        <View style={styles.metaChip}>
                          <MapPin size={12} color={Colors.textSecondary} />
                          <Text style={styles.metaChipText}>{item.shelf_location || 'Not assigned'}</Text>
                        </View>
                        {item.category_name ? (
                          <View style={styles.metaChip}>
                            <Folder size={12} color={Colors.secondary} />
                            <Text style={[styles.metaChipText, { color: Colors.secondary }]}>{item.category_name}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.bookRight}>
                      <Badge
                        label={item.available_copies > 0 ? `${item.available_copies} Avail.` : 'Unavailable'}
                        type={item.available_copies > 0 ? 'success' : 'danger'}
                      />
                      <Text style={styles.bookTotal}>of {item.total_copies} copies</Text>
                    </View>
                  </View>
                </Card>
              )}
            />
          </>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => String(item.id ?? item.issue_id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadHistory(); }}
                colors={[Colors.primary]}
              />
            }
            contentContainerStyle={{ paddingBottom: 28, paddingTop: 6 }}
            ListEmptyComponent={
              <EmptyState
                title="No borrowing history"
                message="Issued and returned book records will appear here."
                icon={<History size={26} color={Colors.primary} />}
              />
            }
            renderItem={({ item }) => (
              <Card
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor:
                    item.status === 'OVERDUE' ? Colors.danger
                    : item.status === 'ISSUED' ? Colors.warning
                    : Colors.accent,
                }}
              >
                <View style={styles.histRow}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.bookTitle} numberOfLines={2}>{item.title || item.book_title}</Text>
                    <Text style={styles.bookAuthor}>{item.author}</Text>
                    {(item.first_name || item.last_name) && (
                      <View style={styles.studentRow}>
                        <User size={13} color={Colors.primary} strokeWidth={2.2} />
                        <Text style={styles.studentText}>
                          {item.first_name} {item.last_name}
                          {item.enrollment_number ? ` (${item.enrollment_number})` : ''}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.bookMeta}>Issued: {item.issue_date}  •  Due: {item.due_date}</Text>
                    {item.return_date ? <Text style={styles.bookMeta}>Returned: {item.return_date}</Text> : null}
                    {Number(item.fine_amount) > 0 && (
                      <Text style={[styles.bookMeta, { color: Colors.danger, fontWeight: '700' }]}>
                        Fine: ₹{item.fine_amount}
                      </Text>
                    )}
                  </View>
                  <Badge label={item.status} type={getStatusColor(item.status)} />
                </View>
              </Card>
            )}
          />
        )}
      </PageContent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabBarWrap: {
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabRow: { flexDirection: 'row' },
  tab: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13.5, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, gap: 10 },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    height: 46,
    justifyContent: 'center',
  },
  searchBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  bookRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  bookIconTile: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bookTitle: { fontSize: 15.5, fontWeight: '800', color: Colors.textPrimary },
  bookAuthor: { fontSize: 13, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  bookMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  metaInlineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaChipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  bookRight: { alignItems: 'flex-end', gap: 5 },
  bookTotal: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  histRow: { flexDirection: 'row', alignItems: 'flex-start' },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  studentText: { fontSize: 12.5, color: Colors.primary, fontWeight: '700' },
});
