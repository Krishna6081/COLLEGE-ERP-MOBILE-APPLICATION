import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';
import { useAuthStore } from '../../store/useAuthStore';

export const ComplaintsScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canCreateComplaint = user?.user_type === 'SUPER_ADMIN'
    || user?.roles.includes('SUPER_ADMIN')
    || user?.permissions.includes('complaints.create')
    || false;
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const res = await ErpApi.getComplaints();
      const items = (res as any)?.data ?? [];
      setTickets(Array.isArray(items) ? items : []);
    } catch (error: any) {
      Alert.alert('Could not load complaints', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleCreate = async () => {
    if (!subject || !description) {
      Alert.alert('Validation Error', 'Please fill subject and description');
      return;
    }
    try {
      await ErpApi.createComplaint({ subject: subject.trim(), description: description.trim(), category: 'GENERAL' });
      setSubject('');
      setDescription('');
      await loadTickets();
      Alert.alert('Ticket Submitted', 'Your grievance ticket has been raised.');
    } catch (error: any) {
      Alert.alert('Could not submit ticket', error?.message || 'Check your connection and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Grievances & Support" subtitle="Campus Helpdesk Tickets" />
      {canCreateComplaint && (
        <Card style={styles.formCard}>
          <Text style={styles.formHeader}>RAISE NEW COMPLAINT</Text>
          <TextInput style={styles.input} placeholder="Subject / Issue Title" value={subject} onChangeText={setSubject} />
          <TextInput style={[styles.input, { height: 70 }]} placeholder="Describe your issue..." multiline value={description} onChangeText={setDescription} />
          <Button title="SUBMIT TICKET" onPress={handleCreate} />
        </Card>
      )}

      {loading ? <ActivityIndicator color={Colors.primary} size="large" /> : <FlatList
        data={tickets}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>No complaints submitted</Text>}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.ticketTitle}>{item.subject}</Text>
              <Badge label={item.status} type={item.status === 'OPEN' ? 'warning' : 'info'} />
            </View>
            <Text style={styles.date}>Date: {item.created_at?.slice(0, 10) || item.date || '—'}</Text>
          </Card>
        )}
      />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  formCard: { marginBottom: 12 },
  formHeader: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, marginBottom: 10 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  date: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  empty: { padding: 24, color: Colors.textSecondary, textAlign: 'center' },
});
