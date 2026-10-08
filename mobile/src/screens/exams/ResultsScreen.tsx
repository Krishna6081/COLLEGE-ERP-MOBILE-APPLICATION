import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';

export const ResultsScreen: React.FC = () => {
  const result = {
    semester: 'Semester 4 Examination',
    sgpa: '9.15',
    cgpa: '8.95',
    percentage: '91.5%',
    status: 'PASS',
    subjects: [
      { code: 'CS401', name: 'Design & Analysis of Algorithms', marks: 92, grade: 'A+' },
      { code: 'CS402', name: 'Software Engineering & UML', marks: 88, grade: 'A' },
      { code: 'CS403', name: 'Discrete Mathematics', marks: 95, grade: 'O' },
      { code: 'CS404', name: 'Algorithms Laboratory', marks: 49, grade: 'O' },
    ],
  };

  return (
    <View style={styles.container}>
      <Header title="Semester Marksheet" subtitle="Official Academic Performance" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.scoreCard}>
          <Text style={styles.semTxt}>{result.semester}</Text>
          <View style={styles.gpaRow}>
            <View style={styles.gpaBox}>
              <Text style={styles.gpaVal}>{result.sgpa}</Text>
              <Text style={styles.gpaLbl}>SGPA</Text>
            </View>
            <View style={styles.gpaBox}>
              <Text style={styles.gpaVal}>{result.cgpa}</Text>
              <Text style={styles.gpaLbl}>CGPA</Text>
            </View>
          </View>
          <Badge label={`RESULT: ${result.status}`} type="success" />
        </Card>

        <Text style={styles.sectionTitle}>SUBJECT MARKS & GRADES</Text>
        {result.subjects.map((s, idx) => (
          <Card key={idx}>
            <View style={styles.row}>
              <View>
                <Text style={styles.subCode}>{s.code}</Text>
                <Text style={styles.subName}>{s.name}</Text>
              </View>
              <View style={styles.gradeBox}>
                <Text style={styles.gradeTxt}>{s.grade}</Text>
                <Text style={styles.marksTxt}>{s.marks} Marks</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },
  scoreCard: { alignItems: 'center', backgroundColor: Colors.primaryDark, paddingVertical: 20 },
  semTxt: { color: '#93C5FD', fontSize: 13, fontWeight: '700' },
  gpaRow: { flexDirection: 'row', marginVertical: 14 },
  gpaBox: { alignItems: 'center', marginHorizontal: 20 },
  gpaVal: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  gpaLbl: { fontSize: 11, color: '#93C5FD', fontWeight: '700' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, marginHorizontal: 20, marginTop: 20, marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subCode: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  subName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  gradeBox: { alignItems: 'flex-end' },
  gradeTxt: { fontSize: 18, fontWeight: '800', color: Colors.accent },
  marksTxt: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
