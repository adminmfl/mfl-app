import Feather from '@expo/vector-icons/Feather';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Drawer as DrawerLayout } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/app-text';
import { useAuth } from '../../core/auth';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole, type LeagueRole } from '../../contexts/role-context';
import { DrawerContext } from '../../contexts/drawer-context';
import { useUserLeagues } from '../../features/leagues/hooks/use-user-leagues';
import { mflColors } from '../../constants/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FeatherIcon = keyof typeof Feather.glyphMap;

interface DrawerNavItem {
  label: string;
  icon: FeatherIcon;
  route: string;
}

interface DrawerNavSection {
  title: string;
  items: DrawerNavItem[];
}

// ---------------------------------------------------------------------------
// Navigation Config (mirrors web sidebar-config.ts getSidebarNavItems)
// ---------------------------------------------------------------------------

const BASE_NAV_ITEMS: DrawerNavItem[] = [
  { label: 'MFL Dashboard', icon: 'home', route: '(tabs)/dashboard' },
  { label: 'Join a League', icon: 'search', route: 'join-league' },
  { label: 'Profile Settings', icon: 'settings', route: 'profile' },
  { label: 'Help & Support', icon: 'help-circle', route: 'help' },
  { label: 'Payments', icon: 'credit-card', route: 'payment-checkout' },
];

function getDrawerNavSections(
  role: LeagueRole | null,
  hasLeague: boolean,
): DrawerNavSection[] {
  // No league selected — show base navigation only
  if (!hasLeague || !role) {
    return [{ title: 'MyFitnessLeague', items: BASE_NAV_ITEMS }];
  }

  const sections: DrawerNavSection[] = [];

  // ── Player / Captain / Vice Captain: primary section ──
  if (role === 'player' || role === 'captain' || role === 'vice_captain') {
    sections.push({
      title: '',
      items: [
        { label: 'Overview', icon: 'grid', route: '(tabs)/dashboard' },
        { label: 'My Challenges', icon: 'flag', route: 'challenges' },
        { label: 'My Team', icon: 'users', route: '(tabs)/my-team' },
        { label: 'Team Chat', icon: 'message-circle', route: '(tabs)/team-chat' },
        { label: 'Leaderboard', icon: 'bar-chart-2', route: '(tabs)/leaderboard' },
        { label: 'Rules', icon: 'book-open', route: 'league-rules' },
      ],
    });
  }

  // ── Host / Governor: admin section ──
  if (role === 'host' || role === 'governor') {
    const adminItems: DrawerNavItem[] = [];

    // League Settings — host only
    if (role === 'host') {
      adminItems.push({ label: 'League Settings', icon: 'settings', route: 'league-settings' });
    }

    // Manage Rules — host & governor
    adminItems.push({ label: 'Manage Rules', icon: 'file-text', route: 'league-rules' });

    // Oversight items — host & governor
    adminItems.push(
      { label: 'Player Activities', icon: 'clipboard', route: 'submission-validation' },
      { label: 'Leaderboard', icon: 'bar-chart-2', route: '(tabs)/leaderboard' },
      { label: 'Configure Challenges', icon: 'flag', route: 'challenge-config' },
      { label: 'Manual Workout Entry', icon: 'user-check', route: 'manual-entry' },
      { label: 'Approve Donations', icon: 'heart', route: 'rest-day-donations' },
      { label: 'Team Chat', icon: 'message-circle', route: '(tabs)/team-chat' },
      { label: 'AI Manager', icon: 'cpu', route: 'ai-manager' },
      { label: 'AI Usage', icon: 'activity', route: 'ai-usage' },
    );

    sections.push({
      title: role === 'host' ? 'Host Actions' : 'Governor Actions',
      items: adminItems,
    });
  }

  // ── Captain / Vice Captain: captain actions ──
  if (role === 'captain' || role === 'vice_captain') {
    sections.push({
      title: 'Captain Actions',
      items: [
        { label: 'Team Overview', icon: 'users', route: '(tabs)/my-team' },
        { label: 'Team Activities', icon: 'clipboard', route: 'submission-validation' },
        { label: 'Approve Donations', icon: 'heart', route: 'rest-day-donations' },
      ],
    });
  }

  // ── MyFitnessLeague section (always at the end) ──
  sections.push({ title: 'MyFitnessLeague', items: BASE_NAV_ITEMS });

  return sections;
}

