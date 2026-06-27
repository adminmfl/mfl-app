import Feather from '@expo/vector-icons/Feather';
import { Pressable, TextInput, View } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ChallengeTeamMember } from '../types/challenge.model';

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontSize: 15,
  color: mflColors.text,
} as const;

interface SubTeamFormProps {
  isEditing: boolean;
  name: string;
  selectedMembers: string[];
  members: ChallengeTeamMember[];
  membersInOtherSubTeams: Set<string>;
  isMembersLoading: boolean;
  isSaving: boolean;
  onNameChange: (v: string) => void;
  onToggleMember: (leagueMemberId: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SubTeamForm({
  isEditing,
  name,
  selectedMembers,
  members,
  membersInOtherSubTeams,
  isMembersLoading,
  isSaving,
  onNameChange,
  onToggleMember,
  onSave,
  onCancel,
}: SubTeamFormProps) {
  return (
    <View className="rounded-xl border border-default-200 p-3 gap-3">
      <AppText className="text-base font-bold text-foreground">
        {isEditing ? 'Edit Sub-Team' : 'Create Sub-Team'}
      </AppText>

      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Name</AppText>
        <TextInput
          style={inputStyle}
          value={name}
          onChangeText={onNameChange}
          placeholder="e.g. Team Alpha"
          placeholderTextColor={mflColors.textMuted}
        />
      </View>

      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Members</AppText>
        {isMembersLoading ? (
          <View className="items-center py-4">
            <Spinner size="sm" />
          </View>
        ) : members.length === 0 ? (
          <AppText className="text-xs text-muted">No members available for this team.</AppText>
        ) : (
          <View className="gap-2">
            {members.map((member) => {
              const selected = selectedMembers.includes(member.leagueMemberId);
              const blocked = membersInOtherSubTeams.has(member.leagueMemberId);
              return (
                <Pressable
                  key={member.leagueMemberId}
                  onPress={() => onToggleMember(member.leagueMemberId)}
                  disabled={blocked}
                  className="flex-row items-center gap-3 rounded-xl border p-3"
                  style={{
                    opacity: blocked ? 0.55 : 1,
                    borderColor: selected ? mflColors.brand : mflColors.border,
                    backgroundColor: selected ? mflColors.brandLight : mflColors.card,
                  }}
                >
                  <Feather
                    name={selected ? 'check-square' : 'square'}
                    size={18}
                    color={selected ? mflColors.brand : mflColors.textMuted}
                  />
                  <View className="flex-1">
                    <AppText className="text-sm font-semibold text-foreground">
                      {member.fullName}
                    </AppText>
                    {blocked ? (
                      <AppText className="text-xs text-muted mt-0.5">
                        Already in another sub-team
                      </AppText>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View className="flex-row gap-3">
        <Button variant="secondary" size="md" onPress={onCancel} className="flex-1">
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          variant="primary"
          size="md"
          onPress={onSave}
          isDisabled={isSaving || !name.trim()}
          className="flex-1"
        >
          {isSaving ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>{isEditing ? 'Update' : 'Create'}</Button.Label>
          )}
        </Button>
      </View>
    </View>
  );
}
