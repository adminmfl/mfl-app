import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { PointsTypeFilter } from '../hooks/use-mobile-leaderboard';

const OPTIONS: { value: PointsTypeFilter; label: string }[] = [
  { value: 'all', label: 'Activity + Challenge' },
  { value: 'activity', label: 'Activities only' },
  { value: 'challenge', label: 'Challenges only' },
];

export function PointsTypeDropdown({
  value,
  onChange,
}: {
  value: PointsTypeFilter;
  onChange: (value: PointsTypeFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = OPTIONS.find((o) => o.value === value)?.label ?? OPTIONS[0]!.label;

  return (
    <>
      <Pressable
        className="flex-row items-center gap-1.5 rounded-full px-3 py-2"
        style={{
          backgroundColor: mflColors.surface,
          borderWidth: 1,
          borderColor: mflColors.border,
        }}
        onPress={() => setOpen(true)}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <AppText className="text-xs font-medium" style={{ color: mflColors.textSub }} numberOfLines={1}>
          {selectedLabel}
        </AppText>
        <Feather name="chevron-down" size={12} color={mflColors.textSub} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onPress={() => setOpen(false)}
        >
          <View
            className="w-64 rounded-xl p-2"
            style={{ backgroundColor: mflColors.surface }}
          >
            {OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                className="flex-row items-center justify-between rounded-lg px-3 py-3"
                style={{
                  backgroundColor: option.value === value ? mflColors.brandLight : 'transparent',
                }}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <AppText
                  className="text-sm font-medium"
                  style={{ color: option.value === value ? mflColors.brand : mflColors.text }}
                >
                  {option.label}
                </AppText>
                {option.value === value ? (
                  <Feather name="check" size={16} color={mflColors.brand} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
