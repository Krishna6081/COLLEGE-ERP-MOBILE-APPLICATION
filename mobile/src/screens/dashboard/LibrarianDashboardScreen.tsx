import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Colors } from '../../constants/colors';

export const LibrarianDashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="Library Operations" subtitle="Catalog & Circulation Desk" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <StatCard title="Total Books" value="18,500" color={Colors.primary} />
          <StatCard title="Issued Today" value="45 Books" color={Colors.accent} />
        </View>
        <Card>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>Circulation Summary</Text>
          <Text style={{ marginTop: 6, color: Colors.textSecondary }}>• Returns Processed Today: 38 Books</Text>
          <Text style={{ marginTop: 4, color: Colors.textSecondary }}>• Overdue Fines Collected: ₹1,450</Text>
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
