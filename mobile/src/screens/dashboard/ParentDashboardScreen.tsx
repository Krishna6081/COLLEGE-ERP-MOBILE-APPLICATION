import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Colors } from '../../constants/colors';

export const ParentDashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="Parent Portal" subtitle="Student: Alex Johnson (Sem 5 CSE)" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <StatCard title="Attendance" value="86.5%" color={Colors.accent} />
          <StatCard title="Current Grade" value="SGPA 9.15" color={Colors.primary} />
        </View>
        <Card>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>Fee Payment Status</Text>
          <Text style={{ marginTop: 6, color: Colors.textSecondary }}>• Total Sem Fee: ₹50,000</Text>
          <Text style={{ marginTop: 4, color: Colors.textSecondary }}>• Paid: ₹20,000 | Pending: ₹25,000</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 },
});
