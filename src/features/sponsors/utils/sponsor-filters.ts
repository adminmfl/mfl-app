import type { LeagueSponsorSlot, SponsorCategory } from '../types/sponsor.model';

export function filterSlotsByCategory(
  slots: LeagueSponsorSlot[],
  category: SponsorCategory,
): LeagueSponsorSlot[] {
  return slots.filter((s) => s.category === category && s.enabled);
}

export function getTitleSponsor(
  slots: LeagueSponsorSlot[],
): LeagueSponsorSlot | null {
  return slots.find((s) => s.category === 'title' && s.enabled) ?? null;
}

export function getGrandFinaleSponsor(
  slots: LeagueSponsorSlot[],
): LeagueSponsorSlot | null {
  return slots.find((s) => s.category === 'grand_finale' && s.enabled) ?? null;
}

export function getTeamSponsor(
  slots: LeagueSponsorSlot[],
  teamId: string,
): LeagueSponsorSlot | null {
  return (
    slots.find(
      (s) => s.category === 'team' && s.enabled && s.teamId === teamId,
    ) ?? null
  );
}

export function getChallengeSponsor(
  slots: LeagueSponsorSlot[],
  challengeId: string,
): LeagueSponsorSlot | null {
  return (
    slots.find(
      (s) =>
        s.category === 'challenge' &&
        s.enabled &&
        s.challengeId === challengeId,
    ) ?? null
  );
}
