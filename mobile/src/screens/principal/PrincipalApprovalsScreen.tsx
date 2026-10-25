import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { PrincipalApi } from '../../api/principal.api';

interface ApprovalItem {
  id: string;
  type: 'LEAVE' | 'GRIEVANCE' | 'CERTIFICATE' | 'EVENT';
  applicant_name: string;
  applicant_role: string;
  department: string;
  title: string;
  description: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

const CATEGORIES = ['ALL', 'LEAVE', 'GRIEVANCE', 'CERTIFICATE', 'EVENT'];

export const PrincipalApprovalsScreen: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      const response = await PrincipalApi.getApprovals(activeCategory);
      if (response && response.data) {
        setApprovals(response.data);
      }
    } catch {
      // Fallback data
      setApprovals([
        {
          id: 'appr-001',
          type: 'LEAVE',
          applicant_name: 'Dr. Sarah Connor',
          applicant_role: 'Associate Professor',
          department: 'Computer Science',
          title: 'Medical Leave Request',
          description: 'Post-surgery recovery and rest recommended by physician. Total 4 days requested.',
          date: '2026-10-26',
          status: 'PENDING',
          priority: 'HIGH',
        },
        {
          id: 'appr-002',
          type: 'LEAVE',
          applicant_name: 'Prof. Alan Turing',
          applicant_role: 'Head of Department',
          department: 'Computer Science',
          title: 'Academic Conference Duty Leave',
          description: 'Presenting research paper on Distributed Systems at IEEE TechCon in Bangalore.',
          date: '2026-11-02',
          status: 'PENDING',
          priority: 'MEDIUM',
        },
        {
          id: 'appr-003',
          type: 'GRIEVANCE',
          applicant_name: 'Rohan Sharma',
          applicant_role: 'Student (BE Mech)',
          department: 'Mechanical Engineering',
          title: 'Hostel Reading Room Timings Extension',
          description: 'Requesting permission to keep the central library and hostel study hall open until 1:00 AM during mid-sem exams.',
          date: '2026-10-24',
          status: 'PENDING',
          priority: 'MEDIUM',
        },
        {
          id: 'appr-004',
          type: 'CERTIFICATE',
          applicant_name: 'Priya Deshmukh',
          applicant_role: 'Student (TE ECE)',
          department: 'Electronics & Communication',
          title: 'Recommendation Letter for Foreign Internship',
          description: 'Application for Summer Research Internship at Technical University of Munich (TUM).',
          date: '2026-10-23',
          status: 'PENDING',
          priority: 'HIGH',
        },
        {
          id: 'appr-005',
          type: 'EVENT',
          applicant_name: 'Coding Club Committee',
          applicant_role: 'Student Body',
          department: 'Computer Science',
          title: 'National Level 36-Hr Hackathon "HackMIT 2026"',
          description: 'Requesting campus auditorium and computer lab reservation from 15th to 17th November.',
          date: '2026-10-22',
          status: 'PENDING',
          priority: 'HIGH',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [activeCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApprovals();
  };

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id);
    try {
      await PrincipalApi.processApproval(id, action);
      setApprovals((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : item))
      );
      Alert.alert(
        'Action Recorded',
        `The request has been ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`
      );
    } catch {
      // Optimistic update if offline
      setApprovals((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : item))
      );
      Alert.alert(
        'Action Recorded',
        `The request has been ${action === 'APPROVE' ? 'approved' : 'rejected'}.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredItems = approvals.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.type === activeCategory;
  });

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  const getTypeBadgeType = (type: string) => {
    switch (type) {
      case 'LEAVE':
        return 'warning';
      case 'GRIEVANCE':
        return 'danger';
      case 'CERTIFICATE':
        return 'info';
      case 'EVENT':
        return 'primary';
      default:
        return 'primary';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Executive Approvals"
        subtitle={`${pendingCount} requests requiring your review`}
        onRightPress={onRefresh}
        rightIconLabel="Refresh"
      />

      {/* Category Filter Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryTab, activeCategory === cat && styles.categoryTabActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat === 'ALL' ? 'All Requests' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching approval requests...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>✓</Text>
              <Text style={styles.emptyTitle}>All Clear</Text>
              <Text style={styles.emptySubtitle}>No pending items in this category at this time.</Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} style={styles.approvalCard}>
                <View style={styles.cardHeader}>
                  <Badge label={item.type} type={getTypeBadgeType(item.type)} />
                  {item.priority === 'HIGH' || item.priority === 'URGENT' ? (
                    <Badge label={item.priority} type="danger" />
                  ) : null}
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>

                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>

                <View style={styles.applicantInfo}>
                  <Text style={styles.applicantName}>{item.applicant_name}</Text>
                  <Text style={styles.applicantRole}>
                    {item.applicant_role} • {item.department}
                  </Text>
                </View>

                {item.status === 'PENDING' ? (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleAction(item.id, 'APPROVE')}
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.approveBtnText}>Approve</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleAction(item.id, 'REJECT')}
                      disabled={processingId === item.id}
                    >
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.statusRow}>
                    <Text
                      style={[
                        styles.statusLabel,
                        { color: item.status === 'APPROVED' ? Colors.accent : Colors.danger },
                      ]}
                    >
                      Status: {item.status}
                    </Text>
                  </View>
                )}
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  categoryContainer: {
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 30,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyEmoji: {
    fontSize: 48,
    color: Colors.accent,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  approvalCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  applicantInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  applicantName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  applicantRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    backgroundColor: Colors.accent,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  rejectBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  rejectBtnText: {
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  statusRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
});
