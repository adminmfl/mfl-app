import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface RankBannerProps {
  rank: number;
  totalTeams: number;
  points: number;
  teamName: string;
  nextRankPoints?: number;
  primaryColor?: string;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0] ?? 'th');
}

function isValidHex(color?: string): boolean {
  if (!color) return false;
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

export function RankBanner({
  rank,
  totalTeams,
  points,
  teamName,
  nextRankPoints,
  primaryColor,
}: RankBannerProps) {
  const pointsToNext = nextRankPoints ? nextRankPoints - points : 0;
  const safePrimaryColor = isValidHex(primaryColor) ? primaryColor : mflColors.brand;

  const trophyColor =
    rank === 1
      ? '#FBBF24'
      : rank === 2
        ? '#CBD5E1'
        : rank === 3
          ? '#FB923C'
          : '#FFFFFF99';

  return (
    <View
      className="overflow-hidden rounded-2xl p-5"
      style={{
        backgroundColor: safePrimaryColor,
      }}
    >
      <View className="flex-row items-center gap-4">
        <View
          className="h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        >
          <Feather name="award" size={28} color={trophyColor} />
        </View>

        <View className="flex-1">
          <AppText
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            numberOfLines={1}
          >
            {teamName}
          </AppText>
          <View className="flex-row items-baseline gap-2">
            <AppText className="text-3xl font-black text-white">
              {getOrdinal(rank)}
            </AppText>
            <AppText
              className="text-xs font-medium"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              of {totalTeams} teams
            </AppText>
          </View>
        </View>
      </View>

      <View
        className="my-3 h-px w-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      />

      <View className="flex-row items-center justify-between">
        <View>
          <AppText
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Current Score
          </AppText>
          <View className="mt-1 flex-row items-center gap-2">
            <AppText className="text-2xl font-bold text-white">
              {points.toLocaleString()}
            </AppText>
            <View
              className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Feather name="trending-up" size={10} color="#4ADE80" />
              <AppText className="text-[10px] font-semibold text-white">
                PTS
              </AppText>
            </View>
          </View>
        </View>

        {pointsToNext > 0 ? (
          <View
            className="flex-row items-center gap-2 rounded-xl px-3 py-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <View
              className="h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Feather name="arrow-up-right" size={14} color="#FFFFFF" />
            </View>
            <View>
              <AppText
                className="text-[10px] font-medium"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Next Rank
              </AppText>
              <AppText className="text-xs font-bold text-white">
                {pointsToNext.toLocaleString()} pts to go
              </AppText>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
