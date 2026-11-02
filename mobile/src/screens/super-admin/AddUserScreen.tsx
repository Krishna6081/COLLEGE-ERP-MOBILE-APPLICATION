
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
import { createUser, CreateUserData } from '../../api/users.api';

export default function AddUserScreen({ navigation }: any) {
  const [form, setForm] = useState<CreateUserData>({
    username: '',
    email: '',
    password: '',
    mobile: '',
    first_name: '',
    last_name: '',
    user_type: 'FACULTY',
  });

  const [saving, setSaving] = useState(false);

  const updateField = (field: keyof CreateUserData, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.user_type
    ) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    try {
      setSaving(true);

      await createUser({
        ...form,
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      });

      Alert.alert('Success', 'User created successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
  console.log('CREATE USER ERROR:', error);
  console.log('ERROR RESPONSE:', error?.response?.data);
  console.log('API URL:', error?.config?.baseURL);
  console.log('ERROR MESSAGE:', error?.message);

  Alert.alert(
    'Create User Failed',
    error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Check the terminal.'
  );
}finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add New User</Text>

      <Text style={styles.label}>First Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter first name"
        value={form.first_name}
        onChangeText={(value) => updateField('first_name', value)}
      />

      <Text style={styles.label}>Last Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter last name"
        value={form.last_name}
        onChangeText={(value) => updateField('last_name', value)}
      />

      <Text style={styles.label}>Username *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter username"
        autoCapitalize="none"
        value={form.username}
        onChangeText={(value) => updateField('username', value)}
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(value) => updateField('email', value)}
      />

      <Text style={styles.label}>Password *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        secureTextEntry
        value={form.password}
        onChangeText={(value) => updateField('password', value)}
      />

      <Text style={styles.label}>Mobile</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter mobile number"
        keyboardType="phone-pad"
        value={form.mobile || ''}
        onChangeText={(value) => updateField('mobile', value)}
      />

      <Text style={styles.label}>User Type *</Text>
      <View style={styles.typeContainer}>
        {[
          'COLLEGE_ADMIN',
          'PRINCIPAL',
          'VICE_PRINCIPAL',
          'HOD',
          'FACULTY',
          'STUDENT',
          'PARENT',
          'ACCOUNTANT',
          'LIBRARIAN',
          'EXAM_CELL',
          'PLACEMENT_OFFICER',
          'NON_TEACHING_STAFF',
        ].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              form.user_type === type && styles.selectedType,
            ]}
            onPress={() => updateField('user_type', type)}
          >
            <Text
              style={[
                styles.typeText,
                form.user_type === type && styles.selectedTypeText,
              ]}
            >
              {type.replace(/_/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Create User</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F7FB',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#172554',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  typeContainer: {
    marginBottom: 20,
  },
  typeButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  selectedType: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  typeText: {
    color: '#374151',
  },
  selectedTypeText: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#143374',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
