'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/atoms/Button';
import { formatCurrency, formatRate, formatDate } from '@/lib/formatting';
import styles from './RemittanceWizard.module.scss';

interface Quote {
  id: string;
  sendAmount: number;
  sendCurrency: string;
  receiveCurrency: string;
  receiveAmount: number;
  rate: number;
  fee: number;
  lockedAt: number;
  expiresAt: number;
}

type WizardStep = 1 | 2 | 3;

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

export function RemittanceWizard() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language;

  const [step, setStep] = useState<WizardStep>(1);
  const [sendAmount, setSendAmount] = useState<string>('100');
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('EUR');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropoffReported = useRef(false);

  const clearCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reportDropoff = useCallback(async () => {
    if (dropoffReported.current) return;
    dropoffReported.current = true;
    try {
      await fetch('/api/remittance-dropoff', { method: 'POST' });
    } catch (_e) {
      // best-effort
    }
  }, []);

  const startCountdown = useCallback(
    (expiresAt: number) => {
      clearCountdown();
      const update = () => {
        const remaining = Math.max(0, expiresAt - Date.now());
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearCountdown();
          setExpired(true);
          reportDropoff();
        }
      };
      update();
      timerRef.current = setInterval(update, 1000);
    },
    [clearCountdown, reportDropoff]
  );

  useEffect(() => {
    return () => clearCountdown();
  }, [clearCountdown]);

  useEffect(() => {
    const available = CURRENCIES.filter((c) => c !== sendCurrency);
    if (!available.includes(receiveCurrency)) {
      setReceiveCurrency(available[0]);
    }
  }, [sendCurrency, receiveCurrency]);

  const handleGetQuote = async () => {
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 2) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sendAmount: amount,
          sendCurrency,
          receiveCurrency
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to get quote');
        return;
      }
      if (data.quote) {
        setQuote(data.quote);
        setExpired(false);
        dropoffReported.current = false;
        setStep(2);
        startCountdown(data.quote.expiresAt);
      }
    } catch (err) {
      console.error('Quote request failed:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!quote || expired) return;
    clearCountdown();
    setLoading(true);
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setStep(3);
  };

  const handleReset = () => {
    clearCountdown();
    setStep(1);
    setQuote(null);
    setExpired(false);
    setTimeLeft(0);
    dropoffReported.current = false;
  };

  const formatTimeLeft = (ms: number): string => {
    const totalSecs = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className={styles.wizard}>
      <h2 className={styles.title}>{t('wizard.title')}</h2>

      {/* Stepper */}
      <div className={styles.stepper}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`${styles.stepIndicator} ${s === step ? styles.active : ''} ${
              s < step ? styles.completed : ''
            }`}
          >
            <span className={styles.stepNumber}>{s}</span>
            <span className={styles.stepLabel}>
              {t(`wizard.step${s}` as 'wizard.step1')}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Get Quote */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('wizard.sendAmount')}</label>
            <input
              type="number"
              className={styles.input}
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              min="3"
              step="0.01"
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('wizard.sendCurrency')}</label>
              <select
                className={styles.select}
                value={sendCurrency}
                onChange={(e) => setSendCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('wizard.receiveCurrency')}</label>
              <select
                className={styles.select}
                value={receiveCurrency}
                onChange={(e) => setReceiveCurrency(e.target.value)}
              >
                {CURRENCIES.filter((c) => c !== sendCurrency).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
          <Button type="button" onClick={handleGetQuote} disabled={loading}>
            {loading ? '...' : t('wizard.getQuote')}
          </Button>
        </div>
      )}

      {/* Step 2: Lock Rate & Confirm */}
      {step === 2 && quote && (
        <div className={styles.stepContent}>
          {expired ? (
            <div className={styles.expiredBanner}>
              <p>{t('wizard.rateExpired')}</p>
              <Button onClick={handleReset}>{t('wizard.backToQuote')}</Button>
            </div>
          ) : loading ? (
            <div className={styles.processing}>
              <div className={styles.spinner} />
              <p>{t('wizard.processing')}</p>
            </div>
          ) : (
            <>
              <div className={styles.timer}>
                <span>{t('wizard.rateLockedFor')}</span>
                <span className={styles.countdown}>{formatTimeLeft(timeLeft)}</span>
              </div>
              <div className={styles.quoteDetails}>
                <div className={styles.detailRow}>
                  <span>{t('wizard.sendAmount')}</span>
                  <span>{formatCurrency(quote.sendAmount, quote.sendCurrency, locale)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>{t('wizard.fee')}</span>
                  <span>{formatCurrency(quote.fee, quote.sendCurrency, locale)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>{t('wizard.appliedRate')}</span>
                  <span>1 {quote.sendCurrency} = {formatRate(quote.rate, locale)} {quote.receiveCurrency}</span>
                </div>
                <div className={`${styles.detailRow} ${styles.highlight}`}>
                  <span>{t('wizard.receiveAmount')}</span>
                  <span>{formatCurrency(quote.receiveAmount, quote.receiveCurrency, locale)}</span>
                </div>
              </div>
              <Button type="button" onClick={handleConfirm}>{t('wizard.confirm')}</Button>
            </>
          )}
        </div>
      )}

      {/* Step 3: Receipt */}
      {step === 3 && quote && (
        <div className={styles.stepContent}>
          <div className={styles.successBanner}>
            <div className={styles.checkmark}>&#10003;</div>
            <h3>{t('wizard.success')}</h3>
          </div>
          <div className={styles.receipt}>
            <h4>{t('wizard.receiptTitle')}</h4>
            <div className={styles.detailRow}>
              <span>{t('wizard.transactionId')}</span>
              <span className={styles.mono}>{quote.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span>{t('wizard.sent')}</span>
              <span>{formatCurrency(quote.sendAmount, quote.sendCurrency, locale)}</span>
            </div>
            <div className={styles.detailRow}>
              <span>{t('wizard.fee')}</span>
              <span>{formatCurrency(quote.fee, quote.sendCurrency, locale)}</span>
            </div>
            <div className={styles.detailRow}>
              <span>{t('wizard.appliedRate')}</span>
              <span>{formatRate(quote.rate, locale)}</span>
            </div>
            <div className={`${styles.detailRow} ${styles.highlight}`}>
              <span>{t('wizard.received')}</span>
              <span>{formatCurrency(quote.receiveAmount, quote.receiveCurrency, locale)}</span>
            </div>
            <div className={styles.detailRow}>
              <span>{t('wizard.date')}</span>
              <span>{formatDate(new Date(quote.lockedAt), locale)}</span>
            </div>
          </div>
          <Button type="button" onClick={handleReset}>{t('wizard.newTransfer')}</Button>
        </div>
      )}
    </section>
  );
}
