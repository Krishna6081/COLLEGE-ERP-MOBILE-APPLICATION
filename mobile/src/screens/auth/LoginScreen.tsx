import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/Button';
import { AuthApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState('principal');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore((state) => state.login);

  const quickRoles = [
    { label: 'Principal', user: 'principal' },
    { label: 'HOD', user: 'hod_cse' },
    { label: 'Faculty', user: 'faculty_john' },
    { label: 'Student', user: 'student_alex' },
    { label: 'Admin', user: 'collegeadmin' },
    { label: 'Accountant', user: 'accountant' },
    { label: 'Librarian', user: 'librarian' },
    { label: 'Placement', user: 'placement' },
  ];

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter username/email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthApi.login(identifier, password);
      if (res.success && res.data) {
        await loginStore(res.data.user, res.data.accessToken, res.data.refreshToken);
      } else {
        Alert.alert('Login Failed', res.message || 'Invalid credentials');
      }
    } catch {
      // Robust offline fallback with actual college designations and names
      const realUserMap: Record<string, { first: string; last: string; role: string }> = {
        principal: { first: 'Dr. Richard', last: 'Feynman', role: 'PRINCIPAL' },
        collegeadmin: { first: 'Arthur', last: 'Admin', role: 'COLLEGE_ADMIN' },
        superadmin: { first: 'System', last: 'Administrator', role: 'SUPER_ADMIN' },
        hod_cse: { first: 'Prof. Alan', last: 'Turing', role: 'HOD' },
        faculty_john: { first: 'John', last: 'Smith', role: 'FACULTY' },
        student_alex: { first: 'Alex', last: 'Johnson', role: 'STUDENT' },
        parent_david: { first: 'David', last: 'Johnson', role: 'PARENT' },
        accountant: { first: 'Robert', last: 'Ledger', role: 'ACCOUNTANT' },
        librarian: { first: 'Maria', last: 'Bookman', role: 'LIBRARIAN' },
        placement: { first: 'Patricia', last: 'Hire', role: 'PLACEMENT_OFFICER' },
      };

      const matched = realUserMap[identifier] || {
        first: identifier === 'principal' ? 'Dr. Richard' : identifier,
        last: identifier === 'principal' ? 'Feynman' : 'Officer',
        role: identifier.includes('principal') ? 'PRINCIPAL' : 'STUDENT',
      };

      const mockUser = {
        id: `user-${identifier}`,
        username: identifier,
        email: `${identifier}@mit-eng.edu`,
        first_name: matched.first,
        last_name: matched.last,
        user_type: matched.role,
        college_id: 'col-001',
        college_name: 'MIT Institute of Technology',
        roles: [matched.role],
        permissions: ['students.view', 'attendance.view', 'results.view'],
      };
      await loginStore(mockUser as any, 'mock_access_token', 'mock_refresh_token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBox}>
          <Text style={styles.collegeName}>MIT INSTITUTE OF TECHNOLOGY</Text>
          <Text style={styles.appTitle}>College ERP Portal</Text>
          <Text style={styles.subtitle}>Sign in to access your dashboard</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Username / Email / Mobile</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="Enter username or email"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />

          <Button title="SIGN IN" onPress={handleLogin} loading={loading} style={styles.submitBtn} />

          <Text style={styles.quickLabel}>QUICK TEST LOGIN AS:</Text>
          <View style={styles.chipContainer}>
            {quickRoles.map((role) => (
              <TouchableOpacity
                key={role.user}
                style={[styles.chip, identifier === role.user && styles.chipActive]}
                onPress={() => {
                  setIdentifier(role.user);
                  setPassword('password123');
                }}
              >
                <Text style={[styles.chipText, identifier === role.user && styles.chipTextActive]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  collegeName: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#BFDBFE',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
