import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ThemeSelectorBar } from '../../components/theme-selector';
import { useAuth } from '../../contexts/AuthContext';

const MOCK_STATS = {
  league: 'Legends Fitness League',
  team: 'Alpha',
  role: 'Captain',
  joinedDate: 'Mar 15, 2026',
  streak: 12,
  totalPoints: 184,
  activitiesLogged: 38,
  rank: 3,
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="bg-card rounded-xl p-4 flex-1 min-w-[45%]">
      <AppText className="text-2xl font-bold text-foreground">{value}</AppText>
      <AppText className="text-xs text-muted mt-1">{label}</AppText>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3.5 bg-card rounded-xl"
    >
      <Feather name={icon} size={20} color={danger ? '#ef4444' : '#888'} />
      <AppText
        className={`text-sm font-medium flex-1 ${danger ? 'text-danger' : 'text-foreground'}`}
      >
        {label}
      </AppText>
      <Feather name="chevron-right" size={18} color="#888" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;

  return (
    <ScreenScrollView>
      <View className="px-5 py-6 gap-6">
        {/* Avatar + Name */}
        <View className="items-center gap-3">
          <View className="h-24 w-24 rounded-full bg-accent items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 96, height: 96 }}
                contentFit="cover"
              />
            ) : (
              <AppText className="text-3xl font-bold text-white">{initials}</AppText>
            )}
          </View>
          <View className="items-center">
            <AppText className="text-xl font-bold text-foreground">
              {user?.firstName} {user?.lastName}
            </AppText>
            <AppText className="text-sm text-muted">
              {user?.email || user?.phone}
            </AppText>
          </View>
          <View className="bg-accent/15 rounded-full px-3 py-1">
            <AppText className="text-xs font-semibold text-accent">
              {MOCK_STATS.role} - {MOCK_STATS.team}
            </AppText>
          </View>
        </View>

        {/* League Info */}
        <View className="bg-card rounded-xl p-4 flex-row items-center gap-3">
          <Feather name="shield" size={20} color="#888" />
          <View className="flex-1">
            <AppText className="text-sm font-semibold text-foreground">
              {MOCK_STATS.league}
            </AppText>
            <AppText className="text-xs text-muted">
              Joined {MOCK_STATS.joinedDate}
            </AppText>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3">
          <StatCard label="Current Streak" value={`${MOCK_STATS.streak} days`} />
          <StatCard label="Total Points" value={MOCK_STATS.totalPoints} />
          <StatCard label="Activities Logged" value={MOCK_STATS.activitiesLogged} />
          <StatCard label="League Rank" value={`#${MOCK_STATS.rank}`} />
        </View>

        {/* Theme */}
        <View>
          <AppText className="text-sm font-semibold text-foreground mb-2">App Theme</AppText>
          <ThemeSelectorBar />
        </View>

        {/* Menu Items */}
        <View className="gap-2">
          <MenuItem
            icon="edit-3"
            label="Edit Profile"
            onPress={() => {
              // TODO: navigate to edit profile
            }}
          />
          <MenuItem
            icon="bell"
            label="Notifications"
            onPress={() => router.push('/(app)/notifications')}
          />
          <MenuItem
            icon="settings"
            label="Settings"
            onPress={() => router.push('/(app)/settings')}
          />
          <MenuItem
            icon="help-circle"
            label="Help & Support"
            onPress={() => router.push('/(app)/help')}
          />
        </View>

        {/* Logout */}
        <MenuItem icon="log-out" label="Log Out" onPress={handleLogout} danger />
      </View>
    </ScreenScrollView>
  );
}
