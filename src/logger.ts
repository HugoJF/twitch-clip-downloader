import {createLogger, format, transports} from 'winston';

export const logger = createLogger({
    level: 'verbose',
    format: format.combine(
        format.timestamp(),
        format.prettyPrint(),
    ),
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new transports.File({filename: 'logs/errors.log', level: 'error'}),
        new transports.File({filename: 'logs/combined.log'}),
    ],
});

export function bootLogger(debug = false): void {
    if (debug) {
        logger.add(new transports.Console({
            level: 'verbose',
            format: format.combine(
                format.cli(),
            )
        }));
    }
}
