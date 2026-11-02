import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getRoleById, updateRole, RoleDetail } from '../../api/roles.api';
import { Colors } from '../../constants/colors';

export default function EditRoleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const roleId = route.params?.roleId;

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId) {
        Alert.alert('Error', 'Role ID missing.');
        navigation.goBack();
        return;
      }

      try {
        setLoading(true);
        const data = await getRoleById(roleId);
        setRole(data);
        setName(data.name || '');
        setDescription(data.description || '');
      } catch (error: any) {
        console.error('Failed to load role details:', error);
        Alert.alert(
          'Error',
          error?.message || error?.response?.data?.message || 'Failed to load role details.'
        );
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Role name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      await updateRole(roleId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      Alert.alert('Success', 'Role updated successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      Alert.alert(
        'Update Failed',
        error?.message || error?.response?.data?.message || 'Could not update role.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading role details...</Text>
      </View>
    );
  }

  const isSystem = role?.is_system === 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Edit Role</Text>
        <Text style={styles.subheading}>
          Update role title and descriptive information
        </Text>
      </View>

      <View style={styles.formCard}>
        {isSystem && (
          <View style={styles.systemNotice}>
            <Text style={styles.systemNoticeTitle}>🛡️ System Protected Role</Text>
            <Text style={styles.systemNoticeText}>
              This is a built-in ERP role. Its unique code is fixed to maintain operational stability across all modules.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Role Code (Read-Only)</Text>
        <View style={styles.readonlyInput}>
          <Text style={styles.readonlyCodeText}>{role?.code}</Text>
        </View>

        <Text style={styles.label}>Role Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter role name"
          placeholderTextColor={Colors.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description..."
          placeholderTextColor={Colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.managePermsBtn}
            onPress={() =>
              navigation.navigate('AssignPermissions', {
                roleId: role?.id,
                roleName: role?.name,
                isSystem: isSystem,
              })
            }
          >
            <Text style={styles.managePermsText}>🔑 Manage Role Permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, saving && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
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
  formCard: {
    margin: 16,
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
  },
  systemNotice: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  systemNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3730A3',
    marginBottom: 2,
  },
  systemNoticeText: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  readonlyInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  readonlyCodeText: {
    fontFamily: 'monospace',
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 90,
  },
  buttonRow: {
    marginTop: 24,
    gap: 12,
  },
  managePermsBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  managePermsText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
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
