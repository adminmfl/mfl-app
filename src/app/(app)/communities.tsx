import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View, Pressable, TextInput, ScrollView } from 'react-native';
import { Avatar, Button, Card, Chip, Separator } from 'heroui-native';

import { AppText } from '../../components/app-text';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ScreenState } from '../../components/screen-state';
import { SectionLabel } from '../../components/section-label';
import { mflColors } from '../../constants/colors';
import { AppRoutes } from '../../core/config/routes';
import { useLeagueContext } from '../../contexts/league-context';
import { useUserLeagues } from '../../features/leagues/hooks/use-user-leagues';
import { isLeagueEnded } from '../../features/leagues/utils/league-status';
import type { UserLeague } from '../../features/leagues/types/league.model';

// ---------------------------------------------------------------------------
// Role helpers — mirrors web role display
// ---------------------------------------------------------------------------

const ROLE_HIERARCHY = ['host', 'governor', 'captain', 'vice_captain', 'player'] as const;

type RoleKey = (typeof ROLE_HIERARCHY)[number];

const ROLE_ICON: Record<RoleKey, React.ComponentProps<typeof Feather>['name']> = {
  host: 'award',
  governor: 'shield',
  captain: 'users',
  vice_captain: 'users',
  player: 'activity',
};

const ROLE_LABEL: Record<RoleKey, string> = {
  host: 'Host',
  governor: 'Governor',
  captain: 'Captain',
  vice_captain: 'Vice Captain',
  player: 'Player',
};

function getHighestRole(roles: string[]): RoleKey {
  for (const r of ROLE_HIERARCHY) {
    if (roles.includes(r)) return r;
  }
  return 'player';
}

// ---------------------------------------------------------------------------
// Status helpers — matches web badge logic with isLeagueEnded check
// ---------------------------------------------------------------------------

type DisplayStatus = 'active' | 'draft' | 'launched' | 'completed' | 'ended';

function resolveDisplayStatus(league: UserLeague): DisplayStatus {
  if (isLeagueEnded(league.endDate)) return 'ended';
  const s = league.status.toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'draft') return 'draft';
  if (s === 'launched') return 'launched';
  if (s === 'active') return 'active';
  return 'active';
}

function statusChipStyle(ds: DisplayStatus): { color: string; bgColor: string; label: string } {
  switch (ds) {
    case 'active':
      return { color: mflColors.brand, bgColor: mflColors.brandLight, label: 'Active' };
    case 'draft':
      return { color: mflColors.amber, bgColor: mflColors.amberLight, label: 'Draft' };
    case 'launched':
      return { color: mflColors.accent, bgColor: mflColors.accentLight, label: 'Launched' };
    case 'ended':
      return { color: mflColors.textMuted, bgColor: mflColors.surface, label: 'Ended' };
    case 'completed':
      return { color: mflColors.textMuted, bgColor: mflColors.surface, label: 'Completed' };
  }
}

// ---------------------------------------------------------------------------
// Filter chip options
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'launched', label: 'Launched' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'host', label: 'Host' },
  { value: 'governor', label: 'Governor' },
  { value: 'captain', label: 'Captain' },
  { value: 'player', label: 'Player' },
];

// ---------------------------------------------------------------------------
// League Card
// ---------------------------------------------------------------------------

