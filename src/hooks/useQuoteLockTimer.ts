'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useQuoteLockTimer(onExpire: () => void) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (expiresAt: number) => {
      setExpired(false);
      clearTimer();

      const tick = () => {
        const remaining = Math.max(0, expiresAt - Date.now());
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearTimer();
          setExpired(true);
          onExpire();
        }
      };

      tick();
      timerRef.current = setInterval(tick, 1000);
    },
    [clearTimer, onExpire]
  );

  const resetTimer = useCallback(() => {
    clearTimer();
    setExpired(false);
    setTimeLeft(0);
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    timeLeft,
    expired,
    startTimer,
    resetTimer,
    clearTimer
  };
}
