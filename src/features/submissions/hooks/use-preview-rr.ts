import { useMutation } from '@tanstack/react-query';
import { previewRR } from '../services/submission.service';
import { toRRPreview } from '../mappers/submission.mapper';
import type { PreviewRRRequestDTO } from '../types/submission.dto';
import type { RRPreview } from '../types/submission.model';

export function usePreviewRR() {
  return useMutation<RRPreview, Error, PreviewRRRequestDTO>({
    mutationFn: async (data) => {
      const dto = await previewRR(data);
      return toRRPreview(dto);
    },
  });
}
