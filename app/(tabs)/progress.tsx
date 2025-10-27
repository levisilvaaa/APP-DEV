import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Pressable } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { DrawerMenu } from '@/components/DrawerMenu';
import { Activity, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';

type DailyCheckin = {
  id: string;
  checkin_date: string;
  created_at: string;
};

type DayStatus = {
  day: number;
  date: Date;
  status: 'completed' | 'notCompleted' | 'future';
  capsules: number;
};

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function ProgressScreen() {
  const { user } = useAuth();
  const { theme, mode } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [monthStats, setMonthStats] = useState({
    completedDays: 0,
    totalDays: 0,
    totalCapsules: 0,
    dailyAverage: 0,
    consistency: 0,
    records: 0,
  });
  const [daysStatus, setDaysStatus] = useState<DayStatus[]>([]);

  useEffect(() => {
    loadMonthData();
  }, [user, selectedDate]);

  const loadMonthData = async () => {
    if (!user?.id) {
      setInitialLoading(false);
      return;
    }

    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('checkin_date', startDate)
        .lte('checkin_date', endDate)
        .order('checkin_date', { ascending: true });

      if (error) throw error;

      setCheckins(data || []);
      calculateMonthStats(data || [], firstDay, lastDay);
      generateDaysStatus(data || [], firstDay, lastDay);
    } catch (error) {
      console.error('Error loading month data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const calculateMonthStats = (checkinData: DailyCheckin[], firstDay: Date, lastDay: Date) => {
    const totalDays = lastDay.getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMonthDay = selectedDate.getMonth() === today.getMonth() &&
                           selectedDate.getFullYear() === today.getFullYear()
                           ? today.getDate()
                           : totalDays;

    const completedDays = checkinData.length;
    const totalCapsules = completedDays * 2;
    const dailyAverage = completedDays > 0 ? parseFloat((totalCapsules / completedDays).toFixed(1)) : 0;
    const consistency = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    setMonthStats({
      completedDays,
      totalDays,
      totalCapsules,
      dailyAverage,
      consistency,
      records: completedDays,
    });
  };

  const generateDaysStatus = (checkinData: DailyCheckin[], firstDay: Date, lastDay: Date) => {
    const totalDays = lastDay.getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkinDates = new Set(checkinData.map(c => c.checkin_date));

    console.log('Today:', today.toISOString().split('T')[0]);
    console.log('Checkin dates:', Array.from(checkinDates));

    const days: DayStatus[] = [];

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      currentDate.setHours(0, 0, 0, 0);

      const dateString = currentDate.toISOString().split('T')[0];
      const hasCheckin = checkinDates.has(dateString);

      let status: 'completed' | 'notCompleted' | 'future';

      if (currentDate.getTime() > today.getTime()) {
        status = 'future';
      } else if (hasCheckin) {
        status = 'completed';
      } else {
        status = 'notCompleted';
      }

      if (day === today.getDate() && selectedDate.getMonth() === today.getMonth()) {
        console.log(`Day ${day}: dateString=${dateString}, hasCheckin=${hasCheckin}, status=${status}`);
      }

      days.push({
        day,
        date: currentDate,
        status,
        capsules: hasCheckin ? 2 : 0,
      });
    }

    setDaysStatus(days);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    setSelectedDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
    setSelectedDate(newDate);
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return selectedDate.getMonth() === today.getMonth() &&
           selectedDate.getFullYear() === today.getFullYear();
  };

  const getMonthYearText = () => {
    return `${MONTHS_PT[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  const getDayStatusColor = (status: 'completed' | 'notCompleted' | 'future') => {
    if (status === 'completed') return '#10b981';
    if (status === 'notCompleted') return '#ef4444';
    return mode === 'dark' ? '#374151' : '#e5e7eb';
  };

  const getDayTextColor = (status: 'completed' | 'notCompleted' | 'future') => {
    if (status === 'completed') return '#fff';
    if (status === 'notCompleted') return '#fff';
    return mode === 'dark' ? '#9ca3af' : '#6b7280';
  };

  if (initialLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      <Header
        greeting="Progresso"
        subtitle="Acompanhe seu desenvolvimento"
        onMenuPress={() => setDrawerVisible(true)}
        icon={<Activity size={20} color="#fff" />}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
            <Calendar size={20} color="#e40f11" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Monthly Progress</Text>
          </View>

          <View style={styles.monthSelector}>
            <TouchableOpacity
              style={[styles.monthArrow, { backgroundColor: theme.card }]}
              onPress={goToPreviousMonth}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.monthDisplay}>
              <Text style={[styles.monthText, { color: theme.text }]}>{getMonthYearText()}</Text>
              {isCurrentMonth() && (
                <View style={styles.currentMonthBadge}>
                  <Text style={styles.currentMonthBadgeText}>Current</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.monthArrow, { backgroundColor: theme.card }]}
              onPress={goToNextMonth}
              activeOpacity={0.7}
            >
              <ChevronRight size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#10b981' }]}>{monthStats.completedDays}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>completed days</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#e40f11' }]}>{monthStats.totalDays}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Days</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#f59e0b' }]}>{monthStats.totalCapsules}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Capsules</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{monthStats.dailyAverage.toFixed(1)}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Daily Average</Text>
              </View>
            </View>

            <View style={styles.goalSection}>
              <Text style={[styles.goalLabel, { color: theme.textSecondary }]}>Monthly Goal: 80%</Text>
              <Text style={[styles.goalPercentage, { color: monthStats.consistency >= 80 ? '#10b981' : '#ef4444' }]}>
                {monthStats.consistency}%
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <Text style={[styles.progressBarLabel, { color: theme.textSecondary }]}>0%</Text>
              <View style={[styles.progressBarTrack, { backgroundColor: mode === 'dark' ? '#1f2937' : '#f3f4f6' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${monthStats.consistency}%`,
                      backgroundColor: monthStats.consistency >= 80 ? '#10b981' : '#ef4444'
                    }
                  ]}
                />
                <View style={[styles.goalMarker, { left: '80%' }]} />
              </View>
              <Text style={[styles.progressBarLabel, { color: theme.textSecondary }]}>100%</Text>
            </View>
          </View>

          <View style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
            <Calendar size={20} color="#e40f11" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Monthly Days Status</Text>
          </View>

          <View style={[styles.calendarCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.calendarMonth, { color: theme.text }]}>{getMonthYearText()}</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.calendarScroll}
              contentContainerStyle={styles.calendarContent}
            >
              {daysStatus.map((dayInfo) => (
                <View
                  key={dayInfo.day}
                  style={[
                    styles.dayBox,
                    {
                      backgroundColor: getDayStatusColor(dayInfo.status),
                      borderColor: mode === 'dark' ? '#374151' : '#e5e7eb'
                    }
                  ]}
                >
                  <Text style={[styles.dayNumber, { color: getDayTextColor(dayInfo.status) }]}>
                    {dayInfo.day}
                  </Text>
                  {dayInfo.status === 'completed' && (
                    <View style={styles.capsuleBadge}>
                      <Text style={styles.capsuleText}>💊</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>Completed</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>notCompleted</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: mode === 'dark' ? '#374151' : '#e5e7eb' }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>future</Text>
              </View>
            </View>

            <View style={styles.swipeIndicator}>
              <Text style={[styles.swipeText, { color: theme.textSecondary }]}>← →</Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  monthArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  currentMonthBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentMonthBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressCardHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  consistencyPercentage: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  focusTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  focusEmoji: {
    fontSize: 18,
  },
  focusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  completionText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  goalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarLabel: {
    fontSize: 11,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  goalMarker: {
    position: 'absolute',
    width: 2,
    height: 16,
    backgroundColor: '#64748b',
    top: -4,
  },
  calendarCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  calendarScroll: {
    marginBottom: 16,
  },
  calendarContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  dayBox: {
    width: 56,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  capsuleBadge: {
    marginTop: 2,
  },
  capsuleText: {
    fontSize: 18,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
  swipeIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
  swipeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
