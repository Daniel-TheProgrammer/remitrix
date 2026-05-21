import '@/styles/globals.scss';
import { I18nProvider } from '@/lib/i18n/provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
