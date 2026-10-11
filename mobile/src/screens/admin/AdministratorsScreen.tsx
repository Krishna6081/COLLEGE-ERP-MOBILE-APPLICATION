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
import { SuperAdminApi, Administrator } from '../../api/superadmin.api';

export const AdministratorsScreen: React.FC = () => {
  const [admins, setAdmins] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Add Admin Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [collegeId, setCollegeId] = useState('col-001');
  const [saving, setSaving] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await SuperAdminApi.getAdministrators(1, 50, search);
      if (res.success && res.data) {
        setAdmins(res.data.administrators);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search]);

  const handleCreateAdmin = async () => {
    if (!username || !email || !firstName || !lastName) {
      Alert.alert('Required Fields', 'Username, Email, and Name are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await SuperAdminApi.createAdministrator({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        mobile,
        college_id: collegeId,
      });
      if (res.success) {
        Alert.alert('Success', 'College administrator account created successfully.');
        setModalVisible(false);
        setUsername('');
        setEmail('');
        setFirstName('');
        setLastName('');
        setMobile('');
        fetchAdmins();
      } else {
        Alert.alert('Error', res.message || 'Could not create administrator.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create administrator.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Manage Administrators" subtitle="College Admin Assignments & Access" />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search administrators..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        <Button
          title="+ NEW ADMIN"
          onPress={() => setModalVisible(true)}
          style={{ paddingHorizontal: 14 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : admins.length === 0 ? (
          <Text style={styles.emptyText}>No administrators found.</Text>
        ) : (
          admins.map((admin) => (
            <Card key={admin.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminName}>
                    {admin.first_name} {admin.last_name}
                  </Text>
                  <Text style={styles.adminUsername}>@{admin.username}</Text>
                </View>
                <Badge
                  text={admin.status}
                  variant={admin.status === 'ACTIVE' ? 'success' : 'danger'}
                />
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>🏛️ College:</Text>
                <Text style={styles.detailVal}>{admin.college_name || 'MIT Institute of Technology'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>✉️ Email:</Text>
                <Text style={styles.detailVal}>{admin.email}</Text>
              </View>
              {admin.mobile && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📞 Mobile:</Text>
                  <Text style={styles.detailVal}>{admin.mobile}</Text>
                </View>
              )}

              <View style={styles.footerRow}>
                <Text style={styles.roleTag}>ROLE: {admin.user_type}</Text>
                <Text style={styles.lastLogin}>
                  {admin.last_login_at ? `Last login: ${new Date(admin.last_login_at).toLocaleDateString()}` : 'Never logged in'}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Admin Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Administrator</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="e.g. admin_dept"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Official Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@mit-eng.edu"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={mobile}
                onChangeText={setMobile}
                placeholder="+91 9900000002"
                keyboardType="phone-pad"
              />

              <Button
                title="CREATE ADMINISTRATOR"
                onPress={handleCreateAdmin}
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
  card: { padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  adminName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  adminUsername: { fontSize: 13, color: Colors.primary, fontWeight: '700', marginTop: 2 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, width: 90 },
  detailVal: { fontSize: 13, color: Colors.textPrimary, flex: 1 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  roleTag: { fontSize: 11, fontWeight: '800', color: Colors.secondary },
  lastLogin: { fontSize: 11, color: Colors.textSecondary },
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
