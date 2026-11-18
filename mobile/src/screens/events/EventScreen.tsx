
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';

import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { EventApi } from '../../api/student.api';

interface CollegeEvent {
  id: string;
  title: string;
  description?: string;
  category: string;
  venue: string;
  start_time: string;
  end_time: string;
  banner_url?: string;
  organizer_name?: string;
  status: string;
}

export const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CollegeEvent | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const response: any = await EventApi.getEvents();

      console.log('EVENT API RESPONSE:', JSON.stringify(response, null, 2));

      const payload = response?.data ?? response;
      const eventData = Array.isArray(payload) ? payload : payload?.data;

      if (Array.isArray(eventData)) {
        setEvents(eventData);
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      console.log('Events API Error:', error?.response?.data || error);
      Alert.alert('Error', 'Unable to load events.');
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const renderEvent = ({ item }: { item: CollegeEvent }) => (
    <TouchableOpacity onPress={() => setSelectedEvent(item)}>
      <Card style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Badge label={item.status} />
        </View>

        <Text style={styles.category}>📌 {item.category}</Text>
        <Text style={styles.info}>📍 {item.venue}</Text>
        <Text style={styles.info}>📅 {formatDate(item.start_time)}</Text>
        <Text style={styles.info}>
          🕒 {formatTime(item.start_time)} - {formatTime(item.end_time)}
        </Text>

        <Text style={styles.viewDetails}>View Details →</Text>
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Header title="College Events" />

      {selectedEvent ? (
        <View style={styles.detailContainer}>
          <TouchableOpacity onPress={() => setSelectedEvent(null)}>
            <Text style={styles.backText}>← Back to Events</Text>
          </TouchableOpacity>

          <Card style={styles.eventCard}>
            <Text style={styles.detailTitle}>{selectedEvent.title}</Text>
            <Badge label={selectedEvent.status} />
            <Text style={styles.category}>{selectedEvent.category}</Text>

            <Text style={styles.info}>📍 {selectedEvent.venue}</Text>
            <Text style={styles.info}>
              📅 {formatDate(selectedEvent.start_time)}
            </Text>
            <Text style={styles.info}>
              🕒 {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
            </Text>

            <Text style={styles.description}>
              {selectedEvent.description || 'No description available.'}
            </Text>

            {selectedEvent.organizer_name ? (
              <Text style={styles.info}>
                Organizer: {selectedEvent.organizer_name}
              </Text>
            ) : null}
          </Card>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Events Available"
              message="There are no college events at the moment."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  eventCard: {
    marginBottom: 14,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  detailTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  category: {
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 10,
  },
  info: {
    color: Colors.text,
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
  },
  viewDetails: {
    color: Colors.primary,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
  },
  detailContainer: {
    padding: 16,
  },
  backText: {
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 16,
  },
});
