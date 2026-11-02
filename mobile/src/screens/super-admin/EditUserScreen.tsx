
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  getUserById,
  updateUser,
  User,
  UpdateUserData,
} from '../../api/users.api';

export default function EditUserScreen({ route, navigation }: any) {
  const userId = route.params?.userId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UpdateUserData>({
    username: '',
    email: '',
    mobile: '',
    first_name: '',
    last_name: '',
    user_type: 'FACULTY',
    college_id: null,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user: User = await getUserById(userId);

        setForm({
          username: user.username,
          email: user.email,
          mobile: user.mobile || '',
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          college_id: user.college_id,
        });
      } catch (error: any) {
        Alert.alert(
          'Error',
          error?.response?.data?.message || 'User details load zale nahi.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    } else {
      setLoading(false);
      Alert.alert('Error', 'User ID missing.');
    }
  }, [userId]);

  const updateField = (field: keyof UpdateUserData, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleUpdate = async () => {
    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.user_type
    ) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    try {
      setSaving(true);

      await updateUser(userId, {
        ...form,
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      });

      Alert.alert('Success', 'User updated successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'User update failed.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading user...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit User</Text>

      <Text style={styles.label}>First Name *</Text>
      <TextInput
        style={styles.input}
        value={form.first_name}
        onChangeText={(value) => updateField('first_name', value)}
        placeholder="First name"
      />

      <Text style={styles.label}>Last Name *</Text>
      <TextInput
        style={styles.input}
        value={form.last_name}
        onChangeText={(value) => updateField('last_name', value)}
        placeholder="Last name"
      />

      <Text style={styles.label}>Username *</Text>
      <TextInput
        style={styles.input}
        value={form.username}
        onChangeText={(value) => updateField('username', value)}
        autoCapitalize="none"
        placeholder="Username"
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        value={form.email}
        onChangeText={(value) => updateField('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
      />

      <Text style={styles.label}>Mobile</Text>
      <TextInput
        style={styles.input}
        value={form.mobile || ''}
        onChangeText={(value) => updateField('mobile', value)}
        keyboardType="phone-pad"
        placeholder="Mobile number"
      />

      <Text style={styles.label}>User Type *</Text>
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

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleUpdate}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Update User</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
