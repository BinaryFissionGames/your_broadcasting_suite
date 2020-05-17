import {
    TwitchWebhookManager, TwitchWebhookPersistenceManager, WebhookPersistenceObject
} from "@binaryfissiongames/twitch-webhooks/dist";
import {WebhookId, WebhookType} from "@binaryfissiongames/twitch-webhooks/dist/webhooks";
import {WebhookPayload} from "@binaryfissiongames/twitch-webhooks/dist/payload_types";
import {getOAuthToken, refreshToken, sendGetTwitchRequest} from "./request";
import { PrismaClient, Webhook} from '@prisma/client'

class SequelizeTwitchWebhookPersistenceManager implements TwitchWebhookPersistenceManager {
    protected prisma: PrismaClient;
    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async deleteWebhook(webhookId: string): Promise<void> {
        await this.prisma.webhook.delete({
            where: {
                id: webhookId
            }
        });
    }

    async destroy(): Promise<void> {
    }

    async getAllWebhooks(): Promise<WebhookPersistenceObject[]> {
        let webhooks = await this.prisma.webhook.findMany();
        return webhooks.map(this.modelToObject);
    }

    async getWebhookById(webhookId: string): Promise<WebhookPersistenceObject> {
        let webhook = await this.prisma.webhook.findOne({where: {id: webhookId}});
        if(webhook === null){
            return null;
        }
        return this.modelToObject(webhook);
    }

    async persistWebhook(webhook: WebhookPersistenceObject): Promise<void> {
        let url = new URL(webhook.href);
        let twitchUserId: string = null;
        switch (webhook.type) {
            case WebhookType.UserFollows:
                let to_id = url.searchParams.get('to_id');
                if (to_id) {
                    twitchUserId = to_id;
                } else {
                    twitchUserId = url.searchParams.get('from_id');
                }
                break;
            case WebhookType.StreamChanged:
            case WebhookType.UserChanged:
            case WebhookType.Subscription:
            case WebhookType.ModeratorChange:
            case WebhookType.ChannelBanChange:
                twitchUserId = url.searchParams.get('broadcaster_id');
                break;
            default:
                twitchUserId = null;
                break;
        }

        let user = await this.prisma.user.findOne({
            where: {
                twitchId: twitchUserId
            }
        });

        let webhookDataObject = Object.assign({owner: user}, webhook);

        await this.prisma.webhook.create({
            data: webhookDataObject
        });
    }

    async saveWebhook(webhook: WebhookPersistenceObject): Promise<void> {
        await this.prisma.webhook.update({
            where: {id: webhook.id},
            data: webhook
        });
    }

    modelToObject(webhook: Webhook): WebhookPersistenceObject {
        return {
            id: webhook.id,
            type: webhook.type,
            href: webhook.href,
            subscribed: webhook.subscribed,
            subscriptionStart: webhook.subscriptionStart,
            subscriptionEnd: webhook.subscriptionEnd,
            secret: webhook.secret,
            leaseSeconds: webhook.leaseSeconds
        }
    }
}

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
async function addListenerForUser(userName: string, hasOauthToken: boolean, webhookManager: TwitchWebhookManager, prisma: PrismaClient) {
    let token = await getOAuthToken(prisma);
    let body = await sendGetTwitchRequest(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(userName)}`, token, () => refreshToken(token, prisma));

    console.log("Adding listener for user " + userName);

    let jsonBody = JSON.parse(body);

    let id: string = jsonBody.data[0].id;

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
    addListenerForUser,
    SequelizeTwitchWebhookPersistenceManager
}