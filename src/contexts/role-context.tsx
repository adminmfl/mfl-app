import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLeagueContext } from './league-context';

export type LeagueRole = 'host' | 'governor' | 'captain' | 'vice_captain' | 'player';

const ROLE_HIERARCHY: LeagueRole[] = ['player', 'vice_captain', 'captain', 'governor', 'host'];

interface RoleContextType {
  activeRole: LeagueRole | null;
  availableRoles: LeagueRole[];
  setActiveRole: (role: LeagueRole) => void;

  isHost: boolean;
  isGovernor: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isPlayer: boolean;

  canManageLeague: boolean;
  canManageTeams: boolean;
  canValidateSubmissions: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function getHighestRole(roles: LeagueRole[]): LeagueRole | null {
  if (roles.length === 0) return null;
  let highest: LeagueRole = roles[0]!;
  let highestLevel = ROLE_HIERARCHY.indexOf(highest);
  for (const role of roles) {
    const level = ROLE_HIERARCHY.indexOf(role);
    if (level > highestLevel) {
      highest = role;
      highestLevel = level;
    }
  }
  return highest;
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { activeLeague } = useLeagueContext();
  const [overrideRole, setOverrideRole] = useState<LeagueRole | null>(null);

  const availableRoles = useMemo<LeagueRole[]>(() => {
    if (!activeLeague) return [];
    const raw = (activeLeague.roles ?? []) as string[];
    const valid = raw.filter((r): r is LeagueRole =>
      ROLE_HIERARCHY.includes(r as LeagueRole),
    );
    // If host, ensure host role is in list
    if (activeLeague.isHost && !valid.includes('host')) {
      valid.push('host');
    }
    // Deduplicate and sort by hierarchy (highest first)
    const unique = [...new Set(valid)];
    unique.sort((a, b) => ROLE_HIERARCHY.indexOf(b) - ROLE_HIERARCHY.indexOf(a));
    return unique;
  }, [activeLeague]);

  const activeRole = useMemo<LeagueRole | null>(() => {
    if (availableRoles.length === 0) return null;
    if (overrideRole && availableRoles.includes(overrideRole)) return overrideRole;
    return getHighestRole(availableRoles);
  }, [availableRoles, overrideRole]);

  const setActiveRole = useCallback((role: LeagueRole) => {
    setOverrideRole(role);
  }, []);

  const permissions = useMemo(() => {
    const isHost = activeRole === 'host';
    const isGovernor = activeRole === 'governor';
    const isCaptain = activeRole === 'captain';
    const isViceCaptain = activeRole === 'vice_captain';
    const isPlayer = activeRole === 'player';

    return {
      isHost,
      isGovernor,
      isCaptain,
      isViceCaptain,
      isPlayer,
      canManageLeague: isHost,
      canManageTeams: isHost || isGovernor,
      canValidateSubmissions: isHost || isGovernor || isCaptain || isViceCaptain,
    };
  }, [activeRole]);

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        availableRoles,
        setActiveRole,
        ...permissions,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
}
