import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

export function RankBadge({
  rank,
  tier,
  band,
}: {
  rank: number;
  tier?: 'top' | 'middle' | 'bottom';
  band?: string;
}) {
  if (tier === 'bottom') {
    return (
      <View
        className="h-9 min-w-9 items-center justify-center rounded-full px-2"
        style={{ backgroundColor: mflColors.blueLight }}
      >
        <Feather name="activity" size={16} color={mflColors.blue} />
      </View>
    );
  }

  if (tier === 'middle') {
    return (
      <View
        className="h-9 min-w-9 items-center justify-center rounded-full px-2"
        style={{ backgroundColor: mflColors.inkLight }}
      >
        <AppText className="text-[10px] font-semibold text-muted">
          {band || `#${rank}`}
        </AppText>
      </View>
    );
  }

  const color =
    rank === 1
      ? '#CA8A04'
      : rank === 2
        ? '#64748B'
        : rank === 3
          ? '#EA580C'
          : mflColors.textMuted;
  const background =
    rank === 1
      ? '#FEF9C3'
      : rank === 2
        ? '#F1F5F9'
        : rank === 3
          ? '#FFEDD5'
          : mflColors.inkLight;

  return (
    <View
      className="h-9 w-9 items-center justify-center rounded-full"
      style={{ backgroundColor: background }}
    >
      {rank <= 3 ? (
        <Feather name={rank === 1 ? 'award' : 'shield'} size={16} color={color} />
      ) : (
        <AppText className="text-sm font-bold" style={{ color }}>
          {rank}
        </AppText>
      )}
    </View>
  );
}
