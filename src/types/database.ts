export type PushTokenPlatform = 'android' | 'ios' | 'web';

export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  platform: PushTokenPlatform;
  created_at: string;
}
