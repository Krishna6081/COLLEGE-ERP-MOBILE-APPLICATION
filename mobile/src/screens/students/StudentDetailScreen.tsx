
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';

export const StudentDetailScreen: React.FC<{ route: any }> = ({ route }) => {

  // Temporary student data
  // Later connect this with backend API

  const student = {
    name: 'Alex Johnson',
    initials: 'AJ',
    admissionNo: 'ADM-2023-001',
    enrollmentNo: 'ENR-2023-1001',
    prn: 'PRN20230001',
    dob: '15 August 2004',
    gender: 'Male',
    email: 'alex.johnson@student.edu',
    mobile: '+91 99000 00008',
    address: '123 Baker Street, Tech City',
    course: 'B.Tech',
    department: 'Computer Science',
    year: 'Third Year',
    semester: 'Semester 5',
    division: 'A',
    guardianName: 'Robert Johnson',
    guardianMobile: '+91 98765 43210',
    guardianRelation: 'Father',
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Student Profile"
        subtitle="Personal & Academic Details"
      />

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Profile Header */}
        <Card style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{student.initials}</Text>
          </View>

          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.sub}>
            {student.course} {student.department} • {student.semester}
          </Text>

          <Badge label="Active Student" type="success" />
        </Card>

        {/* Personal Details */}
        <Card>
          <Text style={styles.cardHeader}>Personal Details</Text>
          <DetailRow label="Full Name" value={student.name} />
          <DetailRow label="Date of Birth" value={student.dob} />
          <DetailRow label="Gender" value={student.gender} />
        </Card>

        {/* Enrollment Details */}
        <Card>
          <Text style={styles.cardHeader}>Enrollment Details</Text>
          <DetailRow label="Admission Number" value={student.admissionNo} />
          <DetailRow label="Enrollment Number" value={student.enrollmentNo} />
          <DetailRow label="PRN Number" value={student.prn} />
        </Card>

        {/* Contact Information */}
        <Card>
          <Text style={styles.cardHeader}>Contact Information</Text>
          <DetailRow label="Email" value={student.email} />
          <DetailRow label="Mobile" value={student.mobile} />
          <DetailRow label="Address" value={student.address} />
        </Card>

        {/* Academic Information */}
        <Card>
          <Text style={styles.cardHeader}>Academic Information</Text>
          <DetailRow label="Course" value={student.course} />
          <DetailRow label="Department" value={student.department} />
          <DetailRow label="Year" value={student.year} />
          <DetailRow label="Semester" value={student.semester} />
          <DetailRow label="Division" value={student.division} />
        </Card>

        {/* Parent / Guardian Details */}
        <Card>
          <Text style={styles.cardHeader}>Parent / Guardian Details</Text>
          <DetailRow label="Guardian Name" value={student.guardianName} />
          <DetailRow label="Relation" value={student.guardianRelation} />
          <DetailRow label="Guardian Mobile" value={student.guardianMobile} />
        </Card>

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
    paddingBottom: 20,
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarTxt: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginVertical: 4,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
});
