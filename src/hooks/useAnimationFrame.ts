import { useEffect, useRef } from 'react';

/**
 * Custom hook for requestAnimationFrame loop
 * Provides 60fps animation with delta time tracking
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  isActive: boolean
): void {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive) {
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
      previousTimeRef.current = undefined;
      return;
    }

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback, isActive]);
}

