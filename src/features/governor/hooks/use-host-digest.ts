import { useMutation } from '@tanstack/react-query';
import { requestHostDigest } from '../services/governor.service';

export function useHostDigest() {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (leagueId: string) => requestHostDigest(leagueId),
  });
}
