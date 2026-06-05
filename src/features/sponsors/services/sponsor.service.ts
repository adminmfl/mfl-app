import { api } from '../../../core/api';
import type {
  LeagueSponsorsResponseDTO,
  SponsorSlotUpdateDTO,
} from '../types/sponsor.dto';

export async function fetchLeagueSponsors(
  leagueId: string,
): Promise<LeagueSponsorsResponseDTO> {
  const res = await api.get<LeagueSponsorsResponseDTO>(
    `/api/leagues/${leagueId}/sponsors`,
  );
  return res.data;
}

export async function updateSponsorSlots(
  leagueId: string,
  updates: SponsorSlotUpdateDTO[],
): Promise<void> {
  await api.patch(`/api/leagues/${leagueId}/sponsors/slots`, { updates });
}

export async function deleteSponsorSlot(
  leagueId: string,
  slotId: string,
): Promise<void> {
  await api.delete(`/api/leagues/${leagueId}/sponsors/slots/${slotId}`);
}
