
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { DashboardApi } from '../../api/dashboard.api';
import { useAuthStore } from '../../store/useAuthStore';


export const StudentDashboardScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation<any>();

  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);

    try {
      const res = await DashboardApi.getDashboardData();

      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.log('Dashboard loading error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title={`Welcome, ${user?.first_name || 'Student'}!`}
        subtitle="Student Dashboard"
        onRightPress={loadData}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadData}
            colors={[Colors.primary]}
          />
        }
      >
        
    
{/* Quick Access */}
<Text style={styles.sectionTitle}>QUICK ACCESS</Text>

<View style={styles.quickAccessGrid}>
  {[
    { title: 'View Profile', subtitle: 'Personal Details', icon: '👤', route: 'StudentProfile' },
    { title: 'Attendance', subtitle: 'Attendance Records', icon: '📊', route: 'StudentAttendance' },
    { title: 'Timetable', subtitle: 'Daily Schedule', icon: '📅', route: 'Timetable' },
    { title: 'Subjects', subtitle: 'My Subjects', icon: '📚', route: 'Subjects' },
    { title: 'Study Materials', subtitle: 'Notes & PDFs', icon: '📖', route: 'StudyMaterials' },
    { title: 'Assignments', subtitle: 'View & Submit', icon: '📝', route: 'SubmitAssignment' },
    { title: 'Apply for Leave', subtitle: 'Apply & Track Leave', icon: '🗓️', route: 'LeaveApplication' },
    { title: 'Exam Schedule', subtitle: 'Upcoming Exams', icon: '📋', route: 'ExamSchedule' },
    { title: 'View Results', subtitle: 'Marks & Grades', icon: '🏆', route: 'Results' },
    { title: 'Certificates', subtitle: 'Request Certificate', icon: '📜', route: 'Certificates' },
    { title: 'Fee Receipt', subtitle: 'View & Download', icon: '💰', route: 'Fees' },
    { title: 'Notices', subtitle: 'College Announcements', icon: '📢', route: 'Notices' },
    { title: 'Events', subtitle: 'College Activities', icon: '🎉', route: 'Events' },
    { title: 'Placement', subtitle: 'Explore Job Opportunities', icon: '💼', route: 'Placement' },
    { title: 'Internship', subtitle: 'Explore Opportunities', icon: '🎓', route: 'Internship' },
    { title: 'Raise Complaint', subtitle: 'Submit & Track Issues', icon: '🛠️', route: 'Complaints' },
  ].map((item) => (
    <TouchableOpacity
      key={item.route}
      style={styles.quickCard}
      activeOpacity={0.75}
      onPress={() => navigation.navigate(item.route)}
    >
      <View style={styles.quickIconBox}>
        <Text style={styles.quickIcon}>{item.icon}</Text>
      </View>

      <Text style={styles.quickTitle}>{item.title}</Text>
      <Text style={styles.quickSubtitle}>{item.subtitle}</Text>

      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  ))}
</View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            title="Attendance"
            value={`${data?.attendance_percentage ?? 0}%`}
            subtitle={`${data?.attended_lectures ?? 0}/${data?.total_lectures ?? 0} Lectures`}
            color={Colors.accent}
          />

          <StatCard
            title="Current SGPA"
            value={data?.current_sgpa ?? 'N/A'}
            subtitle="Latest Result"
            color={Colors.primary}
          />
        </View>

        {/* Today's Timetable */}
        <Text style={styles.sectionTitle}>TODAY'S SCHEDULE</Text>

        {data?.todays_timetable?.map((item: any, idx: number) => (
          <Card key={idx} style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.timeText}>{item.time}</Text>
              <Badge label={item.room} type="info" />
            </View>

            <Text style={styles.subjectText}>{item.subject}</Text>
            <Text style={styles.facultyText}>{item.faculty}</Text>
          </Card>
        ))}

        {/* Fee Summary */}
        <Text style={styles.sectionTitle}>FEE SUMMARY</Text>

        <Card>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Total Amount:</Text>
            <Text style={styles.feeVal}>
              ₹{data?.fee_status?.total ?? 0}
            </Text>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Paid Amount:</Text>
            <Text style={[styles.feeVal, { color: Colors.accent }]}>
              ₹{data?.fee_status?.paid ?? 0}
            </Text>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Pending Dues:</Text>
            <Text style={[styles.feeVal, { color: Colors.danger }]}>
              ₹{data?.fee_status?.due ?? 0}
            </Text>
          </View>
        </Card>

        {/* Upcoming Exams */}
        <Text style={styles.sectionTitle}>UPCOMING EXAMINATIONS</Text>

        {data?.upcoming_exams?.map((exam: any, idx: number) => (
          <Card key={idx}>
            <View style={styles.examRow}>
              <View>
                <Text style={styles.examTitle}>{exam.title}</Text>
                <Text style={styles.examDate}>
                  {exam.date} • {exam.time}
                </Text>
              </View>

              <Badge label="Scheduled" type="warning" />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  
container: {
  flex: 1,
  backgroundColor: '#F4F6FB',
},

scrollContent: {
  paddingBottom: 35,
},
sectionTitle: {
  fontSize: 14,
  fontWeight: '800',
  color: '#0C2466',
  marginHorizontal: 18,
  marginTop: 24,
  marginBottom: 14,
  letterSpacing: 0.7,
},

  quickCard: {
  width: '48%',
  minHeight: 145,
  backgroundColor: '#FFFFFF',
  borderRadius: 18,
  padding: 15,
  alignItems: 'flex-start',
  justifyContent: 'center',
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 5,
  borderWidth: 1,
  borderColor: '#EEF1F7',
},

quickIcon: {
  fontSize: 23,
},

quickTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#0C2466',
},

quickSubtitle: {
  fontSize: 11,
  color: '#858B9A',
  marginTop: 5,
},

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
  },

  scheduleCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },

  subjectText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  facultyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  feeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  feeVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  examRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  examTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  examDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

quickAccessGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  rowGap: 14,
},
quickIconBox: {
  width: 44,
  height: 44,
  borderRadius: 14,
  backgroundColor: '#EEF2FF',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
},
cardArrow: {
  position: 'absolute',
  right: 14,
  top: 13,
  fontSize: 23,
  color: '#A3AED0',
  fontWeight: '600',
},

});
