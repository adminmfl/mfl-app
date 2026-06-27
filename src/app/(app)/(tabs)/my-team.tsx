import { useState, useCallback, useMemo } from 'react';
import { View, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Avatar, Button, Card, Tabs } from 'heroui-native';
import { TeamViewRoster } from '../../../features/team/components/team-view-roster';
import { useRouter } from 'expo-router';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { DarkHeaderCard } from '../../../components/dark-header-card';
import { ScreenState } from '../../../components/screen-state';
import { SectionLabel } from '../../../components/section-label';
import { StatCard } from '../../../components/stat-card';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import { useMyTeamOverview } from '../../../features/team/hooks/use-my-team-overview';
import { useTeams } from '../../../features/team/hooks/use-teams';
import { useUnallocatedMembers } from '../../../features/team/hooks/use-unallocated-members';
import { useAssignMember } from '../../../features/team/hooks/use-assign-member';
import { mflColors } from '../../../constants/colors';
import type { TeamMember, LeagueMember, MyTeamStats } from '../../../features/team/types/team.model';

type TabKey = 'Roster' | 'Teams';
const TABS = ['Roster', 'Teams'] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function MyTeamScreen() {
  const router = useRouter();
  const { activeLeague } = useLeagueContext();
  const { isCaptain, isViceCaptain, isHost } = useRole();
  const [activeTab, setActiveTab] = useState<TabKey>('Roster');

  const leagueId = activeLeague?.leagueId ?? '';
  const teamId = activeLeague?.teamId ?? null;
  const teamCapacity = activeLeague
    ? Math.floor(activeLeague.leagueCapacity / Math.max(activeLeague.numTeams, 1))
    : 0;

  const {
    data: overviewData,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useMyTeamOverview(leagueId, teamId, teamCapacity);

  const {
    data: teams,
    isLoading: teamsLoading,
    isError: teamsError,
    refetch: refetchTeams,
  } = useTeams(leagueId);

  const isLeader = isCaptain || isViceCaptain || isHost;

  const {
    data: unallocatedMembers,
    refetch: refetchUnallocated,
  } = useUnallocatedMembers(leagueId, isLeader);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchOverview(),
      refetchTeams(),
      ...(isLeader ? [refetchUnallocated()] : []),
    ]);
  }, [refetchOverview, refetchTeams, refetchUnallocated, isLeader]);

  // No league selected
  if (!activeLeague) {
    return (
      <ScreenScrollView>
        <ScreenState screen="my-team" state="empty" message="Select a league to view your team" />
      </ScreenScrollView>
    );
  }

  // Loading
  const isCurrentTabLoading =
    (activeTab === 'Roster' && overviewLoading) || (activeTab === 'Teams' && teamsLoading);

  if (isCurrentTabLoading) {
    return (
      <ScreenScrollView>
        <View className="py-4 gap-4">
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
        <ScreenState screen="my-team" state="loading" />
      </ScreenScrollView>
    );
  }

  // Error
  const isCurrentTabError =
    (activeTab === 'Roster' && overviewError) || (activeTab === 'Teams' && teamsError);

  if (isCurrentTabError) {
    return (
      <ScreenScrollView>
        <View className="py-4 gap-4">
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
        <ScreenState
          screen="my-team"
          state="error"
          message="Failed to load team data"
          actionLabel="Retry"
          onAction={handleRefresh}
        />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="py-4 gap-4">
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'Roster' ? (
          <RosterTab
            teamName={overviewData?.stats.teamName ?? activeLeague.teamName}
            teamLogoUrl={activeLeague.teamLogoUrl}
            overviewData={overviewData}
            isLeader={isLeader}
            isCaptain={isCaptain}
            isViceCaptain={isViceCaptain}
            isHost={isHost}
            leagueId={leagueId}
            teamId={teamId}
            unallocatedMembers={unallocatedMembers ?? []}
            onMembersChanged={handleRefresh}
            onOpenTeamActivities={() => router.push('/(app)/team-activities' as any)}
          />
        ) : (
          <TeamsTab teams={teams ?? []} />
        )}
      </View>
    </ScreenScrollView>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabKey;
  setActiveTab: (v: TabKey) => void;
}) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="mb-1">
      <Tabs.List>
        {TABS.map((tab) => (
          <Tabs.Trigger key={tab} value={tab}>
            <Tabs.Label>{tab}</Tabs.Label>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
}

// ─── Roster Tab ───────────────────────────────────────────────────────────────

interface RosterTabProps {
  teamName: string | null;
  teamLogoUrl: string | null;
  overviewData:
    | {
        members: TeamMember[];
        stats: MyTeamStats;
      }
    | undefined;
  isLeader: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isHost: boolean;
  leagueId: string;
  teamId: string | null;
  unallocatedMembers: LeagueMember[];
  onMembersChanged: () => void;
  onOpenTeamActivities: () => void;
}

function RosterTab({
  teamName,
  teamLogoUrl,
  overviewData,
  isLeader,
  isCaptain,
  isViceCaptain,
  isHost,
  leagueId,
  teamId,
  unallocatedMembers,
  onMembersChanged,
  onOpenTeamActivities,
}: RosterTabProps) {
  const { activeLeague } = useLeagueContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [unallocatedModalOpen, setUnallocatedModalOpen] = useState(false);

  // League display config (matches web useLeagueDisplayConfig)
  const rrFormula = (activeLeague?.rrConfig as any)?.formula || 'standard';
  const showRR = rrFormula === 'standard';
  const showRestDays = (activeLeague?.restDays ?? 1) > 0;

  const members = overviewData?.members ?? [];
  const stats = overviewData?.stats;

  // Sort by points DESC, then avg RR DESC (matches web)
  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return (b.avgRr || 0) - (a.avgRr || 0);
      }),
    [members],
  );

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return sortedMembers;
    const q = searchQuery.toLowerCase();
    return sortedMembers.filter((m) => m.username.toLowerCase().includes(q));
  }, [sortedMembers, searchQuery]);

  if (!teamName || !teamId) {
    return (
      <ScreenState
        screen="my-team"
        state="empty"
        message="You are not assigned to a team yet. Please contact your host to be assigned to a team."
      />
    );
  }

  const roleLabel = isCaptain
    ? 'Captain'
    : isViceCaptain
      ? 'Vice Captain'
      : isHost
        ? 'Host'
        : undefined;

  return (
    <View className="gap-4">
      {/* Header */}
      <DarkHeaderCard title={teamName} subtitle={roleLabel ? `Team ${roleLabel}` : undefined}>
        {teamLogoUrl ? (
          <View className="mt-3">
            <Avatar size="lg" alt={teamName}>
              <Avatar.Image source={{ uri: teamLogoUrl }} />
              <Avatar.Fallback>
                <AppText className="text-base font-bold" style={{ color: mflColors.white }}>
                  {getInitials(teamName)}
                </AppText>
              </Avatar.Fallback>
            </Avatar>
          </View>
        ) : null}
      </DarkHeaderCard>

      {/* Stats Summary Cards — Team Points · Run Rate · Ranking */}
      {stats && (
        <View className="flex-row gap-2">
          <StatCard value={stats.teamRank} label="Team Ranking" color={mflColors.amber} />
          <StatCard value={String(stats.teamPoints)} label="Team Points" color={mflColors.brand} />
          <StatCard value={stats.teamAvgRR.toFixed(2)} label="Run Rate" color={mflColors.blue} />
          <StatCard
            value={typeof stats.challengePoints === 'number' ? stats.challengePoints.toLocaleString() : '\u2014'}
            label="Challenge Points"
            color={mflColors.blue}
          />
        </View>
      )}

      {/* Leader actions */}
      {isLeader && (
        <View className="gap-2">
          {unallocatedMembers.length > 0 && (
            <Button
              variant="secondary"
              size="md"
              onPress={() => setUnallocatedModalOpen(true)}
            >
              <Button.Label>Unallocated Members ({unallocatedMembers.length})</Button.Label>
            </Button>
          )}
          <Button variant="secondary" size="md" onPress={onOpenTeamActivities}>
            <Feather name="clipboard" size={16} color={mflColors.text} />
            <Button.Label>Team Activities</Button.Label>
          </Button>
        </View>
      )}

      {/* Search (show when >5 members) */}
      {members.length > 5 && (
        <View
          className="flex-row items-center rounded-xl px-3 py-2 gap-2"
          style={{ backgroundColor: mflColors.inkLight }}
        >
          <Feather name="search" size={16} color={mflColors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search members..."
            placeholderTextColor={mflColors.textMuted}
            className="flex-1 text-sm"
            style={{ color: mflColors.text, padding: 0 }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={mflColors.textMuted} />
            </Pressable>
          )}
        </View>
      )}

      {/* Members List */}
      <TeamViewRoster
        members={filteredMembers}
        showRR={showRR}
        showRestDays={showRestDays}
        isCaptain={isCaptain}
      />

      {/* Unallocated Members Modal */}
      {isLeader && teamId && (
        <UnallocatedMembersModal
          visible={unallocatedModalOpen}
          onClose={() => setUnallocatedModalOpen(false)}
          members={unallocatedMembers}
          leagueId={leagueId}
          teamId={teamId}
          teamName={teamName}
          onAssigned={onMembersChanged}
        />
      )}
    </View>
  );
}

