import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.container}>
      <Header title="My Account Profile" subtitle="Personal & ERP Information" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>
              {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || 'D'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.first_name || 'Alex'} {user?.last_name || 'Johnson'}</Text>
          <Text style={styles.role}>{user?.user_type || 'STUDENT'}</Text>
          <Badge label={user?.college_name || 'MIT Institute of Technology'} type="info" />
        </Card>

        <Card>
          <Text style={styles.headerTxt}>Account Credentials</Text>
          <Text style={styles.row}>Username: {user?.username}</Text>
          <Text style={styles.row}>Email: {user?.email}</Text>
          <Text style={styles.row}>User ID: {user?.id}</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },
  profileCard: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarTxt: { fontSize: 28, color: '#FFFFFF', fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  role: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8, fontWeight: '600' },
  headerTxt: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  row: { fontSize: 13, color: Colors.textSecondary, paddingVertical: 4 },
});
