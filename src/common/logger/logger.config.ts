import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { TransformableInfo } from 'logform';
import * as path from 'path';

// Extend TransformableInfo with custom fields
interface LogInfo extends TransformableInfo {
  module?: string;
  method?: string;
  path?: string;
  url?: string;
  errorCode?: number | string;
  errorMessage?: string;
  context?: string;
}

// Custom log format: timestamp, level, module, request method, request path, error code, error message
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'service'],
  }),
  winston.format.printf((info: LogInfo) => {
    const { timestamp, level, message, metadata, stack } = info;
    const meta: Record<string, any> = metadata || {};

    const module = meta.module || info.module || 'APP';
    const method = meta.method || info.method || '-';
    const url = meta.path || meta.url || info.path || info.url || '-';
    const errorCode = meta.errorCode || info.errorCode || '-';
    const errorMessage = meta.errorMessage || info.errorMessage || message || '';

    let log = `${timestamp} [${level.toUpperCase()}] [${module}] ${method} ${url}`;

    if (errorCode !== '-') {
      log += ` code:${errorCode}`;
    }
    if (errorMessage) {
      log += ` message:${errorMessage}`;
    }

    if (stack && level === 'error') {
      log += `\n${stack}`;
    }

    return log;
  }),
);

export const winstonConfig: winston.LoggerOptions = {
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat,
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join('logs', 'app.log'),
      level: 'info',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    // Separate file transport for ERROR level
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
};
