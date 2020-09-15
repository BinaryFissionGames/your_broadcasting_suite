import {TwitchWebhookPersistenceManager, WebhookPersistenceObject} from '@binaryfissiongames/twitch-webhooks/dist';
import {WebhookType} from '@binaryfissiongames/twitch-webhooks';
import {Webhook} from '@prisma/client';
import {prisma} from './model/prisma';

class SequelizeTwitchWebhookPersistenceManager implements TwitchWebhookPersistenceManager {
    async deleteWebhook(webhookId: string): Promise<void> {
        await prisma.webhook.delete({
            where: {
                id: webhookId,
            },
        });
    }

    async destroy(): Promise<void> {} //eslint-disable-line @typescript-eslint/no-empty-function

    async getAllWebhooks(): Promise<WebhookPersistenceObject[]> {
        const webhooks = await prisma.webhook.findMany();
        return webhooks.map(this.modelToObject);
    }

    async getWebhookById(webhookId: string): Promise<WebhookPersistenceObject> {
        const webhook = await prisma.webhook.findOne({where: {id: webhookId}});
        if (webhook === null) {
            return null;
        }
        return this.modelToObject(webhook);
    }

    async persistWebhook(webhook: WebhookPersistenceObject): Promise<void> {
        const url = new URL(webhook.href);
        let twitchUserId: string;
        switch (webhook.type) {
            case WebhookType.UserFollows:
                {
                    const to_id = url.searchParams.get('to_id');
                    if (to_id) {
                        twitchUserId = to_id;
                    } else {
                        twitchUserId = url.searchParams.get('from_id');
                    }
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

        const user = await prisma.user.findOne({
            where: {
                twitchId: twitchUserId,
            },
        });

        const webhookDataObject = Object.assign({owner: {connect: user}}, webhook);

        await prisma.webhook.create({
            data: webhookDataObject,
        });
    }

    async saveWebhook(webhook: WebhookPersistenceObject): Promise<void> {
        await prisma.webhook.update({
            where: {id: webhook.id},
            data: webhook,
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
            leaseSeconds: webhook.leaseSeconds,
        };
    }
}

export {SequelizeTwitchWebhookPersistenceManager};
