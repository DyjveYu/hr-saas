"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.winstonConfig = void 0;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'service'],
}), winston.format.printf((info) => {
    const { timestamp, level, message, metadata, stack } = info;
    const meta = metadata || {};
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
}));
exports.winstonConfig = {
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat),
        }),
        new winston.transports.File({
            filename: path.join('logs', 'app.log'),
            level: 'info',
            format: logFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            format: logFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
};
//# sourceMappingURL=logger.config.js.map