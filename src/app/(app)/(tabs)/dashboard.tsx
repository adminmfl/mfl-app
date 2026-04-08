import Feather from '@expo/vector-icons/Feather';
import { StatusBar } from 'expo-status-bar';
import { Surface } from 'heroui-native';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { withUniwind } from 'uniwind';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { useAppTheme } from '../../../contexts/app-theme-context';

const StyledFeather = withUniwind(Feather);

const MOCK_LEAGUE = {
  name: 'Cohort Fun League (CFL)',
  daysLeft: 267,
  teamName: 'Alpha',
  teamRank: 1,
  totalTeams: 3,
  playerPoints: 21,
  streak: 3,
};

const MOCK_TEAM = [
  { name: 'Alpha', points: 21, members: 2, rank: 1 },
  { name: 'Gamma', points: 17, members: 3, rank: 2 },
  { name: 'The Eagle Squad', points: 10, members: 3, rank: 3 },
];

const MOCK_RECENT = [
  { activity: 'Morning Yoga', date: 'Apr 7', points: 3, status: 'approved' },
  { activity: 'Team Standup', date: 'Apr 7', points: 2, status: 'approved' },
  { activity: 'Evening Walk', date: 'Apr 6', points: 2, status: 'approved' },
  { activity: 'Meditation', date: 'Apr 6', points: 1, status: 'pending' },
];

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <Surface className="flex-1 rounded-xl p-4 gap-2">
      <View className="h-8 w-8 rounded-full items-center justify-center" style={{ backgroundColor: color + '20' }}>
        <StyledFeather name={icon as any} size={16} style={{ color }} />
      </View>
      <AppText className="text-2xl font-bold text-foreground">{value}</AppText>
      <AppText className="text-xs text-muted">{label}</AppText>
    </Surface>
  );
}

export default function DashboardScreen() {
  const { isDark } = useAppTheme();

  return (
    <ScreenScrollView>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="gap-5">
        {/* Welcome */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <Surface className="rounded-2xl p-5 gap-1">
            <AppText className="text-sm text-muted">Welcome back</AppText>
            <AppText className="text-xl font-bold text-foreground">{MOCK_LEAGUE.name}</AppText>
            <AppText className="text-sm text-accent font-medium mt-1">
              {MOCK_LEAGUE.daysLeft} days remaining
            </AppText>
          </Surface>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <View className="flex-row gap-3">
            <StatCard icon="zap" label="Team Points" value={String(MOCK_LEAGUE.playerPoints)} color="#2E7D32" />
            <StatCard icon="trending-up" label="Day Streak" value={String(MOCK_LEAGUE.streak)} color="#F57C00" />
            <StatCard icon="award" label="Team Rank" value={`#${MOCK_LEAGUE.teamRank}`} color="#1565C0" />
          </View>
        </Animated.View>

        {/* Leaderboard Preview */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <Surface className="rounded-2xl p-5 gap-4">
            <View className="flex-row items-center justify-between">
              <AppText className="text-base font-semibold text-foreground">League Standings</AppText>
              <AppText className="text-xs text-accent">View All</AppText>
            </View>
            {MOCK_TEAM.map((team) => (
              <View key={team.name} className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 rounded-full bg-accent/10 items-center justify-center">
                    <AppText className="text-sm font-bold text-accent">#{team.rank}</AppText>
                  </View>
                  <View>
                    <AppText className="text-sm font-medium text-foreground">{team.name}</AppText>
                    <AppText className="text-xs text-muted">{team.members} members</AppText>
                  </View>
                </View>
                <AppText className="text-base font-bold text-foreground">{team.points}</AppText>
              </View>
            ))}
          </Surface>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.duration(300).delay(300)}>
          <Surface className="rounded-2xl p-5 gap-4">
            <AppText className="text-base font-semibold text-foreground">Recent Activity</AppText>
            {MOCK_RECENT.map((item, i) => (
              <View key={i} className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-3">
                  <View className={`h-2 w-2 rounded-full ${item.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <View>
                    <AppText className="text-sm text-foreground">{item.activity}</AppText>
                    <AppText className="text-xs text-muted">{item.date}</AppText>
                  </View>
                </View>
                <AppText className="text-sm font-semibold text-accent">+{item.points}</AppText>
              </View>
            ))}
          </Surface>
        </Animated.View>
      </View>
    </ScreenScrollView>
  );
}
