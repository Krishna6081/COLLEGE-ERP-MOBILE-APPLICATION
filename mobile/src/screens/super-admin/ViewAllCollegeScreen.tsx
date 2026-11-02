import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllColleges, deleteCollege } from '../../api/erp.api';

interface College {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  status?: string;
  created_at?: string;
}

const ViewAllCollegesScreen = () => {
  const navigation = useNavigation<any>();

  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchColleges = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response: any = await getAllColleges();
      const data = response?.data ?? response;

      if (data?.success) {
        setColleges(
          Array.isArray(data.colleges) ? data.colleges : []
        );
      } else {
        setColleges([]);
        Alert.alert(
          'Unable to load colleges',
          data?.message || 'Could not fetch colleges.'
        );
      }
    } catch (error: any) {
      console.error('Fetch colleges error:', error);

      const message =
        error?.response?.data?.message ||
        'Could not connect to the server. Check your backend and internet connection.';

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchColleges();
    }, [])
  );

  const handleDeleteCollege = (college: College) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete "${college.name}" (${college.code})?\n\nColleges with active users, students, or faculty cannot be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response: any = await deleteCollege(college.id);
              const data = response?.data ?? response;
              Alert.alert(
                'Success',
                data?.message || `College "${college.name}" deleted successfully.`
              );
              fetchColleges();
            } catch (error: any) {
              setLoading(false);
              const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to delete college.';
              Alert.alert('Delete Failed', message);
            }
          },
        },
      ]
    );
  };

  const renderCollege = ({ item }: { item: College }) => {
    const status = item.status || 'ACTIVE';
    const isActive = status.toUpperCase() === 'ACTIVE';

    return (
      <View style={styles.collegeCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>
              {item.name?.charAt(0)?.toUpperCase() || 'C'}
            </Text>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.collegeName}>
              {item.name || 'Unnamed College'}
            </Text>

            <Text style={styles.collegeCode}>
              Code: {item.code || 'N/A'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isActive ? styles.activeText : styles.inactiveText,
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>
            {item.email || 'Not provided'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>
            {item.phone || 'Not provided'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address</Text>
          <Text style={styles.detailValue}>
            {item.address || 'Not provided'}
          </Text>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('EditCollege', {
                college: item,
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>
              ✏️ Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCollege(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>
              🗑️ Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          Loading colleges...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>All Colleges</Text>

        <Text style={styles.subtitle}>
          Manage and view registered colleges
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Total Colleges</Text>
          <Text style={styles.summaryNumber}>
            {colleges.length}
          </Text>
        </View>

        <Text style={styles.summaryIcon}>🏫</Text>
      </View>

      <FlatList
        data={colleges}
        keyExtractor={(item, index) =>
          String(item.id || `${item.code}-${index}`)
        }
        renderItem={renderCollege}
        contentContainerStyle={
          colleges.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchColleges(true)}
            colors={['#2563EB']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏫</Text>

            <Text style={styles.emptyTitle}>
              No Colleges Found
            </Text>

            <Text style={styles.emptyMessage}>
              No colleges are available yet. Add a college and refresh this page.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchColleges()}
            >
              <Text style={styles.retryButtonText}>
                Refresh List
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default ViewAllCollegesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#143680',
    fontSize: 16,
    fontWeight: '600',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#172554',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 18,
    backgroundColor: '#103076',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#DBEAFE',
    fontSize: 14,
  },
  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryIcon: {
    fontSize: 34,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  collegeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  titleContainer: {
    flex: 1,
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  collegeCode: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 6,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeText: {
    color: '#166534',
  },
  inactiveText: {
    color: '#991B1B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  detailRow: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    color: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#103076',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F6FB',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#172554',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: '#143988',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
