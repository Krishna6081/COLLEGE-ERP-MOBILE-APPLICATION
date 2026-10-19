import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';
import { useAuthStore } from '../../store/useAuthStore';

export const StudentListScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const user = useAuthStore((state) => state.user);
  const isFaculty = user?.user_type === 'FACULTY';
  const divisionId = route?.params?.divisionId as string | undefined;
  const batchId = route?.params?.batchId as string | undefined;
  const [students, setStudents] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadStudents('');
  }, [isFaculty, divisionId, batchId]);

  const loadStudents = async (query = search) => {
    setLoading(true);
    setLoadError('');
    try {
      if (isFaculty) {
        if (!divisionId) throw new Error('Open the roster from one of your scheduled classes.');
        const res = await ErpApi.getClassRoster(divisionId, batchId);
        const rows = Array.isArray(res?.data) ? res.data : [];
        setRoster(rows);
        const term = query.trim().toLowerCase();
        setStudents(term ? rows.filter((student: any) =>
          `${student.first_name} ${student.last_name} ${student.PRN}`.toLowerCase().includes(term)
        ) : rows);
        return;
      }

      const res = await ErpApi.getStudents({ search: query });
      const items = (res as any)?.data?.students ?? (res as any)?.data ?? [];
      setStudents(Array.isArray(items) ? items : []);
    } catch (error: any) {
      setLoadError(error?.message || 'Could not load students. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (isFaculty) {
      const term = value.trim().toLowerCase();
      setStudents(term ? roster.filter((student) =>
        `${student.first_name} ${student.last_name} ${student.PRN}`.toLowerCase().includes(term)
      ) : roster);
    } else {
      loadStudents(value);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isFaculty ? 'Assigned Class Roster' : 'Student Directory'}
        subtitle={isFaculty ? 'Students in your assigned class' : 'Students in your authorized scope'}
      />
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder={isFaculty ? 'Search by name or PRN...' : 'Search by name, ADM, PRN...'}
          value={search}
          onChangeText={handleSearchChange}
        />
      </View>
      {loading ? <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" /> : loadError ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{loadError}</Text>
          {divisionId ? <Button title="RETRY" onPress={() => loadStudents()} /> : null}
          {!divisionId && isFaculty ? <Button title="BACK TO SCHEDULE" variant="outline" onPress={() => navigation.goBack()} /> : null}
        </Card>
      ) : <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>No students found</Text>}
        renderItem={({ item }) => (
          isFaculty ? (
            <Card>
              <View style={styles.row}>
                <View>
                  <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                  <Text style={styles.sub}>PRN: {item.PRN}</Text>
                </View>
              </View>
            </Card>
          ) : (
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
          )
        )}
      />}
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
  empty: { padding: 24, color: Colors.textSecondary, textAlign: 'center' },
  errorCard: { margin: 16 },
  errorText: { color: Colors.danger, textAlign: 'center', marginBottom: 8 },
});
