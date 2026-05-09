import type {
  RestDayDonation,
  RestDayDonationMember,
  RestDayDonationStatus,
} from '../types/rest-day-donation.model';

export function normalizedTeamName(teamName: string | null): string {
  return teamName && teamName.trim().length > 0 ? teamName : 'Unassigned';
}

export function formatDonationDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getTeamOptions(members: RestDayDonationMember[]): string[] {
  const names = new Set<string>();
  members.forEach((member) => names.add(normalizedTeamName(member.teamName)));
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export function getFilteredMembers(
  members: RestDayDonationMember[],
  selectedTeam: string,
): RestDayDonationMember[] {
  if (!selectedTeam) return [];
  if (selectedTeam === 'all') return members;
  return members.filter(
    (member) => normalizedTeamName(member.teamName) === selectedTeam,
  );
}

export function getMyDonations(
  donations: RestDayDonation[],
  userMemberId: string,
): RestDayDonation[] {
  if (!userMemberId) return [];
  return donations.filter(
    (donation) =>
      donation.donor.memberId === userMemberId ||
      donation.receiver.memberId === userMemberId,
  );
}

export function getPendingDonationsForRole({
  donations,
  isCaptainOnly,
  userTeamId,
}: {
  donations: RestDayDonation[];
  isCaptainOnly: boolean;
  userTeamId: string | null;
}): RestDayDonation[] {
  return donations.filter((donation) => {
    if (donation.status !== 'pending') return false;
    if (isCaptainOnly) return donation.donor.teamId === userTeamId;
    return true;
  });
}

export function getCaptainApprovedDonations(
  donations: RestDayDonation[],
): RestDayDonation[] {
  return donations.filter((donation) => donation.status === 'captain_approved');
}

export function getStatusLabel(status: RestDayDonationStatus): string {
  switch (status) {
    case 'captain_approved':
      return 'Captain Approved';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'pending':
    default:
      return 'Pending';
  }
}

export function getProofNameFromUri(uri: string, fallbackPrefix: string): string {
  const cleanUri = uri.split('?')[0] ?? uri;
  const name = cleanUri.split('/').pop();
  if (name && name.includes('.')) return name;
  return `${fallbackPrefix}-${Date.now()}.jpg`;
}

export function inferProofMimeType(fileName: string, fallback = 'image/jpeg'): string {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.png')) return 'image/png';
  if (lowerName.endsWith('.gif')) return 'image/gif';
  if (lowerName.endsWith('.webp')) return 'image/webp';
  if (lowerName.endsWith('.pdf')) return 'application/pdf';
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  return fallback;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const maybeError = error as {
    response?: { data?: { error?: string; message?: string } };
    message?: string;
  } | null;

  return (
    maybeError?.response?.data?.error ||
    maybeError?.response?.data?.message ||
    maybeError?.message ||
    fallback
  );
}
