'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatRate } from '@/lib/formatting';
import styles from './RateDashboard.module.scss';

interface RateEntry {
  pair: string;
  rate: number;
  previousRate: number;
  updatedAt: string;
}

type FlashState = Record<string, 'up' | 'down' | null>;

const POLL_INTERVAL = 10_000;

export function RateDashboard() {
  const { t, i18n } = useTranslation('common');
  const [rates, setRates] = useState<RateEntry[]>([]);
  const [flash, setFlash] = useState<FlashState>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch('/api/rates');
      const data = await res.json();
      const newRates: RateEntry[] = data.rates;

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

      setTimeout(() => setFlash({}), 1500);
    } catch {
      // silently ignore fetch errors
    }
  }, []);

  useEffect(() => {
    fetchRates();
    timerRef.current = setInterval(fetchRates, POLL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchRates]);

  const locale = i18n.language;

  return (
    <section className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('dashboard.title')}</h2>
        <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('dashboard.pair')}</th>
              <th>{t('dashboard.rate')}</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((entry) => {
              const flashClass = flash[entry.pair]
                ? flash[entry.pair] === 'up'
                  ? styles.flashUp
                  : styles.flashDown
                : '';
              return (
                <tr key={entry.pair} className={flashClass}>
                  <td className={styles.pairCell}>{entry.pair}</td>
                  <td className={styles.rateCell}>{formatRate(entry.rate, locale)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
