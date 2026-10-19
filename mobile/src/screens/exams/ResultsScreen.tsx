import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

const parseSubjectMarks = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const ResultsScreen: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadResults = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await ErpApi.getResults();
      const data = (response as any)?.data ?? response;
      setResults(Array.isArray(data) ? data : []);
      setError('');
    } catch (requestError: any) {
      setError(requestError?.message || 'Could not load results. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  if (loading && results.length === 0) {
    return <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Examination Results"
        subtitle="Published academic results"
        onRightPress={() => loadResults()}
        rightIconLabel="Refresh"
      />
      <ScrollView
        contentContainerStyle={results.length === 0 ? styles.emptyList : styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadResults(true)} />}
      >
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadResults()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && !loading && results.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No published results</Text>
            <Text style={styles.emptyText}>Published results will appear here.</Text>
          </View>
        )}

        {results.map((result) => {
          const subjectMarks = parseSubjectMarks(result.subject_marks);
          const status = String(result.result_status || 'PUBLISHED');
          const badgeType = status === 'PASS' ? 'success' : status === 'FAIL' || status === 'WITHHELD' ? 'danger' : 'info';
          return (
            <Card key={String(result.id)} style={styles.resultCard}>
              <Text style={styles.semester}>{result.exam_name || 'Examination'}</Text>
              <Text style={styles.examMeta}>{result.semester_name || ''}{result.exam_type ? ` · ${result.exam_type}` : ''}</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{result.sgpa ?? '—'}</Text>
                  <Text style={styles.summaryLabel}>SGPA</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{result.percentage ?? '—'}{result.percentage != null ? '%' : ''}</Text>
                  <Text style={styles.summaryLabel}>Percentage</Text>
                </View>
                <Badge label={status} type={badgeType} />
              </View>

              {subjectMarks.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>SUBJECT MARKS</Text>
                  {subjectMarks.map((subject, index) => (
                    <View key={`${result.id}-${index}`} style={styles.subjectRow}>
                      <Text style={styles.subjectName}>{subject.subject || 'Subject'}</Text>
                      <Text style={styles.subjectMarks}>
                        {subject.absent ? 'Absent' : `${subject.marks ?? '—'} / ${subject.max ?? '—'}`}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1 },
  scroll: { paddingBottom: 20 },
  emptyList: { flexGrow: 1, padding: 12 },
  resultCard: { paddingVertical: 18 },
  semester: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  examMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: Colors.primaryDark },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, marginTop: 18, marginBottom: 7 },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: 8 },
  subjectName: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  subjectMarks: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginLeft: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, textAlign: 'center', color: Colors.textSecondary, marginTop: 6 },
  errorBox: { margin: 12, padding: 16, borderRadius: 10, backgroundColor: '#FEE2E2' },
  errorText: { color: '#991B1B', fontSize: 14 },
  retryText: { color: Colors.primaryDark, fontWeight: '700', marginTop: 10 },
});
