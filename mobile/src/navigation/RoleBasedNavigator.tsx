import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/colors';

// ── Dashboards ─────────────────────────────────────────────────────────────
import { StudentDashboardScreen }          from '../screens/dashboard/StudentDashboardScreen';
import { FacultyDashboardScreen }          from '../screens/dashboard/FacultyDashboardScreen';
import { AdminDashboardScreen }            from '../screens/dashboard/AdminDashboardScreen';
import { HodDashboardScreen }             from '../screens/dashboard/HodDashboardScreen';
import { PrincipalDashboardScreen }        from '../screens/dashboard/PrincipalDashboardScreen';
import { VicePrincipalDashboardScreen }    from '../screens/dashboard/VicePrincipalDashboardScreen';
import { AccountantDashboardScreen }       from '../screens/dashboard/AccountantDashboardScreen';
import { LibrarianDashboardScreen }        from '../screens/dashboard/LibrarianDashboardScreen';
import { ParentDashboardScreen }           from '../screens/dashboard/ParentDashboardScreen';
import { ExamCellDashboardScreen }         from '../screens/dashboard/ExamCellDashboardScreen';
import { PlacementOfficerDashboardScreen } from '../screens/dashboard/PlacementOfficerDashboardScreen';
import { NonTeachingStaffDashboardScreen } from '../screens/dashboard/NonTeachingStaffDashboardScreen';

// ── Feature Screens ────────────────────────────────────────────────────────
import { StudentListScreen }       from '../screens/students/StudentListScreen';
import { StudentDetailScreen }     from '../screens/students/StudentDetailScreen';
import { FacultyListScreen }       from '../screens/faculty/FacultyListScreen';
import { StudentAttendanceScreen } from '../screens/attendance/StudentAttendanceScreen';
import { MarkAttendanceScreen }    from '../screens/attendance/MarkAttendanceScreen';
import { TimetableScreen }         from '../screens/timetable/TimetableScreen';
import { AssignmentsScreen }       from '../screens/assignments/AssignmentsScreen';
import { ExamScheduleScreen }      from '../screens/exams/ExamScheduleScreen';
import { ResultsScreen }           from '../screens/exams/ResultsScreen';
import { FeePaymentScreen }        from '../screens/fees/FeePaymentScreen';
import { LibraryCatalogScreen }    from '../screens/library/LibraryCatalogScreen';
import { PlacementDrivesScreen }   from '../screens/placement/PlacementDrivesScreen';
import { NoticesScreen }           from '../screens/notices/NoticesScreen';
import { ComplaintsScreen }        from '../screens/complaints/ComplaintsScreen';
import { CertificatesScreen }      from '../screens/certificates/CertificatesScreen';
import { ProfileScreen }           from '../screens/profile/ProfileScreen';
import { SettingsScreen }          from '../screens/settings/SettingsScreen';

// ── Super Admin Screens ────────────────────────────────────────────────────
import { SuperAdminDashboardScreen } from '../screens/admin/SuperAdminDashboardScreen';
import { CollegesManagementScreen }  from '../screens/admin/CollegesManagementScreen';
import { AdministratorsScreen }      from '../screens/admin/AdministratorsScreen';
import { RolesPermissionsScreen }    from '../screens/admin/RolesPermissionsScreen';
import { SystemSettingsScreen }      from '../screens/admin/SystemSettingsScreen';
import { ReportsScreen }             from '../screens/admin/ReportsScreen';
import { AuditLogsScreen }           from '../screens/admin/AuditLogsScreen';
import { AcademicConfigScreen }      from '../screens/admin/AcademicConfigScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─────────────────────────────────────────────────────────────────────────────
// STACK NAVIGATORS (per role group)
// ─────────────────────────────────────────────────────────────────────────────

function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentDashboard"   component={StudentDashboardScreen} />
      <Stack.Screen name="StudentAttendance"  component={StudentAttendanceScreen} />
      <Stack.Screen name="Timetable"          component={TimetableScreen} />
      <Stack.Screen name="Assignments"        component={AssignmentsScreen} />
      <Stack.Screen name="Exams"              component={ExamScheduleScreen} />
      <Stack.Screen name="Results"            component={ResultsScreen} />
      <Stack.Screen name="Fees"               component={FeePaymentScreen} />
      <Stack.Screen name="Library"            component={LibraryCatalogScreen} />
      <Stack.Screen name="Placements"         component={PlacementDrivesScreen} />
      <Stack.Screen name="Certificates"       component={CertificatesScreen} />
      <Stack.Screen name="Complaints"         component={ComplaintsScreen} />
    </Stack.Navigator>
  );
}

function FacultyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FacultyDashboard"  component={FacultyDashboardScreen} />
      <Stack.Screen name="MarkAttendance"    component={MarkAttendanceScreen} />
      <Stack.Screen name="Timetable"         component={TimetableScreen} />
      <Stack.Screen name="Assignments"       component={AssignmentsScreen} />
      <Stack.Screen name="StudentList"       component={StudentListScreen} />
      <Stack.Screen name="StudentDetail"     component={StudentDetailScreen} />
      <Stack.Screen name="Library"           component={LibraryCatalogScreen} />
    </Stack.Navigator>
  );
}

function HodStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HodDashboard"   component={HodDashboardScreen} />
      <Stack.Screen name="StudentList"    component={StudentListScreen} />
      <Stack.Screen name="StudentDetail"  component={StudentDetailScreen} />
      <Stack.Screen name="FacultyList"    component={FacultyListScreen} />
      <Stack.Screen name="Timetable"      component={TimetableScreen} />
      <Stack.Screen name="Complaints"     component={ComplaintsScreen} />
    </Stack.Navigator>
  );
}

function PrincipalStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboardScreen} />
      <Stack.Screen name="StudentList"        component={StudentListScreen} />
      <Stack.Screen name="FacultyList"        component={FacultyListScreen} />
      <Stack.Screen name="Complaints"         component={ComplaintsScreen} />
      <Stack.Screen name="Reports"            component={ReportsScreen} />
    </Stack.Navigator>
  );
}

function VicePrincipalStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VicePrincipalDashboard" component={VicePrincipalDashboardScreen} />
      <Stack.Screen name="StudentList"            component={StudentListScreen} />
      <Stack.Screen name="FacultyList"            component={FacultyListScreen} />
      <Stack.Screen name="Complaints"             component={ComplaintsScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard"  component={AdminDashboardScreen} />
      <Stack.Screen name="StudentList"     component={StudentListScreen} />
      <Stack.Screen name="StudentDetail"   component={StudentDetailScreen} />
      <Stack.Screen name="FacultyList"     component={FacultyListScreen} />
      <Stack.Screen name="Complaints"      component={ComplaintsScreen} />
      <Stack.Screen name="Certificates"    component={CertificatesScreen} />
    </Stack.Navigator>
  );
}

function SuperAdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SuperAdminDashboard"  component={SuperAdminDashboardScreen} />
      <Stack.Screen name="CollegesManagement"   component={CollegesManagementScreen} />
      <Stack.Screen name="Administrators"       component={AdministratorsScreen} />
      <Stack.Screen name="RolesPermissions"     component={RolesPermissionsScreen} />
      <Stack.Screen name="SystemSettings"       component={SystemSettingsScreen} />
      <Stack.Screen name="SuperAdminReports"    component={ReportsScreen} />
      <Stack.Screen name="AuditLogs"            component={AuditLogsScreen} />
      <Stack.Screen name="AcademicConfig"       component={AcademicConfigScreen} />
      <Stack.Screen name="StudentList"          component={StudentListScreen} />
      <Stack.Screen name="StudentDetail"        component={StudentDetailScreen} />
      <Stack.Screen name="FacultyList"          component={FacultyListScreen} />
    </Stack.Navigator>
  );
}

function ExamCellStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExamCellDashboard" component={ExamCellDashboardScreen} />
      <Stack.Screen name="Exams"             component={ExamScheduleScreen} />
      <Stack.Screen name="Results"           component={ResultsScreen} />
      <Stack.Screen name="StudentList"       component={StudentListScreen} />
    </Stack.Navigator>
  );
}

function PlacementOfficerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlacementOfficerDashboard" component={PlacementOfficerDashboardScreen} />
      <Stack.Screen name="Placements"                component={PlacementDrivesScreen} />
      <Stack.Screen name="StudentList"               component={StudentListScreen} />
    </Stack.Navigator>
  );
}

function LibrarianStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibrarianDashboard" component={LibrarianDashboardScreen} />
      <Stack.Screen name="Library"            component={LibraryCatalogScreen} />
    </Stack.Navigator>
  );
}

function AccountantStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountantDashboard" component={AccountantDashboardScreen} />
      <Stack.Screen name="Fees"                component={FeePaymentScreen} />
      <Stack.Screen name="StudentList"         component={StudentListScreen} />
    </Stack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE → STACK MAP
