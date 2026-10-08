import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

export const SettingsScreen: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Application Settings" subtitle="Preferences & Security" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionHeader}>Security</Text>
          <Button title="CHANGE PASSWORD" variant="outline" onPress={() => Alert.alert('Security', 'Password change link dispatched to registered email.')} />
        </Card>

        <Card>
          <Text style={styles.sectionHeader}>Application Version</Text>
          <Text style={styles.infoTxt}>College ERP App v1.0.0 (Expo SDK 51)</Text>
          <Text style={styles.infoTxt}>Backend: Node.js Express MySQL API</Text>
        </Card>

        <View style={styles.logoutWrapper}>
          <Button title="LOGOUT FROM ACCOUNT" variant="danger" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  infoTxt: { fontSize: 13, color: Colors.textSecondary, marginVertical: 2 },
  logoutWrapper: { paddingHorizontal: 16, marginTop: 20 },
});
