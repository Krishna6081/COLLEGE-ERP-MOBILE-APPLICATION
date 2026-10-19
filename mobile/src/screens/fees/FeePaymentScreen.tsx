import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

interface StudentFee {
  id: string;
  fee_head: string;
  original_amount: number | string;
  discount_amount: number | string;
  net_amount: number | string;
  paid_amount: number | string;
  due_amount: number | string;
  status: string;
  due_date?: string;
}

const formatCurrency = (value: number | string | undefined) => `₹${Number(value || 0).toLocaleString()}`;

export const FeePaymentScreen: React.FC = () => {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFees = async () => {
    try {
      const response = await ErpApi.getStudentFees();
      const rows = (response as any)?.data ?? [];
      setFees(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      Alert.alert('Could not load fees', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFees(); }, []);

  return (
    <View style={styles.container}>
      <Header title="Fee Statement" subtitle="Current student fee records" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator style={styles.loading} color={Colors.primary} size="large" />
        ) : fees.length === 0 ? (
          <Card><Text style={styles.empty}>No fee records found</Text></Card>
        ) : fees.map((fee) => {
          const due = Number(fee.due_amount || 0);
          return (
            <Card key={fee.id}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>{fee.fee_head}</Text>
                <Badge label={fee.status} type={fee.status === 'PAID' ? 'success' : 'warning'} />
              </View>
              {fee.due_date ? <Text style={styles.dueDate}>Due date: {fee.due_date}</Text> : null}
              <View style={styles.divider} />
              <FeeRow label="Original Fee:" value={fee.original_amount} />
              <FeeRow label="Scholarship Discount:" value={fee.discount_amount} accent />
              <FeeRow label="Net Payable Fee:" value={fee.net_amount} />
              <FeeRow label="Amount Paid:" value={fee.paid_amount} accent />
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.dueLabel}>Outstanding Balance:</Text>
                <Text style={styles.dueVal}>{formatCurrency(due)}</Text>
              </View>
              {due > 0 ? (
                <Text style={styles.paymentNote}>Online payment is not configured. Please contact the accounts office to pay and update this balance.</Text>
              ) : (
                <Text style={styles.allPaidTxt}>This fee is paid in full.</Text>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
};

const FeeRow: React.FC<{ label: string; value: number | string; accent?: boolean }> = ({ label, value, accent }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.val, accent && { color: Colors.accent }]}>{formatCurrency(value)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },
  loading: { marginTop: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  dueDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 8 },
  label: { fontSize: 14, color: Colors.textSecondary },
  val: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  dueLabel: { fontSize: 15, fontWeight: '800', color: Colors.danger },
  dueVal: { fontSize: 20, fontWeight: '800', color: Colors.danger },
  paymentNote: { color: Colors.textSecondary, marginTop: 12, lineHeight: 19 },
  allPaidTxt: { textAlign: 'center', color: Colors.accent, fontWeight: '700', fontSize: 15, marginTop: 14 },
  empty: { textAlign: 'center', color: Colors.textSecondary, padding: 16 },
});
