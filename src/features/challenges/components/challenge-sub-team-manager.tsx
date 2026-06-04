import Feather from '@expo/vector-icons/Feather';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type {
  Challenge,
  ChallengeSubTeamDetails,
  ChallengeTeam,
} from '../types/challenge.model';
import {
  useChallengeSubTeamManager,
  useChallengeTeamMembers,
  useSubTeamAdminActions,
} from '../hooks/use-configure-challenges';

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontSize: 15,
  color: mflColors.text,
};

interface ChallengeSubTeamManagerProps {
  leagueId: string;
  challenge: Challenge;
  teams: ChallengeTeam[];
  onClose: () => void;
}

export function ChallengeSubTeamManager({
  leagueId,
  challenge,
  teams,
  onClose,
}: ChallengeSubTeamManagerProps) {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubTeam, setEditingSubTeam] = useState<ChallengeSubTeamDetails | null>(null);
  const [name, setName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const subTeamsQuery = useChallengeSubTeamManager(
    leagueId,
    challenge.challengeId,
    selectedTeamId,
  );
  const membersQuery = useChallengeTeamMembers(leagueId, selectedTeamId);
  const actions = useSubTeamAdminActions(leagueId, challenge.challengeId);

  const subTeams = subTeamsQuery.data ?? [];
  const members = membersQuery.data ?? [];

  useEffect(() => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(teams[0]!.teamId);
    }
  }, [selectedTeamId, teams]);

  useEffect(() => {
    setShowForm(false);
    setEditingSubTeam(null);
    setName('');
    setSelectedMembers([]);
  }, [selectedTeamId]);

  const membersInOtherSubTeams = useMemo(() => {
    const assigned = new Set<string>();
    subTeams.forEach((subTeam) => {
      if (subTeam.subTeamId === editingSubTeam?.subTeamId) return;
      subTeam.members.forEach((member) => assigned.add(member.leagueMemberId));
    });
    return assigned;
  }, [editingSubTeam?.subTeamId, subTeams]);

  const startCreate = () => {
    setEditingSubTeam(null);
    setName('');
    setSelectedMembers([]);
    setShowForm(true);
  };

  const startEdit = (subTeam: ChallengeSubTeamDetails) => {
    setEditingSubTeam(subTeam);
    setName(subTeam.name);
    setSelectedMembers(subTeam.members.map((member) => member.leagueMemberId));
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSubTeam(null);
    setName('');
    setSelectedMembers([]);
  };

  const toggleMember = (leagueMemberId: string) => {
    if (membersInOtherSubTeams.has(leagueMemberId)) return;
    setSelectedMembers((current) =>
      current.includes(leagueMemberId)
        ? current.filter((id) => id !== leagueMemberId)
        : [...current, leagueMemberId],
    );
  };

  const handleSave = async () => {
    if (!selectedTeamId) {
      Alert.alert('Select Team', 'Choose a team before creating a sub-team.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Name Required', 'Sub-team name is required.');
      return;
    }

    try {
      if (editingSubTeam) {
        await actions.updateMutation.mutateAsync({
          subTeamId: editingSubTeam.subTeamId,
          input: {
            name: name.trim(),
            memberIds: selectedMembers,
          },
        });
        Alert.alert('Sub-Team Updated', 'The sub-team has been updated.');
      } else {
        await actions.createMutation.mutateAsync({
          teamId: selectedTeamId,
          name: name.trim(),
          memberIds: selectedMembers,
        });
        Alert.alert('Sub-Team Created', 'The sub-team has been created.');
      }
      await subTeamsQuery.refetch();
      resetForm();
    } catch (error) {
      Alert.alert('Save Failed', error instanceof Error ? error.message : 'Failed to save sub-team.');
    }
  };

  const handleDelete = (subTeam: ChallengeSubTeamDetails) => {
    Alert.alert('Delete Sub-Team?', `Delete "${subTeam.name}" from this challenge?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await actions.deleteMutation.mutateAsync(subTeam.subTeamId);
            await subTeamsQuery.refetch();
            Alert.alert('Sub-Team Deleted', 'The sub-team has been deleted.');
          } catch (error) {
            Alert.alert('Delete Failed', error instanceof Error ? error.message : 'Failed to delete sub-team.');
          }
        },
      },
    ]);
  };

  const isSaving =
    actions.createMutation.isPending ||
    actions.updateMutation.isPending ||
    actions.deleteMutation.isPending;

  return (
    <Card className="p-4 gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText className="text-lg font-bold text-foreground">Sub-Team Management</AppText>
          <AppText className="text-xs text-muted mt-1">
            Create and manage sub-teams for {challenge.name}.
          </AppText>
        </View>
        <Button variant="secondary" size="sm" onPress={onClose}>
          <Button.Label>Close</Button.Label>
        </Button>
      </View>

      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Team</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-4">
            {teams.map((team) => (
              <Pressable
                key={team.teamId}
                onPress={() => setSelectedTeamId(team.teamId)}
                className="rounded-full border px-4 py-2"
                style={{
                  backgroundColor: selectedTeamId === team.teamId ? mflColors.brand : mflColors.card,
                  borderColor: selectedTeamId === team.teamId ? mflColors.brand : mflColors.border,
                }}
              >
                <AppText
                  className="text-sm font-semibold"
                  style={{ color: selectedTeamId === team.teamId ? '#fff' : mflColors.text }}
                >
                  {team.teamName}
                </AppText>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {selectedTeamId ? (
        <Button variant="primary" size="md" onPress={startCreate}>
          <Feather name="plus" size={16} color="#fff" />
          <Button.Label>Create Sub-Team</Button.Label>
        </Button>
      ) : null}

      {showForm ? (
        <View className="rounded-xl border border-default-200 p-3 gap-3">
          <AppText className="text-base font-bold text-foreground">
            {editingSubTeam ? 'Edit Sub-Team' : 'Create Sub-Team'}
          </AppText>
          <View className="gap-2">
            <AppText className="text-xs font-semibold text-muted uppercase">Name</AppText>
            <TextInput
              style={inputStyle}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Team Alpha"
              placeholderTextColor={mflColors.textMuted}
            />
          </View>

          <View className="gap-2">
            <AppText className="text-xs font-semibold text-muted uppercase">Members</AppText>
            {membersQuery.isLoading ? (
              <View className="items-center py-4">
                <Spinner size="sm" />
              </View>
            ) : members.length === 0 ? (
              <AppText className="text-xs text-muted">No members available for this team.</AppText>
            ) : (
              <View className="gap-2">
                {members.map((member) => {
                  const selected = selectedMembers.includes(member.leagueMemberId);
                  const blocked = membersInOtherSubTeams.has(member.leagueMemberId);
                  return (
                    <Pressable
                      key={member.leagueMemberId}
                      onPress={() => toggleMember(member.leagueMemberId)}
                      disabled={blocked}
                      className="flex-row items-center gap-3 rounded-xl border p-3"
                      style={{
                        opacity: blocked ? 0.55 : 1,
                        borderColor: selected ? mflColors.brand : mflColors.border,
                        backgroundColor: selected ? mflColors.brandLight : mflColors.card,
                      }}
                    >
                      <Feather
                        name={selected ? 'check-square' : 'square'}
                        size={18}
                        color={selected ? mflColors.brand : mflColors.textMuted}
                      />
                      <View className="flex-1">
                        <AppText className="text-sm font-semibold text-foreground">
                          {member.fullName}
                        </AppText>
                        {blocked ? (
                          <AppText className="text-xs text-muted mt-0.5">
                            Already in another sub-team
                          </AppText>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View className="flex-row gap-3">
            <Button variant="secondary" size="md" onPress={resetForm} className="flex-1">
              <Button.Label>Cancel</Button.Label>
            </Button>
            <Button
              variant="primary"
              size="md"
              onPress={handleSave}
              isDisabled={isSaving || !name.trim()}
              className="flex-1"
            >
              {isSaving ? <Spinner size="sm" /> : <Button.Label>{editingSubTeam ? 'Update' : 'Create'}</Button.Label>}
            </Button>
          </View>
        </View>
      ) : null}

      {subTeamsQuery.isLoading ? (
        <View className="items-center py-4">
          <Spinner size="sm" />
        </View>
      ) : subTeams.length === 0 ? (
        <View className="rounded-xl border border-dashed border-default-200 p-4">
          <AppText className="text-sm text-muted text-center">No sub-teams created for this team.</AppText>
        </View>
      ) : (
        <View className="gap-3">
          {subTeams.map((subTeam) => (
            <View key={subTeam.subTeamId} className="rounded-xl border border-default-200 p-3 gap-2">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <AppText className="text-sm font-bold text-foreground">{subTeam.name}</AppText>
                  <AppText className="text-xs text-muted mt-1">
                    {subTeam.members.length > 0
                      ? subTeam.members.map((member) => member.fullName).join(', ')
                      : 'No members'}
                  </AppText>
                </View>
                <View className="flex-row gap-2">
                  <Button variant="secondary" size="sm" onPress={() => startEdit(subTeam)}>
                    <Button.Label>Edit</Button.Label>
                  </Button>
                  <Button variant="secondary" size="sm" onPress={() => handleDelete(subTeam)}>
                    <Button.Label style={{ color: mflColors.danger }}>Delete</Button.Label>
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}
