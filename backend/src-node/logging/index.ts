import * as winston from 'winston';

const logFormat = winston.format.printf(({level, message, timestamp, file, method}) => {
    file = file || 'unknown';
    method = method || 'unknown';
    return `[${timestamp}] - {${file}:${method}} - (${level}): ${message}`;
});

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.timestamp(), logFormat),
});

export {logger};
