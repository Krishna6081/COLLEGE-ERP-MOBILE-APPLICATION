import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { SuperAdminApi, Role, Permission } from '../../api/superadmin.api';

export const RolesPermissionsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ROLES' | 'PERMISSIONS'>('ROLES');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Add Custom Role Modal
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [roleCode, setRoleCode] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  // Edit Permissions Modal for a role
  const [editPermsModalVisible, setEditPermsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [rRes, pRes] = await Promise.all([
        SuperAdminApi.getRoles(),
        SuperAdminApi.getPermissions(),
      ]);
      if (!rRes.success) throw new Error(rRes.message || 'Could not load roles.');
      if (!pRes.success) throw new Error(pRes.message || 'Could not load permissions.');
      if (!Array.isArray(rRes.data) || !Array.isArray(pRes.data)) {
        throw new Error('The server returned an invalid roles or permissions response.');
      }
      setRoles(rRes.data);
      setPermissions(pRes.data);
    } catch (e: any) {
      setLoadError(e?.message || 'Could not load roles and permissions. Check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRole = async () => {
    if (!roleCode || !roleName) {
      Alert.alert('Required Fields', 'Role code and name are required.');
      return;
    }

    setSavingRole(true);
    try {
      const res = await SuperAdminApi.createRole({ code: roleCode, name: roleName, description: roleDesc });
      if (res.success) {
        Alert.alert('Success', 'Custom role created successfully.');
        setRoleModalVisible(false);
        setRoleCode('');
        setRoleName('');
        setRoleDesc('');
        fetchData();
      } else {
        Alert.alert('Error', res.message || 'Could not create role.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create role.');
    } finally {
      setSavingRole(false);
    }
  };

  const openPermissionEditor = async (role: Role) => {
    try {
      const res = await SuperAdminApi.getRolePermissions(role.id);
      if (!res.success) {
        throw new Error(res.message || 'Could not load this role’s permissions.');
      }
      if (!Array.isArray(res.data)) {
        throw new Error('The server returned an invalid permissions response.');
      }
      setSelectedRole(role);
      setSelectedPermIds(res.data.map((p) => p.id));
      setEditPermsModalVisible(true);
    } catch (e: any) {
      Alert.alert('Unable to load permissions', e?.message || 'Check your connection and try again.');
    }
  };

  const togglePermission = (permId: string) => {
    if (selectedPermIds.includes(permId)) {
      setSelectedPermIds(selectedPermIds.filter((id) => id !== permId));
    } else {
      setSelectedPermIds([...selectedPermIds, permId]);
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    setSavingPerms(true);
    try {
      const res = await SuperAdminApi.updateRolePermissions(selectedRole.id, selectedPermIds);
      if (res.success) {
        Alert.alert('Permissions Updated', `Assigned ${selectedPermIds.length} permissions to ${selectedRole.name}.`);
        setEditPermsModalVisible(false);
        fetchData();
      } else {
        Alert.alert('Error', res.message || 'Could not update permissions.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update permissions.');
    } finally {
      setSavingPerms(false);
    }
  };

  // Group permissions by module
  const groupedPerms = permissions.reduce((acc, p) => {
    acc[p.module] = acc[p.module] || [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <View style={styles.container}>
      <Header title="Roles & Permissions" subtitle="RBAC Access Control & Authority Matrix" />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ROLES' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ROLES')}
        >
          <Text style={[styles.tabText, activeTab === 'ROLES' && styles.tabTextActive]}>
            🔑 System Roles ({roles.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'PERMISSIONS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('PERMISSIONS')}
        >
          <Text style={[styles.tabText, activeTab === 'PERMISSIONS' && styles.tabTextActive]}>
            📜 Permissions ({permissions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : loadError ? (
          <View style={styles.loadError}>
            <Text style={styles.loadErrorText}>{loadError}</Text>
            <Button title="RETRY" onPress={fetchData} />
          </View>
        ) : activeTab === 'ROLES' ? (
          <View>
            <Button
              title="+ CREATE CUSTOM ROLE"
              onPress={() => setRoleModalVisible(true)}
              style={{ marginBottom: 14 }}
            />
            {roles.map((r) => (
              <Card key={r.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleName}>{r.name}</Text>
                    <Text style={styles.roleCode}>Code: {r.code}</Text>
                  </View>
                  <Badge
                    text={r.is_system ? 'SYSTEM' : 'CUSTOM'}
                    variant={r.is_system ? 'info' : 'warning'}
                  />
                </View>

                {r.description && <Text style={styles.roleDesc}>{r.description}</Text>}

                <View style={styles.roleFooter}>
                  <Text style={styles.counterText}>
                    👥 {r.users_count || 0} Users • 🛡️ {r.permissions_count || 0} Perms
                  </Text>
                  <TouchableOpacity
                    style={styles.editPermsBtn}
                    onPress={() => openPermissionEditor(r)}
                  >
                    <Text style={styles.editPermsText}>Edit Permissions ➔</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View>
            {Object.keys(groupedPerms).map((mod) => (
              <View key={mod} style={{ marginBottom: 16 }}>
                <Text style={styles.moduleHeader}>MODULE: {mod.toUpperCase()}</Text>
                {groupedPerms[mod].map((p) => (
                  <Card key={p.id} style={styles.permCard}>
                    <View style={styles.permRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.permName}>{p.name}</Text>
                        <Text style={styles.permCode}>{p.code}</Text>
                        {p.description && <Text style={styles.permDesc}>{p.description}</Text>}
                      </View>
                      <Badge text="AVAILABLE" variant="info" />
                    </View>
                  </Card>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Role Modal */}
      <Modal visible={roleModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Role</Text>
              <TouchableOpacity onPress={() => setRoleModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Role Code (e.g. LAB_HEAD)</Text>
            <TextInput
              style={styles.input}
              value={roleCode}
              onChangeText={setRoleCode}
              placeholder="e.g. QUALITY_AUDITOR"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Role Display Name</Text>
            <TextInput
              style={styles.input}
              value={roleName}
              onChangeText={setRoleName}
              placeholder="e.g. Quality Auditor"
            />

            <Text style={styles.inputLabel}>Role Description</Text>
            <TextInput
              style={styles.input}
              value={roleDesc}
              onChangeText={setRoleDesc}
              placeholder="Scope and responsibilities of this role"
            />

            <Button
              title="CREATE ROLE"
              onPress={handleCreateRole}
              loading={savingRole}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>

      {/* Edit Role Permissions Modal */}
      <Modal visible={editPermsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Configure Permissions</Text>
                <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '700' }}>
                  Role: {selectedRole?.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setEditPermsModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginVertical: 10 }}>
              {permissions.map((p) => {
                const checked = selectedPermIds.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.permCheckItem, checked && styles.permCheckItemActive]}
                    onPress={() => togglePermission(p.id)}
                  >
                    <Text style={{ fontSize: 16 }}>{checked ? '☑️' : '⬜'}</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.permCheckTitle, checked && { color: Colors.primary }]}>
                        {p.name}
                      </Text>
                      <Text style={styles.permCheckSub}>{p.code}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Button
              title={`SAVE PERMISSIONS (${selectedPermIds.length} ACTIVE)`}
              onPress={handleSaveRolePermissions}
              loading={savingPerms}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadError: { alignItems: 'center', padding: 20, marginTop: 24 },
  loadErrorText: { color: Colors.danger, textAlign: 'center', marginBottom: 8 },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 6, margin: 16, borderRadius: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  tabTextActive: { color: '#FFFFFF' },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roleName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  roleCode: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', marginTop: 2 },
  roleDesc: { fontSize: 13, color: Colors.textSecondary, marginVertical: 6 },
  roleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  counterText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  editPermsBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editPermsText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  moduleHeader: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, marginBottom: 6, letterSpacing: 0.8 },
  permCard: { padding: 12, marginBottom: 8 },
  permRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  permName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  permCode: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'monospace', marginTop: 2 },
  permDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  modalClose: { fontSize: 18, fontWeight: '800', color: Colors.textSecondary, padding: 4 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginTop: 10, marginBottom: 4 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  permCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  permCheckItemActive: { backgroundColor: '#EFF6FF', borderColor: Colors.primary },
  permCheckTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  permCheckSub: { fontSize: 11, color: Colors.textSecondary, fontFamily: 'monospace' },
});
