import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { Button } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { TournamentMatch } from '../types/challenge.model';
import { formatChallengeDate } from '../utils/challenge-config-utils';

export function MatchCard({
  match,
  onEdit,
  onDelete,
}: {
  match: TournamentMatch;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="rounded-xl border border-default-200 overflow-hidden">
      <View className="flex-row items-center justify-between bg-default-100 px-3 py-2">
        <AppText className="text-xs text-muted">
          {formatChallengeDate(match.startTime)} - {match.status}
        </AppText>
        <View className="flex-row gap-2">
          <Button variant="secondary" size="sm" onPress={onEdit}>
            <Button.Label>Edit</Button.Label>
          </Button>
          <Button variant="secondary" size="sm" onPress={onDelete}>
            <Button.Label style={{ color: mflColors.danger }}>Delete</Button.Label>
          </Button>
        </View>
      </View>
      <View className="flex-row items-center p-4 gap-3">
        <TeamMatchSide name={match.team1Name || 'TBD'} />
        <View className="items-center px-2">
          <AppText className="text-xl font-bold text-foreground">
            {match.status === 'scheduled' ? 'vs' : `${match.score1} - ${match.score2}`}
          </AppText>
        </View>
        <TeamMatchSide name={match.team2Name || 'TBD'} />
      </View>
    </View>
  );
}

function TeamMatchSide({ name }: { name: string }) {
  return (
    <View className="flex-1 items-center gap-2">
      <View className="w-10 h-10 rounded-full bg-default-100 items-center justify-center">
        <Feather name="shield" size={18} color={mflColors.brand} />
      </View>
      <AppText className="text-sm font-semibold text-foreground text-center" numberOfLines={2}>
        {name}
      </AppText>
    </View>
  );
}