// ─────────────────────────────────────────────────────────────────────────────
const roleStackMap: Record<string, React.ComponentType<any>> = {
  STUDENT:              StudentStack,
  FACULTY:              FacultyStack,
  HOD:                  HodStack,
  PRINCIPAL:            PrincipalStack,
  VICE_PRINCIPAL:       VicePrincipalStack,
  COLLEGE_ADMIN:        AdminStack,
  SUPER_ADMIN:          SuperAdminStack,
  ACCOUNTANT:           AccountantStack,
  LIBRARIAN:            LibrarianStack,
  PARENT:               StudentStack,     // parents use student view scoped to child
  EXAM_CELL:            ExamCellStack,
  PLACEMENT_OFFICER:    PlacementOfficerStack,
  NON_TEACHING_STAFF:   StudentStack,     // reuse student stack; dashboard differs
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLE-SPECIFIC DASHBOARD OVERRIDES (for simple non-stack roles)
// ─────────────────────────────────────────────────────────────────────────────
const simpleDashboardMap: Record<string, React.ComponentType<any>> = {
  PARENT:             ParentDashboardScreen,
  NON_TEACHING_STAFF: NonTeachingStaffDashboardScreen,
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN NAVIGATOR
// ─────────────────────────────────────────────────────────────────────────────
export const RoleBasedNavigator: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.user_type || 'STUDENT';

  // Get the home stack component (stack or simple screen)
  const HomeStack = simpleDashboardMap[role]
    ? (() => {
        const Simple = simpleDashboardMap[role];
        return (props: any) => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SimpleHome"   component={Simple} />
            <Stack.Screen name="Complaints"   component={ComplaintsScreen} />
            <Stack.Screen name="Notices"      component={NoticesScreen} />
          </Stack.Navigator>
        );
      })()
    : (roleStackMap[role] || StudentStack);

  // Role-based tab configuration
  const getTabConfig = () => {
    const base = [
      { name: 'HomeTab',     label: 'Home',     icon: '🏠', component: HomeStack },
      { name: 'NoticesTab',  label: 'Notices',  icon: '📢', component: NoticesScreen },
      { name: 'ProfileTab',  label: 'Profile',  icon: '👤', component: ProfileScreen },
      { name: 'SettingsTab', label: 'Settings', icon: '⚙️', component: SettingsScreen },
    ];

    // Role-specific second tab
    const roleSecondTab: Record<string, { name: string; label: string; icon: string; component: React.ComponentType<any> }> = {
      STUDENT:              { name: 'TimetableTab',  label: 'Timetable',   icon: '📅', component: TimetableScreen },
      FACULTY:              { name: 'TimetableTab',  label: 'Timetable',   icon: '📅', component: TimetableScreen },
      HOD:                  { name: 'TimetableTab',  label: 'Timetable',   icon: '📅', component: TimetableScreen },
      PRINCIPAL:            { name: 'ComplaintsTab', label: 'Complaints',  icon: '📋', component: ComplaintsScreen },
      VICE_PRINCIPAL:       { name: 'ComplaintsTab', label: 'Complaints',  icon: '📋', component: ComplaintsScreen },
      COLLEGE_ADMIN:        { name: 'ComplaintsTab', label: 'Complaints',  icon: '📋', component: ComplaintsScreen },
      SUPER_ADMIN:          { name: 'CollegesTab',   label: 'Colleges',    icon: '🏫', component: CollegesManagementScreen },
      ACCOUNTANT:           { name: 'FeesTab',       label: 'Fees',        icon: '💰', component: FeePaymentScreen },
      LIBRARIAN:            { name: 'LibraryTab',    label: 'Library',     icon: '📚', component: LibraryCatalogScreen },
      PARENT:               { name: 'TimetableTab',  label: 'Timetable',   icon: '📅', component: TimetableScreen },
      EXAM_CELL:            { name: 'ExamsTab',      label: 'Exams',       icon: '📝', component: ExamScheduleScreen },
      PLACEMENT_OFFICER:    { name: 'DrivesTab',     label: 'Drives',      icon: '💼', component: PlacementDrivesScreen },
      NON_TEACHING_STAFF:   { name: 'NoticesTab2',   label: 'Notices',     icon: '📢', component: NoticesScreen },
    };

    if (roleSecondTab[role]) {
      base.splice(1, 0, roleSecondTab[role]);
    }

    return base;
  };

  const tabs = getTabConfig();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 4 },
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>{tab.icon}</Text>,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};
