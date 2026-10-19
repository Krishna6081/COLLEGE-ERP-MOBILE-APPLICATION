import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { SuperAdminApi, College } from '../../api/superadmin.api';

export const CollegesManagementScreen: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');

  // Add College Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchColleges = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await SuperAdminApi.getColleges(1, 50, search);
      if (!res.success || !res.data) {
        setColleges([]);
        setErrorMessage(res.message || 'Could not load colleges. Try again.');
        return;
      }
      setColleges(res.data.colleges);
    } catch (error: any) {
      setColleges([]);
      setErrorMessage(error?.message || 'Could not load colleges. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [search]);

  const handleCreateCollege = async () => {
    if (!code || !name || !email) {
      Alert.alert('Required Fields', 'Code, Name, and Email are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await SuperAdminApi.createCollege({ code, name, email, phone, address, website });
      if (res.success) {
        Alert.alert('Success', 'College registered successfully.');
        setModalVisible(false);
        setCode('');
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setWebsite('');
        fetchColleges();
      } else {
        Alert.alert('Error', res.message || 'Could not register college.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create college.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = (college: College) => {
    const isActivating = college.status === 'INACTIVE';
    Alert.alert(
      isActivating ? 'Activate College' : 'Deactivate College',
      `Are you sure you want to ${isActivating ? 'activate' : 'deactivate'} ${college.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isActivating ? 'Activate' : 'Deactivate',
          style: isActivating ? 'default' : 'destructive',
          onPress: async () => {
            try {
              let response: { success: boolean; message: string };
              if (isActivating) {
                response = await SuperAdminApi.updateCollege(college.id, { status: 'ACTIVE' });
              } else {
                response = await SuperAdminApi.deleteCollege(college.id);
              }
              if (!response.success) throw new Error(response.message || 'Could not update college status.');
              await fetchColleges();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Could not update college status. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Manage Colleges" subtitle="Multi-College System Administration" />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search colleges by name or code..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        <Button
          title="+ NEW COLLEGE"
          onPress={() => setModalVisible(true)}
          style={{ paddingHorizontal: 14 }}
        />
      </View>

      {/* Colleges List */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => void fetchColleges()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : errorMessage ? null : colleges.length === 0 ? (
          <Text style={styles.emptyText}>No colleges found matching search criteria.</Text>
        ) : (
          colleges.map((c) => (
            <Card key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.collegeName}>{c.name}</Text>
                  <Text style={styles.collegeCode}>Code: {c.code}</Text>
                </View>
                <Badge
                  text={c.status}
                  variant={c.status === 'ACTIVE' ? 'success' : 'danger'}
                />
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>✉️ Email:</Text>
                <Text style={styles.detailVal}>{c.email}</Text>
              </View>
              {c.phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📞 Phone:</Text>
                  <Text style={styles.detailVal}>{c.phone}</Text>
                </View>
              )}
              {c.website && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>🌐 Website:</Text>
                  <Text style={styles.detailVal}>{c.website}</Text>
                </View>
              )}

              <View style={styles.footerRow}>
                <Text style={styles.studentCount}>
                  👥 {c.students_count || 0} Students Enrolled
                </Text>
                <TouchableOpacity
                  style={[styles.statusToggleBtn, c.status === 'ACTIVE' ? styles.btnDanger : styles.btnSuccess]}
                  onPress={() => handleToggleStatus(c)}
                >
                  <Text style={styles.statusToggleText}>
                    {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add College Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Register New College</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>College Code (e.g. MIT-ENG)</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="e.g. COLLEGE-CODE"
                autoCapitalize="characters"
              />

              <Text style={styles.inputLabel}>College Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full official institution name"
              />

              <Text style={styles.inputLabel}>Official Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@institution.edu"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Contact Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 9876543210"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Campus Address</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="City, State, Pincode"
              />

              <Text style={styles.inputLabel}>Website URL</Text>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="https://institution.edu"
                autoCapitalize="none"
              />

              <Button
                title="SUBMIT & REGISTER COLLEGE"
                onPress={handleCreateCollege}
                loading={saving}
                style={{ marginTop: 20 }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 12, marginBottom: 16, padding: 16 },
  errorText: { color: Colors.danger, fontSize: 14, lineHeight: 20 },
  retryText: { color: Colors.primary, fontWeight: '700', marginTop: 10 },
  card: { padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  collegeName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  collegeCode: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', marginTop: 2 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, width: 85 },
  detailVal: { fontSize: 13, color: Colors.textPrimary, flex: 1 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  studentCount: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  statusToggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  btnDanger: { backgroundColor: '#FEE2E2' },
  btnSuccess: { backgroundColor: '#DCFCE7' },
  statusToggleText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, marginTop: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  modalScroll: { padding: 20, justifyContent: 'center' },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  modalClose: { fontSize: 18, fontWeight: '800', color: Colors.textSecondary, padding: 4 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginTop: 10, marginBottom: 4 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: '#F8FAFC',
  },
});
