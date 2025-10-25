export const largeNumberFormat = (balance: string | number) => {
  const numValue = typeof balance === 'string' ? parseFloat(balance) : balance;

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 3,
  }).format(numValue);
};

export const calculateEnergy = (ecr: number, lastUpdatedTime: string): number => {
  const lastUpdatedTimeDate = new Date(lastUpdatedTime);

  const msInOneHour = 60 * 60 * 1000; // Milliseconds in one hour
  const hourlyRechargeRate = 1; // Example hourly recharge rate

  const currentTimeMs = Date.now(); // Current time in milliseconds
  const lastUpdatedTimeMs = lastUpdatedTimeDate.getTime(); // Convert to milliseconds

  const regeneratedEnergy =
    ((currentTimeMs - lastUpdatedTimeMs) / msInOneHour) * hourlyRechargeRate;

  const ecrValue = typeof ecr === 'string' ? parseFloat(ecr) : ecr;
  const energy = Math.floor(regeneratedEnergy + ecrValue);

  return Math.min(energy, 50);
};
