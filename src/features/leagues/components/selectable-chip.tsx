import { Pressable, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

export function SelectableChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        className="rounded-full px-3 py-1.5"
        style={{
          backgroundColor: selected ? mflColors.brandLight : mflColors.white,
          borderWidth: 1,
          borderColor: selected ? mflColors.brand : mflColors.border,
        }}
      >
        <AppText
          className="text-xs font-medium"
          style={{ color: selected ? mflColors.brand : mflColors.textSub }}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
