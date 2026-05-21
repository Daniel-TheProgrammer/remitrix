import { formatCurrency, formatRate, formatDate } from '../formatting';

describe('formatCurrency', () => {
  it('formats USD in English locale', () => {
    const result = formatCurrency(100.5, 'USD', 'en');
    expect(result).toContain('100.50');
    expect(result).toContain('$');
  });

  it('formats EUR in French locale with French conventions', () => {
    const result = formatCurrency(1234.56, 'EUR', 'fr');
    // French uses comma for decimal, space for thousands
    expect(result).toMatch(/1[\s\u202f]?234,56/);
    expect(result).toContain('€');
  });

  it('formats USD in French locale (French conventions, USD symbol)', () => {
    const result = formatCurrency(50.0, 'USD', 'fr');
    expect(result).toContain('50,00');
    expect(result).toMatch(/\$|USD/);
  });

  it('formats JPY correctly (no minor units for display but forced to 2)', () => {
    const result = formatCurrency(1500, 'JPY', 'en');
    expect(result).toContain('1,500.00');
  });

  it('handles zero correctly', () => {
    const result = formatCurrency(0, 'USD', 'en');
    expect(result).toContain('0.00');
  });

  it('handles negative values', () => {
    const result = formatCurrency(-25.5, 'EUR', 'en');
    expect(result).toContain('25.50');
  });
});

describe('formatRate', () => {
  it('formats to 4 decimal places in English', () => {
    const result = formatRate(0.9215, 'en');
    expect(result).toBe('0.9215');
  });

  it('formats with French decimal separator', () => {
    const result = formatRate(149.8523, 'fr');
    expect(result).toContain('149,8523');
  });

  it('pads to 4 decimal places', () => {
    const result = formatRate(1.5, 'en');
    expect(result).toBe('1.5000');
  });
});

describe('formatDate', () => {
  it('formats date in English locale', () => {
    const date = new Date('2024-03-15T10:30:00Z');
    const result = formatDate(date, 'en');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('formats date in French locale', () => {
    const date = new Date('2024-03-15T10:30:00Z');
    const result = formatDate(date, 'fr');
    expect(result).toContain('mars');
    expect(result).toContain('2024');
  });
});
