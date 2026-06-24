import { Pressable, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { LeagueActivity } from '../types';

interface ActivityTypePickerProps {
  activities: LeagueActivity[];
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function ActivityTypePicker({
  activities,
  value,
  error,
  onChange,
}: ActivityTypePickerProps) {
  return (
    <View className="gap-2">
      <AppText className="text-sm font-semibold text-muted">Activity Type</AppText>
      <View className="flex-row flex-wrap gap-2">
        {activities.map((activity) => {
          const isSelected = value === activity.value;
          return (
            <Pressable
              key={activity.activity_id}
              onPress={() => onChange(activity.value)}
              className={`px-5 py-2 rounded-full border ${
                isSelected ? 'border-transparent' : 'border-default-200 bg-card'
              }`}
              style={
                isSelected
                  ? { backgroundColor: mflColors.brand, borderColor: mflColors.brand }
                  : undefined
              }
            >
              <AppText
                className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}
              >
                {activity.activity_name}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error && (
        <AppText className="text-sm" style={{ color: mflColors.danger }}>
          {error}
        </AppText>
      )}
    </View>
  );
}
