'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type FlashState = Record<string, 'up' | 'down' | null>;

interface RateEntry {
  pair: string;
  rate: number;
  previousRate: number;
  updatedAt: string;
}

const POLL_INTERVAL_MS = 10_000;
const FLASH_RESET_MS = 1_500;

export function useRatePolling() {
  const [rates, setRates] = useState<RateEntry[]>([]);
  const [flash, setFlash] = useState<FlashState>({});
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/rates');
      if (!res.ok) {
        setError('Failed to load rates');
        return;
      }

      const data = (await res.json()) as { rates: RateEntry[] };
      const newRates = data.rates;

      const newFlash: FlashState = {};
      newRates.forEach((entry) => {
        if (entry.rate > entry.previousRate) {
          newFlash[entry.pair] = 'up';
        } else if (entry.rate < entry.previousRate) {
          newFlash[entry.pair] = 'down';
        } else {
          newFlash[entry.pair] = null;
        }
      });

      setRates(newRates);
      setFlash(newFlash);

      if (flashResetRef.current) {
        clearTimeout(flashResetRef.current);
      }
      flashResetRef.current = setTimeout(() => setFlash({}), FLASH_RESET_MS);
    } catch {
      setError('Failed to load rates');
    }
  }, []);

  useEffect(() => {
    fetchRates();
    pollRef.current = setInterval(fetchRates, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      if (flashResetRef.current) {
        clearTimeout(flashResetRef.current);
      }
    };
  }, [fetchRates]);

  return { rates, flash, error };
}
