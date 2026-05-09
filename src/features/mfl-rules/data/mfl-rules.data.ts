import { mflColors } from '../../../constants/colors';
import type { RoleCardData } from '../types/mfl-rules.types';

export const universalPrinciples = [
  "If it's not logged correctly in the app, it doesn't count",
  'Fair play and honesty matter more than rankings',
  'Authority flows: Player \u2192 Captain \u2192 Governor',
  'Governors safeguard trust so Hosts can run league',
  'Rules are fixed once announced; changes are rare and explicit',
];

export const acceptedProofs = [
  'Screenshot from a fitness app posted same day by all participants.',
  'Screenshot must clearly show: 1. Date 2. Activity type 3. Duration 4. Distance/Steps (add Heart rate & calories if available or when any of above 4 missing).',
  'Golf proof required: a photo of player at the course \u2013 tee, green, or club sign, PLUS either a scorecard photo or a golf app screenshot showing date and holes played.',
  'Keep full 90-day history on your device for final tally.',
  "For kids under 18 that are not allowed to use watch in school, but do their approved workout in school hours \u2013 they can say so (day, activity & mins) in Team's whatsapp group and use that screenshot as proof.",
  'No dropouts are expected during the tournament, except for Medical Emergency (ME). Otherwise, dropouts will affect the team score.',
  'PFL Medical Emergency (ME) Rule: If a player has a verified Medical Emergency (7+ days of being unable to do any approved workout, and approved by Governors), their rest days are used first. If more days are needed, other PFL players may voluntarily donate unused rest days to support the ME player \u2014 in the true spirit of Pristine.',
];

export const roleCards: RoleCardData[] = [
  {
    title: 'Player (Participant)',
    subtitle: 'Participate honestly and consistently',
    icon: 'user',
    iconColor: mflColors.textSub,
    iconBackground: mflColors.inkLight,
    details: [
      {
        heading: 'Responsibilities',
        items: [
          'Completes activities as per league rules',
          'Logs activities accurately within deadlines',
          'Maintains proof if required by league',
          'Can correct entries only when rejected by Captain/Governor',
          'Plays in the spirit of the league',
        ],
      },
      {
        heading: 'In-app usage',
        text: 'Activity logging, score tracking, event participation',
      },
    ],
  },
  {
    title: 'Captain (Team Leader & Motivator)',
    subtitle: 'Enable participation, accuracy, and morale',
    icon: 'users',
    iconColor: mflColors.brand,
    iconBackground: mflColors.brandLight,
    details: [
      {
        heading: 'Responsibilities',
        items: [
          'Leads and coordinates a team',
          'Helps players log activities correctly and on time',
          'If a player logs incorrectly or misses a deadline: Captain can reject the entry, enabling re-submission within allowed window',
          'Ensures team participation in events and challenges',
          'First point of escalation before Governor involvement',
        ],
      },
      {
        heading: 'In-app powers',
        text: 'Team management, review/reject team entries, coordination',
      },
    ],
  },
  {
    title: 'Governor (Fairness & Authority)',
    subtitle: 'Protect integrity, fairness, and spirit of the league',
    icon: 'shield',
    iconColor: mflColors.blue,
    iconBackground: mflColors.blueLight,
    details: [
      {
        heading: 'Final authority on',
        items: ['Rule interpretation', 'Disputes and edge cases', 'Exceptions and overrides'],
      },
      {
        heading: 'Powers',
        items: [
          'Can review all participant activity logs',
          'Can reject incorrect entries and edit/correct logs after review',
        ],
      },
      {
        heading: 'Oversees',
        items: [
          'Fair play and misuse',
          'Medical or exceptional situations (if applicable)',
          'Penalties or adjustments (if defined by league rules)',
        ],
      },
      {
        heading: 'In-app powers',
        text: 'Global visibility, reject/edit entries, override corrections',
      },
    ],
  },
  {
    title: 'Host (League Owner)',
    subtitle: 'Design, launch, and run the league',
    icon: 'award',
    iconColor: mflColors.amber,
    iconBackground: mflColors.amberLight,
    details: [
      {
        heading: 'Responsibilities',
        items: [
          'Creates the league, teams, events, rules, and scoring in MFL',
          'Defines the vision and intent of the league (fitness, fun, friendship etc.)',
          'Publishes all official announcements and timelines',
          'Owns end-to-end execution and experience',
        ],
      },
      {
        heading: 'In-app powers',
        text: 'League setup, event creation, announcements, full league visibility',
      },
    ],
  },
];
