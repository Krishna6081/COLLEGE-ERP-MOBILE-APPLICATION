import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalendarDays, CalendarRange, Clock, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PageContent } from '../../components/PageContent';
import { Colors } from '../../constants/colors';
import { webInteractive } from '../../constants/theme';
import { ErpApi } from '../../api/erp.api';
import { useAuthStore } from '../../store/useAuthStore';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EVENT_TYPE_META: Record<string, { color: string; badge: 'danger' | 'warning' | 'success' | 'info' | 'primary' | 'neutral'; label: string }> = {
  EXAM:     { color: '#EF4444', badge: 'danger',  label: 'Exam' },
  DEADLINE: { color: '#F59E0B', badge: 'warning', label: 'Deadline' },
  HOLIDAY:  { color: '#10B981', badge: 'success', label: 'Holiday' },
  ACADEMIC: { color: '#2563EB', badge: 'info',    label: 'Academic' },
  EVENT:    { color: '#8B5CF6', badge: 'primary', label: 'Event' },
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const toDateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const parseDateKey = (value?: string) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

const dayNameFromDate = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return DAYS[(dt.getDay() + 6) % 7];
};

const currentDay = () => {
  const day = new Date().getDay();
  return DAYS[(day + 6) % 7];
};

const formatTime = (value?: string) => {
  if (!value) return '';
  const [hourText, minuteText] = String(value).slice(0, 5).split(':');
  const hour = Number(hourText);
  if (!Number.isFinite(hour) || !minuteText) return String(value);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minuteText} ${suffix}`;
};

const formatDisplayDate = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y}`;
};

const formatEventRange = (startStr?: string, endStr?: string, isAllDay?: number | boolean) => {
  const startKey = parseDateKey(startStr);
  const endKey = parseDateKey(endStr);
  if (!startKey) return '';
  if (startKey === endKey || !endKey) {
    if (isAllDay) return `${formatDisplayDate(startKey)} · All Day`;
    const st = startStr && startStr.length >= 16 ? formatTime(startStr.slice(11, 16)) : '';
    const et = endStr && endStr.length >= 16 ? formatTime(endStr.slice(11, 16)) : '';
    return st && et ? `${formatDisplayDate(startKey)} · ${st} - ${et}` : formatDisplayDate(startKey);
  }
  return `${formatDisplayDate(startKey)} – ${formatDisplayDate(endKey)}`;
};

interface TimetableScreenProps {
  route?: { params?: { initialTab?: 'timetable' | 'calendar' } };
}

