import { api } from '../../../core/api';
import type { ValidateInviteResponseDTO, JoinByInviteResponseDTO, ValidateTeamInviteResponseDTO, JoinByTeamInviteResponseDTO } from '../types/invite.dto';

export async function validateInviteCode(code: string): Promise<ValidateInviteResponseDTO> {
  const res = await api.get<ValidateInviteResponseDTO>(`/api/invite/${code}`);
  return res.data;
}

export async function joinByInviteCode(code: string): Promise<JoinByInviteResponseDTO> {
  const res = await api.post<JoinByInviteResponseDTO>(`/api/invite/${code}`);
  return res.data;
}

export async function validateTeamInvite(code: string): Promise<ValidateTeamInviteResponseDTO> {
  const res = await api.get<ValidateTeamInviteResponseDTO>(`/api/invite/team/${code}`);
  return res.data;
}

export async function joinByTeamInvite(code: string): Promise<JoinByTeamInviteResponseDTO> {
  const res = await api.post<JoinByTeamInviteResponseDTO>(`/api/invite/team/${code}`);
  return res.data;
}
