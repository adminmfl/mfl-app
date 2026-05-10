import Feather from '@expo/vector-icons/Feather';
import { Alert, Platform, Pressable, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { HealthConnectStatus } from '../types/wearable.model';
import type { WearableConnection } from '../types/wearable.model';

interface HealthConnectCardProps {
  status: HealthConnectStatus;
  connection: WearableConnection | null;
  isInitializing: boolean;
  isSyncing: boolean;
  lastSyncCount: number | null;
  onConnect: () => void;
  onSync: () => void;
  onDisconnect: () => void;
}

const STATUS_CONFIG: Record<
  HealthConnectStatus,
  { label: string; color: string; icon: keyof typeof Feather.glyphMap }
> = {
  unsupported: { label: 'Not Available', color: mflColors.textMuted, icon: 'x-circle' },
  not_installed: { label: 'Not Installed', color: mflColors.amber, icon: 'download' },
  not_connected: { label: 'Not Connected', color: mflColors.textMuted, icon: 'link' },
  permission_needed: { label: 'Permission Needed', color: mflColors.amber, icon: 'shield' },
  connected: { label: 'Connected', color: mflColors.brand, icon: 'check-circle' },
};

export function HealthConnectCard({
  status,
  connection,
  isInitializing,
  isSyncing,
  lastSyncCount,
  onConnect,
  onSync,
  onDisconnect,
}: HealthConnectCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <View className="rounded-2xl bg-content1 p-4">
        <View className="flex-row items-center gap-3 mb-2">
          <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: mflColors.inkLight }}>
            <Feather name="heart" size={20} color={mflColors.textMuted} />
          </View>
          <View className="flex-1">
            <AppText className="text-base font-semibold text-foreground">Apple Health</AppText>
            <AppText className="text-xs text-muted">iOS HealthKit integration is deferred.</AppText>
          </View>
        </View>
      </View>
    );
  }

  const config = STATUS_CONFIG[status];

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Health Connect',
      'This will revoke all Health Connect permissions and remove the connection.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: onDisconnect },
      ],
    );
  };

  return (
    <View className="rounded-2xl bg-content1 p-4">
      <View className="flex-row items-center gap-3 mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <Feather name="heart" size={20} color={config.color} />
        </View>
        <View className="flex-1">
          <AppText className="text-base font-semibold text-foreground">Health Connect</AppText>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Feather name={config.icon} size={12} color={config.color} />
            <AppText className="text-xs" style={{ color: config.color }}>
              {config.label}
            </AppText>
          </View>
        </View>
      </View>

      {status === 'unsupported' && (
        <AppText className="text-xs text-muted mb-3">
          Health Connect is not supported on this device. Android 13+ with Health Connect app
          or Android 14+ is required.
        </AppText>
      )}

      {status === 'not_installed' && (
        <AppText className="text-xs text-muted mb-3">
          Health Connect needs to be updated. Please update the Health Connect app from the Play Store.
        </AppText>
      )}

      {connection?.lastSyncedAt && (
        <AppText className="text-xs text-muted mb-2">
          Last synced: {new Date(connection.lastSyncedAt).toLocaleString()}
        </AppText>
      )}

      {lastSyncCount !== null && lastSyncCount > 0 && (
        <AppText className="text-xs mb-3" style={{ color: mflColors.brand }}>
          {lastSyncCount} workout{lastSyncCount !== 1 ? 's' : ''} imported from last sync
        </AppText>
      )}

      <View className="flex-row gap-2 mt-1">
        {(status === 'not_connected' || status === 'permission_needed') && (
          <ActionButton
            label={isInitializing ? 'Connecting...' : 'Connect Health Connect'}
            icon="link"
            color={mflColors.brand}
            disabled={isInitializing}
            onPress={onConnect}
          />
        )}

        {status === 'connected' && (
          <>
            <ActionButton
              label={isSyncing ? 'Syncing...' : 'Sync Now'}
              icon="refresh-cw"
              color={mflColors.brand}
              disabled={isSyncing}
              onPress={onSync}
            />
            <ActionButton
              label="Disconnect"
              icon="x"
              color={mflColors.danger}
              onPress={handleDisconnect}
            />
          </>
        )}
      </View>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  color,
  disabled,
  onPress,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center gap-2 rounded-xl px-4 py-2.5"
      style={{
        backgroundColor: `${color}15`,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Feather name={icon} size={14} color={color} />
      <AppText className="text-sm font-medium" style={{ color }}>
        {label}
      </AppText>
    </Pressable>
  );
}
