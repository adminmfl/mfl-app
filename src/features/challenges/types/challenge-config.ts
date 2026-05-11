import type { ChallengeType } from './challenge.model';

export interface ChallengeConfigForm {
  name: string;
  description: string;
  challengeType: ChallengeType;
  totalPoints: string;
  docUrl: string;
  startDate: string;
  endDate: string;
  isUniqueWorkout: boolean;
}

export const EMPTY_CHALLENGE_FORM: ChallengeConfigForm = {
  name: '',
  description: '',
  challengeType: 'individual',
  totalPoints: '',
  docUrl: '',
  startDate: '',
  endDate: '',
  isUniqueWorkout: false,
};

export interface PickedChallengeDocument {
  uri: string;
  name: string;
  type: string;
}
