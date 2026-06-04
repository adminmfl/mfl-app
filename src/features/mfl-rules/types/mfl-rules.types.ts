import type { ComponentProps } from 'react';
import Feather from '@expo/vector-icons/Feather';

export type FeatherIconName = ComponentProps<typeof Feather>['name'];

export interface RuleSectionData {
  title: string;
  subtitle?: string;
  icon: FeatherIconName;
  iconColor: string;
  iconBackground: string;
  items: string[];
}

export interface RoleDetail {
  heading: string;
  items?: string[];
  text?: string;
}

export interface RoleCardData {
  title: string;
  subtitle: string;
  icon: FeatherIconName;
  iconColor: string;
  iconBackground: string;
  details: RoleDetail[];
}
