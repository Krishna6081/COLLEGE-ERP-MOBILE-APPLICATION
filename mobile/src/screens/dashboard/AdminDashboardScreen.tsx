import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Colors } from '../../constants/colors';

export const AdminDashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="College Administration Portal" subtitle="MIT Institute of Technology" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <StatCard title="Total Students" value="2,450" subtitle="Enrolled 2025-26" color={Colors.primary} />
          <StatCard title="Total Faculty" value="120" subtitle="6 Departments" color={Colors.secondary} />
        </View>

        <View style={styles.statsRow}>
          <StatCard title="Fee Collection" value="₹1.24 Cr" subtitle="Collected YTD" color={Colors.accent} />
          <StatCard title="Pending Dues" value="₹32.10 L" subtitle="Overdue Fees" color={Colors.danger} />
        </View>

        <Text style={styles.sectionTitle}>SYSTEM QUICK OVERVIEW</Text>
        <Card style={{ padding: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: Colors.textPrimary }}>Departments Summary</Text>
          <Text style={{ marginTop: 8, color: Colors.textSecondary }}>• Computer Science & Engineering (480 Students)</Text>
          <Text style={{ marginTop: 4, color: Colors.textSecondary }}>• Electronics & Communication (420 Students)</Text>
          <Text style={{ marginTop: 4, color: Colors.textSecondary }}>• Mechanical Engineering (360 Students)</Text>
          <Text style={{ marginTop: 4, color: Colors.textSecondary }}>• Civil Engineering (300 Students)</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, marginHorizontal: 20, marginTop: 20, marginBottom: 6 },
});
