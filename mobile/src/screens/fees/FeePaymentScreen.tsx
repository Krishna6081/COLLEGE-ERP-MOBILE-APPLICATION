import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { PageContent } from '../../components/PageContent';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';
import { useAuthStore } from '../../store/useAuthStore';

interface StudentFee {
  id: string;
  student_id: string;
  student_name?: string;
  enrollment_number?: string;
  fee_head: string;
  original_amount: number | string;
  discount_amount: number | string;
  net_amount: number | string;
  paid_amount: number | string;
  due_amount: number | string;
  status: string;
  due_date?: string;
}

interface FeePaymentRecord {
  id: string;
  receipt_number: string;
  payment_date: string;
  amount: number | string;
  payment_mode: string;
  transaction_id?: string;
  status: string;
  remarks?: string;
  fee_head?: string;
  student_name?: string;
  enrollment_number?: string;
}

const STATUS_FILTERS = ['ALL', 'OVERDUE', 'PARTIAL', 'PENDING', 'PAID'];
const PAYMENT_MODES = ['UPI', 'CARD', 'NETBANKING', 'CASH', 'CHEQUE'];

const formatCurrency = (value: number | string | undefined) => `₹${Number(value || 0).toLocaleString()}`;

const getBadgeType = (status: string): 'success' | 'danger' | 'warning' | 'info' => {
  if (status === 'PAID' || status === 'SUCCESS') return 'success';
  if (status === 'OVERDUE' || status === 'FAILED') return 'danger';
  return 'warning';
};

