import { View } from 'react-native';
import { AppText } from '../../../components/app-text';

interface RestrictedListProps {
  heading: string;
  items: string[];
}

export function RestrictedList({ heading, items }: RestrictedListProps) {
  return (
    <View className="rounded-lg bg-danger/5 border border-danger/10 p-3 gap-2">
      <AppText className="text-sm font-medium text-foreground">{heading}</AppText>
      {items.map((item, i) => (
        <View key={i} className="flex-row items-start gap-2">
          <View className="h-5 w-5 rounded-full border border-danger/30 items-center justify-center mt-0.5">
            <AppText className="text-[10px] text-danger">{i + 1}</AppText>
          </View>
          <AppText className="text-sm text-muted flex-1">{item}</AppText>
        </View>
      ))}
    </View>
  );
}
