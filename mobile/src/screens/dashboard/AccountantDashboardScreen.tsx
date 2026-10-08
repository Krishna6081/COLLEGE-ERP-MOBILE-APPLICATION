import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Colors } from '../../constants/colors';

export const AccountantDashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="Accounts & Finance" subtitle="Fee Management & Collection" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <StatCard title="Collected Today" value="₹3,40,000" color={Colors.accent} />
          <StatCard title="Total Pending" value="₹32,10,000" color={Colors.danger} />
        </View>
        <Card>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>Recent Payment Receipts</Text>
          <Text style={{ marginTop: 6, color: Colors.textSecondary }}>• Alex Johnson - ₹20,000 (REC-94812301)</Text>
          <Text style={{ marginTop: 4, color: Colors.textSecondary }}>• Emma Watson - ₹50,000 (REC-94812302)</Text>
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
