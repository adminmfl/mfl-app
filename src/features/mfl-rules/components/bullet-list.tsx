import { View } from 'react-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

export function BulletList({ items }: { items: string[] }) {
  return (
    <View className="gap-2">
      {items.map((item, index) => (
        <View key={`${item}-${index}`} className="flex-row gap-2">
          <View
            className="mt-2 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: mflColors.textMuted }}
          />
          <AppText className="flex-1 text-sm leading-5 text-foreground">
            {item}
          </AppText>
        </View>
      ))}
    </View>
  );
}
