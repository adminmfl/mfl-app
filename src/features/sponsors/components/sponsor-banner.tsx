import { View, Image, Pressable, Linking } from 'react-native';
import { AppText } from '../../../components/app-text';
import type { LeagueSponsorSlot } from '../types/sponsor.model';

interface SponsorBannerProps {
  slot: LeagueSponsorSlot | null | undefined;
}

export function SponsorBanner({ slot }: SponsorBannerProps) {
  if (!slot?.sponsor) return null;

  const content = (
    <View className="flex-row items-center gap-2">
      <AppText className="text-[10px] text-muted">Sponsored by</AppText>
      {slot.sponsor.logoUrl ? (
        <Image
          source={{ uri: slot.sponsor.logoUrl }}
          style={{ width: 64, height: 20 }}
          resizeMode="contain"
        />
      ) : (
        <AppText className="text-[10px] font-semibold text-muted">
          {slot.sponsor.name}
        </AppText>
      )}
    </View>
  );

  if (slot.sponsor.websiteUrl) {
    return (
      <Pressable onPress={() => Linking.openURL(slot.sponsor!.websiteUrl!)}>
        {content}
      </Pressable>
    );
  }

  return content;
}
