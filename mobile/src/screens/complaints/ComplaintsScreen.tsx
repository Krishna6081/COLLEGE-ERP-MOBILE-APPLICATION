import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const ComplaintsScreen: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [tickets, setTickets] = useState([
    { id: '1', subject: 'Lab Projector Display Flickering', category: 'ACADEMIC', status: 'IN_PROGRESS', date: '2026-10-02' },
  ]);

  const handleCreate = async () => {
    if (!subject || !description) {
      Alert.alert('Validation Error', 'Please fill subject and description');
      return;
    }
    const newTicket = { id: Date.now().toString(), subject, category: 'GENERAL', status: 'OPEN', date: 'Today' };
    setTickets([newTicket, ...tickets]);
    setSubject('');
    setDescription('');
    Alert.alert('Ticket Submitted', 'Your grievance ticket has been raised.');
  };

  return (
    <View style={styles.container}>
      <Header title="Grievances & Support" subtitle="Campus Helpdesk Tickets" />
      <Card style={styles.formCard}>
        <Text style={styles.formHeader}>RAISE NEW COMPLAINT</Text>
        <TextInput style={styles.input} placeholder="Subject / Issue Title" value={subject} onChangeText={setSubject} />
        <TextInput style={[styles.input, { height: 70 }]} placeholder="Describe your issue..." multiline value={description} onChangeText={setDescription} />
        <Button title="SUBMIT TICKET" onPress={handleCreate} />
      </Card>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.ticketTitle}>{item.subject}</Text>
              <Badge label={item.status} type={item.status === 'OPEN' ? 'warning' : 'info'} />
            </View>
            <Text style={styles.date}>Date: {item.date}</Text>
          </Card>
        )}
      />
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
});
