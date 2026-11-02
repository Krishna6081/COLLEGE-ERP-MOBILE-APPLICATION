import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  getRoleById,
  getAllPermissions,
  assignRolePermissions,
  GroupedPermission,
} from '../../api/roles.api';
import { Colors } from '../../constants/colors';

export default function AssignPermissionsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const roleId = route.params?.roleId;
  const initialRoleName = route.params?.roleName || 'Role';

  const [roleName, setRoleName] = useState(initialRoleName);
  const [roleCode, setRoleCode] = useState('');
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermission[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!roleId) {
        Alert.alert('Error', 'Role ID missing.');
        navigation.goBack();
        return;
      }

      try {
        setLoading(true);
        const [roleData, permsData] = await Promise.all([
          getRoleById(roleId),
          getAllPermissions(),
        ]);

        setRoleName(roleData.name);
        setRoleCode(roleData.code);
        setGroupedPermissions(permsData.grouped || []);

        const initialSelected = new Set<string>(roleData.permission_ids || []);
        setSelectedIds(initialSelected);
      } catch (error: any) {
        console.error('Failed to load permission matrix:', error);
        Alert.alert(
          'Error',
          error?.message || error?.response?.data?.message || 'Failed to load permissions.'
        );
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  const togglePermission = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleModuleCollapse = (moduleName: string) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  };

  const handleToggleModuleAll = (modulePerms: { id: string }[]) => {
    const allSelected = modulePerms.every((p) => selectedIds.has(p.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        modulePerms.forEach((p) => next.delete(p.id));
      } else {
        modulePerms.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set<string>();
    groupedPermissions.forEach((g) => {
      g.permissions.forEach((p) => allIds.add(p.id));
    });
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const permArray = Array.from(selectedIds);
      await assignRolePermissions(roleId, permArray);

      Alert.alert(
        'Success',
        `Assigned ${permArray.length} permission(s) to "${roleName}".`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to save permissions:', error);
      Alert.alert(
        'Save Failed',
        error?.message || error?.response?.data?.message || 'Could not update permissions.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading permissions matrix...</Text>
      </View>
    );
  }

  const totalPermissions = groupedPermissions.reduce(
    (acc, cur) => acc + cur.permissions.length,
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Assign Permissions</Text>
        <Text style={styles.roleSubhead}>
          Role: <Text style={styles.boldText}>{roleName}</Text> ({roleCode})
        </Text>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            Selected {selectedIds.size} / {totalPermissions}
          </Text>
        </View>

        <View style={styles.toolButtons}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleSelectAll}
          >
            <Text style={styles.toolBtnText}>Select All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleDeselectAll}
          >
            <Text style={styles.toolBtnText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList}>
        {groupedPermissions.map((group) => {
          const isCollapsed = collapsedModules.has(group.module);
          const selectedInModule = group.permissions.filter((p) =>
            selectedIds.has(p.id)
          ).length;
          const allModuleSelected =
            selectedInModule === group.permissions.length;

          return (
            <View key={group.module} style={styles.moduleCard}>
              <TouchableOpacity
                style={styles.moduleHeader}
                onPress={() => toggleModuleCollapse(group.module)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleTitleRow}>
                  <Text style={styles.expandIcon}>
                    {isCollapsed ? '▶' : '▼'}
                  </Text>
                  <Text style={styles.moduleName}>
                    {group.module.toUpperCase()}
                  </Text>
                  <Text style={styles.moduleBadge}>
                    {selectedInModule}/{group.permissions.length}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.toggleModuleBtn,
                    allModuleSelected && styles.toggleModuleBtnActive,
                  ]}
                  onPress={() => handleToggleModuleAll(group.permissions)}
                >
                  <Text
                    style={[
                      styles.toggleModuleBtnText,
                      allModuleSelected && styles.toggleModuleBtnTextActive,
                    ]}
                  >
                    {allModuleSelected ? 'Clear' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {!isCollapsed && (
                <View style={styles.permissionsContainer}>
                  {group.permissions.map((perm) => {
                    const isChecked = selectedIds.has(perm.id);

                    return (
                      <TouchableOpacity
                        key={perm.id}
                        style={[
                          styles.permItem,
                          isChecked && styles.permItemChecked,
                        ]}
                        onPress={() => togglePermission(perm.id)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            isChecked && styles.checkboxChecked,
                          ]}
                        >
                          {isChecked && <Text style={styles.checkmark}>✓</Text>}
                        </View>

                        <View style={styles.permTextContainer}>
                          <Text style={styles.permName}>{perm.name}</Text>
                          <Text style={styles.permCode}>{perm.code}</Text>
                          {perm.description ? (
                            <Text style={styles.permDesc}>
                              {perm.description}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              Save Permissions ({selectedIds.size})
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 14,
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
  roleSubhead: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  countBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countText: {
    color: '#4338CA',
    fontSize: 13,
    fontWeight: '700',
  },
  toolButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toolBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scrollList: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  moduleBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toggleModuleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleModuleBtnActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  toggleModuleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  toggleModuleBtnTextActive: {
    color: Colors.danger,
  },
  permissionsContainer: {
    padding: 8,
    gap: 6,
  },
  permItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  permItemChecked: {
    borderColor: '#C7D2FE',
    backgroundColor: '#F5F7FF',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 10,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  permTextContainer: {
    flex: 1,
  },
  permName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  permCode: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  permDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
