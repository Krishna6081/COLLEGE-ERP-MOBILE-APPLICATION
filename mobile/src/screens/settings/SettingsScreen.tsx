import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthApi } from '../../api/auth.api';

export const SettingsScreen: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // Change Password state
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Required Fields', 'Please enter your current password and a new password.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Invalid Password', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthApi.changePassword(currentPassword, newPassword);
      if (res.success) {
        Alert.alert('Success', 'Your password has been changed successfully.');
        setModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Failed', res.message || 'Current password was incorrect.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from your College ERP account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AuthApi.logout();
          } catch (e) {}
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Account & Security" subtitle="Preferences & Credential Settings" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <Card>
          <Text style={styles.sectionHeader}>Active Session</Text>
          <Text style={styles.infoTxt}>Logged in as: <Text style={styles.bold}>{user?.username || 'User'}</Text></Text>
          <Text style={styles.infoTxt}>Role: <Text style={styles.bold}>{user?.user_type || 'STUDENT'}</Text></Text>
          <Text style={styles.infoTxt}>College: <Text style={styles.bold}>{user?.college_name || 'MIT Institute of Technology'}</Text></Text>
        </Card>

        {/* Security Settings */}
        <Card>
          <Text style={styles.sectionHeader}>Security & Credentials</Text>
          <Text style={styles.descTxt}>
            Passwords must never be shared and are securely hashed using bcrypt.
          </Text>
          <Button
            title="CHANGE PASSWORD"
            variant="outline"
            onPress={() => setModalVisible(true)}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Application Version */}
        <Card>
          <Text style={styles.sectionHeader}>Application Information</Text>
          <Text style={styles.infoTxt}>Platform: College ERP Mobile v1.0.0 (Expo SDK 51)</Text>
          <Text style={styles.infoTxt}>Security: JWT Bearer + Refresh Token + RBAC</Text>
          <Text style={styles.infoTxt}>Backend: Node.js Express MySQL API</Text>
        </Card>

        <View style={styles.logoutWrapper}>
          <Button title="LOGOUT FROM ACCOUNT" variant="danger" onPress={handleLogout} />
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
            />

            <Text style={styles.inputLabel}>New Password (min 6 characters)</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new secure password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
            />

            <Button
              title="UPDATE PASSWORD"
              onPress={handleChangePassword}
              loading={loading}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  infoTxt: { fontSize: 13, color: Colors.textSecondary, marginVertical: 3 },
  bold: { fontWeight: '700', color: Colors.textPrimary },
  descTxt: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  logoutWrapper: { paddingHorizontal: 16, marginTop: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalClose: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textSecondary,
    padding: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: '#F8FAFC',
  },
});
