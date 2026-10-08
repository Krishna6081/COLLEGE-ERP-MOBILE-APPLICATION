import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const FacultyListScreen: React.FC = () => {
  const [faculty, setFaculty] = useState<any[]>([]);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      const res = await ErpApi.getFaculty();
      if (res.data) setFaculty(res.data);
    } catch {
      setFaculty([
        { id: 'fac-001', employee_id: 'EMP-001', first_name: 'Alan', last_name: 'Turing', qualification: 'Ph.D. CS', designation_name: 'Professor & HOD' },
        { id: 'fac-002', employee_id: 'EMP-002', first_name: 'John', last_name: 'Smith', qualification: 'M.Tech CSE', designation_name: 'Assistant Professor' },
        { id: 'fac-003', employee_id: 'EMP-003', first_name: 'Sarah', last_name: 'Connor', qualification: 'M.Tech AI', designation_name: 'Assistant Professor' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Faculty Members" subtitle="Academic Teaching Staff Directory" />
      <FlatList
        data={faculty}
        keyExtractor={(item) => item.id}
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  desig: { fontSize: 13, color: Colors.primary, marginTop: 2, fontWeight: '500' },
  empId: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
});
