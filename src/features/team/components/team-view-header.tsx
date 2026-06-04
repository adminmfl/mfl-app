import { View } from 'react-native';
import { Avatar, Chip } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { DarkHeaderCard } from '../../../components/dark-header-card';
import { mflColors } from '../../../constants/colors';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function capitalizeName(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

interface TeamViewHeaderProps {
  teamName: string;
  teamLogoUrl: string | null;
  captainName: string | null;
  memberCount: number;
}

export function TeamViewHeader({
  teamName,
  teamLogoUrl,
  captainName,
  memberCount,
}: TeamViewHeaderProps) {
  return (
    <View className="gap-3">
      <DarkHeaderCard
        title={teamName}
        subtitle="View your team members and performance"
      >
        {teamLogoUrl ? (
          <View className="mt-3">
            <Avatar size="lg" alt={teamName}>
              <Avatar.Image source={{ uri: teamLogoUrl }} />
              <Avatar.Fallback>
                <AppText
                  className="text-base font-bold"
                  style={{ color: mflColors.white }}
                >
                  {getInitials(teamName)}
                </AppText>
              </Avatar.Fallback>
            </Avatar>
          </View>
        ) : null}
      </DarkHeaderCard>

      <View className="flex-row flex-wrap gap-2">
        {captainName && (
          <Chip size="sm" variant="soft">
            <Chip.Label>
              <Feather name="award" size={10} color={mflColors.amber} />{' '}
              Captain: {capitalizeName(captainName)}
            </Chip.Label>
          </Chip>
        )}
        <Chip size="sm" variant="soft">
          <Chip.Label>
            <Feather name="users" size={10} color={mflColors.textSub} />{' '}
            {memberCount} Members
          </Chip.Label>
        </Chip>
      </View>
    </View>
  );
}
