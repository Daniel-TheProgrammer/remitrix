'use client';

import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';
import styles from './Hero.module.scss';

export function Hero() {
  const { t } = useTranslation('common');

  return (
    <section className={styles.wrapper}>
      <div>
        <h1 className={styles.title}>{t('hero.title')}</h1>
        <p className={styles.subtitle}>{t('hero.subtitle')}</p>
      </div>
      <LanguageSwitcher />
    </section>
  );
}
