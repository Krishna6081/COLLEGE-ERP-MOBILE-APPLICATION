
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
          const data = response?.data ?? response;

          if (!isActive) return;

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
          if (isActive) setLoading(false);
        }
      };

      loadDashboard();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const renderButton = (
    title: string,
    screenName: string,
    primary = false
  ) => (
    <TouchableOpacity
      style={primary ? styles.primaryButton : styles.secondaryButton}
      onPress={() => navigation.navigate(screenName)}
      activeOpacity={0.8}
    >
      <Text
        style={
          primary
            ? styles.primaryButtonText
            : styles.secondaryButtonText
        }
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Super Admin Portal"
        subtitle="College ERP System Management"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
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

          {renderButton('+ Add College', 'AddCollege', true)}
          {renderButton('View All Colleges', 'ViewAllColleges')}
        </Card>

        {/* User Management */}
        <Card style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>User Management</Text>

          <Text style={styles.moduleDescription}>
            Manage administrators, faculty and student accounts.
          </Text>

          {renderButton('+ Add User', 'AddUser', true)}
          {renderButton('View All Users', 'UserList')}
        </Card>

        {/* Role & Permission Management */}
        <Card style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>
            Role & Permission Management
          </Text>

          <Text style={styles.moduleDescription}>
            Manage system and custom roles, configure access
            permissions, and manage RBAC.
          </Text>

          {renderButton('+ Add Role', 'AddRole', true)}
          {renderButton('View All Roles', 'RoleList')}
        </Card>

        {/* Academic Configuration */}
        <Card style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>Academic Configuration</Text>

          <Text style={styles.moduleDescription}>
            Manage academic years, semesters, departments and courses.
          </Text>

          {renderButton('Academic Years', 'AcademicYear', true)}
          {renderButton('Semesters', 'SemesterManagement')}
          {renderButton('Departments', 'DepartmentManagement')}
          {renderButton('Courses', 'CourseManagement')}
        </Card>

        {/* Notice Management */}
        <Card style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>Notice Management</Text>

          <Text style={styles.moduleDescription}>
            Create, edit, publish and manage college announcements
            and notices.
          </Text>

          {renderButton('Manage Notices', 'NoticeManagement', true)}
        </Card>

        {/* System Monitoring */}
        <Card style={styles.moduleCard}>
          <Text style={styles.moduleTitle}>System Monitoring</Text>

          <Text style={styles.moduleDescription}>
            Review system status, reports and overall activity.
          </Text>
          <TouchableOpacity
  style={styles.moduleCard}
  onPress={() => navigation.navigate('SystemMonitoring' as never)}
>
  <Text style={styles.moduleTitle}>System Monitoring</Text>
  <Text style={styles.moduleDescription}>
    Monitor backend, database, API health and activity logs.
  </Text>
  <Text style={{ color: '#0c2466', fontWeight: 'bold', marginTop: 10 }}>
    View Monitoring →
  </Text>
</TouchableOpacity>
        </Card>

       
       {/* Reports & Analytics */}
<TouchableOpacity
  activeOpacity={0.7}
  onPress={() => navigation.navigate('Reports')}
>
  <Card style={styles.moduleCard}>
    <Text style={styles.moduleTitle}>Reports & Analytics</Text>

    <Text style={styles.moduleDescription}>
      View consolidated reports across colleges.
    </Text>
  </Card>
</TouchableOpacity>

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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 30,
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

  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 14,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: Colors.primary,
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
    marginBottom: 10,
    textAlign: 'center',
  },
});
