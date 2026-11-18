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
  Platform,
} from 'react-native';
import { ShieldCheck, KeyRound, Info, LogOut, X, UserCheck } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { PageContent } from '../../components/PageContent';
import { Colors } from '../../constants/colors';
import { Shadows } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthApi } from '../../api/auth.api';

export const SettingsScreen: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setFormError('');
    if (!currentPassword || !newPassword) {
      setFormError('Please enter your current password and a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthApi.changePassword(currentPassword, newPassword);
      if (res.success) {
        setModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (Platform.OS === 'web') {
          window.alert('Your password has been changed successfully.');
        } else {
          Alert.alert('Success', 'Your password has been changed successfully.');
        }
      } else {
        setFormError(res.message || 'Current password was incorrect.');
      }
    } catch (error: any) {
      setFormError(error?.message || 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await AuthApi.logout();
      } catch {}
      await logout();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out from your College ERP account?')) {
        await doLogout();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out from your College ERP account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: doLogout },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Account & Security" subtitle="Preferences, Session & Credential Settings" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <PageContent>
          {/* Active Session */}
          <Card>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconTile, { backgroundColor: Colors.primaryLight }]}>
                <UserCheck size={18} color={Colors.primary} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionHeader}>Active Session</Text>
                <Text style={styles.sectionSub}>Signed-in identity and workspace scope</Text>
              </View>
              <Badge label="ACTIVE" type="success" />
            </View>
            <View style={styles.divider} />
            <View style={styles.kvRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.bold}>{user?.username || 'User'}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <Badge label={(user?.user_type || 'USER').replace(/_/g, ' ')} type="primary" />
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.infoLabel}>College</Text>
              <Text style={styles.bold}>{user?.college_name || 'College not available'}</Text>
            </View>
          </Card>

          {/* Security Settings */}
          <Card>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconTile, { backgroundColor: Colors.accentLight }]}>
                <ShieldCheck size={18} color={Colors.accentDark} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionHeader}>Security & Credentials</Text>
                <Text style={styles.sectionSub}>Password management and session encryption</Text>
              </View>
            </View>
            <Text style={styles.descTxt}>
              Passwords are securely hashed with bcrypt and never stored in plain text. Update your password regularly to keep your account safe.
            </Text>
            <Button
              title="CHANGE PASSWORD"
              variant="outline"
              icon={<KeyRound size={15} color={Colors.primary} strokeWidth={2.2} />}
              onPress={() => { setFormError(''); setModalVisible(true); }}
              style={{ marginTop: 8 }}
            />
          </Card>

          {/* Application Info */}
          <Card>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconTile, { backgroundColor: Colors.secondaryLight }]}>
                <Info size={18} color={Colors.secondary} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionHeader}>Application Information</Text>
                <Text style={styles.sectionSub}>Platform & architecture details</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.kvRow}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.bold}>College ERP Suite v1.0.0</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.infoLabel}>Security</Text>
              <Text style={styles.bold}>JWT Bearer + Refresh Token + RBAC</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.infoLabel}>Backend API</Text>
              <Text style={styles.bold}>Node.js · Express · MySQL</Text>
            </View>
          </Card>

          <View style={styles.logoutWrapper}>
            <Button
              title="SIGN OUT OF ACCOUNT"
              variant="danger"
              icon={<LogOut size={15} color="#FFFFFF" strokeWidth={2.2} />}
              onPress={handleLogout}
            />
          </View>
        </PageContent>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color={Colors.textSecondary} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>New Password (min 6 characters)</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new secure password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />

            {!!formError && <Text style={styles.errorTxt}>{formError}</Text>}

            <Button
              title="UPDATE PASSWORD"
              onPress={handleChangePassword}
              loading={loading}
              style={{ marginTop: 18 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingVertical: 10, paddingBottom: 32 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 12 },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  bold: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, flexShrink: 1, textAlign: 'right' },
  descTxt: { fontSize: 13, color: Colors.textSecondary, marginTop: 12, marginBottom: 6, lineHeight: 20 },
  logoutWrapper: { paddingHorizontal: 16, marginTop: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  closeBtn: { padding: 4 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 46,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  errorTxt: { color: Colors.danger, fontSize: 12, fontWeight: '600', marginTop: 10 },
});
