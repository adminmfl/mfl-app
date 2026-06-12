import Feather from '@expo/vector-icons/Feather';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { mflColors } from '../../constants/colors';

/**
 * Wearable Sync — Coming Soon
 *
 * Replaces the previous ConnectedAppsScreen per Phase 2 UI review (09 Jun 2026).
 * Health Connect (Android) and HealthKit (iOS) integration is in progress.
 * The screen remains accessible but non-functional until ready.
 */
export default function WearablesRoute() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const isIos = Platform.OS === 'ios';

  return (
    <ScreenScrollView>
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ paddingTop: insets.top + 48, paddingBottom: 48, gap: 24 }}
      >
        {/* Icon */}
        <View
          className="w-20 h-20 rounded-2xl items-center justify-center"
          style={{ backgroundColor: mflColors.accentLight }}
        >
          <Feather name="watch" size={36} color={mflColors.blue} />
        </View>

        {/* Title */}
        <View className="items-center gap-2">
          <AppText className="text-2xl font-bold text-foreground text-center">
            Wearable Sync
          </AppText>
          <View
            className="flex-row items-center gap-2 rounded-full px-4 py-1.5"
            style={{ backgroundColor: mflColors.amberLight }}
          >
            <Feather name="clock" size={13} color={mflColors.amber} />
            <AppText className="text-xs font-semibold" style={{ color: mflColors.amber }}>
              Coming Soon
            </AppText>
          </View>
        </View>

        {/* Description */}
        <AppText className="text-sm text-muted text-center leading-6 max-w-xs">
          Connect your fitness device or health app to automatically sync
          workouts and have them appear in your activity log — no manual entry
          required.
        </AppText>

        {/* Upcoming capabilities */}
        <View className="w-full gap-3">
          {[
            {
              icon: 'smartphone',
              label: isAndroid
                ? 'Health Connect (Android) — auto-detect workouts'
                : isIos
                  ? 'Apple HealthKit — auto-detect workouts'
                  : 'Health Connect & Apple HealthKit support',
            },
            { icon: 'refresh-cw',  label: 'Automatic sync after each workout' },
            { icon: 'check-circle', label: 'One-tap confirmation before points are awarded' },
            { icon: 'shield',      label: 'Duplicate prevention — no accidental double-counts' },
          ].map((item) => (
            <View
              key={item.icon}
              className="flex-row items-center gap-3 rounded-xl px-4 py-3"
              style={{ backgroundColor: mflColors.card, borderWidth: 1, borderColor: mflColors.border }}
            >
              <Feather name={item.icon as any} size={18} color={mflColors.blue} />
              <AppText className="flex-1 text-sm text-foreground">{item.label}</AppText>
            </View>
          ))}
        </View>
      </View>
    </ScreenScrollView>
  );
}
