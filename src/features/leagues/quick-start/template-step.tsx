import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { TEMPLATES, type QuickStartTemplate } from './quick-start.types';

interface Props {
  onSelect: (template: QuickStartTemplate) => void;
}

export function TemplateStep({ onSelect }: Props) {
  return (
    <View className="gap-4">
      <View>
        <AppText className="text-lg font-bold text-foreground">Choose a Template</AppText>
        <AppText className="text-sm text-muted">
          Pick a pre-configured league format to get started quickly.
        </AppText>
      </View>

      {TEMPLATES.map((template) => (
        <Pressable
          key={template.id}
          onPress={() => onSelect(template)}
          className="rounded-xl p-4"
          style={{
            backgroundColor: mflColors.white,
            borderWidth: 1,
            borderColor: mflColors.border,
          }}
        >
          {/* Title */}
          <View className="flex-row items-center gap-2 mb-1">
            <Feather name="award" size={18} color={mflColors.brand} />
            <AppText className="text-base font-bold text-foreground">{template.title}</AppText>
          </View>
          <AppText className="text-xs text-muted mb-3">{template.subtitle}</AppText>

          {/* Stats row */}
          <View className="flex-row gap-3 mb-3">
            <StatBadge icon="calendar" value={template.duration} label="Days" />
            <StatBadge icon="activity" value={template.activities} label="Activities" />
            <StatBadge icon="coffee" value={template.restDays} label="Rest Days" />
          </View>

          {/* Activity chips */}
          <View className="flex-row flex-wrap gap-1.5">
            {template.activityList.map((activity) => (
              <View
                key={activity}
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: mflColors.brandLight }}
              >
                <AppText className="text-[11px] font-medium" style={{ color: mflColors.brand }}>
                  {activity}
                </AppText>
              </View>
            ))}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function StatBadge({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View className="flex-1 items-center p-2 rounded-lg" style={{ backgroundColor: mflColors.inkLight }}>
      <Feather name={icon} size={14} color={mflColors.brand} />
      <AppText className="text-base font-bold text-foreground mt-0.5">{value}</AppText>
      <AppText className="text-[10px] text-muted">{label}</AppText>
    </View>
  );
}
