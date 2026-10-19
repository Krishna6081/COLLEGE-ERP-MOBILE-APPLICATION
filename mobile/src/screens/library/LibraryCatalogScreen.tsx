import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const LibraryCatalogScreen: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');

  const loadBooks = async (q?: string) => {
    try {
      const res = await ErpApi.getLibraryBooks(q ? { search: q } : {});
      // The API normally returns a paginated array in `data`; accept `data.books`
      // as well for older backend responses.
      const items = (res as any)?.data?.books ?? (res as any)?.data ?? [];
      setBooks(Array.isArray(items) ? items : []);
    } catch (error: any) {
      Alert.alert('Could not load books', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await ErpApi.getMyBorrowHistory();
      const items = (res as any)?.data || [];
      setHistory(Array.isArray(items) ? items : []);
    } catch (error: any) {
      Alert.alert('Could not load borrowing history', error?.message || 'Check your connection and try again.');
    }
  };

  useEffect(() => {
    loadBooks();
    loadHistory();
  }, []);

  const handleSearch = () => {
    setLoading(true);
    loadBooks(search);
  };

  const getStatusColor = (status: string) => {
    if (status === 'OVERDUE') return 'danger';
    if (status === 'ISSUED') return 'warning';
    return 'success';
  };

  if (loading && books.length === 0) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;

  return (
    <View style={styles.container}>
      <Header title="Library Catalog" subtitle="Search Books & View History" />

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'catalog' && styles.tabActive]}
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[styles.tabText, activeTab === 'catalog' && styles.tabTextActive]}>📚 Book Catalog</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>📋 My History</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'catalog' ? (
        <>
          {/* Search Bar */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              placeholderTextColor={Colors.textSecondary}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={books}
            keyExtractor={(item) => String(item.id ?? item.book_id ?? item.ISBN)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBooks(); }} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No books found</Text></View>}
            renderItem={({ item }) => (
              <Card>
                <View style={styles.bookRow}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.bookAuthor}>{item.author}</Text>
                    <Text style={styles.bookMeta}>ISBN: {item.ISBN}</Text>
                    <Text style={styles.bookMeta}>📍 {item.shelf_location || 'Not assigned'}</Text>
                  </View>
                  <View style={styles.bookRight}>
                    <Badge
                      label={item.available_copies > 0 ? `${item.available_copies} Avail.` : 'Unavailable'}
                      type={item.available_copies > 0 ? 'success' : 'danger'}
                    />
                    <Text style={styles.bookTotal}>of {item.total_copies}</Text>
                  </View>
                </View>
                {item.category_name && (
                  <Text style={styles.category}>📂 {item.category_name}</Text>
                )}
              </Card>
            )}
          />
        </>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id ?? item.issue_id)}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No borrowing history</Text></View>}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.bookAuthor}>{item.author}</Text>
                  <Text style={styles.bookMeta}>Issued: {item.issue_date} • Due: {item.due_date}</Text>
                  {item.return_date && <Text style={styles.bookMeta}>Returned: {item.return_date}</Text>}
                  {item.fine_amount > 0 && <Text style={[styles.bookMeta, { color: Colors.danger }]}>Fine: ₹{item.fine_amount}</Text>}
                </View>
                <Badge label={item.status} type={getStatusColor(item.status)} />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  searchRow: { flexDirection: 'row', margin: 12, gap: 8 },
  searchInput: {
    flex: 1, backgroundColor: Colors.cardBg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border,
  },
  searchBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  searchBtnText: { fontSize: 18 },
  bookRow: { flexDirection: 'row', alignItems: 'flex-start' },
  bookTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  bookAuthor: { fontSize: 13, color: Colors.primary, marginTop: 2, fontWeight: '500' },
  bookMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  bookRight: { alignItems: 'flex-end', gap: 4 },
  bookTotal: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  category: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  histRow: { flexDirection: 'row', alignItems: 'flex-start' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
