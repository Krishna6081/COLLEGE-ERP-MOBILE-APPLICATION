
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';

import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { ExamApi } from '../../api/student.api';

interface Result {
  id: string;
  exam_name?: string;
  subject_name?: string;
  subject_code?: string;
  internal_marks?: number;
  practical_marks?: number;
  theory_marks?: number;
  assignment_marks?: number;
  total_marks?: number;
  max_marks?: number;
  percentage?: number;
  grade?: string;
  grade_point?: number;
  sgpa?: number;
  cgpa?: number;
  result_status?: string;
}

export const StudentResultsScreen: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadResults = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await ExamApi.getResults();
      setResults(response.data || []);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to load results'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  if (loading) {
    return <LoadingSpinner message="Loading results..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="My Results"
        subtitle="Examination Results & Marks"
        onRightPress={() => loadResults(true)}
        rightIconLabel="Refresh"
      />

      <FlatList
        data={results}
        keyExtractor={(item, index) => String(item.id || index)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadResults(true)}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Results Available"
            message="Your examination results have not been published yet."
          />
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.examName}>
                {item.exam_name || 'Examination Result'}
              </Text>
              <Badge
                label={item.result_status || 'Published'}
                type="success"
              />
            </View>

            <Text style={styles.subject}>
              {item.subject_name || 'Subject'}
            </Text>

            {item.subject_code && (
              <Text style={styles.code}>
                Subject Code: {item.subject_code}
              </Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.heading}>Marks Details</Text>

            <View style={styles.markRow}>
              <Text style={styles.label}>Internal Marks</Text>
              <Text style={styles.value}>{item.internal_marks ?? 'N/A'}</Text>
            </View>

            <View style={styles.markRow}>
              <Text style={styles.label}>Practical Marks</Text>
              <Text style={styles.value}>{item.practical_marks ?? 'N/A'}</Text>
            </View>

            <View style={styles.markRow}>
              <Text style={styles.label}>Theory Marks</Text>
              <Text style={styles.value}>{item.theory_marks ?? 'N/A'}</Text>
            </View>

            <View style={styles.markRow}>
              <Text style={styles.label}>Assignment Marks</Text>
              <Text style={styles.value}>{item.assignment_marks ?? 'N/A'}</Text>
            </View>

            <View style={styles.markRow}>
              <Text style={styles.label}>Total Marks</Text>
              <Text style={styles.total}>
                {item.total_marks ?? 'N/A'}
                {item.max_marks != null ? ` / ${item.max_marks}` : ''}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summary}>
              <View>
                <Text style={styles.label}>Percentage</Text>
                <Text style={styles.highlight}>
                  {item.percentage != null ? `${item.percentage}%` : 'N/A'}
                </Text>
              </View>

              <View>
                <Text style={styles.label}>Grade</Text>
                <Text style={styles.highlight}>{item.grade || 'N/A'}</Text>
              </View>

              <View>
                <Text style={styles.label}>Grade Point</Text>
                <Text style={styles.highlight}>
                  {item.grade_point ?? 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.summary}>
              <View>
                <Text style={styles.label}>SGPA</Text>
                <Text style={styles.highlight}>{item.sgpa ?? 'N/A'}</Text>
              </View>

              <View>
                <Text style={styles.label}>CGPA</Text>
                <Text style={styles.highlight}>{item.cgpa ?? 'N/A'}</Text>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 12,
    paddingBottom: 25,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    marginRight: 8,
  },
  subject: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  code: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  heading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  total: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  highlight: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
});

export default StudentResultsScreen;
