import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import type { AuthSessionResult } from 'expo-auth-session';
import { env } from '../config/env';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: env.GOOGLE_WEB_CLIENT_ID,
  });

  return {
    request,
    response,
    promptAsync,
  };
}

export function getIdTokenFromResponse(response: AuthSessionResult | null): string | null {
  if (response?.type === 'success') {
    return response.params['id_token'] ?? null;
  }
  return null;
}
