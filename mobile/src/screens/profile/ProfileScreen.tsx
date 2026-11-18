import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ShieldCheck, Mail, User, Building2, Award } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PageContent } from '../../components/PageContent';
import { ProgressRing } from '../../components/ProgressRing';
import { Colors } from '../../constants/colors';
import { webGradient } from '../../constants/theme';
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
      // Optional
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

  const infoRows: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: 'Username', value: user?.username || '—', icon: <User size={15} color={Colors.primary} /> },
    { label: 'Email', value: user?.email || '—', icon: <Mail size={15} color={Colors.primary} /> },
    { label: 'Role', value: (user?.user_type || '—').replace(/_/g, ' '), icon: <Award size={15} color={Colors.secondary} /> },
    { label: 'College', value: user?.college_name || '—', icon: <Building2 size={15} color={Colors.accentDark} /> },
  ];

  if (isStudent && dashData) {
    if (dashData.program)    infoRows.push({ label: 'Program', value: dashData.program, icon: <Award size={15} color={Colors.primary} /> });
    if (dashData.department) infoRows.push({ label: 'Department', value: dashData.department, icon: <Building2 size={15} color={Colors.secondary} /> });
    if (dashData.semester)   infoRows.push({ label: 'Semester', value: dashData.semester, icon: <Award size={15} color={Colors.accentDark} /> });
  }

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="My Profile"
        subtitle="Personal & Academic Information"
        onRightPress={() => { setRefreshing(true); loadProfile(); }}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadProfile(); }}
            colors={[Colors.primary]}
          />
        }
      >
        <PageContent>
          {/* Hero Avatar Banner */}
          <Card style={[styles.heroCard, webGradient(Colors.primary, Colors.secondary, 135)]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{initials}</Text>
            </View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.roleText}>{user?.user_type?.replace(/_/g, ' ') || 'Role unavailable'}</Text>
            {user?.college_name ? (
              <View style={styles.collegePill}>
                <Text style={styles.collegePillText}>{user.college_name}</Text>
              </View>
            ) : null}
          </Card>

          {/* Attendance Highlight for Students */}
          {isStudent && dashData?.attendance_percentage !== undefined && (
            <Card>
              <View style={styles.attendanceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Attendance Overview</Text>
                  <Text style={styles.attSub}>
                    {dashData.attended_lectures ?? 0} attended out of {dashData.total_lectures ?? 0} lectures
                  </Text>
                  <View style={{ marginTop: 8 }}>
                    <Badge
                      label={dashData.attendance_percentage >= 75 ? 'Good Standing' : 'Below 75% Threshold'}
                      type={dashData.attendance_percentage >= 75 ? 'success' : 'danger'}
                    />
                  </View>
                </View>
                <ProgressRing
                  percentage={dashData.attendance_percentage}
                  color={dashData.attendance_percentage < 75 ? Colors.danger : Colors.accent}
                  label="Present"
                />
              </View>
            </Card>
          )}

          {/* Account Details */}
          <Card>
            <Text style={styles.sectionTitle}>Account Details</Text>
            {infoRows.map((row, i) => (
              <View key={i} style={[styles.row, i === infoRows.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.rowLeft}>
                  <View style={styles.rowIcon}>{row.icon}</View>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                </View>
                <Text style={styles.rowValue} numberOfLines={1}>{row.value}</Text>
              </View>
            ))}
          </Card>

          {/* Security Info */}
          <Card style={styles.secCard}>
            <View style={styles.secHeader}>
              <View style={styles.secIconWrap}>
                <ShieldCheck size={18} color={Colors.accentDark} strokeWidth={2.2} />
              </View>
              <Text style={styles.sectionTitleInline}>Security & Verification</Text>
            </View>
            <Text style={styles.secTxt}>
              Your account is protected with bcrypt password hashing and signed JWT role-based session tokens.
            </Text>
            <Text style={styles.idLine}>
              Account ID: <Text style={styles.idTxt}>{user?.id || '—'}</Text>
            </Text>
          </Card>
        </PageContent>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingVertical: 10, paddingBottom: 32 },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 28,
    borderWidth: 0,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarTxt: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  name: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  collegePill: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  collegePillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
  sectionTitleInline: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  attendanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  attSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  rowValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '700', flexShrink: 1, textAlign: 'right' },

  secCard: { borderLeftWidth: 4, borderLeftColor: Colors.accent },
  secHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  secIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secTxt: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  idLine: { fontSize: 12, color: Colors.textSecondary, marginTop: 8 },
  idTxt: { fontWeight: '700', color: Colors.textPrimary },
});
