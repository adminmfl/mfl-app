/**
 * Shared OCR extraction types — used by both #180 (auto-fill) and #156 (anti-cheat).
 */

export type WorkoutSource =
  | 'strava'
  | 'google_fit'
  | 'apple_health'
  | 'garmin'
  | 'fitbit'
  | 'gym_machine'
  | 'unknown';

export interface OcrFieldResult<T = number> {
  value: T;
  confidence: number;
  raw?: string;
}

export interface OcrExtraction {
  source?: WorkoutSource;
  fields: {
    duration?: OcrFieldResult<number>;
    distance?: OcrFieldResult<number> & { unit?: 'km' | 'mi' };
    steps?: OcrFieldResult<number>;
    calories?: OcrFieldResult<number>;
    date?: OcrFieldResult<string>;
  };
  overallConfidence: number;
  warnings: string[];
  rawText?: string;
}

export const CONFIDENCE_THRESHOLD = 0.8;

export function isHighConfidence(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLD;
}
