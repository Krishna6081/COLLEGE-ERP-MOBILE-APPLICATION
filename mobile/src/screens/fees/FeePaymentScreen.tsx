import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { FeeApi } from '../../api/student.api';
import { useNavigation } from '@react-navigation/native';

interface FeeItem {
  id: string;
  fee_head: string;
  original_amount: number;
  discount_amount: number;
  net_amount: number;
  paid_amount: number;
  due_amount: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  due_date: string;
}

interface FeeData {
  fees: FeeItem[];
  totals: { total: number; paid: number; due: number };
}

const statusBadge = (s: string): 'success' | 'warning' | 'danger' | 'info' => {
  if (s === 'PAID') return 'success';
  if (s === 'PARTIAL') return 'warning';
  if (s === 'OVERDUE') return 'danger';
  return 'info';
};

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const FeePaymentScreen: React.FC = () => {
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await FeeApi.getStudentFees();
      if (res.data) setFeeData(res.data as FeeData);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load fee details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner message="Loading fee details..." />;

  const totals = feeData?.totals || { total: 0, paid: 0, due: 0 };

  return (
    <View style={styles.container}>
      <Header
        title="Fee Payment Portal"
        subtitle="Semester Fee Statement"
        onRightPress={() => load(true)}
        rightIconLabel="Refresh"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
      >
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>FEE SUMMARY</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryAmt}>{fmt(totals.total)}</Text>
              <Text style={styles.summaryLbl}>Total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryAmt, { color: Colors.accent }]}>{fmt(totals.paid)}</Text>
              <Text style={styles.summaryLbl}>Paid</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryAmt, { color: Colors.danger }]}>{fmt(totals.due)}</Text>
              <Text style={styles.summaryLbl}>Due</Text>
            </View>
          </View>
        </Card>

        {/* Quick Links */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('FeeReceipts')}>
            <Text style={styles.quickBtnIcon}>🧾</Text>
            <Text style={styles.quickBtnTxt}>View Receipts</Text>
          </TouchableOpacity>
        </View>

        {/* Fee Items */}
        <Text style={styles.sectionTitle}>FEE BREAKDOWN</Text>

        {!feeData?.fees?.length ? (
          <EmptyState title="No Fee Records" message="No fee records found for your account." />
        ) : (
          feeData.fees.map((fee) => (
            <Card key={fee.id}>
              <View style={styles.feeHeader}>
                <Text style={styles.feeHead}>{fee.fee_head}</Text>
                <Badge label={fee.status} type={statusBadge(fee.status)} />
              </View>

              <View style={styles.divider} />

              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Original Amount</Text>
                <Text style={styles.feeVal}>{fmt(fee.original_amount)}</Text>
              </View>
              {Number(fee.discount_amount) > 0 && (
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Scholarship/Discount</Text>
                  <Text style={[styles.feeVal, { color: Colors.accent }]}>- {fmt(fee.discount_amount)}</Text>
                </View>
              )}
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Net Payable</Text>
                <Text style={styles.feeVal}>{fmt(fee.net_amount)}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Amount Paid</Text>
                <Text style={[styles.feeVal, { color: Colors.accent }]}>{fmt(fee.paid_amount)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.feeRow}>
                <Text style={[styles.feeLabel, { fontWeight: '800', color: Colors.danger }]}>Outstanding</Text>
                <Text style={[styles.feeVal, { color: Colors.danger, fontSize: 18 }]}>{fmt(fee.due_amount)}</Text>
              </View>

              {fee.due_date && (
                <Text style={styles.dueDateTxt}>
                  Due Date: {new Date(fee.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
              )}

              {Number(fee.due_amount) > 0 && (
                <View style={styles.payNotice}>
                  <Text style={styles.payNoticeTxt}>
                    💳 To make a payment, please visit the college accounts office or use the official payment portal. Contact the accountant with your student ID and fee record ID: {fee.id.slice(-8).toUpperCase()}
                  </Text>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },
  summaryCard: { backgroundColor: Colors.primary, marginHorizontal: 16, marginTop: 12 },
  summaryTitle: { color: '#93C5FD', fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryAmt: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  summaryLbl: { fontSize: 11, color: '#93C5FD', marginTop: 2 },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  quickRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12 },
  quickBtn: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: 14,
    alignItems: 'center', flex: 1, borderWidth: 1, borderColor: Colors.border,
  },
  quickBtnIcon: { fontSize: 24 },
  quickBtnTxt: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginTop: 4 },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.textSecondary,
    marginHorizontal: 16, marginTop: 20, marginBottom: 4, letterSpacing: 0.5,
  },
  feeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeHead: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  feeLabel: { fontSize: 13, color: Colors.textSecondary },
  feeVal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  dueDateTxt: { fontSize: 12, color: Colors.warning, marginTop: 6 },
  payNotice: {
    backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10, marginTop: 12,
    borderLeftWidth: 3, borderLeftColor: Colors.warning,
  },
  payNoticeTxt: { fontSize: 12, color: '#92400E', lineHeight: 18 },
});
