import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';

interface ILocalStorageOptions {
  usingJson: boolean;
  usingSession: boolean;
}

export type LocalStorageStateAction<T> = T | ((prevState: T) => T);

export function useLocalStorage<T = string>(
  key: string,
  options: Partial<ILocalStorageOptions> = {}
): [T | undefined, Dispatch<LocalStorageStateAction<T | undefined>>] {
  const { usingJson, usingSession }: ILocalStorageOptions = {
    usingJson: false,
    usingSession: false,
    ...options
  };

  const [version, setVersion] = useState<number>(0);

  const storage = usingSession ? sessionStorage : localStorage;

  useEffect(() => {
    const changeListener = (event: StorageEvent) => {
      if (event.key === key) {
        setVersion(prev => prev + 1);
      }
    };

    window.addEventListener('storage', changeListener);
    window.addEventListener('local-storage', changeListener);

    return () => {
      window.removeEventListener('storage', changeListener);
      window.removeEventListener('local-storage', changeListener);
    };
  }, [key]);

  const storedValue = useMemo<T | undefined>(() => {
    const data = storage.getItem(key);

    if (data !== null) {
      if (usingJson) {
        try {
          return JSON.parse(data);
        } catch {
          return undefined;
        }
      }

      return data;
    }

    return undefined;
  }, [key, version, usingJson, storage]);

  const setStoredValue = useCallback(
    (val: LocalStorageStateAction<T | undefined>) => {
      const newValue = val instanceof Function ? val(storedValue) : val;

      if (typeof newValue === 'undefined') {
        storage.removeItem(key);
      } else {
        storage.setItem(key, usingJson ? JSON.stringify(newValue) : String(newValue));
      }

      window.dispatchEvent(new StorageEvent('local-storage', { key }));
    },
    [key, storedValue, usingJson, storage]
  );

  return [storedValue, setStoredValue];
}
