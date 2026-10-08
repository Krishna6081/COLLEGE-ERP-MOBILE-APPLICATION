import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';

export const StudentDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  return (
    <View style={styles.container}>
      <Header title="Student Profile" subtitle="Academic Record Details" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>AJ</Text>
          </View>
          <Text style={styles.name}>Alex Johnson</Text>
          <Text style={styles.sub}>B.Tech Computer Science • Sem 5</Text>
          <Badge label="Active Student" type="success" />
        </Card>

        <Card>
          <Text style={styles.cardHeader}>Enrollment Identifiers</Text>
          <Text style={styles.detailRow}>Admission Number: ADM-2023-001</Text>
          <Text style={styles.detailRow}>Enrollment Number: ENR-2023-1001</Text>
          <Text style={styles.detailRow}>PRN: PRN20230001</Text>
        </Card>

        <Card>
          <Text style={styles.cardHeader}>Contact Information</Text>
          <Text style={styles.detailRow}>Email: alex.johnson@student.mit-eng.edu</Text>
          <Text style={styles.detailRow}>Mobile: +91 99000 00008</Text>
          <Text style={styles.detailRow}>Address: 123 Baker Street, Tech City</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },
  headerCard: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarTxt: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary, marginVertical: 4 },
  cardHeader: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  detailRow: { fontSize: 13, color: Colors.textSecondary, paddingVertical: 4 },
});
