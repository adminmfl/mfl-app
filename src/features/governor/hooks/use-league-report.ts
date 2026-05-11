import { useMutation } from '@tanstack/react-query';
import { generateLeagueReport } from '../services/governor.service';

export function useLeagueReport() {
  return useMutation<{ message: string; reportUrl?: string }, Error, string>({
    mutationFn: (leagueId: string) => generateLeagueReport(leagueId),
  });
}
