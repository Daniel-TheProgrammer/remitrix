'use client';

import { useTranslation } from 'react-i18next';
import { formatRate } from '@/lib/formatting';
import { useRatePolling } from '@/hooks/useRatePolling';
import styles from './RateDashboard.module.scss';

export function RateDashboard() {
  const { t, i18n } = useTranslation('common');
  const { rates, flash, error } = useRatePolling();

  const locale = i18n.language;

  return (
    <section className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('dashboard.title')}</h2>
        <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
        {error ? <p className={styles.subtitle}>{error}</p> : null}
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
