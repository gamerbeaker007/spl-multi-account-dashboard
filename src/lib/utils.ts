export const largeNumberFormat = (balance: string | number) => {
  const numValue = typeof balance === 'string' ? parseFloat(balance) : balance;

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 3,
  }).format(numValue);
};
