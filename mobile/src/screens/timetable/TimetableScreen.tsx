import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Colors } from '../../constants/colors';

export const TimetableScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  const scheduleMap: Record<string, any[]> = {
    MONDAY: [
      { time: '09:00 - 10:00 AM', subject: 'Database Management Systems', code: 'CS501', room: 'LH-101', faculty: 'Prof. John Smith' },
      { time: '10:00 - 11:00 AM', subject: 'Web Application Engineering', code: 'CS502', room: 'LH-101', faculty: 'Prof. Sarah Connor' },
      { time: '11:30 - 01:30 PM', subject: 'DBMS Laboratory', code: 'CS503', room: 'LAB-201', faculty: 'Prof. John Smith' },
    ],
    TUESDAY: [
      { time: '09:00 - 10:00 AM', subject: 'Operating Systems', code: 'CS504', room: 'LH-102', faculty: 'Prof. Alan Turing' },
      { time: '10:00 - 11:00 AM', subject: 'Computer Networks', code: 'CS505', room: 'LH-102', faculty: 'Prof. David Clark' },
    ],
    WEDNESDAY: [
      { time: '09:00 - 10:00 AM', subject: 'Database Management Systems', code: 'CS501', room: 'LH-101', faculty: 'Prof. John Smith' },
    ],
    THURSDAY: [
      { time: '10:00 - 11:00 AM', subject: 'Web Application Engineering', code: 'CS502', room: 'LH-101', faculty: 'Prof. Sarah Connor' },
    ],
    FRIDAY: [
      { time: '09:00 - 11:00 AM', subject: 'Project Lab 1', code: 'CS506', room: 'LAB-202', faculty: 'Prof. Alan Turing' },
    ],
  };

  return (
    <View style={styles.container}>
      <Header title="Weekly Timetable" subtitle="Semester 5 Division A Schedule" />
      <View style={styles.tabRow}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.tab, selectedDay === day && styles.activeTab]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.tabTxt, selectedDay === day && styles.activeTabTxt]}>
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {scheduleMap[selectedDay]?.map((slot, idx) => (
          <Card key={idx} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.time}>{slot.time}</Text>
              <Badge label={slot.room} type="info" />
            </View>
            <Text style={styles.title}>{slot.subject} ({slot.code})</Text>
            <Text style={styles.faculty}>{slot.faculty}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: Colors.primary },
  tabTxt: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  activeTabTxt: { color: '#FFFFFF' },
  scroll: { paddingBottom: 20 },
  card: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  time: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  faculty: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
