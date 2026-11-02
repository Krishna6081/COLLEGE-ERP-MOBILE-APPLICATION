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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getRoles, deleteRole, Role } from '../../api/roles.api';
import { Colors } from '../../constants/colors';

export default function RoleListScreen() {
  const navigation = useNavigation<any>();

  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await getRoles(search);
      setRoles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load roles:', error);
      Alert.alert(
        'Error',
        error?.message || error?.response?.data?.message || 'Could not load roles.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoles();
    }, [search])
  );

  const handleDeleteRole = (role: Role) => {
    if (role.is_system === 1) {
      Alert.alert(
        'Protected System Role',
        `"${role.name}" (${role.code}) is a core system role and cannot be deleted.`
      );
      return;
    }

    if ((role.user_count ?? 0) > 0) {
      Alert.alert(
        'Cannot Delete Role',
        `Cannot delete role "${role.name}" because it is currently assigned to ${role.user_count} active user(s). Reassign or remove those users first.`
      );
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await deleteRole(role.id);
              Alert.alert(
                'Success',
                response?.message || `Role "${role.name}" has been deleted successfully.`
              );
              loadRoles();
            } catch (err: any) {
              setLoading(false);
              Alert.alert(
                'Delete Failed',
                err?.message || err?.response?.data?.message || 'Could not delete role.'
              );
            }
          },
        },
      ]
    );
  };

  const renderRoleCard = ({ item }: { item: Role }) => {
    const isSystem = item.is_system === 1;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleArea}>
            <Text style={styles.roleName}>{item.name}</Text>
            <Text style={styles.roleCode}>{item.code}</Text>
          </View>

          <View
            style={[
              styles.badge,
              isSystem ? styles.systemBadge : styles.customBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isSystem ? styles.systemBadgeText : styles.customBadgeText,
              ]}
            >
              {isSystem ? 'SYSTEM' : 'CUSTOM'}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>👥 Users:</Text>
            <Text style={styles.statValue}>{item.user_count ?? 0}</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>🔑 Permissions:</Text>
            <Text style={styles.statValue}>{item.permission_count ?? 0}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.permButton}
            onPress={() =>
              navigation.navigate('AssignPermissions', {
                roleId: item.id,
                roleName: item.name,
                isSystem: isSystem,
              })
            }
          >
            <Text style={styles.permButtonText}>Permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('EditRole', {
                roleId: item.id,
                roleName: item.name,
              })
            }
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              isSystem && styles.disabledDeleteButton,
            ]}
            onPress={() => handleDeleteRole(item)}
          >
            <Text
              style={[
                styles.deleteButtonText,
                isSystem && styles.disabledDeleteButtonText,
              ]}
            >
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Roles & Permissions</Text>
        <Text style={styles.subheading}>
          Manage system roles and configure module access permissions
        </Text>
      </View>

      <View style={styles.actionHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by role name or code..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity
          style={styles.addRoleButton}
          onPress={() => navigation.navigate('AddRole')}
        >
          <Text style={styles.addRoleButtonText}>+ Add Role</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading roles...</Text>
        </View>
      ) : (
        <FlatList
          data={roles}
          keyExtractor={(item) => item.id}
          renderItem={renderRoleCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadRoles();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No roles found</Text>
              <Text style={styles.emptySubtext}>
                {search ? 'Try clearing your search keyword' : 'Click "+ Add Role" to create a new role'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subheading: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actionHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  addRoleButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRoleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  roleName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleCode: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  systemBadge: {
    backgroundColor: '#EEF2FF',
  },
  systemBadgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '700',
  },
  customBadge: {
    backgroundColor: '#ECFDF5',
  },
  customBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  permButton: {
    flex: 1,
    backgroundColor: '#0b296b',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  permButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 13,
  },
  disabledDeleteButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  disabledDeleteButtonText: {
    color: '#94A3B8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