export const TimetableScreen: React.FC<TimetableScreenProps> = ({ route }) => {
  const user = useAuthStore((s) => s.user);
  const isParent = user?.user_type === 'PARENT';
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const todayDayName = useMemo(() => currentDay(), []);

  const [activeTab, setActiveTab] = useState<'timetable' | 'calendar'>(
    route?.params?.initialTab === 'calendar' ? 'calendar' : 'timetable',
  );
  const [selectedDay, setSelectedDay] = useState(todayDayName);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  const loadAll = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [ttRes, calRes] = await Promise.all([
        ErpApi.getTimetable(),
        ErpApi.getCalendarEvents().catch(() => ({ data: [] })),
      ]);
      const ttRows = (ttRes as any)?.data ?? ttRes;
      const calRows = (calRes as any)?.data ?? calRes;
      setSchedule(Array.isArray(ttRows) ? ttRows : []);
      setCalendarEvents(Array.isArray(calRows) ? calRows : []);
      setError('');
    } catch (requestError: any) {
      setError(requestError?.message || 'Could not load the timetable. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const countsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of schedule) {
      map[item.day_of_week] = (map[item.day_of_week] || 0) + 1;
    }
    return map;
  }, [schedule]);

  const daySchedule = useMemo(
    () => schedule.filter((item) => item.day_of_week === selectedDay),
    [schedule, selectedDay],
  );

  // Calendar helpers
  const eventsForDate = useCallback(
    (dateKey: string) =>
      calendarEvents.filter((ev) => {
        const s = parseDateKey(ev.start_date);
        const e = parseDateKey(ev.end_date) || s;
        return s <= dateKey && dateKey <= e;
      }),
    [calendarEvents],
  );

  const monthCalendarCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ key: string; day: number | null; dateKey: string | null }> = [];

    for (let i = 0; i < startWeekday; i++) {
      cells.push({ key: `blank-start-${i}`, day: null, dateKey: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(d)}`;
      cells.push({ key: dateKey, day: d, dateKey });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ key: `blank-end-${cells.length}`, day: null, dateKey: null });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const monthEvents = useMemo(() => {
    const monthStart = `${viewYear}-${pad2(viewMonth + 1)}-01`;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const monthEnd = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(daysInMonth)}`;
    return calendarEvents.filter((ev) => {
      const s = parseDateKey(ev.start_date);
      const e = parseDateKey(ev.end_date) || s;
      return s <= monthEnd && e >= monthStart;
    });
  }, [calendarEvents, viewYear, viewMonth]);

  const selectedDateEvents = useMemo(
    () => eventsForDate(selectedDateKey),
    [eventsForDate, selectedDateKey],
  );

  const isSelectedDateHoliday = useMemo(
    () => selectedDateEvents.some((ev) => ev.event_type === 'HOLIDAY'),
    [selectedDateEvents],
  );

  const selectedDateDayName = useMemo(
    () => dayNameFromDate(selectedDateKey),
    [selectedDateKey],
  );

  const selectedDateClasses = useMemo(
    () => (isSelectedDateHoliday ? [] : schedule.filter((item) => item.day_of_week === selectedDateDayName)),
    [schedule, selectedDateDayName, isSelectedDateHoliday],
  );

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDateKey(todayKey);
  };

  if (loading && schedule.length === 0 && calendarEvents.length === 0) {
    return <LoadingSpinner message="Loading timetable & calendar..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Timetable & Calendar"
        subtitle={isParent ? "Ward's Weekly Classes & Academic Schedule" : 'Weekly Classes & Academic Calendar'}
        onRightPress={() => loadAll(true)}
        rightIconLabel="Refresh"
      />

      {/* Primary Mode Tabs */}
      <View style={styles.modeTabWrap}>
        <PageContent style={styles.modeTabRow}>
          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'timetable' && styles.modeTabActive, webInteractive]}
            onPress={() => setActiveTab('timetable')}
          >
            <CalendarDays size={16} color={activeTab === 'timetable' ? Colors.primary : Colors.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.modeTabText, activeTab === 'timetable' && styles.modeTabTextActive]}>
              Weekly Timetable
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'calendar' && styles.modeTabActive, webInteractive]}
            onPress={() => setActiveTab('calendar')}
          >
            <CalendarRange size={16} color={activeTab === 'calendar' ? Colors.primary : Colors.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.modeTabText, activeTab === 'calendar' && styles.modeTabTextActive]}>
              Academic Calendar
            </Text>
          </TouchableOpacity>
        </PageContent>
      </View>

      {activeTab === 'timetable' ? (
        <PageContent style={{ flex: 1 }}>
          {/* Compact Day Selector Bar */}
          <View style={styles.dayRow}>
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = todayDayName === day;
              const count = countsByDay[day] || 0;
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayTab,
                    isSelected && styles.activeDayTab,
                    !isSelected && isToday && styles.todayDayTab,
                    webInteractive,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.activeDayText]}>{day.slice(0, 3)}</Text>
                  <Text style={[styles.dayCount, isSelected && styles.activeDayCount]}>
                    {count > 0 ? `${count}` : '–'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} colors={[Colors.primary]} />}
          >
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => loadAll()}>
                  <Text style={styles.retryText}>Try again</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.summaryBar}>
              <Text style={styles.summaryTitle}>
                {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}
                {selectedDay === todayDayName ? ' (Today)' : ''}
              </Text>
              <Badge label={`${daySchedule.length} ${daySchedule.length === 1 ? 'class' : 'classes'}`} type="primary" />
            </View>

            {!error && !loading && daySchedule.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No classes scheduled</Text>
                <Text style={styles.emptyText}>There are no timetable entries for {selectedDay.toLowerCase()}.</Text>
              </View>
            )}

            {daySchedule.map((lecture) => {
              const isLab = lecture.subject_type === 'PRACTICAL';
              return (
                <Card key={lecture.id} style={isLab ? { ...styles.card, ...styles.labCard } : styles.card}>
                  <View style={styles.lectureHeading}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color={isLab ? Colors.warning : Colors.primary} strokeWidth={2.2} />
                      <Text style={[styles.time, isLab && styles.labTime]}>
                        {formatTime(lecture.start_time)} – {formatTime(lecture.end_time)}
                      </Text>
                    </View>
                    <View style={styles.badgeGroup}>
                      {lecture.subject_type ? (
                        <Badge
                          label={isLab ? 'LAB' : 'LECTURE'}
                          type={isLab ? 'warning' : 'neutral'}
                        />
                      ) : null}
                      {lecture.room_number ? (
                        <Badge
                          label={`${lecture.building_name ? `${lecture.building_name} · ` : ''}${lecture.room_number}`}
                          type="info"
                        />
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.subject}>
                    {lecture.subject_name || 'Subject'}{lecture.subject_code ? ` (${lecture.subject_code})` : ''}
                  </Text>
                  <Text style={styles.detail}>
                    {lecture.faculty_first_name
                      ? `${lecture.faculty_first_name} ${lecture.faculty_last_name || ''}`.trim()
                      : 'Faculty not assigned'}
                    {lecture.division_name ? `  •  ${lecture.division_name}` : ''}
                  </Text>
                </Card>
              );
            })}
          </ScrollView>
        </PageContent>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} colors={[Colors.primary]} />}
        >
          <PageContent>
          {/* Month Calendar Card */}
          <Card style={styles.calendarCard}>
            <View style={styles.monthHeader}>
              <TouchableOpacity style={[styles.monthNavBtn, webInteractive]} onPress={goPrevMonth}>
                <ChevronLeft size={18} color={Colors.primary} strokeWidth={2.4} />
              </TouchableOpacity>
              <View style={styles.monthTitleWrap}>
                <Text style={styles.monthTitle}>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity onPress={goToday}>
                  <Text style={styles.todayBtnText}>Jump to Today</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.monthNavBtn, webInteractive]} onPress={goNextMonth}>
                <ChevronRight size={18} color={Colors.primary} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Weekday headers */}
            <View style={styles.weekHeaderRow}>
              {WEEKDAY_LABELS.map((lbl) => (
                <Text key={lbl} style={styles.weekHeaderCell}>{lbl}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {monthCalendarCells.map((cell) => {
                if (!cell.day || !cell.dateKey) {
                  return <View key={cell.key} style={styles.dayCell} />;
                }
                const cellEvents = eventsForDate(cell.dateKey);
                const isSelected = cell.dateKey === selectedDateKey;
                const isTodayCell = cell.dateKey === todayKey;
                const uniqueTypes = Array.from(new Set(cellEvents.map((e) => e.event_type))).slice(0, 3);

                return (
                  <TouchableOpacity
                    key={cell.key}
                    style={[
                      styles.dayCell,
                      isTodayCell && !isSelected && styles.todayCell,
                      isSelected && styles.selectedCell,
                    ]}
                    onPress={() => setSelectedDateKey(cell.dateKey!)}
                  >
                    <Text
                      style={[
                        styles.cellDayNum,
                        isTodayCell && !isSelected && styles.todayCellText,
                        isSelected && styles.selectedCellText,
                      ]}
                    >
                      {cell.day}
                    </Text>
                    <View style={styles.dotRow}>
                      {uniqueTypes.map((t) => (
                        <View
                          key={t}
                          style={[
                            styles.eventDot,
                            { backgroundColor: isSelected ? '#FFFFFF' : (EVENT_TYPE_META[t]?.color || Colors.primary) },
                          ]}
                        />
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.legendRow}>
              {Object.entries(EVENT_TYPE_META).map(([key, meta]) => (
                <View key={key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: meta.color }]} />
                  <Text style={styles.legendText}>{meta.label}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Selected Date Breakdown */}
          <Text style={styles.sectionTitle}>
            SCHEDULE FOR {formatDisplayDate(selectedDateKey).toUpperCase()} ({selectedDateDayName})
          </Text>

          {/* Events on selected date */}
          {selectedDateEvents.map((ev) => {
            const meta = EVENT_TYPE_META[ev.event_type] || EVENT_TYPE_META.EVENT;
            return (
              <Card key={`sel-${ev.id}`} style={{ ...styles.eventCard, borderLeftColor: meta.color }}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Badge label={meta.label} type={meta.badge} />
                </View>
                <Text style={styles.eventDateText}>
                  🗓️ {formatEventRange(ev.start_date, ev.end_date, ev.is_all_day)}
                </Text>
                {ev.description ? <Text style={styles.detail}>{ev.description}</Text> : null}
              </Card>
            );
          })}

          {/* Classes on selected date */}
          {isSelectedDateHoliday ? (
            <Card style={styles.holidayNoticeCard}>
              <Text style={styles.holidayNoticeText}>🎉 Holiday — No regular classes scheduled on this day.</Text>
            </Card>
          ) : selectedDateClasses.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No regular classes scheduled on {selectedDateDayName.toLowerCase()}.</Text>
            </Card>
          ) : (
            selectedDateClasses.map((lecture) => (
              <Card key={`cal-tt-${lecture.id}`} style={styles.compactClassCard}>
                <View style={styles.lectureHeading}>
                  <Text style={styles.time}>
                    🕐 {formatTime(lecture.start_time)} – {formatTime(lecture.end_time)}
                  </Text>
                  {lecture.room_number ? <Badge label={lecture.room_number} type="info" /> : null}
                </View>
                <Text style={styles.compactSubject}>
                  {lecture.subject_name}{lecture.subject_code ? ` (${lecture.subject_code})` : ''}
                </Text>
                <Text style={styles.detail}>
                  👨‍🏫 {lecture.faculty_first_name} {lecture.faculty_last_name || ''}
                </Text>
              </Card>
            ))
          )}

          {/* All Events in Viewed Month */}
          <Text style={styles.sectionTitle}>
            ALL EVENTS IN {MONTH_NAMES[viewMonth].toUpperCase()} {viewYear} ({monthEvents.length})
          </Text>

          {monthEvents.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No academic calendar events scheduled for {MONTH_NAMES[viewMonth]} {viewYear}.</Text>
            </Card>
          ) : (
            monthEvents.map((ev) => {
              const meta = EVENT_TYPE_META[ev.event_type] || EVENT_TYPE_META.EVENT;
              return (
                <Card key={`m-${ev.id}`} style={{ ...styles.eventCard, borderLeftColor: meta.color }}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    <Badge label={meta.label} type={meta.badge} />
                  </View>
                  <Text style={styles.eventDateText}>
                    🗓️ {formatEventRange(ev.start_date, ev.end_date, ev.is_all_day)}
                  </Text>
                  {ev.description ? <Text style={styles.detail}>{ev.description}</Text> : null}
                </Card>
              );
            })
          )}
          </PageContent>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1 },
  modeTabWrap: {
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modeTabRow: {
    flexDirection: 'row',
  },
  modeTab: { flex: 1, flexDirection: 'row', gap: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  modeTabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  modeTabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  modeTabTextActive: { color: Colors.primary, fontWeight: '700' },

  dayRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayTab: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.background,
  },
  todayDayTab: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  activeDayTab: { backgroundColor: Colors.primary },
  dayText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  activeDayText: { color: '#FFFFFF' },
  dayCount: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 },
  activeDayCount: { color: 'rgba(255,255,255,0.85)' },

  content: { flexGrow: 1, padding: 12, paddingBottom: 28 },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  summaryCount: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  card: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  labCard: { borderLeftColor: Colors.warning },
  lectureHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 },
  badgeGroup: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  time: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  labTime: { color: Colors.warning },
  subject: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  compactSubject: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  detail: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  calendarCard: { marginBottom: 8 },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  monthTitleWrap: { alignItems: 'center' },
  monthTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  todayBtnText: { fontSize: 11, fontWeight: '600', color: Colors.primary, marginTop: 2 },

  weekHeaderRow: { flexDirection: 'row', marginBottom: 6 },
  weekHeaderCell: {
    width: '14.285%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.285%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  todayCell: { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  selectedCell: { backgroundColor: Colors.primary },
  cellDayNum: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  todayCellText: { color: Colors.primary, fontWeight: '800' },
  selectedCellText: { color: '#FFFFFF', fontWeight: '800' },
  dotRow: { flexDirection: 'row', gap: 3, marginTop: 3, height: 6 },
  eventDot: { width: 5, height: 5, borderRadius: 3 },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginHorizontal: 6,
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  eventCard: { borderLeftWidth: 4 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  eventTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  eventDateText: { fontSize: 12, fontWeight: '600', color: Colors.primary, marginTop: 4 },
  compactClassCard: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  holidayNoticeCard: { backgroundColor: '#ECFDF5', borderLeftWidth: 4, borderLeftColor: '#10B981' },
  holidayNoticeText: { fontSize: 13, fontWeight: '600', color: '#065F46' },

  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, textAlign: 'center', color: Colors.textSecondary, marginTop: 6 },
  errorBox: { padding: 16, borderRadius: 10, backgroundColor: '#FEE2E2', marginBottom: 12 },
  errorText: { color: '#991B1B', fontSize: 14 },
  retryText: { color: Colors.primaryDark, fontWeight: '700', marginTop: 10 },
});
