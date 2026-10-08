import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const LibraryCatalogScreen: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await ErpApi.getLibraryBooks();
      if (res.data) setBooks(res.data);
    } catch {
      setBooks([
        { id: '1', title: 'Database System Concepts', author: 'Silberschatz, Korth', ISBN: '9780073523323', available_copies: 8, shelf_location: 'Rack B-4' },
        { id: '2', title: 'Clean Code: Agile Software Craftsmanship', author: 'Robert C. Martin', ISBN: '9780132350884', available_copies: 4, shelf_location: 'Rack A-2' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Library Book Catalog" subtitle="Search & Reserve Books" />
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.author}>Author: {item.author}</Text>
                <Text style={styles.isbn}>ISBN: {item.ISBN} • {item.shelf_location}</Text>
              </View>
              <Badge label={`${item.available_copies} Copies`} type={item.available_copies > 0 ? 'success' : 'danger'} />
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  author: { fontSize: 13, color: Colors.primary, marginTop: 2, fontWeight: '500' },
  isbn: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
});
