import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { apiClient } from '../../api/client';

interface StudentProfile {
  student_id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  department_name?: string;
  program_name?: string;
  course_name?: string;
  division_name?: string;
  semester_name?: string;
  academic_year?: string;
  guardian_name?: string;
  guardian_mobile?: string;
}

export default function StudentProfileScreen() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response: any = await apiClient.get('/students/my-profile');

      if (response.success) {
        setProfile(response.data);
      } else {
        Alert.alert('Error', 'Unable to load student profile');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to fetch profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const InfoItem = ({ label, value }: {
    label: string;
    value?: string | number;
  }) => (
    <View style={styles.infoItem}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Not Available'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0c2466" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Student profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>My Profile</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoItem
          label="Full Name"
          value={`${profile.first_name || ''} ${profile.middle_name || ''} ${profile.last_name || ''}`.trim()}
        />
        <InfoItem label="Student ID" value={profile.student_id} />
        <InfoItem label="Email" value={profile.email} />
        <InfoItem label="Mobile" value={profile.mobile} />
        <InfoItem label="Gender" value={profile.gender} />
        <InfoItem label="Date of Birth" value={profile.date_of_birth} />
        <InfoItem label="Address" value={profile.address} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <InfoItem label="Department" value={profile.department_name} />
        <InfoItem label="Program" value={profile.program_name} />
        <InfoItem label="Course" value={profile.course_name} />
        <InfoItem label="Division" value={profile.division_name} />
        <InfoItem label="Semester" value={profile.semester_name} />
        <InfoItem label="Academic Year" value={profile.academic_year} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Guardian Information</Text>
        <InfoItem label="Guardian Name" value={profile.guardian_name} />
        <InfoItem label="Guardian Mobile" value={profile.guardian_mobile} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0c2466',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c2466',
    marginBottom: 12,
  },
  infoItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#777',
  },
  value: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});