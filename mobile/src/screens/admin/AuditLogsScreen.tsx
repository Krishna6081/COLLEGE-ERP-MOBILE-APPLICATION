import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { SuperAdminApi, AuditLog } from '../../api/superadmin.api';

export const AuditLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  const filterModules = ['ALL', 'COLLEGES', 'RBAC', 'SETTINGS', 'STUDENTS', 'FEES', 'ATTENDANCE', 'ACADEMICS'];

  const fetchLogs = async (module?: string) => {
    setLoading(true);
    try {
      const modQuery = module && module !== 'ALL' ? module : undefined;
      const res = await SuperAdminApi.getAuditLogs(1, 50, modQuery);
      if (res.success && res.data) {
        setLogs(res.data.logs);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(selectedModule);
  }, [selectedModule]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs(selectedModule);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Audit Trail Logs" subtitle="Tamper-Evident System Operations History" />

      {/* Module Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterModules.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.filterChip, selectedModule === m && styles.filterChipActive]}
              onPress={() => setSelectedModule(m)}
            >
              <Text style={[styles.filterChipText, selectedModule === m && styles.filterChipTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Logs Feed */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : logs.length === 0 ? (
          <Text style={styles.emptyTxt}>No audit records found for this module.</Text>
        ) : (
          logs.map((log) => (
            <Card key={log.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Badge text={log.module} variant="info" />
                <Text style={styles.timestamp}>
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.created_at).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.actionText}>{log.action}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.label}>👤 Actor:</Text>
                <Text style={styles.val}>{log.username || 'System Administrator'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>🌐 IP Address:</Text>
                <Text style={styles.val}>{log.ip_address || '127.0.0.1'}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F1F5F9' },
  filterChipActive: { backgroundColor: Colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  filterChipTextActive: { color: '#FFFFFF' },
  scroll: { padding: 16, paddingBottom: 24 },
  card: { padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timestamp: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  actionText: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  label: { fontSize: 12, color: Colors.textSecondary, width: 85, fontWeight: '600' },
  val: { fontSize: 12, color: Colors.textPrimary, fontWeight: '700' },
  emptyTxt: { textAlign: 'center', marginTop: 40, color: Colors.textSecondary },
});
