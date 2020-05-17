import {Application} from "express";
import {TwitchWebhookManager} from "@binaryfissiongames/twitch-webhooks/dist/webhooks";
import express = require("express");
import {refreshToken, sendGetTwitchRequest} from "./request";
import {addListenerForUser} from "./webhooks";
import { PrismaClient } from '@prisma/client'

function setupRoutes(app: Application, webhookManager: TwitchWebhookManager, prisma: PrismaClient) {
    app.get('/success', (req, res) => {
        res.end("Auth token: " + req.session.access_token + ", Refresh token: " + req.session.refresh_token);

        sendGetTwitchRequest("https://id.twitch.tv/oauth2/validate", req.session.access_token,
            () => refreshToken(req.session.access_token, prisma))
            .then(async (body) => {
                let jsonBody = JSON.parse(body);
                let user = await prisma.user.upsert({
                    create: {
                        twitchUserName: jsonBody.user_id,
                        twitchId: jsonBody.login
                    },
                    where: {
                        twitchId: jsonBody.login
                    },
                    update: {
                        token: {
                            upsert: {
                                create: {
                                    oAuthToken: req.session.access_token,
                                    refreshToken: req.session.refresh_token,
                                    tokenExpiry: new Date(),
                                    scopes: ''
                                },
                                update: {
                                    oAuthToken: req.session.access_token,
                                    refreshToken: req.session.refresh_token,
                                    tokenExpiry: new Date(),
                                    scopes: ''
                                }
                            }
                        }
                    }
                });

                await addListenerForUser(jsonBody.user_id, true, webhookManager, prisma);
            }, (e) => {
                console.error(e);
                console.error(e.toString())
            });
    });

    app.get('/add', async (req, res) => {
        if (req.query.userName) {
            let username = req.query.userName.toString();
            await addListenerForUser(username, false, webhookManager, prisma)
                .catch((e) => {
                    console.error(e);
                    console.error(e.toString())
                });
        } else {
            console.error("Could not add user, no name was given");
        }
        res.end("Done.");
    });

    app.get('/deleteAll', async (req, res) => {
        await webhookManager.unsubFromAll();
        res.end();
    });

    //Endpoint for ACME challenge
    app.use('/.well-known', express.static('www/.well-known', {
        index: false,
        dotfiles: "allow"
    }));
}

export {
    setupRoutes
}