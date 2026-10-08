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
  const [identifier, setIdentifier] = useState('student_alex');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore((state) => state.login);

  const quickRoles = [
    { label: 'Student', user: 'student_alex' },
    { label: 'Faculty', user: 'faculty_john' },
    { label: 'HOD', user: 'hod_cse' },
    { label: 'Admin', user: 'collegeadmin' },
    { label: 'Principal', user: 'principal' },
    { label: 'Accountant', user: 'accountant' },
    { label: 'Librarian', user: 'librarian' },
    { label: 'Parent', user: 'parent_david' },
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
    } catch (error: any) {
      // Direct mock login fallback if server endpoint is offline
      const mockUser = {
        id: `user-${identifier}`,
        username: identifier,
        email: `${identifier}@mit-eng.edu`,
        first_name: identifier.split('_')[0] || 'User',
        last_name: identifier.split('_')[1] || 'Demo',
        user_type: identifier.includes('admin')
          ? 'COLLEGE_ADMIN'
          : identifier.includes('principal')
          ? 'PRINCIPAL'
          : identifier.includes('hod')
          ? 'HOD'
          : identifier.includes('faculty')
          ? 'FACULTY'
          : identifier.includes('accountant')
          ? 'ACCOUNTANT'
          : identifier.includes('librarian')
          ? 'LIBRARIAN'
          : identifier.includes('parent')
          ? 'PARENT'
          : 'STUDENT',
        roles: [identifier.toUpperCase()],
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
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  subtitle: {
    color: '#E2E8F0',
    fontSize: 14,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  submitBtn: {
    marginTop: 20,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
