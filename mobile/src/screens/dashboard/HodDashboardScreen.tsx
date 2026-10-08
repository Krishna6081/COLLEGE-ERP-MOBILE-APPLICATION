import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Colors } from '../../constants/colors';

export const HodDashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="HOD Dashboard" subtitle="Computer Science & Engineering" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <StatCard title="Dept Students" value="480" color={Colors.primary} />
          <StatCard title="Faculty Workload" value="24 Staff" color={Colors.secondary} />
        </View>
        <Card>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>Pending Leave Requests</Text>
          <Text style={{ marginTop: 6, color: Colors.textSecondary }}>• Prof. John Smith - 2 Days Medical Leave</Text>
          <Text style={{ marginTop: 4, color: Colors.textSecondary }}>• Prof. Sarah Connor - 1 Day Duty Leave</Text>
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
