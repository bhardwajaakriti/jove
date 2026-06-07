import { useCallback, useEffect, useRef, useState } from 'react';
import type { LoadStatus } from '@/types';

export interface AsyncResult<T> {
  data: T | undefined;
  status: LoadStatus;
  error: Error | undefined;
  reload: () => void;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncResult<T> {
  const [data, setData] = useState<T>();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<Error>();
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('loading');
    setError(undefined);
    fnRef
      .current()
      .then((result) => {
        if (!active) return;
        setData(result);
        setStatus('success');
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setStatus('error');
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, status, error, reload };
}
