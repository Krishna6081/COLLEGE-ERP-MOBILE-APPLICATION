import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';

export const CertificatesScreen: React.FC = () => {
  const requests = [
    { id: '1', type: 'Bonafide Certificate', reason: 'Passport renewal', status: 'ISSUED', url: 'bonafide.pdf' },
    { id: '2', type: 'Fee Paid Certificate', reason: 'Education loan', status: 'APPROVED', url: 'fee_cert.pdf' },
  ];

  const handleRequestNew = () => {
    Alert.alert('Request Sent', 'Your Bonafide Certificate request has been forwarded to College Admin for digital signature.');
  };

  return (
    <View style={styles.container}>
      <Header title="Certificates Portal" subtitle="Apply & Download Digital Certificates" />
      <Card style={{ padding: 14 }}>
        <TouchableOpacity style={styles.requestBtn} onPress={handleRequestNew}>
          <Text style={styles.requestTxt}>+ REQUEST NEW BONAFIDE CERTIFICATE</Text>
        </TouchableOpacity>
      </Card>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.type}>{item.type}</Text>
              <Badge label={item.status} type="success" />
            </View>
            <Text style={styles.reason}>Reason: {item.reason}</Text>
            <TouchableOpacity style={styles.downloadBtn} onPress={() => Alert.alert('Download', `Downloading ${item.url}`)}>
              <Text style={styles.downloadTxt}>DOWNLOAD SIGNED PDF</Text>
            </TouchableOpacity>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  requestBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  requestTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  reason: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  downloadBtn: { marginTop: 10, borderWidth: 1, borderColor: Colors.primary, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  downloadTxt: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
});
