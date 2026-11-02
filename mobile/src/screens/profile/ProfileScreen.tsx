import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getInitials = () => {
    if (user?.user_type === 'PRINCIPAL') {
      return 'RF';
    }
    if (user?.user_type === 'HOD') {
      return 'AT';
    }
    const first = user?.first_name?.[0] || 'U';
    const last = user?.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const getDisplayName = () => {
    if (user?.first_name) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    if (user?.user_type === 'PRINCIPAL') {
      return 'Dr. Richard Feynman';
    }
    if (user?.user_type === 'HOD') {
      return 'Prof. Alan Turing';
    }
    return 'College User';
  };

  const getDesignation = () => {
    if (user?.user_type === 'PRINCIPAL') {
      return 'Principal & Executive Head';
    }
    if (user?.user_type === 'HOD') {
      return 'Head of Department & Professor (CSE)';
    }
    if (user?.user_type === 'FACULTY') {
      return 'Associate Professor';
    }
    return user?.user_type || 'Academic Staff';
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of the College ERP portal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Executive Profile" subtitle="Personal & Institutional ERP Account" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{getInitials()}</Text>
          </View>
          <Text style={styles.name}>{getDisplayName()}</Text>
          <Text style={styles.role}>{user?.user_type || 'PRINCIPAL'}</Text>
          <Badge label={user?.college_name || 'MIT Institute of Technology'} type="info" />
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.headerTxt}>Account Credentials</Text>
          <View style={styles.credentialRow}>
            <Text style={styles.credentialLabel}>Username:</Text>
            <Text style={styles.credentialValue}>
              {user?.username || (user?.user_type === 'HOD' ? 'hod_cse' : 'principal')}
            </Text>
          </View>
          <View style={styles.credentialRow}>
            <Text style={styles.credentialLabel}>Official Email:</Text>
            <Text style={styles.credentialValue}>
              {user?.email || (user?.user_type === 'HOD' ? 'hod.cse@mit-eng.edu' : 'principal@mit-eng.edu')}
            </Text>
          </View>
          <View style={styles.credentialRow}>
            <Text style={styles.credentialLabel}>Employee ID:</Text>
            <Text style={styles.credentialValue}>
              {user?.id || (user?.user_type === 'HOD' ? 'EMP-CSE-001' : 'EMP-EXEC-001')}
            </Text>
          </View>
          <View style={styles.credentialRow}>
            <Text style={styles.credentialLabel}>Designation:</Text>
            <Text style={styles.credentialValue}>{getDesignation()}</Text>
          </View>
        </Card>

        {/* Action Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarTxt: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  role: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  infoCard: {
    padding: 18,
    marginTop: 8,
  },
  headerTxt: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  credentialLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  credentialValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
});
