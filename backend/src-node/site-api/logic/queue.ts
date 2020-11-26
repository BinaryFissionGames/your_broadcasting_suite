import {
    AddBitsQueueItemRequest,
    AddDonationQueueItemRequest,
    AddFollowQueueItemRequest,
    AddRaidQueueItemRequest,
    AddSubscriptionQueueItemRequest,
    AddYoutubeQueueItemRequest,
    Queue,
    QueueItem,
    QueueItemTypes,
} from 'twitch_broadcasting_suite_shared';
import {prisma} from '../../model/prisma';
import {formatCentsAsUSD} from './util';
import {QueueItemCreateArgs} from '@prisma/client';
import {getFirstUncompletedQueueItem} from '../../websocket-api/alerts/logic/logic';
import redisClient from '../../model/redis';
import {promisify} from 'util';
import {getAlertQueueSubKey, getCurrentAlertIdKey} from '../../websocket-api/alerts/logic/redis_keys';
import {getCurrentAlertId, getPushAlertMessageToPublish} from '../../websocket-api/alerts/logic/redis_logic';
import {logger} from '../../logging';

export async function getAllQueuesForUser(userId: number): Promise<Queue[]> {
    const queues = await prisma.queue.findMany({
        where: {
            userId,
        },
    });

    return queues.map((queue) => {
        return {
            queueId: queue.id,
            queueName: queue.queueName,
        };
    });
}

export async function getAllQueueItemsForUser(userId: number, queueId: number): Promise<QueueItem[]> {
    const items = await prisma.queueItem.findMany({
        where: {
            queue: {
                id: queueId,
                user: {
                    id: userId,
                },
            },
        },
    });

    return items.map((item) => {
        return {
            id: item.id,
            type: item.type,
            description: item.description,
            icon: item.iconUrl,
            estimated_duration: item.estimatedDurationMs,
        };
    });
}

export async function queueBelongsToUser(userId: number, queueId: number): Promise<boolean> {
    const items = await prisma.queue.findMany({
        where: {
            id: queueId,
            userId: userId,
        },
    });

    return items.length > 0;
}

export async function createFollowsNotification(data: AddFollowQueueItemRequest): Promise<void> {
    const queueItemCreationObject = await getQueueItemCreationObject(
        QueueItemTypes.FOLLOWS_NOTIFICATION,
        data.queueId,
        `User ${data.followUser} is now following!`
    );

    await createQueueItem({
        data: Object.assign(
            {
                followsNotification: {
                    create: {
                        user: data.followUser,
                    },
                },
            },
            queueItemCreationObject
        ),
    });
}

export async function createSubscriberNotification(data: AddSubscriptionQueueItemRequest): Promise<void> {
    const queueItemCreationObject = await getQueueItemCreationObject(
        QueueItemTypes.SUBSCRIBER_NOTIFICATION,
        data.queueId,
        `User ${data.subscribingUser} subscribed for ${data.streak} month(s)!\n\n ${data.subscriberMessage || ''}`
    );

    await createQueueItem({
        data: Object.assign(
            {
                subNotification: {
                    create: {
                        user: data.subscribingUser,
                        streak: data.streak,
                        message: data.subscriberMessage,
                    },
                },
            },
            queueItemCreationObject
        ),
    });
}

export async function createRaidNotification(data: AddRaidQueueItemRequest): Promise<void> {
    const queueItemCreationObject = await getQueueItemCreationObject(
        QueueItemTypes.RAID_NOTIFICATION,
        data.queueId,
        `User ${data.raidUser} raided with ${data.viewerAmount} viewers!`
    );

    await createQueueItem({
        data: Object.assign(
            {
                raidNotification: {
                    create: {
                        channel: data.raidUser,
                        viewers: data.viewerAmount,
                    },
                },
            },
            queueItemCreationObject
        ),
    });
}

