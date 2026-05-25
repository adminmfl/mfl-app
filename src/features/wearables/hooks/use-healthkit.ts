import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { HealthKitStatus } from '../types/wearable.model';
import type { NormalizedActivityDTO } from '../types/wearable.dto';
import {
  normalizeHealthKitWorkout,
  type HealthKitWorkoutInput,
} from '../utils/normalize-healthkit';

type HKModule = typeof import('@kingstinct/react-native-healthkit');

let _hk: HKModule | null = null;

function getHK(): HKModule | null {
  if (Platform.OS !== 'ios') return null;
  if (!_hk) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      _hk = require('@kingstinct/react-native-healthkit') as HKModule;
    } catch {
      _hk = null;
    }
  }
  return _hk;
}

// Mirrors the @kingstinct/react-native-healthkit identifier strings.
// HealthKit read permissions are silent — the system tells the app
// only whether the user has been asked, not whether they granted.
const READ_PERMISSIONS = [
  'HKWorkoutTypeIdentifier',
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
  'HKQuantityTypeIdentifierDistanceCycling',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierBasalEnergyBurned',
] as const;

// AuthorizationRequestStatus enum values from @kingstinct/react-native-healthkit.
const AUTH_STATUS_UNNECESSARY = 2;

export function useHealthKit() {
  const [status, setStatus] = useState<HealthKitStatus>(
    Platform.OS !== 'ios' ? 'unsupported' : 'not_connected',
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkAvailability = useCallback(async () => {
    const hk = getHK();
    if (!hk) {
      setStatus('unsupported');
      return;
    }

    try {
      const available = hk.isHealthDataAvailable();
      if (!available) {
        setStatus('unsupported');
        return;
      }

      const requestStatus = await hk.getRequestStatusForAuthorization({
        toRead: [...READ_PERMISSIONS],
      });

      setStatus(
        requestStatus === AUTH_STATUS_UNNECESSARY ? 'connected' : 'not_connected',
      );
    } catch {
      setStatus('not_connected');
    }
  }, []);

  useEffect(() => {
    void checkAvailability();
  }, [checkAvailability]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const hk = getHK();
    if (!hk) return false;

    setIsInitializing(true);
    try {
      // requestAuthorization resolves to true once the system finishes presenting
      // the auth sheet — it does not tell us whether read was granted (HealthKit
      // privacy). We then check getRequestStatusForAuthorization to confirm the
      // user has been prompted at least once.
      await hk.requestAuthorization({ toRead: [...READ_PERMISSIONS] });

      const requestStatus = await hk.getRequestStatusForAuthorization({
        toRead: [...READ_PERMISSIONS],
      });

      const isConnected = requestStatus === AUTH_STATUS_UNNECESSARY;
      setStatus(isConnected ? 'connected' : 'not_connected');
      return isConnected;
    } catch {
      setStatus('not_connected');
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const readRecentWorkouts = useCallback(
    async (daysBack = 7): Promise<NormalizedActivityDTO[]> => {
      const hk = getHK();
      if (!hk) return [];

      setIsSyncing(true);
      try {
        const endDate = new Date();
        const startDate = new Date(
          Date.now() - daysBack * 24 * 60 * 60 * 1000,
        );

        const workouts = await hk.queryWorkoutSamples({
          filter: { date: { startDate, endDate } },
          limit: 0,
          ascending: false,
        });

        const results: NormalizedActivityDTO[] = [];
        for (const workout of workouts) {
          const aggregated = await aggregateForWorkout(hk, workout);
          results.push(
            normalizeHealthKitWorkout(
              workout as unknown as HealthKitWorkoutInput,
              aggregated,
            ),
          );
        }

        return results;
      } finally {
        setIsSyncing(false);
      }
    },
    [],
  );

  // HealthKit has no programmatic "revoke" API — the user manages it in Settings.
  // We treat disconnect as a local status reset; backend connection deletion is
  // handled by the caller via the existing wearable-connection delete endpoint.
  const disconnect = useCallback(async () => {
    setStatus('not_connected');
  }, []);

  return {
    status,
    isInitializing,
    isSyncing,
    requestPermissions,
    readRecentWorkouts,
    disconnect,
    recheckStatus: checkAvailability,
  };
}

interface QuantitySumResponse {
  sumQuantity?: { quantity: number; unit: string };
}

async function safeSum<T extends string>(
  hk: HKModule,
  identifier: T,
  workout: unknown,
): Promise<number | null> {
  try {
    const result = (await hk.queryStatisticsForQuantity(
      identifier as never,
      ['cumulativeSum'] as const,
      // Filter by workout so we only sum samples attributed to this workout.
      { filter: { workout: workout as never } } as never,
    )) as QuantitySumResponse;

    return result?.sumQuantity?.quantity ?? null;
  } catch {
    return null;
  }
}

async function aggregateForWorkout(
  hk: HKModule,
  workout: unknown,
): Promise<{
  steps: number | null;
  distanceMeters: number | null;
  calories: number | null;
}> {
  const [steps, walkingRunning, cycling, active, basal] = await Promise.all([
    safeSum(hk, 'HKQuantityTypeIdentifierStepCount', workout),
    safeSum(hk, 'HKQuantityTypeIdentifierDistanceWalkingRunning', workout),
    safeSum(hk, 'HKQuantityTypeIdentifierDistanceCycling', workout),
    safeSum(hk, 'HKQuantityTypeIdentifierActiveEnergyBurned', workout),
    safeSum(hk, 'HKQuantityTypeIdentifierBasalEnergyBurned', workout),
  ]);

  const distanceMeters =
    walkingRunning != null || cycling != null
      ? (walkingRunning ?? 0) + (cycling ?? 0)
      : null;

  const calories =
    active != null || basal != null ? (active ?? 0) + (basal ?? 0) : null;

  return { steps, distanceMeters, calories };
}
