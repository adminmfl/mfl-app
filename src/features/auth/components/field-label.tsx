import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface FieldLabelProps {
  children: string;
  required?: boolean;
}

export function FieldLabel({ children, required = false }: FieldLabelProps) {
  return (
    <View className="flex-row items-center gap-0.5">
      <AppText className="text-sm font-medium text-muted">{children}</AppText>
      {required ? (
        <AppText className="text-sm font-medium" style={{ color: mflColors.danger }}>
          *
        </AppText>
      ) : null}
    </View>
  );
}