// ---------------------------------------------------------------------------
// Role Display Config
// ---------------------------------------------------------------------------

const ROLE_DISPLAY: Record<LeagueRole, { label: string; color: string }> = {
  host: { label: 'Host', color: '#f59e0b' },
  governor: { label: 'Governor', color: '#3b82f6' },
  captain: { label: 'Captain', color: '#10b981' },
  vice_captain: { label: 'Vice Captain', color: '#10b981' },
  player: { label: 'Player', color: '#6b7280' },
};

const ROLE_ICONS: Record<LeagueRole, FeatherIcon> = {
  host: 'award',
  governor: 'shield',
  captain: 'users',
  vice_captain: 'users',
  player: 'user',
};

// ---------------------------------------------------------------------------
// Drawer Content
// ---------------------------------------------------------------------------

function DrawerContent({ closeDrawer }: { closeDrawer: () => void }) {
  const { user, logout } = useAuth();
  const { activeLeague, setActiveLeague } = useLeagueContext();
  const { activeRole, availableRoles, setActiveRole } = useRole();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const leaguesQuery = useUserLeagues();
  const leagues = leaguesQuery.data;
  const leaguesLoading = leaguesQuery.isLoading;

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const navSections = getDrawerNavSections(activeRole, !!activeLeague);

  const navigateTo = (route: string) => {
    closeDrawer();
    if (route.startsWith('(tabs)')) {
      router.navigate(`/(app)/${route}` as any);
    } else {
      router.push(`/(app)/${route}` as any);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* ── User Header ── */}
      <Pressable
        className="p-5 border-b border-default-200"
        onPress={() => {
          closeDrawer();
          router.push('/(app)/profile' as any);
        }}
      >
        <View className="h-12 w-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: mflColors.brand }}>
          <AppText className="text-lg font-bold" style={{ color: '#fff' }}>
            {(user?.email ?? 'G')[0]!.toUpperCase()}
          </AppText>
        </View>
        <AppText className="text-base font-semibold text-foreground" numberOfLines={1}>
          {user?.email ?? 'Guest'}
        </AppText>
        {activeLeague && activeRole && (
          <AppText className="text-sm text-muted" numberOfLines={1}>
            Viewing {activeLeague.name} as {activeRole}
          </AppText>
        )}
      </Pressable>

      {/* ── League Switcher ── */}
      {leagues && leagues.length > 1 && (
        <View className="px-5 py-3 border-b border-default-200">
          <AppText className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: mflColors.textMuted }}>
            SWITCH LEAGUE
          </AppText>
          {leagues.map((league) => {
            const isActive = league.leagueId === activeLeague?.leagueId;
            return (
              <Pressable
                key={league.leagueId}
                onPress={() => setActiveLeague(league)}
                className="flex-row items-center gap-2 py-2"
              >
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? mflColors.brand : mflColors.border }} />
                <AppText
                  className="text-sm flex-1"
                  numberOfLines={1}
                  style={{ color: isActive ? mflColors.brand : mflColors.text, fontWeight: isActive ? '600' : '400' }}
                >
                  {league.name}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Role Switcher ── */}
      {availableRoles.length > 1 && activeRole && (
        <View className="px-5 py-3 border-b border-default-200">
          <AppText className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: mflColors.textMuted }}>
            SWITCH ROLE
          </AppText>
          <View className="flex-row flex-wrap gap-2">
            {availableRoles.map((role) => {
              const info = ROLE_DISPLAY[role];
              const isActive = role === activeRole;
              return (
                <Pressable
                  key={role}
                  onPress={() => setActiveRole(role)}
                  className="flex-row items-center gap-2 rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: isActive ? info.color + '20' : mflColors.card,
                    borderWidth: isActive ? 1.5 : 1,
                    borderColor: isActive ? info.color : mflColors.border,
                  }}
                >
                  <Feather name={ROLE_ICONS[role]} size={14} color={isActive ? info.color : mflColors.textMuted} />
                  <AppText className="text-xs font-semibold" style={{ color: isActive ? info.color : mflColors.text }}>
                    {info.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Navigation Sections ── */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 8 }} showsVerticalScrollIndicator={false}>
        {leaguesLoading && !activeLeague && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={mflColors.brand} />
            <AppText className="text-xs text-muted mt-2">Loading leagues...</AppText>
          </View>
        )}
        {navSections.map((section, sIdx) => (
          <View key={`${section.title || 'primary'}-${sIdx}`}>
            {/* Dashed separator before MyFitnessLeague */}
            {section.title === 'MyFitnessLeague' && (
              <View className="mx-5 my-2" style={{ borderTopWidth: 2, borderStyle: 'dashed', borderColor: mflColors.border }} />
            )}

            {/* Section label */}
            {section.title !== '' && (
              <AppText
                className="text-[10px] font-bold uppercase tracking-wider px-5 mt-3 mb-1"
                style={{
                  color: section.title === 'MyFitnessLeague'
                    ? mflColors.text
                    : mflColors.textMuted,
                  fontSize: section.title === 'MyFitnessLeague' ? 13 : 10,
                  fontWeight: '700',
                }}
              >
                {section.title}
              </AppText>
            )}

            {/* Section items */}
            {section.items.map((item) => (
              <Pressable
                key={`${sIdx}-${item.route}-${item.label}`}
                onPress={() => navigateTo(item.route)}
                className="flex-row items-center gap-3 px-5 py-3.5"
              >
                <Feather
                  name={item.icon}
                  size={20}
                  color={
                    section.title === 'Host Actions' || section.title === 'Governor Actions' || section.title === 'Captain Actions'
                      ? mflColors.amber
                      : mflColors.textSub
                  }
                />
                <AppText className="text-sm font-medium text-foreground flex-1" numberOfLines={1}>
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* ── Logout ── */}
      <View className="border-t border-default-200 p-5" style={{ paddingBottom: insets.bottom + 16 }}>
        <Pressable onPress={handleLogout} className="flex-row items-center gap-3">
          <Feather name="log-out" size={20} color={mflColors.danger} />
          <AppText className="text-sm font-medium flex-1" numberOfLines={1} style={{ color: mflColors.danger }}>
            Log Out
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerContext = useMemo(
    () => ({
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: mflColors.surface }}>
        <ActivityIndicator size="large" color={mflColors.brand} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <DrawerContext.Provider value={drawerContext}>
      <DrawerLayout
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        drawerType="front"
        drawerStyle={{
          backgroundColor: mflColors.surface,
          width: 280,
        }}
        overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        renderDrawerContent={() => (
          <DrawerContent closeDrawer={() => setDrawerOpen(false)} />
        )}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="log-activity" options={{ presentation: 'modal' }} />
          <Stack.Screen name="challenges" />
          <Stack.Screen name="challenges/[challengeId]" />
          <Stack.Screen name="ai-coach" />
          <Stack.Screen name="ai-manager" />
          <Stack.Screen name="ai-usage" />
          <Stack.Screen name="analytics" />
          <Stack.Screen name="governor" />
          <Stack.Screen name="submission-validation" />
          <Stack.Screen name="rest-day-donations" />
          <Stack.Screen name="manual-entry" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="help" />
          <Stack.Screen name="host-support" />
          <Stack.Screen name="complete-profile" />
          <Stack.Screen name="join-league" />
          <Stack.Screen name="create-league" />
          <Stack.Screen name="league-overview" />
          <Stack.Screen name="league-settings" />
          <Stack.Screen name="league-rules" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="payment-checkout" />
          <Stack.Screen name="custom-activities" />
          <Stack.Screen name="challenge-config" />
          <Stack.Screen name="team-management" />
          <Stack.Screen name="reupload-submission" options={{ presentation: 'modal' }} />
          <Stack.Screen name="challenge-submit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="invite/[code]" />
          <Stack.Screen name="invite/team/[code]" />
          <Stack.Screen name="communities" />
          <Stack.Screen name="mfl-rules" />
          <Stack.Screen name="quick-start-league" />
        </Stack>
      </DrawerLayout>
    </DrawerContext.Provider>
  );
}
