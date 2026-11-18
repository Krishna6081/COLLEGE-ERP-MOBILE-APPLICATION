import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Modal, ScrollView, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { PlacementApi } from '../../api/student.api';

const appStatusBadge = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  switch (status?.toUpperCase()) {
    case 'SELECTED': return 'success';
    case 'SHORTLISTED': return 'info';
    case 'REJECTED': return 'danger';
    default: return 'warning';
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const PlacementDrivesScreen: React.FC = () => {
  const [drives, setDrives] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'drives' | 'applications'>('drives');

  // Apply modal
  const [selectedDrive, setSelectedDrive] = useState<any>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [applying, setApplying] = useState(false);

  // Detail modal
  const [detailDrive, setDetailDrive] = useState<any>(null);

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [drivesRes, appsRes] = await Promise.all([
        PlacementApi.getDrives(),
        PlacementApi.getMyApplications(),
      ]);
      setDrives(drivesRes.data || []);
      setMyApplications(appsRes.data || []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load placement data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleApply = async () => {
    if (!selectedDrive) return;
    setApplying(true);
    try {
      await PlacementApi.applyForDrive({
        drive_id: String(selectedDrive.id),
        ...(resumeUrl.trim() ? { resume_url: resumeUrl.trim() } : {}),
      });
      Alert.alert('Applied!', `You have successfully applied to ${selectedDrive.company_name}.`);
      setSelectedDrive(null);
      setResumeUrl('');
      loadAll();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        Alert.alert('Already Applied', 'You have already applied to this placement drive.');
      } else {
        Alert.alert('Error', err?.response?.data?.message || 'Failed to apply. Please try again.');
      }
      setSelectedDrive(null);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const renderDrive = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => setDetailDrive(item)}>
      <Card>
        <View style={styles.row}>
          <Text style={styles.company}>{item.company_name}</Text>
          {item.salary_package ? (
            <Badge label={item.salary_package} type="success" />
          ) : null}
        </View>
        <Text style={styles.role}>{item.job_role}</Text>
        <Text style={styles.meta}>
          Drive: {formatDate(item.drive_date)} | Min CGPA: {item.min_cgpa ?? 'N/A'}
        </Text>
        {item.job_location ? (
          <Text style={styles.meta}>📍 {item.job_location}</Text>
        ) : null}
        <View style={styles.actionRow}>
          {item.has_applied ? (
            <Badge label={item.application_status || 'Applied'} type={appStatusBadge(item.application_status || 'PENDING')} />
          ) : (
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setSelectedDrive(item)}
            >
              <Text style={styles.applyBtnText}>APPLY NOW</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderApplication = ({ item }: { item: any }) => (
    <Card>
      <View style={styles.row}>
        <Text style={styles.company}>{item.company_name || item.drive?.company_name}</Text>
        <Badge label={item.application_status || item.status || 'PENDING'} type={appStatusBadge(item.application_status || item.status)} />
      </View>
      <Text style={styles.role}>{item.job_role || item.drive?.job_role}</Text>
      <Text style={styles.meta}>Applied: {formatDate(item.applied_at || item.created_at)}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="Placement Drives" subtitle="Campus Recruitment" />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drives' && styles.tabActive]}
          onPress={() => setActiveTab('drives')}
        >
          <Text style={[styles.tabText, activeTab === 'drives' && styles.tabTextActive]}>All Drives</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.tabActive]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.tabTextActive]}>My Applications</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'drives' ? (
        <FlatList
          data={drives}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderDrive}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No Drives" message="No placement drives available at the moment." />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} colors={[Colors.primary]} />}
        />
      ) : (
        <FlatList
          data={myApplications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderApplication}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No Applications" message="You have not applied to any drives yet." />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} colors={[Colors.primary]} />}
        />
      )}

      {/* Apply Modal */}
      <Modal visible={!!selectedDrive} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Apply for Drive</Text>
            <TouchableOpacity onPress={() => setSelectedDrive(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedDrive && (
            <ScrollView style={styles.modalBody}>
              <Text style={styles.company}>{selectedDrive.company_name}</Text>
              <Text style={styles.role}>{selectedDrive.job_role}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Package</Text>
                  <Text style={styles.infoValue}>{selectedDrive.salary_package || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Min CGPA</Text>
                  <Text style={styles.infoValue}>{selectedDrive.min_cgpa ?? 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{selectedDrive.job_location || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Drive Date</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedDrive.drive_date)}</Text>
                </View>
              </View>
              <Text style={styles.label}>Resume URL (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://drive.google.com/..."
                value={resumeUrl}
                onChangeText={setResumeUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Button
                title={applying ? 'Applying...' : 'CONFIRM APPLICATION'}
                onPress={handleApply}
                variant="primary"
              />
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={!!detailDrive} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Drive Details</Text>
            <TouchableOpacity onPress={() => setDetailDrive(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          {detailDrive && (
            <ScrollView style={styles.modalBody}>
              <Text style={styles.company}>{detailDrive.company_name}</Text>
              <Text style={styles.role}>{detailDrive.job_role}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Package</Text>
                  <Text style={styles.infoValue}>{detailDrive.salary_package || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Min CGPA</Text>
                  <Text style={styles.infoValue}>{detailDrive.min_cgpa ?? 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{detailDrive.job_location || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Drive Date</Text>
                  <Text style={styles.infoValue}>{formatDate(detailDrive.drive_date)}</Text>
                </View>
              </View>
              {detailDrive.eligibility_criteria ? (
                <>
                  <Text style={styles.label}>Eligibility Criteria</Text>
                  <Card><Text style={styles.detailText}>{detailDrive.eligibility_criteria}</Text></Card>
                </>
              ) : null}
              {detailDrive.description ? (
                <>
                  <Text style={styles.label}>About the Drive</Text>
                  <Card><Text style={styles.detailText}>{detailDrive.description}</Text></Card>
                </>
              ) : null}
              {!detailDrive.has_applied && (
                <Button
                  title="APPLY FOR THIS DRIVE"
                  onPress={() => { setDetailDrive(null); setSelectedDrive(detailDrive); }}
                  variant="primary"
                />
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 30 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 12, backgroundColor: Colors.surface, borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  company: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  role: { fontSize: 14, color: Colors.primary, marginTop: 4, fontWeight: '600' },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  actionRow: { marginTop: 12, alignItems: 'flex-start' },
  applyBtn: {
    backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 8, alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  closeBtn: { fontSize: 20, color: Colors.textSecondary, padding: 4 },
  modalBody: { padding: 16 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 },
  infoItem: { width: '50%', paddingVertical: 6 },
  infoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600', marginTop: 2 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 14,
  },
  detailText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
});
