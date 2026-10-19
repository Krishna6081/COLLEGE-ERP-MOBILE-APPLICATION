import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const FacultyListScreen: React.FC = () => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      const res = await ErpApi.getFaculty();
      const items = (res as any)?.data?.faculty ?? (res as any)?.data ?? [];
      setFaculty(Array.isArray(items) ? items : []);
    } catch (error: any) {
      Alert.alert('Could not load faculty', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Faculty Members" subtitle="Academic Teaching Staff Directory" />
      {loading ? <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" /> : <FlatList
        data={faculty}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>No faculty members found</Text>}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>Prof. {item.first_name} {item.last_name}</Text>
                <Text style={styles.desig}>{item.designation_name} ({item.qualification})</Text>
                <Text style={styles.empId}>Emp ID: {item.employee_id}</Text>
              </View>
              <Badge label="Active" type="success" />
            </View>
          </Card>
        )}
      />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  desig: { fontSize: 13, color: Colors.primary, marginTop: 2, fontWeight: '500' },
  empId: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  empty: { padding: 24, color: Colors.textSecondary, textAlign: 'center' },
});
