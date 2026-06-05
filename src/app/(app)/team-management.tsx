import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Share, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ScreenState } from '../../components/screen-state';
import { SectionLabel } from '../../components/section-label';
import { mflColors } from '../../constants/colors';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import { ActionButton } from '../../features/team-management/components/action-button';
import { ManagedTeamCard } from '../../features/team-management/components/managed-team-card';
import { MemberListRow } from '../../features/team-management/components/member-list-row';
import { TeamManagementHeader } from '../../features/team-management/components/team-management-header';
import { TeamManagementPanel } from '../../features/team-management/components/team-management-panel';
import {
  useManagedTeamMembers,
  useTeamManagementActions,
  useTeamManagementData,
} from '../../features/team-management/hooks/use-team-management';
import type {
  ManagedLeagueMember,
  ManagedTeam,
  ManagedTeamMember,
  PickedTeamLogo,
  TeamManagementData,
} from '../../features/team-management/types/team-management';
import {
  getPerTeamCapacity,
  searchMembers,
} from '../../features/team-management/utils/team-management-utils';

type Panel =
  | 'create'
  | 'edit'
  | 'unallocated'
  | 'addMembers'
  | 'members'
  | 'captain'
  | 'viceCaptain'
  | 'governors'
  | 'invite'
  | null;

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: mflColors.text,
};

