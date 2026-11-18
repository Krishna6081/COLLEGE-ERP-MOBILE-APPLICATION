
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';

import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { AssignmentApi } from '../../api/student.api';

type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'LATE' | 'EVALUATED';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  attachment_url?: string;
  total_marks: number;
  deadline: string;
  assignment_status: string;
  subject_code: string;
  subject_name: string;
  faculty_first_name: string;
  faculty_last_name: string;
  submission_id?: string;
  submission_url?: string;
  submission_text?: string;
  submitted_at?: string;
  marks_obtained?: number;
  feedback?: string;
  submission_status?: string;
  display_status: SubmissionStatus;
}

const getBadgeType = (
  status: string
): 'success' | 'warning' | 'danger' | 'info' => {
  switch (status) {
    case 'SUBMITTED':
    case 'EVALUATED':
      return 'success';
    case 'LATE':
      return 'danger';
    default:
      return 'warning';
  }
};

export const AssignmentsScreen: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailAssignment, setDetailAssignment] =
    useState<Assignment | null>(null);

  const loadAssignments = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await AssignmentApi.getMyAssignments();

      if (res.data) {
        setAssignments(res.data as Assignment[]);
      } else {
        setAssignments([]);
      }
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message || 'Failed to load assignments'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const openSubmitModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setFileUrl(assignment.submission_url || '');
    setSubmissionNote(assignment.submission_text || '');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    if (!fileUrl.trim()) {
      Alert.alert(
        'Validation',
        'Please enter the file URL / link for your submission'
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await AssignmentApi.submitAssignment({
        assignment_id: selectedAssignment.id,
        file_url: fileUrl.trim(),
        submission_text: submissionNote.trim() || undefined,
      });

      Alert.alert(
        'Success',
        res.message || 'Assignment submitted successfully'
      );

      setModalVisible(false);
      await loadAssignments(true);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message || 'Failed to submit assignment'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (assignment: Assignment) => {
    setDetailAssignment(assignment);
    setDetailVisible(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingCount = assignments.filter(
    item =>
      item.display_status === 'PENDING' ||
      item.display_status === 'LATE'
  ).length;

  const submittedCount = assignments.filter(
    item =>
      item.display_status === 'SUBMITTED' ||
      item.display_status === 'EVALUATED'
  ).length;

  if (loading) {
    return <LoadingSpinner message="Loading assignments..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#0C2466"
        barStyle="light-content"
      />

      <Header
        title="Course Assignments"
        subtitle="Manage your assignments & submissions"
        onRightPress={() => loadAssignments(true)}
        rightIconLabel="Refresh"
      />

      <FlatList
        data={assignments}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAssignments(true)}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {assignments.length}
              </Text>
              <Text style={styles.summaryLabel}>
                Total Assignments
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {pendingCount}
              </Text>
              <Text style={styles.summaryLabel}>
                Pending
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {submittedCount}
              </Text>
              <Text style={styles.summaryLabel}>
                Submitted
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No Assignments"
            message="No assignments have been assigned yet."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openDetail(item)}
            activeOpacity={0.85}
          >
            <Card style={styles.assignmentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.subjectCodeBox}>
                  <Text style={styles.subjectCode}>
                    {item.subject_code || 'SUBJECT'}
                  </Text>
                </View>

                <Badge
                  label={item.display_status}
                  type={getBadgeType(item.display_status)}
                />
              </View>

              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.subject}>
                {item.subject_name}
              </Text>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Due Date</Text>
                <Text style={styles.infoValue}>
                  {formatDate(item.deadline)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Marks</Text>
                <Text style={styles.infoValue}>
                  {item.total_marks}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Faculty</Text>
                <Text style={styles.infoValue}>
                  {`${item.faculty_first_name || ''} ${item.faculty_last_name || ''}`.trim() || 'N/A'}
                </Text>
              </View>

              {item.display_status === 'EVALUATED' && (
                <View style={styles.evalBox}>
                  <Text style={styles.evalText}>
                    Score: {item.marks_obtained ?? 'N/A'} / {item.total_marks}
                  </Text>

                  {item.feedback ? (
                    <Text style={styles.feedbackText}>
                      Feedback: {item.feedback}
                    </Text>
                  ) : null}
                </View>
              )}

              {(item.display_status === 'PENDING' ||
                item.display_status === 'LATE') && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.display_status === 'LATE' &&
                      styles.lateButton,
                  ]}
                  onPress={() => openSubmitModal(item)}
                >
                  <Text style={styles.actionButtonText}>
                    {item.display_status === 'LATE'
                      ? '⚠️  SUBMIT LATE'
                      : '📤  SUBMIT ASSIGNMENT'}
                  </Text>
                </TouchableOpacity>
              )}

              {item.display_status === 'SUBMITTED' && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.resubmitButton,
                  ]}
                  onPress={() => openSubmitModal(item)}
                >
                  <Text style={styles.actionButtonText}>
                    ✏️  RESUBMIT
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.viewDetails}>
                Tap to view assignment details →
              </Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Submit Assignment Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                Submit Assignment
              </Text>

              <Text style={styles.modalSubtitle}>
                {selectedAssignment?.title}
              </Text>

              <Text style={styles.inputLabel}>
                File URL / Google Drive Link *
              </Text>

              <TextInput
                style={styles.input}
                placeholder="https://drive.google.com/..."
                placeholderTextColor="#94A3B8"
                value={fileUrl}
                onChangeText={setFileUrl}
                autoCapitalize="none"
                keyboardType="url"
              />

              <Text style={styles.inputLabel}>
                Submission Comment (Optional)
              </Text>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any notes for the faculty..."
                placeholderTextColor="#94A3B8"
                value={submissionNote}
                onChangeText={setSubmissionNote}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalBtns}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="outline"
                  style={styles.halfBtn}
                />

                <Button
                  title="Submit"
                  onPress={handleSubmit}
                  loading={submitting}
                  style={styles.halfBtn}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Assignment Details Modal */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                Assignment Details
              </Text>

              {detailAssignment && (
                <>
                  <View style={styles.detailBadge}>
                    <Badge
                      label={detailAssignment.display_status}
                      type={getBadgeType(detailAssignment.display_status)}
                    />
                  </View>

                  <Text style={styles.detailTitle}>
                    {detailAssignment.title}
                  </Text>

                  <View style={styles.divider} />

                  <Text style={styles.detailMeta}>
                    Subject: {detailAssignment.subject_name}
                  </Text>

                  <Text style={styles.detailMeta}>
                    Subject Code: {detailAssignment.subject_code}
                  </Text>

                  <Text style={styles.detailMeta}>
                    Faculty: {detailAssignment.faculty_first_name}{' '}
                    {detailAssignment.faculty_last_name}
                  </Text>

                  <Text style={styles.detailMeta}>
                    Due: {formatDate(detailAssignment.deadline)}
                  </Text>

                  <Text style={styles.detailMeta}>
                    Total Marks: {detailAssignment.total_marks}
                  </Text>

                  {detailAssignment.description ? (
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionHeading}>
                        Description
                      </Text>
                      <Text style={styles.descText}>
                        {detailAssignment.description}
                      </Text>
                    </View>
                  ) : null}

                  {detailAssignment.submitted_at && (
                    <Text style={styles.detailMeta}>
                      Submitted: {formatDate(detailAssignment.submitted_at)}
                    </Text>
                  )}

                  {detailAssignment.submission_url && (
                    <Text style={styles.detailMeta}>
                      Submission Link: {detailAssignment.submission_url}
                    </Text>
                  )}

                  {detailAssignment.marks_obtained != null && (
                    <View style={styles.evalBox}>
                      <Text style={styles.evalText}>
                        Score: {detailAssignment.marks_obtained} /{' '}
                        {detailAssignment.total_marks}
                      </Text>

                      {detailAssignment.feedback ? (
                        <Text style={styles.feedbackText}>
                          Feedback: {detailAssignment.feedback}
                        </Text>
                      ) : null}
                    </View>
                  )}

                  <Button
                    title="Close"
                    onPress={() => setDetailVisible(false)}
                    style={{ marginTop: 18 }}
                  />
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 35,
    flexGrow: 1,
  },

  summaryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9EDF5',
    elevation: 2,
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0C2466',
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 5,
    textAlign: 'center',
  },

  assignmentCard: {
    padding: 17,
    marginBottom: 15,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  subjectCodeBox: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },

  subjectCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0C2466',
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0C2466',
    marginTop: 13,
  },

  subject: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1F7',
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },

  infoLabel: {
    fontSize: 12,
    color: '#7B8498',
    fontWeight: '600',
    flex: 1,
  },

  infoValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
    textAlign: 'right',
    flex: 1.5,
  },

  evalBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  evalText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
  },

  feedbackText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    lineHeight: 19,
  },

  actionButton: {
    marginTop: 14,
    backgroundColor: '#0C2466',
    paddingVertical: 13,
    borderRadius: 11,
    alignItems: 'center',
  },

  lateButton: {
    backgroundColor: '#DC2626',
  },

  resubmitButton: {
    backgroundColor: '#059669',
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  viewDetails: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 13,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    padding: 18,
  },

  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 21,
    elevation: 8,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0C2466',
    marginBottom: 6,
  },

  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#F5F7FC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 17,
    fontSize: 14,
    color: '#1E293B',
  },

  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },

  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },

  halfBtn: {
    flex: 1,
  },

  detailBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },

  detailTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0C2466',
    marginTop: 12,
  },

  detailMeta: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 10,
    lineHeight: 19,
  },

  descriptionBox: {
    backgroundColor: '#F5F7FC',
    padding: 13,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },

  descriptionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C2466',
    marginBottom: 6,
  },

  descText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 21,
  },
});
