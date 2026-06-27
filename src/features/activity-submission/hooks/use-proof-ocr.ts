/**
 * useProofOcr — Hook for extracting workout data from proof images via server OCR.
 *
 * Sends the image to POST /api/ocr/extract and returns structured extraction
 * results with confidence scores.
 */
import { useState, useCallback } from 'react';
import { api, getInMemoryAccessToken } from '../../../core/api';
import { env } from '../../../core/config/env';
import type { OcrExtraction } from '../../../lib/ocr/types';
import { CONFIDENCE_THRESHOLD } from '../../../lib/ocr/types';
import type { ProofImage } from '../types';

export type OcrStatus = 'idle' | 'processing' | 'done' | 'error';

export interface UseProofOcrReturn {
  extraction: OcrExtraction | null;
  status: OcrStatus;
  error: string | null;
  extract: (image: ProofImage) => Promise<OcrExtraction | null>;
  reset: () => void;
}

export function useProofOcr(): UseProofOcrReturn {
  const [extraction, setExtraction] = useState<OcrExtraction | null>(null);
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(
    async (image: ProofImage): Promise<OcrExtraction | null> => {
      setStatus('processing');
      setError(null);
      setExtraction(null);

      try {
        if (!getInMemoryAccessToken()) {
          setError('Please sign in again to scan proof images.');
          setStatus('error');
          return null;
        }

        const formData = new FormData();
        formData.append('file', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);

        // Match other working RN multipart uploads (proof, challenge docs).
        const res = await api.post<{ success: boolean; data: OcrExtraction }>(
          '/api/ocr/extract',
          formData,
          {
            timeout: 180_000,
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        );

        const result = res.data.data;
        setExtraction(result);
        setStatus('done');
        return result;
      } catch (err: unknown) {
        if (__DEV__) {
          console.warn('OCR extraction failed:', err);
        }
        const axiosErr = err as {
          message?: string;
          response?: { status?: number; data?: { error?: string } };
          code?: string;
        };
        if (axiosErr.response?.status === 401) {
          setError('Session expired. Please sign in again.');
        } else if (!axiosErr.response) {
          const base = env.API_BASE_URL;
          setError(
            axiosErr.code === 'ECONNABORTED'
              ? 'OCR timed out (over 3 minutes). Try a smaller image or enter values manually.'
              : axiosErr.code === 'ERR_NETWORK'
                ? 'OCR connection dropped (server may still be processing — first scan is slow). Restart the API server, try again, or use a smaller image.'
                : `Could not reach server at ${base}. Use your PC LAN IP in .env (not localhost), same Wi‑Fi as the phone, and restart Expo with: npx expo start -c`,
          );
          if (__DEV__) {
            console.warn('[OCR] network error', {
              baseURL: base,
              code: axiosErr.code,
              message: axiosErr.message,
            });
          }
        } else if (axiosErr.response?.status === 404) {
          setError('OCR service not found on this server.');
        } else {
          setError(axiosErr.response?.data?.error ?? 'Could not read proof image');
        }
        setStatus('error');
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setExtraction(null);
    setStatus('idle');
    setError(null);
  }, []);

  return { extraction, status, error, extract, reset };
}

export interface SuggestedField {
  field: string;
  value: string;
  confidence: number;
  raw?: string;
}

/**
 * Apply high-confidence OCR fields to form data.
 * Returns only fields that meet the confidence threshold.
 */
export function getAutoFillFields(extraction: OcrExtraction): {
  duration?: string;
  distance?: string;
  steps?: string;
  autoFilledFields: string[];
  suggestedFields: SuggestedField[];
} {
  const autoFilledFields: string[] = [];
  const suggestedFields: SuggestedField[] = [];
  const result: { duration?: string; distance?: string; steps?: string } = {};

  const { fields } = extraction;

  if (fields.duration) {
    if (fields.duration.confidence >= CONFIDENCE_THRESHOLD) {
      result.duration = String(fields.duration.value);
      autoFilledFields.push('duration');
    } else {
      suggestedFields.push({
        field: 'duration',
        value: String(fields.duration.value),
        confidence: fields.duration.confidence,
        raw: fields.duration.raw,
      });
    }
  }

  if (fields.distance) {
    if (fields.distance.confidence >= CONFIDENCE_THRESHOLD) {
      result.distance = String(fields.distance.value);
      autoFilledFields.push('distance');
    } else {
      suggestedFields.push({
        field: 'distance',
        value: String(fields.distance.value),
        confidence: fields.distance.confidence,
        raw: fields.distance.raw,
      });
    }
  }

  if (fields.steps) {
    if (fields.steps.confidence >= CONFIDENCE_THRESHOLD) {
      result.steps = String(fields.steps.value);
      autoFilledFields.push('steps');
    } else {
      suggestedFields.push({
        field: 'steps',
        value: String(fields.steps.value),
        confidence: fields.steps.confidence,
        raw: fields.steps.raw,
      });
    }
  }

  // Calories: include in suggestions but don't auto-fill (no form field currently)
  if (fields.calories) {
    suggestedFields.push({
      field: 'calories',
      value: String(fields.calories.value),
      confidence: fields.calories.confidence,
      raw: fields.calories.raw,
    });
  }

  return { ...result, autoFilledFields, suggestedFields };
}
