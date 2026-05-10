import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { BalanceBreakdownDTO } from '../types/team.dto';

interface TeamBalanceCardProps {
  balance: BalanceBreakdownDTO;
}

function BalanceBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? mflColors.brand : score >= 60 ? mflColors.amber : mflColors.danger;

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <AppText className="text-[11px] text-muted">{label}</AppText>
        <AppText className="text-[11px] font-semibold" style={{ color }}>
          {Math.round(score)}%
        </AppText>
      </View>
      <View className="h-1.5 w-full rounded-full" style={{ backgroundColor: mflColors.inkLight }}>
        <View
          className="h-1.5 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

export function TeamBalanceCard({ balance }: TeamBalanceCardProps) {
  const overall = Math.round(balance.overallScore);
  const overallColor =
    overall >= 80 ? mflColors.brand : overall >= 60 ? mflColors.amber : mflColors.danger;

  return (
    <Card className="p-4">
      <View className="flex-row items-center gap-2 mb-3">
        <View
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: `${overallColor}15` }}
        >
          <Feather name="sliders" size={14} color={overallColor} />
        </View>
        <AppText className="text-sm font-bold text-foreground">
          Team Balance
        </AppText>
        <View
          className="ml-auto rounded-full px-2 py-0.5"
          style={{ backgroundColor: `${overallColor}15` }}
        >
          <AppText className="text-xs font-bold" style={{ color: overallColor }}>
            {overall}/100
          </AppText>
        </View>
      </View>

      <View className="gap-2">
        <BalanceBar label="Fitness" score={balance.fitnessScore} />
        <BalanceBar label="Gender Mix" score={balance.genderScore} />
        <BalanceBar label="Age Distribution" score={balance.ageScore} />
        <BalanceBar label="Department Diversity" score={balance.departmentScore} />
      </View>
    </Card>
  );
}
