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
} from 'twitch_broadcasting_suite_shared/dist';
import {prisma} from '../../model/prisma';
import {formatCentsAsUSD} from './util';

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

    await prisma.queueItem.create({
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

    await prisma.queueItem.create({
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

    await prisma.queueItem.create({
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

    await prisma.queueItem.create({
        data: Object.assign(
            {
                youtubeVideoNotification: {
                    create: {
                        videoId: data.videoIdOrUrl,
                        startTimeS: data.startTimeS,
                        durationS: data.durationS,
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

    await prisma.queueItem.create({
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

    await prisma.queueItem.create({
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
