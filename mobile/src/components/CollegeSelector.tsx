import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { College, SuperAdminApi } from '../api/superadmin.api';
import { Colors } from '../constants/colors';

type CollegeSelectorProps = {
  value: string;
  onChange: (collegeId: string) => void;
};

export const CollegeSelector: React.FC<CollegeSelectorProps> = ({ value, onChange }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadColleges = async () => {
    setLoading(true);
    try {
      const response = await SuperAdminApi.getColleges(1, 100);
      setColleges(response?.data?.colleges || []);
      setError('');
    } catch (loadError: any) {
      setError(loadError?.message || 'Could not load colleges. Check your connection and retry.');
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const activeColleges = colleges.filter((college) => college.status === 'ACTIVE');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>COLLEGE SCOPE</Text>
      {loading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : error ? (
        <TouchableOpacity onPress={loadColleges} accessibilityRole="button">
          <Text style={styles.error}>{error}  Tap to retry.</Text>
        </TouchableOpacity>
      ) : activeColleges.length === 0 ? (
        <Text style={styles.empty}>No active colleges are available.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {activeColleges.map((college) => {
            const selected = college.id === value;
            return (
              <TouchableOpacity
                key={college.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChange(college.id)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {college.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      {value && !loading && <Text style={styles.selectedId}>Selected ID: {value}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 10 },
  label: { color: Colors.textSecondary, fontSize: 11, fontWeight: '800', marginBottom: 8 },
  option: {
    justifyContent: 'center',
    minHeight: 40,
    marginRight: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.cardBg,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  optionText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  optionTextSelected: { color: Colors.primary },
  selectedId: { color: Colors.textSecondary, fontSize: 11, marginTop: 5 },
  error: { color: Colors.danger, fontSize: 12 },
  empty: { color: Colors.textSecondary, fontSize: 12 },
});
