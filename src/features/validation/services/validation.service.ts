import { api } from '../../../core/api';
import type {
  SubmissionsResponseDTO,
  ValidateSubmissionRequestDTO,
  ValidateSubmissionResponseDTO,
} from '../types/validation.dto';

export async function fetchSubmissionsForValidation(
  leagueId: string,
  status?: string,
): Promise<SubmissionsResponseDTO> {
  const res = await api.get<SubmissionsResponseDTO>(
    `/api/leagues/${leagueId}/submissions`,
    { params: status ? { status } : undefined },
  );
  return res.data;
}

export async function validateSubmission(
  submissionId: string | number,
  data: ValidateSubmissionRequestDTO,
): Promise<ValidateSubmissionResponseDTO> {
  const res = await api.post<ValidateSubmissionResponseDTO>(
    `/api/submissions/${submissionId}/validate`,
    data,
  );
  return res.data;
}
