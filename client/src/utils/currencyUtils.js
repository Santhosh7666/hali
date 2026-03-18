export const CURRENCY_RATES = {
  'USD ($)': 1,
  'EUR (€)': 0.92,
  'GBP (£)': 0.79,
  'INR (₹)': 83.12,
  'JPY (¥)': 149.50
};

export const CURRENCY_SYMBOLS = {
  'USD ($)': '$',
  'EUR (€)': '€',
  'GBP (£)': '£',
  'INR (₹)': '₹',
  'JPY (¥)': '¥'
};

/**
 * Formats a USD amount into the target currency.
 * @param {number} amount - The amount in USD.
 * @param {string} currency - The target currency string (e.g., 'USD ($)').
 * @returns {string} - Formatted currency string.
 */
export const formatCurrency = (amount, currency = 'USD ($)') => {
  const rate = CURRENCY_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const convertedAmount = amount * rate;

  return symbol + convertedAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
