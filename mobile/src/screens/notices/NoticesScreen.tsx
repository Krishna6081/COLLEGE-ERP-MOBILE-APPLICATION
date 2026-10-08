import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';
import { ErpApi } from '../../api/erp.api';

export const NoticesScreen: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const res = await ErpApi.getNotices();
      if (res.data) setNotices(res.data);
    } catch {
      setNotices([
        { id: '1', title: 'Mid-Semester Examinations Timetable Released', content: 'The Mid-Semester exams for Sem 5 will commence from next Monday.', publish_date: '2026-10-01', priority: 'HIGH' },
        { id: '2', title: 'Annual Sports Meet 2026 - Registration Open', content: 'All students are invited to register for athletics, football, and badminton events.', publish_date: '2026-09-28', priority: 'NORMAL' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Notice Board" subtitle="Official Announcements & Circulars" />
      <FlatList
        data={notices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={item.priority === 'HIGH' ? { borderLeftWidth: 4, borderLeftColor: Colors.danger } : {}}>
            <View style={styles.row}>
              <Text style={styles.date}>{item.publish_date}</Text>
              <Badge label={item.priority} type={item.priority === 'HIGH' ? 'danger' : 'info'} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  content: { fontSize: 13, color: Colors.textSecondary, marginTop: 6, lineHeight: 18 },
});
