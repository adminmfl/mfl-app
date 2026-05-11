import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';

interface MetricCardProps {
  label: string;
  value: string;
  color: string;
  subtitle?: string;
}

export function MetricCard({ label, value, color, subtitle }: MetricCardProps) {
  return (
    <Card className="flex-1 p-4">
      <AppText className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
        {label}
      </AppText>
      <AppText className="text-2xl font-extrabold" style={{ color }}>
        {value}
      </AppText>
      {subtitle && (
        <AppText className="text-[11px] text-muted mt-0.5">{subtitle}</AppText>
      )}
    </Card>
  );
}
