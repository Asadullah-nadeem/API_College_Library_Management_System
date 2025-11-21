import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

const { combine, timestamp, json, prettyPrint, colorize, simple } = format;

const logger: WinstonLogger = createLogger({
    level: process.env.NODE_ENV === 'development' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
    ),
    transports: [
        new transports.Console({
            format: process.env.NODE_ENV !== 'development' ? combine(colorize(), simple()) : simple(),
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({filename: 'logs/'}),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' })
    ]
});

if (process.env.NODE_ENV !== 'development') {
    logger.debug('Logging initialized in debug mode');
}

export default logger;
