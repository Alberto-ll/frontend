import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type HeaderMode = 'full' | 'simple';

interface LayoutContextValue {
  headerMode: HeaderMode;
  setHeaderMode: (mode: HeaderMode) => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  headerMode: 'full',
  setHeaderMode: () => {},
});

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [headerMode, setHeaderModeState] = useState<HeaderMode>('full');

  const setHeaderMode = useCallback((mode: HeaderMode) => {
    setHeaderModeState(mode);
  }, []);

  return (
    <LayoutContext.Provider value={{ headerMode, setHeaderMode }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutMode() {
  return useContext(LayoutContext);
}
