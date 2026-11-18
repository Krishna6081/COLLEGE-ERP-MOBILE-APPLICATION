import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {
  GraduationCap,
  KeyRound,
  Smartphone,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Shadows, webGradient, webInteractive } from '../../constants/theme';
import { Button } from '../../components/Button';
import { AuthApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';

type LoginTab = 'PASSWORD' | 'OTP';

export const LoginScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LoginTab>('PASSWORD');
  const [identifier, setIdentifier] = useState(__DEV__ ? 'student_alex' : '');
  const [password, setPassword] = useState(__DEV__ ? 'password123' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // OTP Login states
  const [otpIdentifier, setOtpIdentifier] = useState(__DEV__ ? '+919900000008' : '');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  // Forgot Password Modal states
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore((state) => state.login);

  const quickRoles = __DEV__ ? [
    { label: 'Student', user: 'student_alex', mobile: '+919900000008' },
    { label: 'Faculty', user: 'faculty_john', mobile: '+919900000006' },
    { label: 'HOD', user: 'hod_cse', mobile: '+919900000005' },
    { label: 'Admin', user: 'collegeadmin', mobile: '+919900000002' },
    { label: 'Principal', user: 'principal', mobile: '+919900000003' },
    { label: 'Accountant', user: 'accountant', mobile: '+919900000011' },
    { label: 'Librarian', user: 'librarian', mobile: '+919900000012' },
    { label: 'Parent', user: 'parent_david', mobile: '+919900000010' },
  ] : [];

  /**
   * 1. Password Login (Email, Username, or Mobile + Password)
   */
  const handlePasswordLogin = async () => {
    setAuthError('');
    if (!identifier.trim() || !password) {
      const msg = 'Please enter your Username / Email / Mobile and password.';
      setAuthError(msg);
      Alert.alert('Required Fields', msg);
      return;
    }

    setLoading(true);
    try {
      const res = await AuthApi.login(identifier.trim(), password);
      if (res.success && res.data) {
        await loginStore(res.data.user, res.data.accessToken, res.data.refreshToken);
      } else {
        const msg = res.message || 'Invalid credentials or inactive account.';
        setAuthError(msg);
        Alert.alert('Login Failed', msg);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Could not authenticate. Check network connection.';
      setAuthError(errorMessage);
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. OTP Login Flow
   */
  const handleSendOtp = async () => {
    if (!otpIdentifier.trim()) {
      Alert.alert('Required', 'Please enter your registered mobile number or email.');
      return;
    }

    setOtpSending(true);
    try {
      const res = await AuthApi.sendOtp(otpIdentifier.trim(), 'LOGIN');
      if (res.success) {
        setOtpSent(true);
        Alert.alert('OTP Sent', `Verification code has been sent to ${otpIdentifier}.`);
      } else {
        Alert.alert('OTP Error', res.message || 'Could not send OTP.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to dispatch OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtpLogin = async () => {
    if (!otpIdentifier.trim() || !otpCode.trim()) {
      Alert.alert('Required', 'Please enter the received 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthApi.verifyOtpLogin(otpIdentifier.trim(), otpCode.trim());
      if (res.success && res.data) {
        await loginStore(res.data.user, res.data.accessToken, res.data.refreshToken);
      } else {
        Alert.alert('Verification Failed', res.message || 'Invalid or expired OTP code.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. Google Sign-In
   */
  /**
   * 4. Forgot Password Flow
   */
  const handleRequestForgotOtp = async () => {
    if (!forgotIdentifier.trim()) {
      Alert.alert('Required', 'Please enter your registered email, username, or mobile number.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await AuthApi.forgotPassword(forgotIdentifier.trim());
      if (res.success) {
        setForgotStep(2);
        Alert.alert('Reset Code Dispatched', 'Password reset code has been sent.');
      } else {
        Alert.alert('Error', res.message || 'Could not find account.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to dispatch reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!forgotOtp.trim()) {
      Alert.alert('Required', 'Please enter the reset code / OTP.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Invalid Password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await AuthApi.resetPassword(forgotIdentifier.trim(), forgotOtp.trim(), newPassword);
      if (res.success) {
        Alert.alert('Success', 'Password has been reset successfully! You can now log in.');
        setForgotModalVisible(false);
        setPassword(newPassword);
        setIdentifier(forgotIdentifier);
        setActiveTab('PASSWORD');
      } else {
        Alert.alert('Reset Failed', res.message || 'Invalid reset code or token.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, webGradient('#0F172A', '#1E1B4B', 145)]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.authShell}>
          {/* Header Branding */}
          <View style={styles.headerBox}>
            <View style={[styles.logoTile, webGradient(Colors.primary, Colors.secondary, 135)]}>
              <GraduationCap size={28} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>COLLEGE ERP SUITE</Text>
            </View>
            <Text style={styles.appTitle}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your role-based academic & campus portal</Text>
          </View>

          {/* Auth Card */}
          <View style={styles.formCard}>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'PASSWORD' && styles.tabBtnActive, webInteractive]}
                onPress={() => { setActiveTab('PASSWORD'); setAuthError(''); }}
              >
                <KeyRound size={15} color={activeTab === 'PASSWORD' ? Colors.primary : Colors.textSecondary} strokeWidth={2.2} />
                <Text style={[styles.tabBtnText, activeTab === 'PASSWORD' && styles.tabBtnTextActive]}>
                  Password
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'OTP' && styles.tabBtnActive, webInteractive]}
                onPress={() => { setActiveTab('OTP'); setAuthError(''); }}
              >
                <Smartphone size={15} color={activeTab === 'OTP' ? Colors.primary : Colors.textSecondary} strokeWidth={2.2} />
                <Text style={[styles.tabBtnText, activeTab === 'OTP' && styles.tabBtnTextActive]}>
                  OTP Login
                </Text>
              </TouchableOpacity>
            </View>

            {!!authError && (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={Colors.danger} strokeWidth={2.2} />
                <Text style={styles.errorBannerText}>{authError}</Text>
              </View>
            )}

            {/* PASSWORD TAB CONTENT */}
            {activeTab === 'PASSWORD' && (
              <View>
                <Text style={styles.inputLabel}>Email, Username, or Mobile</Text>
                <TextInput
                  style={styles.input}
                  value={identifier}
                  onChangeText={(v) => { setIdentifier(v); setAuthError(''); }}
                  placeholder="Enter your username, email, or phone number"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />

                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TouchableOpacity style={styles.eyeToggle} onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={14} color={Colors.primary} strokeWidth={2.2} />
                    ) : (
                      <Eye size={14} color={Colors.primary} strokeWidth={2.2} />
                    )}
                    <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => {
                  setForgotIdentifier(identifier);
                  setForgotStep(1);
                  setForgotModalVisible(true);
                }}
              >
                <Text style={styles.forgotBtnText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="SIGN IN WITH PASSWORD"
                onPress={handlePasswordLogin}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          )}

          {/* OTP TAB CONTENT */}
          {activeTab === 'OTP' && (
            <View>
              <Text style={styles.inputLabel}>Registered Mobile / Email</Text>
              <View style={styles.otpInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={otpIdentifier}
                  onChangeText={setOtpIdentifier}
                  placeholder="Registered phone number or email"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.sendOtpBtn, otpSending && styles.sendOtpBtnDisabled]}
                  onPress={handleSendOtp}
                  disabled={otpSending}
                >
                  <Text style={styles.sendOtpText}>{otpSending ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>6-Digit OTP Code</Text>
              <TextInput
                style={styles.input}
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="Enter 6-digit OTP code"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={6}
              />

              <Button
                title="VERIFY & SIGN IN"
                onPress={handleVerifyOtpLogin}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          )}

          {/* Quick Demo Switcher */}
          {__DEV__ && quickRoles.length > 0 && (<><Text style={styles.quickLabel}>⚡ TEST DEMO ROLES (1-TAP AUTOFILL):</Text>
          <View style={styles.chipContainer}>
            {quickRoles.map((role) => (
              <TouchableOpacity
                key={role.user}
                style={[styles.chip, identifier === role.user && styles.chipActive]}
                onPress={() => {
                  setIdentifier(role.user);
                  setPassword('password123');
                  setOtpIdentifier(role.mobile);
                }}
              >
                <Text style={[styles.chipText, identifier === role.user && styles.chipTextActive]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View></>)}
        </View>

        {/* FORGOT & RESET PASSWORD MODAL */}
        <Modal visible={forgotModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reset Your Password</Text>
                <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {forgotStep === 1 ? (
                <View>
                  <Text style={styles.modalSub}>
                    Enter your registered email, username, or mobile number to receive a secure password reset code.
                  </Text>
                  <Text style={styles.inputLabel}>Username / Email / Mobile</Text>
                  <TextInput
                    style={styles.input}
                    value={forgotIdentifier}
                    onChangeText={setForgotIdentifier}
                    placeholder="Enter email or mobile"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                  />
                  <Button
                    title="DISPATCH RESET CODE"
                    onPress={handleRequestForgotOtp}
                    loading={forgotLoading}
                    style={{ marginTop: 20 }}
                  />
                </View>
              ) : (
                <View>
                  <Text style={styles.modalSub}>
                    Enter the code sent to your account along with your new password.
                  </Text>
                  <Text style={styles.inputLabel}>Reset Code / OTP</Text>
                  <TextInput
                    style={styles.input}
                    value={forgotOtp}
                    onChangeText={setForgotOtp}
                    placeholder="6-digit reset code"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>New Password (min 6 characters)</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
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
                    title="SAVE NEW PASSWORD"
                    onPress={handleResetPasswordSubmit}
                    loading={forgotLoading}
                    style={{ marginTop: 20 }}
                  />

                  <TouchableOpacity
                    style={{ marginTop: 12, alignItems: 'center' }}
                    onPress={() => setForgotStep(1)}
                  >
                    <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 13 }}>
                      Back to code dispatch
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  authShell: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  logoTile: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Shadows.lg,
  },
  badgeWrap: {
    backgroundColor: 'rgba(79, 70, 229, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.45)',
    marginBottom: 10,
  },
  badgeText: {
    color: '#C7D2FE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  collegeName: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...Shadows.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  showHideText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
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
  otpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendOtpBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendOtpBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  sendOtpText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 6,
  },
  forgotBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 16,
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 48,
    borderRadius: 12,
  },
  googleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  googleBtnText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginTop: 22,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    margin: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
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
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
});
