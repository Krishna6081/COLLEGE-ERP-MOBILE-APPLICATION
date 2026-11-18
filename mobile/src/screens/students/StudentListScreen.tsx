
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const StudentListScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Load students when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch students from API
  const loadStudents = async (searchText: string) => {
    try {
      setLoading(true);

      const res = await ErpApi.getStudents({
        search: searchText,
      });

      if (res.data) {
        setStudents(
          Array.isArray(res.data) ? res.data : []
        );
      }
    } catch (error) {
      console.log('Student API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Student List Item
  const renderStudent = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('StudentDetail', {
          id: item.id,
        })
      }
    >
      <Card>
        <View style={styles.row}>
          <View style={styles.studentInfo}>
            <Text style={styles.name}>
              {item.first_name} {item.last_name}
            </Text>

            <Text style={styles.sub}>
              ADM: {item.admission_number || 'N/A'}
              {' | '}
              PRN: {item.PRN || item.prn || 'N/A'}
            </Text>

            <Text style={styles.dept}>
              {item.department_name || 'Department not available'}
            </Text>
          </View>

          <Badge
            label={item.status || 'UNKNOWN'}
            type="success"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <Header
        title="Student Directory"
        subtitle="Manage & View Enrolled Students"
      />

      {/* Search Section */}
      <View style={styles.searchBox}>
        <Text style={styles.searchLabel}>
          Search Students
        </Text>

        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ADM, PRN..."
            placeholderTextColor="#777777"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Student List */}
      {loading && students.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item, index) =>
            String(item.id || index)
          }
          renderItem={renderStudent}
          refreshing={loading}
          onRefresh={() => loadStudents(search)}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No students found.
            </Text>
          }
        />
      )}

    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  searchBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },

  searchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  searchInputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
  },

  searchInput: {
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000000',
    height: 48,
  },

  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  studentInfo: {
    flex: 1,
    marginRight: 8,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  sub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  dept: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: Colors.textSecondary,
    fontSize: 14,
  },

  loader: {
    marginTop: 30,
  },
});
