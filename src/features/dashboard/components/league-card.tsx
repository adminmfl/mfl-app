import Feather from '@expo/vector-icons/Feather';
import { Image, View, Pressable } from 'react-native';
import { Card, Chip } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { isLeagueEnded } from '../../leagues/utils/league-status';
import type { UserLeague } from '../../leagues/types/league.model';

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#FEF3C7', text: '#D97706' },
  launched: { bg: '#DBEAFE', text: '#2563EB' },
  active: { bg: '#D1FAE5', text: '#059669' },
  completed: { bg: '#F1F5F9', text: '#94A3B8' },
  ended: { bg: '#F1F5F9', text: '#94A3B8' },
};

const roleIcons: Record<string, keyof typeof Feather.glyphMap> = {
  host: 'award',
  governor: 'shield',
  captain: 'users',
  player: 'activity',
};

interface LeagueCardProps {
  league: UserLeague;
  onPress: () => void;
}

export function LeagueCard({ league, onPress }: LeagueCardProps) {
  const leagueEnded = isLeagueEnded(league.endDate);
  const displayStatus = leagueEnded ? 'ended' : league.status;
  const colors = statusColors[displayStatus] ?? { bg: '#D1FAE5', text: '#059669' };

  return (
    <Pressable onPress={onPress} className="flex-1">
      <Card className="overflow-hidden p-0">
        {/* Cover gradient */}
        <View
          className="h-16 rounded-t-xl justify-end px-2.5 pb-1.5"
          style={{ backgroundColor: mflColors.brand }}
        >
          {/* Status badge */}
          <View className="absolute top-1.5 right-1.5">
            <Chip size="sm" variant="soft" style={{ backgroundColor: colors.bg }}>
              <Chip.Label style={{ color: colors.text, fontSize: 9 }}>
                {displayStatus === 'ended' ? 'Ended' : displayStatus}
              </Chip.Label>
            </Chip>
          </View>

          {/* Logo initials */}
          <View className="absolute top-1.5 left-1.5">
            {league.logoUrl ? (
              <Image
                source={{ uri: league.logoUrl }}
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
              />
            ) : (
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
              >
                <AppText className="text-[10px] font-bold" style={{ color: '#fff' }}>
                  {league.name?.slice(0, 2).toUpperCase() || 'LG'}
                </AppText>
              </View>
            )}
          </View>

          {/* League name */}
          <AppText
            className="text-xs font-semibold"
            style={{ color: '#fff' }}
            numberOfLines={1}
          >
            {league.name}
          </AppText>
        </View>

        {/* Content */}
        <View className="p-2">
          <AppText className="text-[11px] text-muted mb-1" numberOfLines={1}>
            {league.description || 'No description'}
          </AppText>

          {/* Creator */}
          {league.creatorName ? (
            <View className="flex-row items-center gap-1 mb-1">
              <Feather name="award" size={10} color={mflColors.blue} />
              <AppText className="text-[9px] text-muted">
                Hosted by {league.creatorName}
              </AppText>
            </View>
          ) : null}

          {/* Roles */}
          <View className="flex-row flex-wrap gap-1">
            {(league.roles || []).map((role) => (
              <View
                key={role}
                className="flex-row items-center gap-0.5 rounded-full px-1.5 py-0.5 border"
                style={{ borderColor: mflColors.border }}
              >
                <Feather
                  name={roleIcons[role] ?? 'user'}
                  size={9}
                  color={mflColors.textSub}
                />
                <AppText className="text-[9px] capitalize text-muted">{role}</AppText>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
