import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { mflColors } from '../../../constants/colors';

/**
 * AI Coach — Coming Soon
 *
 * The AI Coach feature is under active development. This placeholder screen
 * replaces the previous functional screen per Phase 2 UI review (09 Jun 2026).
 * The tab remains accessible but non-functional until the feature is ready.
 */
export default function CoachTab() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenScrollView>
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ paddingTop: insets.top + 48, paddingBottom: 48, gap: 24 }}
      >
        {/* Icon */}
        <View
          className="w-20 h-20 rounded-2xl items-center justify-center"
          style={{ backgroundColor: mflColors.brandLight }}
        >
          <Feather name="cpu" size={36} color={mflColors.brand} />
        </View>

        {/* Title */}
        <View className="items-center gap-2">
          <AppText className="text-2xl font-bold text-foreground text-center">
            AI Coach
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
          Your personalised AI Coach will analyse your activity patterns,
          league standings, and motivation profile to give you daily nudges,
          insights, and recommendations — built just for you.
        </AppText>

        {/* Upcoming capabilities */}
        <View className="w-full gap-3">
          {[
            { icon: 'bar-chart-2', label: 'Performance insights based on your activity data' },
            { icon: 'zap',         label: 'Daily motivation nudges tailored to your goals' },
            { icon: 'target',      label: 'Challenge strategy and league standing tips' },
            { icon: 'shield',      label: 'Private — visible only to you, not the team' },
          ].map((item) => (
            <View
              key={item.icon}
              className="flex-row items-center gap-3 rounded-xl px-4 py-3"
              style={{ backgroundColor: mflColors.card, borderWidth: 1, borderColor: mflColors.border }}
            >
              <Feather name={item.icon as any} size={18} color={mflColors.brand} />
              <AppText className="flex-1 text-sm text-foreground">{item.label}</AppText>
            </View>
          ))}
        </View>
      </View>
    </ScreenScrollView>
  );
}
