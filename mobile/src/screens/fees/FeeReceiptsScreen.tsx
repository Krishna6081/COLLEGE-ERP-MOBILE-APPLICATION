import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, Share, Linking,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { FeeApi } from '../../api/student.api';

interface Receipt {
  id: string;
  receipt_number: string;
  payment_date: string;
  amount: number;
  payment_mode: string;
  transaction_id?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  remarks?: string;
  fee_head: string;
  semester_name: string;
}

const modeIcon: Record<string, string> = {
  CASH: '💵', UPI: '📱', CARD: '💳', NETBANKING: '🏦', CHEQUE: '📄',
};

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const FeeReceiptsScreen: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await FeeApi.getPaymentHistory();
      if (res.data) setReceipts(res.data as Receipt[]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleShare = async (receipt: Receipt) => {
    try {
      const text = [
        `📋 FEE RECEIPT`,
        `Receipt No: ${receipt.receipt_number}`,
        `Date: ${formatDateTime(receipt.payment_date)}`,
        `Fee Head: ${receipt.fee_head}`,
        `Semester: ${receipt.semester_name}`,
        `Amount: ${fmt(receipt.amount)}`,
        `Mode: ${receipt.payment_mode}`,
        receipt.transaction_id ? `Transaction ID: ${receipt.transaction_id}` : '',
        `Status: ${receipt.status}`,
      ].filter(Boolean).join('\n');

      await Share.share({ message: text, title: `Receipt ${receipt.receipt_number}` });
    } catch {
      Alert.alert('Share failed', 'Could not share this receipt.');
    }
  };

  const handleDownloadPDF = async (receipt: Receipt) => {
  try {
    if (receipt.status !== 'SUCCESS') {
      Alert.alert('Unavailable', 'Only successful payments have valid receipts.');
      return;
    }

    const html = `
      <html>
        <body style="font-family: Arial; padding: 25px;">
          <h1 style="text-align:center;">COLLEGE ERP</h1>
          <h2 style="text-align:center;">FEE PAYMENT RECEIPT</h2>
          <hr />

          <p><b>Receipt Number:</b> ${receipt.receipt_number}</p>
          <p><b>Payment Date:</b> ${formatDateTime(receipt.payment_date)}</p>
          <p><b>Fee Head:</b> ${receipt.fee_head}</p>
          <p><b>Semester:</b> ${receipt.semester_name}</p>
          <p><b>Payment Mode:</b> ${receipt.payment_mode}</p>
          <p><b>Transaction ID:</b> ${receipt.transaction_id || 'N/A'}</p>

          <hr />
          <h2>Amount Paid: ${fmt(receipt.amount)}</h2>
          <h3 style="color:green;">Payment Status: SUCCESS</h3>

          <hr />
          <p style="text-align:center;">Thank you for your payment!</p>
        </body>
      </html>
    `;

    const file = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Download Fee Receipt',
      UTI: 'com.adobe.pdf',
    });

  } catch (error: any) {
    Alert.alert('Error', error?.message || 'Unable to generate receipt PDF.');
  }
};

  if (loading) return <LoadingSpinner message="Loading receipts..." />;

  return (
    <View style={styles.container}>
      <Header
        title="Fee Receipts"
        subtitle="Payment History & Receipts"
        onRightPress={() => load(true)}
        rightIconLabel="Refresh"
      />

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <EmptyState title="No Receipts Found" message="You have no fee payment receipts yet." />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card>
            {/* Header Row */}
            <View style={styles.row}>
              <Text style={styles.receiptNo}>{item.receipt_number}</Text>
              <Badge
                label={item.status}
                type={item.status === 'SUCCESS' ? 'success' : item.status === 'PENDING' ? 'warning' : 'danger'}
              />
            </View>

            {/* Amount */}
            <Text style={styles.amount}>{fmt(item.amount)}</Text>

            {/* Details */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fee Head</Text>
                <Text style={styles.infoVal}>{item.fee_head}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Semester</Text>
                <Text style={styles.infoVal}>{item.semester_name}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoVal}>{formatDateTime(item.payment_date)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Payment Mode</Text>
                <Text style={styles.infoVal}>
                  {modeIcon[item.payment_mode] || '💰'} {item.payment_mode}
                </Text>
              </View>
              {item.transaction_id && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Transaction ID</Text>
                  <Text style={styles.infoVal}>{item.transaction_id}</Text>
                </View>
              )}
              {item.remarks && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Remarks</Text>
                  <Text style={styles.infoVal}>{item.remarks}</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(item)}>
              <Text style={styles.shareBtnTxt}>📤 Share Receipt</Text>
            </TouchableOpacity>
    <TouchableOpacity
  style={styles.downloadBtn}
  onPress={() => handleDownloadPDF(item)}
>
  <Text style={styles.downloadBtnTxt}>
    📥 Download Receipt PDF
  </Text>
</TouchableOpacity>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptNo: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  amount: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, marginVertical: 8 },
  infoGrid: { backgroundColor: Colors.surface, borderRadius: 8, padding: 10, marginTop: 4 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  infoLabel: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  infoVal: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, flex: 1, textAlign: 'right' },
  shareBtn: {
    marginTop: 12, borderWidth: 1.5, borderColor: Colors.primary,
    paddingVertical: 9, borderRadius: 8, alignItems: 'center',
  },
  shareBtnTxt: { color: Colors.primary, fontSize: 13, fontWeight: '700' },

downloadBtn: {
  marginTop: 10,
  backgroundColor: Colors.primary,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
downloadBtnTxt: {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: '700',
},
}
);