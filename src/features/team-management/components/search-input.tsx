import { TextInput } from 'react-native';

import { mflColors } from '../../../constants/colors';
import { inputStyle } from '../utils/input-style';

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
