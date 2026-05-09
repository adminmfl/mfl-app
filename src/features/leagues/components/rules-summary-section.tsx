import { View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';

interface Props {
  summary: string;
}

export function RulesSummarySection({ summary }: Props) {
  return (
    <View className="gap-3">
      <SectionLabel label="SUMMARY" />
      <Card className="p-4">
        <AppText className="text-sm text-foreground leading-5">
          {summary}
        </AppText>
      </Card>
    </View>
  );
}
