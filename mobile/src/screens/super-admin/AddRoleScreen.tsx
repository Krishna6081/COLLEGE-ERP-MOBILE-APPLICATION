import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { createRole } from '../../api/roles.api';
import { Colors } from '../../constants/colors';

export default function AddRoleScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [autoGenerateCode, setAutoGenerateCode] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoGenerateCode) {
      const generatedCode = val
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      setCode(generatedCode);
    }
  };

  const handleCodeChange = (val: string) => {
    setAutoGenerateCode(false);
    const formatted = val
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_');
    setCode(formatted);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a role name.');
      return;
    }
    if (!code.trim()) {
      Alert.alert('Validation Error', 'Please enter a unique role code.');
      return;
    }

    try {
      setSaving(true);
      const createdRole = await createRole({
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || undefined,
      });

      Alert.alert(
        'Success',
        `Role "${createdRole.name}" created successfully. Would you like to assign permissions now?`,
        [
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Assign Permissions',
            onPress: () => {
              navigation.replace('AssignPermissions', {
                roleId: createdRole.id,
                roleName: createdRole.name,
                isSystem: false,
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to create role:', error);
      Alert.alert(
        'Create Role Failed',
        error?.message || error?.response?.data?.message || 'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Add New Role</Text>
        <Text style={styles.subheading}>
          Create a new role to assign to college personnel or students
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Role Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dean of Academics, Lab In-charge"
          placeholderTextColor={Colors.textSecondary}
          value={name}
          onChangeText={handleNameChange}
        />

        <View style={styles.codeHeader}>
          <Text style={styles.label}>Role Code (Identifier) *</Text>
          <TouchableOpacity
            onPress={() => {
              setAutoGenerateCode(true);
              const generated = name
                .toUpperCase()
                .replace(/[^A-Z0-9\s]/g, '')
                .trim()
                .replace(/\s+/g, '_');
              setCode(generated);
            }}
          >
            <Text style={styles.autoGenText}>⚡ Auto-generate</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="e.g. DEAN_ACADEMICS, LAB_INCHARGE"
          placeholderTextColor={Colors.textSecondary}
          value={code}
          onChangeText={handleCodeChange}
          autoCapitalize="characters"
        />
        <Text style={styles.hintText}>
          Unique system identifier using capital letters and underscores.
        </Text>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe duties, responsibilities, or access level for this role..."
          placeholderTextColor={Colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Role</Text>
          )}
        </TouchableOpacity>
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
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoGenText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
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
  codeInput: {
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  textArea: {
    minHeight: 90,
  },
  hintText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 24,
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
});
