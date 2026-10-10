import { useState, useCallback, type ReactNode } from 'react';
import { LayoutContext, type HeaderMode } from './LayoutContext';

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
