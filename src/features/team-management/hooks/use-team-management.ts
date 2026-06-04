import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addManagedMemberToTeam,
  assignManagedCaptain,
  assignManagedGovernor,
  assignManagedViceCaptain,
  createManagedTeam,
  deleteManagedTeam,
  fetchManagedTeamMembers,
  fetchTeamManagementData,
  moveManagedMember,
  removeManagedCaptain,
  removeManagedGovernor,
  removeManagedMemberFromLeague,
  removeManagedTeamLogo,
  removeManagedViceCaptain,
  unassignManagedMemberFromTeam,
  updateManagedTeamName,
  uploadManagedTeamLogo,
} from '../services/team-management.service';
import type {
  PickedTeamLogo,
  TeamManagementData,
  ManagedTeamMember,
} from '../types/team-management';

const teamManagementKey = (leagueId: string) =>
  ['leagues', leagueId, 'team-management'] as const;

const teamMembersKey = (leagueId: string, teamId: string) =>
  ['leagues', leagueId, 'team-management', 'teams', teamId, 'members'] as const;

export function useTeamManagementData(leagueId: string) {
  return useQuery<TeamManagementData>({
    queryKey: teamManagementKey(leagueId),
    queryFn: async () => {
      const dto = await fetchTeamManagementData(leagueId);
      return dto.data;
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}

export function useManagedTeamMembers(
  leagueId: string,
  teamId: string,
  enabled: boolean,
) {
  return useQuery<ManagedTeamMember[]>({
    queryKey: teamMembersKey(leagueId, teamId),
    queryFn: () => fetchManagedTeamMembers(leagueId, teamId),
    enabled: !!leagueId && !!teamId && enabled,
    staleTime: 30 * 1000,
  });
}

export function useTeamManagementActions(leagueId: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: teamManagementKey(leagueId) });
  };

  return {
    createTeam: useMutation<void, Error, string>({
      mutationFn: async (teamName) => {
        await createManagedTeam(leagueId, teamName);
      },
      onSuccess: invalidate,
    }),
    updateTeamName: useMutation<void, Error, { teamId: string; teamName: string }>({
      mutationFn: async ({ teamId, teamName }) => {
        await updateManagedTeamName(leagueId, teamId, teamName);
      },
      onSuccess: invalidate,
    }),
    deleteTeam: useMutation<void, Error, string>({
      mutationFn: async (teamId) => {
        await deleteManagedTeam(leagueId, teamId);
      },
      onSuccess: invalidate,
    }),
    addMember: useMutation<void, Error, { teamId: string; leagueMemberId: string }>({
      mutationFn: async ({ teamId, leagueMemberId }) => {
        await addManagedMemberToTeam(leagueId, teamId, leagueMemberId);
      },
      onSuccess: invalidate,
    }),
    unassignMember: useMutation<void, Error, { teamId: string; leagueMemberId: string }>({
      mutationFn: async ({ teamId, leagueMemberId }) => {
        await unassignManagedMemberFromTeam(leagueId, teamId, leagueMemberId);
      },
      onSuccess: async (_data, { teamId }) => {
        await invalidate();
        await queryClient.invalidateQueries({
          queryKey: teamMembersKey(leagueId, teamId),
        });
      },
    }),
    moveMember: useMutation<void, Error, { leagueMemberId: string; teamId: string }>({
      mutationFn: async ({ leagueMemberId, teamId }) => {
        await moveManagedMember(leagueId, leagueMemberId, teamId);
      },
      onSuccess: invalidate,
    }),
    removeMemberFromLeague: useMutation<void, Error, string>({
      mutationFn: async (leagueMemberId) => {
        await removeManagedMemberFromLeague(leagueId, leagueMemberId);
      },
      onSuccess: invalidate,
    }),
    assignCaptain: useMutation<void, Error, { teamId: string; userId: string }>({
      mutationFn: async ({ teamId, userId }) => {
        await assignManagedCaptain(leagueId, teamId, userId);
      },
      onSuccess: async (_data, { teamId }) => {
        await invalidate();
        await queryClient.invalidateQueries({
          queryKey: teamMembersKey(leagueId, teamId),
        });
      },
    }),
    removeCaptain: useMutation<void, Error, string>({
      mutationFn: async (teamId) => {
        await removeManagedCaptain(leagueId, teamId);
      },
      onSuccess: async (_data, teamId) => {
        await invalidate();
        await queryClient.invalidateQueries({
          queryKey: teamMembersKey(leagueId, teamId),
        });
      },
    }),
    assignViceCaptain: useMutation<void, Error, { teamId: string; userId: string }>({
      mutationFn: async ({ teamId, userId }) => {
        await assignManagedViceCaptain(leagueId, teamId, userId);
      },
      onSuccess: async (_data, { teamId }) => {
        await invalidate();
        await queryClient.invalidateQueries({
          queryKey: teamMembersKey(leagueId, teamId),
        });
      },
    }),
    removeViceCaptain: useMutation<void, Error, { teamId: string; userId: string }>({
      mutationFn: async ({ teamId, userId }) => {
        await removeManagedViceCaptain(leagueId, teamId, userId);
      },
      onSuccess: async (_data, { teamId }) => {
        await invalidate();
        await queryClient.invalidateQueries({
          queryKey: teamMembersKey(leagueId, teamId),
        });
      },
    }),
    assignGovernor: useMutation<void, Error, string>({
      mutationFn: async (userId) => {
        await assignManagedGovernor(leagueId, userId);
      },
      onSuccess: invalidate,
    }),
    removeGovernor: useMutation<void, Error, string>({
      mutationFn: async (userId) => {
        await removeManagedGovernor(leagueId, userId);
      },
      onSuccess: invalidate,
    }),
    uploadLogo: useMutation<void, Error, { teamId: string; file: PickedTeamLogo }>({
      mutationFn: async ({ teamId, file }) => {
        await uploadManagedTeamLogo(leagueId, teamId, file);
      },
      onSuccess: invalidate,
    }),
    removeLogo: useMutation<void, Error, string>({
      mutationFn: async (teamId) => {
        await removeManagedTeamLogo(leagueId, teamId);
      },
      onSuccess: invalidate,
    }),
  };
}
