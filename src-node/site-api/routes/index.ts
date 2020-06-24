import {Application} from "express";
import {addUserRoutes} from "./user";
import {addAuthRoutes} from "./auth";
import * as cors from "cors";
import {GenericError} from "../errors/common";
import {GenericResponse} from "twitch_broadcasting_suite_shared/dist";
import * as crypto from 'crypto';

function addApiRoutes(app: Application) {
    //Set up CORS
    app.use('/api', cors({
        origin: process.env.CORS_ALLOW_ORIGINS.split(' '),
        credentials: true
    }));

    addAuthRoutes(app);
    addUserRoutes(app);

    app.use('/api', function (err, req, res, next) {
        if (req.headersSent) {
            return next(err);
        }
        if (err instanceof GenericError) {
            console.error(err.errorId, ' >> ', err);
            let errResp: GenericResponse = {
                state: {
                    needsReauth: err.needsReauth,
                    error: true,
                    userFacingErrorMessage: err.userFacingMessage,
                    errorId: err.errorId
                }
            };

            res.status(err.statusCode);
            res.send(JSON.stringify(errResp));
            res.end();
        } else {
            let newId = crypto.randomBytes(4).toString('hex');
            console.error(newId, ' >> ', err);
            let errResp: GenericResponse = {
                state: {
                    needsReauth: false,
                    error: true,
                    userFacingErrorMessage: 'An unknown error occured.  If this error persists, please contact us by sending an email to support@binaryfissiongames.com!',
                    errorId: newId
                }
            };

            res.status(500);
            res.send(JSON.stringify(errResp));
            res.end();
        }
    });
}

export {
    addApiRoutes
}