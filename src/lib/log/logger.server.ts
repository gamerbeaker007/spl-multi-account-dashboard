const isDebug = process.env.NODE_ENV === 'development' && process.env.DEBUG_LOGS === 'true';

const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  debug: (msg: string) => {
    if (isDebug) console.log(`[DEBUG] ${msg}`);
  },
};

export default logger;
