import {DataTypes, Model, Sequelize} from "sequelize";
import {WebhookType} from "@binaryfissiongames/twitch-webhooks/dist/webhooks";
import {User} from "./user";
import {TwitchWebhookPersistenceManager, WebhookPersistenceObject} from "@binaryfissiongames/twitch-webhooks/dist";

class Webhook extends Model {
    public id!: string;
    public userId: number;
    public type: WebhookType;
    public href: string;
    public subscribed: boolean;
    public subscriptionStart: Date;
    public subscriptionEnd: Date;
    public secret: string;
    public leaseSeconds: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

function init(sequelize: Sequelize, dataTypes: typeof DataTypes) : new() => Model {
    Webhook.init({
        id: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
        type: {type: DataTypes.INTEGER},
        href: {type: DataTypes.STRING},
        subscribed: {type: DataTypes.BOOLEAN},
        subscriptionStart: {type: DataTypes.DATE},
        subscriptionEnd: {type: DataTypes.DATE},
        secret: {type: DataTypes.STRING},
        leaseSeconds: {type: DataTypes.INTEGER}
    }, {sequelize, tableName: 'Webhooks', modelName: 'webhook'});

    Webhook.belongsTo(User, {targetKey: 'id'});

    return Webhook;
}

class SequelizeTwitchWebhookPersistenceManager implements TwitchWebhookPersistenceManager {
    protected sequelize: Sequelize;
    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;
    }

    async deleteWebhook(webhookId: string): Promise<void> {
        let webhook = <Webhook>await Webhook.findOne({where: {id: webhookId}});
        if (webhook) {
            webhook.destroy();
        }
    }

    async destroy(): Promise<void> {
    }

    async getAllWebhooks(): Promise<WebhookPersistenceObject[]> {
        let webhooks = await Webhook.findAll();
        return webhooks.map(this.modelToObject);
    }

    async getWebhookById(webhookId: string): Promise<WebhookPersistenceObject> {
        let webhook = await Webhook.findOne({where: {id: webhookId}});
        if(webhook === null){
            return null;
        }
        return this.modelToObject(webhook);
    }

    async persistWebhook(webhook: WebhookPersistenceObject): Promise<void> {
        let url = new URL(webhook.href);
        let twitchUserId: string = null;
        let userId: number = null;
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
        let t = await this.sequelize.transaction();
        try {
            let user = await User.findOne({where: {twitchId: twitchUserId}, transaction: t});
            let obj: object = webhook;
            if (user) {
                obj = Object.assign({userId: user.id}, obj);
            }
            await Webhook.create(obj, {transaction: t});
            t.commit();
        } catch (e) {
            t.rollback();
            throw e;
        }
    }

    async saveWebhook(webhook: WebhookPersistenceObject): Promise<void> {
        await Webhook.update(webhook, {where: {id: webhook.id}});
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
    init,
    Webhook,
    SequelizeTwitchWebhookPersistenceManager
}