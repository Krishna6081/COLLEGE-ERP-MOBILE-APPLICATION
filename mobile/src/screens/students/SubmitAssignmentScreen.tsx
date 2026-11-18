
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';

import { apiClient } from '../../api/client';
import { Colors } from '../../constants/colors';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  attachment_url?: string;
  total_marks?: number;
  deadline?: string;
  assignment_status?: string;
  subject_name?: string;
  subject_code?: string;
  faculty_first_name?: string;
  faculty_last_name?: string;
  submission_id?: string;
  submission_url?: string;
  submission_text?: string;
  submission_status?: string;
  display_status?: string;
  marks_obtained?: number | string;
  feedback?: string;
}

export default function SubmitAssignmentScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState('');

  const [submissionLinks, setSubmissionLinks] = useState<
    Record<string, string>
  >({});

  const [submissionTexts, setSubmissionTexts] = useState<
    Record<string, string>
  >({});

  // Fetch assignments
  const fetchAssignments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response: any = await apiClient.get('/assignments');

      const records = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data?.assignments)
            ? response.data.assignments
            : [];

      setAssignments(records);
    } catch (error: any) {
      console.error('Assignments API Error:', error);

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          'Unable to load assignments.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Submit assignment
  const submitAssignment = async (assignmentId: string) => {
    const link = submissionLinks[assignmentId]?.trim();
    const submissionText = submissionTexts[assignmentId]?.trim();

    if (!link) {
      Alert.alert(
        'Required',
        'Please enter your assignment file URL.'
      );
      return;
    }

    // Validate URL
    if (!/^https?:\/\/\S+/i.test(link)) {
      Alert.alert(
        'Invalid URL',
        'Please enter a valid HTTP or HTTPS link.'
      );
      return;
    }

    try {
      setSubmittingId(assignmentId);

      await apiClient.post('/assignments/submit', {
        assignment_id: assignmentId,
        file_url: link,
        submission_text: submissionText || '',
      });

      Alert.alert(
        'Success',
        'Assignment submitted successfully!'
      );

      setSubmissionLinks(prev => ({
        ...prev,
        [assignmentId]: '',
      }));

      setSubmissionTexts(prev => ({
        ...prev,
        [assignmentId]: '',
      }));

      await fetchAssignments(true);
    } catch (error: any) {
      console.error('Assignment Submission Error:', error);

      Alert.alert(
        'Submission Failed',
        error?.response?.data?.message ||
          'Unable to submit assignment.'
      );
    } finally {
      setSubmittingId('');
    }
  };

  // Loading screen
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />
        <Text style={styles.loadingText}>
          Loading assignments...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          Submit Assignments
        </Text>

        <Text style={styles.subtitle}>
          View and submit your assignments
        </Text>
      </View>

      <FlatList
        data={assignments}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAssignments(true)}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={
          assignments.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>
              No Assignments Available
            </Text>
            <Text style={styles.emptyText}>
              Your assignments will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSubmitted = !!item.submission_id;
          const isClosed =
            item.assignment_status?.toUpperCase() === 'CLOSED';

          const isSubmitting = submittingId === item.id;

          return (
            <View style={styles.card}>
              {/* Assignment Header */}
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <Text style={styles.assignmentTitle}>
                    {item.title}
                  </Text>

                  {!!item.subject_code && (
                    <Text style={styles.subjectCode}>
                      {item.subject_code}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isClosed
                      ? styles.closedBadge
                      : isSubmitted
                        ? styles.submittedBadge
                        : styles.pendingBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isClosed
                        ? styles.closedBadgeText
                        : isSubmitted
                          ? styles.submittedBadgeText
                          : styles.pendingBadgeText,
                    ]}
                  >
                    {item.display_status ||
                      (isClosed
                        ? 'CLOSED'
                        : isSubmitted
                          ? 'SUBMITTED'
                          : 'PENDING')}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Assignment Details */}
              <Text style={styles.detail}>
                <Text style={styles.label}>Subject: </Text>
                {item.subject_name || 'N/A'}
              </Text>

              <Text style={styles.detail}>
                <Text style={styles.label}>Description: </Text>
                {item.description || 'N/A'}
              </Text>

              <Text style={styles.detail}>
                <Text style={styles.label}>Faculty: </Text>
                {`${item.faculty_first_name || ''} ${
                  item.faculty_last_name || ''
                }`.trim() || 'N/A'}
              </Text>

              <Text style={styles.detail}>
                <Text style={styles.label}>Deadline: </Text>
                {item.deadline
                  ? new Date(item.deadline).toLocaleString('en-IN')
                  : 'N/A'}
              </Text>

              <Text style={styles.detail}>
                <Text style={styles.label}>Total Marks: </Text>
                {item.total_marks ?? 'N/A'}
              </Text>

              {/* Submission Details */}
              {isSubmitted && (
                <View style={styles.submissionBox}>
                  <Text style={styles.submissionHeading}>
                    ✓ Previously Submitted
                  </Text>

                  {!!item.submission_url && (
                    <Text style={styles.detail}>
                      <Text style={styles.label}>
                        Submission Link:{' '}
                      </Text>
                      {item.submission_url}
                    </Text>
                  )}

                  {item.marks_obtained != null && (
                    <Text style={styles.detail}>
                      <Text style={styles.label}>Marks: </Text>
                      {item.marks_obtained}
                    </Text>
                  )}

                  {!!item.feedback && (
                    <Text style={styles.detail}>
                      <Text style={styles.label}>Feedback: </Text>
                      {item.feedback}
                    </Text>
                  )}
                </View>
              )}

              {/* Submission Form */}
              {!isClosed && (
                <View style={styles.form}>
                  <Text style={styles.formTitle}>
                    {isSubmitted
                      ? 'Resubmit Assignment'
                      : 'Submit Your Assignment'}
                  </Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Enter assignment file URL"
                    placeholderTextColor="#999"
                    value={submissionLinks[item.id] || ''}
                    onChangeText={value =>
                      setSubmissionLinks(prev => ({
                        ...prev,
                        [item.id]: value,
                      }))
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Submission description (optional)"
                    placeholderTextColor="#999"
                    value={submissionTexts[item.id] || ''}
                    onChangeText={value =>
                      setSubmissionTexts(prev => ({
                        ...prev,
                        [item.id]: value,
                      }))
                    }
                    multiline
                    textAlignVertical="top"
                  />

                  <TouchableOpacity
                    style={[
                      styles.button,
                      isSubmitting && styles.disabledButton,
                    ]}
                    onPress={() => submitAssignment(item.id)}
                    disabled={isSubmitting || !!submittingId}
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {isSubmitted
                          ? 'Resubmit Assignment'
                          : 'Submit Assignment'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {isClosed && (
                <View style={styles.closedMessage}>
                  <Text style={styles.closedText}>
                    Assignment submission is closed.
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5FA',
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  header: {
    marginBottom: 22,
    paddingHorizontal: 2,
  },

  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0C2466',
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: 14,
    color: '#7B8498',
    marginTop: 6,
  },

  listContent: {
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5FA',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    elevation: 3,
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },

  titleContainer: {
    flex: 1,
  },

  assignmentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172554',
    lineHeight: 25,
    marginBottom: 9,
  },

  subjectCode: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    color: '#304C9B',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: 'center',
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  pendingBadge: {
    backgroundColor: '#FFF4DB',
  },

  pendingBadgeText: {
    color: '#A66A00',
  },

  submittedBadge: {
    backgroundColor: '#E5F7EC',
  },

  submittedBadgeText: {
    color: '#168447',
  },

  closedBadge: {
    backgroundColor: '#FDEAEA',
  },

  closedBadgeText: {
    color: '#C62828',
  },

  divider: {
    height: 1,
    backgroundColor: '#EDF0F5',
    marginVertical: 16,
  },

  detail: {
    fontSize: 13,
    color: '#647084',
    lineHeight: 21,
    marginBottom: 9,
  },

  label: {
    fontWeight: '700',
    color: '#26365F',
  },

  submissionBox: {
    backgroundColor: '#F0FAF3',
    borderWidth: 1,
    borderColor: '#D8F0DF',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 12,
  },

  submissionHeading: {
    color: '#168447',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },

  form: {
    marginTop: 15,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EDF0F5',
  },

  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172554',
    marginBottom: 5,
  },

  input: {
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#DCE2ED',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 12,
    color: '#263247',
    fontSize: 14,
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: '#0C2466',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 2,
  },

  disabledButton: {
    opacity: 0.55,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172554',
  },

  emptyText: {
    color: '#8992A5',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  closedMessage: {
    backgroundColor: '#FFF0F0',
    padding: 13,
    borderRadius: 10,
    marginTop: 14,
  },

  closedText: {
    color: '#C62828',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 13,
  },
});
