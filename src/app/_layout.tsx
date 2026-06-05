import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {
  Saira_400Regular,
  Saira_500Medium,
  Saira_600SemiBold,
  Saira_700Bold,
} from '@expo-google-fonts/saira';
import {
  SNPro_400Regular,
  SNPro_500Medium,
  SNPro_600SemiBold,
  SNPro_700Bold,
} from '@expo-google-fonts/sn-pro';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { Slot, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { HeroUINativeProvider } from 'heroui-native';
import { AppState, type AppStateStatus, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  KeyboardProvider,
} from 'react-native-keyboard-controller';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../global.css';
import { AppThemeProvider } from '../contexts/app-theme-context';
import { AuthProvider } from '../core/auth';
import { LeagueProvider } from '../contexts/league-context';
import { RoleProvider } from '../contexts/role-context';
import { setupNotificationHandler } from '../lib/push-notifications';
import { logScreenView } from '../lib/analytics';

// Configure foreground notification display (must be outside component tree)
setupNotificationHandler();

// Crash reporting init is a no-op until Firebase platform is configured
// import { initCrashReporting } from '../lib/crashlytics';
// initCrashReporting();

// Tell TanStack Query when the app gains/loses focus (required for React Native).
// Without this, refetchOnWindowFocus does nothing on mobile.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener(
    'change',
    (state: AppStateStatus) => {
      handleFocus(state === 'active');
    },
  );
  return () => subscription.remove();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute — data stays fresh for 1 min
      gcTime: 5 * 60 * 1000,       // 5 minutes — garbage collect after 5 min
      retry: 2,                     // Retry failed requests twice
      refetchOnWindowFocus: false,  // Mobile doesn't have window focus events
    },
  },
});

if (Constants.appOwnership !== 'expo') {
  SplashScreen.setOptions({
    duration: 300,
    fade: true,
  });
}

/**
 * Component that wraps app content inside KeyboardProvider
 * Contains the contentWrapper and HeroUINativeProvider configuration
 */
function ScreenTracker() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      logScreenView(pathname);
    }
  }, [pathname]);

  return null;
}

function AppContent() {
  return (
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <HeroUINativeProvider
          config={{
            devInfo: {
              stylingPrinciples: false,
            },
          }}
        >
          <AuthProvider>
            <LeagueProvider>
              <RoleProvider>
                <ScreenTracker />
                <Slot />
              </RoleProvider>
            </LeagueProvider>
          </AuthProvider>
        </HeroUINativeProvider>
      </QueryClientProvider>
    </AppThemeProvider>
  );
}

export default function Layout() {
  const fonts = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Saira_400Regular,
    Saira_500Medium,
    Saira_600SemiBold,
    Saira_700Bold,
    SNPro_400Regular,
    SNPro_500Medium,
    SNPro_600SemiBold,
    SNPro_700Bold,
  });

  if (!fonts) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <AppContent />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
