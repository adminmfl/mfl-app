import { mflColors } from '../../../constants/colors';

/**
 * Shared TextInput style for all auth screens.
 */
export const authInputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  color: mflColors.text,
} as const;