function CommunityLeagueCard({
  league,
  onView,
}: {
  league: UserLeague;
  onView: (league: UserLeague) => void;
}) {
  const ds = resolveDisplayStatus(league);
  const sc = statusChipStyle(ds);
  const highestRole = getHighestRole(league.roles);
  const extraRoles = Math.max(0, league.roles.length - 1);
  const initials = (league.name || 'LG').slice(0, 2).toUpperCase();

  return (
    <Card variant="secondary" className="p-4 mb-3">
      {/* Row 1: Logo + Name + Status */}
      <View className="flex-row items-center gap-3">
        <Avatar size="md" alt={league.name}>
          {league.logoUrl ? (
            <Avatar.Image source={{ uri: league.logoUrl }} />
          ) : (
            <Avatar.Fallback>
              <AppText className="text-sm font-semibold text-brand">{initials}</AppText>
            </Avatar.Fallback>
          )}
        </Avatar>

        <View className="flex-1 gap-0.5">
          <AppText className="text-base font-bold text-foreground" numberOfLines={2}>
            {league.name}
          </AppText>
          {league.description ? (
            <AppText className="text-xs text-muted" numberOfLines={1}>
              {league.description}
            </AppText>
          ) : null}
        </View>

        <Chip size="sm" variant="soft" style={{ backgroundColor: sc.bgColor }}>
          <Chip.Label style={{ color: sc.color }}>{sc.label}</Chip.Label>
        </Chip>
      </View>

      <Separator className="my-2" />

      {/* Row 2: Role | Team | View */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-4">
          {/* Role */}
          <View className="flex-row items-center gap-1">
            <Feather name={ROLE_ICON[highestRole]} size={14} color={mflColors.textMuted} />
            <AppText className="text-xs font-medium text-foreground">
              {ROLE_LABEL[highestRole]}
            </AppText>
            {extraRoles > 0 && (
              <View
                style={{
                  backgroundColor: mflColors.surface,
                  borderRadius: 8,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderWidth: 1,
                  borderColor: mflColors.border,
                }}
              >
                <AppText className="text-[10px] text-muted">+{extraRoles}</AppText>
              </View>
            )}
          </View>

          {/* Team count */}
          <View className="gap-0.5">
            <AppText className="text-[10px] text-muted">Teams</AppText>
            <AppText className="text-xs font-medium text-foreground">{league.numTeams}</AppText>
          </View>

          {/* User's team */}
          {league.teamName && (
            <View className="gap-0.5">
              <AppText className="text-[10px] text-muted">Your Team</AppText>
              <AppText className="text-xs font-medium text-foreground" numberOfLines={1}>
                {league.teamName}
              </AppText>
            </View>
          )}
        </View>

        <Button variant="secondary" size="sm" onPress={() => onView(league)}>
          <Button.Label>View</Button.Label>
        </Button>
      </View>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function CommunitiesScreen() {
  const router = useRouter();
  const { data: leagues, isLoading, isError, refetch } = useUserLeagues();
  const { setActiveLeague } = useLeagueContext();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Filter + sort — matches web logic
  const filteredLeagues = useMemo(() => {
    if (!leagues) return [];

    const filtered = leagues.filter((l) => {
      const ended = isLeagueEnded(l.endDate);

      // Search filter
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const matchName = l.name.toLowerCase().includes(q);
        const matchDesc = l.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          if (ended || l.status !== 'active') return false;
        } else if (statusFilter === 'completed') {
          if (!ended && l.status !== 'completed') return false;
        } else {
          if (l.status !== statusFilter) return false;
        }
      }

      // Role filter
      if (roleFilter !== 'all' && !l.roles.includes(roleFilter)) {
        return false;
      }

      return true;
    });

    // Sort: active first, completed/ended last
    return [...filtered].sort((a, b) => {
      const aEnded = a.status === 'completed' || isLeagueEnded(a.endDate);
      const bEnded = b.status === 'completed' || isLeagueEnded(b.endDate);
      if (aEnded === bEnded) return 0;
      return aEnded ? 1 : -1;
    });
  }, [leagues, searchText, statusFilter, roleFilter]);

  const handleViewLeague = useCallback(
    (league: UserLeague) => {
      setActiveLeague(league);
      router.push(AppRoutes.dashboard);
    },
    [router, setActiveLeague],
  );

  const hasFilters = searchText.trim() !== '' || statusFilter !== 'all' || roleFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearchText('');
    setStatusFilter('all');
    setRoleFilter('all');
  }, []);

  // -- Loading --
  if (isLoading) {
    return <ScreenState screen="communities" state="loading" />;
  }

  // -- Error --
  if (isError) {
    return (
      <ScreenState
        screen="communities"
        state="error"
        message="Failed to load communities."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="gap-4 pb-12">
        {/* Back header */}
        <View className="flex-row items-center pt-3 pb-1">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-10 h-10 justify-center items-center rounded-full"
          >
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <View className="flex-1" />
        </View>

        {/* Dark header */}
        <DarkHeaderCard title="Communities" subtitle="Your leagues and communities" />

        {/* Search */}
        <TextInput
          style={{
            backgroundColor: mflColors.white,
            borderWidth: 1,
            borderColor: mflColors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 14,
            color: mflColors.text,
          }}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search communities..."
          placeholderTextColor={mflColors.textMuted}
          autoCorrect={false}
        />

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 px-0.5">
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={`s-${opt.value}`}
                onPress={() => setStatusFilter(opt.value)}
              >
                <Chip
                  size="sm"
                  variant={statusFilter === opt.value ? 'primary' : 'tertiary'}
                >
                  <Chip.Label
                    style={{
                      color: statusFilter === opt.value ? mflColors.white : mflColors.textSub,
                    }}
                  >
                    {opt.label}
                  </Chip.Label>
                </Chip>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 px-0.5">
            {ROLE_OPTIONS.map((opt) => (
              <Pressable
                key={`r-${opt.value}`}
                onPress={() => setRoleFilter(opt.value)}
              >
                <Chip
                  size="sm"
                  variant={roleFilter === opt.value ? 'primary' : 'tertiary'}
                >
                  <Chip.Label
                    style={{
                      color: roleFilter === opt.value ? mflColors.white : mflColors.textSub,
                    }}
                  >
                    {opt.label}
                  </Chip.Label>
                </Chip>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View className="flex-row gap-2">
          <Button
            variant="primary"
            size="md"
            onPress={() => router.push(AppRoutes.joinLeague)}
            className="flex-1"
          >
            <Button.Label>Join</Button.Label>
          </Button>
          <Button
            variant="secondary"
            size="md"
            onPress={() => router.push(AppRoutes.createLeague)}
            className="flex-1"
          >
            <Button.Label>Create</Button.Label>
          </Button>
        </View>

        {/* Results count */}
        {leagues && leagues.length > 0 && (
          <AppText className="text-xs text-muted">
            {filteredLeagues.length} league(s) total
          </AppText>
        )}

        {/* League list */}
        <SectionLabel label="YOUR COMMUNITIES" />

        {filteredLeagues.length === 0 ? (
          hasFilters ? (
            <View className="gap-3 items-center py-8">
              <ScreenState
                screen="communities"
                state="empty"
                message="No leagues match your current filters."
              />
              <Button variant="secondary" size="sm" onPress={clearFilters}>
                <Button.Label>Clear filters</Button.Label>
              </Button>
            </View>
          ) : (
            <ScreenState
              screen="communities"
              state="empty"
              message="No communities found. Join a league to get started!"
            />
          )
        ) : (
          filteredLeagues.map((league) => (
            <CommunityLeagueCard
              key={league.leagueId}
              league={league}
              onView={handleViewLeague}
            />
          ))
        )}
      </View>
    </ScreenScrollView>
  );
}
