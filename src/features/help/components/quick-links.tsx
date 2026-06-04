import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import type { FeatherIconName } from '../types';

interface QuickLink {
  label: string;
  icon: FeatherIconName;
  iconBg: string;
  iconColor: string;
  onPress: () => void;
}

export function QuickLinks() {
  const router = useRouter();

  const links: QuickLink[] = [
    {
      label: 'Host Support',
      icon: 'award',
      iconBg: '#E0E7FF',
      iconColor: '#4F46E5',
      onPress: () => router.push('/(app)/host-support' as any),
    },
    {
      label: 'Profile',
      icon: 'user',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      onPress: () => router.push('/(app)/profile' as any),
    },
    {
      label: 'Payments',
      icon: 'credit-card',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      onPress: () => router.push('/(app)/payment-checkout' as any),
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10 }}
      className="mb-4"
    >
      {links.map((link) => (
        <Pressable
          key={link.label}
          onPress={link.onPress}
          className="items-center justify-center rounded-xl border border-default-200 p-3"
          style={{ width: 100, height: 80 }}
        >
          <View
            className="w-8 h-8 rounded-lg items-center justify-center mb-1.5"
            style={{ backgroundColor: link.iconBg }}
          >
            <Feather name={link.icon} size={16} color={link.iconColor} />
          </View>
          <AppText className="text-xs font-medium text-foreground text-center" numberOfLines={1}>
            {link.label}
          </AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}
