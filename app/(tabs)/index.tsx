import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { DrawerMenu } from '@/components/DrawerMenu';
import { StatCard } from '@/components/StatCard';
import { CheckCircle, TrendingUp, Calendar, Zap, Target, Award, Flame, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import { getLocalDateString, getStartOfMonth, getEndOfMonth, getDaysInMonth, getCurrentDayOfMonth, getTimeUntilMidnight } from '@/utils/timezone';

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme, mode } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [checkedToday, setCheckedToday] = useState(false);
  const [checkinTime, setCheckinTime] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Usuário');
  const [monthlyStats, setMonthlyStats] = useState({
    completed: 0,
    pending: 0,
    remaining: 0,
    consistencyPercentage: 0,
    goalPercentage: 80,
  });
  const [checkinStats, setCheckinStats] = useState({
    totalDays: 0,
    currentStreak: 0,
    dailyAverage: 0,
    consistency: 0,
  });

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const checkMidnightReset = () => {
      const timeUntilMidnight = getTimeUntilMidnight();

      const timer = setTimeout(() => {
        setCheckedToday(false);
        loadData();
        checkMidnightReset();
      }, timeUntilMidnight);

      return () => clearTimeout(timer);
    };

    const cleanup = checkMidnightReset();
    return cleanup;
  }, []);

  const loadData = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      } else if (profile?.full_name) {
        const firstName = profile.full_name.split(' ')[0];
        setUserName(firstName);
      }

      const today = getLocalDateString();

      const { data: todayCheckin, error: checkinError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('checkin_date', today)
        .maybeSingle();

      if (checkinError) {
        console.error('Error loading today checkin:', checkinError);
      }

      setCheckedToday(!!todayCheckin);
      if (todayCheckin?.checkin_time) {
        const time = new Date(todayCheckin.checkin_time);
        setCheckinTime(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      } else {
        setCheckinTime(null);
      }

      const startOfMonth = getStartOfMonth();
      const endOfMonth = getEndOfMonth();
      const totalDaysInMonth = getDaysInMonth();
      const currentDay = getCurrentDayOfMonth();

      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];

      const { data: monthCheckins, error: monthError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('checkin_date', startDateStr)
        .lte('checkin_date', endDateStr);

      if (monthError) {
        console.error('Error loading month checkins:', monthError);
      }

      const completed = monthCheckins?.length || 0;
      const daysPassed = currentDay;
      const pending = Math.max(0, daysPassed - completed);
      const remaining = totalDaysInMonth - currentDay;
      const consistencyPercentage = totalDaysInMonth > 0
        ? Math.round((completed / totalDaysInMonth) * 100)
        : 0;

      setMonthlyStats({
        completed,
        pending,
        remaining,
        consistencyPercentage,
        goalPercentage: 80,
      });

      await calculateCheckinStats(user.id);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakBadgeCount = () => {
    return monthlyStats.completed;
  };

  const calculateCheckinStats = async (userId: string) => {
    try {
      const { data: allCheckIns, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false });

      if (error) {
        console.error('Error loading all check-ins:', error);
        return;
      }

      if (!allCheckIns || allCheckIns.length === 0) {
        setCheckinStats({ totalDays: 0, currentStreak: 0, dailyAverage: 0, consistency: 0 });
        return;
      }

      const totalDays = allCheckIns.length;

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < allCheckIns.length; i++) {
        const checkinDate = new Date(allCheckIns[i].checkin_date);
        checkinDate.setHours(0, 0, 0, 0);
        const expectedDate = new Date(today.getTime() - currentStreak * 24 * 60 * 60 * 1000);

        if (checkinDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const checkInsLast30Days = allCheckIns.filter(
        checkin => new Date(checkin.checkin_date) >= thirtyDaysAgo
      ).length;
      const consistency = Math.round((checkInsLast30Days / 30) * 100);

      const oldestCheckin = new Date(allCheckIns[allCheckIns.length - 1].checkin_date);
      const daysSinceStart = Math.max(
        1,
        Math.ceil((now.getTime() - oldestCheckin.getTime()) / (24 * 60 * 60 * 1000))
      );
      const dailyAverage = parseFloat((totalDays / daysSinceStart).toFixed(1));

      setCheckinStats({
        totalDays,
        currentStreak,
        dailyAverage,
        consistency,
      });
    } catch (error) {
      console.error('Error calculating checkin stats:', error);
    }
  };

  const handleDailyCheckIn = async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    if (checkedToday) {
      console.log('Already checked in today');
      return;
    }

    try {
      const today = getLocalDateString();

      const { error } = await supabase.from('daily_checkins').insert({
        user_id: user.id,
        checkin_date: today,
      });

      if (error) {
        if (error.code === '23505') {
          console.log('Check-in already exists for today');
          setCheckedToday(true);
        } else {
          throw error;
        }
        return;
      }

      setCheckedToday(true);
      const now = new Date();
      setCheckinTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      await loadData();
    } catch (error: any) {
      console.error('Error checking in:', error);
    }
  };

  if (loading) {
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
        greeting={`Hello, ${userName}!`}
        subtitle="How is your progress today?"
        onMenuPress={() => setDrawerVisible(true)}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.checkInCard} elevation="medium">
          <View style={styles.checkInHeader}>
            <View style={styles.checkInTitleRow}>
              <Calendar size={20} color="#e40f11" />
              <Text style={[styles.checkInTitle, { color: theme.text }]}>Daily Check-in</Text>
            </View>
            <View style={styles.streakBadge}>
              <Zap size={14} color="#fff" />
              <Text style={styles.streakBadgeText}>{getStreakBadgeCount()}</Text>
            </View>
          </View>

          {checkedToday ? (
            <View style={[
              styles.completedCheckInBox,
              {
                backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4',
                borderColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#10b981',
              },
            ]}>
              <View style={styles.completedCheckInCircle}>
                <CheckCircle size={24} color="#10b981" strokeWidth={2} />
              </View>
              <View style={styles.completedCheckInContent}>
                <View style={styles.completedCheckInHeader}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text style={styles.completedCheckInTitle}>Completed today!</Text>
                  <CheckCircle size={16} color="#10b981" />
                </View>
                <Text style={styles.completedCheckInSubtitle}>
                  2 capsules at {checkinTime || '00:00'}
                </Text>
              </View>
            </View>
          ) : (
            <Pressable
              style={[
                styles.checkInButton,
                {
                  backgroundColor: mode === 'dark' ? 'rgba(228, 15, 17, 0.15)' : '#fef3f2',
                  borderColor: mode === 'dark' ? 'rgba(228, 15, 17, 0.3)' : '#fee2e2',
                },
              ]}
              onPress={handleDailyCheckIn}
            >
              <View style={[
                styles.checkInCircle,
                { borderColor: mode === 'dark' ? '#4b5563' : '#e5e7eb' }
              ]}>
                <View style={styles.checkInCircleEmpty} />
              </View>
              <View style={styles.checkInContent}>
                <View style={styles.checkInTextRow}>
                  <Target size={16} color="#e40f11" />
                  <Text style={styles.checkInButtonTitle}>
                    Mark as completed
                  </Text>
                </View>
                <Text style={[styles.checkInButtonSubtitle, { color: theme.textSecondary }]}>
                  Tap to register your daily use
                </Text>
              </View>
            </Pressable>
          )}
        </Card>

        <Card style={styles.progressCard} elevation="medium">
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <Calendar size={20} color="#e40f11" />
              <Text style={[styles.progressTitle, { color: theme.text }]}>Monthly Progress</Text>
            </View>
            <View style={[styles.progressBadge, { backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2' }]}>
              <Text style={[styles.progressBadgeText, { color: '#ef4444' }]}>{monthlyStats.consistencyPercentage}%</Text>
            </View>
          </View>

          <View style={styles.simpleProgressContainer}>
            <Text style={[styles.simplePercentage, { color: mode === 'dark' ? theme.text : '#1f2937' }]}>
              {monthlyStats.consistencyPercentage}%
            </Text>

            <View style={styles.focusRow}>
              <Text style={styles.focusEmoji}>💪</Text>
              <Text style={[styles.focusText, { color: theme.textSecondary }]}>
                Focus on consistency!
              </Text>
            </View>

            <Text style={[styles.completedDaysSimple, { color: theme.textSecondary }]}>
              {monthlyStats.completed} of {getDaysInMonth()} completed days
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconCircle, { backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5' }]}>
                <Target size={20} color="#10b981" />
              </View>
              <Text style={[styles.statNumber, { color: '#10b981' }]}>{monthlyStats.completed}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconCircle, { backgroundColor: mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7' }]}>
                <TrendingUp size={20} color="#f59e0b" />
              </View>
              <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{monthlyStats.pending}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconCircle, { backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2' }]}>
                <Award size={20} color="#ef4444" />
              </View>
              <Text style={[styles.statNumber, { color: '#ef4444' }]}>{monthlyStats.remaining}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Remaining</Text>
            </View>
          </View>

          <View style={styles.goalContainer}>
            <Text style={[styles.goalText, { color: mode === 'dark' ? theme.textSecondary : '#6b7280' }]}>
              Consistency Goal: {monthlyStats.goalPercentage}%
            </Text>
            <Text style={[styles.goalPercentage, { color: '#ef4444' }]}>
              {monthlyStats.consistencyPercentage}%
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <Text style={[styles.progressBarLabel, { color: theme.textSecondary }]}>0%</Text>
            <View style={[styles.progressBarTrack, { backgroundColor: mode === 'dark' ? '#1f2937' : '#fee2e2' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${monthlyStats.consistencyPercentage}%`,
                    backgroundColor: '#ef4444',
                  }
                ]}
              />
              <View style={[styles.progressBarGoal, { left: `${monthlyStats.goalPercentage}%` }]} />
            </View>
            <Text style={[styles.progressBarLabel, { color: theme.textSecondary }]}>100%</Text>
          </View>
          <Text style={[styles.progressBarGoalLabel, { color: theme.textSecondary }]}>Goal: {monthlyStats.goalPercentage}%</Text>
        </Card>

        <View style={styles.checkInStatsSection}>
          <View style={styles.checkInStatsHeader}>
            <TrendingUp size={20} color="#10b981" />
            <Text style={[styles.checkInStatsTitle, { color: theme.text }]}>Check-in Statistics</Text>
          </View>

          <StatCard
            icon={<Target size={24} color="#10b981" />}
            value={checkinStats.totalDays}
            label="Total Days"
            sublabel="completed days"
            borderColor="#10b981"
            iconBackgroundColor="#d1fae5"
          />

          <StatCard
            icon={<Flame size={24} color="#f97316" />}
            value={checkinStats.currentStreak}
            label="Current Streak"
            sublabel="consecutive days"
            borderColor="#f97316"
            iconBackgroundColor="#fed7aa"
          />

          <StatCard
            icon={<TrendingUp size={24} color="#8b5cf6" />}
            value={checkinStats.dailyAverage}
            label="Daily Average"
            sublabel="per day"
            borderColor="#8b5cf6"
            iconBackgroundColor="#e9d5ff"
          />

          <StatCard
            icon={<Clock size={24} color="#ef4444" />}
            value={`${checkinStats.consistency}%`}
            label="Consistency"
            sublabel="last 30 days"
            borderColor="#ef4444"
            iconBackgroundColor="#fecaca"
          />
        </View>

        <Card style={styles.dosageCard} elevation="medium">
          <View style={styles.dosageHeader}>
            <Text style={styles.dosageIcon}>💊</Text>
            <Text style={[styles.dosageTitle, { color: theme.text }]}>Daily Recommended Dosage</Text>
          </View>

          <Text style={[styles.dosageDescription, { color: theme.textSecondary }]}>
            To get the best results with MaxTesterin, it is essential to maintain the dosage of
          </Text>

          <View style={styles.dosageTips}>
            <View style={styles.dosageTipRow}>
              <View style={styles.dosageBullet} />
              <Text style={[styles.dosageTipText, { color: theme.textSecondary }]}>Always take at the same time</Text>
            </View>
            <View style={styles.dosageTipRow}>
              <View style={styles.dosageBullet} />
              <Text style={[styles.dosageTipText, { color: theme.textSecondary }]}>Preferably in the morning</Text>
            </View>
            <View style={styles.dosageTipRow}>
              <View style={styles.dosageBullet} />
              <Text style={[styles.dosageTipText, { color: theme.textSecondary }]}>Maintain daily regularity</Text>
            </View>
          </View>

          <View style={styles.dosageBadgeContainer}>
            <LinearGradient
              colors={['#e40f11', '#b91c1c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dosageBadge}
            >
              <Text style={styles.dosageBadgeText}>2 capsules/day</Text>
            </LinearGradient>
          </View>
        </Card>

        <Card style={styles.aboutCard} elevation="medium">
          <View style={styles.aboutHeader}>
            <Text style={styles.aboutIcon}>🚀</Text>
            <Text style={[styles.aboutTitle, { color: theme.text }]}>About MaxTestorin</Text>
          </View>

          <Text style={[styles.aboutDescription, { color: theme.textSecondary }]}>
            MaxTestorin is a nutraceutical supplement in drops developed to support male well-being. Each drop contains natural ingredients carefully selected for maximum efficacy.
          </Text>
        </Card>

        <View style={styles.bottomPadding} />
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
    padding: 16,
  },
  checkInCard: {
    marginBottom: 16,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkInTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  streakBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  checkInCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkInCircleEmpty: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  completedCheckInBox: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completedCheckInCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  completedCheckInContent: {
    flex: 1,
  },
  completedCheckInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  completedCheckInTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10b981',
  },
  completedCheckInSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
  },
  checkInContent: {
    flex: 1,
  },
  checkInTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  checkInButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e40f11',
  },
  checkInButtonSubtitle: {
    fontSize: 12,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  simpleProgressContainer: {
    alignItems: 'center',
    marginVertical: 20,
    gap: 8,
  },
  simplePercentage: {
    fontSize: 64,
    fontWeight: '700',
    marginBottom: 8,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  focusEmoji: {
    fontSize: 16,
  },
  focusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  completedDaysSimple: {
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
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
    marginBottom: 4,
  },
  progressBarLabel: {
    fontSize: 11,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  progressBarGoal: {
    position: 'absolute',
    width: 2,
    height: 16,
    backgroundColor: '#64748b',
    top: -4,
  },
  progressBarGoalLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomPadding: {
    height: 20,
  },
  checkInStatsSection: {
    marginBottom: 16,
  },
  checkInStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkInStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dosageCard: {
    marginBottom: 16,
  },
  dosageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dosageIcon: {
    fontSize: 20,
  },
  dosageTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dosageDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  dosageTips: {
    gap: 10,
    marginBottom: 20,
  },
  dosageTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dosageBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e40f11',
  },
  dosageTipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  dosageBadgeContainer: {
    alignItems: 'center',
  },
  dosageBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#e40f11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dosageBadgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  aboutCard: {
    marginBottom: 16,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aboutIcon: {
    fontSize: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboutDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
});
