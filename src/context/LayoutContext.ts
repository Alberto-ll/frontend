import { createContext, useContext } from 'react';

export type HeaderMode = 'full' | 'simple';

export interface LayoutContextValue {
  headerMode: HeaderMode;
  setHeaderMode: (mode: HeaderMode) => void;
}

export const LayoutContext = createContext<LayoutContextValue>({
  headerMode: 'full',
  setHeaderMode: () => {},
});

export function useLayoutMode() {
  return useContext(LayoutContext);
}
