import Feather from '@expo/vector-icons/Feather';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button, Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { SubmissionTeam } from '../types/validation.model';
import {
  getTeamLabel,
  STATUS_FILTERS,
  type StatusFilter,
} from '../utils/validation-utils';

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 11,
  fontSize: 15,
  color: mflColors.text,
};

interface ValidationFilterPanelProps {
  statusFilter: StatusFilter;
  teamFilter: string;
  dateFilter: string;
  searchText: string;
  teams: SubmissionTeam[];
  onStatusChange: (value: StatusFilter) => void;
  onTeamChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function ValidationFilterPanel({
  statusFilter,
  teamFilter,
  dateFilter,
  searchText,
  teams,
  onStatusChange,
  onTeamChange,
  onDateChange,
  onSearchChange,
}: ValidationFilterPanelProps) {
  return (
    <Card className="p-4 gap-4">
      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Search</AppText>
        <View className="relative">
          <TextInput
            style={{ ...inputStyle, paddingLeft: 40 }}
            value={searchText}
            onChangeText={onSearchChange}
            placeholder="Search by member..."
            placeholderTextColor={mflColors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View className="absolute left-3 top-3">
            <Feather name="search" size={18} color={mflColors.textMuted} />
          </View>
        </View>
      </View>

      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Status</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-4">
            {STATUS_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                active={statusFilter === filter.value}
                onPress={() => onStatusChange(filter.value)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Teams</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-4">
            <FilterChip
              label="All Teams"
              active={teamFilter === 'all'}
              onPress={() => onTeamChange('all')}
            />
            {teams.map((team) => (
              <FilterChip
                key={team.teamId}
                label={getTeamLabel(team)}
                active={teamFilter === team.teamId}
                onPress={() => onTeamChange(team.teamId)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Date</AppText>
        <View className="flex-row gap-2">
          <TextInput
            style={{ ...inputStyle, flex: 1 }}
            value={dateFilter}
            onChangeText={onDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          {dateFilter ? (
            <Button variant="secondary" size="md" onPress={() => onDateChange('')}>
              <Feather name="x" size={18} color={mflColors.text} />
            </Button>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="px-4 py-2 rounded-full border"
      style={{
        backgroundColor: active ? mflColors.brand : mflColors.card,
        borderColor: active ? mflColors.brand : mflColors.border,
      }}
    >
      <AppText className="text-sm font-semibold" style={{ color: active ? '#fff' : mflColors.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}