export const FeePaymentScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isFinanceStaff = ['ACCOUNTANT', 'COLLEGE_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'].includes(
    user?.user_type || ''
  );
  const canRecordPayment = ['ACCOUNTANT', 'COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(
    user?.user_type || ''
  );

  const [activeTab, setActiveTab] = useState<'fees' | 'receipts'>('fees');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [payments, setPayments] = useState<FeePaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Record payment modal state
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('UPI');
  const [txnId, setTxnId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const feeRes = await ErpApi.getStudentFees();
      const feeRows = (feeRes as any)?.data ?? [];
      setFees(Array.isArray(feeRows) ? feeRows : []);

      if (isFinanceStaff) {
        const payRes = await ErpApi.getFeePayments().catch(() => ({ data: [] }));
        const payRows = (payRes as any)?.data ?? [];
        setPayments(Array.isArray(payRows) ? payRows : []);
      }
    } catch (error: any) {
      Alert.alert('Could not load fees', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isFinanceStaff]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredFees = useMemo(() => {
    if (statusFilter === 'ALL') return fees;
    return fees.filter((f) => f.status === statusFilter);
  }, [fees, statusFilter]);

  const openPaymentModal = (fee: StudentFee) => {
    setSelectedFee(fee);
    setPayAmount(String(Number(fee.due_amount || 0)));
    setPayMode('UPI');
    setTxnId('');
    setRemarks(`${fee.fee_head} payment`);
    setFormError('');
  };

  const handleRecordPayment = async () => {
    if (!selectedFee) return;
    const numericAmount = Number(payAmount);
    const maxDue = Number(selectedFee.due_amount || 0);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Enter a valid positive payment amount.');
      return;
    }
    if (numericAmount > maxDue) {
      setFormError(`Amount cannot exceed outstanding balance (${formatCurrency(maxDue)}).`);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const res: any = await ErpApi.recordFeePayment({
        student_fee_id: selectedFee.id,
        amount: numericAmount,
        payment_mode: payMode,
        transaction_id: txnId.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      const receiptNo = res?.data?.receipt_number || 'recorded';
      setSelectedFee(null);
      await loadData(true);
      if (Platform.OS === 'web') {
        window.alert(`Payment recorded successfully! Receipt: ${receiptNo}`);
      } else {
        Alert.alert('Payment Recorded', `Receipt ${receiptNo} generated successfully.`);
      }
    } catch (error: any) {
      setFormError(error?.message || 'Failed to record payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isFinanceStaff ? 'Accounts & Fee Ledger' : 'Fee Statement'}
        subtitle={isFinanceStaff ? 'Student Fee Records & Payment Receipts' : 'Current student fee records'}
        onRightPress={() => loadData(true)}
        rightIconLabel="Refresh"
      />

      {isFinanceStaff && (
        <View style={{ backgroundColor: Colors.cardBg, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
          <PageContent style={[styles.tabRow, { borderBottomWidth: 0 }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'fees' && styles.tabActive]}
              onPress={() => setActiveTab('fees')}
            >
              <Text style={[styles.tabText, activeTab === 'fees' && styles.tabTextActive]}>
                💰 Student Fees ({fees.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'receipts' && styles.tabActive]}
              onPress={() => setActiveTab('receipts')}
            >
              <Text style={[styles.tabText, activeTab === 'receipts' && styles.tabTextActive]}>
                🧾 Payment Receipts ({payments.length})
              </Text>
            </TouchableOpacity>
          </PageContent>
        </View>
      )}

      {activeTab === 'fees' && isFinanceStaff && (
        <View style={{ backgroundColor: Colors.cardBg, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
          <PageContent style={[styles.filterRow, { borderBottomWidth: 0 }]}>
            {STATUS_FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, statusFilter === f && styles.filterPillActive]}
                onPress={() => setStatusFilter(f)}
              >
                <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </PageContent>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        <PageContent>
        {loading ? (
          <ActivityIndicator style={styles.loading} color={Colors.primary} size="large" />
        ) : activeTab === 'fees' ? (
          filteredFees.length === 0 ? (
            <Card><Text style={styles.empty}>No fee records found</Text></Card>
          ) : (
            filteredFees.map((fee) => {
              const due = Number(fee.due_amount || 0);
              return (
                <Card key={fee.id}>
                  <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{fee.fee_head}</Text>
                      {fee.student_name ? (
                        <Text style={styles.studentMeta}>
                          👤 {fee.student_name}{fee.enrollment_number ? ` · ${fee.enrollment_number}` : ''}
                        </Text>
                      ) : null}
                    </View>
                    <Badge label={fee.status} type={getBadgeType(fee.status)} />
                  </View>
                  {fee.due_date ? <Text style={styles.dueDate}>Due date: {String(fee.due_date).slice(0, 10)}</Text> : null}
                  <View style={styles.divider} />
                  <FeeRow label="Original Fee:" value={fee.original_amount} />
                  <FeeRow label="Scholarship Discount:" value={fee.discount_amount} accent />
                  <FeeRow label="Net Payable Fee:" value={fee.net_amount} />
                  <FeeRow label="Amount Paid:" value={fee.paid_amount} accent />
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <Text style={due > 0 ? styles.dueLabel : styles.paidLabel}>Outstanding Balance:</Text>
                    <Text style={due > 0 ? styles.dueVal : styles.paidVal}>{formatCurrency(due)}</Text>
                  </View>
                  {due > 0 ? (
                    canRecordPayment ? (
                      <Button
                        title="💳 RECORD PAYMENT"
                        onPress={() => openPaymentModal(fee)}
                        style={{ marginTop: 12 }}
                      />
                    ) : (
                      <Text style={styles.paymentNote}>
                        Online payment is not configured. Please contact the accounts office to pay and update this balance.
                      </Text>
                    )
                  ) : (
                    <Text style={styles.allPaidTxt}>✓ This fee is paid in full.</Text>
                  )}
                </Card>
              );
            })
          )
        ) : payments.length === 0 ? (
          <Card><Text style={styles.empty}>No payment receipts found</Text></Card>
        ) : (
          payments.map((pay) => (
            <Card key={pay.id}>
              <View style={styles.payRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.title}>{pay.student_name || 'Student'}</Text>
                  {pay.fee_head ? <Text style={styles.studentMeta}>{pay.fee_head}</Text> : null}
                  <Text style={styles.receiptMeta}>🧾 {pay.receipt_number}{pay.transaction_id ? ` · ${pay.transaction_id}` : ''}</Text>
                  <Text style={styles.dueDate}>🗓️ {String(pay.payment_date || '').slice(0, 16).replace('T', ' ')}</Text>
                  {pay.remarks ? <Text style={styles.remarksTxt}>{pay.remarks}</Text> : null}
                </View>
                <View style={styles.payRight}>
                  <Text style={styles.payAmount}>{formatCurrency(pay.amount)}</Text>
                  <Badge label={pay.payment_mode} type="info" />
                  <Badge label={pay.status} type={getBadgeType(pay.status)} />
                </View>
              </View>
            </Card>
          ))
        )}
        </PageContent>
      </ScrollView>

      {/* Record Payment Modal */}
      <Modal
        visible={!!selectedFee}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFee(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Record Fee Payment</Text>
            {selectedFee && (
              <Text style={styles.modalSub}>
                {selectedFee.student_name} · {selectedFee.fee_head} (Due: {formatCurrency(selectedFee.due_amount)})
              </Text>
            )}

            <Text style={styles.inputLabel}>Payment Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={payAmount}
              onChangeText={setPayAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Payment Mode</Text>
            <View style={styles.modeRow}>
              {PAYMENT_MODES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modePill, payMode === m && styles.modePillActive]}
                  onPress={() => setPayMode(m)}
                >
                  <Text style={[styles.modeText, payMode === m && styles.modeTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Transaction / Reference ID (optional)</Text>
            <TextInput
              style={styles.input}
              value={txnId}
              onChangeText={setTxnId}
              placeholder="e.g. TXN-UPI-123456"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Remarks (optional)</Text>
            <TextInput
              style={styles.input}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Payment notes"
              placeholderTextColor={Colors.textSecondary}
            />

            {!!formError && <Text style={styles.errorTxt}>{formError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSelectedFee(null)}
                disabled={submitting}
              >
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Button
                  title={submitting ? 'RECORDING...' : 'CONFIRM PAYMENT'}
                  onPress={handleRecordPayment}
                  loading={submitting}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  filterTextActive: { color: '#FFFFFF' },

  scroll: { paddingBottom: 24 },
  loading: { marginTop: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  studentMeta: { fontSize: 13, fontWeight: '600', color: Colors.primary, marginTop: 3 },
  receiptMeta: { fontSize: 12, color: Colors.textPrimary, marginTop: 4, fontWeight: '500' },
  remarksTxt: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, fontStyle: 'italic' },
  dueDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 5 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 8 },
  label: { fontSize: 14, color: Colors.textSecondary },
  val: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  dueLabel: { fontSize: 15, fontWeight: '800', color: Colors.danger },
  dueVal: { fontSize: 20, fontWeight: '800', color: Colors.danger },
  paidLabel: { fontSize: 15, fontWeight: '800', color: Colors.success },
  paidVal: { fontSize: 20, fontWeight: '800', color: Colors.success },
  paymentNote: { color: Colors.textSecondary, marginTop: 12, lineHeight: 19 },
  allPaidTxt: { textAlign: 'center', color: Colors.accent, fontWeight: '700', fontSize: 14, marginTop: 10 },
  empty: { textAlign: 'center', color: Colors.textSecondary, padding: 16 },

  payRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  payRight: { alignItems: 'flex-end', gap: 5 },
  payAmount: { fontSize: 17, fontWeight: '900', color: Colors.success },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  modalSub: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 4, marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  modePillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  modeTextActive: { color: '#FFFFFF' },
  errorTxt: { color: Colors.danger, fontSize: 12, fontWeight: '600', marginTop: 10 },
  modalActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelTxt: { color: Colors.textSecondary, fontWeight: '700', fontSize: 13 },
});
