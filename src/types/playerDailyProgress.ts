import { SplDailyProgress } from '@/types/spl/dailies';

export interface DailyProgressData {
  username: string;
  timestamp: string;
  format?: {
    foundation?: SplDailyProgress;
    wild?: SplDailyProgress;
    modern?: SplDailyProgress;
  };
  error?: string;
}
