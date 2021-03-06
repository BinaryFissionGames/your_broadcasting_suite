import {setupTwitchOAuthPath} from 'twitch-oauth-authorization-code-express';
import express = require('express');
import * as session from 'express-session';
import mysql_session = require('express-mysql-session');
import {SessionOptions} from 'express-session';
import {TwitchWebhookManager} from '@binaryfissiongames/twitch-webhooks';
import {BasicWebhookRenewalScheduler} from '@binaryfissiongames/twitch-webhooks/dist/scheduling';
import {setupRoutes} from './routes';
import * as https from 'https';
import * as http from 'http';
import {SequelizeTwitchWebhookPersistenceManager} from './webhooks';
import {getOAuthToken, refreshToken} from './request';
import {parseMySqlConnString} from './model/util';
import {createOrGetUser} from './model/administrator/user';
import {EXPRESS_SESSION_COOKIE_NAME} from './constants';
import {initWebsocketServer} from './websocket-api/alerts';
import {shutdownGracefully} from './shutdown';
import {initProcessUpkeep} from './process-management/logic';
import {logger} from './logging';

const MySqlStore = mysql_session(session);
const mySqlStoreOptions = parseMySqlConnString(process.env.DATABASE_URL);

const app = express();
const sessionStore = new MySqlStore(mySqlStoreOptions);
const sess: SessionOptions = {
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: EXPRESS_SESSION_COOKIE_NAME,
    cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    },
};

app.set('trust proxy', 1);
app.use(session(sess)); // Need to set up session middleware

setupTwitchOAuthPath({
    app: app, // The express app
    callback: async (req, res, info) => {
        const user = await createOrGetUser(info);
        req.session.userId = user.id;
        res.redirect(307, process.env.APPLICATION_URL);
        res.end();
    }, // Callback when oauth info is gotten. Session info should be used
    client_id: process.env.TWITCH_CLIENT_ID, // Twitch client ID
    client_secret: process.env.TWITCH_CLIENT_SECRET, // Twitch client secret
    force_verify: false, // If true, twitch will always ask the user to verify. If this is false, if the app is already authorized, twitch will redirect immediately back to the redirect uri
    redirect_uri: process.env.REDIRECT_URI, // URI to redirect to (this is the URI on this server, so the path defines the endpoint!)
    scopes: ['channel:read:subscriptions', 'user:read:email', 'moderation:read'], // List of scopes your app is requesting access to
    token_url: process.env.NODE_ENV == 'development' ? process.env.MOCK_TOKEN_URL : undefined,
    authorize_url: process.env.NODE_ENV == 'development' ? process.env.MOCK_AUTH_URL : undefined,
    errorHandler(e) {
        const methodLogger = logger.child({file: __filename, method: '(OAuthErrorHandler)'});
        methodLogger.error(e);
        return e.message;
    },
});

const resubScheduler = new BasicWebhookRenewalScheduler();

const webhookManager: TwitchWebhookManager = new TwitchWebhookManager({
    hostname: process.env.HOST_NAME,
    app: app,
    client_id: process.env.TWITCH_CLIENT_ID,
    base_path: 'webhooks',
    renewalScheduler: resubScheduler,
    persistenceManager: new SequelizeTwitchWebhookPersistenceManager(),
    getOAuthToken: getOAuthToken,
    refreshOAuthToken: refreshToken,
    hubUrl: process.env.NODE_ENV == 'development' ? process.env.MOCK_HUB_URL : undefined,
});

//webhookManager.on('message', () => {});
webhookManager.on('error', (e) => {
    const methodLogger = logger.child({file: __filename, method: '(WebhookManagerErrorHandler)'});
    methodLogger.error(e);
});

setupRoutes(app);

let server: http.Server;
let httpsServer: https.Server;
async function startup() {
    const methodLogger = logger.child({file: __filename, method: 'startup'});
    if (process.env.NODE_ENV === 'development') {
        const {addClient, setUpMockAuthServer} = await import('twitch-mock-oauth-server/dist');
        const {setUpMockWebhookServer} = await import('twitch-mock-webhook-hub/dist');

        await setUpMockAuthServer({
            token_url: process.env.MOCK_TOKEN_URL,
            authorize_url: process.env.MOCK_AUTH_URL,
            validate_url: process.env.MOCK_VALIDATE_URL,
            port: 5080,
            logErrors: true,
        });

        try {
            //This'll fail if we try to create the same client again, so for now, we'll ignore that error.
            await addClient(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        } catch (e) {} //eslint-disable-line no-empty

        await setUpMockWebhookServer({
            hub_url: process.env.MOCK_HUB_URL,
            logErrors: true,
            port: 4080,
        });
    }

    server = http.createServer(app);

    await initProcessUpkeep(process.env.PROCESS_ID);

    await initWebsocketServer(server, httpsServer);

    if (httpsServer) {
        httpsServer.listen(Number.parseInt(process.env.HTTPS_PORT), async () => {
            methodLogger.info(`HTTPS listening on port ${process.env.HTTPS_PORT}`);
            await webhookManager.init();
        });
    }

    server.listen(Number.parseInt(process.env.HTTP_PORT), () =>
        methodLogger.info(`HTTP listening on port ${process.env.HTTP_PORT}`)
    );
}

startup().then(() => {
    const methodLogger = logger.child({file: __filename, method: '(afterStartupHandler)'});
    methodLogger.info('Server is started ');
});

process.on('SIGINT', shutdownGracefully);
process.on('SIGTERM', shutdownGracefully);
process.on('unhandledRejection', async (e, p) => {
    const methodLogger = logger.child({file: __filename, method: '(unhandledRejectionHandler)'});
    methodLogger.error('Unhandled promise rejection caught, ', p);
    methodLogger.error('Shutting down process....');
    await shutdownGracefully();
});
process.on('uncaughtException', async (e) => {
    const methodLogger = logger.child({file: __filename, method: '(uncaughtExceptionHandler)'});
    methodLogger.error('Exception was uncaught, ', e);
    methodLogger.error('Shutting down process....');
    await shutdownGracefully();
});

export {server, httpsServer, webhookManager};