export async function createYoutubeVideoNotification(data: AddYoutubeQueueItemRequest): Promise<void> {
    //TODO: Get extra data about this youtube video.
    //Such as title, views, whether it's licensed and all that.
    const queueItemCreationObject = await getQueueItemCreationObject(
        QueueItemTypes.YOUTUBE_VIDEO,
        data.queueId,
        `User ${data.sharingUser} shared video ${data.videoIdOrUrl}`
    );

    await createQueueItem({
        data: Object.assign(
            {
                youtubeVideoNotification: {
                    create: {
                        videoId: data.videoIdOrUrl,
                        startTimeS: data.startTimeS || 0, // TODO: From URL if not available
                        durationS: data.durationS || 0, // TODO: From data if not available
                        sharingUser: data.sharingUser,
                    },
                },
            },
            queueItemCreationObject
        ),
    });
}

export async function createBitsNotification(data: AddBitsQueueItemRequest): Promise<void> {
    const queueItemCreationObject = await getQueueItemCreationObject(
        QueueItemTypes.BITS_NOTIFICATION,
        data.queueId,
        `User ${data.user} gave ${data.amount} bits!\n\n ${data.message || ''}`
    );

    await createQueueItem({
        data: Object.assign(
            {
                bitsNotification: {
                    create: {
                        user: data.user,
                        amount: data.amount,
                        message: data.message,
                    },
                },
            },
            queueItemCreationObject
        ),
    });
}

export async function createDonationNotification(data: AddDonationQueueItemRequest): Promise<void> {
    let desc;
    if (data.anonymous) {
        desc = `An anonymous user donated ${formatCentsAsUSD(data.amountUSCent)}!\n\n${data.message}`;
    } else {
        desc = `User ${data.donatingUser} donated ${formatCentsAsUSD(data.amountUSCent)}!\n\n${data.message}`;
    }

    const queueItemCreationObject = await getQueueItemCreationObject(
        QueueItemTypes.FOLLOWS_NOTIFICATION,
        data.queueId,
        desc
    );

    await createQueueItem({
        data: Object.assign(
            {
                donationNotification: {
                    create: {
                        anonymous: data.anonymous,
                        user: data.donatingUser,
                        amountUSCent: data.amountUSCent,
                        message: data.message,
                    },
                },
            },
            queueItemCreationObject
        ),
    });
}

async function getQueueItemCreationObject(type: QueueItemTypes, queueId: number, description: string) {
    return {
        type: type,
        description: description,
        done: false,
        queue: {
            connect: {
                id: queueId,
            },
        },
    };
}

//Creates the queue item, notifies websocket clients that the new queue item has been added, if necessary
async function createQueueItem(createArgs: QueueItemCreateArgs): Promise<void> {
    const item = await prisma.queueItem.create(createArgs);
    const methodLogger = logger.child({file: __filename, method: 'createQueueItem'});
    const client = redisClient.duplicate();

    methodLogger.debug('Watching current alert key...');
    return new Promise((resolve, reject) => {
        client.watch(getCurrentAlertIdKey(item.queueId), async (err, _res) => {
            try {
                if (err) {
                    throw err;
                }

                methodLogger.debug('Getting current alert key...');
                const currentAlert = await getCurrentAlertId(item.queueId);
                //Current alert exists, which means that we do not need to notify about the one we just added
                if (currentAlert) {
                    methodLogger.debug('Already a current alert, unwatching');
                    await promisify(client.unwatch.bind(client))();
                    return resolve();
                }

                methodLogger.debug('Getting first incomplete queue item');
                const nextItem = await getFirstUncompletedQueueItem(item.queueId);
                //Item is not the "next" item, so we shouldn't bother sending an alert.
                if (item.id !== nextItem.id) {
                    methodLogger.debug('Queue item is not the "next" queue item');
                    await promisify(client.unwatch.bind(client))();
                    return resolve();
                }

                const multicommand = client
                    .MULTI()
                    .SET(getCurrentAlertIdKey(item.queueId), item.id.toFixed(0))
                    .PUBLISH(
                        getAlertQueueSubKey(item.queueId),
                        JSON.stringify(await getPushAlertMessageToPublish(item))
                    );

                const exec = promisify(multicommand.exec.bind(multicommand));
                methodLogger.debug('EXECing multi command');
                await exec();
                //Note here: We don't check the result of exec; It may fail, meaning that the set and publish won't run.
                //This is fine, that means that the current alert has been updated elsewhere.
                // If it did execute, we correctly published & set the event, so there's nothing more to do.
                resolve();
            } catch (e) {
                reject(e);
            } finally {
                client.quit();
            }
        });
    });
}
