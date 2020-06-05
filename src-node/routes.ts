import {Application} from "express";
import {TwitchWebhookManager} from "@binaryfissiongames/twitch-webhooks/dist/webhooks";
import express = require("express");
import { PrismaClient } from '@prisma/client'

function setupRoutes(app: Application, webhookManager: TwitchWebhookManager, prisma: PrismaClient) {
    //Endpoint for ACME challenge
    app.use('/.well-known', express.static('www/.well-known', {
        index: false,
        dotfiles: "allow"
    }));
}

export {
    setupRoutes
}