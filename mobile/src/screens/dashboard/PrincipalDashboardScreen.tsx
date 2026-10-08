import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Colors } from '../../constants/colors';

export const PrincipalDashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="Principal Executive View" subtitle="MIT Institute of Technology" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <StatCard title="College Attendance" value="87.4%" color={Colors.accent} />
          <StatCard title="Placement Rate" value="94.2%" color={Colors.primary} />
        </View>
        <Card>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>Key Academic Metrics</Text>
          <Text style={{ marginTop: 6, color: Colors.textSecondary }}>• Semester Pass Rate: 91.8%</Text>
          <Text style={{ marginTop: 4, color: Colors.textSecondary }}>• Research Publications: 42 Papers</Text>
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
