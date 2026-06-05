import type Feather from '@expo/vector-icons/Feather';

export interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}

export interface PolicySectionData {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  paragraphs: string[];
  restrictedList?: { heading: string; items: string[] };
  bulletList?: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}
