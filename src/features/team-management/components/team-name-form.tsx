import { View } from 'react-native';
import { TextInput } from 'react-native';
import { Button, Spinner } from 'heroui-native';

import { mflColors } from '../../../constants/colors';

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: mflColors.text,
};

interface TeamNameFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  buttonLabel: string;
  isBusy: boolean;
  disabled?: boolean;
}

export function TeamNameForm({
  value,
  onChange,
  onSubmit,
  buttonLabel,
  isBusy,
  disabled = false,
}: TeamNameFormProps) {
  return (
    <View className="gap-3">
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChange}
        placeholder="Enter team name"
        placeholderTextColor={mflColors.textMuted}
        maxLength={100}
      />
      <Button
        variant="primary"
        size="lg"
        onPress={onSubmit}
        isDisabled={isBusy || disabled}
      >
        {isBusy ? <Spinner size="sm" /> : <Button.Label>{buttonLabel}</Button.Label>}
      </Button>
    </View>
  );
}
