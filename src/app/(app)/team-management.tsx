import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from 'heroui-native';

import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { ScreenState } from '../../components/screen-state';
import { SectionLabel } from '../../components/section-label';
import { mflColors } from '../../constants/colors';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import { ManagedTeamCard } from '../../features/team-management/components/managed-team-card';
import { TeamManagementHeader } from '../../features/team-management/components/team-management-header';
import { AddMembersPanel } from '../../features/team-management/components/add-members-panel';
import { TeamManagementPanel } from '../../features/team-management/components/team-management-panel';
import { CaptainPanel } from '../../features/team-management/components/captain-panel';
import { GovernorsPanel } from '../../features/team-management/components/governors-panel';
import { InvitePanel } from '../../features/team-management/components/invite-panel';
import { MembersPanel } from '../../features/team-management/components/members-panel';
import { PreRegisterPanel } from '../../features/team-management/components/pre-register-panel';
import { TeamNameForm } from '../../features/team-management/components/team-name-form';
import { UnallocatedPanel } from '../../features/team-management/components/unallocated-panel';
import { ViceCaptainPanel } from '../../features/team-management/components/vice-captain-panel';
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
} from '../../features/team-management/types/team-management';

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
  | 'preRegister'
  | null;


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
    const assetWithMime = asset as typeof asset & { mimeType?: string };
    const file: PickedTeamLogo = {
      uri: asset.uri,
      name: asset.fileName ?? `team_logo_${Date.now()}.jpg`,
      type: assetWithMime.mimeType?.startsWith('image/')
        ? assetWithMime.mimeType
        : 'image/jpeg',
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
          onPreRegister={() => {
            setSelectedTeam(null);
            setPanel('preRegister');
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

    if (panel === 'preRegister' && isHost) {
      return (
        <PreRegisterPanel
          isBusy={actions.preRegisterMember.isPending}
          onClose={closePanel}
          onSubmit={(email) => {
            const normalizedEmail = email.trim();
            if (!normalizedEmail) {
              Alert.alert('Email Required', 'Enter an email address.');
              return;
            }

            actions.preRegisterMember.mutate(
              { email: normalizedEmail },
              {
                onSuccess: () => {
                  closePanel();
                },
              },
            );
          }}
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
