import { TextInput } from 'react-native';

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

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search members...',
}: SearchInputProps) {
  return (
    <TextInput
      style={inputStyle}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={mflColors.textMuted}
      autoCapitalize="none"
    />
  );
}
