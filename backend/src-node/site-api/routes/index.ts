import {Application} from 'express';
import {addUserRoutes} from './user';
import {addAuthRoutes} from './auth';
import * as cors from 'cors';
import {isGenericError} from '../errors/common';
import {GenericResponse} from 'twitch_broadcasting_suite_shared';
import * as crypto from 'crypto';
import * as bodyParser from 'body-parser';
import {logger} from '../../logging';

function addApiRoutes(app: Application) {
    //Set up CORS
    app.use(
        '/api',
        cors({
            origin: process.env.CORS_ALLOW_ORIGINS.split(' '),
            credentials: true,
        })
    );

    //All data provided to the API is in JSON format.
    app.use('/api', bodyParser.json());

    addAuthRoutes(app);
    addUserRoutes(app);

    app.use('/api', function (err, req, res, next) {
        if (req.headersSent) {
            return next(err);
        }
        const methodLogger = logger.child({file: __filename, method: '(api endpoint)'});

        if (isGenericError(err)) {
            methodLogger.error(err.errorId + ' >> ' + 'for endpoint ' + req.originalUrl + `(${req.method})` +':' +  JSON.stringify(err));
            methodLogger.error(err);
            const errResp: GenericResponse = {
                state: {
                    needsReauth: err.needsReauth,
                    error: true,
                    userFacingErrorMessage: err.userFacingMessage,
                    errorId: err.errorId,
                },
            };

            res.status(err.statusCode);
            res.send(JSON.stringify(errResp));
            res.end();
        } else {
            const newId = crypto.randomBytes(4).toString('hex');
            methodLogger.error(newId + ' >> ' + 'for endpoint ' + req.originalUrl + `(${req.method})` +':' +  JSON.stringify(err));
            methodLogger.error(err);
            const errResp: GenericResponse = {
                state: {
                    needsReauth: false,
                    error: true,
                    userFacingErrorMessage:
                        'An unknown error occured.  If this error persists, please contact us by sending an email to support@binaryfissiongames.com!', // TODO: Configurable email here
                    errorId: newId,
                },
            };

            res.status(500);
            res.send(JSON.stringify(errResp));
            res.end();
        }
    });
}

export {addApiRoutes};
