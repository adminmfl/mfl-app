import Feather from '@expo/vector-icons/Feather';
import { Pressable, ScrollView, View } from 'react-native';
import { Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ChatTeam } from '../types/messaging.model';
import { MessagingChip } from './messaging-chip';

interface ChatChannelSelectorProps {
  teams: ChatTeam[];
  isLoading: boolean;
  isError: boolean;
  selectedTeamId: string | null;
  adminView: boolean;
  onSelectTeam: (teamId: string | null) => void;
  onToggleAdminView: () => void;
  onRetry: () => void;
}

export function ChatChannelSelector({
  teams,
  isLoading,
  isError,
  selectedTeamId,
  adminView,
  onSelectTeam,
  onToggleAdminView,
  onRetry,
}: ChatChannelSelectorProps) {
  if (isError) {
    return (
      <Card className="gap-3 p-4">
        <AppText className="text-sm text-muted">Teams could not be loaded.</AppText>
        <MessagingChip label="Retry" icon="refresh-cw" onPress={onRetry} />
      </Card>
    );
  }

  return (
    <Card className="gap-3 p-4">
      <View className="flex-row items-center gap-2">
        <Feather name="message-circle" size={17} color={mflColors.brand} />
        <AppText className="flex-1 text-sm font-semibold text-foreground">
          Channels
        </AppText>
        {isLoading ? <Spinner size="sm" /> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pr-4">
          <MessagingChip
            label="All Teams"
            icon="radio"
            selected={selectedTeamId === null}
            onPress={() => onSelectTeam(null)}
            tone="amber"
          />
          {teams.map((team) => (
            <MessagingChip
              key={team.teamId}
              label={`${team.teamName} (${team.memberCount})`}
              icon="users"
              selected={selectedTeamId === team.teamId}
              onPress={() => onSelectTeam(team.teamId)}
            />
          ))}
        </View>
      </ScrollView>

      {selectedTeamId ? (
        <Pressable
          onPress={onToggleAdminView}
          accessibilityRole="switch"
          accessibilityState={{ checked: adminView }}
          className="flex-row items-center justify-between rounded-xl px-3 py-2"
          style={{ backgroundColor: mflColors.surface }}
        >
          <View className="flex-row items-center gap-2">
            <Feather name="shield" size={16} color={mflColors.amber} />
            <AppText className="text-sm font-semibold text-foreground">
              Admin View
            </AppText>
          </View>
          <View
            className="h-7 w-12 justify-center rounded-full px-0.5"
            style={{ backgroundColor: adminView ? mflColors.amber : mflColors.border }}
          >
            <View
              className="h-6 w-6 rounded-full"
              style={{
                backgroundColor: mflColors.white,
                alignSelf: adminView ? 'flex-end' : 'flex-start',
              }}
            />
          </View>
        </Pressable>
      ) : null}
    </Card>
  );
}
