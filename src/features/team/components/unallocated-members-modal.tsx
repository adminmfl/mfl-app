/**
 * unallocated-members-modal.tsx
 * Modal for leaders to search and bulk-assign unallocated league members to a team.
 */
import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Avatar, Button } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { useAssignMember } from '../hooks/use-assign-member';
import type { LeagueMember } from '../types/team.model';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export interface UnallocatedMembersModalProps {
  visible: boolean;
  onClose: () => void;
  members: LeagueMember[];
  leagueId: string;
  teamId: string;
  teamName: string;
  onAssigned: () => void;
}

export function UnallocatedMembersModal({
  visible,
  onClose,
  members,
  leagueId,
  teamId,
  teamName,
  onAssigned,
}: UnallocatedMembersModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const assignMember = useAssignMember(leagueId, teamId);
  const [assigning, setAssigning] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter((m) => (m.username ?? '').toLowerCase().includes(q));
  }, [members, searchQuery]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.memberId)));
    }
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      for (const memberId of selectedIds) {
        await assignMember.mutateAsync(memberId);
      }
      setSelectedIds(new Set());
      onAssigned();
      onClose();
    } catch {
      // Mutation error is surfaced via react-query toast
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View className="flex-1" style={{ backgroundColor: mflColors.surface }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <View className="flex-1">
            <AppText className="text-lg font-bold text-foreground">Unallocated Members</AppText>
            <AppText className="text-xs text-muted mt-0.5">
              Add to {teamName} ({members.length} available)
            </AppText>
          </View>
          <Pressable onPress={handleClose} className="p-2">
            <Feather name="x" size={22} color={mflColors.text} />
          </Pressable>
        </View>

        {/* Search + Select All */}
        <View className="px-4 pb-2 gap-2">
          <View
            className="flex-row items-center rounded-xl px-3 py-2 gap-2"
            style={{ backgroundColor: mflColors.inkLight }}
          >
            <Feather name="search" size={16} color={mflColors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search members..."
              placeholderTextColor={mflColors.textMuted}
              className="flex-1 text-sm"
              style={{ color: mflColors.text, padding: 0 }}
            />
          </View>
          {filtered.length > 0 && (
            <Pressable onPress={toggleAll}>
              <AppText className="text-xs font-semibold" style={{ color: mflColors.brand }}>
                {selectedIds.size === filtered.length ? 'Deselect All' : 'Select All'}
              </AppText>
            </Pressable>
          )}
        </View>

        {/* Member list */}
        <ScrollView className="flex-1 px-4">
          {filtered.length > 0 ? (
            filtered.map((member) => {
              const isSelected = selectedIds.has(member.memberId);
              return (
                <Pressable
                  key={member.memberId}
                  onPress={() => !assigning && toggleMember(member.memberId)}
                  className="flex-row items-center py-3 gap-3"
                >
                  <View
                    className="w-5 h-5 rounded items-center justify-center"
                    style={{
                      backgroundColor: isSelected ? mflColors.brand : 'transparent',
                      borderWidth: isSelected ? 0 : 1.5,
                      borderColor: mflColors.border,
                    }}
                  >
                    {isSelected && <Feather name="check" size={14} color={mflColors.white} />}
                  </View>
                  <Avatar size="sm" alt={member.username ?? 'User'}>
                    <Avatar.Fallback>
                      <AppText className="text-xs font-semibold">
                        {getInitials(member.username ?? '??')}
                      </AppText>
                    </Avatar.Fallback>
                  </Avatar>
                  <AppText className="flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
                    {member.username ?? 'Unknown'}
                  </AppText>
                  {member.roles.includes('host') && (
                    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: mflColors.amberLight }}>
                      <AppText className="text-[10px] font-semibold" style={{ color: mflColors.amber }}>
                        Host
                      </AppText>
                    </View>
                  )}
                </Pressable>
              );
            })
          ) : (
            <View className="py-8 items-center">
              <AppText className="text-sm text-muted">
                {searchQuery ? 'No members found' : 'No unallocated members'}
              </AppText>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="px-4 pb-6 pt-3" style={{ borderTopWidth: 1, borderTopColor: mflColors.border }}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleAssign}
            isDisabled={selectedIds.size === 0 || assigning}
            className="w-full"
          >
            <Button.Label>
              {assigning ? 'Assigning...' : `Add Selected (${selectedIds.size})`}
            </Button.Label>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
