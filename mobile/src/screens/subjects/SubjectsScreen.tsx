
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';

import { apiClient } from '../../api/client';
import { Colors } from '../../constants/colors';

interface Subject {
  id: string;
  name: string;
  subject_code?: string;
  subject_type?: string;
  credits?: number;
  faculty_name?: string;
}

export default function SubjectsScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const response: any = await apiClient.get('/subjects/my-subjects');

      const records = Array.isArray(response?.data)
        ? response.data
        : response?.data?.subjects || [];

      setSubjects(records);
    } catch (error: any) {
      console.error('Subjects API Error:', error);

      Alert.alert(
        'Error',
        error?.message || 'Unable to load subjects. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const renderSubject = ({ item, index }: { item: Subject; index: number }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.subjectIcon}>
          <Text style={styles.subjectIconText}>📚</Text>
        </View>

        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{item.name}</Text>
          <Text style={styles.subjectCode}>
            {item.subject_code || 'Code not available'}
          </Text>
        </View>

        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Subject Type</Text>
          <Text style={styles.detailValue}>
            {item.subject_type || 'N/A'}
          </Text>
        </View>

        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Credits</Text>
          <Text style={styles.detailValue}>
            {item.credits ?? 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.facultyBox}>
        <Text style={styles.facultyLabel}>Faculty</Text>
        <Text style={styles.facultyValue}>
          {item.faculty_name || 'Not Assigned'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#0C2466" barStyle="light-content" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your subjects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0C2466" barStyle="light-content" />

      {/* Page Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>My Subjects</Text>
        <Text style={styles.subtitle}>
          View subjects assigned to your semester
        </Text>

        <View style={styles.countContainer}>
          <Text style={styles.countNumber}>{subjects.length}</Text>
          <Text style={styles.countLabel}>Total Subjects</Text>
        </View>
      </View>

      {/* Subject List */}
      <FlatList
        data={subjects}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderSubject}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No Subjects Found</Text>
            <Text style={styles.emptyText}>
              No subjects have been assigned to your semester yet.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },

  header: {
    backgroundColor: '#0C2466',
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
  },

  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 13,
    color: '#D6E0FF',
    marginTop: 6,
  },

  countContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  countNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  countLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 35,
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9EDF5',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  subjectIconText: {
    fontSize: 23,
  },

  subjectInfo: {
    flex: 1,
    marginLeft: 12,
  },

  subjectName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C2466',
  },

  subjectCode: {
    fontSize: 12,
    color: '#7B8498',
    marginTop: 4,
  },

  numberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8EDFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  numberText: {
    color: '#0C2466',
    fontSize: 12,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1F7',
    marginVertical: 15,
  },

  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  detailBox: {
    flex: 1,
    backgroundColor: '#F5F7FC',
    padding: 12,
    borderRadius: 12,
  },

  detailLabel: {
    fontSize: 11,
    color: '#7B8498',
    fontWeight: '600',
  },

  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
    marginTop: 5,
  },

  facultyBox: {
    marginTop: 12,
    backgroundColor: '#F5F7FC',
    padding: 12,
    borderRadius: 12,
  },

  facultyLabel: {
    fontSize: 11,
    color: '#7B8498',
    fontWeight: '600',
  },

  facultyValue: {
    fontSize: 13,
    color: '#0C2466',
    fontWeight: '700',
    marginTop: 5,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0C2466',
  },

  emptyText: {
    fontSize: 13,
    color: '#7B8498',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
