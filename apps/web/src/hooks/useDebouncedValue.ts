import { useEffect, useRef, useState } from 'react';

function serializeValue(value: unknown): string {
  return JSON.stringify(value);
}

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  const serialized = serializeValue(value);
  const latestValue = useRef(value);
  latestValue.current = value;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced((current) => {
        if (serializeValue(current) === serializeValue(latestValue.current)) {
          return current;
        }
        return latestValue.current;
      });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [serialized, delayMs]);

  return debounced;
}
