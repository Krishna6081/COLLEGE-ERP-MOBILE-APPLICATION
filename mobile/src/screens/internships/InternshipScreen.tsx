
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';

import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { InternshipApi } from '../../api/student.api';

interface Internship {
  id: string;
  title: string;
  description?: string;
  company_name: string;
  industry?: string;
  location?: string;
  stipend_monthly: number;
  duration_months: number;
  start_date: string;
  deadline: string;
}

interface Application {
  id: string;
  internship_title: string;
  company_name: string;
  status: string;
  application_date: string;
}

export const InternshipScreen: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [showApplications, setShowApplications] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [internshipResponse, applicationResponse] = await Promise.all([
        InternshipApi.getInternships(),
        InternshipApi.getMyApplications(),
      ]);

      const getArray = (response: any): any[] => {
        const payload = response?.data ?? response;
        const data = Array.isArray(payload) ? payload : payload?.data;
        return Array.isArray(data) ? data : [];
      };

      setInternships(getArray(internshipResponse));
      setApplications(getArray(applicationResponse));
    } catch (error: any) {
      console.log(
        'Internship API Error:',
        error?.response?.data || error
      );
      Alert.alert('Error', 'Unable to load internship details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyInternship = (item: Internship) => {
    Alert.alert(
      'Apply for Internship',
      `Are you sure you want to apply for ${item.title} at ${item.company_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              setApplyingId(item.id);

              const response: any =
                await InternshipApi.applyForInternship({
                  internship_id: item.id,
                });

              Alert.alert(
                'Success',
                response?.data?.message ||
                  response?.message ||
                  'Application submitted successfully.'
              );

              await loadData();
            } catch (error: any) {
              console.log(
                'Apply Internship Error:',
                error?.response?.data || error
              );

              Alert.alert(
                'Application Failed',
                error?.response?.data?.message ||
                  'Unable to submit application. Please try again.'
              );
            } finally {
              setApplyingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const renderInternship = ({ item }: { item: Internship }) => {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.company}>🏢 {item.company_name}</Text>

        <Text style={styles.info}>📍 {item.location || 'Not specified'}</Text>
        <Text style={styles.info}>
          💰 Monthly Stipend: ₹{Number(item.stipend_monthly || 0).toLocaleString('en-IN')}
        </Text>
        <Text style={styles.info}>
          ⏳ Duration: {item.duration_months} months
        </Text>
        <Text style={styles.info}>📅 Start Date: {formatDate(item.start_date)}</Text>
        <Text style={styles.info}>⏰ Deadline: {formatDate(item.deadline)}</Text>

        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.applyButton,
            applyingId === item.id && styles.disabledButton,
          ]}
          disabled={applyingId === item.id}
          onPress={() => applyInternship(item)}
        >
          <Text style={styles.buttonText}>
            {applyingId === item.id ? 'Applying...' : 'Apply Now'}
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderApplication = ({ item }: { item: Application }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>{item.internship_title}</Text>
      <Text style={styles.company}>🏢 {item.company_name}</Text>
      <Text style={styles.info}>
        Applied On: {formatDate(item.application_date)}
      </Text>
      <Badge label={item.status} />
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Header title="Internships" />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, !showApplications && styles.activeTab]}
          onPress={() => setShowApplications(false)}
        >
          <Text style={styles.tabText}>Available Internships</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, showApplications && styles.activeTab]}
          onPress={() => setShowApplications(true)}
        >
          <Text style={styles.tabText}>My Applications</Text>
        </TouchableOpacity>
      </View>
        <FlatList<any>
  data={showApplications ? applications : internships}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) =>
    showApplications
      ? renderApplication({ item: item as Application })
      : renderInternship({ item: item as Internship })
  }
  contentContainerStyle={styles.list}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        loadData();
      }}
    />
  }
  ListEmptyComponent={
    <EmptyState
      title={
        showApplications
          ? 'No Applications Yet'
          : 'No Internships Available'
      }
      message={
        showApplications
          ? 'Your internship applications will appear here.'
          : 'No internship opportunities are currently available.'
      }
    />
  }
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabs: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E8EAF0',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    padding: 16,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  company: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 9,
  },
  description: {
    color: Colors.text,
    lineHeight: 21,
    marginTop: 8,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