export default function TeamManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';
  const canManageTeams = isHost || isGovernor;
  const canManageLogos = isHost;

  const dataQuery = useTeamManagementData(leagueId);
  const actions = useTeamManagementActions(leagueId);

  const [panel, setPanel] = useState<Panel>(null);
  const [selectedTeam, setSelectedTeam] = useState<ManagedTeam | null>(null);
  const [teamName, setTeamName] = useState('');
  const [search, setSearch] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [targetTeamId, setTargetTeamId] = useState('');
  const [selectedGovernorIds, setSelectedGovernorIds] = useState<string[]>([]);
  const [memberToMove, setMemberToMove] = useState<ManagedTeamMember | null>(null);

  const needsTeamMembers =
    panel === 'members' || panel === 'captain' || panel === 'viceCaptain';
  const teamMembersQuery = useManagedTeamMembers(
    leagueId,
    selectedTeam?.team_id ?? '',
    needsTeamMembers,
  );

  const queryData = dataQuery.data;
  const allMembers = useMemo(
    () => [
      ...(queryData?.members.allocated ?? []),
      ...(queryData?.members.unallocated ?? []),
    ],
    [queryData],
  );
  const teamMembers = teamMembersQuery.data ?? [];

  useEffect(() => {
    if (panel === 'governors' && queryData) {
      setSelectedGovernorIds(queryData.governors.map((governor) => governor.user_id));
    }
  }, [queryData, panel]);

  const closePanel = useCallback(() => {
    setPanel(null);
    setSelectedTeam(null);
    setTeamName('');
    setSearch('');
    setSelectedMemberIds([]);
    setTargetTeamId('');
    setMemberToMove(null);
  }, []);

  const openCreate = useCallback(() => {
    setSelectedTeam(null);
    setTeamName('');
    setPanel('create');
  }, []);

  const openTeamPanel = useCallback((nextPanel: Panel, team: ManagedTeam) => {
    setSelectedTeam(team);
    setTeamName(team.team_name);
    setSearch('');
    setSelectedMemberIds([]);
    setTargetTeamId('');
    setMemberToMove(null);
    setPanel(nextPanel);
  }, []);

  const toggleMember = useCallback((memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  }, []);

  const pickTeamLogo = useCallback(async (team: ManagedTeam) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please grant photo library access to upload a logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const rawType = (asset as { mimeType?: string }).mimeType ?? asset.type;
    const file: PickedTeamLogo = {
      uri: asset.uri,
      name: asset.fileName ?? `team_logo_${Date.now()}.jpg`,
      type: rawType?.startsWith('image/') ? rawType : 'image/jpeg',
    };

    actions.uploadLogo.mutate(
      { teamId: team.team_id, file },
      {
        onSuccess: () => Alert.alert('Logo Updated', 'Team logo updated.'),
        onError: (error) => Alert.alert('Upload Failed', error.message),
      },
    );
  }, [actions.uploadLogo]);

  const confirmDeleteTeam = useCallback(
    (team: ManagedTeam) => {
      Alert.alert(
        'Delete Team',
        `Are you sure you want to delete "${team.team_name}"? All members will be unassigned and moved to the unallocated pool.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              actions.deleteTeam.mutate(team.team_id, {
                onSuccess: () => Alert.alert('Team Deleted', 'Team deleted successfully.'),
                onError: (error) => Alert.alert('Delete Failed', error.message),
              });
            },
          },
        ],
      );
    },
    [actions.deleteTeam],
  );

  const confirmRemoveLogo = useCallback(
    (team: ManagedTeam) => {
      Alert.alert('Remove Logo', `Remove logo from "${team.team_name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            actions.removeLogo.mutate(team.team_id, {
              onSuccess: () => Alert.alert('Logo Removed', 'Team logo removed.'),
              onError: (error) => Alert.alert('Remove Failed', error.message),
            });
          },
        },
      ]);
    },
    [actions.removeLogo],
  );

  if (!activeLeague) {
    return (
      <ScreenState
        screen="team-management"
        state="empty"
        message="Select a league first."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (!canManageTeams) {
    return (
      <ScreenState
        screen="team-management"
        state="error"
        message="Only the league host or governor can manage teams."
        actionLabel="Go Back"
        onAction={() => router.back()}
      />
    );
  }

  if (dataQuery.isLoading) {
    return <ScreenState screen="team-management" state="loading" />;
  }

  if (dataQuery.isError || !queryData) {
    return (
      <ScreenState
        screen="team-management"
        state="error"
        message="Failed to load team data."
        actionLabel="Retry"
        onAction={() => dataQuery.refetch()}
      />
    );
  }

  const data = queryData;

  return (
    <ScreenScrollView
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
      onRefresh={() => dataQuery.refetch()}
    >
      <View className="gap-4 pb-12">
        <View className="flex-row items-center py-1">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-10 h-10 justify-center items-center rounded-full"
          >
            <Feather name="arrow-left" size={24} color={mflColors.text} />
          </Pressable>
          <AppText className="flex-1 text-xl font-bold text-foreground text-center">
            Team Management
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        <TeamManagementHeader
          data={data}
          canManageTeams={canManageTeams}
          isHost={isHost}
          onCreateTeam={openCreate}
          onUnallocated={() => {
            setSelectedTeam(null);
            setTargetTeamId('');
            setSearch('');
            setSelectedMemberIds([]);
            setPanel('unallocated');
          }}
          onGovernors={() => {
            setSelectedTeam(null);
            setSearch('');
            setPanel('governors');
          }}
          onLeagueInvite={() => {
            setSelectedTeam(null);
            setPanel('invite');
          }}
        />

        {renderPanel()}

        <View className="gap-3">
          <SectionLabel label="Teams" />
          {data.teams.length === 0 ? (
            <Card className="p-5">
              <AppText className="text-sm text-muted text-center">
                No teams yet. Create your first team to get started.
              </AppText>
            </Card>
          ) : (
            data.teams.map((team) => (
              <ManagedTeamCard
                key={team.team_id}
                team={team}
                allocatedMembers={data.members.allocated}
                canManageTeams={canManageTeams}
                canManageLogos={canManageLogos}
                onViewMembers={(teamToView) => openTeamPanel('members', teamToView)}
                onAddMembers={(teamToEdit) => openTeamPanel('addMembers', teamToEdit)}
                onEditName={(teamToEdit) => openTeamPanel('edit', teamToEdit)}
                onAssignCaptain={(teamToEdit) => openTeamPanel('captain', teamToEdit)}
                onViceCaptains={(teamToEdit) => openTeamPanel('viceCaptain', teamToEdit)}
                onInvite={(teamToInvite) => openTeamPanel('invite', teamToInvite)}
                onUploadLogo={pickTeamLogo}
                onRemoveLogo={confirmRemoveLogo}
                onDelete={confirmDeleteTeam}
              />
            ))
          )}
        </View>
      </View>
    </ScreenScrollView>
  );

  function renderPanel() {
    if (!panel) return null;

    if (panel === 'create') {
      return (
        <TeamManagementPanel
          title="Create New Team"
          subtitle={`You can create up to ${data.meta.max_teams} teams. Currently ${data.meta.current_team_count} created.`}
          onClose={closePanel}
        >
          <TeamNameForm
            value={teamName}
            onChange={setTeamName}
            buttonLabel="Create Team"
            isBusy={actions.createTeam.isPending}
            disabled={!data.meta.can_create_more}
            onSubmit={() => {
              const name = teamName.trim();
              if (!name) {
                Alert.alert('Team Name Required', 'Enter a team name.');
                return;
              }
              actions.createTeam.mutate(name, {
                onSuccess: () => {
                  Alert.alert('Team Created', `Team "${name}" created successfully.`);
                  closePanel();
                },
                onError: (error) => Alert.alert('Create Failed', error.message),
              });
            }}
          />
        </TeamManagementPanel>
      );
    }

    if (panel === 'edit' && selectedTeam) {
      return (
        <TeamManagementPanel
          title="Edit Team Name"
          subtitle={`Rename "${selectedTeam.team_name}".`}
          onClose={closePanel}
        >
          <TeamNameForm
            value={teamName}
            onChange={setTeamName}
            buttonLabel="Save"
            isBusy={actions.updateTeamName.isPending}
            onSubmit={() => {
              const name = teamName.trim();
              if (!name) {
                Alert.alert('Team Name Required', 'Enter a team name.');
                return;
              }
              actions.updateTeamName.mutate(
                { teamId: selectedTeam.team_id, teamName: name },
                {
                  onSuccess: () => {
                    Alert.alert('Team Updated', `Team renamed to "${name}".`);
                    closePanel();
                  },
                  onError: (error) => Alert.alert('Save Failed', error.message),
                },
              );
            }}
          />
        </TeamManagementPanel>
      );
    }

    if (panel === 'unallocated') {
      return (
        <UnallocatedPanel
          data={data}
          targetTeamId={targetTeamId}
          selectedMemberIds={selectedMemberIds}
          search={search}
          isBusy={actions.addMember.isPending}
          onClose={closePanel}
          onSearch={setSearch}
          onTargetTeam={setTargetTeamId}
          onToggleMember={toggleMember}
          onAddSelected={() => addSelectedMembers(targetTeamId, data.members.unallocated)}
        />
      );
    }

    if (panel === 'addMembers' && selectedTeam) {
      return (
        <AddMembersPanel
          team={selectedTeam}
          unallocatedMembers={data.members.unallocated}
          leagueCapacity={data.league.league_capacity}
          maxTeams={data.meta.max_teams}
          selectedMemberIds={selectedMemberIds}
          search={search}
          isBusy={actions.addMember.isPending}
          onClose={closePanel}
          onSearch={setSearch}
          onToggleMember={toggleMember}
          onAddSelected={() => addSelectedMembers(selectedTeam.team_id, data.members.unallocated)}
        />
      );
    }

    if (panel === 'members' && selectedTeam) {
      return (
        <MembersPanel
          team={selectedTeam}
          teams={data.teams}
          members={teamMembers}
          isHost={isHost}
          isLoading={teamMembersQuery.isLoading}
          search={search}
          memberToMove={memberToMove}
          targetTeamId={targetTeamId}
          isBusy={
            actions.moveMember.isPending ||
            actions.removeMemberFromLeague.isPending ||
            actions.unassignMember.isPending
          }
          onClose={closePanel}
          onSearch={setSearch}
          onMoveMember={setMemberToMove}
          onTargetTeam={setTargetTeamId}
          onConfirmMove={() => {
            if (!memberToMove || !targetTeamId) return;
            actions.moveMember.mutate(
              { leagueMemberId: memberToMove.league_member_id, teamId: targetTeamId },
              {
                onSuccess: () => {
                  Alert.alert('Member Moved', `${memberToMove.username} moved.`);
                  setMemberToMove(null);
                  setTargetTeamId('');
                  teamMembersQuery.refetch();
                },
                onError: (error) => Alert.alert('Move Failed', error.message),
              },
            );
          }}
          onUnassign={(member) => {
            Alert.alert('Unassign Member', `Move ${member.username} to the unallocated pool?`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Unassign',
                onPress: () => {
                  actions.unassignMember.mutate(
                    {
                      teamId: selectedTeam.team_id,
                      leagueMemberId: member.league_member_id,
                    },
                    {
                      onSuccess: () => teamMembersQuery.refetch(),
                      onError: (error) => Alert.alert('Unassign Failed', error.message),
                    },
                  );
                },
              },
            ]);
          }}
          onRemoveFromLeague={(member) => {
            Alert.alert(
              'Remove Member from League',
              `Remove ${member.username} from this league? This cannot be undone.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => {
                    actions.removeMemberFromLeague.mutate(member.league_member_id, {
                      onSuccess: () => {
                        Alert.alert('Member Removed', `${member.username} removed from league.`);
                        teamMembersQuery.refetch();
                      },
                      onError: (error) => Alert.alert('Remove Failed', error.message),
                    });
                  },
                },
              ],
            );
          }}
        />
      );
    }

    if (panel === 'captain' && selectedTeam) {
      return (
        <CaptainPanel
          team={selectedTeam}
          members={teamMembers}
          isLoading={teamMembersQuery.isLoading}
          selectedMemberIds={selectedMemberIds}
          search={search}
          isBusy={actions.assignCaptain.isPending || actions.removeCaptain.isPending}
          onClose={closePanel}
          onSearch={setSearch}
          onSelect={(userId) => setSelectedMemberIds([userId])}
          onAssign={() => {
            const userId = selectedMemberIds[0];
            if (!userId) return;
            actions.assignCaptain.mutate(
              { teamId: selectedTeam.team_id, userId },
              {
                onSuccess: () => {
                  Alert.alert('Captain Assigned', 'Captain assigned successfully.');
                  teamMembersQuery.refetch();
                },
                onError: (error) => Alert.alert('Assign Failed', error.message),
              },
            );
          }}
          onRemove={() => {
            actions.removeCaptain.mutate(selectedTeam.team_id, {
              onSuccess: () => {
                Alert.alert('Captain Removed', 'Captain removed successfully.');
                teamMembersQuery.refetch();
              },
              onError: (error) => Alert.alert('Remove Failed', error.message),
            });
          }}
        />
      );
    }

    if (panel === 'viceCaptain' && selectedTeam) {
      return (
        <ViceCaptainPanel
          team={selectedTeam}
          members={teamMembers}
          isLoading={teamMembersQuery.isLoading}
          search={search}
          isBusy={actions.assignViceCaptain.isPending || actions.removeViceCaptain.isPending}
          onClose={closePanel}
          onSearch={setSearch}
          onAssign={(userId) => {
            actions.assignViceCaptain.mutate(
              { teamId: selectedTeam.team_id, userId },
              {
                onSuccess: () => teamMembersQuery.refetch(),
                onError: (error) => Alert.alert('Assign Failed', error.message),
              },
            );
          }}
          onRemove={(userId) => {
            actions.removeViceCaptain.mutate(
              { teamId: selectedTeam.team_id, userId },
              {
                onSuccess: () => teamMembersQuery.refetch(),
                onError: (error) => Alert.alert('Remove Failed', error.message),
              },
            );
          }}
        />
      );
    }

    if (panel === 'governors') {
      return (
        <GovernorsPanel
          members={allMembers}
          hostUserId={data.league.host_user_id}
          currentGovernorIds={data.governors.map((governor) => governor.user_id)}
          selectedGovernorIds={selectedGovernorIds}
          search={search}
          isBusy={actions.assignGovernor.isPending || actions.removeGovernor.isPending}
          onClose={closePanel}
          onSearch={setSearch}
          onToggle={(userId) =>
            setSelectedGovernorIds((prev) =>
              prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId],
            )
          }
          onSave={async () => {
            const currentIds = data.governors.map((governor) => governor.user_id);
            const toAdd = selectedGovernorIds.filter((id) => !currentIds.includes(id));
            const toRemove = currentIds.filter((id) => !selectedGovernorIds.includes(id));
            try {
              for (const userId of toAdd) {
                await actions.assignGovernor.mutateAsync(userId);
              }
              for (const userId of toRemove) {
                await actions.removeGovernor.mutateAsync(userId);
              }
              Alert.alert('Governors Updated', 'Governor assignments saved.');
              closePanel();
            } catch (error) {
              Alert.alert(
                'Save Failed',
                error instanceof Error ? error.message : 'Could not save governors.',
              );
            }
          }}
        />
      );
    }

    if (panel === 'invite') {
      return (
        <InvitePanel
          leagueName={data.league.league_name}
          team={selectedTeam}
          inviteCode={selectedTeam?.invite_code || data.league.invite_code || ''}
          memberCount={
            selectedTeam
              ? selectedTeam.member_count
              : data.members.allocated.length + data.members.unallocated.length
          }
          maxCapacity={selectedTeam ? data.league.league_capacity : data.league.league_capacity}
          onClose={closePanel}
        />
      );
    }

    return null;
  }

  async function addSelectedMembers(teamId: string, sourceMembers: ManagedLeagueMember[]) {
    if (!teamId) {
      Alert.alert('Select Team', 'Choose a team first.');
      return;
    }
    if (selectedMemberIds.length === 0) {
      Alert.alert('Select Members', 'Choose at least one member.');
      return;
    }
    try {
      for (const memberId of selectedMemberIds) {
        await actions.addMember.mutateAsync({
          teamId,
          leagueMemberId: memberId,
        });
      }
      const added = sourceMembers.filter((member) =>
        selectedMemberIds.includes(member.league_member_id),
      );
      Alert.alert('Members Added', `${added.length} member(s) added.`);
      closePanel();
    } catch (error) {
      Alert.alert(
        'Add Failed',
        error instanceof Error ? error.message : 'Could not add members.',
      );
    }
  }
}

function TeamNameForm({
  value,
  onChange,
  onSubmit,
  buttonLabel,
  isBusy,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  buttonLabel: string;
  isBusy: boolean;
  disabled?: boolean;
}) {
  return (
    <View className="gap-3">
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChange}
        placeholder="Enter team name"
        placeholderTextColor={mflColors.textMuted}
        maxLength={100}
      />
      <Button
        variant="primary"
        size="lg"
        onPress={onSubmit}
        isDisabled={isBusy || disabled}
      >
        {isBusy ? <Spinner size="sm" /> : <Button.Label>{buttonLabel}</Button.Label>}
      </Button>
    </View>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder = 'Search members...',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      style={inputStyle}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={mflColors.textMuted}
      autoCapitalize="none"
    />
  );
}

function UnallocatedPanel({
  data,
  targetTeamId,
  selectedMemberIds,
  search,
  isBusy,
  onClose,
  onSearch,
  onTargetTeam,
  onToggleMember,
  onAddSelected,
}: {
  data: TeamManagementData;
  targetTeamId: string;
  selectedMemberIds: string[];
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onTargetTeam: (teamId: string) => void;
  onToggleMember: (memberId: string) => void;
  onAddSelected: () => void;
}) {
  const filtered = searchMembers(data.members.unallocated, search);
  return (
    <TeamManagementPanel
      title="Unallocated Members"
      subtitle={`${data.members.unallocated.length} member(s) are not assigned to a team.`}
      onClose={onClose}
    >
      <TeamChips
        teams={data.teams}
        selectedTeamId={targetTeamId}
        onSelect={onTargetTeam}
      />
      <SearchInput value={search} onChange={onSearch} />
      <SelectableMembers
        members={filtered}
        selectedIds={selectedMemberIds}
        onToggle={onToggleMember}
      />
      <Button
        variant="primary"
        size="lg"
        onPress={onAddSelected}
        isDisabled={isBusy || !targetTeamId || selectedMemberIds.length === 0}
      >
        {isBusy ? <Spinner size="sm" /> : <Button.Label>Add Members</Button.Label>}
      </Button>
    </TeamManagementPanel>
  );
}

function AddMembersPanel({
  team,
  unallocatedMembers,
  leagueCapacity,
  maxTeams,
  selectedMemberIds,
  search,
  isBusy,
  onClose,
  onSearch,
  onToggleMember,
  onAddSelected,
}: {
  team: ManagedTeam;
  unallocatedMembers: ManagedLeagueMember[];
  leagueCapacity: number;
  maxTeams: number;
  selectedMemberIds: string[];
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onToggleMember: (memberId: string) => void;
  onAddSelected: () => void;
}) {
  const capacity = getPerTeamCapacity({ leagueCapacity, maxTeams });
  const remaining = Math.max(0, capacity - team.member_count);
  const filtered = searchMembers(unallocatedMembers, search);

  return (
    <TeamManagementPanel
      title={`Add Members to ${team.team_name}`}
      subtitle={`${remaining} slot(s) remaining. ${unallocatedMembers.length} unallocated member(s).`}
      onClose={onClose}
    >
      <SearchInput value={search} onChange={onSearch} />
      <SelectableMembers
        members={filtered}
        selectedIds={selectedMemberIds}
        onToggle={onToggleMember}
      />
      <Button
        variant="primary"
        size="lg"
        onPress={onAddSelected}
        isDisabled={isBusy || selectedMemberIds.length === 0 || remaining <= 0}
      >
        {isBusy ? <Spinner size="sm" /> : <Button.Label>Add Members</Button.Label>}
      </Button>
    </TeamManagementPanel>
  );
}

function SelectableMembers({
  members,
  selectedIds,
  onToggle,
}: {
  members: ManagedLeagueMember[];
  selectedIds: string[];
  onToggle: (memberId: string) => void;
}) {
  if (members.length === 0) {
    return (
      <Card className="p-4">
        <AppText className="text-sm text-muted text-center">No members found.</AppText>
      </Card>
    );
  }
  return (
    <View className="gap-2">
      {members.map((member) => (
        <MemberListRow
          key={member.league_member_id}
          name={member.username}
          email={member.email}
          roles={member.roles}
          points={member.points}
          selected={selectedIds.includes(member.league_member_id)}
          onPress={() => onToggle(member.league_member_id)}
        />
      ))}
    </View>
  );
}

function TeamChips({
  teams,
  selectedTeamId,
  onSelect,
}: {
  teams: ManagedTeam[];
  selectedTeamId: string;
  onSelect: (teamId: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {teams.map((team) => (
        <ActionButton
          key={team.team_id}
          label={team.team_name}
          icon={selectedTeamId === team.team_id ? 'check' : 'circle'}
          variant={selectedTeamId === team.team_id ? 'primary' : 'secondary'}
          onPress={() => onSelect(team.team_id)}
        />
      ))}
    </View>
  );
}

function MembersPanel({
  team,
  teams,
  members,
  isHost,
  isLoading,
  search,
  memberToMove,
  targetTeamId,
  isBusy,
  onClose,
  onSearch,
  onMoveMember,
  onTargetTeam,
  onConfirmMove,
  onUnassign,
  onRemoveFromLeague,
}: {
  team: ManagedTeam;
  teams: ManagedTeam[];
  members: ManagedTeamMember[];
  isHost: boolean;
  isLoading: boolean;
  search: string;
  memberToMove: ManagedTeamMember | null;
  targetTeamId: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onMoveMember: (member: ManagedTeamMember | null) => void;
  onTargetTeam: (teamId: string) => void;
  onConfirmMove: () => void;
  onUnassign: (member: ManagedTeamMember) => void;
  onRemoveFromLeague: (member: ManagedTeamMember) => void;
}) {
  const filtered = searchMembers(members, search);
  return (
    <TeamManagementPanel
      title={`${team.team_name} - Members`}
      subtitle={`${members.length} member(s) in this team${
        team.captain ? ` | Captain: ${team.captain.username}` : ''
      }`}
      onClose={onClose}
    >
      <SearchInput value={search} onChange={onSearch} />
      {isLoading ? (
        <View className="items-center py-6 gap-2">
          <Spinner size="sm" />
          <AppText className="text-sm text-muted">Loading members...</AppText>
        </View>
      ) : filtered.length === 0 ? (
        <Card className="p-4">
          <AppText className="text-sm text-muted text-center">No members found.</AppText>
        </Card>
      ) : (
        <View className="gap-2">
          {filtered.map((member) => (
            <View key={member.league_member_id} className="gap-2">
              <MemberListRow
                name={member.username}
                email={member.email}
                roles={member.roles}
                captain={member.is_captain}
                points={member.points}
              />
              {isHost ? (
                <View className="flex-row flex-wrap gap-2">
                  <ActionButton
                    label="Move"
                    icon="arrow-right"
                    onPress={() => onMoveMember(member)}
                  />
                  <ActionButton
                    label="Unassign"
                    icon="log-out"
                    onPress={() => onUnassign(member)}
                  />
                  <ActionButton
                    label="Remove from League"
                    icon="trash-2"
                    variant="danger"
                    onPress={() => onRemoveFromLeague(member)}
                  />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}
      {memberToMove ? (
        <Card className="p-3 gap-3">
          <AppText className="text-sm font-semibold text-foreground">
            Move {memberToMove.username}
          </AppText>
          <TeamChips
            teams={teams.filter((otherTeam) => otherTeam.team_id !== team.team_id)}
            selectedTeamId={targetTeamId}
            onSelect={onTargetTeam}
          />
          <Button
            variant="primary"
            size="md"
            onPress={onConfirmMove}
            isDisabled={isBusy || !targetTeamId}
          >
            {isBusy ? <Spinner size="sm" /> : <Button.Label>Move Member</Button.Label>}
          </Button>
        </Card>
      ) : null}
    </TeamManagementPanel>
  );
}

function CaptainPanel({
  team,
  members,
  isLoading,
  selectedMemberIds,
  search,
  isBusy,
  onClose,
  onSearch,
  onSelect,
  onAssign,
  onRemove,
}: {
  team: ManagedTeam;
  members: ManagedTeamMember[];
  isLoading: boolean;
  selectedMemberIds: string[];
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onSelect: (userId: string) => void;
  onAssign: () => void;
  onRemove: () => void;
}) {
  const filtered = searchMembers(members, search);
  const currentCaptain = members.find((member) => member.is_captain);
  return (
    <TeamManagementPanel
      title={`Assign Captain for ${team.team_name}`}
      subtitle="The captain can validate submissions from team members."
      onClose={onClose}
    >
      <SearchInput value={search} onChange={onSearch} placeholder="Search team members..." />
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <View className="gap-2">
          {filtered.map((member) => (
            <MemberListRow
              key={member.user_id}
              name={member.username}
              email={member.email}
              roles={member.roles}
              captain={member.is_captain}
              selected={selectedMemberIds[0] === member.user_id}
              onPress={() => onSelect(member.user_id)}
            />
          ))}
        </View>
      )}
      <View className="flex-row gap-3">
        {currentCaptain ? (
          <Button variant="secondary" size="lg" onPress={onRemove} isDisabled={isBusy} className="flex-1">
            <Button.Label>Remove Captain</Button.Label>
          </Button>
        ) : null}
        <Button
          variant="primary"
          size="lg"
          onPress={onAssign}
          isDisabled={isBusy || !selectedMemberIds[0]}
          className="flex-1"
        >
          {isBusy ? <Spinner size="sm" /> : <Button.Label>Assign Captain</Button.Label>}
        </Button>
      </View>
    </TeamManagementPanel>
  );
}

function ViceCaptainPanel({
  team,
  members,
  isLoading,
  search,
  isBusy,
  onClose,
  onSearch,
  onAssign,
  onRemove,
}: {
  team: ManagedTeam;
  members: ManagedTeamMember[];
  isLoading: boolean;
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onAssign: (userId: string) => void;
  onRemove: (userId: string) => void;
}) {
  const current = members.filter((member) => member.roles.includes('vice_captain'));
  const eligible = searchMembers(
    members.filter(
      (member) =>
        !member.roles.includes('captain') && !member.roles.includes('vice_captain'),
    ),
    search,
  );

  return (
    <TeamManagementPanel
      title={`Vice Captains - ${team.team_name}`}
      subtitle="Vice captains can validate submissions, manage team members, and act for the captain."
      onClose={onClose}
    >
      {current.length > 0 ? (
        <View className="gap-2">
          <SectionLabel label="Current Vice Captains" />
          {current.map((member) => (
            <MemberListRow
              key={member.user_id}
              name={member.username}
              email={member.email}
              roles={member.roles}
              right={
                <ActionButton
                  label="Remove"
                  icon="x"
                  variant="danger"
                  disabled={isBusy}
                  onPress={() => onRemove(member.user_id)}
                />
              }
            />
          ))}
        </View>
      ) : null}
      <SearchInput value={search} onChange={onSearch} placeholder="Search members to add..." />
      {isLoading ? (
        <Spinner size="sm" />
      ) : eligible.length === 0 ? (
        <Card className="p-4">
          <AppText className="text-sm text-muted text-center">No eligible members.</AppText>
        </Card>
      ) : (
        <View className="gap-2">
          {eligible.map((member) => (
            <MemberListRow
              key={member.user_id}
              name={member.username}
              email={member.email}
              roles={member.roles}
              right={
                <ActionButton
                  label="Add"
                  icon="plus"
                  disabled={isBusy}
                  onPress={() => onAssign(member.user_id)}
                />
              }
            />
          ))}
        </View>
      )}
    </TeamManagementPanel>
  );
}

function GovernorsPanel({
  members,
  hostUserId,
  currentGovernorIds,
  selectedGovernorIds,
  search,
  isBusy,
  onClose,
  onSearch,
  onToggle,
  onSave,
}: {
  members: ManagedLeagueMember[];
  hostUserId: string;
  currentGovernorIds: string[];
  selectedGovernorIds: string[];
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onToggle: (userId: string) => void;
  onSave: () => void;
}) {
  const eligible = searchMembers(
    members.filter((member) => member.user_id !== hostUserId),
    search,
  );
  return (
    <TeamManagementPanel
      title="Manage Governors"
      subtitle="Governors have oversight of all teams and can validate any submission."
      onClose={onClose}
    >
      <SearchInput value={search} onChange={onSearch} placeholder="Search league members..." />
      <View className="gap-2">
        {eligible.map((member) => (
          <MemberListRow
            key={member.user_id}
            name={member.username}
            email={member.email}
            roles={member.roles}
            points={member.points}
            selected={selectedGovernorIds.includes(member.user_id)}
            onPress={() => onToggle(member.user_id)}
          />
        ))}
      </View>
      <AppText className="text-xs text-muted">
        Current governors selected: {currentGovernorIds.length}
      </AppText>
      <Button variant="primary" size="lg" onPress={onSave} isDisabled={isBusy}>
        {isBusy ? <Spinner size="sm" /> : <Button.Label>Save Changes</Button.Label>}
      </Button>
    </TeamManagementPanel>
  );
}

function InvitePanel({
  leagueName,
  team,
  inviteCode,
  memberCount,
  maxCapacity,
  onClose,
}: {
  leagueName: string;
  team: ManagedTeam | null;
  inviteCode: string;
  memberCount: number;
  maxCapacity: number;
  onClose: () => void;
}) {
  const invitePath = team ? `/invite/team/${inviteCode}` : `/invite/${inviteCode}`;
  const label = team ? `Join ${team.team_name}` : `Join ${leagueName}`;
  const shareText = team
    ? `Join my team "${team.team_name}" in ${leagueName} on MyFitnessLeague. Use code: ${inviteCode}`
    : `Join ${leagueName} on MyFitnessLeague. Use code: ${inviteCode}`;

  return (
    <TeamManagementPanel
      title={team ? 'Invite to Team' : 'League Invite'}
      subtitle={`${memberCount} / ${maxCapacity} members`}
      onClose={onClose}
    >
      <Card className="p-4 gap-2">
        <AppText className="text-xs text-muted">Invite Code</AppText>
        <AppText className="text-2xl font-bold text-foreground text-center tracking-widest">
          {inviteCode || 'No code'}
        </AppText>
      </Card>
      <AppText className="text-xs text-muted">Path: {invitePath}</AppText>
      <Button
        variant="primary"
        size="lg"
        onPress={() =>
          Share.share({
            title: label,
            message: `${shareText}\n${invitePath}`,
          })
        }
        isDisabled={!inviteCode}
      >
        <Button.Label>Share Invite</Button.Label>
      </Button>
    </TeamManagementPanel>
  );
}
