import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { HealthConnectStatus } from '../types/wearable.model';
import type { NormalizedActivityDTO } from '../types/wearable.dto';
import { normalizeExerciseSession } from '../utils/normalize-health-connect';

type HCModule = typeof import('react-native-health-connect');

type GrantedPermission = {
  accessType?: string;
  recordType?: string;
};

let _hc: HCModule | null = null;

function getHC(): HCModule | null {
  if (Platform.OS !== 'android') return null;
  if (!_hc) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      _hc = require('react-native-health-connect') as HCModule;
    } catch {
      _hc = null;
    }
  }
  return _hc;
}

const REQUIRED_PERMISSIONS = [
  { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
  { accessType: 'read' as const, recordType: 'Steps' as const },
  { accessType: 'read' as const, recordType: 'Distance' as const },
  { accessType: 'read' as const, recordType: 'TotalCaloriesBurned' as const },
];

function hasRequiredPermissions(granted: ReadonlyArray<GrantedPermission>): boolean {
  return REQUIRED_PERMISSIONS.every((req) =>
    granted.some(
      (g) =>
        g.accessType === req.accessType &&
        g.recordType === req.recordType,
    ),
  );
}

export function useHealthConnect() {
  const [status, setStatus] = useState<HealthConnectStatus>(
    Platform.OS !== 'android' ? 'unsupported' : 'not_connected',
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkAvailability = useCallback(async () => {
    const hc = getHC();
    if (!hc) {
      setStatus('unsupported');
      return;
    }

    try {
      const sdkStatus = await hc.getSdkStatus();
      if (sdkStatus === hc.SdkAvailabilityStatus.SDK_UNAVAILABLE) {
        setStatus('unsupported');
        return;
      }
      if (sdkStatus === hc.SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
        setStatus('not_installed');
        return;
      }

      await hc.initialize();

      const granted = await hc.getGrantedPermissions();
      setStatus(hasRequiredPermissions(granted) ? 'connected' : 'permission_needed');
    } catch {
      setStatus('not_connected');
    }
  }, []);

  useEffect(() => {
    void checkAvailability();
  }, [checkAvailability]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const hc = getHC();
    if (!hc) return false;

    setIsInitializing(true);
    try {
      const sdkStatus = await hc.getSdkStatus();
      if (sdkStatus === hc.SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
        setStatus('not_installed');
        return false;
      }

      await hc.initialize();
      const fromDialog = await hc.requestPermission(REQUIRED_PERMISSIONS);

      // Dialog callback can be empty on New Arch; controller state is authoritative.
      let granted: GrantedPermission[] = fromDialog;
      if (!hasRequiredPermissions(fromDialog)) {
        granted = await hc.getGrantedPermissions();
      }

      const hasAllPerms = hasRequiredPermissions(granted);
      setStatus(hasAllPerms ? 'connected' : 'permission_needed');
      return hasAllPerms;
    } catch (error) {
      if (__DEV__) {
        console.warn('[HealthConnect] requestPermissions failed', error);
      }
      setStatus('not_connected');
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const openSettings = useCallback(async () => {
    const hc = getHC();
    if (!hc) return;
    try {
      await hc.initialize();
      await hc.openHealthConnectSettings();
    } catch {
      // Ignore — user can open Health Connect manually
    }
  }, []);

  const readRecentWorkouts = useCallback(
    async (daysBack = 7): Promise<NormalizedActivityDTO[]> => {
      const hc = getHC();
      if (!hc) return [];

      setIsSyncing(true);
      try {
        await hc.initialize();

        const endTime = new Date().toISOString();
        const startTime = new Date(
          Date.now() - daysBack * 24 * 60 * 60 * 1000,
        ).toISOString();
        const timeRangeFilter = { operator: 'between' as const, startTime, endTime };

        const [sessions, stepsResult, distanceResult, caloriesResult] =
          await Promise.all([
            hc.readRecords('ExerciseSession', { timeRangeFilter }),
            hc.readRecords('Steps', { timeRangeFilter }).catch(() => ({ records: [] })),
            hc.readRecords('Distance', { timeRangeFilter }).catch(() => ({ records: [] })),
            hc.readRecords('TotalCaloriesBurned', { timeRangeFilter }).catch(() => ({ records: [] })),
          ]);

        return sessions.records.map((session) => {
          const sessionStart = new Date(session.startTime).getTime();
          const sessionEnd = new Date(session.endTime).getTime();

          const overlappingSteps = stepsResult.records.filter((r) =>
            rangesOverlap(sessionStart, sessionEnd, r.startTime, r.endTime),
          );
          const overlappingDistance = distanceResult.records.filter((r) =>
            rangesOverlap(sessionStart, sessionEnd, r.startTime, r.endTime),
          );
          const overlappingCalories = caloriesResult.records.filter((r) =>
            rangesOverlap(sessionStart, sessionEnd, r.startTime, r.endTime),
          );

          const steps = overlappingSteps.length > 0
            ? overlappingSteps.reduce((sum, r) => sum + r.count, 0)
            : null;
          const distanceMeters = overlappingDistance.length > 0
            ? overlappingDistance.reduce((sum, r) => sum + r.distance.inMeters, 0)
            : null;
          const calories = overlappingCalories.length > 0
            ? overlappingCalories.reduce((sum, r) => sum + r.energy.inKilocalories, 0)
            : null;

          return normalizeExerciseSession(
            session as unknown as Parameters<typeof normalizeExerciseSession>[0],
            { steps, distanceMeters, calories },
          );
        });
      } finally {
        setIsSyncing(false);
      }
    },
    [],
  );

  const disconnect = useCallback(async () => {
    const hc = getHC();
    if (!hc) return;
    try {
      await hc.revokeAllPermissions();
      setStatus('permission_needed');
    } catch {
      // Ignore revocation errors
    }
  }, []);

  return {
    status,
    isInitializing,
    isSyncing,
    requestPermissions,
    openSettings,
    readRecentWorkouts,
    disconnect,
    recheckStatus: checkAvailability,
  };
}

function rangesOverlap(
  sessionStart: number,
  sessionEnd: number,
  recordStart: string,
  recordEnd: string,
): boolean {
  const rStart = new Date(recordStart).getTime();
  const rEnd = new Date(recordEnd).getTime();
  return rStart < sessionEnd && rEnd > sessionStart;
}
