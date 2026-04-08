import { createContext, useContext, useRef, useCallback } from 'react';

interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function useDrawer() {
  return useContext(DrawerContext);
}

export { DrawerContext };
