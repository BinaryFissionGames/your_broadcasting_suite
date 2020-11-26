import {QueueItem} from '@prisma/client';
import {prisma} from '../../../model/prisma';
import {promisify} from 'util';
import {connection, IStringified} from 'websocket';
import {getCurrentAlertId, queueIdToConnectionsMap} from './redis_logic';
import {
    AlertMessageType,
    AlertType,
    GenericAlert,
    GenericAlertMessage,
    QueueItemTypes,
    SendAlertMessage,
    TextAlert,
} from 'twitch_broadcasting_suite_shared';
import * as Knex from 'knex';
import {knex} from '../../../model/knex';

export async function isCodeValidForQueue(code: string, queueId: number): Promise<boolean> {
    const queue = await prisma.queue.findOne({
        where: {
            id: queueId,
        },
    });
    return queue && queue.secret === code;
}

export async function getFirstUncompletedQueueItem(
    queueId: number,
    trx?: Knex.Transaction
): Promise<QueueItem | undefined> {
    const queryBuilder = trx || knex;

    const result = await queryBuilder<QueueItem>('QueueItem')
        .where('queueId', queueId)
        .andWhere('completionDate', null)
        .orderBy('id', 'asc')
        .limit(1)
        .select();

    return result[0];
}

export async function getCurrentQueueItem(queueId: number): Promise<QueueItem | null> {
    const itemId = await getCurrentAlertId(queueId);
    if (!itemId) {
        return null;
    }

    return prisma.queueItem.findOne({
        where: {
            id: itemId,
        },
    });
}

export async function markQueueItemAsDone(queueItemId: number, trx?: Knex.Transaction): Promise<void> {
    const queryBuilder = trx || knex;

    await queryBuilder('QueueItem').where('id', queueItemId).update('completionDate', new Date());
}

export async function emitToAllForQueue(queueId: number, message: GenericAlertMessage): Promise<void> {
    const connections = queueIdToConnectionsMap.get(queueId);
    const stringifiedMessage = JSON.stringify(message);
    const promises = [];
    for (const connection of connections) {
        const asyncSend: (s1: IStringified) => Promise<void> = promisify(connection.sendUTF.bind(connection));
        promises.push(asyncSend(stringifiedMessage));
    }

    await Promise.all(promises);
}

export async function sendAlertToClient(queueItem: QueueItem, conn: connection): Promise<void> {
    const alert = await convertToAlertType(queueItem);
    const alertMessage: SendAlertMessage = {
        id: queueItem.id,
        alert,
        type: AlertMessageType.DISPLAY_ALERT,
    };

    const sendUtf: (IStringified) => Promise<void> = promisify(conn.sendUTF.bind(conn));
    return sendUtf(JSON.stringify(alertMessage));
}

export async function convertToAlertType(queueItem: QueueItem): Promise<GenericAlert> {
    switch (<QueueItemTypes>queueItem.type) {
        case QueueItemTypes.FOLLOWS_NOTIFICATION: {
            const notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description,
            };
            return notif;
        }
        case QueueItemTypes.SUBSCRIBER_NOTIFICATION: {
            const notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description,
            };
            return notif;
        }
        case QueueItemTypes.RAID_NOTIFICATION: {
            const notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description,
            };
            return notif;
        }
        case QueueItemTypes.BITS_NOTIFICATION: {
            const notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description,
            };
            return notif;
        }
        case QueueItemTypes.DONATION_NOTIFICATION: {
            const notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description,
            };
            return notif;
        }
        case QueueItemTypes.YOUTUBE_VIDEO: {
            const notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description,
            };
            return notif;
        }
        default: {
            const notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description,
            };
            return notif;
        }
    }
}
