import {
    TwitchWebhookPersistenceManager, WebhookPersistenceObject
} from "@binaryfissiongames/twitch-webhooks/dist";
import {WebhookType} from "@binaryfissiongames/twitch-webhooks";
import {PrismaClient, Webhook} from '@prisma/client'

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
        if (webhook === null) {
            return null;
        }
        return this.modelToObject(webhook);
    }

    async persistWebhook(webhook: WebhookPersistenceObject): Promise<void> {
        let url = new URL(webhook.href);
        let twitchUserId: string;
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

export {
    SequelizeTwitchWebhookPersistenceManager
}