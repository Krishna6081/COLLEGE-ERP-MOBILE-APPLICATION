import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { SystemMonitoringApi } from '../../api/systemMonitoring.api';

const PRIMARY = '#0c2466';

type StatusData = {
  status?: string;
  message?: string;
  checkedAt?: string;
  uptime?: number;
  backend?: string;
  database?: string;
};

type ActivityLog = {
  id?: number;
  user_name?: string;
  action?: string;
  description?: string;
  created_at?: string;
  entity_type?: string;
};

const getData = (response: any) => response?.data?.data ?? response?.data ?? {};

const SystemMonitoringScreen = () => {
  const [backend, setBackend] = useState<StatusData | null>(null);
  const [database, setDatabase] = useState<StatusData | null>(null);
  const [apiHealth, setApiHealth] = useState<StatusData | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadMonitoringData = useCallback(async () => {
    setError('');

    const results = await Promise.allSettled([
      SystemMonitoringApi.getBackendStatus(),
      SystemMonitoringApi.getDatabaseStatus(),
      SystemMonitoringApi.getApiHealth(),
      SystemMonitoringApi.getActivityLogs(),
    ]);

    if (results[0].status === 'fulfilled') {
      setBackend(getData(results[0].value));
    } else {
      setBackend({ status: 'Offline', message: 'Backend is unavailable.' });
    }

    if (results[1].status === 'fulfilled') {
      setDatabase(getData(results[1].value));
    } else {
      setDatabase({ status: 'Disconnected' });
    }

    if (results[2].status === 'fulfilled') {
      setApiHealth(getData(results[2].value));
    } else {
      setApiHealth({ status: 'Unhealthy' });
    }

    if (results[3].status === 'fulfilled') {
      const data = getData(results[3].value);
      setLogs(Array.isArray(data) ? data : []);
    } else {
      setLogs([]);
      setError('Activity logs could not be loaded.');
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await loadMonitoringData();
      setLoading(false);
    };

    load();
  }, [loadMonitoringData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMonitoringData();
    setRefreshing(false);
  };

  const StatusCard = ({
    title,
    status,
    message,
  }: {
    title: string;
    status?: string;
    message?: string;
  }) => {
    const isHealthy = ['online', 'connected', 'healthy'].includes(
      (status || '').toLowerCase()
    );

    return (
      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>{title}</Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isHealthy ? '#16A34A' : '#DC2626' },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isHealthy ? '#16A34A' : '#DC2626' },
            ]}
          >
            {status || 'Unknown'}
          </Text>
        </View>

        <Text style={styles.message}>
          {message || 'Status information'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Loading System Monitoring...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Monitoring</Text>
        <Text style={styles.headerSubtitle}>
          Monitor backend, database and API health
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Status</Text>

        <StatusCard
          title="Backend Server"
          status={backend?.status}
          message={backend?.message}
        />

        <StatusCard
          title="Database Connection"
          status={database?.status}
          message={database?.message}
        />

        <StatusCard
          title="API Health Check"
          status={apiHealth?.status}
          message={apiHealth?.message}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity Logs</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {logs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent activity found.</Text>
          </View>
        ) : (
          logs.map((log, index) => (
            <View
              key={log.id ?? index}
              style={styles.logCard}
            >
              <Text style={styles.logAction}>
                {log.action || 'Activity'}
              </Text>

              <Text style={styles.logDescription}>
                {log.description || log.entity_type || 'System activity'}
              </Text>

              <Text style={styles.logUser}>
                User: {log.user_name || 'Unknown'}
              </Text>

              <Text style={styles.logDate}>
                {log.created_at || 'Date unavailable'}
              </Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Refresh Status</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SystemMonitoringScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: PRIMARY,
    padding: 22,
    borderRadius: 14,
    marginBottom: 22,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#DCE5FF',
    fontSize: 13,
    marginTop: 6,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },
  cardTitle: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  message: {
    color: '#777777',
    fontSize: 12,
    marginTop: 7,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  logAction: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: 'bold',
  },
  logDescription: {
    color: '#444444',
    fontSize: 13,
    marginTop: 5,
  },
  logUser: {
    color: '#666666',
    fontSize: 12,
    marginTop: 8,
  },
  logDate: {
    color: '#888888',
    fontSize: 11,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
  },
  emptyText: {
    color: '#777777',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
  },
  loadingText: {
    color: PRIMARY,
    marginTop: 12,
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 10,
  },
});