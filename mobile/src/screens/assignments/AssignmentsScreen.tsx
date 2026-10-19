import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

const formatDeadline = (value?: string) => {
  if (!value) return 'No deadline set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export const AssignmentsScreen: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAssignments = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await ErpApi.getAssignments();
      const data = (response as any)?.data ?? response;
      const items = data?.assignments ?? data;
      setAssignments(Array.isArray(items) ? items : []);
      setError('');
    } catch (requestError: any) {
      setError(requestError?.message || 'Could not load assignments. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  if (loading && assignments.length === 0) {
    return <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Course Assignments"
        subtitle="Deadlines and assignment details"
        onRightPress={() => loadAssignments()}
        rightIconLabel="Refresh"
      />
      <FlatList
        data={assignments}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAssignments(true)} />}
        contentContainerStyle={assignments.length === 0 ? styles.emptyList : styles.list}
        ListHeaderComponent={error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadAssignments()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        ListEmptyComponent={!error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No assignments found</Text>
            <Text style={styles.emptyText}>New assignments for your classes will appear here.</Text>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.subject}>
                {item.subject_name || 'Subject'}{item.subject_code ? ` (${item.subject_code})` : ''}
              </Text>
              <Badge label={item.status || 'ACTIVE'} type={item.status === 'CLOSED' ? 'neutral' : 'warning'} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            <Text style={styles.meta}>Deadline: {formatDeadline(item.deadline)}</Text>
            <Text style={styles.meta}>Total marks: {item.total_marks ?? '—'}</Text>
            {item.file_url ? <Text style={styles.fileLabel}>Assignment attachment available</Text> : null}
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1 },
  list: { paddingBottom: 20 },
  emptyList: { flexGrow: 1, padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  subject: { flex: 1, fontSize: 12, fontWeight: '700', color: Colors.primary },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 6 },
  description: { fontSize: 13, lineHeight: 19, color: Colors.textSecondary, marginTop: 6 },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  fileLabel: { fontSize: 12, color: Colors.info, fontWeight: '600', marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, textAlign: 'center', color: Colors.textSecondary, marginTop: 6 },
  errorBox: { margin: 12, padding: 16, borderRadius: 10, backgroundColor: '#FEE2E2' },
  errorText: { color: '#991B1B', fontSize: 14 },
  retryText: { color: Colors.primaryDark, fontWeight: '700', marginTop: 10 },
});
