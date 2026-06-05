import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Avatar, Card, Chip, Separator } from 'heroui-native';
import { withUniwind } from 'uniwind';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ThemeSelectorBar } from '../../components/theme-selector';
import { StatCard } from '../../components/stat-card';
import { ScreenState } from '../../components/screen-state';
import { SectionLabel } from '../../components/section-label';
import { useAuth } from '../../core/auth';
import { useUserProfile } from '../../features/profile/hooks/use-user-profile';
import { useDashboardSummary } from '../../features/dashboard/hooks/use-dashboard-summary';
import { useLeagueContext } from '../../contexts/league-context';
import { mflColors } from '../../constants/colors';

const StyledFeather = withUniwind(Feather);

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.substring(0, 2).toUpperCase();
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
    <Pressable onPress={onPress} className="flex-row items-center gap-3 px-5 py-3">
      <View
        className={`w-8 h-8 rounded-lg items-center justify-center ${
          danger ? 'bg-danger/10' : 'bg-default-100'
        }`}
      >
        <Feather
          name={icon}
          size={18}
          color={danger ? mflColors.danger : mflColors.textMuted}
        />
      </View>
      <AppText
        className={`flex-1 text-base font-medium ${
          danger ? 'text-danger' : 'text-foreground'
        }`}
      >
        {label}
      </AppText>
      <StyledFeather name="chevron-right" size={16} className="text-muted" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { activeLeague } = useLeagueContext();

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useUserProfile();

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useDashboardSummary();

  const isLoading = profileLoading || summaryLoading;

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchProfile(), refetchSummary()]);
  }, [refetchProfile, refetchSummary]);

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

  const displayName = profile?.username ?? user?.email ?? 'User';
  const displayEmail = profile?.email ?? user?.email ?? '';

  if (isLoading) {
    return (
      <ScreenScrollView>
        <ScreenState screen="profile" state="loading" message="Loading profile..." />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="py-6 gap-8">
        {/* Avatar + Name */}
        <View className="items-center gap-3">
          <Avatar size="lg" alt={displayName}>
            {profile?.avatarUrl ? (
              <Avatar.Image source={{ uri: profile.avatarUrl }} />
            ) : null}
            <Avatar.Fallback>
              <AppText className="text-2xl font-bold">{getInitials(displayName)}</AppText>
            </Avatar.Fallback>
          </Avatar>
          <View className="items-center gap-1">
            <AppText className="text-2xl font-bold text-foreground">{displayName}</AppText>
            <AppText className="text-sm text-muted">{displayEmail}</AppText>
          </View>

          {/* Role + Team tag */}
          {activeLeague && (
            <View className="flex-row gap-2 mt-1">
              {activeLeague.roles.length > 0 && (
                <Chip size="sm" variant="soft" style={{ backgroundColor: mflColors.accentLight }}>
                  <Chip.Label style={{ color: mflColors.accent }}>
                    {activeLeague.roles[0]!.charAt(0).toUpperCase() + activeLeague.roles[0]!.slice(1)}
                  </Chip.Label>
                </Chip>
              )}
              {activeLeague.teamName && (
                <Chip size="sm" variant="soft" style={{ backgroundColor: mflColors.brandLight }}>
                  <Chip.Label style={{ color: mflColors.brand }}>
                    {activeLeague.teamName}
                  </Chip.Label>
                </Chip>
              )}
            </View>
          )}
        </View>

        {/* League Info */}
        {activeLeague && (
          <Card className="shadow-none border border-separator">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-lg items-center justify-center"
                style={{ backgroundColor: mflColors.accentLight }}
              >
                <Feather name="shield" size={20} color={mflColors.accent} />
              </View>
              <View className="flex-1 gap-0.5">
                <AppText className="text-base font-semibold text-foreground">
                  {activeLeague.name}
                </AppText>
                <AppText className="text-sm text-muted">
                  {activeLeague.numTeams} {activeLeague.numTeams === 1 ? 'team' : 'teams'}
                  {activeLeague.status ? ` \u00B7 ${activeLeague.status}` : ''}
                </AppText>
              </View>
            </View>
          </Card>
        )}

        {/* Stats Grid */}
        <View>
          <SectionLabel label="Your Stats" />
          <View className="flex-row gap-3 mb-3">
            <StatCard
              label="Current Streak"
              value={summary ? `${summary.currentStreak}d` : '--'}
              color={mflColors.brand}
            />
            <StatCard
              label="Total Points"
              value={summary?.totalPoints ?? '--'}
              color={mflColors.accent}
            />
          </View>
          <View className="flex-row gap-3 mb-3">
            <StatCard
              label="Activities Logged"
              value={summary?.activitiesLogged ?? '--'}
            />
            <StatCard
              label="Best Streak"
              value={summary ? `${summary.bestStreak}d` : '--'}
              color={mflColors.amber}
            />
          </View>
        </View>

        {/* Theme */}
        <View>
          <SectionLabel label="App Theme" />
          <ThemeSelectorBar />
        </View>

        {/* Menu Items */}
        <View>
          <SectionLabel label="Account" />
          <Card className="shadow-none border border-separator p-0">
            <MenuItem
              icon="edit-3"
              label="Edit Profile"
              onPress={() => router.push('/(app)/edit-profile')}
            />
            <Separator />
            <MenuItem
              icon="bell"
              label="Notifications"
              onPress={() => router.push('/(app)/notifications')}
            />
            <Separator />
            <MenuItem
              icon="settings"
              label="Settings"
              onPress={() => router.push('/(app)/settings')}
            />
            <Separator />
            <MenuItem
              icon="help-circle"
              label="Help & Support"
              onPress={() => router.push('/(app)/help')}
            />
          </Card>
        </View>

        {/* Logout */}
        <Card className="shadow-none border border-separator p-0">
          <MenuItem icon="log-out" label="Log Out" onPress={handleLogout} danger />
        </Card>
      </View>
    </ScreenScrollView>
  );
}
