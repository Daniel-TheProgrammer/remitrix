'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/atoms/Button';
import styles from './LanguageSwitcher.module.scss';

const languages = ['en', 'fr'];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className={styles.switcher}>
      {languages.map((lng) => (
        <Button key={lng} onClick={() => i18n.changeLanguage(lng)}>
          {lng.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
