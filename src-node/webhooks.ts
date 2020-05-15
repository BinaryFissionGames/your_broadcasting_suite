import {
    TwitchWebhookManager,
    TwitchWebhookPersistenceManager,
    WebhookPersistenceObject
} from "@binaryfissiongames/twitch-webhooks/dist";
import {WebhookId, WebhookType} from "@binaryfissiongames/twitch-webhooks/dist/webhooks";
import {WebhookPayload} from "@binaryfissiongames/twitch-webhooks/dist/payload_types";
import {getOAuthToken, refreshToken, sendGetTwitchRequest} from "./request";
import * as fs from "fs";
import {TwitchRequestError} from "@binaryfissiongames/twitch-webhooks/dist/errors";
import {User} from "./db/models/user";

function getWebhookMessageCallback(manager: TwitchWebhookManager) {
    return async function onWebhookMessage(type: WebhookType, webhookId: WebhookId, msg: WebhookPayload) {
        console.log("Got message: ");
        console.log(msg);
        let webhook = await manager.config.persistenceManager.getWebhookById(webhookId);
        let url = new URL(webhook.href);

        switch (type) {
            case WebhookType.UserFollows:
            case WebhookType.ChannelBanChange:
            case WebhookType.ExtensionTransactionCreated:
            case WebhookType.ModeratorChange:
            case WebhookType.StreamChanged:
            case WebhookType.Subscription:
            case WebhookType.UserChanged:
            default:
        }
    }
}

// TODO: Fix this up to be applicable to this application
async function addListenerForUser(userName: string, hasOauthToken: boolean, webhookManager: TwitchWebhookManager) {
    let token = await getOAuthToken();
    let body = await sendGetTwitchRequest(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(userName)}`, token, () => refreshToken(token));

    console.log("Adding listener for user " + userName);

    let jsonBody = JSON.parse(body);

    let id: string = jsonBody.data[0].id;

    await User.findOrCreate({where: {twitchId: id}, defaults: {twitchUserName: userName, twitchId: id}});

    try {
        await webhookManager.addUserFollowsSubscription({
            leaseSeconds: Number.parseInt(process.env.WEBHOOK_LEASE_SECONDS),
            secret: process.env.WEBHOOK_SECRET
        }, id);
    } catch (e) {
        console.error("Tried to create a webhook listening to follows to user " + userName + ", but this is not allowed");
        console.log(e);
    }

    try {
        await webhookManager.addStreamChangedSubscription({
            leaseSeconds: Number.parseInt(process.env.WEBHOOK_LEASE_SECONDS),
            secret: process.env.WEBHOOK_SECRET
        }, id);
    } catch (e) {
        console.error("Tried to create a webhook listening to stream changed to user " + userName + ", but this is not allowed");
        console.log(e);
    }

    if (hasOauthToken) {
        try {
            await webhookManager.addModeratorChangedEvent({
                leaseSeconds: Number.parseInt(process.env.WEBHOOK_LEASE_SECONDS),
                secret: process.env.WEBHOOK_SECRET
            }, id);
        } catch (e) {
            console.error("Tried to create a webhook listening to mod changed to user " + userName + ", but this is not allowed");
            console.log(e);
        }
    }

    if (hasOauthToken) {
        try {
            await webhookManager.addChannelBanChangedEvent({
                leaseSeconds: Number.parseInt(process.env.WEBHOOK_LEASE_SECONDS),
                secret: process.env.WEBHOOK_SECRET
            }, id);
        } catch (e) {
            console.error("Tried to create a webhook listening to channel ban event to user " + userName + ", but this is not allowed");
            console.log(e);
        }
    }

    if (hasOauthToken) {
        try {
            await webhookManager.addSubscriptionEvent({
                leaseSeconds: Number.parseInt(process.env.WEBHOOK_LEASE_SECONDS),
                secret: process.env.WEBHOOK_SECRET
            }, id);
        } catch (e) {
            console.error("Tried to create a webhook listening to subs to user " + userName + ", but this is not allowed (probably bad oauth scope)");
            console.error(e);
        }
    }
}

export {
    getWebhookMessageCallback,
    addListenerForUser
}