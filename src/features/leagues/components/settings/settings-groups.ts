import type Feather from '@expo/vector-icons/Feather';

type FeatherIcon = keyof typeof Feather.glyphMap;

export interface SettingsGroup {
  slug: string;
  title: string;
  description: string;
  icon: FeatherIcon;
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    slug: 'general',
    title: 'General & Schedule',
    description: 'League name, description, and dates',
    icon: 'edit-3',
  },
  {
    slug: 'teams',
    title: 'Teams & Rest Days',
    description: 'Team count, capacity, and rest day rules',
    icon: 'users',
  },
  {
    slug: 'visibility',
    title: 'Visibility & Access',
    description: 'Privacy, invite-only, and workout visibility',
    icon: 'eye',
  },
  {
    slug: 'scoring',
    title: 'Scoring & Rankings',
    description: 'RR formula, league mode, and tiered ranking',
    icon: 'bar-chart-2',
  },
  {
    slug: 'activities',
    title: 'Activities',
    description: 'Configure allowed activity types',
    icon: 'activity',
  },
  {
    slug: 'custom-activities',
    title: 'Custom Activities',
    description: 'Create and manage custom activities',
    icon: 'plus-circle',
  },
  {
    slug: 'branding',
    title: 'Branding & Logo',
    description: 'Display name, colors, tagline, and logo',
    icon: 'image',
  },
  {
    slug: 'ai',
    title: 'AI / BYOK',
    description: 'AI provider and API key configuration',
    icon: 'cpu',
  },
  {
    slug: 'lifecycle',
    title: 'Lifecycle / Launch / Delete',
    description: 'Phase transitions, launch, and deletion',
    icon: 'power',
  },
];
