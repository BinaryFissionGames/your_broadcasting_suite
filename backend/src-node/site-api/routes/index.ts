import {Application} from 'express';
import {addUserRoutes} from './user';
import {addAuthRoutes} from './auth';
import * as cors from 'cors';
import {GenericError, isGenericError} from '../errors/common';
import {GenericResponse, API_PATH_PREFIX} from 'twitch_broadcasting_suite_shared';
import * as crypto from 'crypto';
import * as bodyParser from 'body-parser';
import {logger} from '../../logging';

function addApiRoutes(app: Application) {
    //Set up CORS
    app.use(
        API_PATH_PREFIX,
        cors({
            origin: process.env.CORS_ALLOW_ORIGINS.split(' '),
            credentials: true,
        })
    );

    //All data provided to the API is in JSON format.
    app.use(API_PATH_PREFIX, bodyParser.json());

    const apiHostname = new URL(process.env.HOST_NAME).hostname;
    const applicationHostname = new URL(process.env.APPLICATION_URL).hostname;

    //Verify that anything hitting this endpoint come from the main site. If it does not, we will reject the request.
    //This is to help protect against cross-site scripting attacks.
    app.use(API_PATH_PREFIX, function (req, _res, next) {
        const ref = req.headers.referer;
        if(!ref){
            return next(new GenericError('Referer must be either the API server itself, or the application.'));
        }
        const refHostname = new URL(ref).hostname;
        if(applicationHostname === refHostname || apiHostname === refHostname){
            return next();
        }
        return next(new GenericError('Referer must be either the API server itself, or the application.'));
    });

    addAuthRoutes(app);
    addUserRoutes(app);

    app.use(API_PATH_PREFIX, function (err, req, res, next) {
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
