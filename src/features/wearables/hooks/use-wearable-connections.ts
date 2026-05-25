import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  fetchWearableConnections,
  registerHealthConnect,
  registerHealthKit,
  deleteWearableConnection,
  syncHealthConnect,
  syncHealthKit,
} from '../services/wearable.service';
import { toWearableConnection } from '../mappers/wearable.mapper';
import type { WearableConnection, SyncResult } from '../types/wearable.model';
import type { NormalizedActivityDTO } from '../types/wearable.dto';

export function useWearableConnections(leagueId: string) {
  return useQuery<WearableConnection[]>({
    queryKey: queryKeys.leagues.wearableConnections(leagueId),
    queryFn: async () => {
      const dto = await fetchWearableConnections(leagueId);
      return dto.data.connections.map(toWearableConnection);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRegisterHealthConnect() {
  const queryClient = useQueryClient();

  return useMutation<
    { connectionId: string },
    Error,
    { leagueId: string; deviceName?: string; androidVersion?: string }
  >({
    mutationFn: async ({ leagueId, ...data }) => {
      const res = await registerHealthConnect(leagueId, data);
      return { connectionId: res.data.connection_id };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.wearableConnections(variables.leagueId),
      });
    },
  });
}

export function useRegisterHealthKit() {
  const queryClient = useQueryClient();

  return useMutation<
    { connectionId: string },
    Error,
    { leagueId: string; deviceName?: string; iosVersion?: string }
  >({
    mutationFn: async ({ leagueId, ...data }) => {
      const res = await registerHealthKit(leagueId, data);
      return { connectionId: res.data.connection_id };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.wearableConnections(variables.leagueId),
      });
    },
  });
}

export function useDeleteWearableConnection() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    { leagueId: string; connectionId: string }
  >({
    mutationFn: async ({ leagueId, connectionId }) => {
      return deleteWearableConnection(leagueId, connectionId);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.wearableConnections(variables.leagueId),
      });
    },
  });
}

export function useSyncHealthConnect() {
  const queryClient = useQueryClient();

  return useMutation<
    SyncResult,
    Error,
    {
      leagueId: string;
      activities: NormalizedActivityDTO[];
      connectionId?: string | null;
    }
  >({
    mutationFn: async ({ leagueId, activities, connectionId }) => {
      const res = await syncHealthConnect(leagueId, activities, connectionId);
      return { imported: res.data.imported, duplicates: res.data.duplicates };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.wearableConnections(variables.leagueId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.pendingConfirmations(variables.leagueId),
      });
    },
  });
}

export function useSyncHealthKit() {
  const queryClient = useQueryClient();

  return useMutation<
    SyncResult,
    Error,
    {
      leagueId: string;
      activities: NormalizedActivityDTO[];
      connectionId?: string | null;
    }
  >({
    mutationFn: async ({ leagueId, activities, connectionId }) => {
      const res = await syncHealthKit(leagueId, activities, connectionId);
      return { imported: res.data.imported, duplicates: res.data.duplicates };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.wearableConnections(variables.leagueId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leagues.pendingConfirmations(variables.leagueId),
      });
    },
  });
}
