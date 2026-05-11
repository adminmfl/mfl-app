export { WorkoutSubmission } from './components/workout-submission';
export { RestDaySubmission } from './components/rest-day-submission';
export { OcrSuggestionPanel } from './components/ocr-suggestion-panel';
export { useProofUpload } from './hooks/use-proof-upload';
export { useProofOcr, getAutoFillFields } from './hooks/use-proof-ocr';
export type { OcrStatus, SuggestedField } from './hooks/use-proof-ocr';
export type {
  SubmissionFormState,
  SubmissionFormErrors,
  ProofImage,
  ResubmitParams,
} from './types';
