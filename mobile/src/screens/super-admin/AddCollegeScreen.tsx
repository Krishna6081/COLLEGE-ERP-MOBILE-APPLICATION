
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { createCollege } from '../../api/erp.api';

export const AddCollegeScreen: React.FC = () => {
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateCollege = async () => {
    if (
      !collegeName.trim() ||
      !collegeCode.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim()
    ) {
      Alert.alert('Required Fields', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);

      const result = await createCollege({
        name: collegeName.trim(),
        code: collegeCode.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: `${address.trim()}, ${city.trim()}, ${state.trim()}`,
      });

      console.log('College API response:', result);

      Alert.alert('Success', 'College added successfully!');

      setCollegeName('');
      setCollegeCode('');
      setEmail('');
      setPhone('');
      setAddress('');
      setCity('');
      setState('');
    } catch (error: any) {
      console.log('Create college error:', error);

      Alert.alert(
        'Error',
        error?.message ||
          error?.error?.message ||
          'Failed to save college. Please check the backend connection and login.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Add New College</Text>
      <Text style={styles.subtitle}>
        Enter the college details below.
      </Text>

      <Text style={styles.label}>College Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter college name"
        value={collegeName}
        onChangeText={setCollegeName}
      />

      <Text style={styles.label}>College Code *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter unique college code"
        value={collegeCode}
        onChangeText={setCollegeCode}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="college@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Contact Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter contact number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Enter college address"
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>State *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter state"
        value={state}
        onChangeText={setState}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleCreateCollege}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Create College'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  multiline: {
    minHeight: 85,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 26,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
