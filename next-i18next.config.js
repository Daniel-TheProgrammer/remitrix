const { i18nConfig } = require('./src/lib/i18n/config-runtime');

module.exports = {
  i18n: {
    defaultLocale: i18nConfig.defaultLocale,
    locales: i18nConfig.locales
  }
};
