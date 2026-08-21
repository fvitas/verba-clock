import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// iOS "Reduce Motion" and Android "Remove animations" both land here through the web view
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
