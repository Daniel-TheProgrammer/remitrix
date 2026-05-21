'use client';

import i18n from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import { initReactI18next } from 'react-i18next';
import { i18nConfig } from './config';

if (!i18n.isInitialized) {
  i18n
    .use(ChainedBackend)
    .use(initReactI18next)
    .init({
      fallbackLng: i18nConfig.defaultLocale,
      supportedLngs: [...i18nConfig.locales],
      interpolation: { escapeValue: false },
      ns: ['common'],
      defaultNS: 'common',
      backend: {
        backends: [LocalStorageBackend, HttpBackend],
        backendOptions: [
          {
            expirationTime: 7 * 24 * 60 * 60 * 1000
          },
          {
            loadPath: '/locales/{{lng}}/{{ns}}.json'
          }
        ]
      }
    });
}

export default i18n;
