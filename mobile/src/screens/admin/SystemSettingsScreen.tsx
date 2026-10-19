import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { SuperAdminApi, SystemSetting } from '../../api/superadmin.api';
import { CollegeSelector } from '../../components/CollegeSelector';

export const SystemSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collegeId, setCollegeId] = useState('');
  const [errorMessage, setErrorMessage] = useState('Select a college to view its system settings.');
  const currentCollegeId = useRef(collegeId);

  const fetchSettings = async () => {
    const requestedCollegeId = collegeId;
    if (!collegeId) {
      setSettings([]);
      setFormValues({});
      setErrorMessage('Select a college to view its system settings.');
      return;
    }
    setLoading(true);
    try {
      const res = await SuperAdminApi.getSystemSettings(requestedCollegeId);
      if (currentCollegeId.current !== requestedCollegeId) return;
      if (res.success && res.data) {
        setSettings(res.data);
        const map: Record<string, string> = {};
        res.data.forEach((s) => {
          map[s.setting_key] = s.setting_value;
        });
        setFormValues(map);
        setErrorMessage('');
      } else {
        setSettings([]);
        setFormValues({});
        setErrorMessage(res.message || 'No settings were returned for this college.');
      }
    } catch (e: any) {
      if (currentCollegeId.current !== requestedCollegeId) return;
      setSettings([]);
      setFormValues({});
      setErrorMessage(e?.message || 'Could not load system settings. Check your connection and try again.');
    } finally {
      if (currentCollegeId.current === requestedCollegeId) setLoading(false);
    }
  };

  useEffect(() => {
    currentCollegeId.current = collegeId;
    fetchSettings();
  }, [collegeId]);

  const handleUpdate = (key: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    if (!collegeId) {
      Alert.alert('Select a college', 'Choose a college before saving system settings.');
      return;
    }
    setSaving(true);
    try {
      const payload = Object.keys(formValues).map((key) => {
        const item = settings.find((s) => s.setting_key === key);
        return {
          key,
          value: formValues[key],
          group: item?.setting_group || 'GENERAL',
        };
      });

      const res = await SuperAdminApi.updateSystemSettings(collegeId, payload);
      if (res.success) {
        Alert.alert('Settings Saved', 'System configuration has been successfully updated.');
        fetchSettings();
      } else {
        Alert.alert('Error', res.message || 'Failed to update settings.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save system settings.');
    } finally {
      setSaving(false);
    }
  };

  const grouped = settings.reduce((acc, s) => {
    acc[s.setting_group] = acc[s.setting_group] || [];
    acc[s.setting_group].push(s);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  const groupIcons: Record<string, string> = {
    GENERAL: '🏛️ GENERAL CONFIGURATION',
    ACADEMIC: '🎓 ACADEMIC POLICIES',
    SECURITY: '🛡️ SECURITY & SESSION RULES',
    NOTIFICATIONS: '🔔 ALERT & NOTIFICATION SERVICES',
  };

  return (
    <View style={styles.container}>
      <Header title="System Settings" subtitle="Configuration for the selected college" />
      <CollegeSelector value={collegeId} onChange={setCollegeId} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : errorMessage ? (
          <Text style={styles.emptyText}>{errorMessage}</Text>
        ) : (
          <View>
            {settings.length === 0 && <Text style={styles.emptyText}>No saved settings exist for this college.</Text>}
            {Object.keys(grouped).map((group) => (
              <View key={group} style={{ marginBottom: 20 }}>
                <Text style={styles.groupTitle}>{groupIcons[group] || group}</Text>
                {grouped[group].map((item) => (
                  <Card key={item.id} style={styles.card}>
                    <Text style={styles.settingKey}>{item.setting_key}</Text>
                    {item.description && <Text style={styles.settingDesc}>{item.description}</Text>}
                    <TextInput
                      style={styles.input}
                      value={formValues[item.setting_key] || ''}
                      onChangeText={(val) => handleUpdate(item.setting_key, val)}
                      placeholder="Setting value"
                    />
                  </Card>
                ))}
              </View>
            ))}

            <Button
              title="SAVE ALL SYSTEM SETTINGS"
              onPress={handleSave}
              loading={saving}
              style={{ marginTop: 10, marginBottom: 20 }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 30 },
  groupTitle: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, marginBottom: 8, letterSpacing: 0.8 },
  card: { padding: 14, marginBottom: 10 },
  settingKey: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  settingDesc: { fontSize: 12, color: Colors.textSecondary, marginVertical: 4 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', marginTop: 28 },
  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: '#F8FAFC',
    marginTop: 6,
    fontWeight: '700',
  },
});
