export type ManualEntryKind = 'workout' | 'rest';

export type ManualEntryStatus = 'pending' | 'approved' | 'rejected';

export type ManualEntryState =
  | 'missed'
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'upcoming'
  | 'nodata';

export interface ManualEntryMemberDTO {
  league_member_id: string;
  user_id: string;
  username: string;
  email: string;
  team_id: string | null;
  team_name: string | null;
}

export interface ManualEntryMembersResponseDTO {
  success: boolean;
  data: ManualEntryMemberDTO[];
}

export interface ManualEntryDTO {
  id: string;
  date: string;
  type: ManualEntryKind;
  workout_type: string | null;
  duration: number | null;
  distance: number | null;
  steps: number | null;
  holes: number | null;
  rr_value: number | null;
  status: ManualEntryStatus;
  proof_url: string | null;
  notes: string | null;
  created_date?: string | null;
  modified_date?: string | null;
}

export interface ManualEntryEntriesResponseDTO {
  success: boolean;
  data: {
    entries: ManualEntryDTO[];
  };
}

export interface ManualEntrySaveRequestDTO {
  league_member_id: string;
  date: string;
  type: ManualEntryKind;
  workout_type: string | null;
  duration: number | null;
  distance: number | null;
  steps: number | null;
  holes: number | null;
  rr_value: number | null;
  proof_url: string | null;
  notes: string | null;
  overwriteExisting: boolean;
}

export interface ManualEntrySaveResponseDTO {
  success: boolean;
  data: ManualEntryDTO;
}

export interface ManualEntryMember {
  leagueMemberId: string;
  userId: string;
  username: string;
  email: string;
  teamId: string | null;
  teamName: string | null;
}

export interface ManualWeekRow {
  date: string;
  label: string;
  entry: ManualEntryDTO | null;
  state: ManualEntryState;
  pointsLabel: string;
}

export interface ManualEntryForm {
  type: ManualEntryKind;
  workoutType: string;
  duration: string;
  distance: string;
  steps: string;
  holes: string;
  proofUrl: string;
  notes: string;
}

export interface PickedProofImage {
  uri: string;
  name: string;
  type: string;
}
