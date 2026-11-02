
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { apiClient } from '../../api/client';

interface College {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

type EditCollegeRouteParams = {
  EditCollege: {
    college: College;
  };
};

const EditCollegeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<EditCollegeRouteParams, 'EditCollege'>>();

  const college = route.params?.college;

  const [code, setCode] = useState(college?.code ?? '');
  const [name, setName] = useState(college?.name ?? '');
  const [email, setEmail] = useState(college?.email ?? '');
  const [phone, setPhone] = useState(college?.phone ?? '');
  const [address, setAddress] = useState(college?.address ?? '');
  const [website, setWebsite] = useState(college?.website ?? '');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    if (!college?.id) {
      Alert.alert('Error', 'College ID is missing. Please select a college again.');
      return;
    }

    if (!code.trim() || !name.trim()) {
      Alert.alert('Validation Error', 'College code and name are required.');
      return;
    }

    try {
      setSaving(true);

      const response = await apiClient.put(`/colleges/${college.id}`, {
        code: code.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
      });

      const data: any = response?.data ?? response;

      if (data?.success) {
        Alert.alert(
          'Success',
          'College details updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Update Failed',
          data?.message || 'Unable to update college details.'
        );
      }
    } catch (error: any) {
      console.error(
        'Update college failed:',
        error?.response?.status,
        error?.response?.data,
        error?.message
      );

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          'Could not update college. Please check the backend connection.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!college) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>College details not found.</Text>
        <Text style={styles.helperText}>
          Please go back and select a college to edit.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit College</Text>
        <Text style={styles.subtitle}>
          Update college information
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>College Information</Text>

          <Text style={styles.label}>College Code *</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Enter college code"
            autoCapitalize="characters"
            maxLength={30}
          />

          <Text style={styles.label}>College Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter college name"
            maxLength={150}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter college email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter college address"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={setWebsite}
            placeholder="Enter website URL"
            keyboardType="url"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditCollegeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: 10,
  },
  backText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#172554',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 85,
  },
  primaryButton: {
    backgroundColor: '#103076',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.65,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F3F6FB',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
});
