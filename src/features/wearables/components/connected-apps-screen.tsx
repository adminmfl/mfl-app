import { useCallback, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { AppText } from '../../../components/app-text';
import { useLeagueContext } from '../../../contexts/league-context';
import { mflColors } from '../../../constants/colors';
import { useHealthConnect } from '../hooks/use-health-connect';
import {
  useWearableConnections,
  useRegisterHealthConnect,
  useDeleteWearableConnection,
  useSyncHealthConnect,
} from '../hooks/use-wearable-connections';
import {
  usePendingConfirmations,
  useConfirmWorkout,
  useRejectWorkout,
} from '../hooks/use-pending-confirmations';
import { HealthConnectCard } from './health-connect-card';
import { PendingConfirmationCard } from './pending-confirmation-card';

export function ConnectedAppsScreen() {
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const hc = useHealthConnect();
  const connectionsQuery = useWearableConnections(leagueId);
  const pendingQuery = usePendingConfirmations(leagueId);

  const registerMutation = useRegisterHealthConnect();
  const deleteMutation = useDeleteWearableConnection();
  const syncMutation = useSyncHealthConnect();
  const confirmMutation = useConfirmWorkout();
  const rejectMutation = useRejectWorkout();

  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const hcConnection = connectionsQuery.data?.find((c) => c.provider === 'health_connect') ?? null;

  const handleConnect = useCallback(async () => {
    const granted = await hc.requestPermissions();
    if (!granted) {
      Alert.alert('Permission Required', 'Health Connect permissions are needed to sync workouts.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        leagueId,
        deviceName: Platform.OS === 'android' ? `Android ${Platform.Version}` : undefined,
        androidVersion: Platform.OS === 'android' ? String(Platform.Version) : undefined,
      });
    } catch {
      Alert.alert('Error', 'Failed to register Health Connect with server.');
    }
  }, [hc, registerMutation, leagueId]);

  const handleSync = useCallback(async () => {
    try {
      const activities = await hc.readRecentWorkouts(7);
      if (activities.length === 0) {
        Alert.alert('No Workouts', 'No new workouts found in Health Connect for the last 7 days.');
        setLastSyncCount(0);
        return;
      }

      const result = await syncMutation.mutateAsync({ leagueId, activities });
      setLastSyncCount(result.imported);

      if (result.imported > 0) {
        Alert.alert(
          'Sync Complete',
          `${result.imported} workout${result.imported !== 1 ? 's' : ''} imported.${
            result.duplicates > 0 ? ` ${result.duplicates} duplicate(s) skipped.` : ''
          }`,
        );
      } else {
        Alert.alert('Sync Complete', 'No new workouts to import. All are already synced.');
      }
    } catch {
      Alert.alert('Sync Failed', 'Failed to sync workouts. Please try again.');
    }
  }, [hc, syncMutation, leagueId]);

  const handleDisconnect = useCallback(async () => {
    await hc.disconnect();
    if (hcConnection) {
      try {
        await deleteMutation.mutateAsync({
          leagueId,
          connectionId: hcConnection.connectionId,
        });
      } catch {
        // Connection removed locally even if server fails
      }
    }
  }, [hc, hcConnection, deleteMutation, leagueId]);

  const handleConfirm = useCallback(
    async (workoutId: string) => {
      setConfirmingId(workoutId);
      try {
        const result = await confirmMutation.mutateAsync({ leagueId, workoutId });
        Alert.alert('Confirmed', `${result.pointsAwarded} point${result.pointsAwarded !== 1 ? 's' : ''} awarded!`);
      } catch {
        Alert.alert('Error', 'Failed to confirm workout.');
      } finally {
        setConfirmingId(null);
      }
    },
    [confirmMutation, leagueId],
  );

  const handleReject = useCallback(
    async (workoutId: string) => {
      setRejectingId(workoutId);
      try {
        await rejectMutation.mutateAsync({ leagueId, workoutId });
      } catch {
        Alert.alert('Error', 'Failed to reject workout.');
      } finally {
        setRejectingId(null);
      }
    },
    [rejectMutation, leagueId],
  );

  const handleRefresh = useCallback(async () => {
    await Promise.all([connectionsQuery.refetch(), pendingQuery.refetch()]);
    await hc.recheckStatus();
  }, [connectionsQuery, pendingQuery, hc]);

  if (!activeLeague) {
    return (
      <ScreenScrollView>
        <ScreenState state="empty" message="Select a league first" />
      </ScreenScrollView>
    );
  }

  if (connectionsQuery.isLoading) {
    return (
      <ScreenScrollView>
        <ScreenState state="loading" message="Loading wearable connections..." />
      </ScreenScrollView>
    );
  }

  if (connectionsQuery.isError) {
    return (
      <ScreenScrollView>
        <ScreenState
          state="error"
          message="Failed to load wearable connections"
          actionLabel="Retry"
          onAction={() => void connectionsQuery.refetch()}
        />
      </ScreenScrollView>
    );
  }

  const pendingWorkouts = pendingQuery.data ?? [];

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="gap-6 py-4">
        <AppText className="text-lg font-bold text-foreground">
          Connected Apps & Wearables
        </AppText>

        <HealthConnectCard
          status={hc.status}
          connection={hcConnection}
          isInitializing={hc.isInitializing}
          isSyncing={hc.isSyncing || syncMutation.isPending}
          lastSyncCount={lastSyncCount}
          onConnect={handleConnect}
          onSync={handleSync}
          onDisconnect={handleDisconnect}
        />

        {pendingWorkouts.length > 0 && (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <AppText className="text-base font-semibold text-foreground">
                Pending Confirmation
              </AppText>
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: `${mflColors.amber}20` }}
              >
                <AppText className="text-xs font-semibold" style={{ color: mflColors.amber }}>
                  {pendingWorkouts.length}
                </AppText>
              </View>
            </View>

            {pendingWorkouts.map((w) => (
              <PendingConfirmationCard
                key={w.workoutId}
                workout={w}
                isConfirming={confirmingId === w.workoutId}
                isRejecting={rejectingId === w.workoutId}
                onConfirm={() => void handleConfirm(w.workoutId)}
                onReject={() => void handleReject(w.workoutId)}
              />
            ))}
          </View>
        )}

        {pendingWorkouts.length === 0 && hc.status === 'connected' && (
          <View className="rounded-2xl bg-content1 p-4 items-center">
            <AppText className="text-sm text-muted text-center">
              No pending workouts. Sync from Health Connect to import new activities.
            </AppText>
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}