// ─── Unallocated Members Modal ─────────────────────────────────────────────────

interface UnallocatedMembersModalProps {
  visible: boolean;
  onClose: () => void;
  members: LeagueMember[];
  leagueId: string;
  teamId: string;
  teamName: string;
  onAssigned: () => void;
}

function UnallocatedMembersModal({
  visible,
  onClose,
  members,
  leagueId,
  teamId,
  teamName,
  onAssigned,
}: UnallocatedMembersModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const assignMember = useAssignMember(leagueId, teamId);
  const [assigning, setAssigning] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter((m) => (m.username ?? '').toLowerCase().includes(q));
  }, [members, searchQuery]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.memberId)));
    }
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      for (const memberId of selectedIds) {
        await assignMember.mutateAsync(memberId);
      }
      setSelectedIds(new Set());
      onAssigned();
      onClose();
    } catch {
      // Mutation error handled by react-query
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View className="flex-1" style={{ backgroundColor: mflColors.surface }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <View className="flex-1">
            <AppText className="text-lg font-bold text-foreground">Unallocated Members</AppText>
            <AppText className="text-xs text-muted mt-0.5">
              Add to {teamName} ({members.length} available)
            </AppText>
          </View>
          <Pressable onPress={handleClose} className="p-2">
            <Feather name="x" size={22} color={mflColors.text} />
          </Pressable>
        </View>

        {/* Search + Select All */}
        <View className="px-4 pb-2 gap-2">
          <View
            className="flex-row items-center rounded-xl px-3 py-2 gap-2"
            style={{ backgroundColor: mflColors.inkLight }}
          >
            <Feather name="search" size={16} color={mflColors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search members..."
              placeholderTextColor={mflColors.textMuted}
              className="flex-1 text-sm"
              style={{ color: mflColors.text, padding: 0 }}
            />
          </View>
          {filtered.length > 0 && (
            <Pressable onPress={toggleAll}>
              <AppText className="text-xs font-semibold" style={{ color: mflColors.brand }}>
                {selectedIds.size === filtered.length ? 'Deselect All' : 'Select All'}
              </AppText>
            </Pressable>
          )}
        </View>

        {/* List */}
        <ScrollView className="flex-1 px-4">
          {filtered.length > 0 ? (
            filtered.map((member) => {
              const isSelected = selectedIds.has(member.memberId);
              return (
                <Pressable
                  key={member.memberId}
                  onPress={() => !assigning && toggleMember(member.memberId)}
                  className="flex-row items-center py-3 gap-3"
                >
                  <View
                    className="w-5 h-5 rounded items-center justify-center"
                    style={{
                      backgroundColor: isSelected ? mflColors.brand : 'transparent',
                      borderWidth: isSelected ? 0 : 1.5,
                      borderColor: mflColors.border,
                    }}
                  >
                    {isSelected && <Feather name="check" size={14} color={mflColors.white} />}
                  </View>
                  <Avatar size="sm" alt={member.username ?? 'User'}>
                    <Avatar.Fallback>
                      <AppText className="text-xs font-semibold">
                        {getInitials(member.username ?? '??')}
                      </AppText>
                    </Avatar.Fallback>
                  </Avatar>
                  <AppText className="flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
                    {member.username ?? 'Unknown'}
                  </AppText>
                  {member.roles.includes('host') && (
                    <View
                      className="rounded-full px-2 py-0.5"
                      style={{ backgroundColor: mflColors.amberLight }}
                    >
                      <AppText className="text-[10px] font-semibold" style={{ color: mflColors.amber }}>
                        Host
                      </AppText>
                    </View>
                  )}
                </Pressable>
              );
            })
          ) : (
            <View className="py-8 items-center">
              <AppText className="text-sm text-muted">
                {searchQuery ? 'No members found' : 'No unallocated members'}
              </AppText>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="px-4 pb-6 pt-3" style={{ borderTopWidth: 1, borderTopColor: mflColors.border }}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleAssign}
            isDisabled={selectedIds.size === 0 || assigning}
            className="w-full"
          >
            <Button.Label>
              {assigning ? 'Assigning...' : `Add Selected (${selectedIds.size})`}
            </Button.Label>
          </Button>
        </View>
      </View>
    </Modal>
  );
}

// ─── Teams Tab ────────────────────────────────────────────────────────────────

interface TeamsTabProps {
  teams: Array<{
    teamId: string;
    teamName: string;
    logoUrl: string | null;
    memberCount: number;
  }>;
}

function TeamsTab({ teams }: TeamsTabProps) {
  if (teams.length === 0) {
    return (
      <ScreenState screen="my-team" state="empty" message="No teams in this league yet" />
    );
  }

  return (
    <View className="gap-4">
      <SectionLabel label="All Teams" />
      {teams.map((team) => (
        <Card key={team.teamId} className="p-4 mb-3">
          <View className="flex-row items-center gap-3">
            <Avatar size="md" alt={team.teamName}>
              {team.logoUrl ? <Avatar.Image source={{ uri: team.logoUrl }} /> : null}
              <Avatar.Fallback>
                <AppText className="text-sm font-semibold">{team.teamName.charAt(0)}</AppText>
              </Avatar.Fallback>
            </Avatar>
            <View className="flex-1 gap-1">
              <AppText className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {team.teamName}
              </AppText>
              <AppText className="text-xs text-muted">
                {`${team.memberCount} ${team.memberCount === 1 ? 'member' : 'members'}`}
              </AppText>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}
