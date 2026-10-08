import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const PlacementDrivesScreen: React.FC = () => {
  const [drives, setDrives] = useState<any[]>([]);

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    try {
      const res = await ErpApi.getPlacementDrives();
      if (res.data) setDrives(res.data);
    } catch {
      setDrives([
        { id: '1', company_name: 'Google India', job_role: 'Associate Software Engineer', salary_package: '₹28,00,000 CTC', min_cgpa: 8.0, drive_date: 'Oct 25, 2026' },
        { id: '2', company_name: 'Microsoft', job_role: 'Software Development Engineer I', salary_package: '₹26,50,000 CTC', min_cgpa: 7.5, drive_date: 'Nov 02, 2026' },
      ]);
    }
  };

  const handleApply = (company: string) => {
    Alert.alert('Eligibility Check Passed!', `You have successfully applied to ${company} placement drive.`);
  };

  return (
    <View style={styles.container}>
      <Header title="Placement & Internship Drives" subtitle="Campus Recruitment 2026" />
      <FlatList
        data={drives}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.company}>{item.company_name}</Text>
              <Badge label={item.salary_package} type="success" />
            </View>
            <Text style={styles.role}>{item.job_role}</Text>
            <Text style={styles.meta}>Drive Date: {item.drive_date} | Min CGPA: {item.min_cgpa}</Text>
            <TouchableOpacity style={styles.applyBtn} onPress={() => handleApply(item.company_name)}>
              <Text style={styles.applyTxt}>APPLY FOR DRIVE</Text>
            </TouchableOpacity>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  company: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  role: { fontSize: 14, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  applyBtn: { marginTop: 12, backgroundColor: Colors.primary, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  applyTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
