
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getInitials = () => {
    if (user?.user_type === 'PRINCIPAL') return 'RF';
    if (user?.user_type === 'HOD') return 'AT';

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
        {
          text: 'Cancel',
          style: 'cancel',
        },
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
      <Header
        title="My Profile"
        subtitle="Personal & Account Information"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{getInitials()}</Text>
          </View>

          <Text style={styles.name}>{getDisplayName()}</Text>

          <Text style={styles.designation}>
            {getDesignation()}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.role}>
              {user?.user_type || 'PRINCIPAL'}
            </Text>
          </View>

          <Badge
            label={user?.college_name || 'MIT Institute of Technology'}
            type="info"
          />
        </Card>

        {/* Account Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.headerTxt}>
            Account Information
          </Text>

          <View style={styles.credentialRow}>
            <Text style={styles.credentialLabel}>Username</Text>
            <Text style={styles.credentialValue}>
              {user?.username ||
                (user?.user_type === 'HOD' ? 'hod_cse' : 'principal')}
            </Text>
          </View>

          <View style={styles.credentialRow}>
            <Text style={styles.credentialLabel}>Official Email</Text>
            <Text style={styles.credentialValue}>
              {user?.email ||
                (user?.user_type === 'HOD'
                  ? 'hod.cse@mit-eng.edu'
                  : 'principal@mit-eng.edu')}
            </Text>
          </View>

          <View style={styles.credentialRow}>
            <Text style={styles.credentialLabel}>Employee ID</Text>
            <Text style={styles.credentialValue}>
              {user?.id ||
                (user?.user_type === 'HOD'
                  ? 'EMP-CSE-001'
                  : 'EMP-EXEC-001')}
            </Text>
          </View>

          <View style={[styles.credentialRow, styles.lastRow]}>
            <Text style={styles.credentialLabel}>Designation</Text>
            <Text style={styles.credentialValue}>
              {getDesignation()}
            </Text>
          </View>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>
            🚪  Sign Out
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          College ERP System
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },

  scroll: {
    paddingBottom: 40,
  },

  profileCard: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 18,
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#0C2466',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#E0E7FF',
    elevation: 5,
    shadowColor: '#0C2466',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  avatarTxt: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0C2466',
    textAlign: 'center',
    marginHorizontal: 12,
  },

  designation: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
    marginBottom: 12,
    textAlign: 'center',
  },

  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  role: {
    fontSize: 12,
    color: '#3730A3',
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  infoCard: {
    padding: 18,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  headerTxt: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0C2466',
    marginBottom: 14,
  },

  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F7',
    gap: 12,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  credentialLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },

  credentialValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1.5,
    textAlign: 'right',
  },

  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 22,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 15,
  },

  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 20,
  },
});
