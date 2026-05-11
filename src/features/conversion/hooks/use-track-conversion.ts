import { useMutation } from '@tanstack/react-query';
import {
  trackConversionEvent,
  type ConversionStage,
} from '../services/conversion.service';

export function useTrackConversion() {
  return useMutation({
    mutationFn: ({
      stage,
      sourceLeagueId,
    }: {
      stage: ConversionStage;
      sourceLeagueId: string;
    }) => trackConversionEvent(stage, sourceLeagueId),
  });
}
