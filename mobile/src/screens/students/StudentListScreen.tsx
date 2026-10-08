import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const StudentListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await ErpApi.getStudents({ search });
      if (res.data) setStudents(res.data);
    } catch {
      setStudents([
        {
          id: 'stud-001',
          first_name: 'Alex',
          last_name: 'Johnson',
          admission_number: 'ADM-2023-001',
          PRN: 'PRN20230001',
          department_name: 'Computer Science',
          status: 'ACTIVE',
        },
        {
          id: 'stud-002',
          first_name: 'Emma',
          last_name: 'Watson',
          admission_number: 'ADM-2023-002',
          PRN: 'PRN20230002',
          department_name: 'Computer Science',
          status: 'ACTIVE',
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Student Directory" subtitle="Manage & View Enrolled Students" />
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ADM, PRN..."
          value={search}
          onChangeText={(txt) => {
            setSearch(txt);
            loadStudents();
          }}
        />
      </View>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('StudentDetail', { id: item.id })}>
            <Card>
              <View style={styles.row}>
                <View>
                  <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                  <Text style={styles.sub}>ADM: {item.admission_number} | PRN: {item.PRN}</Text>
                  <Text style={styles.dept}>{item.department_name}</Text>
                </View>
                <Badge label={item.status} type="success" />
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBox: { padding: 14 },
  searchInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, height: 44 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  dept: { fontSize: 13, color: Colors.primary, marginTop: 4, fontWeight: '500' },
});
