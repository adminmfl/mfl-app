import type { FeatherIconName } from '../types';

export interface ContactItem {
  label: string;
  email: string;
  icon: FeatherIconName;
}

export const CONTACT_ITEMS: ContactItem[] = [
  { label: 'MFL Support', email: 'mflsupport@mpowero.com', icon: 'mail' },
  { label: 'MFL Management', email: 'mflmanagement@mpowero.com', icon: 'clock' },
  { label: 'MFL Billing', email: 'mflbilling@mpowero.com', icon: 'file-text' },
];
