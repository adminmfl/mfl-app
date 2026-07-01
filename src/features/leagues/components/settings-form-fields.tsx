import Feather from '@expo/vector-icons/Feather';
import { View, Pressable } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

// ---------------------------------------------------------------------------
// Shared input style
// ---------------------------------------------------------------------------

export const inputStyle = {
  backgroundColor: mflColors.white,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  color: mflColors.text,
} as const;

// ---------------------------------------------------------------------------
// Toggle Row
// ---------------------------------------------------------------------------

export function ToggleRow({
  label,
  description,
  value,
  onToggle,
  disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between py-3"
      onPress={onToggle}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View className="flex-1 mr-4">
        <AppText className="text-sm font-medium text-foreground">{label}</AppText>
        {description && (
          <AppText className="text-xs text-muted mt-0.5">{description}</AppText>
        )}
      </View>
      <View
        className="w-12 h-7 rounded-full justify-center px-0.5"
        style={{ backgroundColor: value ? mflColors.brand : mflColors.border }}
      >
        <View
          className="w-6 h-6 rounded-full"
          style={{
            backgroundColor: mflColors.white,
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

export function Stepper({
  label,
  description,
  value,
  onIncrement,
  onDecrement,
  min,
  max,
  disabled,
  unit,
}: {
  label: string;
  description?: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min: number;
  max: number;
  disabled?: boolean;
  unit?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-3" style={{ opacity: disabled ? 0.5 : 1 }}>
      <View className="flex-1 mr-4">
        <AppText className="text-sm font-medium text-foreground">{label}</AppText>
        {description && (
          <AppText className="text-xs text-muted mt-0.5">{description}</AppText>
        )}
      </View>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onDecrement}
          disabled={disabled || value <= min}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{
            backgroundColor: value <= min ? mflColors.inkLight : mflColors.brandLight,
          }}
        >
          <Feather name="minus" size={18} color={value <= min ? mflColors.textMuted : mflColors.brand} />
        </Pressable>
        <AppText className="text-lg font-bold text-foreground" style={{ minWidth: 32, textAlign: 'center' }}>
          {value}{unit ? ` ${unit}` : ''}
        </AppText>
        <Pressable
          onPress={onIncrement}
          disabled={disabled || value >= max}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{
            backgroundColor: value >= max ? mflColors.inkLight : mflColors.brandLight,
          }}
        >
          <Feather name="plus" size={18} color={value >= max ? mflColors.textMuted : mflColors.brand} />
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Picker Row (simple select via cycling values)
// ---------------------------------------------------------------------------

export function PickerRow({
  label,
  description,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const currentIdx = options.findIndex((o) => o.value === value);
  const currentLabel = options[currentIdx]?.label ?? value;

  const cycle = () => {
    const nextIdx = (currentIdx + 1) % options.length;
    onChange(options[nextIdx]!.value);
  };

  return (
    <Pressable
      className="flex-row items-center justify-between py-3"
      onPress={cycle}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View className="flex-1 mr-4">
        <AppText className="text-sm font-medium text-foreground">{label}</AppText>
        {description && (
          <AppText className="text-xs text-muted mt-0.5">{description}</AppText>
        )}
      </View>
      <View className="flex-row items-center gap-1 bg-default-100 rounded-lg px-3 py-2">
        <AppText className="text-sm font-medium" style={{ color: mflColors.brand }}>
          {currentLabel}
        </AppText>
        <Feather name="chevron-down" size={14} color={mflColors.brand} />
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

export function Divider() {
  return <View style={{ height: 1, backgroundColor: mflColors.border }} />;
}
