import pino, { Logger } from 'pino';

const createLogger: () => Logger = () => {
  return pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export default createLogger;
export type { Logger };
export { default as createWithLogging } from './api-handler';
