import { mflColors } from '../../../constants/colors';

/**
 * Shared TextInput style for activity submission form fields.
 * Used across workout-submission, measurement-fields, and reupload-submission.
 */
export const submissionInputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: mflColors.text,
} as const;
