
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { DashboardApi } from '../../api/dashboard.api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Colors } from '../../constants/colors';

export const SuperAdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [stats, setStats] = useState({
    total_colleges: 0,
    total_students: 0,
    total_faculty: 0,
    college_admins: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadDashboard = async () => {
        try {
          setLoading(true);
          setError('');

          const response = await DashboardApi.getDashboardData();

          // API response madhun dashboard data ghya.
          const data = response?.data ?? response;

          if (!isActive) {
            return;
          }

          setStats({
            total_colleges: Number(data?.total_colleges ?? 0),
            total_students: Number(data?.total_students ?? 0),
            total_faculty: Number(data?.total_faculty ?? 0),
            college_admins: Number(data?.college_admins ?? 0),
          });
        } catch (err) {
          if (isActive) {
            setError(
              'Dashboard data load zale nahi. Backend ani API check kara.'
            );
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadDashboard();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Header
        title="Super Admin Portal"
        subtitle="College ERP System Management"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.welcome}>Welcome, Super Admin!</Text>

        <Text style={styles.description}>
          Manage colleges, users and the overall ERP system.
        </Text>

        <Text style={styles.sectionTitle}>SYSTEM OVERVIEW</Text>

        {error !== '' && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.statsRow}>
          <StatCard
            title="Total Colleges"
            value={loading ? '...' : String(stats.total_colleges)}
            subtitle="Registered colleges"
            color={Colors.primary}
          />

          <StatCard
            title="Total Students"
            value={loading ? '...' : String(stats.total_students)}
            subtitle="Across colleges"
            color={Colors.secondary}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Total Faculty"
            value={loading ? '...' : String(stats.total_faculty)}
            subtitle="Faculty members"
            color={Colors.accent}
          />

          <StatCard
            title="College Admins"
            value={loading ? '...' : String(stats.college_admins)}
            subtitle="Admin accounts"
            color={Colors.danger}
          />
        </View>

        <Text style={styles.sectionTitle}>MANAGEMENT MODULES</Text>

        {/* College Management */}
        <Card style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>College Management</Text>

          <Text style={styles.moduleDescription}>
            Manage college registration and college information.
          </Text>

          <TouchableOpacity
            style={styles.addCollegeButton}
            onPress={() => navigation.navigate('AddCollege')}
            activeOpacity={0.8}
          >
            <Text style={styles.addCollegeButtonText}>
              + Add College
            </Text>
          </TouchableOpacity>
        </Card>

        {/* User Management */}
        <Card style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>User Management</Text>

          <Text style={styles.moduleDescription}>
            Manage administrators, faculty and student accounts.
          </Text>
        </Card>

        {/* System Monitoring */}
        <Card style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>System Monitoring</Text>

          <Text style={styles.moduleDescription}>
            Review system status, reports and overall activity.
          </Text>
        </Card>

        {/* Reports and Analytics */}
        <Card style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>Reports &amp; Analytics</Text>

          <Text style={styles.moduleDescription}>
            View consolidated reports across colleges.
          </Text>
        </Card>

        <Text style={styles.note}>
          Statistics are loaded from the dashboard API.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingBottom: 24,
  },

  welcome: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginHorizontal: 16,
    marginTop: 20,
  },

  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 16,
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 6,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
  },

  moduleCard: {
    padding: 16,
    marginHorizontal: 12,
    marginTop: 10,
  },

  addCollegeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 14,
    alignItems: 'center',
  },

  addCollegeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  moduleDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 19,
  },

  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginHorizontal: 16,
    marginTop: 10,
  },

  note: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginHorizontal: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});
