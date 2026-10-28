import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { DashboardApi } from '../../api/dashboard.api';

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await DashboardApi.getDashboardData();
      if (res?.data) setDashData(res.data);
    } catch {
      // Dashboard data optional - profile works without it
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'U';
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Name unavailable';
  const isStudent = user?.user_type === 'STUDENT';

  const infoRows: { label: string; value: string }[] = [
    { label: 'Username', value: user?.username || '—' },
    { label: 'Email', value: user?.email || '—' },
    { label: 'Role', value: user?.user_type || '—' },
    { label: 'College', value: user?.college_name || '—' },
  ];

  if (isStudent && dashData) {
    if (dashData.program)    infoRows.push({ label: 'Program', value: dashData.program });
    if (dashData.department) infoRows.push({ label: 'Department', value: dashData.department });
    if (dashData.semester)   infoRows.push({ label: 'Semester', value: dashData.semester });
    if (dashData.attendance_percentage !== undefined) {
      infoRows.push({ label: 'Attendance', value: `${dashData.attendance_percentage}%` });
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Header title="My Profile" subtitle="Personal & Academic Information" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProfile(); }} colors={[Colors.primary]} />}
      >
        {/* Avatar Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.roleText}>{user?.user_type?.replace(/_/g, ' ') || 'Role unavailable'}</Text>
          {user?.college_name && (
            <Badge label={user.college_name} type="info" />
          )}
        </Card>

        {/* Attendance highlight for students */}
        {isStudent && dashData?.attendance_percentage !== undefined && (
          <Card style={styles.attendanceCard}>
            <View style={styles.attendanceRow}>
              <View>
                <Text style={styles.attLabel}>Attendance</Text>
                <Text style={styles.attSub}>{dashData.attended_lectures ?? 0}/{dashData.total_lectures ?? 0} Lectures</Text>
              </View>
              <Text style={[
                styles.attPct,
                { color: dashData.attendance_percentage < 75 ? Colors.danger : Colors.accent }
              ]}>
                {dashData.attendance_percentage}%
              </Text>
            </View>
            {dashData.shortage_alert && (
              <Text style={styles.shortageAlert}>⚠️ Attendance below 75% — improvement required</Text>
            )}
          </Card>
        )}

        {/* Account Details */}
        <Card>
          <Text style={styles.sectionTitle}>Account Details</Text>
          {infoRows.map((row, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue} numberOfLines={1}>{row.value}</Text>
            </View>
          ))}
        </Card>

        {/* Security info */}
        <Card>
          <Text style={styles.sectionTitle}>Security</Text>
          <Text style={styles.secTxt}>Your account is secured with bcrypt password hashing and JWT authentication.</Text>
          <Text style={[styles.secTxt, { marginTop: 4 }]}>User ID: <Text style={styles.idTxt}>{user?.id || '—'}</Text></Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },
  profileCard: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarTxt: { fontSize: 30, color: '#FFFFFF', fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  roleText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10, fontWeight: '600', letterSpacing: 0.5 },
  attendanceCard: { borderLeftWidth: 4, borderLeftColor: Colors.accent },
  attendanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  attSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  attPct: { fontSize: 32, fontWeight: '900' },
  shortageAlert: { fontSize: 12, color: Colors.danger, marginTop: 8, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, flex: 2, textAlign: 'right' },
  secTxt: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  idTxt: { fontSize: 11, color: Colors.textSecondary, fontFamily: 'monospace' },
});
