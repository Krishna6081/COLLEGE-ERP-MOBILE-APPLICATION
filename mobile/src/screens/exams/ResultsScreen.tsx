import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, RefreshControl, Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { ExamApi } from '../../api/student.api';

interface SubjectMark {
  subject_code: string;
  subject_name: string;
  marks_obtained: number;
  max_marks: number;
  passing_marks: number;
  is_absent: number;
  credits: number;
  subject_type: string;
}

interface Result {
  id: string;
  exam_name: string;
  exam_type: string;
  semester_name: string;
  semester_number: number;
  total_marks: number;
  percentage: number;
  sgpa: number;
  cgpa: number;
  result_status: 'PASS' | 'FAIL' | 'WITHHELD';
  subject_marks: SubjectMark[];
}

const getGrade = (obtained: number, max: number): string => {
  const pct = (obtained / max) * 100;
  if (pct >= 90) return 'O';
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B+';
  if (pct >= 50) return 'B';
  if (pct >= 40) return 'C';
  return 'F';
};

export const ResultsScreen: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const loadResults = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await ExamApi.getResults();
      if (res.data) {
        setResults(res.data as Result[]);
        setSelectedIdx(0);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load results');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadResults(); }, [loadResults]);

  if (loading) return <LoadingSpinner message="Loading results..." />;

  const current = results[selectedIdx] || null;

  return (
    <View style={styles.container}>
      <Header
        title="Semester Results"
        subtitle="Official Academic Performance"
        onRightPress={() => loadResults(true)}
        rightIconLabel="Refresh"
      />

      {results.length === 0 ? (
        <EmptyState title="No Results Published" message="Your exam results have not been published yet." />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadResults(true)} colors={[Colors.primary]} />}
          contentContainerStyle={styles.scroll}
        >
          {/* Semester Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.semScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {results.map((r, idx) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.semBtn, idx === selectedIdx && styles.semBtnActive]}
                onPress={() => setSelectedIdx(idx)}
              >
                <Text style={[styles.semBtnText, idx === selectedIdx && styles.semBtnTextActive]}>
                  {r.semester_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {current && (
            <>
              {/* Score Card */}
              <Card style={styles.scoreCard}>
                <Text style={styles.examName}>{current.exam_name}</Text>
                <View style={styles.gpaRow}>
                  <View style={styles.gpaBox}>
                    <Text style={styles.gpaVal}>{Number(current.sgpa).toFixed(2)}</Text>
                    <Text style={styles.gpaLbl}>SGPA</Text>
                  </View>
                  <View style={styles.gpaDivider} />
                  <View style={styles.gpaBox}>
                    <Text style={styles.gpaVal}>{Number(current.cgpa).toFixed(2)}</Text>
                    <Text style={styles.gpaLbl}>CGPA</Text>
                  </View>
                  <View style={styles.gpaDivider} />
                  <View style={styles.gpaBox}>
                    <Text style={styles.gpaVal}>{Number(current.percentage).toFixed(1)}%</Text>
                    <Text style={styles.gpaLbl}>Percentage</Text>
                  </View>
                </View>
                <Badge
                  label={`RESULT: ${current.result_status}`}
                  type={current.result_status === 'PASS' ? 'success' : 'danger'}
                />
              </Card>

              {/* Subject Marks */}
              <Text style={styles.sectionTitle}>SUBJECT-WISE MARKS & GRADES</Text>

              {current.subject_marks && current.subject_marks.length > 0 ? (
                current.subject_marks.map((s, idx) => {
                  const grade = s.is_absent ? 'AB' : getGrade(s.marks_obtained, s.max_marks);
                  const isPassed = !s.is_absent && s.marks_obtained >= s.passing_marks;
                  return (
                    <Card key={idx}>
                      <View style={styles.subjectRow}>
                        <View style={styles.subjectInfo}>
                          <Text style={styles.subCode}>{s.subject_code}</Text>
                          <Text style={styles.subName}>{s.subject_name}</Text>
                          <Text style={styles.subMeta}>
                            Credits: {s.credits} | Type: {s.subject_type}
                          </Text>
                        </View>
                        <View style={styles.gradeBox}>
                          <Text style={[styles.gradeTxt, { color: isPassed ? Colors.accent : Colors.danger }]}>
                            {grade}
                          </Text>
                          <Text style={styles.marksTxt}>
                            {s.is_absent ? 'Absent' : `${s.marks_obtained}/${s.max_marks}`}
                          </Text>
                          <Text style={[styles.passStatus, { color: isPassed ? Colors.accent : Colors.danger }]}>
                            {s.is_absent ? 'AB' : isPassed ? 'PASS' : 'FAIL'}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <Text style={styles.noMarksTxt}>Subject-wise marks not available for this result.</Text>
                </Card>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },
  semScroll: { marginVertical: 12 },
  semBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, marginRight: 8, borderWidth: 1, borderColor: Colors.border,
  },
  semBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  semBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  semBtnTextActive: { color: '#FFFFFF' },
  scoreCard: { backgroundColor: Colors.primary, alignItems: 'center', paddingVertical: 24, marginHorizontal: 16 },
  examName: { color: '#93C5FD', fontSize: 13, fontWeight: '700', marginBottom: 16 },
  gpaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  gpaBox: { alignItems: 'center', paddingHorizontal: 16 },
  gpaDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  gpaVal: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  gpaLbl: { fontSize: 11, color: '#93C5FD', fontWeight: '700', marginTop: 2 },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.textSecondary,
    marginHorizontal: 16, marginTop: 20, marginBottom: 6, letterSpacing: 0.5,
  },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectInfo: { flex: 1 },
  subCode: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5 },
  subName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginVertical: 2 },
  subMeta: { fontSize: 11, color: Colors.textSecondary },
  gradeBox: { alignItems: 'center', marginLeft: 12 },
  gradeTxt: { fontSize: 24, fontWeight: '900' },
  marksTxt: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  passStatus: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  noMarksTxt: { textAlign: 'center', color: Colors.textSecondary, fontSize: 14 },
});
