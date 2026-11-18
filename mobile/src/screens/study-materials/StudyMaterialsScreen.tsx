
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';

import { apiClient } from '../../api/client';
import { Colors } from '../../constants/colors';

interface StudyMaterial {
  id: string;
  title: string;
  subject_name?: string;
  description?: string;
  file_url?: string;
  external_link?: string;
  uploaded_at?: string;
}

export default function StudyMaterialsScreen() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      setLoading(true);

      const response: any = await apiClient.get('/study-materials');

      const records = Array.isArray(response?.data)
        ? response.data
        : response?.data?.materials || [];

      setMaterials(records);
    } catch (error: any) {
      console.error('Study Materials API Error:', error);

      Alert.alert(
        'Error',
        error?.message || 'Unable to load study materials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openMaterial = async (url?: string) => {
    if (!url) {
      Alert.alert(
        'Unavailable',
        'Material link is not available.'
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'Unable to open this study material.'
        );
      }
    } catch (error) {
      console.error('Open Material Error:', error);

      Alert.alert(
        'Error',
        'Unable to open this study material.'
      );
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const renderMaterial = ({
    item,
    index,
  }: {
    item: StudyMaterial;
    index: number;
  }) => (
    <View style={styles.card}>
      {/* Material Header */}
      <View style={styles.cardHeader}>
        <View style={styles.materialIcon}>
          <Text style={styles.iconText}>📚</Text>
        </View>

        <View style={styles.materialInfo}>
          <Text style={styles.materialTitle}>
            {item.title}
          </Text>

          <Text style={styles.subjectName}>
            {item.subject_name || 'General Study Material'}
          </Text>
        </View>

        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>
            {index + 1}
          </Text>
        </View>
      </View>

      {/* Description */}
      {!!item.description && (
        <Text style={styles.description}>
          {item.description}
        </Text>
      )}

      <View style={styles.divider} />

      {/* Upload Date */}
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>Uploaded On</Text>

        <Text style={styles.dateValue}>
          {item.uploaded_at
            ? new Date(item.uploaded_at).toLocaleDateString()
            : 'Date not available'}
        </Text>
      </View>

      {/* Open Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() =>
          openMaterial(item.file_url || item.external_link)
        }
      >
        <Text style={styles.buttonText}>
          ↗  View / Open Material
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          backgroundColor="#0C2466"
          barStyle="light-content"
        />

        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading study materials...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#0C2466"
        barStyle="light-content"
      />

      {/* Page Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>
          Study Materials
        </Text>

        <Text style={styles.subtitle}>
          Notes, PDFs and learning resources
        </Text>

        <View style={styles.countContainer}>
          <Text style={styles.countNumber}>
            {materials.length}
          </Text>

          <Text style={styles.countLabel}>
            Available Study Materials
          </Text>
        </View>
      </View>

      {/* Materials List */}
      <FlatList
        data={materials}
        keyExtractor={(item, index) =>
          item.id || String(index)
        }
        renderItem={renderMaterial}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>

            <Text style={styles.emptyTitle}>
              No Materials Found
            </Text>

            <Text style={styles.emptyText}>
              Study materials will appear here when they are uploaded.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },

  // Header
  header: {
    backgroundColor: '#0C2466',
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
  },

  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 13,
    color: '#D6E0FF',
    marginTop: 6,
  },

  countContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  countNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  countLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 35,
    flexGrow: 1,
  },

  // Material Card
  card: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9EDF5',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  materialIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconText: {
    fontSize: 23,
  },

  materialInfo: {
    flex: 1,
    marginLeft: 12,
  },

  materialTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C2466',
  },

  subjectName: {
    fontSize: 12,
    color: '#7B8498',
    marginTop: 4,
  },

  numberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8EDFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  numberText: {
    color: '#0C2466',
    fontSize: 12,
    fontWeight: '800',
  },

  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 15,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1F7',
    marginVertical: 15,
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateLabel: {
    fontSize: 12,
    color: '#7B8498',
    fontWeight: '600',
  },

  dateValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },

  // Button
  button: {
    backgroundColor: '#0C2466',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0C2466',
  },

  emptyText: {
    fontSize: 13,
    color: '#7B8498',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
