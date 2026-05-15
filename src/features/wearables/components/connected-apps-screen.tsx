import { useCallback, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { AppText } from '../../../components/app-text';
import { useLeagueContext } from '../../../contexts/league-context';
import { mflColors } from '../../../constants/colors';
import { useHealthConnect } from '../hooks/use-health-connect';
import { useHealthKit } from '../hooks/use-healthkit';
import {
  useWearableConnections,
  useRegisterHealthConnect,
  useRegisterHealthKit,
  useDeleteWearableConnection,
  useSyncHealthConnect,
  useSyncHealthKit,
} from '../hooks/use-wearable-connections';
import {
  usePendingConfirmations,
  useConfirmWorkout,
  useRejectWorkout,
} from '../hooks/use-pending-confirmations';
import { HealthConnectCard } from './health-connect-card';
import { HealthKitCard } from './healthkit-card';
import { PendingConfirmationCard } from './pending-confirmation-card';

const isIos = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

export function ConnectedAppsScreen() {
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const hc = useHealthConnect();
  const hk = useHealthKit();

  const connectionsQuery = useWearableConnections(leagueId);
  const pendingQuery = usePendingConfirmations(leagueId);

  const registerHcMutation = useRegisterHealthConnect();
  const registerHkMutation = useRegisterHealthKit();
  const deleteMutation = useDeleteWearableConnection();
  const syncHcMutation = useSyncHealthConnect();
  const syncHkMutation = useSyncHealthKit();
  const confirmMutation = useConfirmWorkout();
  const rejectMutation = useRejectWorkout();

  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const hcConnection =
    connectionsQuery.data?.find((c) => c.provider === 'health_connect') ?? null;
  const hkConnection =
    connectionsQuery.data?.find((c) => c.provider === 'healthkit') ?? null;
  // Google Health is connected via the web app (OAuth). Mobile only displays it.
  const ghConnection =
    connectionsQuery.data?.find(
      (c) => c.provider === 'google_health' && c.status === 'active',
    ) ?? null;

  // ---------- Health Connect (Android) handlers ----------
  const handleConnectHc = useCallback(async () => {
    const granted = await hc.requestPermissions();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Health Connect permissions are needed to sync workouts.',
      );
      return;
    }

    try {
      await registerHcMutation.mutateAsync({
        leagueId,
        deviceName: `Android ${Platform.Version}`,
        androidVersion: String(Platform.Version),
      });
    } catch {
      Alert.alert('Error', 'Failed to register Health Connect with server.');
    }
  }, [hc, registerHcMutation, leagueId]);

  const handleSyncHc = useCallback(async () => {
    try {
      const activities = await hc.readRecentWorkouts(7);
      if (activities.length === 0) {
        Alert.alert(
          'No Workouts',
          'No new workouts found in Health Connect for the last 7 days.',
        );
        setLastSyncCount(0);
        return;
      }

      const result = await syncHcMutation.mutateAsync({
        leagueId,
        activities,
        connectionId: hcConnection?.connectionId ?? null,
      });
      setLastSyncCount(result.imported);

      if (result.imported > 0) {
        Alert.alert(
          'Sync Complete',
          `${result.imported} workout${result.imported !== 1 ? 's' : ''} imported.${
            result.duplicates > 0
              ? ` ${result.duplicates} duplicate(s) skipped.`
              : ''
          }`,
        );
      } else {
        Alert.alert(
          'Sync Complete',
          'No new workouts to import. All are already synced.',
        );
      }
    } catch {
      Alert.alert('Sync Failed', 'Failed to sync workouts. Please try again.');
    }
  }, [hc, syncHcMutation, leagueId, hcConnection]);

  const handleDisconnectHc = useCallback(async () => {
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

  // ---------- HealthKit (iOS) handlers ----------
  const handleConnectHk = useCallback(async () => {
    const granted = await hk.requestPermissions();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Open the iOS Settings app and enable Apple Health access for MFL under Privacy & Security > Health.',
      );
      return;
    }

    try {
      await registerHkMutation.mutateAsync({
        leagueId,
        deviceName: `iPhone (iOS ${Platform.Version})`,
        iosVersion: String(Platform.Version),
      });
    } catch {
      Alert.alert('Error', 'Failed to register Apple Health with server.');
    }
  }, [hk, registerHkMutation, leagueId]);

  const handleSyncHk = useCallback(async () => {
    try {
      const activities = await hk.readRecentWorkouts(7);
      if (activities.length === 0) {
        Alert.alert(
          'No Workouts',
          'No new workouts found in Apple Health for the last 7 days.',
        );
        setLastSyncCount(0);
        return;
      }

      const result = await syncHkMutation.mutateAsync({
        leagueId,
        activities,
        connectionId: hkConnection?.connectionId ?? null,
      });
      setLastSyncCount(result.imported);

      if (result.imported > 0) {
        Alert.alert(
          'Sync Complete',
          `${result.imported} workout${result.imported !== 1 ? 's' : ''} imported.${
            result.duplicates > 0
              ? ` ${result.duplicates} duplicate(s) skipped.`
              : ''
          }`,
        );
      } else {
        Alert.alert(
          'Sync Complete',
          'No new workouts to import. All are already synced.',
        );
      }
    } catch {
      Alert.alert('Sync Failed', 'Failed to sync workouts. Please try again.');
    }
  }, [hk, syncHkMutation, leagueId, hkConnection]);

  const handleDisconnectHk = useCallback(async () => {
    await hk.disconnect();
    if (hkConnection) {
      try {
        await deleteMutation.mutateAsync({
          leagueId,
          connectionId: hkConnection.connectionId,
        });
      } catch {
        // Connection removed locally even if server fails
      }
    }
  }, [hk, hkConnection, deleteMutation, leagueId]);

  // ---------- Pending confirmations ----------
  const handleConfirm = useCallback(
    async (workoutId: string) => {
      setConfirmingId(workoutId);
      try {
        const result = await confirmMutation.mutateAsync({
          leagueId,
          workoutId,
        });
        Alert.alert(
          'Confirmed',
          `${result.pointsAwarded} point${result.pointsAwarded !== 1 ? 's' : ''} awarded!`,
        );
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
    if (isAndroid) await hc.recheckStatus();
    if (isIos) await hk.recheckStatus();
  }, [connectionsQuery, pendingQuery, hc, hk]);

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

  const providerStatus = isIos ? hk.status : hc.status;
  const isConnectedToProvider = providerStatus === 'connected';

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="gap-6 py-4">
        <AppText className="text-lg font-bold text-foreground">
          Connected Apps & Wearables
        </AppText>

        {isIos && (
          <HealthKitCard
            status={hk.status}
            connection={hkConnection}
            isInitializing={hk.isInitializing}
            isSyncing={hk.isSyncing || syncHkMutation.isPending}
            lastSyncCount={lastSyncCount}
            onConnect={handleConnectHk}
            onSync={handleSyncHk}
            onDisconnect={handleDisconnectHk}
          />
        )}

        {isAndroid && (
          <HealthConnectCard
            status={hc.status}
            connection={hcConnection}
            isInitializing={hc.isInitializing}
            isSyncing={hc.isSyncing || syncHcMutation.isPending}
            lastSyncCount={lastSyncCount}
            onConnect={handleConnectHc}
            onSync={handleSyncHc}
            onDisconnect={handleDisconnectHc}
          />
        )}

        {ghConnection && (
          <View className="rounded-2xl bg-content1 p-4">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${mflColors.brand}15` }}
              >
                <AppText
                  className="text-base"
                  style={{ color: mflColors.brand }}
                >
                  ✓
                </AppText>
              </View>
              <View className="flex-1">
                <AppText className="text-base font-semibold text-foreground">
                  Google Health
                </AppText>
                <AppText className="text-xs text-muted mt-0.5">
                  Connected via the MFL web app. Manage and sync it from
                  Connected Apps on the website.
                </AppText>
              </View>
            </View>
          </View>
        )}

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
                <AppText
                  className="text-xs font-semibold"
                  style={{ color: mflColors.amber }}
                >
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

        {pendingWorkouts.length === 0 && isConnectedToProvider && (
          <View className="rounded-2xl bg-content1 p-4 items-center">
            <AppText className="text-sm text-muted text-center">
              No pending workouts. Sync from{' '}
              {isIos ? 'Apple Health' : 'Health Connect'} to import new
              activities.
            </AppText>
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}
