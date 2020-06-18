import {Application} from "express";
import {addUserRoutes} from "./user";
import {addAuthRoutes} from "./auth";
import * as cors from "cors";

function addApiRoutes(app: Application) {
    //Set up CORS
    app.use('/api', cors({
        origin: process.env.CORS_ALLOW_ORIGINS.split(' '),
        credentials: true
    }));

    addAuthRoutes(app);
    addUserRoutes(app);

    //TODO: Error handling
}

export {
    addApiRoutes
}