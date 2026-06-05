import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { mmkv, removeMMKVKey } from '../core/storage/mmkv';
import { useAuth } from '../core/auth';
import { useUserLeagues } from '../features/leagues/hooks/use-user-leagues';
import type { UserLeague } from '../features/leagues/types/league.model';

interface LeagueContextType {
  activeLeague: UserLeague | null;
  setActiveLeague: (league: UserLeague) => void;
  clearActiveLeague: () => void;
}

const ACTIVE_LEAGUE_KEY = 'mfl_active_league';
const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export function LeagueProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [activeLeague, setActiveLeagueState] = useState<UserLeague | null>(() => {
    // Restore from cache synchronously
    const cached = mmkv.getString(ACTIVE_LEAGUE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch { return null; }
    }
    return null;
  });

  const { data: leagues } = useUserLeagues({ enabled: isAuthenticated });
  const prevUserId = useRef<string | null>(null);

  // Clear cached league when user changes (login/logout)
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    if (prevUserId.current !== null && prevUserId.current !== currentUserId) {
      // User changed — clear stale league
      setActiveLeagueState(null);
      removeMMKVKey(ACTIVE_LEAGUE_KEY);
    }
    prevUserId.current = currentUserId;
  }, [user?.id]);

  // Clear on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveLeagueState(null);
      removeMMKVKey(ACTIVE_LEAGUE_KEY);
    }
  }, [isAuthenticated]);

  // Validate and auto-select league when leagues are fetched
  useEffect(() => {
    if (!leagues || leagues.length === 0) return;

    if (activeLeague) {
      // Validate: does cached league belong to this user?
      const found = leagues.find((l) => l.leagueId === activeLeague.leagueId);
      if (found) {
        // Update with fresh data from API (roles may have changed)
        setActiveLeagueState(found);
        mmkv.set(ACTIVE_LEAGUE_KEY, JSON.stringify(found));
        return;
      }
    }

    // No valid cached league — auto-select first
    setActiveLeagueState(leagues[0]!);
    mmkv.set(ACTIVE_LEAGUE_KEY, JSON.stringify(leagues[0]!));
  }, [leagues]); // eslint-disable-line react-hooks/exhaustive-deps

  const setActiveLeague = useCallback((league: UserLeague) => {
    setActiveLeagueState(league);
    mmkv.set(ACTIVE_LEAGUE_KEY, JSON.stringify(league));
  }, []);

  const clearActiveLeague = useCallback(() => {
    setActiveLeagueState(null);
    removeMMKVKey(ACTIVE_LEAGUE_KEY);
  }, []);

  return (
    <LeagueContext.Provider value={{ activeLeague, setActiveLeague, clearActiveLeague }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeagueContext() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeagueContext must be used within a LeagueProvider');
  }
  return context;
}
