import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { SuperAdminDashboardScreen } from '../screens/dashboard/SuperAdminDashboardScreen';
import { AddCollegeScreen } from '../screens/super-admin/AddCollegeScreen';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/colors';
import NoticeManagementScreen from '../screens/super-admin/NoticeManagementScreen';
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
import { HodFacultyWorkloadScreen } from '../screens/hod/HodFacultyWorkloadScreen';
import { HodStudentsScreen } from '../screens/hod/HodStudentsScreen';
import { HodLeavesScreen } from '../screens/hod/HodLeavesScreen';
import { HodTimetableScreen } from '../screens/hod/HodTimetableScreen';
import { HodAttendanceScreen } from '../screens/hod/HodAttendanceScreen';
import { HodNoticeScreen } from '../screens/hod/HodNoticeScreen';
import { HodPerformanceScreen } from '../screens/hod/HodPerformanceScreen';
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
import ViewAllCollegeScreen from '../screens/super-admin/ViewAllCollegeScreen';
import EditCollegeScreen from '../screens/super-admin/EditCollegeScreen';
import UserListScreen from '../screens/super-admin/UserListScreen';
import AddUserScreen from '../screens/super-admin/AddUserScreen';
import EditUserScreen from '../screens/super-admin/EditUserScreen';
import RoleListScreen from '../screens/super-admin/RoleListScreen';
import AddRoleScreen from '../screens/super-admin/AddRoleScreen';
import EditRoleScreen from '../screens/super-admin/EditRoleScreen';
import AssignPermissionsScreen from '../screens/super-admin/AssignPermissionsScreen';
import AcademicYearScreen from '../screens/super-admin/AcademicYearScreen';
import SemesterScreen from '../screens/super-admin/SemesterScreen';
import DepartmentManagementScreen from '../screens/super-admin/DepartmentManagementScreen';
import CourseManagementScreen from '../screens/super-admin/CourseManagementScreen';
import SystemMonitoringScreen from '../screens/super-admin/SystemMonitoringScreen';
import ReportsScreen from '../screens/super-admin/ReportsScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function SuperAdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SuperAdminDashboard"
        component={SuperAdminDashboardScreen}
      />

      <Stack.Screen
        name="AddCollege"
        component={AddCollegeScreen}
      />

      <Stack.Screen
        name="ViewAllColleges"
        component={ViewAllCollegeScreen}
      />

      <Stack.Screen
        name="EditCollege"
        component={EditCollegeScreen}
      /> 
      <Stack.Screen
        name="UserList"
        component={UserListScreen}
      />

      <Stack.Screen
        name="AddUser"
        component={AddUserScreen}
      /> 
      <Stack.Screen
        name="EditUser"
        component={EditUserScreen}
      />
      <Stack.Screen
        name="RoleList"
        component={RoleListScreen}
      />
      <Stack.Screen
        name="AddRole"
        component={AddRoleScreen}
      />
      <Stack.Screen
        name="EditRole"
        component={EditRoleScreen}
      />
      <Stack.Screen
        name="AssignPermissions"
        component={AssignPermissionsScreen}
      />
            <Stack.Screen
        name="AcademicYear"
        component={AcademicYearScreen}
      />

      <Stack.Screen
        name="SemesterManagement"
        component={SemesterScreen}
      />

      <Stack.Screen
        name="DepartmentManagement"
        component={DepartmentManagementScreen}
      />

      <Stack.Screen
        name="CourseManagement"
        component={CourseManagementScreen}
      />
     

<Stack.Screen
  name="NoticeManagement"
  component={NoticeManagementScreen}
/>
<Stack.Screen
  name="SystemMonitoring"
  component={SystemMonitoringScreen}
/>
<Stack.Screen
  name="Reports"
  component={ReportsScreen}
  options={{ title: 'Reports & Analytics' }}
/>
    </Stack.Navigator>
    
  );

}


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

function HodStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HodDashboard" component={HodDashboardScreen} />
      <Stack.Screen name="HodFacultyWorkload" component={HodFacultyWorkloadScreen} />
      <Stack.Screen name="HodStudents" component={HodStudentsScreen} />
      <Stack.Screen name="HodLeaves" component={HodLeavesScreen} />
      <Stack.Screen name="HodTimetable" component={HodTimetableScreen} />
      <Stack.Screen name="HodAttendance" component={HodAttendanceScreen} />
      <Stack.Screen name="HodNotice" component={HodNoticeScreen} />
      <Stack.Screen name="HodPerformance" component={HodPerformanceScreen} />
    </Stack.Navigator>
  );
}

function HodTabNavigator() {
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
        name="HodHomeTab"
        component={HodStack}
        options={{
          tabBarLabel: 'Executive',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏛️</Text>,
        }}
      />
      <Tab.Screen
        name="HodFacultyTab"
        component={HodFacultyWorkloadScreen}
        options={{
          tabBarLabel: 'Faculty',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="HodStudentsTab"
        component={HodStudentsScreen}
        options={{
          tabBarLabel: 'Students',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎓</Text>,
        }}
      />
      <Tab.Screen
        name="HodApprovalsTab"
        component={HodLeavesScreen}
        options={{
          tabBarLabel: 'Leaves',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📝</Text>,
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

  if (role === 'HOD') {
    return <HodTabNavigator />;
  }

 import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { SuperAdminDashboardScreen } from '../screens/dashboard/SuperAdminDashboardScreen';
import { AddCollegeScreen } from '../screens/super-admin/AddCollegeScreen';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/colors';
import NoticeManagementScreen from '../screens/super-admin/NoticeManagementScreen';
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
import { HodFacultyWorkloadScreen } from '../screens/hod/HodFacultyWorkloadScreen';
import { HodStudentsScreen } from '../screens/hod/HodStudentsScreen';
import { HodLeavesScreen } from '../screens/hod/HodLeavesScreen';
import { HodTimetableScreen } from '../screens/hod/HodTimetableScreen';
import { HodAttendanceScreen } from '../screens/hod/HodAttendanceScreen';
import { HodNoticeScreen } from '../screens/hod/HodNoticeScreen';
import { HodPerformanceScreen } from '../screens/hod/HodPerformanceScreen';
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
import ViewAllCollegeScreen from '../screens/super-admin/ViewAllCollegeScreen';
import EditCollegeScreen from '../screens/super-admin/EditCollegeScreen';
import UserListScreen from '../screens/super-admin/UserListScreen';
import AddUserScreen from '../screens/super-admin/AddUserScreen';
import EditUserScreen from '../screens/super-admin/EditUserScreen';
import RoleListScreen from '../screens/super-admin/RoleListScreen';
import AddRoleScreen from '../screens/super-admin/AddRoleScreen';
import EditRoleScreen from '../screens/super-admin/EditRoleScreen';
import AssignPermissionsScreen from '../screens/super-admin/AssignPermissionsScreen';
import AcademicYearScreen from '../screens/super-admin/AcademicYearScreen';
import SemesterScreen from '../screens/super-admin/SemesterScreen';
import DepartmentManagementScreen from '../screens/super-admin/DepartmentManagementScreen';
import CourseManagementScreen from '../screens/super-admin/CourseManagementScreen';
import SystemMonitoringScreen from '../screens/super-admin/SystemMonitoringScreen';
import ReportsScreen from '../screens/super-admin/ReportsScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function SuperAdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SuperAdminDashboard"
        component={SuperAdminDashboardScreen}
      />

      <Stack.Screen
        name="AddCollege"
        component={AddCollegeScreen}
      />

      <Stack.Screen
        name="ViewAllColleges"
        component={ViewAllCollegeScreen}
      />

      <Stack.Screen
        name="EditCollege"
        component={EditCollegeScreen}
      /> 
      <Stack.Screen
        name="UserList"
        component={UserListScreen}
      />

      <Stack.Screen
        name="AddUser"
        component={AddUserScreen}
      /> 
      <Stack.Screen
        name="EditUser"
        component={EditUserScreen}
      />
      <Stack.Screen
        name="RoleList"
        component={RoleListScreen}
      />
      <Stack.Screen
        name="AddRole"
        component={AddRoleScreen}
      />
      <Stack.Screen
        name="EditRole"
        component={EditRoleScreen}
      />
      <Stack.Screen
        name="AssignPermissions"
        component={AssignPermissionsScreen}
      />
            <Stack.Screen
        name="AcademicYear"
        component={AcademicYearScreen}
      />

      <Stack.Screen
        name="SemesterManagement"
        component={SemesterScreen}
      />

      <Stack.Screen
        name="DepartmentManagement"
        component={DepartmentManagementScreen}
      />

      <Stack.Screen
        name="CourseManagement"
        component={CourseManagementScreen}
      />
     

<Stack.Screen
  name="NoticeManagement"
  component={NoticeManagementScreen}
/>
<Stack.Screen
  name="SystemMonitoring"
  component={SystemMonitoringScreen}
/>
<Stack.Screen
  name="Reports"
  component={ReportsScreen}
  options={{ title: 'Reports & Analytics' }}
/>
    </Stack.Navigator>
    
  );

}


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

function HodStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HodDashboard" component={HodDashboardScreen} />
      <Stack.Screen name="HodFacultyWorkload" component={HodFacultyWorkloadScreen} />
      <Stack.Screen name="HodStudents" component={HodStudentsScreen} />
      <Stack.Screen name="HodLeaves" component={HodLeavesScreen} />
      <Stack.Screen name="HodTimetable" component={HodTimetableScreen} />
      <Stack.Screen name="HodAttendance" component={HodAttendanceScreen} />
      <Stack.Screen name="HodNotice" component={HodNoticeScreen} />
      <Stack.Screen name="HodPerformance" component={HodPerformanceScreen} />
    </Stack.Navigator>
  );
}

function HodTabNavigator() {
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
        name="HodHomeTab"
        component={HodStack}
        options={{
          tabBarLabel: 'Executive',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏛️</Text>,
        }}
      />
      <Tab.Screen
        name="HodFacultyTab"
        component={HodFacultyWorkloadScreen}
        options={{
          tabBarLabel: 'Faculty',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="HodStudentsTab"
        component={HodStudentsScreen}
        options={{
          tabBarLabel: 'Students',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎓</Text>,
        }}
      />
      <Tab.Screen
        name="HodApprovalsTab"
        component={HodLeavesScreen}
        options={{
          tabBarLabel: 'Leaves',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📝</Text>,
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

  if (role === 'HOD') {
    return <HodTabNavigator />;
  }

  const getDashboardComponent = () => {
    switch (role) {
      case 'FACULTY':
        return FacultyDashboardScreen;
      case 'COLLEGE_ADMIN':
        return CollegeAdminDashboardScreen;
      case 'HOD':
        return HodDashboardScreen;
      case 'PRINCIPAL':
      case 'VICE_PRINCIPAL':
        return PrincipalDashboardScreen;
      case 'SUPER_ADMIN':
        return SuperAdminStack;
      case 'COLLEGE_ADMIN':
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
      tabBarStyle: {
        height: 60,
        paddingBottom: 8,
        paddingTop: 4,
      },
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={getDashboardComponent()}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="TimetableTab"
      component={TimetableScreen}
      options={{
        tabBarLabel: 'Timetable',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar-outline" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="NoticesTab"
      component={NoticesScreen}
      options={{
        tabBarLabel: 'Notices',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="notifications-outline" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person-outline" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="SettingsTab"
      component={SettingsScreen}
      options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="settings-outline" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);
};

    return (
     <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: {
        height: 60,
        paddingBottom: 8,
        paddingTop: 4,
      },
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={getDashboardComponent()}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="TimetableTab"
      component={TimetableScreen}
      options={{
        tabBarLabel: 'Timetable',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar-outline" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="NoticesTab"
      component={NoticesScreen}
      options={{
        tabBarLabel: 'Notices',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="notifications-outline" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person-outline" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="SettingsTab"
      component={SettingsScreen}
      options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="settings-outline" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);
};
