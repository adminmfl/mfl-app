import { Surface } from 'heroui-native';
import { AppText } from './app-text';

interface StatCardProps {
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ value, label, color }: StatCardProps) {
  return (
    <Surface className="flex-1 items-center py-3 px-2 rounded-xl">
      <AppText className="text-lg font-bold" style={color ? { color } : undefined}>
        {value}
      </AppText>
      <AppText className="text-[10px] text-muted mt-0.5">{label}</AppText>
    </Surface>
  );
}
