import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';
import { useAuthStore } from '../../store/useAuthStore';

export const PlacementDrivesScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [drives, setDrives] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'drives' | 'applied'>('drives');
  const [applying, setApplying] = useState<string | null>(null);

  const isStudent = user?.user_type === 'STUDENT';

  const loadDrives = async () => {
    try {
      const res = await ErpApi.getPlacementDrives({ status: 'ACTIVE' });
      const items = (res as any)?.data?.drives || (res as any)?.data || [];
      setDrives(Array.isArray(items) ? items : []);
    } catch (error: any) {
      Alert.alert('Could not load placement drives', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMyApplications = async () => {
    if (!isStudent) return;
    try {
      const res = await ErpApi.getMyPlacementApplications();
      const items = (res as any)?.data || [];
      setMyApplications(Array.isArray(items) ? items : []);
    } catch (error: any) {
      Alert.alert('Could not load applications', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDrives().then(() => loadMyApplications());
  }, []);

  const handleApply = async (drive: any) => {
    const alreadyApplied = myApplications.some((a) => a.drive_id === drive.id || a.drive_name === drive.drive_name);
    if (alreadyApplied) {
      Alert.alert('Already Applied', 'You have already applied to this drive.');
      return;
    }

    Alert.alert(
      'Confirm Application',
      `Apply to "${drive.drive_name}" at ${drive.company_name}?\n\nJob: ${drive.job_role}\nPackage: ${drive.salary_package}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            setApplying(drive.id);
            try {
              await ErpApi.applyToPlacementDrive({ drive_id: drive.id });
              Alert.alert('✅ Applied!', `You have successfully applied to ${drive.company_name} drive.`);
              loadMyApplications();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message || 'Could not submit application.');
            } finally {
              setApplying(null);
            }
          },
        },
      ]
    );
  };

  const getAppStatusColor = (status: string) => {
    if (status === 'SELECTED') return 'success';
    if (status === 'SHORTLISTED' || status === 'INTERVIEWING') return 'warning';
    if (status === 'REJECTED') return 'danger';
    return 'info';
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;

  return (
    <View style={styles.container}>
      <Header title="Placement Drives" subtitle="Campus Recruitment 2026" />

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drives' && styles.tabActive]}
          onPress={() => setActiveTab('drives')}
        >
          <Text style={[styles.tabText, activeTab === 'drives' && styles.tabTextActive]}>💼 Active Drives</Text>
        </TouchableOpacity>
        {isStudent && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'applied' && styles.tabActive]}
            onPress={() => setActiveTab('applied')}
          >
            <Text style={[styles.tabText, activeTab === 'applied' && styles.tabTextActive]}>
              📋 My Applications {myApplications.length > 0 ? `(${myApplications.length})` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {activeTab === 'drives' ? (
        <FlatList
          data={drives}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDrives().then(() => loadMyApplications()); }} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No active drives at this time</Text></View>}
          renderItem={({ item }) => {
            const alreadyApplied = myApplications.some((a) => a.drive_id === item.id);
            return (
              <Card>
                <View style={styles.driveHeader}>
                  <Text style={styles.company}>{item.company_name}</Text>
                  <Badge label={item.salary_package || 'N/A'} type="success" />
                </View>
                <Text style={styles.driveName}>{item.drive_name}</Text>
                <Text style={styles.role}>💼 {item.job_role}</Text>
                <Text style={styles.meta}>📍 {item.job_location || 'TBD'}</Text>
                <View style={styles.eligibilityRow}>
                  <Text style={styles.eligItem}>Min CGPA: {item.min_cgpa || 0}</Text>
                  <Text style={styles.eligItem}>Max Backlogs: {item.max_backlogs ?? 'N/A'}</Text>
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateItem}>📅 Drive: {item.drive_date}</Text>
                  <Text style={[styles.dateItem, { color: Colors.danger }]}>
                    ⏰ Deadline: {item.registration_deadline}
                  </Text>
                </View>
                {item.total_applications > 0 && (
                  <Text style={styles.appCount}>{item.total_applications} applications received</Text>
                )}
                {isStudent && (
                  <TouchableOpacity
                    style={[styles.applyBtn, alreadyApplied && styles.applyBtnApplied]}
                    onPress={() => !alreadyApplied && handleApply(item)}
                    disabled={applying === item.id || alreadyApplied}
                  >
                    <Text style={styles.applyTxt}>
                      {applying === item.id ? 'Applying...' : alreadyApplied ? '✅ APPLIED' : 'APPLY NOW'}
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          }}
        />
      ) : (
        <FlatList
          data={myApplications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No applications submitted yet</Text></View>}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.driveHeader}>
                <Text style={styles.company}>{item.company_name}</Text>
                <Badge label={item.status} type={getAppStatusColor(item.status)} />
              </View>
              <Text style={styles.driveName}>{item.drive_name}</Text>
              <Text style={styles.role}>💼 {item.job_role}</Text>
              <Text style={styles.meta}>💰 {item.salary_package}</Text>
              <Text style={styles.meta}>📅 Drive Date: {item.drive_date}</Text>
              <Text style={styles.appDate}>Applied on: {item.application_date || '—'}</Text>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  driveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  company: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  driveName: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  role: { fontSize: 14, color: Colors.primary, marginTop: 6, fontWeight: '700' },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  eligibilityRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  eligItem: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dateItem: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  appCount: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
  applyBtn: { marginTop: 12, backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  applyBtnApplied: { backgroundColor: Colors.success },
  applyTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  appDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
