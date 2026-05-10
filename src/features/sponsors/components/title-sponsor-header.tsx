import { View, Image, Pressable, Linking } from 'react-native';
import { AppText } from '../../../components/app-text';
import type { LeagueSponsorSlot } from '../types/sponsor.model';

interface TitleSponsorHeaderProps {
  slot: LeagueSponsorSlot | null | undefined;
}

export function TitleSponsorHeader({ slot }: TitleSponsorHeaderProps) {
  if (!slot?.sponsor) return null;

  const logo = slot.sponsor.logoUrl ? (
    <Image
      source={{ uri: slot.sponsor.logoUrl }}
      style={{ width: 120, height: 36 }}
      resizeMode="contain"
    />
  ) : (
    <AppText className="text-base font-bold text-foreground">
      {slot.sponsor.name}
    </AppText>
  );

  return (
    <View className="flex-row items-center gap-3">
      {slot.sponsor.websiteUrl ? (
        <Pressable onPress={() => Linking.openURL(slot.sponsor!.websiteUrl!)}>
          {logo}
        </Pressable>
      ) : (
        logo
      )}
      <AppText className="text-[10px] text-muted">Powered by MFL</AppText>
    </View>
  );
}
