
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUsers, deleteUser, User } from '../../api/users.api';

export default function UserListScreen({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(search);
      setUsers(data);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Users load karta ale nahi.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [search])
  );

  const handleDeleteUser = (user: User) => {
    if (user.user_type === 'SUPER_ADMIN' || user.username === 'superadmin') {
      Alert.alert(
        'Protected Account',
        `"${user.username}" is a Super Admin account and cannot be deleted.`
      );
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete user "${user.first_name} ${user.last_name}" (${user.username})?\n\nThis will deactivate the user account and revoke access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response: any = await deleteUser(user.id);
              Alert.alert(
                'Success',
                response?.message || `User "${user.username}" deleted successfully.`
              );
              loadUsers();
            } catch (error: any) {
              setLoading(false);
              const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to delete user.';
              Alert.alert('Delete Failed', message);
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {item.first_name} {item.last_name}
      </Text>

      <Text style={styles.detail}>Username: {item.username}</Text>
      <Text style={styles.detail}>Email: {item.email}</Text>
      <Text style={styles.detail}>Mobile: {item.mobile || 'N/A'}</Text>
      <Text style={styles.detail}>Role: {item.user_type}</Text>

      <Text
        style={[
          styles.status,
          item.status === 'ACTIVE' ? styles.active : styles.inactive,
        ]}
      >
        {item.status}
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate('EditUser', { userId: item.id })
          }
        >
          <Text style={styles.buttonText}>Edit User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>All Users</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by name, username or email"
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddUser')}
      >
        <Text style={styles.buttonText}>+ Add User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          <Text style={styles.empty}>No users found.</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadUsers();
            }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#172554',
  },
  search: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#092a70',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  detail: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 5,
  },
  status: {
    fontWeight: 'bold',
    marginTop: 6,
  },
  active: {
    color: '#15803D',
  },
  inactive: {
    color: '#DC2626',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#7a7d9e',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280',
  },
});
