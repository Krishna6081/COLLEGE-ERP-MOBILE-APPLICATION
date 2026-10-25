import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/colors';

// Dashboards
import { StudentDashboardScreen } from '../screens/dashboard/StudentDashboardScreen';
import { FacultyDashboardScreen } from '../screens/dashboard/FacultyDashboardScreen';
import { AdminDashboardScreen } from '../screens/dashboard/AdminDashboardScreen';
import { HodDashboardScreen } from '../screens/dashboard/HodDashboardScreen';
import { PrincipalDashboardScreen } from '../screens/dashboard/PrincipalDashboardScreen';
import { AccountantDashboardScreen } from '../screens/dashboard/AccountantDashboardScreen';
import { LibrarianDashboardScreen } from '../screens/dashboard/LibrarianDashboardScreen';
import { ParentDashboardScreen } from '../screens/dashboard/ParentDashboardScreen';

// Principal Module Screens
import { PrincipalDepartmentsScreen } from '../screens/principal/PrincipalDepartmentsScreen';
import { PrincipalApprovalsScreen } from '../screens/principal/PrincipalApprovalsScreen';
import { PrincipalReportsScreen } from '../screens/principal/PrincipalReportsScreen';
import { PrincipalBroadcastNoticeScreen } from '../screens/principal/PrincipalBroadcastNoticeScreen';

// Feature Screens
import { StudentListScreen } from '../screens/students/StudentListScreen';
import { StudentDetailScreen } from '../screens/students/StudentDetailScreen';
import { FacultyListScreen } from '../screens/faculty/FacultyListScreen';
import { StudentAttendanceScreen } from '../screens/attendance/StudentAttendanceScreen';
import { MarkAttendanceScreen } from '../screens/attendance/MarkAttendanceScreen';
import { TimetableScreen } from '../screens/timetable/TimetableScreen';
import { AssignmentsScreen } from '../screens/assignments/AssignmentsScreen';
import { ExamScheduleScreen } from '../screens/exams/ExamScheduleScreen';
import { ResultsScreen } from '../screens/exams/ResultsScreen';
import { FeePaymentScreen } from '../screens/fees/FeePaymentScreen';
import { LibraryCatalogScreen } from '../screens/library/LibraryCatalogScreen';
import { PlacementDrivesScreen } from '../screens/placement/PlacementDrivesScreen';
import { NoticesScreen } from '../screens/notices/NoticesScreen';
import { ComplaintsScreen } from '../screens/complaints/ComplaintsScreen';
import { CertificatesScreen } from '../screens/certificates/CertificatesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
      <Stack.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
      <Stack.Screen name="Timetable" component={TimetableScreen} />
      <Stack.Screen name="Assignments" component={AssignmentsScreen} />
      <Stack.Screen name="Exams" component={ExamScheduleScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Fees" component={FeePaymentScreen} />
      <Stack.Screen name="Library" component={LibraryCatalogScreen} />
      <Stack.Screen name="Placements" component={PlacementDrivesScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="StudentList" component={StudentListScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="FacultyList" component={FacultyListScreen} />
    </Stack.Navigator>
  );
}

function PrincipalStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboardScreen} />
      <Stack.Screen name="PrincipalDepartments" component={PrincipalDepartmentsScreen} />
      <Stack.Screen name="PrincipalApprovals" component={PrincipalApprovalsScreen} />
      <Stack.Screen name="PrincipalReports" component={PrincipalReportsScreen} />
      <Stack.Screen name="PrincipalBroadcastNotice" component={PrincipalBroadcastNoticeScreen} />
      <Stack.Screen name="StudentList" component={StudentListScreen} />
      <Stack.Screen name="FacultyList" component={FacultyListScreen} />
    </Stack.Navigator>
  );
}

function PrincipalTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 4 },
      }}
    >
      <Tab.Screen
        name="PrincipalHomeTab"
        component={PrincipalStack}
        options={{
          tabBarLabel: 'Executive',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏛️</Text>,
        }}
      />
      <Tab.Screen
        name="DepartmentsTab"
        component={PrincipalDepartmentsScreen}
        options={{
          tabBarLabel: 'Departments',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏢</Text>,
        }}
      />
      <Tab.Screen
        name="ApprovalsTab"
        component={PrincipalApprovalsScreen}
        options={{
          tabBarLabel: 'Approvals',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📝</Text>,
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={PrincipalReportsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export const RoleBasedNavigator: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.user_type || 'STUDENT';

  if (role === 'PRINCIPAL' || role === 'VICE_PRINCIPAL') {
    return <PrincipalTabNavigator />;
  }

  const getDashboardComponent = () => {
    switch (role) {
      case 'FACULTY':
        return FacultyDashboardScreen;
      case 'HOD':
        return HodDashboardScreen;
      case 'COLLEGE_ADMIN':
      case 'SUPER_ADMIN':
        return AdminStack;
      case 'ACCOUNTANT':
        return AccountantDashboardScreen;
      case 'LIBRARIAN':
        return LibrarianDashboardScreen;
      case 'PARENT':
        return ParentDashboardScreen;
      default:
        return StudentStack;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 4 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={getDashboardComponent()}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="TimetableTab"
        component={TimetableScreen}
        options={{
          tabBarLabel: 'Timetable',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="NoticesTab"
        component={NoticesScreen}
        options={{
          tabBarLabel: 'Notices',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📢</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
