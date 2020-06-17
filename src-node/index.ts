import {setupTwitchOAuthPath} from "twitch-oauth-authorization-code-express";
import express = require("express");
import * as session from "express-session";
import mysql_session = require("express-mysql-session");

import {SessionOptions} from "express-session";
import {TwitchWebhookManager} from "@binaryfissiongames/twitch-webhooks";
import {BasicWebhookRenewalScheduler} from "@binaryfissiongames/twitch-webhooks/dist/scheduling";
import {setupRoutes} from "./routes";
import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import {SequelizeTwitchWebhookPersistenceManager} from "./webhooks";
import {getOAuthToken, refreshToken} from "./request";
import {parseMySqlConnString} from "./model/util";
import {addClient, closeMockServer as closeAuthMockServer, setUpMockAuthServer} from "twitch-mock-oauth-server/dist";
import {closeMockServer as closeWebhookMockServer, setUpMockWebhookServer} from "twitch-mock-webhook-hub/dist";
import {promisify} from "util";
import {prisma} from "./model/prisma";
import {createOrGetUser} from "./model/administrator/user";

const MySqlStore = mysql_session(session);
let mySqlStoreOptions = parseMySqlConnString(process.env.DATABASE_URL);

const app = express();
let sess: SessionOptions = {
    secret: process.env.SESSION_SECRET,
    store: new MySqlStore(mySqlStoreOptions),
    resave: false,
    saveUninitialized: false
};

app.use(session(sess)); // Need to set up session middleware

setupTwitchOAuthPath({
    app: app, // The express app
    callback: (async (req, res, info) => {
        let user = await createOrGetUser(info);
        req.session.userId = user.id;
        //TODO: If this is the user's first time logging in, set up webhooks

        res.redirect(307, process.env.APPLICATION_URL);
        res.end();
    }), // Callback when oauth info is gotten. Session info should be used
    client_id: process.env.CLIENT_ID, // Twitch client ID
    client_secret: process.env.CLIENT_SECRET, // Twitch client secret
    force_verify: false, // If true, twitch will always ask the user to verify. If this is false, if the app is already authorized, twitch will redirect immediately back to the redirect uri
    redirect_uri: process.env.REDIRECT_URI, // URI to redirect to (this is the URI on this server, so the path defines the endpoint!)
    scopes: ['channel:read:subscriptions', 'user:read:email', 'moderation:read'], // List of scopes your app is requesting access to
    token_url: process.env.NODE_ENV == 'development' ? process.env.MOCK_TOKEN_URL : undefined,
    authorize_url: process.env.NODE_ENV == 'development' ? process.env.MOCK_AUTH_URL : undefined
});

let resubScheduler = new BasicWebhookRenewalScheduler();

let webhookManager: TwitchWebhookManager = new TwitchWebhookManager({
    hostname: process.env.HOST_NAME,
    app: app,
    client_id: process.env.CLIENT_ID,
    base_path: 'webhooks',
    renewalScheduler: resubScheduler,
    persistenceManager: new SequelizeTwitchWebhookPersistenceManager(),
    getOAuthToken: (userId) => getOAuthToken(userId),
    refreshOAuthToken: (token) => refreshToken(token),
    hubUrl: process.env.NODE_ENV == 'development' ? process.env.MOCK_HUB_URL : undefined
});

webhookManager.on('message', () => {});
webhookManager.on('error', (e) => {
    console.log(e)
});

setupRoutes(app);

let server: http.Server;
let httpsServer: https.Server;
async function startup(){
    let certKey, cert, chain;

    if (fs.existsSync(process.env.CERT_PATH)) {
        cert = fs.readFileSync(process.env.CERT_PATH);
    } else {
        console.log(`File ${process.env.CERT_PATH} does not exist.`)
    }

    if (fs.existsSync(process.env.CERT_CHAIN_PATH)) {
        chain = fs.readFileSync(process.env.CERT_CHAIN_PATH);
    } else {
        console.log(`File ${process.env.CERT_CHAIN_PATH} does not exist.`)
    }

    if (fs.existsSync(process.env.CERT_KEY_PATH)) {
        certKey = fs.readFileSync(process.env.CERT_KEY_PATH);
    } else {
        console.log(`File ${process.env.CERT_KEY_PATH} does not exist.`)
    }


    if (certKey && cert && chain) {
        httpsServer = https.createServer({
            key: certKey,
            cert: cert,
            ca: chain
        }, app).listen(Number.parseInt(process.env.HTTPS_PORT), async () => {
            console.log(`HTTPS listening on port ${process.env.HTTPS_PORT}`);
            await webhookManager.init();
        });
    }

    if(process.env.NODE_ENV === 'development') {
        await setUpMockAuthServer({
            token_url: process.env.MOCK_TOKEN_URL,
            authorize_url: process.env.MOCK_AUTH_URL,
            validate_url: process.env.MOCK_VALIDATE_URL,
            port: 5080,
            logErrors: true
        });

        try {
            //This'll fail if we try to create the same client again, so for now, we'll ignore that error.
            await addClient(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
        }catch (e) {}

        await setUpMockWebhookServer({
            hub_url: process.env.MOCK_HUB_URL,
            logErrors: true,
            port: 4080
        })
    }

    server = http.createServer(app).listen(Number.parseInt(process.env.HTTP_PORT), () => console.log(`HTTP listening on port ${process.env.HTTP_PORT}`));
}

startup().then(() => console.log("Server is started"));

process.on('SIGINT', async () => {
    let exitCode = 0;
    let closeServer = promisify(server.close.bind(server));

    if (httpsServer) {
        let closeHttpsServer = promisify(httpsServer.close.bind(httpsServer));

        try{
            await closeHttpsServer();
        }catch (e) {
            console.log("Error while shutting down https server");
            console.log(e);
            exitCode = 1;
        }
    }

    try {
        await closeServer();
    }catch (e) {
        console.log("Error while shutting down http server");
        console.log(e);
        exitCode = 1;
    }

    try {
        await prisma.disconnect();
    } catch (e) {
        console.log("Error while shutting down database connection");
        console.log(e);
        exitCode = 1;
    }

    try {
        await webhookManager.destroy();
    } catch (e) {
        console.log("Error while destroying webhook manager");
        console.log(e);
        exitCode = 1;
    }

    if(process.env.NODE_ENV === 'development'){
        await closeAuthMockServer(true);
        await closeWebhookMockServer(true);
    }

    process.exit(exitCode);
});