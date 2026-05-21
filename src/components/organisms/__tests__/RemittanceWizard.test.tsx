import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { RemittanceWizard } from '@/components/organisms/RemittanceWizard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}));

describe('RemittanceWizard critical flows', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.useFakeTimers();
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('/api/quote') && init?.method === 'POST') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              quote: {
                id: 'QT-TEST',
                sendAmount: 100,
                sendCurrency: 'USD',
                receiveCurrency: 'EUR',
                receiveAmount: 92,
                rate: 0.9388,
                fee: 2,
                lockedAt: Date.now(),
                expiresAt: Date.now() + 3000
              }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }

      if (url.includes('/api/remittance-dropoff') && init?.method === 'POST') {
        return Promise.resolve(
          new Response(JSON.stringify({ recorded: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        );
      }

      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('moves from quote step to receipt after confirm', async () => {
    render(<RemittanceWizard />);

    await user.click(screen.getByRole('button', { name: 'wizard.getQuote' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'wizard.confirm' })).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'wizard.confirm' }));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText('wizard.receiptTitle')).toBeInTheDocument();
    });
  });

  it('expires quote and reports dropoff metric', async () => {
    render(<RemittanceWizard />);

    await user.click(screen.getByRole('button', { name: 'wizard.getQuote' }));

    await waitFor(() => expect(screen.getByText('wizard.rateLockedFor')).toBeInTheDocument());

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    await waitFor(() => {
      expect(screen.getByText('wizard.rateExpired')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/remittance-dropoff', { method: 'POST' });
  });
});
