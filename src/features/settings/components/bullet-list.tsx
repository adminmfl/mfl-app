import { View } from 'react-native';
import { AppText } from '../../../components/app-text';

interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps) {
  return (
    <View className="gap-2 pl-1">
      {items.map((item, i) => (
        <View key={i} className="flex-row items-start gap-2.5">
          <View className="mt-2 h-1.5 w-1.5 rounded-full bg-accent/60" />
          <AppText className="text-sm text-muted flex-1">{item}</AppText>
        </View>
      ))}
    </View>
  );
}
