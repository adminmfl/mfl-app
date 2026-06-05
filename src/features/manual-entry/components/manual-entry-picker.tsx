import Feather from '@expo/vector-icons/Feather';
import { View, Pressable, ScrollView } from 'react-native';
import { Avatar, Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type { ManualEntryMember } from '../types/manual-entry';
import { getInitials, normalizedTeamName } from '../utils/manual-entry-utils';

interface ManualEntryPickerProps {
  members: ManualEntryMember[];
  teamOptions: string[];
  selectedTeam: string;
  selectedMemberId: string;
  weekLabel: string;
  canGoNextWeek: boolean;
  onSelectTeam: (team: string) => void;
  onSelectMember: (memberId: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function ManualEntryPicker({
  members,
  teamOptions,
  selectedTeam,
  selectedMemberId,
  weekLabel,
  canGoNextWeek,
  onSelectTeam,
  onSelectMember,
  onPreviousWeek,
  onNextWeek,
}: ManualEntryPickerProps) {
  const filteredMembers =
    selectedTeam === ''
      ? []
      : selectedTeam === 'all'
        ? members
        : members.filter((member) => normalizedTeamName(member.teamName) === selectedTeam);

  const selectedMember = members.find(
    (member) => member.leagueMemberId === selectedMemberId,
  );

  return (
    <Card className="p-4 gap-5">
      <View className="gap-1">
        <AppText className="text-base font-semibold text-foreground">
          Pick a player
        </AppText>
        <AppText className="text-xs text-muted">
          Select the player to manage, then adjust the week and add or overwrite entries.
        </AppText>
      </View>

      <View className="gap-2">
        <SectionLabel label="Team" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-4">
            <TeamChip
              label="All teams"
              isSelected={selectedTeam === 'all'}
              onPress={() => onSelectTeam('all')}
            />
            {teamOptions.map((team) => (
              <TeamChip
                key={team}
                label={team}
                isSelected={selectedTeam === team}
                onPress={() => onSelectTeam(team)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="gap-2">
        <SectionLabel label="Player" />
        {!selectedTeam ? (
          <View className="rounded-xl border border-default-200 p-4 bg-default-50">
            <AppText className="text-sm text-muted">Select a team first.</AppText>
          </View>
        ) : filteredMembers.length === 0 ? (
          <View className="rounded-xl border border-default-200 p-4 bg-default-50">
            <AppText className="text-sm text-muted">No players found for this team.</AppText>
          </View>
        ) : (
          <View className="gap-2">
            {filteredMembers.map((member) => {
              const isSelected = selectedMemberId === member.leagueMemberId;
              const displayName = member.username || member.email || 'Unknown';
              return (
                <Pressable
                  key={member.leagueMemberId}
                  onPress={() => onSelectMember(member.leagueMemberId)}
                  className="rounded-xl border p-3"
                  style={
                    isSelected
                      ? {
                          borderColor: mflColors.brand,
                          backgroundColor: mflColors.brandLight,
                        }
                      : { borderColor: mflColors.border, backgroundColor: mflColors.card }
                  }
                >
                  <View className="flex-row items-center gap-3">
                    <Avatar size="sm" alt={displayName}>
                      <Avatar.Fallback>{getInitials(displayName)}</Avatar.Fallback>
                    </Avatar>
                    <View className="flex-1">
                      <AppText className="text-sm font-semibold text-foreground">
                        {displayName}
                      </AppText>
                      <AppText className="text-xs text-muted">
                        {member.email || normalizedTeamName(member.teamName)}
                      </AppText>
                    </View>
                    {isSelected && (
                      <Feather name="check-circle" size={18} color={mflColors.brand} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View className="gap-2">
        <SectionLabel label="Week" />
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={onPreviousWeek}
            disabled={!selectedMemberId}
            className="w-11 h-11 rounded-full items-center justify-center bg-default-100"
          >
            <Feather
              name="chevron-left"
              size={22}
              color={selectedMemberId ? mflColors.text : mflColors.textMuted}
            />
          </Pressable>
          <View className="flex-1 rounded-xl border border-default-200 bg-default-50 px-3 py-3">
            <AppText className="text-sm font-semibold text-foreground text-center">
              {weekLabel}
            </AppText>
            {selectedMember ? (
              <AppText className="text-xs text-muted text-center mt-1">
                {selectedMember.username || selectedMember.email}
              </AppText>
            ) : null}
          </View>
          <Pressable
            onPress={onNextWeek}
            disabled={!selectedMemberId || !canGoNextWeek}
            className="w-11 h-11 rounded-full items-center justify-center bg-default-100"
          >
            <Feather
              name="chevron-right"
              size={22}
              color={
                selectedMemberId && canGoNextWeek ? mflColors.text : mflColors.textMuted
              }
            />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

function TeamChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="px-4 py-2 rounded-full border"
      style={
        isSelected
          ? { backgroundColor: mflColors.brand, borderColor: mflColors.brand }
          : { backgroundColor: mflColors.card, borderColor: mflColors.border }
      }
    >
      <AppText
        className="text-sm font-medium"
        style={{ color: isSelected ? mflColors.white : mflColors.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
